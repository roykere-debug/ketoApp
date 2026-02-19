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
        (async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error?.message?.includes('Refresh Token')) {
                    await supabase.auth.signOut({ scope: 'local' });
                    setSession(null);
                    return;
                }
                setSession(data.session ?? null);
            } catch (err: unknown) {
                const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : '';
                if (msg.includes('Refresh Token') || msg.includes('refresh_token')) {
                    await supabase.auth.signOut({ scope: 'local' });
                }
                setSession(null);
            }
        })();
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
        const inAppScreen = ["recipes", "settings", "history"].includes(segments[0] as string);

        if (session && !hasOnboarded && !inOnboarding) {
            router.replace("/onboarding");
        } else if (session && hasOnboarded && !inTabsGroup && !inAppScreen) {
            router.replace("/(tabs)");
        } else if (!session && (inTabsGroup || inAppScreen)) {
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
                        headerShown: false,
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
