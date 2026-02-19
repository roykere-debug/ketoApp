import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/ui/Text';
import { analyzeImage, FoodAnalysis } from '../../services/ai';
import { searchByBarcode, lookupBarcodeExternal, addCustomFoodItem, type FoodItem } from '../../services/foods';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealsStore } from '../../store/mealsStore';
import { useRouter } from 'expo-router';
import { Camera, X, Plus, ScanBarcode } from 'lucide-react-native';

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    card2: "#18181B",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
    blue: "#3b82f6",
    orange: "#F97316",
} as const;

function scoreColor(s: number) {
    if (s >= 8) return C.green;
    if (s >= 5) return C.amber;
    return C.red;
}

function scoreLabel(s: number) {
    if (s >= 8) return "מעולה לקיטו! 🔥";
    if (s >= 5) return "בסדר, שים לב לכמות";
    return "לא מומלץ לקיטו";
}

function ScanCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
    const W = 32;
    const T = 4;
    const isTop = position.startsWith('t');
    const isLeft = position.endsWith('l');

    return (
        <View
            style={{
                position: 'absolute',
                width: W,
                height: W,
                ...(isTop ? { top: 0 } : { bottom: 0 }),
                ...(isLeft ? { left: 0 } : { right: 0 }),
            }}
        >
            <View
                style={{
                    position: 'absolute',
                    height: T,
                    width: W,
                    backgroundColor: C.maroon,
                    ...(isTop ? { top: 0 } : { bottom: 0 }),
                    shadowColor: C.maroon,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 8,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    width: T,
                    height: W,
                    backgroundColor: C.maroon,
                    ...(isLeft ? { left: 0 } : { right: 0 }),
                    shadowColor: C.maroon,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 8,
                }}
            />
        </View>
    );
}

type ScanMode = 'camera' | 'barcode';

type BarcodeResult = {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingSize: string;
    brand: string | null;
    barcode: string;
    fromDb: boolean;
};

export default function ScannerScreen() {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<FoodAnalysis | null>(null);
    const [scanMode, setScanMode] = useState<ScanMode>('camera');
    const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
    const [barcodeProcessing, setBarcodeProcessing] = useState(false);
    const lastScannedBarcode = useRef<string>('');
    const addMeal = useMealsStore((state) => state.addMeal);
    const router = useRouter();

    const handleBarcodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
        if (barcodeProcessing || data === lastScannedBarcode.current) return;
        lastScannedBarcode.current = data;
        setBarcodeProcessing(true);

        try {
            let item: FoodItem | null = await searchByBarcode(data);
            let fromDb = true;

            if (!item) {
                fromDb = false;
                item = await lookupBarcodeExternal(data);
            }

            if (item) {
                setBarcodeResult({
                    name: item.name_hebrew || item.name,
                    calories: item.calories,
                    protein: item.protein,
                    fat: item.fat,
                    carbs: item.carbs,
                    servingSize: item.serving_size,
                    brand: item.brand,
                    barcode: data,
                    fromDb,
                });

                if (!fromDb) {
                    addCustomFoodItem({
                        name: item.name,
                        name_hebrew: item.name_hebrew,
                        calories: item.calories,
                        protein: item.protein,
                        fat: item.fat,
                        carbs: item.carbs,
                        fiber: item.fiber,
                        sugar: item.sugar,
                        serving_size: item.serving_size,
                        category: item.category,
                        brand: item.brand,
                        barcode: data,
                    });
                }
            } else {
                Alert.alert("לא נמצא", "המוצר לא נמצא במאגר. נסה לצלם את המנה במצב מצלמה.", [
                    { text: "עבור למצלמה", onPress: () => setScanMode('camera') },
                    { text: "סגור" },
                ]);
            }
        } catch {
            Alert.alert("שגיאה", "לא הצלחנו לחפש את הברקוד. נסה שוב.");
        } finally {
            setBarcodeProcessing(false);
        }
    }, [barcodeProcessing]);

    const handleAddBarcodeItem = () => {
        if (barcodeResult) {
            const ketoScore = barcodeResult.carbs <= 5 ? 9 : barcodeResult.carbs <= 10 ? 7 : barcodeResult.carbs <= 20 ? 5 : 3;
            addMeal({
                name: barcodeResult.name,
                calories: barcodeResult.calories,
                protein: barcodeResult.protein,
                fat: barcodeResult.fat,
                carbs: barcodeResult.carbs,
                ketoScore,
            });
            setBarcodeResult(null);
            lastScannedBarcode.current = '';
            Alert.alert("נוסף!", `${barcodeResult.name} נוסף ליומן שלך`, [
                { text: "מעולה", onPress: () => router.push("/(tabs)") },
            ]);
        }
    };

    if (!permission) {
        return <View style={{ flex: 1, backgroundColor: C.bg }} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <View
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 24,
                        backgroundColor: `${C.maroon}18`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 28,
                        borderWidth: 1,
                        borderColor: `${C.maroon}30`,
                        shadowColor: C.maroon,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                    }}
                >
                    <Camera size={48} color={C.maroon} strokeWidth={1.5} />
                </View>
                <Text style={{ color: C.text, fontSize: 22, fontFamily: 'Assistant_700Bold', textAlign: 'center', marginBottom: 12 }}>
                    נדרשת הרשאת מצלמה
                </Text>
                <Text style={{ color: C.textDim, fontSize: 14, textAlign: 'center', fontFamily: 'Assistant_400Regular', lineHeight: 22, marginBottom: 36 }}>
                    אנו צריכים אישור למצלמה כדי לסרוק את האוכל ולנתח את הערכים התזונתיים
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: C.maroon,
                        paddingHorizontal: 40,
                        paddingVertical: 16,
                        borderRadius: 20,
                        shadowColor: C.maroon,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                        אפשר גישה למצלמה
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleScan = async () => {
        if (!cameraRef.current) return;
        try {
            setAnalyzing(true);
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
            if (photo?.base64) {
                const data = await analyzeImage(photo.base64);
                setResult(data);
            }
        } catch {
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
                { text: "מעולה", onPress: () => router.push("/(tabs)") },
            ]);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={scanMode === 'barcode' ? {
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                } : undefined}
                onBarcodeScanned={scanMode === 'barcode' ? handleBarcodeScanned : undefined}
            >
                <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
                    {/* Top: label + mode toggle */}
                    <View style={{ alignItems: 'center', paddingTop: 16, gap: 12 }}>
                        <View
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.65)',
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                                {scanMode === 'camera' ? 'כוון את המצלמה לאוכל' : 'כוון את המצלמה לברקוד'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => { setScanMode('camera'); lastScannedBarcode.current = ''; }}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: scanMode === 'camera' ? 'rgba(128,0,32,0.7)' : 'rgba(0,0,0,0.5)',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: scanMode === 'camera' ? 'rgba(128,0,32,0.8)' : 'rgba(255,255,255,0.15)',
                                }}
                            >
                                <Camera size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Assistant_700Bold' }}>מצלמה</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setScanMode('barcode'); lastScannedBarcode.current = ''; }}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: scanMode === 'barcode' ? 'rgba(128,0,32,0.7)' : 'rgba(0,0,0,0.5)',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: scanMode === 'barcode' ? 'rgba(128,0,32,0.8)' : 'rgba(255,255,255,0.15)',
                                }}
                            >
                                <ScanBarcode size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Assistant_700Bold' }}>ברקוד</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Scan frame */}
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 220, height: scanMode === 'barcode' ? 120 : 220, position: 'relative' }}>
                            <ScanCorner position="tl" />
                            <ScanCorner position="tr" />
                            <ScanCorner position="bl" />
                            <ScanCorner position="br" />
                        </View>
                    </View>

                    {/* Shutter (camera mode) or loading (barcode mode) */}
                    <View style={{ alignItems: 'center', paddingBottom: 48 }}>
                        {scanMode === 'camera' ? (
                            <>
                                <TouchableOpacity
                                    onPress={handleScan}
                                    activeOpacity={0.8}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        borderWidth: 4,
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 28,
                                            backgroundColor: '#fff',
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 10,
                                        }}
                                    />
                                </TouchableOpacity>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 16, fontFamily: 'Assistant_400Regular' }}>
                                    לחץ לצילום
                                </Text>
                            </>
                        ) : (
                            <>
                                {barcodeProcessing && (
                                    <ActivityIndicator size="large" color={C.maroon} />
                                )}
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 16, fontFamily: 'Assistant_400Regular' }}>
                                    {barcodeProcessing ? 'מחפש מוצר...' : 'כוון את הברקוד למסגרת'}
                                </Text>
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </CameraView>

            {/* Analyzing overlay */}
            <Modal visible={analyzing} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                    <View
                        style={{
                            backgroundColor: C.card,
                            borderRadius: 24,
                            padding: 36,
                            alignItems: 'center',
                            width: '100%',
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <ActivityIndicator size="large" color={C.maroon} />
                        <Text style={{ color: C.text, fontSize: 18, fontFamily: 'Assistant_700Bold', marginTop: 20, textAlign: 'center' }}>
                            מנתח את המנה...
                        </Text>
                        <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular', marginTop: 8, textAlign: 'center' }}>
                            זה יכול לקחת כמה שניות
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Results modal */}
            <Modal visible={!!result} animationType="slide" presentationStyle="pageSheet">
                {result && (
                    <View style={{ flex: 1, backgroundColor: C.bg }}>
                        <SafeAreaView style={{ flex: 1 }}>
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
                                <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold' }}>
                                    תוצאות הסריקה
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setResult(null)}
                                    activeOpacity={0.7}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: C.card2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <X size={20} color={C.textDim} strokeWidth={2} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Score card */}
                                <View
                                    style={{
                                        backgroundColor: C.card,
                                        borderRadius: 24,
                                        padding: 28,
                                        alignItems: 'center',
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: `${scoreColor(result.ketoScore)}30`,
                                        shadowColor: scoreColor(result.ketoScore),
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 20,
                                    }}
                                >
                                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular', marginBottom: 16 }}>
                                        ציון קיטו
                                    </Text>
                                    <View
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 60,
                                            borderWidth: 5,
                                            borderColor: scoreColor(result.ketoScore),
                                            backgroundColor: `${scoreColor(result.ketoScore)}12`,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: scoreColor(result.ketoScore),
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.45,
                                            shadowRadius: 20,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <Text style={{ color: scoreColor(result.ketoScore), fontSize: 48, fontFamily: 'Assistant_700Bold', lineHeight: 54 }}>
                                            {result.ketoScore}
                                        </Text>
                                        <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular' }}>/ 10</Text>
                                    </View>
                                    <Text style={{ color: scoreColor(result.ketoScore), fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                                        {scoreLabel(result.ketoScore)}
                                    </Text>
                                </View>

                                {/* Food info */}
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
                                    <Text style={{ color: C.text, fontSize: 24, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 12 }}>
                                        {result.name}
                                    </Text>
                                    <Text style={{ color: C.textDim, fontSize: 14, fontFamily: 'Assistant_400Regular', textAlign: 'right', lineHeight: 22, marginBottom: 20 }}>
                                        {result.explanation}
                                    </Text>

                                    {[
                                        { label: 'קלוריות', value: `${result.calories}`, color: C.orange },
                                        { label: 'פחמימות', value: `${result.carbs}g`, color: result.carbs > 10 ? C.red : C.green },
                                        { label: 'שומן', value: `${result.fat}g`, color: C.green },
                                        { label: 'חלבון', value: `${result.protein}g`, color: C.blue },
                                    ].map((row, i) => (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row-reverse',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingVertical: 16,
                                                borderTopWidth: i === 0 ? 1 : 0,
                                                borderBottomWidth: 1,
                                                borderColor: C.border,
                                            }}
                                        >
                                            <Text style={{ color: C.textDim, fontSize: 15, fontFamily: 'Assistant_400Regular' }}>
                                                {row.label}
                                            </Text>
                                            <Text style={{ color: row.color, fontSize: 18, fontFamily: 'Assistant_700Bold' }}>
                                                {row.value}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Actions */}
                                <TouchableOpacity
                                    onPress={handleAddMeal}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: C.maroon,
                                        borderRadius: 20,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                        marginBottom: 12,
                                        shadowColor: C.maroon,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 14,
                                        elevation: 8,
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        gap: 12,
                                    }}
                                >
                                    <Plus size={20} color="#fff" strokeWidth={2.5} />
                                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                                        הוסף ליומן
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setResult(null)}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: C.card,
                                        borderRadius: 20,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Text style={{ color: C.textDim, fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                                        צלם שוב
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )}
            </Modal>

            {/* Barcode result modal */}
            <Modal visible={!!barcodeResult} animationType="slide" presentationStyle="pageSheet">
                {barcodeResult && (
                    <View style={{ flex: 1, backgroundColor: C.bg }}>
                        <SafeAreaView style={{ flex: 1 }}>
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
                                <Text style={{ color: C.text, fontSize: 20, fontFamily: 'Assistant_700Bold' }}>
                                    מוצר נמצא
                                </Text>
                                <TouchableOpacity
                                    onPress={() => { setBarcodeResult(null); lastScannedBarcode.current = ''; }}
                                    activeOpacity={0.7}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: C.card2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <X size={20} color={C.textDim} strokeWidth={2} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                                showsVerticalScrollIndicator={false}
                            >
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
                                    <Text style={{ color: C.text, fontSize: 24, fontFamily: 'Assistant_700Bold', textAlign: 'right', marginBottom: 8 }}>
                                        {barcodeResult.name}
                                    </Text>
                                    {barcodeResult.brand && (
                                        <Text style={{ color: C.textDim, fontSize: 14, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 4 }}>
                                            {barcodeResult.brand}
                                        </Text>
                                    )}
                                    <Text style={{ color: C.textDimmer, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 20 }}>
                                        {barcodeResult.servingSize} · {barcodeResult.barcode}
                                    </Text>

                                    {[
                                        { label: 'קלוריות', value: `${barcodeResult.calories}`, color: C.orange },
                                        { label: 'פחמימות', value: `${barcodeResult.carbs}g`, color: barcodeResult.carbs > 10 ? C.red : C.green },
                                        { label: 'שומן', value: `${barcodeResult.fat}g`, color: C.green },
                                        { label: 'חלבון', value: `${barcodeResult.protein}g`, color: C.blue },
                                    ].map((row, i) => (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row-reverse',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingVertical: 16,
                                                borderTopWidth: i === 0 ? 1 : 0,
                                                borderBottomWidth: 1,
                                                borderColor: C.border,
                                            }}
                                        >
                                            <Text style={{ color: C.textDim, fontSize: 15, fontFamily: 'Assistant_400Regular' }}>
                                                {row.label}
                                            </Text>
                                            <Text style={{ color: row.color, fontSize: 18, fontFamily: 'Assistant_700Bold' }}>
                                                {row.value}
                                            </Text>
                                        </View>
                                    ))}

                                    {!barcodeResult.fromDb && (
                                        <View style={{
                                            marginTop: 16,
                                            backgroundColor: `${C.amber}15`,
                                            borderRadius: 12,
                                            padding: 12,
                                            borderWidth: 1,
                                            borderColor: `${C.amber}25`,
                                        }}>
                                            <Text style={{ color: C.amber, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right' }}>
                                                הנתונים מ-Open Food Facts (ל-100 גרם). המוצר נשמר למאגר המקומי.
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={handleAddBarcodeItem}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: C.maroon,
                                        borderRadius: 20,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                        marginBottom: 12,
                                        shadowColor: C.maroon,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 14,
                                        elevation: 8,
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        gap: 12,
                                    }}
                                >
                                    <Plus size={20} color="#fff" strokeWidth={2.5} />
                                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                                        הוסף ליומן
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => { setBarcodeResult(null); lastScannedBarcode.current = ''; }}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: C.card,
                                        borderRadius: 20,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Text style={{ color: C.textDim, fontSize: 16, fontFamily: 'Assistant_700Bold' }}>
                                        סרוק שוב
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )}
            </Modal>
        </View>
    );
}
