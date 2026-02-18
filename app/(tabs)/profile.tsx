import { View, Switch, ScrollView, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { TouchableOpacity } from "react-native";
import { useUserStore } from "../../store/userStore";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { User, Scale, Activity, LogOut, Save } from "lucide-react-native";

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
    red: "#ef4444",
} as const;

function DarkInput({
    value,
    onChangeText,
    placeholder,
    keyboardType,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={C.textDimmer}
            keyboardType={keyboardType ?? 'default'}
            style={{
                height: 52,
                backgroundColor: C.card2,
                borderRadius: 14,
                paddingHorizontal: 16,
                color: C.text,
                fontSize: 15,
                fontFamily: 'Assistant_400Regular',
                textAlign: 'right',
                borderWidth: 1,
                borderColor: C.border,
            }}
        />
    );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <View
            style={{
                backgroundColor: C.card,
                borderRadius: 24,
                padding: 22,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                {icon}
                <Text style={{ color: C.text, fontSize: 17, fontFamily: 'Assistant_700Bold' }}>
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', textAlign: 'right', marginBottom: 8, letterSpacing: 0.5 }}>
                {label}
            </Text>
            {children}
        </View>
    );
}

export default function ProfileScreen() {
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const syncFromSupabase = useUserStore((state) => state.syncFromSupabase);
    const reset = useUserStore((state) => state.reset);

    const [form, setForm] = useState(profile);

    useEffect(() => { syncFromSupabase(); }, []);
    useEffect(() => { setForm(profile); }, [profile]);

    const handleSave = () => {
        setProfile(form);
        Alert.alert("נשמר!", "הפרופיל עודכן בהצלחה");
    };

    async function signOut() {
        Alert.alert("התנתק", "האם אתה בטוח שברצונך להתנתק?", [
            { text: "ביטול", style: "cancel" },
            {
                text: "התנתק",
                style: "destructive",
                onPress: async () => {
                    await supabase.auth.signOut();
                    reset();
                },
            },
        ]);
    }

    const initials = profile.name
        ? profile.name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('')
        : '?';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 28 }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 24,
                            backgroundColor: `${C.maroon}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: `${C.maroon}35`,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.25,
                            shadowRadius: 20,
                        }}
                    >
                        <Text style={{ color: C.maroon, fontSize: 28, fontFamily: 'Assistant_700Bold' }}>
                            {initials}
                        </Text>
                    </View>
                    <Text style={{ color: C.text, fontSize: 22, fontFamily: 'Assistant_700Bold', marginBottom: 4 }}>
                        {profile.name || 'המשתמש שלי'}
                    </Text>
                    <Text style={{ color: C.textDim, fontSize: 13, fontFamily: 'Assistant_400Regular' }}>
                        פרופיל קיטו
                    </Text>
                </View>

                {/* Personal details */}
                <SectionCard
                    title="פרטים אישיים"
                    icon={<User size={18} color={C.maroon} />}
                >
                    <FieldRow label="שם מלא">
                        <DarkInput
                            value={form.name}
                            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
                            placeholder="ישראל ישראלי"
                        />
                    </FieldRow>

                    <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="גיל">
                                <DarkInput
                                    value={form.age}
                                    onChangeText={(t) => setForm((p) => ({ ...p, age: t }))}
                                    placeholder="30"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="מין">
                                <TouchableOpacity
                                    onPress={() => setForm((p) => ({ ...p, gender: p.gender === 'male' ? 'female' : 'male' }))}
                                    activeOpacity={0.7}
                                    style={{
                                        height: 52,
                                        backgroundColor: C.card2,
                                        borderRadius: 14,
                                        paddingHorizontal: 16,
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Text style={{ color: C.text, fontSize: 15, fontFamily: 'Assistant_400Regular' }}>
                                        {form.gender === 'male' ? 'זכר' : 'נקבה'}
                                    </Text>
                                </TouchableOpacity>
                            </FieldRow>
                        </View>
                    </View>
                </SectionCard>

                {/* Body metrics */}
                <SectionCard
                    title="מדדי גוף"
                    icon={<Scale size={18} color={C.maroon} />}
                >
                    <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="משקל (ק״ג)">
                                <DarkInput
                                    value={form.weight}
                                    onChangeText={(t) => setForm((p) => ({ ...p, weight: t }))}
                                    placeholder="75"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FieldRow label="גובה (ס״מ)">
                                <DarkInput
                                    value={form.height}
                                    onChangeText={(t) => setForm((p) => ({ ...p, height: t }))}
                                    placeholder="175"
                                    keyboardType="numeric"
                                />
                            </FieldRow>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: C.maroon,
                            borderRadius: 16,
                            paddingVertical: 16,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 12,
                            elevation: 6,
                        }}
                    >
                        <Save size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                            שמור ועדכן
                        </Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* Apple Health */}
                <View
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        padding: 22,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: C.border,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: `${C.green}18`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: `${C.green}25`,
                            }}
                        >
                            <Activity size={18} color={C.green} />
                        </View>
                        <View>
                            <Text style={{ color: C.text, fontSize: 15, fontFamily: 'Assistant_700Bold', textAlign: 'right' }}>
                                Apple Health
                            </Text>
                            <Text style={{ color: C.textDim, fontSize: 12, fontFamily: 'Assistant_400Regular', marginTop: 2 }}>
                                סנכרון צעדים ופעילות
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={false}
                        onValueChange={() => {}}
                        trackColor={{ false: C.card2, true: C.green }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Sign out */}
                <TouchableOpacity
                    onPress={signOut}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        paddingVertical: 18,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        borderWidth: 1,
                        borderColor: `${C.red}25`,
                    }}
                >
                    <LogOut size={18} color={C.red} />
                    <Text style={{ color: C.red, fontSize: 15, fontFamily: 'Assistant_700Bold' }}>
                        התנתק
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
