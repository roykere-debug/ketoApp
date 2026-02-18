import { useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { useRouter } from "expo-router";
import { useMealsStore } from "../../store/mealsStore";
import { useUserStore } from "../../store/userStore";
import type { Meal } from "../../store/mealsStore";
import { Trash2, Camera, UtensilsCrossed, Plus, Sparkles } from "lucide-react-native";
import AddFoodModal from "../../components/modals/AddFoodModal";
import { getKetoImprovementSuggestions, type KetoSuggestion } from "../../services/ai";

// Minimal Score Display
function KetoScoreDisplay({ score }: { score: number }) {
    const getScoreColor = (s: number) => {
        if (s >= 8) return "#10b981"; // green
        if (s >= 5) return "#f59e0b"; // yellow
        return "#ef4444"; // red
    };
    
    const getScoreLabel = (s: number) => {
        if (s >= 8) return "מצוין";
        if (s >= 5) return "טוב";
        return "צריך שיפור";
    };
    
    const color = getScoreColor(score);
    
    return (
        <View className="items-center">
            <View 
                className="w-48 h-48 rounded-full items-center justify-center mb-5"
                style={{ 
                    backgroundColor: `${color}10`,
                    borderWidth: 10,
                    borderColor: `${color}20`
                }}
            >
                <Text className="text-8xl font-extrabold" style={{ color }}>
                    {score}
                </Text>
                <Text className="text-lg font-extrabold text-gray-400 mt-1">/ 10</Text>
            </View>
            <View 
                className="px-6 py-3 rounded-2xl"
                style={{ backgroundColor: `${color}15` }}
            >
                <Text className="text-base font-extrabold" style={{ color }}>
                    {getScoreLabel(score)}
                </Text>
            </View>
        </View>
    );
}

// Progress Bar for Macros
function MacroProgress({ 
    label, 
    current, 
    goal, 
    unit,
    color = "#10b981"
}: { 
    label: string; 
    current: number; 
    goal: number; 
    unit: string;
    color?: string;
}) {
    const percentage = Math.min((current / goal) * 100, 100);
    const remaining = Math.max(0, goal - current);
    
    return (
        <View className="mb-5">
            <View className="flex-row-reverse justify-between items-baseline mb-2.5">
                <Text className="text-base font-extrabold text-right">{label}</Text>
                <View className="flex-row items-baseline gap-1">
                    <Text className="text-xs font-bold text-gray-400">{unit}</Text>
                    <Text className="text-xl font-extrabold">{remaining}</Text>
                    <Text className="text-xs font-bold text-gray-400">נשאר</Text>
                </View>
            </View>
            <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <View 
                    className="h-full rounded-full" 
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                    }}
                />
            </View>
            <Text className="text-xs font-bold text-gray-400 text-right mt-1.5">
                {current} / {goal}{unit}
            </Text>
        </View>
    );
}

function MacroItem({ label, value, unit, color = "text-foreground" }: { label: string; value: number; unit: string; color?: string }) {
    return (
        <View className="items-center flex-1">
            <Text className={`text-2xl font-extrabold ${color}`}>{value}{unit}</Text>
            <Text className="text-xs font-semibold text-gray-500 mt-1">{label}</Text>
        </View>
    );
}

function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
    const getScoreColor = (score: number) => {
        if (score >= 8) return "#10b981";
        if (score >= 5) return "#f59e0b";
        return "#ef4444";
    };

    const time = new Date(meal.timestamp).toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    return (
        <View 
            className="bg-white rounded-3xl p-5 mb-4"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row-reverse justify-between items-start mb-4">
                <View className="flex-1">
                    <Text className="text-lg font-extrabold text-right mb-1.5">{meal.name}</Text>
                    <Text className="text-xs font-semibold text-gray-400 text-right">{time}</Text>
                </View>
                <View className="flex-row-reverse items-center gap-3">
                    <View 
                        className="w-14 h-14 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: `${getScoreColor(meal.ketoScore)}15` }}
                    >
                        <Text 
                            className="font-extrabold text-lg" 
                            style={{ color: getScoreColor(meal.ketoScore) }}
                        >
                            {meal.ketoScore}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={onDelete} 
                        className="w-10 h-10 items-center justify-center"
                        activeOpacity={0.6}
                    >
                        <Trash2 size={20} color="#d1d5db" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View className="flex-row-reverse justify-between pt-4 border-t border-gray-100">
                <View className="items-center flex-1">
                    <Text className="text-lg font-extrabold">{meal.calories}</Text>
                    <Text className="text-[10px] font-bold text-gray-400 mt-1">קלוריות</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-lg font-extrabold">{meal.carbs}g</Text>
                    <Text className="text-[10px] font-bold text-gray-400 mt-1">פחמימות</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-lg font-extrabold">{meal.fat}g</Text>
                    <Text className="text-[10px] font-bold text-gray-400 mt-1">שומן</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-lg font-extrabold">{meal.protein}g</Text>
                    <Text className="text-[10px] font-bold text-gray-400 mt-1">חלבון</Text>
                </View>
            </View>
        </View>
    );
}

export default function DashboardScreen() {
    const router = useRouter();
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<KetoSuggestion | null>(null);
    const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
    
    // Separate selectors to prevent unnecessary re-renders
    const meals = useMealsStore((state) => state.meals);
    const removeMeal = useMealsStore((state) => state.removeMeal);
    const dailyGoals = useMealsStore((state) => state.dailyGoals);
    const userName = useUserStore((state) => state.name);
    
    // Calculate derived values directly in the component
    const todaysMeals = meals.filter(m => {
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

    const remaining = {
        calories: Math.max(0, dailyGoals.calories - totals.calories),
        protein: Math.max(0, dailyGoals.protein - totals.protein),
        fat: Math.max(0, dailyGoals.fat - totals.fat),
        carbs: Math.max(0, dailyGoals.carbs - totals.carbs),
    };

    const ketoScore = todaysMeals.length === 0 
        ? 10 
        : Math.round((todaysMeals.reduce((acc, m) => acc + m.ketoScore, 0) / todaysMeals.length) * 10) / 10;

    const handleAskAi = async () => {
        setLoadingAiSuggestions(true);
        try {
            const suggestions = await getKetoImprovementSuggestions(ketoScore, totals, dailyGoals);
            setAiSuggestions(suggestions);
        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            // Show a fallback message
            setAiSuggestions({
                summary: "לא הצלחנו לקבל המלצות כרגע",
                suggestions: ["נסה שוב מאוחר יותר"]
            });
        } finally {
            setLoadingAiSuggestions(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
            {/* Add Food Button - Top Left */}
            <View className="absolute top-14 left-5 z-10">
                <TouchableOpacity
                    onPress={() => setShowAddFoodModal(true)}
                    className="w-16 h-16 bg-[#800020] rounded-2xl items-center justify-center"
                    activeOpacity={0.8}
                    style={{
                        shadowColor: "#800020",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Plus size={30} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
            </View>

            <AddFoodModal 
                visible={showAddFoodModal} 
                onClose={() => setShowAddFoodModal(false)} 
            />

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-5 pt-2 pb-5">
                    <Text className="text-4xl font-extrabold text-right mb-2">
                        {userName ? `שלום, ${userName}` : 'שלום'}
                    </Text>
                    <Text className="text-sm font-bold text-gray-400 text-right">
                        {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>

                {/* Keto Score - Hero Section */}
                <View 
                    className="bg-white mx-5 rounded-3xl p-8 items-center mb-5"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    {/* Ask AI Button */}
                    <TouchableOpacity
                        onPress={handleAskAi}
                        disabled={loadingAiSuggestions}
                        className="bg-gray-100 px-7 py-3.5 rounded-2xl mb-6 flex-row items-center gap-2"
                        activeOpacity={0.7}
                    >
                        {loadingAiSuggestions ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Sparkles size={18} color="#000" />
                        )}
                        <Text className="text-base font-bold">ask ai</Text>
                    </TouchableOpacity>

                    <Text className="text-base font-bold text-gray-500 mb-6">ציון קטו היום</Text>
                    <KetoScoreDisplay score={ketoScore} />
                </View>

                {/* AI Suggestions Card */}
                {aiSuggestions && (
                    <View 
                        className="bg-[#800020]/5 mx-5 rounded-3xl p-6 mb-5"
                        style={{
                            shadowColor: "#800020",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        <View className="flex-row-reverse items-center gap-2 mb-4">
                            <Sparkles size={22} color="#800020" />
                            <Text className="text-xl font-extrabold text-right">המלצות AI</Text>
                        </View>
                        
                        <Text className="text-sm font-semibold text-gray-600 text-right mb-5">
                            {aiSuggestions.summary}
                        </Text>

                        <View>
                            {aiSuggestions.suggestions.map((suggestion, index) => (
                                <View key={index} className="flex-row-reverse items-start gap-3 mb-3.5">
                                    <View className="w-7 h-7 rounded-xl bg-[#800020] items-center justify-center mt-0.5">
                                        <Text className="text-white text-xs font-bold">{index + 1}</Text>
                                    </View>
                                    <Text className="flex-1 text-sm font-semibold text-gray-700 text-right leading-5">
                                        {suggestion}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            onPress={() => setAiSuggestions(null)}
                            className="mt-4 py-2"
                            activeOpacity={0.7}
                        >
                            <Text className="text-sm font-bold text-gray-400 text-center">סגור</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Daily Progress */}
                <View 
                    className="bg-white mx-5 rounded-3xl p-6 mb-5"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    <Text className="text-xl font-extrabold text-right mb-6">היעדים היומיים שלך</Text>
                    <MacroProgress 
                        label="קלוריות" 
                        current={totals.calories} 
                        goal={dailyGoals.calories}
                        unit="" 
                        color="#800020"
                    />
                    <MacroProgress 
                        label="פחמימות" 
                        current={totals.carbs} 
                        goal={dailyGoals.carbs}
                        unit="g" 
                        color="#f59e0b"
                    />
                    <MacroProgress 
                        label="שומן" 
                        current={totals.fat} 
                        goal={dailyGoals.fat}
                        unit="g" 
                        color="#10b981"
                    />
                    <MacroProgress 
                        label="חלבון" 
                        current={totals.protein} 
                        goal={dailyGoals.protein}
                        unit="g" 
                        color="#3b82f6"
                    />
                </View>

                {/* Quick Actions */}
                <View className="px-5 mb-6">
                    <View className="flex-row-reverse gap-3">
                        <TouchableOpacity 
                            onPress={() => router.push("/(tabs)/scanner")}
                            className="flex-1 bg-[#800020] rounded-3xl p-6 items-center"
                            activeOpacity={0.8}
                            style={{
                                shadowColor: "#800020",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 10,
                                elevation: 4,
                            }}
                        >
                            <Camera size={26} color="#fff" />
                            <Text className="text-white font-extrabold mt-2.5 text-[15px]">סרוק ארוחה</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => router.push("/recipes")}
                            className="flex-1 bg-white rounded-3xl p-6 items-center"
                            activeOpacity={0.8}
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 10,
                                elevation: 3,
                            }}
                        >
                            <UtensilsCrossed size={26} color="#800020" />
                            <Text className="text-[#800020] font-extrabold mt-2.5 text-[15px]">מתכונים</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Today's Meals */}
                <View className="px-5">
                    <View className="flex-row-reverse justify-between items-center mb-5">
                        <Text className="text-2xl font-extrabold text-right">הארוחות שלי</Text>
                        <View className="bg-[#800020]/10 rounded-2xl px-4 py-2">
                            <Text className="text-sm font-extrabold text-[#800020]">
                                {todaysMeals.length}
                            </Text>
                        </View>
                    </View>
                    
                    {todaysMeals.length === 0 ? (
                        <View 
                            className="bg-white rounded-3xl p-12 items-center"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View className="w-20 h-20 rounded-3xl bg-gray-50 items-center justify-center mb-5">
                                <UtensilsCrossed size={32} color="#d1d5db" />
                            </View>
                            <Text className="text-lg font-extrabold text-gray-700 text-center mb-2">
                                עדיין לא הוספת ארוחות
                            </Text>
                            <Text className="text-sm font-semibold text-gray-400 text-center">
                                התחל לעקוב אחר הארוחות שלך היום
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
