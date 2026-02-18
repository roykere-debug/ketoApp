import { useState } from "react";
import {
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

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
        else router.replace("/(tabs)");
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
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo / Header */}
                    <View className="items-center pt-14 pb-10 px-6">
                        <View
                            className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-5"
                            style={{
                                shadowColor: "#800020",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            <Text className="text-white text-4xl font-bold">K</Text>
                        </View>
                        <Text className="text-3xl font-bold text-primary mb-1">MyKeto</Text>
                        <Text className="text-gray-400 text-center text-sm font-semibold">
                            הדרך החכמה לתזונה קטוגנית
                        </Text>
                    </View>

                    {/* Segmented Control */}
                    <View className="mx-6 mb-8">
                        <View className="flex-row bg-gray-100 rounded-2xl p-1">
                            <TouchableOpacity
                                className={`flex-1 py-3 rounded-xl items-center ${mode === "login" ? "bg-white" : ""}`}
                                style={
                                    mode === "login"
                                        ? {
                                              shadowColor: "#000",
                                              shadowOffset: { width: 0, height: 2 },
                                              shadowOpacity: 0.08,
                                              shadowRadius: 8,
                                              elevation: 3,
                                          }
                                        : {}
                                }
                                onPress={() => setMode("login")}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`font-bold text-base ${
                                        mode === "login" ? "text-primary" : "text-gray-400"
                                    }`}
                                >
                                    התחברות
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`flex-1 py-3 rounded-xl items-center ${mode === "signup" ? "bg-white" : ""}`}
                                style={
                                    mode === "signup"
                                        ? {
                                              shadowColor: "#000",
                                              shadowOffset: { width: 0, height: 2 },
                                              shadowOpacity: 0.08,
                                              shadowRadius: 8,
                                              elevation: 3,
                                          }
                                        : {}
                                }
                                onPress={() => setMode("signup")}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`font-bold text-base ${
                                        mode === "signup" ? "text-primary" : "text-gray-400"
                                    }`}
                                >
                                    הרשמה
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form */}
                    <View className="mx-6 gap-4">
                        <View>
                            <Text className="mb-2 text-sm font-bold text-right text-gray-600">
                                כתובת אימייל
                            </Text>
                            <Input
                                onChangeText={setEmail}
                                value={email}
                                placeholder="email@example.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                textAlign="right"
                            />
                        </View>

                        <View>
                            <Text className="mb-2 text-sm font-bold text-right text-gray-600">
                                סיסמה
                            </Text>
                            <Input
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry
                                placeholder={mode === "signup" ? "לפחות 6 תווים" : "הסיסמה שלך"}
                                autoCapitalize="none"
                                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                                textAlign="right"
                            />
                        </View>

                        <Button
                            label={loading ? "טוען..." : mode === "login" ? "התחבר" : "צור חשבון"}
                            onPress={mode === "login" ? signInWithEmail : signUpWithEmail}
                            disabled={loading}
                            className="mt-2"
                        />

                        {mode === "login" && (
                            <TouchableOpacity
                                onPress={resetPassword}
                                className="items-center py-3"
                                activeOpacity={0.7}
                            >
                                <Text className="text-primary text-sm font-bold">שכחתי סיסמה</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
