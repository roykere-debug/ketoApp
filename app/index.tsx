import { View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
} as const;

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>

            {/* Logo */}
            <View
                style={{
                    width: 96,
                    height: 96,
                    borderRadius: 28,
                    backgroundColor: `${C.maroon}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 28,
                    borderWidth: 1,
                    borderColor: `${C.maroon}35`,
                    shadowColor: C.maroon,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 32,
                    elevation: 12,
                }}
            >
                <Text style={{ color: C.maroon, fontSize: 44, fontFamily: 'Assistant_700Bold', lineHeight: 52 }}>K</Text>
            </View>

            {/* Title */}
            <Text style={{ color: C.text, fontSize: 38, fontFamily: 'Assistant_700Bold', marginBottom: 12, letterSpacing: -0.5 }}>
                MyKeto
            </Text>
            <Text style={{ color: C.textDim, fontSize: 16, textAlign: 'center', fontFamily: 'Assistant_400Regular', lineHeight: 26, marginBottom: 56 }}>
                הדרך החכמה לתזונה קטוגנית{'\n'}עם עזרת בינה מלאכותית
            </Text>

            {/* CTAs */}
            <View style={{ width: '100%', gap: 12 }}>
                <Link href="/login" asChild>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: C.maroon,
                            borderRadius: 20,
                            paddingVertical: 18,
                            alignItems: 'center',
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.45,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 17, fontFamily: 'Assistant_700Bold' }}>
                            התחבר / הירשם
                        </Text>
                    </TouchableOpacity>
                </Link>

                <Link href="/(tabs)" asChild>
                    <TouchableOpacity
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
                        <Text style={{ color: C.textDim, fontSize: 16, fontFamily: 'Assistant_400Regular' }}>
                            המשך ללא חשבון
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>

        </SafeAreaView>
    );
}
