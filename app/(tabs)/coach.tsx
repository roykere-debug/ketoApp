import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { useState, useRef, useCallback } from "react";
import { getCoachResponse } from "../../services/ai";
import { useMealsStore } from "../../store/mealsStore";
import { Send } from "lucide-react-native";

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    card2: "#18181B",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    green: "#10b981",
} as const;

export default function CoachScreen() {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
        { role: 'assistant', text: 'היי! אני המאמן האישי שלך לתזונה קטוגנית. אני יודע מה אכלת היום ואיך הציון שלך - שאל אותי כל דבר!' },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const getTodaysMeals = useMealsStore((s) => s.getTodaysMeals);
    const getTodaysTotals = useMealsStore((s) => s.getTodaysTotals);
    const getTodaysKetoScore = useMealsStore((s) => s.getTodaysKetoScore);
    const dailyGoals = useMealsStore((s) => s.dailyGoals);
    const getRemaining = useMealsStore((s) => s.getRemaining);

    const buildMealContext = useCallback(() => {
        const todaysMeals = getTodaysMeals();
        const totals = getTodaysTotals();
        const ketoScore = getTodaysKetoScore();
        const remaining = getRemaining();

        const mealsList = todaysMeals.length > 0
            ? todaysMeals.map((m) => `- ${m.name}: ${m.calories} קל׳, ${m.carbs}g פחמ׳, ${m.fat}g שומן, ${m.protein}g חלבון (ציון: ${m.ketoScore})`).join("\n")
            : "לא נוספו ארוחות עדיין";

        return `ציון קיטו יומי: ${ketoScore}/10
צריכה היום: ${totals.calories} קל׳ | ${totals.carbs}g פחמ׳ | ${totals.fat}g שומן | ${totals.protein}g חלבון
יעדים יומיים: ${dailyGoals.calories} קל׳ | ${dailyGoals.carbs}g פחמ׳ | ${dailyGoals.fat}g שומן | ${dailyGoals.protein}g חלבון
נותר: ${remaining.calories} קל׳ | ${remaining.carbs}g פחמ׳ | ${remaining.fat}g שומן | ${remaining.protein}g חלבון
ארוחות היום:
${mealsList}`;
    }, [getTodaysMeals, getTodaysTotals, getTodaysKetoScore, dailyGoals, getRemaining]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput("");
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const mealContext = buildMealContext();
            const response = await getCoachResponse(messages, userMsg, mealContext);
            setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'סליחה, משהו השתבש. נסה שוב.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Header */}
            <View
                style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                    alignItems: 'center',
                }}
            >
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                    <View
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: `${C.maroon}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: `${C.maroon}35`,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>🥑</Text>
                    </View>
                    <Text style={{ color: C.text, fontSize: 18, fontFamily: 'Assistant_700Bold' }}>
                        המאמן האישי
                    </Text>
                </View>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, idx) => (
                    <View
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
                            maxWidth: '82%',
                        }}
                    >
                        <View
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 13,
                                borderRadius: 20,
                                borderBottomLeftRadius: msg.role === 'user' ? 6 : 20,
                                borderBottomRightRadius: msg.role === 'assistant' ? 6 : 20,
                                backgroundColor: msg.role === 'user' ? C.maroon : C.card,
                                borderWidth: msg.role === 'assistant' ? 1 : 0,
                                borderColor: C.border,
                                shadowColor: msg.role === 'user' ? C.maroon : '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: msg.role === 'user' ? 0.3 : 0.15,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <Text
                                style={{
                                    color: msg.role === 'user' ? '#fff' : C.text,
                                    fontSize: 15,
                                    fontFamily: 'Assistant_400Regular',
                                    textAlign: 'right',
                                    lineHeight: 24,
                                }}
                            >
                                {msg.text}
                            </Text>
                        </View>
                    </View>
                ))}

                {loading && (
                    <View style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
                        <View
                            style={{
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                borderRadius: 20,
                                borderBottomRightRadius: 6,
                                backgroundColor: C.card,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <Text style={{ color: C.textDim, fontSize: 20, letterSpacing: 4 }}>
                                •••
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View
                    style={{
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        paddingBottom: 20,
                        borderTopWidth: 1,
                        borderTopColor: C.border,
                        backgroundColor: C.bg,
                    }}
                >
                    <TextInput
                        style={{
                            flex: 1,
                            height: 48,
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
                        placeholder="כתוב הודעה..."
                        placeholderTextColor={C.textDim}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        multiline={false}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={loading || !input.trim()}
                        activeOpacity={0.8}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            backgroundColor: input.trim() && !loading ? C.maroon : C.card2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: input.trim() && !loading ? C.maroon : C.border,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: input.trim() && !loading ? 0.4 : 0,
                            shadowRadius: 10,
                        }}
                    >
                        <Send size={18} color={input.trim() && !loading ? '#fff' : C.textDim} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
