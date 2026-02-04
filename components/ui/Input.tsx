import { TextInput, TextInputProps } from "react-native";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: TextInputProps) {
    return (
        <TextInput
            className={cn(
                "border border-border bg-background text-foreground px-4 py-3 rounded-2xl text-right",
                className
            )}
            placeholderTextColor="#999"
            {...props}
        />
    );
}
