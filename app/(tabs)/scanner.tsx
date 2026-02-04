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
            <SafeAreaView className="flex-1 justify-center items-center p-6 bg-background">
                <Camera size={64} color="#800020" />
                <Text className="text-center mb-4 text-lg mt-4">אנו צריכים אישור למצלמה כדי לסרוק את האוכל</Text>
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
                    <Text className="text-white text-center text-xl font-bold bg-black/50 p-3 rounded-2xl self-center">
                        צלם את המנה שלך
                    </Text>
                    <View className="items-center mb-10">
                        <TouchableOpacity
                            onPress={handleScan}
                            className="w-20 h-20 bg-white rounded-full border-4 border-primary items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <View className="w-16 h-16 bg-primary rounded-full" />
                        </TouchableOpacity>
                        <Text className="text-white mt-3 text-sm">לחץ לצילום</Text>
                    </View>
                </SafeAreaView>
            </CameraView>

            <Modal visible={analyzing} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center">
                    <ActivityIndicator size="large" color="#800020" />
                    <Text className="text-white mt-4 font-bold text-lg">מנתח את המנה...</Text>
                    <Text className="text-white/70 mt-2 text-sm">זה יכול לקחת כמה שניות</Text>
                </View>
            </Modal>

            <Modal visible={!!result} animationType="slide" presentationStyle="pageSheet">
                {result && (
                    <SafeAreaView className="flex-1 bg-background">
                        <View className="flex-row-reverse justify-between items-center p-4 border-b border-border">
                            <Text className="text-xl font-bold">תוצאות הסריקה</Text>
                            <TouchableOpacity onPress={() => setResult(null)} className="p-2">
                                <X size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="flex-1 p-4">
                            {/* Keto Score - Big */}
                            <Card className={`p-6 mb-4 ${getScoreColor(result.ketoScore)}`}>
                                <View className="items-center">
                                    <Text className="text-white text-lg mb-2">ציון קיטו</Text>
                                    <Text className="text-white text-5xl font-bold">{result.ketoScore}</Text>
                                    <Text className="text-white/90 mt-2">{getScoreText(result.ketoScore)}</Text>
                                </View>
                            </Card>

                            {/* Food Info */}
                            <Card className="p-4 mb-4">
                                <Text className="text-2xl font-bold mb-1 text-right">{result.name}</Text>
                                <Text className="text-muted-foreground mb-4 text-right">{result.explanation}</Text>

                                <View className="flex-row-reverse justify-between py-3 border-t border-border">
                                    <Text className="font-bold">קלוריות</Text>
                                    <Text className="text-lg font-bold text-primary">{result.calories}</Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-3 border-t border-border">
                                    <Text className="font-bold">פחמימות</Text>
                                    <Text className={`text-lg font-bold ${result.carbs > 10 ? "text-red-500" : "text-green-500"}`}>
                                        {result.carbs}g
                                    </Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-3 border-t border-border">
                                    <Text className="font-bold">שומן</Text>
                                    <Text className="text-lg">{result.fat}g</Text>
                                </View>

                                <View className="flex-row-reverse justify-between py-3 border-t border-border">
                                    <Text className="font-bold">חלבון</Text>
                                    <Text className="text-lg">{result.protein}g</Text>
                                </View>
                            </Card>

                            <Button label="הוסף ליומן" onPress={handleAddMeal} className="mb-3" />
                            <Button label="צלם שוב" variant="outline" onPress={() => setResult(null)} />
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
        </View>
    );
}
