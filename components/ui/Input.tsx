import { TextInput, TextInputProps } from "react-native";
import { cn } from "../../lib/utils";

export function Input({ className, style, ...props }: TextInputProps) {
    return (
        <TextInput
            className={cn(
                "h-14 px-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-base font-semibold text-foreground text-right",
                className
            )}
            placeholderTextColor="#9ca3af"
            style={[
                {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                },
                style,
            ]}
            {...props}
        />
    );
}
