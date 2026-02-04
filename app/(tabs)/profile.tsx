import { View, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useUserStore } from "../../store/userStore";
import { useState, useEffect } from "react";

export default function ProfileScreen() {
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const syncFromSupabase = useUserStore((state) => state.syncFromSupabase);

    // Local state for form
    const [form, setForm] = useState(profile);

    // Sync from Supabase when screen loads
    useEffect(() => {
        syncFromSupabase();
    }, []);

    // Sync when store loads (hydration)
    useEffect(() => {
        setForm(profile);
    }, [profile]);

    const handleSave = () => {
        setProfile(form);
        alert("הפרופיל עודכן בהצלחה!");
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerClassName="p-4 gap-4">
                <View className="mb-2">
                    <Text className="text-3xl font-bold text-primary text-right">פרופיל</Text>
                    <Text className="text-muted-foreground text-right">נהל את הנתונים האישיים שלך</Text>
                </View>

                <Card className="p-4 gap-4">
                    <Text className="text-lg font-bold text-right">פרטים אישיים</Text>

                    <View>
                        <Text className="mb-2 text-sm font-medium text-right">שם מלא</Text>
                        <Input
                            value={form.name}
                            onChangeText={(t) => setForm(p => ({ ...p, name: t }))}
                            placeholder="ישראל ישראלי"
                            textAlign="right"
                        />
                    </View>

                    <View className="flex-row-reverse gap-4">
                        <View className="flex-1">
                            <Text className="mb-2 text-sm font-medium text-right">גיל</Text>
                            <Input
                                value={form.age}
                                onChangeText={(t) => setForm(p => ({ ...p, age: t }))}
                                placeholder="30"
                                keyboardType="numeric"
                                textAlign="right"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-2 text-sm font-medium text-right">מין</Text>
                            <Input
                                value={form.gender === 'male' ? 'זכר' : 'נקבה'}
                                onChangeText={() => setForm(p => ({ ...p, gender: p.gender === 'male' ? 'female' : 'male' }))}
                                placeholder="זכר/נקבה"
                                textAlign="right"
                            />
                        </View>
                    </View>
                </Card>

                <Card className="p-4 gap-4">
                    <Text className="text-lg font-bold text-right">מדדי גוף</Text>

                    <View className="flex-row-reverse gap-4">
                        <View className="flex-1">
                            <Text className="mb-2 text-sm font-medium text-right">משקל (ק״ג)</Text>
                            <Input
                                value={form.weight}
                                onChangeText={(t) => setForm(p => ({ ...p, weight: t }))}
                                placeholder="75.5"
                                keyboardType="numeric"
                                textAlign="right"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-2 text-sm font-medium text-right">גובה (ס״מ)</Text>
                            <Input
                                value={form.height}
                                onChangeText={(t) => setForm(p => ({ ...p, height: t }))}
                                placeholder="175"
                                keyboardType="numeric"
                                textAlign="right"
                            />
                        </View>
                    </View>

                    <Button label="שמור ועדכן יעדים" onPress={handleSave} />
                </Card>

                <Card className="p-4 flex-row-reverse justify-between items-center">
                    <View>
                        <Text className="text-lg font-bold text-right">Apple Health</Text>
                        <Text className="text-sm text-muted-foreground text-right">סנכרון צעדים ופעילות</Text>
                    </View>
                    <Switch value={false} onValueChange={() => { }} />
                </Card>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
