/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#800020",
        background: "#FFFFFF",
        foreground: "#000000",
        muted: "#F5F5F5",
        "muted-foreground": "#737373",
        card: "#FFFFFF",
        "card-foreground": "#000000",
        border: "#E5E5E5",
      },
      fontFamily: {
        sans: ['Assistant_400Regular'],
        bold: ['Assistant_700Bold'],
      },
      // 4px grid: spacing & radius divisible by 4 for consistent UI
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
}
