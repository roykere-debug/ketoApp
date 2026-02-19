import { useState } from "react";
import {
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    card2: "#18181B",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    textDimmer: "#3A3A3C",
} as const;

type AuthMode = "login" | "signup";

export default function LoginScreen() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert("שגיאה", "אנא מלא את כל השדות");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert("שגיאה", error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!email || !password) {
            Alert.alert("שגיאה", "אנא מלא את כל השדות");
            return;
        }
        if (password.length < 6) {
            Alert.alert("שגיאה", "הסיסמה חייבת להכיל לפחות 6 תווים");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert("שגיאה", error.message);
        else Alert.alert("הצלחה!", "בדוק את תיבת הדואר שלך לאימות החשבון");
        setLoading(false);
    }

    async function resetPassword() {
        if (!email) {
            Alert.alert("שגיאה", "הכנס את כתובת האימייל שלך למעלה");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "myketoapp://reset-password",
        });
        if (error) Alert.alert("שגיאה", error.message);
        else Alert.alert("נשלח!", "בדוק את תיבת הדואר שלך לקישור לאיפוס סיסמה");
        setLoading(false);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            gap: 4,
                            paddingHorizontal: 20,
                            paddingTop: 8,
                        }}
                    >
                        <ChevronRight size={20} color={C.textDim} />
                        <Text style={{ color: C.textDim, fontSize: 14, fontFamily: "Assistant_400Regular" }}>
                            חזרה
                        </Text>
                    </TouchableOpacity>

                    {/* Logo / Header */}
                    <View style={{ alignItems: "center", paddingTop: 40, paddingBottom: 40, paddingHorizontal: 24 }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 24,
                                backgroundColor: `${C.maroon}20`,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: `${C.maroon}35`,
                                shadowColor: C.maroon,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.4,
                                shadowRadius: 24,
                                elevation: 10,
                            }}
                        >
                            <Text style={{ color: C.maroon, fontSize: 38, fontFamily: "Assistant_700Bold", lineHeight: 46 }}>
                                K
                            </Text>
                        </View>
                        <Text style={{ color: C.text, fontSize: 30, fontFamily: "Assistant_700Bold", marginBottom: 6 }}>
                            MyKeto
                        </Text>
                        <Text style={{ color: C.textDim, fontSize: 14, fontFamily: "Assistant_400Regular", textAlign: "center" }}>
                            הדרך החכמה לתזונה קטוגנית
                        </Text>
                    </View>

                    {/* Segmented Control */}
                    <View style={{ marginHorizontal: 24, marginBottom: 32 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: C.card,
                                borderRadius: 16,
                                padding: 4,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setMode("login")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    alignItems: "center",
                                    backgroundColor: mode === "login" ? C.maroon : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "Assistant_700Bold",
                                        fontSize: 15,
                                        color: mode === "login" ? "#fff" : C.textDim,
                                    }}
                                >
                                    התחברות
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode("signup")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    alignItems: "center",
                                    backgroundColor: mode === "signup" ? C.maroon : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "Assistant_700Bold",
                                        fontSize: 15,
                                        color: mode === "signup" ? "#fff" : C.textDim,
                                    }}
                                >
                                    הרשמה
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={{ marginHorizontal: 24, gap: 18 }}>
                        <View>
                            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: "Assistant_400Regular", textAlign: "right", marginBottom: 8 }}>
                                כתובת אימייל
                            </Text>
                            <TextInput
                                onChangeText={setEmail}
                                value={email}
                                placeholder="email@example.com"
                                placeholderTextColor={C.textDimmer}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                textAlign="right"
                                style={{
                                    height: 56,
                                    backgroundColor: C.card2,
                                    borderRadius: 16,
                                    paddingHorizontal: 18,
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_400Regular",
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            />
                        </View>

                        <View>
                            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: "Assistant_400Regular", textAlign: "right", marginBottom: 8 }}>
                                סיסמה
                            </Text>
                            <TextInput
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry
                                placeholder={mode === "signup" ? "לפחות 6 תווים" : "הסיסמה שלך"}
                                placeholderTextColor={C.textDimmer}
                                autoCapitalize="none"
                                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                                textAlign="right"
                                style={{
                                    height: 56,
                                    backgroundColor: C.card2,
                                    borderRadius: 16,
                                    paddingHorizontal: 18,
                                    color: C.text,
                                    fontSize: 16,
                                    fontFamily: "Assistant_400Regular",
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={mode === "login" ? signInWithEmail : signUpWithEmail}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: loading ? C.card2 : C.maroon,
                                borderRadius: 18,
                                paddingVertical: 18,
                                alignItems: "center",
                                marginTop: 8,
                                shadowColor: C.maroon,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: loading ? 0 : 0.4,
                                shadowRadius: 16,
                                elevation: loading ? 0 : 8,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={C.textDim} />
                            ) : (
                                <Text style={{ color: "#fff", fontSize: 17, fontFamily: "Assistant_700Bold" }}>
                                    {mode === "login" ? "התחבר" : "צור חשבון"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {mode === "login" && (
                            <TouchableOpacity
                                onPress={resetPassword}
                                activeOpacity={0.7}
                                style={{ alignItems: "center", paddingVertical: 12 }}
                            >
                                <Text style={{ color: C.maroon, fontSize: 14, fontFamily: "Assistant_700Bold" }}>
                                    שכחתי סיסמה
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
