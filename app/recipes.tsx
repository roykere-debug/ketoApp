import { View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from "react-native";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useState, useEffect } from "react";
import { suggestRecipes, Recipe, generateRecipeImage } from "../services/recipes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChefHat, X, Plus, Sparkles, Flame, Beef, Droplet, Wheat, Heart, BookMarked } from "lucide-react-native";
import { useMealsStore } from "../store/mealsStore";
import { useFavoritesStore } from "../store/favoritesStore";

type ViewMode = 'search' | 'favorites';

export default function RecipesScreen() {
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [recipeImages, setRecipeImages] = useState<{ [key: string]: string | null }>({});
    const [viewMode, setViewMode] = useState<ViewMode>('search');
    
    const addMeal = useMealsStore((state) => state.addMeal);
    const { favoriteRecipes, addFavorite, removeFavorite, isFavorite, loadFavorites } = useFavoritesStore();

    // Load favorites when component mounts
    useEffect(() => {
        loadFavorites();
    }, []);

    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setIngredients([...ingredients, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    const removeIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFavorite = (recipe: Recipe) => {
        if (isFavorite(recipe.id)) {
            removeFavorite(recipe.id);
        } else {
            addFavorite(recipe);
        }
    };

    const addRecipeToLog = (recipe: Recipe) => {
        // Calculate keto score based on nutrition
        const carbRatio = recipe.nutrition.carbs / (recipe.nutrition.carbs + recipe.nutrition.fat + recipe.nutrition.protein);
        const ketoScore = Math.max(1, Math.min(10, 10 - (carbRatio * 30)));
        
        addMeal({
            name: recipe.title,
            calories: recipe.nutrition.calories,
            protein: recipe.nutrition.protein,
            fat: recipe.nutrition.fat,
            carbs: recipe.nutrition.carbs,
            ketoScore: Math.round(ketoScore * 10) / 10,
            timestamp: new Date().toISOString(),
        });

        Alert.alert(
            "נוסף ליומן! ✅",
            `${recipe.title} נוסף ליומן האוכל שלך`,
            [{ text: "אישור", style: "default" }]
        );
    };

    const handleSearch = async () => {
        if (ingredients.length === 0) return;
        
        setLoading(true);
        setRecipes([]);
        setRecipeImages({});
        
        try {
            const results = await suggestRecipes(ingredients);
            setRecipes(results);
            
            // Generate images for recipes in the background
            results.forEach(async (recipe) => {
                if (recipe.imagePrompt) {
                    const imageUrl = await generateRecipeImage(recipe.imagePrompt);
                    if (imageUrl) {
                        setRecipeImages(prev => ({ ...prev, [recipe.id]: imageUrl }));
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-5 pt-2 pb-5">
                    <View className="flex-row-reverse items-center gap-3 mb-2">
                        <ChefHat size={36} color="#800020" strokeWidth={2.5} />
                        <Text className="text-4xl font-extrabold text-right">מתכונים קיטו</Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-400 text-right">
                        חפש מתכונים חדשים או צפה במועדפים שלך
                    </Text>
                </View>

                {/* View Mode Tabs */}
                <View className="px-5 mb-6">
                    <View 
                        className="bg-white rounded-3xl p-1.5 flex-row-reverse gap-2"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 10,
                            elevation: 3,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setViewMode('search')}
                            className={`flex-1 py-3.5 rounded-2xl flex-row-reverse items-center justify-center gap-2 ${
                                viewMode === 'search' ? 'bg-[#800020]' : 'bg-white'
                            }`}
                            activeOpacity={0.8}
                        >
                            <Sparkles 
                                size={18} 
                                color={viewMode === 'search' ? '#fff' : '#6b7280'} 
                            />
                            <Text className={`font-extrabold text-[15px] ${
                                viewMode === 'search' ? 'text-white' : 'text-gray-600'
                            }`}>
                                חיפוש מתכונים
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => setViewMode('favorites')}
                            className={`flex-1 py-3.5 rounded-2xl flex-row-reverse items-center justify-center gap-2 ${
                                viewMode === 'favorites' ? 'bg-[#800020]' : 'bg-white'
                            }`}
                            activeOpacity={0.8}
                        >
                            <BookMarked 
                                size={18} 
                                color={viewMode === 'favorites' ? '#fff' : '#6b7280'} 
                            />
                            <Text className={`font-extrabold text-[15px] ${
                                viewMode === 'favorites' ? 'text-white' : 'text-gray-600'
                            }`}>
                                המועדפים ({favoriteRecipes.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search View */}
                {viewMode === 'search' && (
                    <>
                {/* Add Ingredients Section */}
                <View 
                    className="bg-white mx-5 rounded-3xl p-6 mb-6"
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    <Text className="text-xl font-extrabold text-right mb-5">הוסף מרכיבים</Text>
                    
                    <View className="flex-row-reverse gap-3 mb-5">
                        <Input
                            className="flex-1"
                            placeholder="למשל: ביצים, אבוקדו, גבינה..."
                            value={ingredientInput}
                            onChangeText={setIngredientInput}
                            onSubmitEditing={addIngredient}
                            textAlign="right"
                        />
                        <TouchableOpacity
                            onPress={addIngredient}
                            disabled={!ingredientInput.trim()}
                            className={`w-14 h-14 rounded-2xl items-center justify-center ${
                                ingredientInput.trim() ? 'bg-[#800020]' : 'bg-gray-200'
                            }`}
                            activeOpacity={0.8}
                        >
                            <Plus size={24} color="#fff" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    {/* Ingredients Tags */}
                    {ingredients.length > 0 && (
                        <View className="flex-row-reverse flex-wrap gap-2.5 mb-5">
                            {ingredients.map((ing, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    onPress={() => removeIngredient(idx)}
                                    className="bg-[#800020]/10 px-4 py-2.5 rounded-2xl flex-row-reverse items-center gap-2"
                                    activeOpacity={0.7}
                                >
                                    <X size={14} color="#800020" strokeWidth={2.5} />
                                    <Text className="text-sm font-extrabold text-[#800020]">{ing}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Search Button */}
                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={ingredients.length === 0 || loading}
                        className={`py-4.5 rounded-2xl flex-row-reverse items-center justify-center gap-2 ${
                            ingredients.length > 0 && !loading ? 'bg-[#800020]' : 'bg-gray-200'
                        }`}
                        activeOpacity={0.8}
                        style={
                            ingredients.length > 0 && !loading
                                ? {
                                      shadowColor: "#800020",
                                      shadowOffset: { width: 0, height: 4 },
                                      shadowOpacity: 0.2,
                                      shadowRadius: 10,
                                      elevation: 5,
                                  }
                                : {}
                        }
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Sparkles size={20} color="#fff" strokeWidth={2.5} />
                        )}
                        <Text className="text-white font-extrabold text-base">
                            {loading ? "מחפש מתכונים..." : "חפש במתכונים"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search Results */}
                {recipes.length > 0 && (
                    <View className="px-5">
                        <Text className="text-2xl font-extrabold text-right mb-5">
                            מתכונים בשבילך ({recipes.length})
                        </Text>
                        
                        {recipes.map((item) => (
                            <View 
                                key={item.id} 
                                className="bg-white rounded-3xl overflow-hidden mb-5"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 12,
                                    elevation: 3,
                                }}
                            >
                                {/* Recipe Image with Action Buttons */}
                                <View className="relative">
                                    {recipeImages[item.id] ? (
                                        <Image 
                                            source={{ uri: recipeImages[item.id]! }}
                                            className="w-full h-56"
                                            resizeMode="cover"
                                        />
                                    ) : item.imagePrompt ? (
                                        <View className="w-full h-56 bg-gray-100 items-center justify-center">
                                            <ActivityIndicator size="small" color="#800020" />
                                            <Text className="text-xs font-semibold text-gray-400 mt-2">מייצר תמונה...</Text>
                                        </View>
                                ) : (
                                    <View className="w-full h-56 bg-gradient-to-b from-gray-50 to-gray-100 items-center justify-center">
                                        <ChefHat size={56} color="#800020" opacity={0.15} />
                                    </View>
                                )}
                                    
                                    {/* Action Buttons Overlay */}
                                    <View className="absolute top-4 left-4 right-4 flex-row justify-between">
                                        {/* Add to Log Button */}
                                        <TouchableOpacity
                                            onPress={() => addRecipeToLog(item)}
                                            className="w-14 h-14 bg-[#800020] rounded-2xl items-center justify-center"
                                            activeOpacity={0.8}
                                            style={{
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 6,
                                            }}
                                        >
                                            <Plus size={26} color="#fff" strokeWidth={3} />
                                        </TouchableOpacity>
                                        
                                        {/* Favorite Button */}
                                        <TouchableOpacity
                                            onPress={() => toggleFavorite(item)}
                                            className={`w-14 h-14 rounded-2xl items-center justify-center ${
                                                isFavorite(item.id) ? 'bg-[#800020]' : 'bg-white'
                                            }`}
                                            activeOpacity={0.8}
                                            style={{
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 6,
                                            }}
                                        >
                                            <Heart 
                                                size={24} 
                                                color={isFavorite(item.id) ? "#fff" : "#800020"}
                                                fill={isFavorite(item.id) ? "#fff" : "none"}
                                                strokeWidth={2.5}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <View className="p-6">
                                    <View className="flex-row-reverse justify-between items-start mb-4">
                                        <Text className="text-xl font-extrabold text-right flex-1 leading-7">{item.title}</Text>
                                        <View className="w-14 h-14 rounded-2xl bg-[#800020]/10 items-center justify-center ml-3">
                                            <Text className="text-[#800020] font-extrabold text-lg">
                                                {item.ketoScore}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="mb-4">
                                        <Text className="text-sm font-extrabold text-gray-600 text-right mb-3">
                                            מרכיבים:
                                        </Text>
                                        <View className="flex-row-reverse flex-wrap gap-2">
                                            {item.ingredients.map((ingredient, idx) => (
                                                <View key={idx} className="bg-gray-100 px-3.5 py-2 rounded-xl">
                                                    <Text className="text-xs font-bold text-gray-700">
                                                        {ingredient}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    
                                    <View className="pt-4 border-t border-gray-100 mb-4">
                                        <Text className="text-sm font-extrabold text-gray-600 text-right mb-3">
                                            הוראות הכנה:
                                        </Text>
                                        <Text className="text-sm font-semibold text-gray-700 text-right leading-6">
                                            {item.instructions}
                                        </Text>
                                    </View>
                                    
                                    {/* Nutrition Facts */}
                                    <View className="pt-4 border-t border-gray-100">
                                        <Text className="text-sm font-extrabold text-gray-600 text-right mb-4">
                                            ערכים תזונתיים למנה:
                                        </Text>
                                        <View className="flex-row-reverse justify-between">
                                            <View className="items-center flex-1">
                                                <View className="w-14 h-14 rounded-2xl bg-[#800020]/10 items-center justify-center mb-2">
                                                    <Flame size={22} color="#800020" strokeWidth={2} />
                                                </View>
                                                <Text className="text-lg font-extrabold text-gray-800">
                                                    {item.nutrition.calories}
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                    קלוריות
                                                </Text>
                                            </View>
                                            
                                            <View className="items-center flex-1">
                                                <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                    <Beef size={22} color="#4b5563" strokeWidth={2} />
                                                </View>
                                                <Text className="text-lg font-extrabold text-gray-800">
                                                    {item.nutrition.protein}g
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                    חלבון
                                                </Text>
                                            </View>
                                            
                                            <View className="items-center flex-1">
                                                <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                    <Droplet size={22} color="#4b5563" strokeWidth={2} />
                                                </View>
                                                <Text className="text-lg font-extrabold text-gray-800">
                                                    {item.nutrition.fat}g
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                    שומן
                                                </Text>
                                            </View>
                                            
                                            <View className="items-center flex-1">
                                                <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                    <Wheat size={22} color="#4b5563" strokeWidth={2} />
                                                </View>
                                                <Text className="text-lg font-extrabold text-gray-800">
                                                    {item.nutrition.carbs}g
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                    פחמימות
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty State - Search */}
                {recipes.length === 0 && !loading && (
                    <View className="px-5">
                        <View 
                            className="bg-white rounded-3xl p-12 items-center"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 10,
                                elevation: 2,
                            }}
                        >
                            <View className="w-24 h-24 rounded-3xl bg-[#800020]/10 items-center justify-center mb-5">
                                <ChefHat size={40} color="#800020" strokeWidth={2.5} />
                            </View>
                            <Text className="text-lg font-extrabold text-gray-700 text-center mb-2">
                                {ingredients.length === 0 
                                    ? "הוסף מרכיבים כדי למצוא מתכונים"
                                    : "לחץ על 'חפש במתכונים' כדי לקבל הצעות"
                                }
                            </Text>
                            <Text className="text-sm font-semibold text-gray-400 text-center">
                                ה-AI יצור לך מתכונים קיטו מותאמים אישית
                            </Text>
                        </View>
                    </View>
                )}
                    </>
                )}

                {/* Favorites View */}
                {viewMode === 'favorites' && (
                    <View className="px-5">
                        {favoriteRecipes.length > 0 ? (
                            <>
                                <Text className="text-2xl font-extrabold text-right mb-5">
                                    המתכונים המועדפים שלי ({favoriteRecipes.length})
                                </Text>
                                
                                {favoriteRecipes.map((item) => (
                                    <View 
                                        key={item.id} 
                                        className="bg-white rounded-3xl overflow-hidden mb-5"
                                        style={{
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.08,
                                            shadowRadius: 12,
                                            elevation: 3,
                                        }}
                                    >
                                        {/* Recipe Image with Action Buttons */}
                                        <View className="relative">
                                            <View className="w-full h-56 bg-gradient-to-b from-gray-50 to-gray-100 items-center justify-center">
                                                <ChefHat size={56} color="#800020" opacity={0.15} />
                                            </View>
                                            
                                            {/* Action Buttons Overlay */}
                                            <View className="absolute top-4 left-4 right-4 flex-row justify-between">
                                                {/* Add to Log Button */}
                                                <TouchableOpacity
                                                    onPress={() => addRecipeToLog(item)}
                                                    className="w-14 h-14 bg-[#800020] rounded-2xl items-center justify-center"
                                                    activeOpacity={0.8}
                                                    style={{
                                                        shadowColor: "#000",
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 8,
                                                        elevation: 6,
                                                    }}
                                                >
                                                    <Plus size={26} color="#fff" strokeWidth={3} />
                                                </TouchableOpacity>
                                                
                                                {/* Remove from Favorites Button */}
                                                <TouchableOpacity
                                                    onPress={() => removeFavorite(item.id)}
                                                    className="w-14 h-14 rounded-2xl items-center justify-center bg-[#800020]"
                                                    activeOpacity={0.8}
                                                    style={{
                                                        shadowColor: "#000",
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 8,
                                                        elevation: 6,
                                                    }}
                                                >
                                                    <Heart 
                                                        size={24} 
                                                        color="#fff"
                                                        fill="#fff"
                                                        strokeWidth={2.5}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        
                                        <View className="p-6">
                                            <View className="flex-row-reverse justify-between items-start mb-4">
                                                <Text className="text-xl font-extrabold text-right flex-1 leading-7">{item.title}</Text>
                                                <View className="w-14 h-14 rounded-2xl bg-[#800020]/10 items-center justify-center ml-3">
                                                    <Text className="text-[#800020] font-extrabold text-lg">
                                                        {item.ketoScore}
                                                    </Text>
                                                </View>
                                            </View>
                                            
                                            <View className="mb-4">
                                                <Text className="text-sm font-extrabold text-gray-600 text-right mb-3">
                                                    מרכיבים:
                                                </Text>
                                                <View className="flex-row-reverse flex-wrap gap-2">
                                                    {item.ingredients.map((ingredient, idx) => (
                                                        <View key={idx} className="bg-gray-100 px-3.5 py-2 rounded-xl">
                                                            <Text className="text-xs font-bold text-gray-700">
                                                                {ingredient}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                            
                                            <View className="pt-4 border-t border-gray-100 mb-4">
                                                <Text className="text-sm font-extrabold text-gray-600 text-right mb-3">
                                                    הוראות הכנה:
                                                </Text>
                                                <Text className="text-sm font-semibold text-gray-700 text-right leading-6">
                                                    {item.instructions}
                                                </Text>
                                            </View>
                                            
                                            {/* Nutrition Facts */}
                                            <View className="pt-4 border-t border-gray-100">
                                                <Text className="text-sm font-extrabold text-gray-600 text-right mb-4">
                                                    ערכים תזונתיים למנה:
                                                </Text>
                                                <View className="flex-row-reverse justify-between">
                                                    <View className="items-center flex-1">
                                                        <View className="w-14 h-14 rounded-2xl bg-[#800020]/10 items-center justify-center mb-2">
                                                            <Flame size={22} color="#800020" strokeWidth={2} />
                                                        </View>
                                                        <Text className="text-lg font-extrabold text-gray-800">
                                                            {item.nutrition.calories}
                                                        </Text>
                                                        <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                            קלוריות
                                                        </Text>
                                                    </View>
                                                    
                                                    <View className="items-center flex-1">
                                                        <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                            <Beef size={22} color="#4b5563" strokeWidth={2} />
                                                        </View>
                                                        <Text className="text-lg font-extrabold text-gray-800">
                                                            {item.nutrition.protein}g
                                                        </Text>
                                                        <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                            חלבון
                                                        </Text>
                                                    </View>
                                                    
                                                    <View className="items-center flex-1">
                                                        <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                            <Droplet size={22} color="#4b5563" strokeWidth={2} />
                                                        </View>
                                                        <Text className="text-lg font-extrabold text-gray-800">
                                                            {item.nutrition.fat}g
                                                        </Text>
                                                        <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                            שומן
                                                        </Text>
                                                    </View>
                                                    
                                                    <View className="items-center flex-1">
                                                        <View className="w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                                                            <Wheat size={22} color="#4b5563" strokeWidth={2} />
                                                        </View>
                                                        <Text className="text-lg font-extrabold text-gray-800">
                                                            {item.nutrition.carbs}g
                                                        </Text>
                                                        <Text className="text-[10px] font-bold text-gray-500 mt-1">
                                                            פחמימות
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </>
                        ) : (
                            <View 
                                className="bg-white rounded-3xl p-12 items-center"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 10,
                                    elevation: 2,
                                }}
                            >
                                <View className="w-24 h-24 rounded-3xl bg-[#800020]/10 items-center justify-center mb-5">
                                    <Heart size={40} color="#800020" strokeWidth={2.5} />
                                </View>
                                <Text className="text-lg font-extrabold text-gray-700 text-center mb-2">
                                    עדיין אין מתכונים מועדפים
                                </Text>
                                <Text className="text-sm font-semibold text-gray-400 text-center">
                                    חפש מתכונים ולחץ על הלב כדי לשמור אותם כאן
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
