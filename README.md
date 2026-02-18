# 🥑 KetoApp

A modern React Native mobile application for keto diet tracking and management, powered by AI and built with Expo.

## ✨ Features

- 📱 **Cross-platform** - Works on iOS, Android, and Web
- 🔐 **Authentication** - Secure user authentication with Supabase
- 📸 **Food Scanner** - Scan food items with your camera
- 🍽️ **Meal Tracking** - Track your daily meals and carb intake
- 🤖 **AI Coach** - Get personalized keto advice powered by Google AI
- 📊 **Profile Management** - Manage your personal health data
- 🥗 **Recipe Browser** - Discover keto-friendly recipes
- 🎨 **Modern UI** - Clean, minimal design with NativeWind (Tailwind CSS)

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (~54.0)
- **Language**: TypeScript
- **UI/Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI Integration**: Google AI API
- **Icons**: [Lucide React Native](https://lucide.dev/)

## 📁 Project Structure

```
ketoapp/
├── app/                    # App screens and routing
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── coach.tsx      # AI Coach
│   │   ├── scanner.tsx    # Food Scanner
│   │   ├── recipes.tsx    # Recipe Browser
│   │   └── profile.tsx    # User Profile
│   ├── login.tsx          # Login screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── ui/               # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Text.tsx
├── services/             # External service integrations
│   ├── ai.ts            # Google AI service
│   └── recipes.ts       # Recipe service
├── store/               # Zustand state stores
│   ├── mealsStore.ts    # Meal tracking state
│   └── userStore.ts     # User data state
├── lib/                 # Utilities and helpers
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Utility functions
└── assets/             # Images and static files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac only) or Android Emulator
- [Supabase Account](https://supabase.com/)
- [Google AI API Key](https://ai.google.dev/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ketoapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   EXPO_PUBLIC_GOOGLE_API_KEY=your_google_ai_api_key
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Navigate to your Supabase project SQL editor and run:
   # supabase_schema.sql
   ```
   
   This will create:
   - `profiles` table for user data
   - Row Level Security (RLS) policies
   - Authentication triggers

5. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Web Browser**: Press `w` in the terminal or run `npm run web`
- **Physical Device**: Scan the QR code with Expo Go app

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the schema from `supabase_schema.sql`
3. Enable Email authentication in Authentication settings
4. Copy your project URL and anon key to `.env`

### Google AI Setup

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Add the key to your `.env` file
3. The AI service is configured in `services/ai.ts`

## 📱 Features Overview

### Home Dashboard
Track your daily carb intake, view recent meals, and see your progress.

### AI Coach
Get personalized keto diet advice, ask questions, and receive meal recommendations powered by Google's Gemini AI.

### Food Scanner
Use your camera to scan food items and get instant nutritional information.

### Recipe Browser
Browse and search through a collection of keto-friendly recipes.

### Profile Management
- Set your personal health data (age, weight, height, activity level)
- Configure your daily carb limit
- Track your keto journey

## 🎨 Customization

### Styling
The app uses NativeWind (Tailwind CSS) for styling. Configure styles in:
- `tailwind.config.js` - Tailwind configuration
- `global.css` - Global styles
- `components/ui/` - Reusable styled components

### Components
All UI components use the `class-variance-authority` (CVA) pattern for consistent, variant-based styling.

## 🧪 Development

### Code Quality
- TypeScript strict mode enabled
- Component-based architecture
- Reusable UI components
- Clean separation of concerns

### State Management
- Zustand stores for global state
- `mealsStore` - Meal tracking and calculations
- `userStore` - User profile and preferences

## 📦 Build & Deploy

### Development Build
```bash
# Create a development build
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
# Build for production
eas build --platform ios
eas build --platform android
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private.

## 🔗 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Google AI Documentation](https://ai.google.dev/docs)

## 📧 Support

For SMTP setup and email configuration, see [SMTP_SETUP.md](./SMTP_SETUP.md).

---

Built with ❤️ using Expo & React Native
