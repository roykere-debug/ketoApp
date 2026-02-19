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

export async function searchByBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .eq("barcode", barcode)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST205") return null;
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error searching by barcode:", error);
    return null;
  }
}

export async function lookupBarcodeExternal(
  barcode: string
): Promise<FoodItem | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};

    return {
      id: "",
      name: p.product_name_en || p.product_name || barcode,
      name_hebrew: p.product_name_he || null,
      calories: Math.round(n["energy-kcal_100g"] || 0),
      protein: Math.round(n.proteins_100g || 0),
      fat: Math.round(n.fat_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fiber: Math.round(n.fiber_100g || 0),
      sugar: Math.round(n.sugars_100g || 0),
      serving_size: p.serving_size || "100g",
      category: p.categories_tags?.[0] || null,
      brand: p.brands || null,
      barcode,
    };
  } catch (error) {
    console.error("Error looking up barcode externally:", error);
    return null;
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
