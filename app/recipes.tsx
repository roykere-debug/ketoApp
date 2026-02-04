import { View, FlatList, TouchableOpacity } from "react-native";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useState } from "react";
import { suggestRecipes, Recipe } from "../services/recipes";

export default function RecipesScreen() {
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);

    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setIngredients([...ingredients, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        const results = await suggestRecipes(ingredients);
        setRecipes(results);
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-background p-4">
            <View className="mb-6">
                <Text className="text-2xl font-bold text-primary mb-2 text-right">הוסף מרכיבים</Text>
                <View className="flex-row-reverse gap-2">
                    <Input
                        className="flex-1"
                        placeholder="למשל: ביצים, אבוקדו..."
                        value={ingredientInput}
                        onChangeText={setIngredientInput}
                        onSubmitEditing={addIngredient}
                        textAlign="right"
                    />
                    <Button label="הוסף" onPress={addIngredient} className="w-20" />
                </View>
            </View>

            <View className="flex-row-reverse flex-wrap gap-2 mb-6">
                {ingredients.map((ing, idx) => (
                    <TouchableOpacity key={idx} onPress={() => setIngredients(prev => prev.filter((_, i) => i !== idx))}>
                        <View className="bg-muted px-3 py-1 rounded-full">
                            <Text className="text-sm">✕ {ing}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <Button label={loading ? "מחפש מתכונים..." : "מצא מתכונים"} onPress={handleSearch} className="mb-6" />

            <FlatList
                data={recipes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card className="mb-4 p-4">
                        <View className="flex-row-reverse justify-between items-center mb-2">
                            <Text className="text-lg font-bold text-primary text-right">{item.title}</Text>
                            <View className="bg-primary/10 px-2 py-1 rounded">
                                <Text className="text-primary font-bold text-xs">ציון {item.ketoScore}</Text>
                            </View>
                        </View>
                        <Text className="text-sm text-muted-foreground mb-2 text-right">מרכיבים: {item.ingredients.join(", ")}</Text>
                        <Text className="text-sm text-right">{item.instructions}</Text>
                    </Card>
                )}
                ListEmptyComponent={
                    recipes.length === 0 && !loading && ingredients.length > 0 ? (
                        <Text className="text-center text-muted-foreground">לא נמצאו מתכונים עדיין. נסה להוסיף עוד מרכיבים!</Text>
                    ) : null
                }
            />
        </View>
    );
}
