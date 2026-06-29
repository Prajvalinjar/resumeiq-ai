-- 2. Create Analyses Table
create table if not exists public.analyses (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null,
  target_role text not null,
  ats_score integer not null,
  recruiter_readiness integer not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analyses enable row level security;

drop policy if exists "Users can view their own analyses" on public.analyses;
create policy "Users can view their own analyses" 
  on public.analyses for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own analyses" on public.analyses;
create policy "Users can insert their own analyses" 
  on public.analyses for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own analyses" on public.analyses;
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

alter table public.chat_messages enable row level security;

drop policy if exists "Users can view messages for their analyses" on public.chat_messages;
create policy "Users can view messages for their analyses" 
  on public.chat_messages for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert messages for their analyses" on public.chat_messages;
create policy "Users can insert messages for their analyses" 
  on public.chat_messages for insert 
  with check (auth.uid() = user_id);

-- Reload Schema Cache so the API sees the tables immediately
NOTIFY pgrst, 'reload schema';
