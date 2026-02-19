import { View, ScrollView, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { TouchableOpacity } from "react-native";
import { useUserStore, KetoGoal, GoalPace } from "../../store/userStore";
import { useMealsStore } from "../../store/mealsStore";
import { calculateKetoGoals } from "../../lib/ketoCalculator";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { User, Scale, Activity, LogOut, Save, Settings, Target } from "lucide-react-native";

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
    red: "#ef4444",
} as const;

const GOAL_OPTIONS: { value: KetoGoal; label: string; emoji: string }[] = [
    { value: "lose_weight", label: "לרדת במשקל", emoji: "⬇️" },
    { value: "gain_weight", label: "לעלות במשקל", emoji: "⬆️" },
    { value: "maintain", label: "שמירה", emoji: "⚖️" },
    { value: "feel_better", label: "הרגשה טובה", emoji: "✨" },
    { value: "autoimmune", label: "אוטואימונית", emoji: "🛡️" },
    { value: "mental_clarity", label: "בהירות", emoji: "🧠" },
];

const PACE_OPTIONS: { value: GoalPace; label: string }[] = [
    { value: "slow", label: "איטי" },
    { value: "moderate", label: "בינוני" },
    { value: "aggressive", label: "מהיר" },
];

const CARB_PRESETS = [20, 30, 50];

function ChipSelect<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        activeOpacity={0.7}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: active ? `${C.maroon}20` : C.card2,
                            borderWidth: 1.5,
                            borderColor: active ? C.maroon : C.border,
                        }}
                    >
                        <Text style={{
                            color: active ? C.text : C.textDim,
                            fontSize: 13,
                            fontFamily: active ? 'Assistant_700Bold' : 'Assistant_400Regular',
                        }}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function DarkInput({
    value,
    onChangeText,
    placeholder,
    keyboardType,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={C.textDimmer}
            keyboardType={keyboardType ?? 'default'}
            style={{
                height: 52,
                backgroundColor: C.card2,
                borderRadius: 16,
                paddingHorizontal: 16,
                color: C.text,
                fontSize: 15,
                fontFamily: 'Assistant_400Regular',
                textAlign: 'right',
                borderWidth: 1,
                borderColor: C.border,
            }}
        />
    );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                {icon}
                <Text style={{ color: C.text, fontSize: 17, fontFamily: 'Assistant_700Bold' }}>
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 8, letterSpacing: 0.5 }}>
                {label}
            </Text>
            {children}
        </View>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const syncFromSupabase = useUserStore((state) => state.syncFromSupabase);
    const reset = useUserStore((state) => state.reset);

    const setDailyGoals = useMealsStore((state) => state.setDailyGoals);

    const [form, setForm] = useState(profile);
    const [selectedGoal, setSelectedGoal] = useState<KetoGoal>(profile.goal);
    const [selectedPace, setSelectedPace] = useState<GoalPace>(profile.goalPace);
    const [selectedCarbLimit, setSelectedCarbLimit] = useState(profile.dailyCarbLimit);

    useEffect(() => { syncFromSupabase(); }, []);
    useEffect(() => {
        setForm(profile);
        setSelectedGoal(profile.goal);
        setSelectedPace(profile.goalPace);
        setSelectedCarbLimit(profile.dailyCarbLimit);
    }, [profile]);

    const computedGoals = useMemo(() => {
        const w = parseFloat(form.weight) || 75;
        const h = parseFloat(form.height) || 175;
        const a = parseInt(form.age) || 30;
        return calculateKetoGoals({
            weight: w,
            height: h,
            age: a,
            gender: form.gender,
            activityLevel: form.activityLevel,
            goal: selectedGoal,
            goalPace: selectedPace,
            carbLimit: selectedCarbLimit,
        });
    }, [form.weight, form.height, form.age, form.gender, form.activityLevel, selectedGoal, selectedPace, selectedCarbLimit]);

    const handleSave = () => {
        setProfile(form);
        Alert.alert("נשמר!", "הפרופיל עודכן בהצלחה");
    };

    const handleSaveGoals = () => {
        setDailyGoals(computedGoals);
        setProfile({
            goal: selectedGoal,
            goalPace: selectedPace,
            dailyCarbLimit: selectedCarbLimit,
        });
        Alert.alert("נשמר!", "היעדים היומיים עודכנו");
    };

    async function signOut() {
        Alert.alert("התנתק", "האם אתה בטוח שברצונך להתנתק?", [
            { text: "ביטול", style: "cancel" },
            {
                text: "התנתק",
                style: "destructive",
                onPress: async () => {
                    await supabase.auth.signOut();
                    reset();
                },
            },
        ]);
    }

    const initials = profile.name
        ? profile.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('')
        : '?';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 28 }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 24,
                            backgroundColor: `${C.maroon}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: `${C.maroon}35`,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.25,
                            shadowRadius: 20,
                        }}
                    >
                        <Text style={{ color: C.maroon, fontSize: 28, fontFamily: 'Assistant_700Bold' }}>
                            {initials}
                        </Text>
                    </View>
                    <Text style={{ color: C.text, fontSize: 22, fontFamily: 'Assistant_700Bold', marginBottom: 4 }}>
                        {profile.name || 'המשתמש שלי'}
                    </Text>
                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular' }}>
                        פרופיל קיטו
                    </Text>
                </View>

                {/* Personal details */}
                <SectionCard
                    title="פרטים אישיים"
                    icon={<User size={18} color={C.maroon} />}
                >
                    <FieldRow label="שם מלא">
                        <DarkInput
                            value={form.name}
                            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
                            placeholder="ישראל ישראלי"
                        />
                    </FieldRow>

                    <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="גיל">
                                <DarkInput
                                    value={form.age}
                                    onChangeText={(t) => setForm((p) => ({ ...p, age: t }))}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="מין">
                                <TouchableOpacity
                                    onPress={() => setForm((p) => ({ ...p, gender: p.gender === 'male' ? 'female' : 'male' }))}
                                    activeOpacity={0.7}
                                    style={{
                                        height: 52,
                                        backgroundColor: C.card2,
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Text style={{ color: C.text, fontSize: 15, fontFamily: 'Assistant_400Regular' }}>
                                        {form.gender === 'male' ? 'זכר' : 'נקבה'}
                                    </Text>
                                </TouchableOpacity>
                            </FieldRow>
                        </View>
                    </View>
                </SectionCard>

                {/* Body metrics */}
                <SectionCard
                    title="מדדי גוף"
                    icon={<Scale size={18} color={C.maroon} />}
                >
                    <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="משקל (ק״ג)">
                                <DarkInput
                                    value={form.weight}
                                    onChangeText={(t) => setForm((p) => ({ ...p, weight: t }))}
                                    placeholder="75"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="גובה (ס״מ)">
                                <DarkInput
                                    value={form.height}
                                    onChangeText={(t) => setForm((p) => ({ ...p, height: t }))}
                                    placeholder="175"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: C.maroon,
                            borderRadius: 16,
                            paddingVertical: 16,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 12,
                            elevation: 6,
                        }}
                    >
                        <Save size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                            שמור ועדכן
                        </Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* Daily Goals */}
                <SectionCard
                    title="יעדים יומיים"
                    icon={<Target size={18} color={C.maroon} />}
                >
                    <FieldRow label="מטרה">
                        <ChipSelect
                            options={GOAL_OPTIONS.map(o => ({ value: o.value, label: `${o.emoji} ${o.label}` }))}
                            value={selectedGoal}
                            onChange={setSelectedGoal}
                        />
                    </FieldRow>

                    {(selectedGoal === 'lose_weight' || selectedGoal === 'gain_weight') && (
                        <FieldRow label="קצב">
                            <ChipSelect
                                options={PACE_OPTIONS}
                                value={selectedPace}
                                onChange={setSelectedPace}
                            />
                        </FieldRow>
                    )}

                    <FieldRow label="מגבלת פחמימות יומית">
                        <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
                            {CARB_PRESETS.map((v) => {
                                const active = selectedCarbLimit === v;
                                return (
                                    <TouchableOpacity
                                        key={v}
                                        onPress={() => setSelectedCarbLimit(v)}
                                        activeOpacity={0.7}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                            backgroundColor: active ? `${C.maroon}20` : C.card2,
                                            borderWidth: 1.5,
                                            borderColor: active ? C.maroon : C.border,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{
                                            color: active ? C.text : C.textDim,
                                            fontSize: 15,
                                            fontFamily: active ? 'Assistant_700Bold' : 'Assistant_400Regular',
                                        }}>
                                            {v}g
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </FieldRow>

                    <View
                        style={{
                            backgroundColor: C.card2,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: C.border,
                            marginBottom: 16,
                            gap: 12,
                        }}
                    >
                        <Text style={{ color: C.textDim, fontSize: 11, fontFamily: 'Assistant_400Regular', textAlign: 'right' }}>
                            מחושב על בסיס הפרופיל שלך
                        </Text>
                        {[
                            { label: "קלוריות", value: `${computedGoals.calories}`, color: "#F97316" },
                            { label: "שומן", value: `${computedGoals.fat}g`, color: C.green },
                            { label: "חלבון", value: `${computedGoals.protein}g`, color: "#3b82f6" },
                            { label: "פחמימות", value: `${computedGoals.carbs}g`, color: "#f59e0b" },
                        ].map((row, i) => (
                            <View
                                key={i}
                                style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                }}
                            >
                                <Text style={{ color: C.textDim, fontSize: 14, fontFamily: 'Assistant_400Regular' }}>
                                    {row.label}
                                </Text>
                                <Text style={{ color: row.color, fontSize: 18, fontFamily: 'Assistant_700Bold' }}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleSaveGoals}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: C.maroon,
                            borderRadius: 16,
                            paddingVertical: 16,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 12,
                            elevation: 6,
                        }}
                    >
                        <Save size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                            שמור יעדים
                        </Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* Apple Health */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert("בקרוב!", "חיבור ל-Apple Health יהיה זמין בגרסה הבאה.")}
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        padding: 24,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: C.border,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: `${C.green}18`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: `${C.green}25`,
                            }}
                        >
                            <Activity size={18} color={C.green} />
                        </View>
                        <View>
                            <Text style={{ color: C.text, fontSize: 15, fontFamily: 'Assistant_700Bold', textAlign: 'right' }}>
                                Apple Health
                            </Text>
                            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', marginTop: 4 }}>
                                סנכרון צעדים ופעילות
                            </Text>
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: `${C.amber}18`,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: `${C.amber}25`,
                    }}>
                        <Text style={{ color: C.amber, fontSize: 11, fontFamily: 'Assistant_700Bold' }}>
                            בקרוב
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity
                    onPress={() => router.push("/settings")}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        paddingVertical: 16,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 12,
                    }}
                >
                    <Settings size={18} color={C.text} />
                    <Text style={{ color: C.text, fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                        הגדרות
                    </Text>
                </TouchableOpacity>

                {/* Sign out */}
                <TouchableOpacity
                    onPress={signOut}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        paddingVertical: 16,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: `${C.red}25`,
                    }}
                >
                    <LogOut size={18} color={C.red} />
                    <Text style={{ color: C.red, fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                        התנתק
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
