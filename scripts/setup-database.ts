/**
 * Database Setup Script
 * Run this script once to create the food_items table and seed initial data
 * 
 * Usage: npx tsx scripts/setup-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('You need: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  // SQL to create table
  const createTableSQL = `
    -- Create a table for food items database
    create table if not exists food_items (
      id uuid default gen_random_uuid() primary key,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      name text not null,
      name_hebrew text,
      calories numeric not null,
      protein numeric not null,
      fat numeric not null,
      carbs numeric not null,
      fiber numeric default 0,
      sugar numeric default 0,
      serving_size text default '100g',
      category text,
      brand text,
      barcode text,
      is_verified boolean default false,
      created_by uuid references auth.users on delete set null
    );

    -- Set up Row Level Security (RLS)
    alter table food_items enable row level security;

    -- Drop existing policies if they exist
    drop policy if exists "Food items are viewable by everyone." on food_items;
    drop policy if exists "Authenticated users can insert food items." on food_items;
    drop policy if exists "Users can update own food items." on food_items;

    -- Everyone can read food items
    create policy "Food items are viewable by everyone." on food_items
      for select using (true);

    -- Authenticated users can insert food items
    create policy "Authenticated users can insert food items." on food_items
      for insert with check (auth.role() = 'authenticated');

    -- Users can update their own food items
    create policy "Users can update own food items." on food_items
      for update using (auth.uid() = created_by);

    -- Create indexes for faster search
    create index if not exists food_items_name_idx on food_items using gin(to_tsvector('simple', name));
    create index if not exists food_items_name_hebrew_idx on food_items using gin(to_tsvector('simple', name_hebrew));
  `;

  try {
    console.log('📦 Creating food_items table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      console.log('\n💡 Please run the SQL manually in Supabase Dashboard > SQL Editor');
      console.log('📄 See SETUP_DATABASE.md for instructions\n');
      return;
    }

    console.log('✅ Table created successfully!\n');

    // Seed initial data
    console.log('🌱 Seeding initial food items...');
    
    const initialFoods = [
      { name: 'Chicken Breast', name_hebrew: 'חזה עוף', calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sugar: 0, serving_size: '100g', category: 'חלבון' },
      { name: 'Salmon', name_hebrew: 'סלמון', calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, sugar: 0, serving_size: '100g', category: 'חלבון' },
      { name: 'Ground Beef', name_hebrew: 'בשר טחון', calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0, sugar: 0, serving_size: '100g', category: 'חלבון' },
      { name: 'Eggs', name_hebrew: 'ביצים', calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0, sugar: 1.1, serving_size: '100g', category: 'חלבון' },
      { name: 'Avocado', name_hebrew: 'אבוקדו', calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 7, sugar: 0.7, serving_size: '100g', category: 'שומן' },
      { name: 'Olive Oil', name_hebrew: 'שמן זית', calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, sugar: 0, serving_size: '100g', category: 'שומן' },
      { name: 'Butter', name_hebrew: 'חמאה', calories: 717, protein: 0.9, fat: 81, carbs: 0.1, fiber: 0, sugar: 0.1, serving_size: '100g', category: 'שומן' },
      { name: 'Almonds', name_hebrew: 'שקדים', calories: 579, protein: 21, fat: 50, carbs: 22, fiber: 12, sugar: 4, serving_size: '100g', category: 'שומן' },
      { name: 'Broccoli', name_hebrew: 'ברוקולי', calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6, sugar: 1.7, serving_size: '100g', category: 'ירקות' },
      { name: 'Spinach', name_hebrew: 'תרד', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, sugar: 0.4, serving_size: '100g', category: 'ירקות' },
      { name: 'Cauliflower', name_hebrew: 'כרובית', calories: 25, protein: 1.9, fat: 0.3, carbs: 5, fiber: 2, sugar: 1.9, serving_size: '100g', category: 'ירקות' },
      { name: 'Zucchini', name_hebrew: 'קישוא', calories: 17, protein: 1.2, fat: 0.3, carbs: 3.1, fiber: 1, sugar: 2.5, serving_size: '100g', category: 'ירקות' },
      { name: 'Cucumber', name_hebrew: 'מלפפון', calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5, sugar: 1.7, serving_size: '100g', category: 'ירקות' },
      { name: 'Tomato', name_hebrew: 'עגבניה', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, sugar: 2.6, serving_size: '100g', category: 'ירקות' },
      { name: 'Bell Pepper', name_hebrew: 'פלפל', calories: 31, protein: 1, fat: 0.3, carbs: 6, fiber: 2.1, sugar: 4.2, serving_size: '100g', category: 'ירקות' },
      { name: 'Lettuce', name_hebrew: 'חסה', calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, fiber: 1.3, sugar: 0.8, serving_size: '100g', category: 'ירקות' },
      { name: 'Mushrooms', name_hebrew: 'פטריות', calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3, fiber: 1, sugar: 2, serving_size: '100g', category: 'ירקות' },
      { name: 'Cheese (Cheddar)', name_hebrew: 'גבינה צהובה', calories: 402, protein: 25, fat: 33, carbs: 1.3, fiber: 0, sugar: 0.5, serving_size: '100g', category: 'חלבון' },
      { name: 'Greek Yogurt', name_hebrew: 'יוגורט יווני', calories: 59, protein: 10, fat: 0.4, carbs: 3.6, fiber: 0, sugar: 3.2, serving_size: '100g', category: 'חלבון' },
      { name: 'Cottage Cheese', name_hebrew: 'גבינת קוטג', calories: 98, protein: 11, fat: 4.3, carbs: 3.4, fiber: 0, sugar: 2.7, serving_size: '100g', category: 'חלבון' },
    ];

    const { error: insertError } = await supabase
      .from('food_items')
      .upsert(initialFoods, { onConflict: 'name' });

    if (insertError) {
      console.error('❌ Error seeding data:', insertError);
      return;
    }

    console.log('✅ Successfully seeded 20 food items!\n');
    console.log('🎉 Database setup complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Tip: You may need to run the SQL manually in Supabase Dashboard');
    console.log('📄 See SETUP_DATABASE.md for instructions\n');
  }
}

setupDatabase();
