import { Tabs } from "expo-router";
import { LayoutDashboard, ScanLine, MessageCircle, User } from "lucide-react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#800020",
                tabBarInactiveTintColor: "#737373",
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: "#E5E5E5",
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
    );
}
