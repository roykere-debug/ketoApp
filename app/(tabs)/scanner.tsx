import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { View, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { analyzeImage, FoodAnalysis } from '../../services/ai';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealsStore } from '../../store/mealsStore';
import { useRouter } from 'expo-router';
import { Camera, X } from 'lucide-react-native';

export default function ScannerScreen() {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<FoodAnalysis | null>(null);
    const addMeal = useMealsStore((state) => state.addMeal);
    const router = useRouter();

    if (!permission) {
        return <View className="flex-1 bg-background" />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center p-6 bg-[#F8F9FA]">
                <View className="w-28 h-28 rounded-3xl bg-[#800020]/10 items-center justify-center mb-6">
                    <Camera size={64} color="#800020" strokeWidth={2} />
                </View>
                <Text className="text-center mb-2 text-2xl font-extrabold">נדרשת הרשאת מצלמה</Text>
                <Text className="text-center mb-8 text-base font-semibold text-gray-400">אנו צריכים אישור למצלמה כדי לסרוק את האוכל</Text>
                <Button label="אפשר גישה למצלמה" onPress={requestPermission} />
            </SafeAreaView>
        );
    }

    const handleScan = async () => {
        if (!cameraRef.current) return;

        try {
            setAnalyzing(true);
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.5,
            });

            if (photo?.base64) {
                const data = await analyzeImage(photo.base64);
                setResult(data);
            }
        } catch (e) {
            Alert.alert("שגיאה", "לא הצלחנו לנתח את התמונה. נסה שוב.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddMeal = () => {
        if (result) {
            addMeal({
                name: result.name,
                calories: result.calories,
                protein: result.protein,
                fat: result.fat,
                carbs: result.carbs,
                ketoScore: result.ketoScore,
            });
            setResult(null);
            Alert.alert("נוסף!", `${result.name} נוסף ליומן שלך`, [
                { text: "מעולה", onPress: () => router.push("/(tabs)") }
            ]);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return "bg-green-500";
        if (score >= 5) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getScoreText = (score: number) => {
        if (score >= 8) return "מעולה לקיטו! 🔥";
        if (score >= 5) return "בסדר, אבל שים לב לכמות";
        return "לא מומלץ לקיטו";
    };

    return (
        <View className="flex-1 bg-black">
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing="back"
            >
                <SafeAreaView className="flex-1 justify-between p-6">
                    <Text className="text-white text-center text-xl font-extrabold bg-black/60 px-6 py-4 rounded-3xl self-center">
                        צלם את המנה שלך
                    </Text>
                    <View className="items-center mb-10">
                        <TouchableOpacity
                            onPress={handleScan}
                            className="w-24 h-24 bg-white rounded-full border-4 border-primary items-center justify-center"
                            activeOpacity={0.8}
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                        >
                            <View className="w-20 h-20 bg-primary rounded-full" />
                        </TouchableOpacity>
                        <Text className="text-white mt-4 text-base font-bold">לחץ לצילום</Text>
                    </View>
                </SafeAreaView>
            </CameraView>

            <Modal visible={analyzing} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center px-8">
                    <View 
                        className="bg-white rounded-3xl p-8 items-center w-full max-w-xs"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 10,
                        }}
                    >
                        <ActivityIndicator size="large" color="#800020" />
                        <Text className="mt-5 font-extrabold text-xl text-center">מנתח את המנה...</Text>
                        <Text className="text-gray-400 mt-2 text-sm font-semibold text-center">זה יכול לקחת כמה שניות</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={!!result} animationType="slide" presentationStyle="pageSheet">
                {result && (
                    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
                        <View className="flex-row-reverse justify-between items-center px-5 py-4">
                            <Text className="text-2xl font-extrabold">תוצאות הסריקה</Text>
                            <TouchableOpacity 
                                onPress={() => setResult(null)} 
                                className="w-12 h-12 items-center justify-center rounded-2xl bg-gray-100"
                                activeOpacity={0.7}
                            >
                                <X size={24} color="#666" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView 
                            className="flex-1 px-5"
                            contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Keto Score - Big */}
                            <Card className={`p-8 mb-5 ${getScoreColor(result.ketoScore)}`}>
                                <View className="items-center">
                                    <Text className="text-white text-base font-extrabold mb-3">ציון קיטו</Text>
                                    <Text className="text-white text-7xl font-extrabold">{result.ketoScore}</Text>
                                    <Text className="text-white/95 mt-4 text-base font-bold">{getScoreText(result.ketoScore)}</Text>
                                </View>
                            </Card>

                            {/* Food Info */}
                            <Card className="p-6 mb-5">
                                <Text className="text-3xl font-extrabold mb-2 text-right leading-9">{result.name}</Text>
                                <Text className="text-gray-500 font-semibold mb-5 text-right text-base leading-6">{result.explanation}</Text>

                                <View className="flex-row-reverse justify-between py-4 border-t border-gray-100">
                                    <Text className="font-extrabold text-base">קלוריות</Text>
                                    <Text className="text-xl font-extrabold text-primary">{result.calories}</Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-4 border-t border-gray-100">
                                    <Text className="font-extrabold text-base">פחמימות</Text>
                                    <Text className={`text-xl font-extrabold ${result.carbs > 10 ? "text-red-500" : "text-green-500"}`}>
                                        {result.carbs}g
                                    </Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-4 border-t border-gray-100">
                                    <Text className="font-extrabold text-base">שומן</Text>
                                    <Text className="text-xl font-extrabold">{result.fat}g</Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-4 border-t border-gray-100">
                                    <Text className="font-extrabold text-base">חלבון</Text>
                                    <Text className="text-xl font-extrabold">{result.protein}g</Text>
                                </View>
                            </Card>

                            <Button label="הוסף ליומן" onPress={handleAddMeal} className="mb-4" />
                            <Button label="צלם שוב" variant="outline" onPress={() => setResult(null)} />
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
        </View>
    );
}
