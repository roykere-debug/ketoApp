import { supabase } from "../lib/supabase";

export interface FoodItem {
  id: string;
  name: string;
  name_hebrew: string | null;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  serving_size: string;
  category: string | null;
  brand: string | null;
  barcode: string | null;
}

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .or(`name.ilike.%${query}%,name_hebrew.ilike.%${query}%`)
      .limit(20);

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === 'PGRST205') {
        console.warn("food_items table not yet created in Supabase");
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error searching food items:", error);
    return [];
  }
}

export async function getFoodItemById(id: string): Promise<FoodItem | null> {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching food item:", error);
    return null;
  }
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all food items:", error);
    return [];
  }
}

export async function addCustomFoodItem(
  foodItem: Omit<FoodItem, "id">
): Promise<FoodItem | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("food_items")
      .insert({
        ...foodItem,
        created_by: userData.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding custom food item:", error);
    return null;
  }
}
