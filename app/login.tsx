import { useState } from "react";
import { View, Alert } from "react-native";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert("שגיאה", error.message);
        else router.replace("/(tabs)/profile");
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert("שגיאה", error.message);
        else Alert.alert("הצלחה", "בדוק את תיבת הדואר שלך לאימות!");
        setLoading(false);
    }

    async function resetPassword() {
        if (!email) {
            Alert.alert("שגיאה", "אנא הכנס כתובת אימייל");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'myketoapp://reset-password',
        });

        if (error) {
            Alert.alert("שגיאה", error.message);
        } else {
            Alert.alert(
                "נשלח!",
                "בדוק את תיבת הדואר שלך לקישור לאיפוס סיסמה"
            );
        }
        setLoading(false);
    }

    return (
        <View className="flex-1 justify-center p-4 bg-background">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-center text-primary mb-2">MyKeto</Text>
                <Text className="text-center text-muted-foreground">התחבר כדי לשמור את הנתונים שלך</Text>
            </View>

            <View className="gap-4">
                <View>
                    <Text className="mb-2 text-sm font-medium text-right">אימייל</Text>
                    <Input
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textAlign="right"
                    />
                </View>
                <View>
                    <Text className="mb-2 text-sm font-medium text-right">סיסמה</Text>
                    <Input
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="סיסמה"
                        autoCapitalize="none"
                        textAlign="right"
                    />
                </View>

                <View className="gap-2 mt-4">
                    <Button
                        label={loading ? "טוען..." : "התחבר"}
                        onPress={signInWithEmail}
                        disabled={loading}
                    />
                    <Button
                        label="הרשמה"
                        variant="outline"
                        onPress={signUpWithEmail}
                        disabled={loading}
                    />
                    <Button
                        label="שכחתי סיסמה"
                        variant="ghost"
                        onPress={resetPassword}
                        disabled={loading}
                    />
                </View>
            </View>
        </View>
    );
}
