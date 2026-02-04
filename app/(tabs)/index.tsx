import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useRouter } from "expo-router";
import { useMealsStore } from "../../store/mealsStore";
import type { Meal } from "../../store/mealsStore";
import { Flame, Trash2 } from "lucide-react-native";

function MacroItem({ label, value, unit, color = "text-foreground" }: { label: string; value: number; unit: string; color?: string }) {
    return (
        <View className="items-center flex-1">
            <Text className={`text-xl font-bold ${color}`}>{value}{unit}</Text>
            <Text className="text-xs text-muted-foreground">{label}</Text>
        </View>
    );
}

function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
    const getScoreColor = (score: number) => {
        if (score >= 8) return "bg-green-500";
        if (score >= 5) return "bg-yellow-500";
        return "bg-red-500";
    };

    const time = new Date(meal.timestamp).toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    return (
        <Card className="p-4 mb-3">
            <View className="flex-row-reverse justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-right">{meal.name}</Text>
                    <Text className="text-xs text-muted-foreground text-right">{time}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={onDelete} className="p-2">
                        <Trash2 size={18} color="#999" />
                    </TouchableOpacity>
                    <View className={`${getScoreColor(meal.ketoScore)} px-3 py-1 rounded-full`}>
                        <Text className="text-white font-bold text-sm">{meal.ketoScore}</Text>
                    </View>
                </View>
            </View>
            
            <View className="flex-row-reverse justify-between">
                <View className="items-center">
                    <Text className="font-bold text-primary">{meal.calories}</Text>
                    <Text className="text-xs text-muted-foreground">קלוריות</Text>
                </View>
                <View className="items-center">
                    <Text className="font-bold">{meal.carbs}g</Text>
                    <Text className="text-xs text-muted-foreground">פחמימות</Text>
                </View>
                <View className="items-center">
                    <Text className="font-bold">{meal.fat}g</Text>
                    <Text className="text-xs text-muted-foreground">שומן</Text>
                </View>
                <View className="items-center">
                    <Text className="font-bold">{meal.protein}g</Text>
                    <Text className="text-xs text-muted-foreground">חלבון</Text>
                </View>
            </View>
        </Card>
    );
}

export default function DashboardScreen() {
    const router = useRouter();
    
    // Separate selectors to prevent unnecessary re-renders
    const meals = useMealsStore((state) => state.meals);
    const removeMeal = useMealsStore((state) => state.removeMeal);
    const dailyGoals = useMealsStore((state) => state.dailyGoals);
    
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

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-600";
        if (score >= 5) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 8) return "bg-green-100";
        if (score >= 5) return "bg-yellow-100";
        return "bg-red-100";
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
                
                {/* Keto Score - The Main Focus */}
                <Card className={`p-6 ${getScoreBg(ketoScore)}`}>
                    <View className="items-center">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Flame size={24} color="#800020" />
                            <Text className="text-lg font-bold text-primary">ציון קיטו היום</Text>
                        </View>
                        <Text className={`text-6xl font-bold ${getScoreColor(ketoScore)}`}>
                            {ketoScore}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-1">מתוך 10</Text>
                    </View>
                </Card>

                {/* Remaining for Today */}
                <Card className="p-4">
                    <Text className="text-base font-bold text-center mb-4">נשאר לך להיום</Text>
                    <View className="flex-row-reverse justify-between">
                        <MacroItem label="קלוריות" value={remaining.calories} unit="" color="text-primary" />
                        <MacroItem label="פחמימות" value={remaining.carbs} unit="g" color={remaining.carbs < 10 ? "text-green-600" : "text-foreground"} />
                        <MacroItem label="שומן" value={remaining.fat} unit="g" />
                        <MacroItem label="חלבון" value={remaining.protein} unit="g" />
                    </View>
                </Card>

                {/* Quick Actions */}
                <View className="flex-row-reverse gap-4">
                    <Button
                        className="flex-1 bg-primary"
                        label="סרוק ארוחה"
                        onPress={() => router.push("/(tabs)/scanner")}
                    />
                    <Button
                        className="flex-1"
                        variant="outline"
                        label="מה יש במקרר?"
                        onPress={() => router.push("/recipes")}
                    />
                </View>

                {/* Today's Meals */}
                <View>
                    <Text className="text-xl font-bold text-right mb-3">
                        המנות שלי היום ({todaysMeals.length})
                    </Text>
                    
                    {todaysMeals.length === 0 ? (
                        <Card className="p-6 items-center">
                            <Text className="text-muted-foreground text-center">
                                עוד לא הוספת מנות היום
                            </Text>
                            <Text className="text-muted-foreground text-center text-sm mt-1">
                                לחץ על "סרוק ארוחה" כדי להתחיל
                            </Text>
                        </Card>
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

                {/* Daily Totals */}
                {todaysMeals.length > 0 && (
                    <Card className="p-4 bg-muted/30">
                        <Text className="text-base font-bold text-center mb-3">סה״כ היום</Text>
                        <View className="flex-row-reverse justify-between">
                            <MacroItem label="קלוריות" value={totals.calories} unit="" />
                            <MacroItem label="פחמימות" value={totals.carbs} unit="g" />
                            <MacroItem label="שומן" value={totals.fat} unit="g" />
                            <MacroItem label="חלבון" value={totals.protein} unit="g" />
                        </View>
                    </Card>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
