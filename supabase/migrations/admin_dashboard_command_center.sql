-- Admin Dashboard Command Center upgrade
-- Run this in the Supabase SQL Editor for an existing Stash21 project.

alter table posts add column if not exists views integer not null default 0;

create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table post_reactions enable row level security;
alter table subscribers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_reactions'
      and policyname = 'Public can read post reactions'
  ) then
    create policy "Public can read post reactions" on post_reactions
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_reactions'
      and policyname = 'Public can insert post reactions'
  ) then
    create policy "Public can insert post reactions" on post_reactions
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'subscribers'
      and policyname = 'Public can subscribe'
  ) then
    create policy "Public can subscribe" on subscribers
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'subscribers'
      and policyname = 'Authenticated can read subscribers'
  ) then
    create policy "Authenticated can read subscribers" on subscribers
      for select using (auth.role() = 'authenticated');
  end if;
end $$;

create or replace function increment_reaction(p_post_id uuid, p_emoji text)
returns void as $$
begin
  insert into post_reactions (post_id, emoji) values (p_post_id, p_emoji);
end;
$$ language plpgsql security definer;

create or replace function increment_post_view(p_post_id uuid)
returns void as $$
begin
  update posts set views = coalesce(views, 0) + 1 where id = p_post_id;
end;
$$ language plpgsql security definer;
