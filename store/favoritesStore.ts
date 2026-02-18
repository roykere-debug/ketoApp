import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '../services/recipes';

interface FavoritesState {
    favoriteRecipes: Recipe[];
    addFavorite: (recipe: Recipe) => Promise<void>;
    removeFavorite: (recipeId: string) => Promise<void>;
    isFavorite: (recipeId: string) => boolean;
    loadFavorites: () => Promise<void>;
}

const FAVORITES_KEY = '@keto_favorite_recipes';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favoriteRecipes: [],

    addFavorite: async (recipe: Recipe) => {
        const { favoriteRecipes } = get();
        
        // Check if already exists
        if (favoriteRecipes.some(r => r.id === recipe.id)) {
            return;
        }

        const updatedFavorites = [...favoriteRecipes, recipe];
        set({ favoriteRecipes: updatedFavorites });

        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    },

    removeFavorite: async (recipeId: string) => {
        const { favoriteRecipes } = get();
        const updatedFavorites = favoriteRecipes.filter(r => r.id !== recipeId);
        set({ favoriteRecipes: updatedFavorites });

        // Save to AsyncStorage
        try {
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    },

    isFavorite: (recipeId: string) => {
        const { favoriteRecipes } = get();
        return favoriteRecipes.some(r => r.id === recipeId);
    },

    loadFavorites: async () => {
        try {
            const stored = await AsyncStorage.getItem(FAVORITES_KEY);
            if (stored) {
                const favorites = JSON.parse(stored);
                set({ favoriteRecipes: favorites });
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    },
}));
