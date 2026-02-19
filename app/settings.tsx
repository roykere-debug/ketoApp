import { View, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { useRouter } from "expo-router";
import { Settings, FileText, Lock, Info, ExternalLink, Mail } from "lucide-react-native";

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    card2: "#18181B",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    textDimmer: "#3A3A3C",
    green: "#10b981",
} as const;

function SettingSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {icon}
                <Text style={{ color: C.text, fontSize: 18, fontFamily: "Assistant_700Bold" }}>
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

function SettingLink({
    label,
    subtitle,
    onPress,
    icon,
}: {
    label: string;
    subtitle?: string;
    onPress: () => void;
    icon?: React.ReactNode;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
            }}
        >
            <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: C.text, fontSize: 15, fontFamily: "Assistant_400Regular", marginBottom: 2 }}>
                    {label}
                </Text>
                {subtitle && (
                    <Text style={{ color: C.textDim, fontSize: 12, fontFamily: "Assistant_400Regular" }}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {icon && <View style={{ marginLeft: 12 }}>{icon}</View>}
        </TouchableOpacity>
    );
}

export default function SettingsScreen() {
    const router = useRouter();

    const openPrivacyPolicy = async () => {
        // In production, you'd fetch from a URL or open an in-app modal
        // For now, show a message
        Alert.alert(
            "Privacy Policy",
            "View our Privacy Policy:\n\n" +
                "- Data collection practices\n" +
                "- How we use your information\n" +
                "- Your privacy rights\n" +
                "- Third-party services\n\n" +
                "Full text available at: myketo.app/privacy",
            [
                {
                    text: "Close",
                    style: "default",
                },
                {
                    text: "Open Website",
                    onPress: () => Linking.openURL("https://myketo.app/privacy"),
                },
            ]
        );
    };

    const openTermsOfService = async () => {
        Alert.alert(
            "Terms of Service",
            "Review our Terms of Service:\n\n" +
                "- Use license & restrictions\n" +
                "- Account responsibility\n" +
                "- Medical disclaimer\n" +
                "- Liability limitations\n" +
                "- Dispute resolution\n\n" +
                "Full text available at: myketo.app/terms",
            [
                {
                    text: "Close",
                    style: "default",
                },
                {
                    text: "Open Website",
                    onPress: () => Linking.openURL("https://myketo.app/terms"),
                },
            ]
        );
    };

    const openMedicalDisclaimer = () => {
        Alert.alert(
            "Medical Disclaimer",
            "⚠️ Important Health Information\n\n" +
                "MyKeto is NOT a substitute for professional medical advice. The app provides:\n\n" +
                "✓ General nutrition tracking\n" +
                "✓ Educational information about keto diet\n" +
                "✓ AI-powered meal analysis\n\n" +
                "❌ NOT medical diagnosis or treatment\n" +
                "❌ NOT a replacement for healthcare provider\n\n" +
                "Always consult a doctor before:\n" +
                "- Starting a new diet\n" +
                "- Making major dietary changes\n" +
                "- If you have medical conditions\n" +
                "- Taking medications\n\n" +
                "Use MyKeto at your own risk.",
            [{ text: "I Understand", style: "default" }]
        );
    };

    const contactSupport = () => {
        Linking.openURL("mailto:support@myketo.app?subject=MyKeto Support");
    };

    const aboutApp = () => {
        Alert.alert(
            "About MyKeto",
            "Version: 1.0.0\n\n" +
                "MyKeto is a keto diet tracking app powered by AI.\n\n" +
                "Features:\n" +
                "• Food scanner with AI analysis\n" +
                "• Macro tracking with real-time feedback\n" +
                "• AI health coach\n" +
                "• Recipe generation\n" +
                "• Keto score calculation\n\n" +
                "Built with React Native & Expo\n\n" +
                "© 2026 MyKeto. All rights reserved.",
            [{ text: "Close", style: "default" }]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ alignItems: "center", marginBottom: 28 }}>
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 18,
                            backgroundColor: `${C.maroon}20`,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: `${C.maroon}35`,
                        }}
                    >
                        <Settings size={28} color={C.maroon} />
                    </View>
                    <Text style={{ color: C.text, fontSize: 26, fontFamily: "Assistant_700Bold" }}>
                        הגדרות
                    </Text>
                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: "Assistant_400Regular", marginTop: 4 }}>
                        ניהול חשבון וההעדפות שלך
                    </Text>
                </View>

                {/* Legal */}
                <SettingSection title="משפטי" icon={<FileText size={20} color={C.maroon} />}>
                    <SettingLink
                        label="מדיניות פרטיות"
                        subtitle="כיצד אנו משתמשים בנתונים שלך"
                        onPress={openPrivacyPolicy}
                        icon={<ExternalLink size={16} color={C.textDim} />}
                    />
                    <SettingLink
                        label="תנאי השירות"
                        subtitle="כללי השימוש ביישום"
                        onPress={openTermsOfService}
                        icon={<ExternalLink size={16} color={C.textDim} />}
                    />
                </SettingSection>

                {/* Health & Safety */}
                <SettingSection title="בריאות וביטחון" icon={<Info size={20} color={C.green} />}>
                    <SettingLink
                        label="הצהרת ברור רפואי"
                        subtitle="⚠️ חשוב - קרא לפני השימוש"
                        onPress={openMedicalDisclaimer}
                        icon={<ExternalLink size={16} color={C.green} />}
                    />
                </SettingSection>

                {/* Support */}
                <SettingSection title="תמיכה" icon={<Mail size={20} color={C.maroon} />}>
                    <SettingLink
                        label="צור קשר עם התמיכה"
                        subtitle="יש לך שאלה או בעיה?"
                        onPress={contactSupport}
                        icon={<ExternalLink size={16} color={C.textDim} />}
                    />
                </SettingSection>

                {/* About */}
                <SettingSection title="אודות" icon={<Info size={20} color={C.textDim} />}>
                    <SettingLink
                        label="על MyKeto"
                        subtitle="Version 1.0.0"
                        onPress={aboutApp}
                        icon={<ExternalLink size={16} color={C.textDim} />}
                    />
                </SettingSection>

                {/* Footer */}
                <View
                    style={{
                        backgroundColor: C.card2,
                        borderRadius: 20,
                        padding: 18,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: C.border,
                        marginTop: 8,
                    }}
                >
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 12,
                            fontFamily: "Assistant_400Regular",
                            textAlign: "center",
                            lineHeight: 18,
                        }}
                    >
                        MyKeto © 2026. כל הזכויות שמורות.{"\n"}
                        בנוי עם React Native, Expo, ו-Google Gemini
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
