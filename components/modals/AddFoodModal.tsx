import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/Text";
import { searchFoodItems, type FoodItem } from "../../services/foods";
import { searchFoodNutrition, type FoodNutrition } from "../../services/ai";
import { useMealsStore } from "../../store/mealsStore";
import { X, Search, Plus, Sparkles } from "lucide-react-native";

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddFoodModal({ visible, onClose }: AddFoodModalProps) {
  const addMeal = useMealsStore((state) => state.addMeal);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | FoodNutrition | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Try database first
    setIsSearching(true);
    setSearchMode('database');
    const results = await searchFoodItems(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAiSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    setIsAiSearching(true);
    setSearchMode('ai');
    setSearchResults([]);
    
    const aiResult = await searchFoodNutrition(searchQuery);
    
    if (aiResult) {
      // Convert AI result to FoodItem format for display
      setSelectedFood(aiResult);
    }
    
    setIsAiSearching(false);
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchResults([]);
  };

  const handleAddMeal = () => {
    if (!selectedFood) return;

    const multiplier = parseFloat(quantity) / 100;
    
    addMeal({
      name: selectedFood.name_hebrew || selectedFood.name,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      fat: Math.round(selectedFood.fat * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      ketoScore: calculateKetoScore(
        selectedFood.carbs * multiplier,
        selectedFood.fat * multiplier,
        selectedFood.protein * multiplier
      ),
      timestamp: new Date(),
    });

    onClose();
  };

  const calculateKetoScore = (carbs: number, fat: number, protein: number) => {
    const totalCalories = carbs * 4 + fat * 9 + protein * 4;
    const fatPercentage = (fat * 9) / totalCalories;
    const carbPercentage = (carbs * 4) / totalCalories;

    if (carbPercentage < 0.05 && fatPercentage > 0.7) return 10;
    if (carbPercentage < 0.1 && fatPercentage > 0.6) return 8;
    if (carbPercentage < 0.15 && fatPercentage > 0.5) return 6;
    if (carbPercentage < 0.2) return 4;
    return 2;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-[#F8F9FA]">
        {/* Header */}
        <View className="flex-row-reverse justify-between items-center px-5 py-4 bg-white">
          <TouchableOpacity 
            onPress={onClose} 
            className="w-12 h-12 items-center justify-center rounded-2xl bg-gray-100"
            activeOpacity={0.7}
          >
            <X size={24} color="#1f2937" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold">הוסף מזון</Text>
          <View className="w-12" />
        </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="px-5 pt-6 pb-4">
          <View 
            className="flex-row-reverse items-center bg-gray-50 rounded-2xl px-5 py-4 mb-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Search size={22} color="#9ca3af" />
            <TextInput
              className="flex-1 text-right mr-3 text-base font-semibold"
              placeholder="חפש מזון..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          {/* AI Search Button */}
          <TouchableOpacity
            onPress={handleAiSearch}
            disabled={searchQuery.length < 2 || isAiSearching}
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 16,
              backgroundColor: searchQuery.length < 2 ? '#f3f4f6' : '#800020',
              shadowColor: searchQuery.length >= 2 ? "#800020" : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: searchQuery.length >= 2 ? 5 : 0,
            }}
            activeOpacity={0.8}
          >
            {isAiSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Sparkles size={20} color={searchQuery.length < 2 ? "#9ca3af" : "#fff"} strokeWidth={2.5} />
                <Text 
                  className={`font-extrabold text-base ${searchQuery.length < 2 ? 'text-gray-400' : 'text-white'}`}
                >
                  חפש עם AI
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {isSearching && (
          <View className="px-6 py-8 items-center">
            <ActivityIndicator size="large" color="#800020" />
            <Text className="text-sm text-gray-500 mt-3">מחפש במאגר...</Text>
          </View>
        )}

        {isAiSearching && (
          <View className="px-6 py-8 items-center">
            <ActivityIndicator size="large" color="#800020" />
            <Text className="text-sm text-gray-500 mt-3">AI מחפש ערכים תזונתיים...</Text>
          </View>
        )}

        {!isSearching && searchResults.length > 0 && (
          <View className="px-5 pb-4">
            <Text className="text-base font-extrabold text-gray-600 mb-4 text-right">
              תוצאות חיפוש
            </Text>
            {searchResults.map((food) => (
              <TouchableOpacity
                key={food.id}
                onPress={() => handleSelectFood(food)}
                className="bg-white rounded-3xl p-5 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row-reverse justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-lg font-extrabold text-right mb-1.5">
                      {food.name_hebrew || food.name}
                    </Text>
                    <Text className="text-xs font-bold text-gray-400 text-right">
                      {food.serving_size} • {food.category || "כללי"}
                    </Text>
                  </View>
                  <View className="items-center ml-4">
                    <Text className="text-lg font-extrabold">{food.calories}</Text>
                    <Text className="text-[10px] font-bold text-gray-400">קלוריות</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Food Details */}
        {selectedFood && (
          <View className="px-5">
            <View 
              className="bg-white rounded-3xl p-6 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View className="flex-row-reverse justify-between items-start mb-6">
                <View className="flex-1">
                  <View className="flex-row-reverse items-center gap-2 mb-2">
                    <Text className="text-2xl font-extrabold text-right leading-8">
                      {selectedFood.name_hebrew || selectedFood.name}
                    </Text>
                    {searchMode === 'ai' && (
                      <View className="bg-[#800020]/10 px-2.5 py-1.5 rounded-xl flex-row-reverse items-center gap-1">
                        <Sparkles size={12} color="#800020" strokeWidth={2.5} />
                        <Text className="text-xs font-extrabold text-[#800020]">AI</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row-reverse items-center gap-2 mt-1">
                    {selectedFood.category && (
                      <View className="bg-[#800020]/10 px-3 py-1.5 rounded-xl">
                        <Text className="text-xs font-extrabold text-[#800020]">
                          {selectedFood.category}
                        </Text>
                      </View>
                    )}
                    <Text className="text-sm font-semibold text-gray-400">
                      {selectedFood.serving_size}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedFood(null)}
                  className="w-10 h-10 items-center justify-center rounded-2xl bg-gray-100"
                  activeOpacity={0.7}
                >
                  <X size={20} color="#9ca3af" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Nutritional Info */}
              <View className="flex-row-reverse justify-between mb-6 pb-6 border-b border-gray-100">
                <View className="items-center flex-1">
                  <Text className="text-3xl font-extrabold">{selectedFood.calories}</Text>
                  <Text className="text-[10px] font-bold text-gray-400 mt-1.5">קלוריות</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-extrabold">{selectedFood.carbs}g</Text>
                  <Text className="text-[10px] font-bold text-gray-400 mt-1.5">פחמימות</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-extrabold">{selectedFood.fat}g</Text>
                  <Text className="text-[10px] font-bold text-gray-400 mt-1.5">שומן</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-extrabold">{selectedFood.protein}g</Text>
                  <Text className="text-[10px] font-bold text-gray-400 mt-1.5">חלבון</Text>
                </View>
              </View>

              {/* Quantity Input */}
              <View>
                <Text className="text-base font-extrabold text-right mb-3">כמות (גרם)</Text>
                <View className="flex-row-reverse items-center gap-3">
                  <TextInput
                    className="flex-1 bg-gray-50 rounded-2xl px-5 py-4 text-right text-xl font-extrabold"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setQuantity("50")}
                      className="bg-gray-100 px-4 py-3 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-extrabold">50g</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setQuantity("100")}
                      className="bg-gray-100 px-4 py-3 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-extrabold">100g</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setQuantity("200")}
                      className="bg-gray-100 px-4 py-3 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-extrabold">200g</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              onPress={handleAddMeal}
              className="bg-[#800020] rounded-3xl py-5 items-center"
              style={{
                shadowColor: "#800020",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row-reverse items-center gap-2">
                <Plus size={22} color="#fff" strokeWidth={3} />
                <Text className="text-white font-extrabold text-lg">הוסף לארוחות</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!isSearching && !isAiSearching && searchQuery.length >= 2 && searchResults.length === 0 && !selectedFood && (
          <View className="px-5 py-12 items-center">
            <View className="w-24 h-24 rounded-3xl bg-gray-100 items-center justify-center mb-5">
              <Search size={36} color="#d1d5db" strokeWidth={2} />
            </View>
            <Text className="text-xl font-extrabold text-gray-700 text-center mb-2">
              לא נמצאו תוצאות במאגר
            </Text>
            <Text className="text-sm font-semibold text-gray-400 text-center mb-6">
              נסה לחפש עם AI לקבל ערכים תזונתיים בזמן אמת
            </Text>
            <TouchableOpacity
              onPress={handleAiSearch}
              className="bg-[#800020] px-7 py-4 rounded-2xl flex-row-reverse items-center gap-2"
              style={{
                shadowColor: "#800020",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
              activeOpacity={0.8}
            >
              <Sparkles size={20} color="#fff" strokeWidth={2.5} />
              <Text className="text-white font-extrabold text-base">חפש עם AI</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Initial State */}
        {!searchQuery && !selectedFood && (
          <View className="px-5 py-12 items-center">
            <View className="w-24 h-24 rounded-3xl bg-[#800020]/10 items-center justify-center mb-5">
              <Search size={36} color="#800020" strokeWidth={2.5} />
            </View>
            <Text className="text-xl font-extrabold text-gray-700 text-center mb-2">
              חפש מזון במאגר או עם AI
            </Text>
            <Text className="text-sm font-semibold text-gray-400 text-center px-8 mb-5">
              חפש במאגר המידע שלנו או השתמש ב-AI לקבל ערכים תזונתיים של כל מזון בזמן אמת
            </Text>
            <View className="flex-row-reverse items-center gap-2 bg-[#800020]/10 px-5 py-3.5 rounded-2xl">
              <Sparkles size={18} color="#800020" strokeWidth={2.5} />
              <Text className="text-sm font-extrabold text-[#800020]">
                חיפוש חכם עם AI - ללא מגבלות!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </Modal>
  );
}
