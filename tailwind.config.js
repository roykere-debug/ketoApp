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
      }
    },
  },
  plugins: [],
}
