import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "./ui/Text";

const C = {
    bg: "#0A0A0C",
    card: "#111113",
    border: "#28282C",
    maroon: "#800020",
    text: "#F5F5F7",
    textDim: "#8E8E93",
    red: "#ef4444",
} as const;

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: C.bg,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 32,
                    }}
                >
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 24,
                            backgroundColor: `${C.red}18`,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: `${C.red}30`,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 36,
                                color: C.red,
                            }}
                        >
                            !
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: C.text,
                            fontSize: 20,
                            fontFamily: "Assistant_700Bold",
                            textAlign: "center",
                            marginBottom: 12,
                        }}
                    >
                        משהו השתבש
                    </Text>
                    <Text
                        style={{
                            color: C.textDim,
                            fontSize: 14,
                            fontFamily: "Assistant_400Regular",
                            textAlign: "center",
                            lineHeight: 22,
                            marginBottom: 32,
                        }}
                    >
                        אירעה שגיאה בלתי צפויה. נסה לטעון מחדש.
                    </Text>
                    <TouchableOpacity
                        onPress={() => this.setState({ hasError: false })}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: C.maroon,
                            paddingHorizontal: 32,
                            paddingVertical: 14,
                            borderRadius: 18,
                            shadowColor: C.maroon,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 12,
                            elevation: 6,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: 15,
                                fontFamily: "Assistant_700Bold",
                            }}
                        >
                            נסה שוב
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}
