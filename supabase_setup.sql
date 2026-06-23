-- ResumeIQ AI Supabase Database Schema
-- Run this script in your Supabase Project SQL Editor (https://supabase.com)

-- 1. Create Profiles Table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  credits integer default 2 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for profiles
alter table public.profiles enable row level security;

-- Setup RLS Policies for profiles
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Trigger to automatically create a profile for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 2);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create Analyses Table
create table if not exists public.analyses (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null,
  target_role text not null,
  ats_score integer not null,
  recruiter_readiness integer not null,
  data jsonb not null, -- Stores the full AnalysisResult JSON structure
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for analyses
alter table public.analyses enable row level security;

-- Setup RLS Policies for analyses
create policy "Users can view their own analyses" 
  on public.analyses for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses" 
  on public.analyses for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own analyses" 
  on public.analyses for delete 
  using (auth.uid() = user_id);


-- 3. Create Chat Messages Table
create table if not exists public.chat_messages (
  id text primary key,
  analysis_id text references public.analyses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for chat_messages
alter table public.chat_messages enable row level security;

-- Setup RLS Policies for chat_messages
create policy "Users can view messages for their analyses" 
  on public.chat_messages for select 
  using (auth.uid() = user_id);

create policy "Users can insert messages for their analyses" 
  on public.chat_messages for insert 
  with check (auth.uid() = user_id);
