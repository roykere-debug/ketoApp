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
  blue: "#3b82f6",
  orange: "#F97316",
} as const;

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
  const [searchMode, setSearchMode] = useState<"database" | "ai">("database");

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setSearchMode("database");
    const results = await searchFoodItems(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAiSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    setIsAiSearching(true);
    setSearchMode("ai");
    setSearchResults([]);
    const aiResult = await searchFoodNutrition(searchQuery);
    if (aiResult) {
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
    });
    setSelectedFood(null);
    setSearchQuery("");
    setQuantity("100");
    onClose();
  };

  const calculateKetoScore = (carbs: number, fat: number, protein: number) => {
    const totalCalories = carbs * 4 + fat * 9 + protein * 4;
    if (totalCalories === 0) return 5;
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
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "center",
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
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: C.card2,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <X size={22} color={C.textDim} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              color: C.text,
              fontSize: 20,
              fontFamily: "Assistant_700Bold",
            }}
          >
            הוסף מזון
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                backgroundColor: C.card2,
                borderRadius: 16,
                paddingHorizontal: 16,
                height: 52,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Search size={20} color={C.textDimmer} />
              <TextInput
                style={{
                  flex: 1,
                  textAlign: "right",
                  marginRight: 12,
                  fontSize: 15,
                  fontFamily: "Assistant_400Regular",
                  color: C.text,
                }}
                placeholder="חפש מזון..."
                placeholderTextColor={C.textDimmer}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>

            {/* AI Search Button */}
            <TouchableOpacity
              onPress={handleAiSearch}
              disabled={searchQuery.length < 2 || isAiSearching}
              activeOpacity={0.8}
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: searchQuery.length < 2 ? C.card2 : C.maroon,
                borderWidth: searchQuery.length < 2 ? 1 : 0,
                borderColor: C.border,
                shadowColor: searchQuery.length >= 2 ? C.maroon : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: searchQuery.length >= 2 ? 6 : 0,
              }}
            >
              {isAiSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Sparkles
                    size={18}
                    color={searchQuery.length < 2 ? C.textDimmer : "#fff"}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={{
                      fontFamily: "Assistant_700Bold",
                      fontSize: 15,
                      color: searchQuery.length < 2 ? C.textDimmer : "#fff",
                    }}
                  >
                    חפש עם AI
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Loading states */}
          {isSearching && (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={C.maroon} />
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 13,
                  fontFamily: "Assistant_400Regular",
                  marginTop: 12,
                }}
              >
                מחפש במאגר...
              </Text>
            </View>
          )}

          {isAiSearching && (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={C.maroon} />
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 13,
                  fontFamily: "Assistant_400Regular",
                  marginTop: 12,
                }}
              >
                AI מחפש ערכים תזונתיים...
              </Text>
            </View>
          )}

          {/* Search Results */}
          {!isSearching && searchResults.length > 0 && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 13,
                  fontFamily: "Assistant_700Bold",
                  textAlign: "right",
                  marginBottom: 16,
                }}
              >
                תוצאות חיפוש
              </Text>
              {searchResults.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => handleSelectFood(food)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: C.card,
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: C.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: C.text,
                          fontSize: 16,
                          fontFamily: "Assistant_700Bold",
                          textAlign: "right",
                          marginBottom: 4,
                        }}
                      >
                        {food.name_hebrew || food.name}
                      </Text>
                      <Text
                        style={{
                          color: C.textDim,
                          fontSize: 12,
                          fontFamily: "Assistant_400Regular",
                          textAlign: "right",
                        }}
                      >
                        {food.serving_size} · {food.category || "כללי"}
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        marginLeft: 16,
                        backgroundColor: C.card2,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: C.border,
                      }}
                    >
                      <Text
                        style={{
                          color: C.orange,
                          fontSize: 16,
                          fontFamily: "Assistant_700Bold",
                        }}
                      >
                        {food.calories}
                      </Text>
                      <Text
                        style={{
                          color: C.textDim,
                          fontSize: 10,
                          fontFamily: "Assistant_400Regular",
                        }}
                      >
                        קלוריות
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Food Details */}
          {selectedFood && (
            <View style={{ paddingHorizontal: 20 }}>
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
                {/* Header row */}
                <View
                  style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: C.text,
                          fontSize: 22,
                          fontFamily: "Assistant_700Bold",
                          textAlign: "right",
                        }}
                      >
                        {selectedFood.name_hebrew || selectedFood.name}
                      </Text>
                      {searchMode === "ai" && (
                        <View
                          style={{
                            backgroundColor: `${C.maroon}18`,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            gap: 4,
                            borderWidth: 1,
                            borderColor: `${C.maroon}30`,
                          }}
                        >
                          <Sparkles size={10} color={C.maroon} strokeWidth={2.5} />
                          <Text
                            style={{
                              color: C.maroon,
                              fontSize: 10,
                              fontFamily: "Assistant_700Bold",
                            }}
                          >
                            AI
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                      {selectedFood.category && (
                        <View
                          style={{
                            backgroundColor: `${C.maroon}18`,
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
                            {selectedFood.category}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          color: C.textDim,
                          fontSize: 13,
                          fontFamily: "Assistant_400Regular",
                        }}
                      >
                        {selectedFood.serving_size}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFood(null)}
                    activeOpacity={0.7}
                    style={{
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      backgroundColor: C.card2,
                      borderWidth: 1,
                      borderColor: C.border,
                      marginLeft: 12,
                    }}
                  >
                    <X size={18} color={C.textDim} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Nutritional Info */}
                <View
                  style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                  }}
                >
                  {[
                    { val: selectedFood.calories, label: "קלוריות", color: C.orange },
                    { val: `${selectedFood.carbs}g`, label: "פחמימות", color: C.amber },
                    { val: `${selectedFood.fat}g`, label: "שומן", color: C.green },
                    { val: `${selectedFood.protein}g`, label: "חלבון", color: C.blue },
                  ].map((item, i) => (
                    <View key={i} style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          color: item.color,
                          fontSize: 22,
                          fontFamily: "Assistant_700Bold",
                        }}
                      >
                        {item.val}
                      </Text>
                      <Text
                        style={{
                          color: C.textDim,
                          fontSize: 10,
                          fontFamily: "Assistant_400Regular",
                          marginTop: 4,
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Quantity Input */}
                <View>
                  <Text
                    style={{
                      color: C.text,
                      fontSize: 15,
                      fontFamily: "Assistant_700Bold",
                      textAlign: "right",
                      marginBottom: 12,
                    }}
                  >
                    כמות (גרם)
                  </Text>
                  <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        height: 52,
                        backgroundColor: C.card2,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        textAlign: "right",
                        fontSize: 18,
                        fontFamily: "Assistant_700Bold",
                        color: C.text,
                        borderWidth: 1,
                        borderColor: C.border,
                      }}
                      keyboardType="numeric"
                      value={quantity}
                      onChangeText={setQuantity}
                    />
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {["50", "100", "200"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => setQuantity(val)}
                          activeOpacity={0.7}
                          style={{
                            backgroundColor: quantity === val ? `${C.maroon}25` : C.card2,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: quantity === val ? `${C.maroon}40` : C.border,
                          }}
                        >
                          <Text
                            style={{
                              color: quantity === val ? C.text : C.textDim,
                              fontSize: 13,
                              fontFamily: "Assistant_700Bold",
                            }}
                          >
                            {val}g
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                onPress={handleAddMeal}
                activeOpacity={0.85}
                style={{
                  backgroundColor: C.maroon,
                  borderRadius: 20,
                  paddingVertical: 16,
                  alignItems: "center",
                  flexDirection: "row-reverse",
                  justifyContent: "center",
                  gap: 12,
                  shadowColor: C.maroon,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                <Plus size={20} color="#fff" strokeWidth={2.5} />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontFamily: "Assistant_700Bold",
                  }}
                >
                  הוסף לארוחות
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State - no results */}
          {!isSearching &&
            !isAiSearching &&
            searchQuery.length >= 2 &&
            searchResults.length === 0 &&
            !selectedFood && (
              <View style={{ paddingHorizontal: 20, paddingVertical: 48, alignItems: "center" }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    backgroundColor: C.card2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: C.border,
                  }}
                >
                  <Search size={32} color={C.textDimmer} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    color: C.text,
                    fontSize: 18,
                    fontFamily: "Assistant_700Bold",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  לא נמצאו תוצאות במאגר
                </Text>
                <Text
                  style={{
                    color: C.textDim,
                    fontSize: 13,
                    fontFamily: "Assistant_400Regular",
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  נסה לחפש עם AI לקבל ערכים תזונתיים בזמן אמת
                </Text>
                <TouchableOpacity
                  onPress={handleAiSearch}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: C.maroon,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 16,
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    gap: 8,
                    shadowColor: C.maroon,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Sparkles size={18} color="#fff" strokeWidth={2.5} />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      fontFamily: "Assistant_700Bold",
                    }}
                  >
                    חפש עם AI
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Initial State */}
          {!searchQuery && !selectedFood && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 48, alignItems: "center" }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: `${C.maroon}18`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: `${C.maroon}30`,
                }}
              >
                <Search size={32} color={C.maroon} strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  color: C.text,
                  fontSize: 18,
                  fontFamily: "Assistant_700Bold",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                חפש מזון במאגר או עם AI
              </Text>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 13,
                  fontFamily: "Assistant_400Regular",
                  textAlign: "center",
                  paddingHorizontal: 32,
                  lineHeight: 22,
                  marginBottom: 20,
                }}
              >
                חפש במאגר המידע שלנו או השתמש ב-AI לקבל ערכים תזונתיים של כל מזון בזמן אמת
              </Text>
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: `${C.maroon}18`,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: `${C.maroon}30`,
                }}
              >
                <Sparkles size={16} color={C.maroon} strokeWidth={2.5} />
                <Text
                  style={{
                    color: C.maroon,
                    fontSize: 13,
                    fontFamily: "Assistant_700Bold",
                  }}
                >
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
