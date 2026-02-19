import { Tabs } from "expo-router";
import { LayoutDashboard, ScanLine, MessageCircle, User } from "lucide-react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function TabLayout() {
    return (
        <ErrorBoundary>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#800020",
                    tabBarInactiveTintColor: "#8E8E93",
                    tabBarStyle: {
                        backgroundColor: "#0A0A0C",
                        borderTopWidth: 1,
                        borderTopColor: "#28282C",
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontFamily: "Assistant_400Regular",
                        fontSize: 12,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "בית",
                        tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="scanner"
                    options={{
                        title: "סורק",
                        tabBarIcon: ({ color }) => <ScanLine size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="coach"
                    options={{
                        title: "מאמן",
                        tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "פרופיל",
                        tabBarIcon: ({ color }) => <User size={24} color={color} />,
                    }}
                />
            </Tabs>
        </ErrorBoundary>
    );
}
