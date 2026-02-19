import { useState, useEffect } from "react";
import { View, Modal, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/Text";
import { useMealsStore, type Meal } from "../../store/mealsStore";
import { X, Save } from "lucide-react-native";

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

function calculateKetoScore(carbs: number, fat: number, protein: number) {
  const totalCalories = carbs * 4 + fat * 9 + protein * 4;
  if (totalCalories === 0) return 5;
  const fatPercentage = (fat * 9) / totalCalories;
  const carbPercentage = (carbs * 4) / totalCalories;
  if (carbPercentage < 0.05 && fatPercentage > 0.7) return 10;
  if (carbPercentage < 0.1 && fatPercentage > 0.6) return 8;
  if (carbPercentage < 0.15 && fatPercentage > 0.5) return 6;
  if (carbPercentage < 0.2) return 4;
  return 2;
}

interface EditMealModalProps {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
}

export default function EditMealModal({ visible, meal, onClose }: EditMealModalProps) {
  const updateMeal = useMealsStore((state) => state.updateMeal);

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setCalories(String(meal.calories));
      setCarbs(String(meal.carbs));
      setFat(String(meal.fat));
      setProtein(String(meal.protein));
    }
  }, [meal]);

  const handleSave = () => {
    if (!meal) return;
    const cal = parseInt(calories) || 0;
    const c = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    const p = parseInt(protein) || 0;
    const ketoScore = calculateKetoScore(c, f, p);

    updateMeal(meal.id, {
      name: name.trim() || meal.name,
      calories: cal,
      carbs: c,
      fat: f,
      protein: p,
      ketoScore,
    });
    onClose();
  };

  if (!meal) return null;

  const inputStyle = {
    height: 52,
    backgroundColor: C.card2,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: C.text,
    fontSize: 16,
    fontFamily: "Assistant_400Regular" as const,
    textAlign: "right" as const,
    borderWidth: 1,
    borderColor: C.border,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
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
          <Text style={{ color: C.text, fontSize: 20, fontFamily: "Assistant_700Bold" }}>
            עריכת ארוחה
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          <View>
            <Text
              style={{
                color: C.textDim,
                fontSize: 12,
                fontFamily: "Assistant_400Regular",
                textAlign: "right",
                marginBottom: 8,
              }}
            >
              שם הארוחה
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="שם"
              placeholderTextColor={C.textDimmer}
              style={inputStyle}
            />
          </View>

          <View>
            <Text
              style={{
                color: C.textDim,
                fontSize: 12,
                fontFamily: "Assistant_400Regular",
                textAlign: "right",
                marginBottom: 8,
              }}
            >
              קלוריות
            </Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
              placeholderTextColor={C.textDimmer}
              keyboardType="numeric"
              style={inputStyle}
            />
          </View>

          <View style={{ flexDirection: "row-reverse", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 12,
                  fontFamily: "Assistant_400Regular",
                  textAlign: "right",
                  marginBottom: 8,
                }}
              >
                פחמימות (g)
              </Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor={C.textDimmer}
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 12,
                  fontFamily: "Assistant_400Regular",
                  textAlign: "right",
                  marginBottom: 8,
                }}
              >
                שומן (g)
              </Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor={C.textDimmer}
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 12,
                  fontFamily: "Assistant_400Regular",
                  textAlign: "right",
                  marginBottom: 8,
                }}
              >
                חלבון (g)
              </Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor={C.textDimmer}
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.maroon,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 12,
              shadowColor: C.maroon,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Save size={20} color="#fff" strokeWidth={2.5} />
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Assistant_700Bold" }}>
              שמור שינויים
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
