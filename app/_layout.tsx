import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts, Assistant_400Regular, Assistant_700Bold } from "@expo-google-fonts/assistant";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/userStore";

// Note: RTL is handled via CSS classes (flex-row-reverse, text-right, etc.)
// Using I18nManager.forceRTL(true) causes app reload loops

SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [loaded, error] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });

    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const hasOnboarded = useUserStore((s) => s.hasOnboarded);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if ((!loaded && !error) || session === undefined) return;

        SplashScreen.hideAsync();

        const inTabsGroup = segments[0] === "(tabs)";
        const inOnboarding = segments[0] === "onboarding";

        if (session && !hasOnboarded && !inOnboarding) {
            router.replace("/onboarding");
        } else if (session && hasOnboarded && !inTabsGroup) {
            router.replace("/(tabs)");
        } else if (!session && inTabsGroup) {
            router.replace("/login");
        }
    }, [loaded, error, session, segments, hasOnboarded]);

    if ((!loaded && !error) || session === undefined) {
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
                    name="onboarding"
                    options={{
                        headerShown: false,
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: false,
                        presentation: "card",
                    }}
                />
                <Stack.Screen
                    name="recipes"
                    options={{
                        headerShown: true,
                        title: "מה יש במקרר?",
                    }}
                />
                <Stack.Screen
                    name="settings"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="history"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
            <StatusBar style="dark" />
        </>
    );
}
