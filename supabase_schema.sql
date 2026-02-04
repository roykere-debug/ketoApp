-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  name text,
  age text,
  weight text,
  height text,
  gender text,
  activity_level text,
  daily_carb_limit numeric
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This triggers a profile creation when a user signs up (Optional, but good for Email/Pass)
-- For Anon auth, we usually insert manually on first save.
