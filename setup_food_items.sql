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

-- Insert some common food items
insert into food_items (name, name_hebrew, calories, protein, fat, carbs, fiber, sugar, serving_size, category) values
  ('Chicken Breast', 'חזה עוף', 165, 31, 3.6, 0, 0, 0, '100g', 'חלבון'),
  ('Salmon', 'סלמון', 208, 20, 13, 0, 0, 0, '100g', 'חלבון'),
  ('Ground Beef', 'בשר טחון', 250, 26, 15, 0, 0, 0, '100g', 'חלבון'),
  ('Eggs', 'ביצים', 155, 13, 11, 1.1, 0, 1.1, '100g', 'חלבון'),
  ('Avocado', 'אבוקדו', 160, 2, 15, 9, 7, 0.7, '100g', 'שומן'),
  ('Olive Oil', 'שמן זית', 884, 0, 100, 0, 0, 0, '100g', 'שומן'),
  ('Butter', 'חמאה', 717, 0.9, 81, 0.1, 0, 0.1, '100g', 'שומן'),
  ('Almonds', 'שקדים', 579, 21, 50, 22, 12, 4, '100g', 'שומן'),
  ('Broccoli', 'ברוקולי', 34, 2.8, 0.4, 7, 2.6, 1.7, '100g', 'ירקות'),
  ('Spinach', 'תרד', 23, 2.9, 0.4, 3.6, 2.2, 0.4, '100g', 'ירקות'),
  ('Cauliflower', 'כרובית', 25, 1.9, 0.3, 5, 2, 1.9, '100g', 'ירקות'),
  ('Zucchini', 'קישוא', 17, 1.2, 0.3, 3.1, 1, 2.5, '100g', 'ירקות'),
  ('Cucumber', 'מלפפון', 15, 0.7, 0.1, 3.6, 0.5, 1.7, '100g', 'ירקות'),
  ('Tomato', 'עגבניה', 18, 0.9, 0.2, 3.9, 1.2, 2.6, '100g', 'ירקות'),
  ('Bell Pepper', 'פלפל', 31, 1, 0.3, 6, 2.1, 4.2, '100g', 'ירקות'),
  ('Lettuce', 'חסה', 15, 1.4, 0.2, 2.9, 1.3, 0.8, '100g', 'ירקות'),
  ('Mushrooms', 'פטריות', 22, 3.1, 0.3, 3.3, 1, 2, '100g', 'ירקות'),
  ('Cheese (Cheddar)', 'גבינה צהובה', 402, 25, 33, 1.3, 0, 0.5, '100g', 'חלבון'),
  ('Greek Yogurt', 'יוגורט יווני', 59, 10, 0.4, 3.6, 0, 3.2, '100g', 'חלבון'),
  ('Cottage Cheese', 'גבינת קוטג', 98, 11, 4.3, 3.4, 0, 2.7, '100g', 'חלבון');
