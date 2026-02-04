import { View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";

export default function WelcomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
            <View className="items-center space-y-4">
                <Text className="text-4xl font-bold text-primary mb-2">MyKeto</Text>
                <Text className="text-lg text-foreground text-center mb-8">
                    האפליקציה שתלווה אותך בדרך לקיטו
                </Text>

                <Link href="/(tabs)" asChild>
                    <TouchableOpacity className="bg-primary px-8 py-3 rounded-full mb-4">
                        <Text className="text-white text-lg font-bold">התחל</Text>
                    </TouchableOpacity>
                </Link>

                <Link href="/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">יש לך חשבון? התחבר</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}
