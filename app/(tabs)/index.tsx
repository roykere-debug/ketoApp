import { useState, useRef, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { useRouter } from "expo-router";
import { useMealsStore } from "../../store/mealsStore";
import { useUserStore } from "../../store/userStore";
import type { Meal } from "../../store/mealsStore";
import { Trash2, Camera, UtensilsCrossed, Plus, Sparkles, ChevronLeft } from "lucide-react-native";
import AddFoodModal from "../../components/modals/AddFoodModal";
import { getKetoImprovementSuggestions, type KetoSuggestion } from "../../services/ai";
import * as Haptics from "expo-haptics";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
    red: "#ef4444",
    blue: "#3b82f6",
    orange: "#F97316",
} as const;

function scoreColor(s: number) {
    if (s >= 8) return C.green;
    if (s >= 5) return C.amber;
    return C.red;
}

// ─── Animated counting hook ───────────────────────────────────────────────────
function useCountAnimation(target: number, decimals = 0) {
    const [display, setDisplay] = useState(target);
    const anim = useRef(new Animated.Value(target)).current;
    const prev = useRef(target);

    useEffect(() => {
        if (target === prev.current) return;
        anim.setValue(prev.current);
        prev.current = target;

        const id = anim.addListener(({ value }) => {
            const factor = Math.pow(10, decimals);
            setDisplay(Math.round(value * factor) / factor);
        });

        Animated.spring(anim, {
            toValue: target,
            useNativeDriver: false,
            damping: 18,
            stiffness: 160,
            mass: 0.9,
        }).start(() => {
            anim.removeListener(id);
            setDisplay(target);
        });
    }, [target]);

    return display;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const color = scoreColor(score);
    const label = score >= 8 ? "מצוין" : score >= 5 ? "טוב" : "צריך שיפור";
    const displayScore = useCountAnimation(score, 1);
    const scale = useRef(new Animated.Value(1)).current;
    const prevScore = useRef(score);

    useEffect(() => {
        if (score === prevScore.current) return;
        prevScore.current = score;
        Animated.sequence([
            Animated.spring(scale, { toValue: 1.06, useNativeDriver: true, damping: 5, stiffness: 200 }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 8, stiffness: 180 }),
        ]).start();
    }, [score]);

    const scoreDisplay = Number.isInteger(displayScore)
        ? `${displayScore}`
        : displayScore.toFixed(1);

    return (
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <Animated.View
                style={{
                    width: 156,
                    height: 156,
                    borderRadius: 78,
                    borderWidth: 6,
                    borderColor: color,
                    backgroundColor: `${color}12`,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 28,
                    elevation: 14,
                    transform: [{ scale }],
                }}
            >
                <Text
                    style={{
                        fontSize: 62,
                        fontFamily: "Assistant_700Bold",
                        color,
                        lineHeight: 70,
                    }}
                >
                    {scoreDisplay}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: C.textDim,
                        fontFamily: "Assistant_400Regular",
                    }}
                >
                    / 10
                </Text>
            </Animated.View>
            <View
                style={{
                    marginTop: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: `${color}18`,
                    borderWidth: 1,
                    borderColor: `${color}35`,
                }}
            >
                <Text
                    style={{ color, fontSize: 13, fontFamily: "Assistant_700Bold" }}
                >
                    {label}
                </Text>
            </View>
        </View>
    );
}

// ─── Macro Tile ───────────────────────────────────────────────────────────────
function MacroTile({
    value,
    unit,
    label,
    color,
}: {
    value: number;
    unit: string;
    label: string;
    color: string;
}) {
    const display = useCountAnimation(value);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: C.card2,
                borderRadius: 16,
                padding: 13,
                alignItems: "center",
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            <Text
                style={{
                    color,
                    fontSize: 20,
                    fontFamily: "Assistant_700Bold",
                    lineHeight: 24,
                }}
            >
                {display}
                <Text style={{ fontSize: 11, color: C.textDim }}>{unit}</Text>
            </Text>
            <Text
                style={{
                    color: C.textDim,
                    fontSize: 11,
                    fontFamily: "Assistant_400Regular",
                    marginTop: 4,
                }}
            >
                {label}
            </Text>
        </View>
    );
}

// ─── Carb Budget Bar ──────────────────────────────────────────────────────────
function CarbBar({ current, goal }: { current: number; goal: number }) {
    const pct = Math.min((current / goal) * 100, 100);
    const barColor = pct > 100 ? C.red : pct > 80 ? C.amber : C.green;
    const warning = pct > 80;

    const displayRemaining = useCountAnimation(Math.max(0, goal - current));
    const displayCurrent = useCountAnimation(current);

    const animPct = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(animPct, {
            toValue: pct,
            useNativeDriver: false,
            damping: 20,
            stiffness: 90,
            mass: 1,
        }).start();
    }, [pct]);

    const barWidth = animPct.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp",
    });

    return (
        <View>
            <View
                style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 14,
                }}
            >
                <View style={{ alignItems: "flex-end" }}>
                    <Text
                        style={{
                            color: C.text,
                            fontSize: 15,
                            fontFamily: "Assistant_700Bold",
                        }}
                    >
                        תקציב פחמימות
                    </Text>
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 12,
                            marginTop: 3,
                            fontFamily: "Assistant_400Regular",
                        }}
                    >
                        {displayCurrent}g נצרכו מתוך {goal}g
                    </Text>
                </View>
                <View style={{ alignItems: "flex-start" }}>
                    <Text
                        style={{
                            color: barColor,
                            fontSize: 34,
                            fontFamily: "Assistant_700Bold",
                            lineHeight: 38,
                        }}
                    >
                        {displayRemaining}g
                    </Text>
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 11,
                            fontFamily: "Assistant_400Regular",
                        }}
                    >
                        נשאר
                    </Text>
                </View>
            </View>

            <View
                style={{
                    height: 5,
                    backgroundColor: C.border,
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <Animated.View
                    style={{
                        height: "100%",
                        width: barWidth,
                        backgroundColor: barColor,
                        borderRadius: 3,
                        shadowColor: barColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                    }}
                />
            </View>

            {warning && (
                <Text
                    style={{
                        color: C.amber,
                        fontSize: 11,
                        textAlign: "right",
                        marginTop: 10,
                        fontFamily: "Assistant_400Regular",
                    }}
                >
                    ⚠️ מתקרב לגבול הפחמימות היומי
                </Text>
            )}
        </View>
    );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
    const color = scoreColor(meal.ketoScore);
    const time = new Date(meal.timestamp).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <View
            style={{
                flexDirection: "row-reverse",
                backgroundColor: C.card,
                borderRadius: 20,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: C.border,
                overflow: "hidden",
            }}
        >
            {/* RTL accent bar on right side */}
            <View
                style={{
                    width: 4,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 8,
                }}
            />

            <View style={{ flex: 1, padding: 16 }}>
                {/* Top row */}
                <View
                    style={{
                        flexDirection: "row-reverse",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 14,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 15,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "right",
                                marginBottom: 4,
                            }}
                        >
                            {meal.name}
                        </Text>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 12,
                                textAlign: "right",
                                fontFamily: "Assistant_400Regular",
                            }}
                        >
                            {time}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            marginLeft: 12,
                        }}
                    >
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: `${color}18`,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 1,
                                borderColor: `${color}30`,
                            }}
                        >
                            <Text
                                style={{
                                    color,
                                    fontSize: 16,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {meal.ketoScore}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onDelete}
                            activeOpacity={0.6}
                            style={{ padding: 4 }}
                        >
                            <Trash2 size={18} color={C.textDimmer} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Macro row */}
                <View
                    style={{
                        flexDirection: "row-reverse",
                        justifyContent: "space-between",
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: C.border,
                    }}
                >
                    {[
                        { val: meal.calories, label: "קל׳", color: C.orange },
                        { val: `${meal.carbs}g`, label: "פחמ׳", color: C.amber },
                        { val: `${meal.fat}g`, label: "שומן", color: C.green },
                        { val: `${meal.protein}g`, label: "חלבון", color: C.blue },
                    ].map((item, i) => (
                        <View key={i} style={{ alignItems: "center", flex: 1 }}>
                            <Text
                                style={{
                                    color: item.color,
                                    fontSize: 15,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {item.val}
                            </Text>
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 10,
                                    marginTop: 3,
                                    fontFamily: "Assistant_400Regular",
                                }}
                            >
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
    const router = useRouter();
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<KetoSuggestion | null>(null);
    const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);

    const meals = useMealsStore((state) => state.meals);
    const removeMeal = useMealsStore((state) => state.removeMeal);
    const dailyGoals = useMealsStore((state) => state.dailyGoals);
    const userName = useUserStore((state) => state.profile.name);

    const prevMealsCount = useRef(meals.length);
    useEffect(() => {
        const todayCount = meals.filter((m) => {
            const today = new Date();
            const d = new Date(m.timestamp);
            return d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear();
        }).length;
        if (todayCount > prevMealsCount.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        prevMealsCount.current = todayCount;
    }, [meals.length]);

    const todaysMeals = meals.filter((m) => {
        const today = new Date();
        const date = new Date(m.timestamp);
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    });

    const totals = todaysMeals.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            fat: acc.fat + meal.fat,
            carbs: acc.carbs + meal.carbs,
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    const ketoScore =
        todaysMeals.length === 0
            ? 10
            : Math.round(
                  (todaysMeals.reduce((acc, m) => acc + m.ketoScore, 0) /
                      todaysMeals.length) *
                      10
              ) / 10;

    const handleAskAi = async () => {
        setLoadingAiSuggestions(true);
        try {
            const suggestions = await getKetoImprovementSuggestions(
                ketoScore,
                totals,
                dailyGoals
            );
            setAiSuggestions(suggestions);
        } catch {
            setAiSuggestions({
                summary: "לא הצלחנו לקבל המלצות כרגע",
                suggestions: ["נסה שוב מאוחר יותר"],
            });
        } finally {
            setLoadingAiSuggestions(false);
        }
    };

    const dateStr = new Date().toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <AddFoodModal
                visible={showAddFoodModal}
                onClose={() => setShowAddFoodModal(false)}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}>
                    <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 28,
                                fontFamily: "Assistant_700Bold",
                                textAlign: "right",
                                flex: 1,
                                lineHeight: 42,
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {userName ? `שלום, ${userName} 👋` : "שלום 👋"}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowAddFoodModal(true)}
                            activeOpacity={0.85}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 16,
                                backgroundColor: C.maroon,
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: 12,
                                shadowColor: C.maroon,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.5,
                                shadowRadius: 14,
                                elevation: 10,
                            }}
                        >
                            <Plus size={26} color="#fff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 13,
                            textAlign: "right",
                            fontFamily: "Assistant_400Regular",
                        }}
                    >
                        {dateStr}
                    </Text>
                </View>

                {/* ── Score Card ── */}
                <View
                    style={{
                        marginHorizontal: 20,
                        backgroundColor: C.card,
                        borderRadius: 28,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: C.border,
                        alignItems: "center",
                        marginBottom: 14,
                    }}
                >
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 13,
                            fontFamily: "Assistant_400Regular",
                            marginBottom: 16,
                            letterSpacing: 0.5,
                        }}
                    >
                        ציון קטו יומי
                    </Text>

                    <ScoreRing score={ketoScore} />

                    {/* Macro tiles */}
                    <View
                        style={{
                            flexDirection: "row-reverse",
                            gap: 8,
                            width: "100%",
                            marginTop: 20,
                        }}
                    >
                        <MacroTile
                            value={totals.calories}
                            unit=""
                            label="קלוריות"
                            color={C.orange}
                        />
                        <MacroTile
                            value={totals.fat}
                            unit="g"
                            label="שומן"
                            color={C.green}
                        />
                        <MacroTile
                            value={totals.protein}
                            unit="g"
                            label="חלבון"
                            color={C.blue}
                        />
                    </View>
                </View>

                {/* ── Carb Budget Card ── */}
                <View
                    style={{
                        marginHorizontal: 20,
                        backgroundColor: C.card,
                        borderRadius: 28,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 14,
                    }}
                >
                    <CarbBar current={totals.carbs} goal={dailyGoals.carbs} />
                </View>

                {/* ── AI Button ── */}
                <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
                    <TouchableOpacity
                        onPress={handleAskAi}
                        disabled={loadingAiSuggestions}
                        activeOpacity={0.75}
                        style={{
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            backgroundColor: C.card,
                            borderRadius: 20,
                            paddingVertical: 16,
                            borderWidth: 1,
                            borderColor: `${C.maroon}50`,
                        }}
                    >
                        {loadingAiSuggestions ? (
                            <ActivityIndicator size="small" color={C.maroon} />
                        ) : (
                            <Sparkles size={18} color={C.maroon} />
                        )}
                        <Text
                            style={{
                                color: C.maroon,
                                fontSize: 14,
                                fontFamily: "Assistant_700Bold",
                            }}
                        >
                            {loadingAiSuggestions ? "מנתח..." : "שאל AI לשיפור הציון"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── AI Suggestions ── */}
                {aiSuggestions && (
                    <View
                        style={{
                            marginHorizontal: 20,
                            backgroundColor: C.card,
                            borderRadius: 28,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: `${C.maroon}30`,
                            marginBottom: 14,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 14,
                            }}
                        >
                            <Sparkles size={18} color={C.maroon} />
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 17,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                המלצות AI
                            </Text>
                        </View>

                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 13,
                                textAlign: "right",
                                fontFamily: "Assistant_400Regular",
                                lineHeight: 20,
                                marginBottom: 16,
                            }}
                        >
                            {aiSuggestions.summary}
                        </Text>

                        {aiSuggestions.suggestions.map((s, i) => (
                            <View
                                key={i}
                                style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "flex-start",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 8,
                                        backgroundColor: `${C.maroon}25`,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: C.maroon,
                                            fontSize: 11,
                                            fontFamily: "Assistant_700Bold",
                                        }}
                                    >
                                        {i + 1}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        flex: 1,
                                        color: C.textDim,
                                        fontSize: 13,
                                        textAlign: "right",
                                        fontFamily: "Assistant_400Regular",
                                        lineHeight: 20,
                                    }}
                                >
                                    {s}
                                </Text>
                            </View>
                        ))}

                        <TouchableOpacity
                            onPress={() => setAiSuggestions(null)}
                            style={{ marginTop: 8, alignItems: "center", paddingVertical: 8 }}
                            activeOpacity={0.6}
                        >
                            <Text
                                style={{
                                    color: C.textDimmer,
                                    fontSize: 13,
                                    fontFamily: "Assistant_400Regular",
                                }}
                            >
                                סגור
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Quick Actions ── */}
                <View
                    style={{
                        flexDirection: "row-reverse",
                        gap: 12,
                        marginHorizontal: 20,
                        marginBottom: 28,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/scanner")}
                        activeOpacity={0.8}
                        style={{
                            flex: 1,
                            backgroundColor: C.maroon,
                            borderRadius: 24,
                            paddingVertical: 22,
                            alignItems: "center",
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.45,
                            shadowRadius: 18,
                            elevation: 10,
                        }}
                    >
                        <Camera size={26} color="#fff" />
                        <Text
                            style={{
                                color: "#fff",
                                fontFamily: "Assistant_700Bold",
                                fontSize: 14,
                                marginTop: 10,
                            }}
                        >
                            סרוק ארוחה
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/recipes")}
                        activeOpacity={0.8}
                        style={{
                            flex: 1,
                            backgroundColor: C.card,
                            borderRadius: 24,
                            paddingVertical: 22,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <UtensilsCrossed size={26} color={C.maroon} />
                        <Text
                            style={{
                                color: C.text,
                                fontFamily: "Assistant_700Bold",
                                fontSize: 14,
                                marginTop: 10,
                            }}
                        >
                            מתכונים
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Meals Section ── */}
                <View style={{ paddingHorizontal: 20 }}>
                    <View
                        style={{
                            flexDirection: "row-reverse",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Text
                            style={{
                                color: C.text,
                                fontSize: 20,
                                fontFamily: "Assistant_700Bold",
                            }}
                        >
                            הארוחות שלי
                        </Text>
                        <View
                            style={{
                                backgroundColor: `${C.maroon}20`,
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 5,
                                borderWidth: 1,
                                borderColor: `${C.maroon}30`,
                            }}
                        >
                            <Text
                                style={{
                                    color: C.maroon,
                                    fontSize: 13,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {todaysMeals.length}
                            </Text>
                        </View>
                    </View>

                    {todaysMeals.length === 0 ? (
                        <View
                            style={{
                                backgroundColor: C.card,
                                borderRadius: 24,
                                padding: 44,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 20,
                                    backgroundColor: C.card2,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <UtensilsCrossed size={28} color={C.textDimmer} />
                            </View>
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_700Bold",
                                    textAlign: "center",
                                    marginBottom: 8,
                                }}
                            >
                                עדיין לא הוספת ארוחות
                            </Text>
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 13,
                                    textAlign: "center",
                                    fontFamily: "Assistant_400Regular",
                                    lineHeight: 20,
                                }}
                            >
                                לחץ על + כדי להתחיל לעקוב
                            </Text>
                        </View>
                    ) : (
                        todaysMeals.map((meal) => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                onDelete={() => removeMeal(meal.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
