import { View, ViewProps } from "react-native";
import { cn } from "../../lib/utils";

export function Card({ className, style, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "rounded-3xl bg-card p-6",
                className
            )}
            style={[
                {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 3,
                },
                style,
            ]}
            {...props}
        />
    );
}
