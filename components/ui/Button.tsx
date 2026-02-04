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
    ...props
}: ButtonProps) {

    const baseStyles = "flex-row items-center justify-center rounded-full";
    const variants = {
        default: "bg-primary",
        outline: "border-2 border-primary bg-transparent",
        ghost: "bg-transparent",
    };
    const sizes = {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2",
        lg: "h-14 px-8 py-4",
    };

    const textStyles = {
        default: "text-white font-bold",
        outline: "text-primary font-bold",
        ghost: "text-primary font-medium",
    };

    return (
        <TouchableOpacity
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            activeOpacity={0.7}
            {...props}
        >
            <Text className={cn(textStyles[variant])}>{label}</Text>
        </TouchableOpacity>
    );
}
