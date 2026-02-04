import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type UserProfile = {
    name: string;
    age: string;
    weight: string;
    height: string;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
    dailyCarbLimit: number;
};

type UserState = {
    profile: UserProfile;
    hasOnboarded: boolean;
    userId: string | null;
    setProfile: (profile: Partial<UserProfile>) => Promise<void>;
    completeOnboarding: () => void;
    reset: () => void;
    syncFromSupabase: () => Promise<void>;
};

const INITIAL_PROFILE: UserProfile = {
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'sedentary',
    dailyCarbLimit: 20,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: INITIAL_PROFILE,
            hasOnboarded: false,
            userId: null,

            setProfile: async (updates) => {
                set((state) => ({
                    profile: { ...state.profile, ...updates },
                }));

                const { userId, profile } = get();
                if (userId) {
                    const { error } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            updated_at: new Date(),
                            name: profile.name,
                            age: profile.age,
                            weight: profile.weight,
                            height: profile.height,
                            gender: profile.gender,
                            activity_level: profile.activityLevel,
                            daily_carb_limit: profile.dailyCarbLimit,
                        });

                    if (error) console.error("Supabase update error:", error);
                }
            },

            completeOnboarding: () => set({ hasOnboarded: true }),

            reset: () => set({ profile: INITIAL_PROFILE, hasOnboarded: false, userId: null }),

            syncFromSupabase: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const uid = session.user.id;
                    set({ userId: uid });

                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', uid)
                        .single();

                    if (data && !error) {
                        set({
                            profile: {
                                name: data.name || '',
                                age: data.age || '',
                                weight: data.weight || '',
                                height: data.height || '',
                                gender: data.gender || 'male',
                                activityLevel: data.activity_level || 'sedentary',
                                dailyCarbLimit: data.daily_carb_limit || 20,
                            }
                        });
                    }
                }
            }
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
