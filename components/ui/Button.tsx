import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "./Text";
import { cn } from "../../lib/utils";

interface ButtonProps extends TouchableOpacityProps {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    label: string;
}

export function Button({
    className,
    variant = "default",
    size = "default",
    label,
    style,
    ...props
}: ButtonProps) {

    const baseStyles = "flex-row items-center justify-center rounded-xl";
    const variants = {
        default: "bg-primary",
        outline: "border-2 border-primary bg-transparent",
        ghost: "bg-transparent",
    };
    const sizes = {
        default: "h-14 px-6 py-4",
        sm: "h-10 px-4 py-2",
        lg: "h-16 px-8 py-4",
    };

    const textStyles = {
        default: "text-white font-extrabold text-base",
        outline: "text-primary font-extrabold text-base",
        ghost: "text-primary font-bold text-base",
    };

    const shadowStyles = variant === "default" ? {
        shadowColor: "#800020",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    } : {};

    return (
        <TouchableOpacity
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            style={[shadowStyles, style]}
            activeOpacity={0.8}
            {...props}
        >
            <Text className={cn(textStyles[variant])}>{label}</Text>
        </TouchableOpacity>
    );
}
