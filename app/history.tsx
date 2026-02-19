import { useState, useMemo } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { useRouter } from "expo-router";
import { useMealsStore, type Meal } from "../store/mealsStore";
import { ChevronRight, ChevronLeft, Calendar, Flame, UtensilsCrossed } from "lucide-react-native";

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

function formatDateHebrew(date: Date): string {
    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
    );
}

type DaySummary = {
    date: Date;
    meals: Meal[];
    totals: { calories: number; protein: number; fat: number; carbs: number };
    avgKetoScore: number;
};

function DayCard({
    day,
    expanded,
    onToggle,
}: {
    day: DaySummary;
    expanded: boolean;
    onToggle: () => void;
}) {
    const color = scoreColor(day.avgKetoScore);
    const isToday = isSameDay(day.date, new Date());

    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isToday ? `${C.maroon}40` : C.border,
                overflow: "hidden",
            }}
        >
            <TouchableOpacity
                onPress={onToggle}
                activeOpacity={0.7}
                style={{ padding: 20 }}
            >
                <View
                    style={{
                        flexDirection: "row-reverse",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                            <Text
                                style={{
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {isToday ? "היום" : formatDateHebrew(day.date)}
                            </Text>
                            {isToday && (
                                <View
                                    style={{
                                        backgroundColor: `${C.maroon}20`,
                                        paddingHorizontal: 12,
                                        paddingVertical: 4,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: `${C.maroon}30`,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: C.maroon,
                                            fontSize: 11,
                                            fontFamily: "Assistant_700Bold",
                                        }}
                                    >
                                        היום
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text
                            style={{
                                color: C.textDim,
                                fontSize: 12,
                                fontFamily: "Assistant_400Regular",
                                marginTop: 4,
                            }}
                        >
                            {day.meals.length} ארוחות
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 16,
                                backgroundColor: `${color}15`,
                                borderWidth: 1,
                                borderColor: `${color}30`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color,
                                    fontSize: 18,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {day.avgKetoScore}
                            </Text>
                        </View>
                        <ChevronLeft
                            size={16}
                            color={C.textDimmer}
                            style={{
                                transform: [{ rotate: expanded ? "-90deg" : "0deg" }],
                            }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row-reverse", gap: 8 }}>
                    {[
                        { label: "קל׳", value: day.totals.calories, color: C.orange },
                        { label: "פחמ׳", value: `${day.totals.carbs}g`, color: C.amber },
                        { label: "שומן", value: `${day.totals.fat}g`, color: C.green },
                        { label: "חלבון", value: `${day.totals.protein}g`, color: C.blue },
                    ].map((m, i) => (
                        <View
                            key={i}
                            style={{
                                flex: 1,
                                backgroundColor: C.card2,
                                borderRadius: 12,
                                paddingVertical: 12,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <Text
                                style={{
                                    color: m.color,
                                    fontSize: 14,
                                    fontFamily: "Assistant_700Bold",
                                }}
                            >
                                {m.value}
                            </Text>
                            <Text
                                style={{
                                    color: C.textDim,
                                    fontSize: 10,
                                    fontFamily: "Assistant_400Regular",
                                    marginTop: 2,
                                }}
                            >
                                {m.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </TouchableOpacity>

            {expanded && day.meals.length > 0 && (
                <View
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: C.border,
                        paddingHorizontal: 20,
                        paddingBottom: 16,
                        paddingTop: 12,
                    }}
                >
                    {day.meals.map((meal, i) => {
                        const mColor = scoreColor(meal.ketoScore);
                        const time = new Date(meal.timestamp).toLocaleTimeString(
                            "he-IL",
                            { hour: "2-digit", minute: "2-digit" }
                        );
                        return (
                            <View
                                key={meal.id}
                                style={{
                                    flexDirection: "row-reverse",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderBottomWidth:
                                        i < day.meals.length - 1 ? 1 : 0,
                                    borderBottomColor: C.border,
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: C.text,
                                            fontSize: 14,
                                            fontFamily: "Assistant_700Bold",
                                            textAlign: "right",
                                        }}
                                    >
                                        {meal.name}
                                    </Text>
                                    <Text
                                        style={{
                                            color: C.textDim,
                                            fontSize: 11,
                                            fontFamily: "Assistant_400Regular",
                                            textAlign: "right",
                                            marginTop: 4,
                                        }}
                                    >
                                        {time} · {meal.calories} קל׳ · {meal.carbs}g
                                        פחמ׳
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 12,
                                        backgroundColor: `${mColor}15`,
                                        borderWidth: 1,
                                        borderColor: `${mColor}30`,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: mColor,
                                            fontSize: 14,
                                            fontFamily: "Assistant_700Bold",
                                        }}
                                    >
                                        {meal.ketoScore}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

export default function HistoryScreen() {
    const router = useRouter();
    const meals = useMealsStore((s) => s.meals);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    const daySummaries = useMemo<DaySummary[]>(() => {
        const groups = new Map<string, Meal[]>();

        const sorted = [...meals].sort((a, b) => b.timestamp - a.timestamp);

        for (const meal of sorted) {
            const d = new Date(meal.timestamp);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(meal);
        }

        return Array.from(groups.entries()).map(([key, dayMeals]) => {
            const totals = dayMeals.reduce(
                (acc, m) => ({
                    calories: acc.calories + m.calories,
                    protein: acc.protein + m.protein,
                    fat: acc.fat + m.fat,
                    carbs: acc.carbs + m.carbs,
                }),
                { calories: 0, protein: 0, fat: 0, carbs: 0 }
            );
            const avgKetoScore =
                Math.round(
                    (dayMeals.reduce((acc, m) => acc + m.ketoScore, 0) /
                        dayMeals.length) *
                        10
                ) / 10;

            return {
                date: new Date(dayMeals[0].timestamp),
                meals: dayMeals,
                totals,
                avgKetoScore,
            };
        });
    }, [meals]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                }}
            >
                <View
                    style={{
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <Calendar size={20} color={C.maroon} />
                    <Text
                        style={{
                            color: C.text,
                            fontSize: 22,
                            fontFamily: "Assistant_700Bold",
                        }}
                    >
                        היסטוריית ארוחות
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: C.card2,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: C.border,
                    }}
                >
                    <ChevronRight size={20} color={C.textDim} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 48,
                }}
                showsVerticalScrollIndicator={false}
            >
                {daySummaries.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: C.card,
                            borderRadius: 24,
                            padding: 44,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: C.border,
                            marginTop: 40,
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
                            אין היסטוריה עדיין
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
                            התחל להוסיף ארוחות כדי לראות את ההיסטוריה שלך
                        </Text>
                    </View>
                ) : (
                    daySummaries.map((day) => {
                        const key = day.date.toISOString();
                        return (
                            <DayCard
                                key={key}
                                day={day}
                                expanded={expandedDate === key}
                                onToggle={() =>
                                    setExpandedDate(
                                        expandedDate === key ? null : key
                                    )
                                }
                            />
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
