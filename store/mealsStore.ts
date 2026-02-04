import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    ketoScore: number;
    timestamp: number;
    imageBase64?: string;
};

type DailyGoals = {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

type MealsState = {
    meals: Meal[];
    dailyGoals: DailyGoals;
    addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
    removeMeal: (id: string) => void;
    clearTodaysMeals: () => void;
    setDailyGoals: (goals: Partial<DailyGoals>) => void;
    getTodaysMeals: () => Meal[];
    getTodaysTotals: () => { calories: number; protein: number; fat: number; carbs: number };
    getTodaysKetoScore: () => number;
    getRemaining: () => { calories: number; protein: number; fat: number; carbs: number };
};

const DEFAULT_GOALS: DailyGoals = {
    calories: 2000,
    protein: 100,
    fat: 150,
    carbs: 25, // Keto typically 20-50g carbs
};

const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const useMealsStore = create<MealsState>()(
    persist(
        (set, get) => ({
            meals: [],
            dailyGoals: DEFAULT_GOALS,

            addMeal: (meal) => {
                const newMeal: Meal = {
                    ...meal,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                };
                set((state) => ({
                    meals: [newMeal, ...state.meals],
                }));
            },

            removeMeal: (id) => {
                set((state) => ({
                    meals: state.meals.filter((m) => m.id !== id),
                }));
            },

            clearTodaysMeals: () => {
                set((state) => ({
                    meals: state.meals.filter((m) => !isToday(m.timestamp)),
                }));
            },

            setDailyGoals: (goals) => {
                set((state) => ({
                    dailyGoals: { ...state.dailyGoals, ...goals },
                }));
            },

            getTodaysMeals: () => {
                return get().meals.filter((m) => isToday(m.timestamp));
            },

            getTodaysTotals: () => {
                const todaysMeals = get().getTodaysMeals();
                return todaysMeals.reduce(
                    (acc, meal) => ({
                        calories: acc.calories + meal.calories,
                        protein: acc.protein + meal.protein,
                        fat: acc.fat + meal.fat,
                        carbs: acc.carbs + meal.carbs,
                    }),
                    { calories: 0, protein: 0, fat: 0, carbs: 0 }
                );
            },

            getTodaysKetoScore: () => {
                const todaysMeals = get().getTodaysMeals();
                if (todaysMeals.length === 0) return 10; // Perfect score if no meals yet
                const avgScore =
                    todaysMeals.reduce((acc, m) => acc + m.ketoScore, 0) / todaysMeals.length;
                return Math.round(avgScore * 10) / 10;
            },

            getRemaining: () => {
                const goals = get().dailyGoals;
                const totals = get().getTodaysTotals();
                return {
                    calories: Math.max(0, goals.calories - totals.calories),
                    protein: Math.max(0, goals.protein - totals.protein),
                    fat: Math.max(0, goals.fat - totals.fat),
                    carbs: Math.max(0, goals.carbs - totals.carbs),
                };
            },
        }),
        {
            name: 'meals-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
