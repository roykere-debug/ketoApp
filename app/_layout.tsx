import "../global.css";
import { Stack } from "expo-router";
import { useFonts, Assistant_400Regular, Assistant_700Bold } from "@expo-google-fonts/assistant";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

// Note: RTL is handled via CSS classes (flex-row-reverse, text-right, etc.)
// Using I18nManager.forceRTL(true) causes app reload loops

SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [loaded, error] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    headerTitleAlign: "center",
                    headerTintColor: "#800020",
                    headerBackTitle: "חזרה",
                    headerStyle: {
                        backgroundColor: "#FFFFFF",
                    },
                    headerTitleStyle: {
                        fontFamily: "Assistant_700Bold",
                        fontSize: 18,
                    },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: true,
                        title: "התחברות",
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="recipes"
                    options={{
                        headerShown: true,
                        title: "מה יש במקרר?",
                    }}
                />
            </Stack>
            <StatusBar style="dark" />
        </>
    );
}
