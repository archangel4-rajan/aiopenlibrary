-- ============================================
-- AIOpenLibrary Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text not null default '📝',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================
-- PROMPTS TABLE
-- ============================================
create table public.prompts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  category_name text not null,
  category_slug text not null,
  prompt text not null,
  tags text[] not null default '{}',
  recommended_model text not null default '',
  model_icon text not null default '',
  use_cases text[] not null default '{}',
  example_output text,
  output_screenshots text[],
  references jsonb default '[]',
  variables jsonb default '[]',
  tips text[],
  difficulty text not null default 'Intermediate'
    check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  saves_count integer not null default 0,
  is_published boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prompts_category_slug on public.prompts(category_slug);
create index idx_prompts_slug on public.prompts(slug);
create index idx_prompts_saves_count on public.prompts(saves_count desc);
create index idx_prompts_is_published on public.prompts(is_published);

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- SAVED PROMPTS TABLE
-- ============================================
create table public.saved_prompts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, prompt_id)
);

create index idx_saved_prompts_user on public.saved_prompts(user_id);
create index idx_saved_prompts_prompt on public.saved_prompts(prompt_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup (admin for rajan.1541995@gmail.com)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case
      when new.email = 'rajan.1541995@gmail.com' then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update saves_count on save/unsave
create or replace function public.update_saves_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.prompts set saves_count = saves_count + 1 where id = new.prompt_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.prompts set saves_count = saves_count - 1 where id = old.prompt_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_saved_prompt_change
  after insert or delete on public.saved_prompts
  for each row execute function public.update_saves_count();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.categories enable row level security;
alter table public.prompts enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_prompts enable row level security;

-- Categories: everyone can read
create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update categories"
  on public.categories for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete categories"
  on public.categories for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Prompts: published visible to all, admins see everything
create policy "Published prompts are viewable by everyone"
  on public.prompts for select using (is_published = true);

create policy "Admins can view all prompts"
  on public.prompts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert prompts"
  on public.prompts for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update prompts"
  on public.prompts for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete prompts"
  on public.prompts for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Profiles: users see own, admins see all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Saved prompts: users manage their own
create policy "Users can view own saved prompts"
  on public.saved_prompts for select using (auth.uid() = user_id);

create policy "Users can save prompts"
  on public.saved_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave prompts"
  on public.saved_prompts for delete
  using (auth.uid() = user_id);
