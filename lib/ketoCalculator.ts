import type { KetoGoal, GoalPace } from '../store/userStore';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
};

const PACE_DEFICIT: Record<GoalPace, number> = {
    slow: 250,
    moderate: 500,
    aggressive: 750,
};

export function calculateKetoGoals(params: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: ActivityLevel;
    goal: KetoGoal;
    goalPace: GoalPace;
    carbLimit: number;
}): { calories: number; fat: number; protein: number; carbs: number } {
    const { weight, height, age, gender, activityLevel, goal, goalPace, carbLimit } = params;

    const genderOffset = gender === 'male' ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + genderOffset;

    const tdee = bmr * ACTIVITY_MULTIPLIER[activityLevel];

    let calories = tdee;
    if (goal === 'lose_weight') {
        calories -= PACE_DEFICIT[goalPace];
    } else if (goal === 'gain_weight') {
        calories += PACE_DEFICIT[goalPace];
    }

    calories = Math.max(1200, Math.round(calories));

    const carbCalories = carbLimit * 4;

    let proteinGrams = Math.round(weight * 1.6);
    let proteinCalories = proteinGrams * 4;

    const maxProteinCal = calories * 0.25;
    const minProteinCal = calories * 0.20;
    if (proteinCalories > maxProteinCal) {
        proteinGrams = Math.round(maxProteinCal / 4);
        proteinCalories = proteinGrams * 4;
    } else if (proteinCalories < minProteinCal) {
        proteinGrams = Math.round(minProteinCal / 4);
        proteinCalories = proteinGrams * 4;
    }

    const fatCalories = calories - carbCalories - proteinCalories;
    const fatGrams = Math.max(30, Math.round(fatCalories / 9));

    return {
        calories,
        fat: fatGrams,
        protein: proteinGrams,
        carbs: carbLimit,
    };
}
