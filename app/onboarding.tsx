import { useState, useRef, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { useRouter } from "expo-router";
import { useUserStore, KetoGoal, GoalPace } from "../store/userStore";
import { useMealsStore } from "../store/mealsStore";
import { calculateKetoGoals } from "../lib/ketoCalculator";
import {
    User,
    Scale,
    Activity,
    Flame,
    ChevronLeft,
    ChevronRight,
    Target,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_STEPS = 5;

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    card2: "#18181B",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    textDimmer: "#3A3A3C",
    green: "#10b981",
    amber: "#f59e0b",
} as const;

type Gender = "male" | "female" | "other";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: "sedentary", label: "יושבני", desc: "עבודה משרדית, מעט תנועה" },
    { value: "light", label: "קל", desc: "הליכות קצרות, פעילות קלה" },
    { value: "moderate", label: "בינוני", desc: "אימונים 3-4 פעמים בשבוע" },
    { value: "active", label: "פעיל", desc: "אימונים יומיים, עבודה פיזית" },
];

const CARB_OPTIONS = [
    { value: 20, label: "20g", desc: "קיטו מחמיר" },
    { value: 30, label: "30g", desc: "קיטו סטנדרטי" },
    { value: 50, label: "50g", desc: "קיטו מתון" },
];

const GOAL_OPTIONS: { value: KetoGoal; label: string; emoji: string; desc: string }[] = [
    { value: "lose_weight", label: "לרדת במשקל", emoji: "⬇️", desc: "הפחתת שומן גוף" },
    { value: "gain_weight", label: "לעלות במשקל", emoji: "⬆️", desc: "בניית מסת שריר" },
    { value: "maintain", label: "לשמור על המשקל", emoji: "⚖️", desc: "שמירה על הרכב גוף" },
    { value: "feel_better", label: "להרגיש יותר טוב", emoji: "✨", desc: "אנרגיה ובריאות כללית" },
    { value: "autoimmune", label: "מחלות אוטואימוניות", emoji: "🛡️", desc: "הפחתת דלקת בגוף" },
    { value: "mental_clarity", label: "בהירות מנטלית", emoji: "🧠", desc: "ריכוז וחדות מחשבה" },
];

const PACE_OPTIONS: { value: GoalPace; label: string; desc: string }[] = [
    { value: "slow", label: "איטי", desc: "~0.25 ק\"ג בשבוע" },
    { value: "moderate", label: "בינוני", desc: "~0.5 ק\"ג בשבוע" },
    { value: "aggressive", label: "מהיר", desc: "~1 ק\"ג בשבוע" },
];

function ProgressBar({ step }: { step: number }) {
    return (
        <View
            style={{
                flexDirection: "row-reverse",
                gap: 8,
                paddingHorizontal: 24,
                marginBottom: 32,
            }}
        >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 4,
                        backgroundColor: i <= step ? C.maroon : C.border,
                    }}
                />
            ))}
        </View>
    );
}

function DarkInput({
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoFocus,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric";
    autoFocus?: boolean;
}) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={C.textDimmer}
            keyboardType={keyboardType ?? "default"}
            autoFocus={autoFocus}
            style={{
                height: 56,
                backgroundColor: C.card2,
                borderRadius: 16,
                paddingHorizontal: 16,
                color: C.text,
                fontSize: 17,
                fontFamily: "Assistant_400Regular",
                textAlign: "right",
                borderWidth: 1,
                borderColor: C.border,
            }}
        />
    );
}

function SelectOption({
    selected,
    label,
    desc,
    onPress,
}: {
    selected: boolean;
    label: string;
    desc?: string;
    onPress: () => void;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Haptics.selectionAsync();
        Animated.sequence([
            Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, damping: 8, stiffness: 200 }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 8, stiffness: 180 }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                style={{
                    backgroundColor: selected ? `${C.maroon}18` : C.card2,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1.5,
                    borderColor: selected ? C.maroon : C.border,
                }}
            >
                <Text
                    style={{
                        color: selected ? C.text : C.textDim,
                        fontSize: 16,
                        fontFamily: "Assistant_700Bold",
                        textAlign: "right",
                    }}
                >
                    {label}
                </Text>
                {desc && (
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 13,
                            fontFamily: "Assistant_400Regular",
                            textAlign: "right",
                            marginTop: 4,
                        }}
                    >
                        {desc}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function OnboardingScreen() {
    const router = useRouter();
    const setProfile = useUserStore((s) => s.setProfile);
    const completeOnboarding = useUserStore((s) => s.completeOnboarding);
    const setDailyGoals = useMealsStore((s) => s.setDailyGoals);

    const [step, setStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [goal, setGoal] = useState<KetoGoal>("lose_weight");
    const [goalPace, setGoalPace] = useState<GoalPace>("moderate");
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
    const [carbLimit, setCarbLimit] = useState(30);

    const animateTransition = (next: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setStep(next);
            slideAnim.setValue(30);
            fadeAnim.setValue(0);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 100 }),
                Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            iconScale.setValue(1.1);
            animateTransition(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            iconScale.setValue(1.1);
            animateTransition(step - 1);
        }
    };

    const handleFinish = async () => {
        const w = parseFloat(weight) || 75;
        const h = parseFloat(height) || 175;
        const a = parseInt(age) || 30;

        const goals = calculateKetoGoals({
            weight: w,
            height: h,
            age: a,
            gender,
            activityLevel,
            goal,
            goalPace,
            carbLimit,
        });

        await setProfile({
            name,
            age,
            weight,
            height,
            gender,
            activityLevel,
            dailyCarbLimit: carbLimit,
            goal,
            goalPace,
        });

        setDailyGoals(goals);

        completeOnboarding();
        router.replace("/(tabs)");
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return name.trim().length > 0;
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <View style={{ gap: 20 }}>
                        <Animated.View
                            style={{
                                alignSelf: "center",
                                marginBottom: 8,
                                transform: [{ scale: iconScale }],
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: `${C.maroon}18`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: `${C.maroon}30`,
                                }}
                            >
                                <User size={36} color={C.maroon} />
                            </View>
                        </Animated.View>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "center",
                                lineHeight: 38,
                            }}
                        >
                            {"ברוכים הבאים ל-MyKeto!"}
                        </Text>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 15,
                                fontFamily: "Assistant_400Regular",
                                textAlign: "center",
                                lineHeight: 24,
                            }}
                        >
                            {"בואו נתחיל בלהכיר.\nאיך קוראים לך?"}
                        </Text>
                        <DarkInput
                            value={name}
                            onChangeText={setName}
                            placeholder="השם שלך"
                            autoFocus
                        />
                    </View>
                );

            case 1:
                return (
                    <View style={{ gap: 20 }}>
                        <Animated.View
                            style={{
                                alignSelf: "center",
                                marginBottom: 8,
                                transform: [{ scale: iconScale }],
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: `${C.maroon}18`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: `${C.maroon}30`,
                                }}
                            >
                                <Scale size={36} color={C.maroon} />
                            </View>
                        </Animated.View>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "center",
                                lineHeight: 38,
                            }}
                        >
                            מדדי הגוף שלך
                        </Text>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 15,
                                fontFamily: "Assistant_400Regular",
                                textAlign: "center",
                                lineHeight: 24,
                            }}
                        >
                            {"נשתמש בנתונים כדי לחשב\nיעדים יומיים מותאמים אישית"}
                        </Text>

                        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                            <SelectOption
                                selected={gender === "male"}
                                label="זכר"
                                onPress={() => setGender("male")}
                            />
                            <SelectOption
                                selected={gender === "female"}
                                label="נקבה"
                                onPress={() => setGender("female")}
                            />
                        </View>

                        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: C.textDim,
                                        fontSize: 12,
                                        fontFamily: "Assistant_400Regular",
                                        textAlign: "right",
                                        marginBottom: 8,
                                    }}
                                >
                                    גיל
                                </Text>
                                <DarkInput
                                    value={age}
                                    onChangeText={setAge}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: C.textDim,
                                        fontSize: 12,
                                        fontFamily: "Assistant_400Regular",
                                        textAlign: "right",
                                        marginBottom: 8,
                                    }}
                                >
                                    {"משקל (ק\"ג)"}
                                </Text>
                                <DarkInput
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="75"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View>
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 12,
                                    fontFamily: "Assistant_400Regular",
                                    textAlign: "right",
                                    marginBottom: 8,
                                }}
                            >
                                {"גובה (ס\"מ)"}
                            </Text>
                            <DarkInput
                                value={height}
                                onChangeText={setHeight}
                                placeholder="175"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                );

            case 2:
                const showPace = goal === "lose_weight" || goal === "gain_weight";
                return (
                    <View style={{ gap: 20 }}>
                        <Animated.View
                            style={{
                                alignSelf: "center",
                                marginBottom: 8,
                                transform: [{ scale: iconScale }],
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: `${C.maroon}18`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: `${C.maroon}30`,
                                }}
                            >
                                <Target size={36} color={C.maroon} />
                            </View>
                        </Animated.View>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "center",
                                lineHeight: 38,
                            }}
                        >
                            מה המטרה שלך?
                        </Text>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 15,
                                fontFamily: "Assistant_400Regular",
                                textAlign: "center",
                                lineHeight: 24,
                            }}
                        >
                            {"נתאים את היעדים בדיוק\nלפי מה שחשוב לך"}
                        </Text>

                        <View style={{ gap: 12 }}>
                            {GOAL_OPTIONS.map((opt) => (
                                <SelectOption
                                    key={opt.value}
                                    selected={goal === opt.value}
                                    label={`${opt.emoji}  ${opt.label}`}
                                    desc={opt.desc}
                                    onPress={() => setGoal(opt.value)}
                                />
                            ))}
                        </View>

                        {showPace && (
                            <View style={{ marginTop: 8 }}>
                                <Text
                                    style={{
                                        color: C.text,
                                        fontSize: 16,
                                        fontFamily: "Assistant_700Bold",
                                        textAlign: "right",
                                        marginBottom: 12,
                                    }}
                                >
                                    באיזה קצב?
                                </Text>
                                <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                                    {PACE_OPTIONS.map((opt) => (
                                        <View key={opt.value} style={{ flex: 1 }}>
                                            <SelectOption
                                                selected={goalPace === opt.value}
                                                label={opt.label}
                                                desc={opt.desc}
                                                onPress={() => setGoalPace(opt.value)}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 3:
                return (
                    <View style={{ gap: 20 }}>
                        <Animated.View
                            style={{
                                alignSelf: "center",
                                marginBottom: 8,
                                transform: [{ scale: iconScale }],
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: `${C.maroon}18`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: `${C.maroon}30`,
                                }}
                            >
                                <Activity size={36} color={C.maroon} />
                            </View>
                        </Animated.View>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "center",
                                lineHeight: 38,
                            }}
                        >
                            רמת הפעילות שלך
                        </Text>

                        <View style={{ gap: 12 }}>
                            {ACTIVITY_OPTIONS.map((opt) => (
                                <SelectOption
                                    key={opt.value}
                                    selected={activityLevel === opt.value}
                                    label={opt.label}
                                    desc={opt.desc}
                                    onPress={() => setActivityLevel(opt.value)}
                                />
                            ))}
                        </View>

                        <View style={{ marginTop: 8 }}>
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_700Bold",
                                    textAlign: "right",
                                    marginBottom: 12,
                                }}
                            >
                                מגבלת פחמימות יומית
                            </Text>
                            <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                                {CARB_OPTIONS.map((opt) => (
                                    <View key={opt.value} style={{ flex: 1 }}>
                                        <SelectOption
                                            selected={carbLimit === opt.value}
                                            label={opt.label}
                                            desc={opt.desc}
                                            onPress={() => setCarbLimit(opt.value)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                );

            case 4:
                const w = parseFloat(weight) || 75;
                const h = parseFloat(height) || 175;
                const a = parseInt(age) || 30;
                const computedGoals = calculateKetoGoals({
                    weight: w, height: h, age: a, gender,
                    activityLevel, goal, goalPace, carbLimit,
                });

                return (
                    <View style={{ gap: 20 }}>
                        <Animated.View
                            style={{
                                alignSelf: "center",
                                marginBottom: 8,
                                transform: [{ scale: iconScale }],
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: `${C.maroon}18`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: `${C.maroon}30`,
                                }}
                            >
                                <Flame size={36} color={C.maroon} />
                            </View>
                        </Animated.View>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "center",
                                lineHeight: 38,
                            }}
                        >
                            {"הכל מוכן, " + (name || "חבר") + "!"}
                        </Text>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 15,
                                fontFamily: "Assistant_400Regular",
                                textAlign: "center",
                                lineHeight: 24,
                            }}
                        >
                            {"חישבנו עבורך יעדים יומיים מותאמים אישית.\nציון הקיטו עוקב אחרי כמה טוב אתה שומר על התזונה."}
                        </Text>

                        <View
                            style={{
                                backgroundColor: C.card,
                                borderRadius: 24,
                                padding: 24,
                                borderWidth: 1,
                                borderColor: C.border,
                                gap: 16,
                            }}
                        >
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_700Bold",
                                    textAlign: "right",
                                }}
                            >
                                היעדים היומיים שלך
                            </Text>
                            {[
                                { label: "קלוריות", value: `${computedGoals.calories}`, color: "#F97316" },
                                { label: "שומן", value: `${computedGoals.fat}g`, color: C.green },
                                { label: "חלבון", value: `${computedGoals.protein}g`, color: "#3b82f6" },
                                { label: "פחמימות (מקסימום)", value: `${carbLimit}g`, color: C.amber },
                            ].map((row, i) => (
                                <View
                                    key={i}
                                    style={{
                                        flexDirection: "row-reverse",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingVertical: 8,
                                        borderTopWidth: i === 0 ? 1 : 0,
                                        borderBottomWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: C.textDim,
                                            fontSize: 15,
                                            fontFamily: "Assistant_400Regular",
                                        }}
                                    >
                                        {row.label}
                                    </Text>
                                    <Text
                                        style={{
                                            color: row.color,
                                            fontSize: 20,
                                            fontFamily: "Assistant_700Bold",
                                        }}
                                    >
                                        {row.value}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View
                            style={{
                                backgroundColor: C.card,
                                borderRadius: 20,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: `${C.green}25`,
                            }}
                        >
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 14,
                                    fontFamily: "Assistant_700Bold",
                                    textAlign: "right",
                                    marginBottom: 8,
                                }}
                            >
                                מה זה ציון קיטו?
                            </Text>
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 13,
                                    fontFamily: "Assistant_400Regular",
                                    textAlign: "right",
                                    lineHeight: 22,
                                }}
                            >
                                ציון מ-1 עד 10 שמודד כמה הארוחות שלך מתאימות לתזונה קטוגנית. שומן גבוה ופחמימות נמוכות = ציון גבוה יותר.
                            </Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ProgressBar step={step} />

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        {renderStep()}
                    </Animated.View>
                </ScrollView>

                <View
                    style={{
                        flexDirection: "row-reverse",
                        justifyContent: "space-between",
                        paddingHorizontal: 24,
                        paddingBottom: 16,
                        gap: 12,
                    }}
                >
                    {step > 0 ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                backgroundColor: C.card,
                                borderRadius: 16,
                                paddingVertical: 16,
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <ChevronRight size={18} color={C.textDim} />
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 15,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                חזרה
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    <TouchableOpacity
                        onPress={step === TOTAL_STEPS - 1 ? handleFinish : handleNext}
                        activeOpacity={0.85}
                        disabled={!canProceed()}
                        style={{
                            flex: 1.5,
                            backgroundColor: canProceed() ? C.maroon : C.card2,
                            borderRadius: 16,
                            paddingVertical: 16,
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            shadowColor: canProceed() ? C.maroon : "transparent",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 12,
                            elevation: canProceed() ? 6 : 0,
                        }}
                    >
                        <Text
                            style={{
                                color: canProceed() ? "#fff" : C.textDimmer,
                                fontSize: 16,
                                fontFamily: "Assistant_700Bold",
                            }}
                        >
                            {step === TOTAL_STEPS - 1 ? "יאללה, מתחילים!" : "המשך"}
                        </Text>
                        {step < TOTAL_STEPS - 1 && (
                            <ChevronLeft
                                size={18}
                                color={canProceed() ? "#fff" : C.textDimmer}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
