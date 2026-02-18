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
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
            <View className="px-5 py-4 bg-white">
                <Text className="text-3xl font-extrabold text-primary text-center">המאמן האישי</Text>
            </View>

            <ScrollView 
                ref={scrollRef}
                className="flex-1 px-5 py-4" 
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, idx) => (
                    <View 
                        key={idx} 
                        className={`px-5 py-4 rounded-3xl max-w-[85%] ${
                            msg.role === 'user' 
                                ? 'bg-primary self-start' 
                                : 'bg-white self-end'
                        }`}
                        style={
                            msg.role === 'assistant'
                                ? {
                                      shadowColor: "#000",
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.06,
                                      shadowRadius: 8,
                                      elevation: 2,
                                  }
                                : {}
                        }
                    >
                        <Text className={`${msg.role === 'user' ? 'text-white font-semibold' : 'text-foreground font-medium'} text-right leading-6`}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View 
                        className="bg-white self-end px-5 py-4 rounded-3xl max-w-[85%]"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Text className="text-gray-400 font-semibold text-right">מקליד...</Text>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View className="px-5 py-4 flex-row-reverse gap-3 bg-white border-t border-gray-100">
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
                        className="w-24" 
                        onPress={handleSend}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
