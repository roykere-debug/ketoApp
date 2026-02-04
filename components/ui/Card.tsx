import { View, ViewProps } from "react-native";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "rounded-3xl border border-border bg-card shadow-sm p-4",
                className
            )}
            {...props}
        />
    );
}
