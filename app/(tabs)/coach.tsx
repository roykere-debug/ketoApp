import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/ui/Text";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useState, useRef } from "react";
import { getCoachResponse } from "../../services/ai";

export default function CoachScreen() {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: 'היי! אני המאמן האישי שלך. מה אכלת היום או איך אני יכול לעזור?' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await getCoachResponse([], userMsg);
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'סליחה, משהו השתבש. נסה שוב.' }]);
        } finally {
            setLoading(false);
            scrollRef.current?.scrollToEnd({ animated: true });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="p-4 border-b border-border bg-card">
                <Text className="text-xl font-bold text-primary text-center">המאמן האישי</Text>
            </View>

            <ScrollView 
                ref={scrollRef}
                className="flex-1 p-4" 
                contentContainerStyle={{ gap: 12 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, idx) => (
                    <View 
                        key={idx} 
                        className={`p-4 rounded-2xl max-w-[80%] ${
                            msg.role === 'user' 
                                ? 'bg-primary self-start' 
                                : 'bg-muted self-end'
                        }`}
                    >
                        <Text className={`${msg.role === 'user' ? 'text-white' : 'text-foreground'} text-right`}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View className="bg-muted self-end p-4 rounded-2xl max-w-[80%]">
                        <Text className="text-muted-foreground text-right">מקליד...</Text>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View className="p-4 border-t border-border flex-row-reverse gap-2 bg-background">
                    <Input
                        className="flex-1"
                        placeholder="כתוב הודעה..."
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                        textAlign="right"
                    />
                    <Button 
                        label={loading ? "..." : "שלח"} 
                        className="w-20" 
                        onPress={handleSend}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
