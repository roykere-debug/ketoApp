import { Text as RNText, TextProps } from "react-native";
import { cn } from "../../lib/utils"; // We need to create lib/utils

export function Text({ className, style, ...props }: TextProps) {
    return (
        <RNText
            className={cn("text-base font-sans text-foreground text-left", className)} // 'text-left' for clean alignment, can be overridden 'text-right' for Hebrew logic if needed, but usually alignment follows direction.
            style={style}
            {...props}
        />
    );
}
