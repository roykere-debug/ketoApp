import { Text as RNText, TextProps } from "react-native";
import { cn } from "../../lib/utils";

export function Text({ className, style, ...props }: TextProps) {
    return (
        <RNText
            className={cn("text-base font-sans font-semibold text-foreground text-left", className)}
            style={[{ letterSpacing: -0.2 }, style]}
            {...props}
        />
    );
}
