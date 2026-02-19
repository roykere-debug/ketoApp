import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { Text } from "../components/ui/Text";
import { useState, useEffect } from "react";
import { suggestRecipes, Recipe } from "../services/recipes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChefHat, X, Plus, Sparkles, Flame, Beef, Droplet, Wheat, Heart, BookMarked, ChevronRight, Minus } from "lucide-react-native";
import { useMealsStore } from "../store/mealsStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { useRouter } from "expo-router";

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

type ViewMode = 'search' | 'favorites';

function NutritionTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <View
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    backgroundColor: C.card2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: C.border,
                }}
            >
                {icon}
            </View>
            <Text style={{ color: C.text, fontSize: 14, fontFamily: 'Assistant_700Bold' }}>{value}</Text>
            <Text style={{ color: C.textDim, fontSize: 10, fontFamily: 'Assistant_400Regular', marginTop: 4 }}>{label}</Text>
        </View>
    );
}

function RecipeCard({
    item,
    isFav,
    onToggleFav,
    onAddToLog,
}: {
    item: Recipe;
    isFav: boolean;
    onToggleFav: () => void;
    onAddToLog: () => void;
}) {
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            {/* Icon placeholder + overlay */}
            <View style={{ width: '100%', height: 140, backgroundColor: C.card2 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ChefHat size={48} color={`${C.maroon}50`} strokeWidth={1.5} />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <TouchableOpacity
                        onPress={onAddToLog}
                        activeOpacity={0.8}
                        style={{
                            width: 46,
                            height: 46,
                            borderRadius: 16,
                            backgroundColor: C.maroon,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                        }}
                    >
                        <Plus size={22} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onToggleFav}
                        activeOpacity={0.8}
                        style={{
                            width: 46,
                            height: 46,
                            borderRadius: 16,
                            backgroundColor: isFav ? C.maroon : 'rgba(0,0,0,0.6)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: isFav ? C.maroon : 'rgba(255,255,255,0.15)',
                        }}
                    >
                        <Heart
                            size={20}
                            color={isFav ? '#fff' : 'rgba(255,255,255,0.8)'}
                            fill={isFav ? '#fff' : 'none'}
                            strokeWidth={2}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
                {/* Title + score */}
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <Text style={{ color: C.text, fontSize: 18, fontFamily: 'Assistant_700Bold', textAlign: 'right', flex: 1, lineHeight: 26 }}>
                        {item.title}
                    </Text>
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            backgroundColor: `${C.maroon}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 12,
                            borderWidth: 1,
                            borderColor: `${C.maroon}30`,
                        }}
                    >
                        <Text style={{ color: C.maroon, fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                            {item.ketoScore}
                        </Text>
                    </View>
                </View>

                {/* Ingredients */}
                <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 12, letterSpacing: 0.5 }}>
                    מרכיבים
                </Text>
                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {item.ingredients.map((ing, i) => (
                        <View
                            key={i}
                            style={{
                                backgroundColor: C.card2,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular' }}>{ing}</Text>
                        </View>
                    ))}
                </View>

                {/* Instructions */}
                <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16, marginBottom: 16 }}>
                    <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 8, letterSpacing: 0.5 }}>
                        הוראות הכנה
                    </Text>
                    <Text style={{ color: C.text, fontSize: 14, fontFamily: 'Assistant_400Regular', textAlign: 'right', lineHeight: 22 }}>
                        {item.instructions}
                    </Text>
                </View>

                {/* Nutrition */}
                <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16 }}>
                    <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 16, letterSpacing: 0.5 }}>
                        ערכים תזונתיים
                    </Text>
                    <View style={{ flexDirection: 'row-reverse' }}>
                        <NutritionTile icon={<Flame size={18} color={C.orange} />} value={`${item.nutrition.calories}`} label="קלוריות" />
                        <NutritionTile icon={<Beef size={18} color={C.blue} />} value={`${item.nutrition.protein}g`} label="חלבון" />
                        <NutritionTile icon={<Droplet size={18} color={C.green} />} value={`${item.nutrition.fat}g`} label="שומן" />
                        <NutritionTile icon={<Wheat size={18} color={C.amber} />} value={`${item.nutrition.carbs}g`} label="פחמימות" />
                    </View>
                </View>
            </View>
        </View>
    );
}

function PortionModal({
    visible,
    recipe,
    onClose,
    onConfirm,
}: {
    visible: boolean;
    recipe: Recipe | null;
    onClose: () => void;
    onConfirm: (portion: number) => void;
}) {
    const [portion, setPortion] = useState(100);

    useEffect(() => {
        if (visible) setPortion(100);
    }, [visible]);

    if (!recipe) return null;

    const multiplier = portion / 100;
    const adjusted = {
        calories: Math.round(recipe.nutrition.calories * multiplier),
        protein: Math.round(recipe.nutrition.protein * multiplier),
        fat: Math.round(recipe.nutrition.fat * multiplier),
        carbs: Math.round(recipe.nutrition.carbs * multiplier),
    };

    const PRESETS = [25, 50, 75, 100, 150];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: C.border,
                    }}
                >
                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.7}
                        style={{
                            width: 44,
                            height: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 16,
                            backgroundColor: C.card2,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <X size={22} color={C.textDim} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold' }}>
                        כמה אכלת?
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {/* Recipe name */}
                    <Text style={{ color: C.text, fontSize: 18, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 24 }}>
                        {recipe.title}
                    </Text>

                    {/* Portion slider area */}
                    <View
                        style={{
                            backgroundColor: C.card,
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 16, letterSpacing: 0.5 }}>
                            אחוז מהמנה
                        </Text>

                        {/* Portion display + controls */}
                        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => setPortion((p) => Math.max(10, p - 10))}
                                activeOpacity={0.7}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    backgroundColor: C.card2,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <Minus size={20} color={C.text} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <View style={{ alignItems: 'center', minWidth: 100 }}>
                                <Text style={{ color: C.maroon, fontSize: 48, fontFamily: 'Assistant_700Bold', lineHeight: 56 }}>
                                    {portion}%
                                </Text>
                                <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', marginTop: 4 }}>
                                    מהמנה המלאה
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setPortion((p) => Math.min(300, p + 10))}
                                activeOpacity={0.7}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    backgroundColor: C.card2,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <Plus size={20} color={C.text} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        {/* Quick presets */}
                        <View style={{ flexDirection: 'row-reverse', gap: 8, justifyContent: 'center' }}>
                            {PRESETS.map((val) => {
                                const active = portion === val;
                                return (
                                    <TouchableOpacity
                                        key={val}
                                        onPress={() => setPortion(val)}
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
                                            fontSize: 13,
                                            fontFamily: active ? 'Assistant_700Bold' : 'Assistant_400Regular',
                                        }}>
                                            {val}%
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Adjusted nutrition */}
                    <View
                        style={{
                            backgroundColor: C.card,
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 16, letterSpacing: 0.5 }}>
                            ערכים תזונתיים מחושבים
                        </Text>
                        <View style={{ flexDirection: 'row-reverse' }}>
                            <NutritionTile icon={<Flame size={18} color={C.orange} />} value={`${adjusted.calories}`} label="קלוריות" />
                            <NutritionTile icon={<Beef size={18} color={C.blue} />} value={`${adjusted.protein}g`} label="חלבון" />
                            <NutritionTile icon={<Droplet size={18} color={C.green} />} value={`${adjusted.fat}g`} label="שומן" />
                            <NutritionTile icon={<Wheat size={18} color={C.amber} />} value={`${adjusted.carbs}g`} label="פחמימות" />
                        </View>
                    </View>

                    {/* Confirm button */}
                    <TouchableOpacity
                        onPress={() => onConfirm(portion)}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: C.maroon,
                            borderRadius: 20,
                            paddingVertical: 16,
                            alignItems: 'center',
                            flexDirection: 'row-reverse',
                            justifyContent: 'center',
                            gap: 8,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.4,
                            shadowRadius: 14,
                            elevation: 8,
                        }}
                    >
                        <Plus size={20} color="#fff" strokeWidth={2.5} />
                        <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                            הוסף ליומן
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

export default function RecipesScreen() {
    const router = useRouter();
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('search');
    const [portionRecipe, setPortionRecipe] = useState<Recipe | null>(null);

    const addMeal = useMealsStore((state) => state.addMeal);
    const { favoriteRecipes, addFavorite, removeFavorite, isFavorite, loadFavorites } = useFavoritesStore();

    useEffect(() => { loadFavorites(); }, []);

    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setIngredients([...ingredients, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    const removeIngredient = (index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleFavorite = (recipe: Recipe) => {
        if (isFavorite(recipe.id)) removeFavorite(recipe.id);
        else addFavorite(recipe);
    };

    const confirmAddToLog = (portion: number) => {
        if (!portionRecipe) return;
        const recipe = portionRecipe;
        const multiplier = portion / 100;
        const carbs = recipe.nutrition.carbs * multiplier;
        const fat = recipe.nutrition.fat * multiplier;
        const protein = recipe.nutrition.protein * multiplier;
        const carbRatio = carbs / (carbs + fat + protein || 1);
        const ketoScore = Math.max(1, Math.min(10, 10 - carbRatio * 30));
        addMeal({
            name: recipe.title,
            calories: Math.round(recipe.nutrition.calories * multiplier),
            protein: Math.round(protein),
            fat: Math.round(fat),
            carbs: Math.round(carbs),
            ketoScore: Math.round(ketoScore * 10) / 10,
        });
        setPortionRecipe(null);
        Alert.alert("נוסף ליומן! ✅", `${recipe.title} נוסף ליומן האוכל שלך (${portion}%)`);
    };

    const handleSearch = async () => {
        if (ingredients.length === 0) return;
        setLoading(true);
        setRecipes([]);
        try {
            const results = await suggestRecipes(ingredients);
            setRecipes(results);
        } catch (error) {
            Alert.alert("שגיאה", "לא הצלחנו לייצר מתכונים. נסה שוב מאוחר יותר.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Fixed header with back button */}
            <View
                style={{
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 16,
                        backgroundColor: C.card2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: C.border,
                    }}
                >
                    <ChevronRight size={22} color={C.text} strokeWidth={2.5} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                    <ChefHat size={24} color={C.maroon} strokeWidth={2} />
                    <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold' }}>מתכונים קיטו</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Sub-header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular', textAlign: 'right' }}>
                        חפש מתכונים חדשים או צפה במועדפים שלך
                    </Text>
                </View>

                {/* Tab switcher */}
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <View
                        style={{
                            flexDirection: 'row-reverse',
                            backgroundColor: C.card,
                            borderRadius: 20,
                            padding: 4,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        {([
                            { key: 'search', label: 'חיפוש מתכונים', icon: <Sparkles size={15} color={viewMode === 'search' ? '#fff' : C.textDim} /> },
                            { key: 'favorites', label: `מועדפים (${favoriteRecipes.length})`, icon: <BookMarked size={15} color={viewMode === 'favorites' ? '#fff' : C.textDim} /> },
                        ] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setViewMode(tab.key)}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    backgroundColor: viewMode === tab.key ? C.maroon : 'transparent',
                                    shadowColor: viewMode === tab.key ? C.maroon : 'transparent',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: viewMode === tab.key ? 0.4 : 0,
                                    shadowRadius: 10,
                                }}
                            >
                                {tab.icon}
                                <Text
                                    style={{
                                        color: viewMode === tab.key ? '#fff' : C.textDim,
                                        fontSize: 13,
                                        fontFamily: 'Assistant_700Bold',
                                    }}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Search view */}
                {viewMode === 'search' && (
                    <>
                        {/* Ingredient input */}
                        <View
                            style={{
                                backgroundColor: C.card,
                                marginHorizontal: 20,
                                borderRadius: 24,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: C.border,
                                marginBottom: 20,
                            }}
                        >
                            <Text style={{ color: C.text, fontSize: 16, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 16 }}>
                                הוסף מרכיבים
                            </Text>

                            <View style={{ flexDirection: 'row-reverse', gap: 12, marginBottom: 16 }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        height: 52,
                                        backgroundColor: C.card2,
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        color: C.text,
                                        fontSize: 14,
                                        fontFamily: 'Assistant_400Regular',
                                        textAlign: 'right',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                    placeholder="למשל: ביצים, אבוקדו..."
                                    placeholderTextColor={C.textDimmer}
                                    value={ingredientInput}
                                    onChangeText={setIngredientInput}
                                    onSubmitEditing={addIngredient}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    onPress={addIngredient}
                                    disabled={!ingredientInput.trim()}
                                    activeOpacity={0.8}
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 16,
                                        backgroundColor: ingredientInput.trim() ? C.maroon : C.card2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: ingredientInput.trim() ? C.maroon : C.border,
                                    }}
                                >
                                    <Plus size={22} color={ingredientInput.trim() ? '#fff' : C.textDim} strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>

                            {/* Tags */}
                            {ingredients.length > 0 && (
                                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                    {ingredients.map((ing, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => removeIngredient(idx)}
                                            activeOpacity={0.7}
                                            style={{
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                gap: 8,
                                                backgroundColor: `${C.maroon}18`,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: `${C.maroon}30`,
                                            }}
                                        >
                                            <X size={13} color={C.maroon} strokeWidth={2.5} />
                                            <Text style={{ color: C.maroon, fontSize: 13, fontFamily: 'Assistant_700Bold' }}>{ing}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={handleSearch}
                                disabled={ingredients.length === 0 || loading}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: ingredients.length > 0 && !loading ? C.maroon : C.card2,
                                    borderRadius: 16,
                                    paddingVertical: 16,
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 12,
                                    shadowColor: C.maroon,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: ingredients.length > 0 && !loading ? 0.4 : 0,
                                    shadowRadius: 12,
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Sparkles size={18} color={ingredients.length > 0 ? '#fff' : C.textDim} />
                                )}
                                <Text style={{ color: ingredients.length > 0 && !loading ? '#fff' : C.textDim, fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                                    {loading ? "מחפש מתכונים..." : "חפש מתכונים"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Results */}
                        {recipes.length > 0 && (
                            <View style={{ paddingHorizontal: 20 }}>
                                <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 16 }}>
                                    מתכונים בשבילך ({recipes.length})
                                </Text>
                                {recipes.map((item) => (
                                    <RecipeCard
                                        key={item.id}
                                        item={item}
                                        isFav={isFavorite(item.id)}
                                        onToggleFav={() => toggleFavorite(item)}
                                        onAddToLog={() => setPortionRecipe(item)}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Empty state */}
                        {recipes.length === 0 && !loading && (
                            <View style={{ paddingHorizontal: 20 }}>
                                <View
                                    style={{
                                        backgroundColor: C.card,
                                        borderRadius: 24,
                                        padding: 48,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 22,
                                            backgroundColor: `${C.maroon}15`,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16,
                                            borderWidth: 1,
                                            borderColor: `${C.maroon}25`,
                                        }}
                                    >
                                        <ChefHat size={32} color={C.maroon} strokeWidth={1.5} />
                                    </View>
                                    <Text style={{ color: C.text, fontSize: 16, fontFamily: 'Assistant_700Bold', textAlign: 'center', marginBottom: 8 }}>
                                        {ingredients.length === 0 ? "הוסף מרכיבים כדי למצוא מתכונים" : "לחץ על חפש כדי לקבל הצעות"}
                                    </Text>
                                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular', textAlign: 'center' }}>
                                        ה-AI יצור לך מתכונים קיטו מותאמים אישית
                                    </Text>
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Favorites view */}
                {viewMode === 'favorites' && (
                    <View style={{ paddingHorizontal: 20 }}>
                        {favoriteRecipes.length > 0 ? (
                            <>
                                <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 16 }}>
                                    המתכונים המועדפים שלי ({favoriteRecipes.length})
                                </Text>
                                {favoriteRecipes.map((item) => (
                                    <RecipeCard
                                        key={item.id}
                                        item={item}
                                        isFav={true}
                                        onToggleFav={() => removeFavorite(item.id)}
                                        onAddToLog={() => setPortionRecipe(item)}
                                    />
                                ))}
                            </>
                        ) : (
                            <View
                                style={{
                                    backgroundColor: C.card,
                                    borderRadius: 24,
                                    padding: 48,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <View
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 22,
                                        backgroundColor: `${C.maroon}15`,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: `${C.maroon}25`,
                                    }}
                                >
                                    <Heart size={32} color={C.maroon} strokeWidth={1.5} />
                                </View>
                                <Text style={{ color: C.text, fontSize: 16, fontFamily: 'Assistant_700Bold', textAlign: 'center', marginBottom: 8 }}>
                                    עדיין אין מתכונים מועדפים
                                </Text>
                                <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular', textAlign: 'center' }}>
                                    חפש מתכונים ולחץ על הלב כדי לשמור אותם כאן
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <PortionModal
                visible={!!portionRecipe}
                recipe={portionRecipe}
                onClose={() => setPortionRecipe(null)}
                onConfirm={confirmAddToLog}
            />
        </SafeAreaView>
    );
}
