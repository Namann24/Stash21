-- Stash21 Supabase schema

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  cover_image text,
  category text not null default 'Projects',
  tags text[] default '{}',
  author_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published boolean not null default true,
  views integer not null default 0
);

alter table posts add column if not exists views integer not null default 0;

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_name text not null default 'Anonymous Maker',
  content text not null,
  created_at timestamptz not null default now(),
  approved boolean not null default false
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  emoji text not null,
  count integer not null default 0,
  unique(post_id, emoji)
);

create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  emoji text not null,
  visitor_id text not null default '',
  created_at timestamptz not null default now()
);

-- Add visitor_id if upgrading existing table
alter table post_reactions add column if not exists visitor_id text not null default '';

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  category text not null default 'Site Feedback',
  topic text,
  message text not null,
  created_at timestamptz not null default now(),
  votes integer not null default 0
);

create table if not exists upvotes (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid references feedback(id) on delete cascade,
  voter_fingerprint text not null,
  value integer not null default 1,
  created_at timestamptz not null default now(),
  unique(feedback_id, voter_fingerprint)
);

-- RPC helpers
create or replace function toggle_reaction(p_post_id uuid, p_emoji text, p_visitor_id text)
returns void as $$
declare
  existing_id uuid;
begin
  select id into existing_id from post_reactions
    where post_id = p_post_id and emoji = p_emoji and visitor_id = p_visitor_id
    limit 1;

  if found then
    delete from post_reactions where id = existing_id;
  else
    insert into post_reactions (post_id, emoji, visitor_id) values (p_post_id, p_emoji, p_visitor_id);
  end if;
end;
$$ language plpgsql security definer;

create or replace function increment_post_view(p_post_id uuid)
returns void as $$
begin
  update posts set views = coalesce(views, 0) + 1 where id = p_post_id;
end;
$$ language plpgsql security definer;

create or replace function increment_feedback_vote(p_feedback_id uuid)
returns void as $$
begin
  update feedback set votes = votes + 1 where id = p_feedback_id;
end;
$$ language plpgsql security definer;

create or replace function toggle_feedback_vote(p_feedback_id uuid, p_visitor_id text)
returns void as $$
declare
  existing_id uuid;
begin
  select id into existing_id from upvotes
    where feedback_id = p_feedback_id and voter_fingerprint = p_visitor_id
    limit 1;

  if found then
    delete from upvotes where id = existing_id;
    update feedback set votes = greatest(0, votes - 1) where id = p_feedback_id;
  else
    insert into upvotes (feedback_id, voter_fingerprint) values (p_feedback_id, p_visitor_id);
    update feedback set votes = votes + 1 where id = p_feedback_id;
  end if;
end;
$$ language plpgsql security definer;

create or replace function approve_comment(p_comment_id uuid)
returns void as $$
begin
  update comments set approved = true where id = p_comment_id;
end;
$$ language plpgsql security definer;

-- Row level security
alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table post_reactions enable row level security;
alter table feedback enable row level security;
alter table upvotes enable row level security;
alter table subscribers enable row level security;

create policy "Public can read published posts" on posts for select using (published = true);
create policy "Authenticated can manage posts" on posts for all using (auth.role() = 'authenticated');

create policy "Public can read approved comments" on comments for select using (approved = true);
create policy "Authenticated can read all comments" on comments for select using (auth.role() = 'authenticated');
create policy "Public can insert comments" on comments for insert with check (true);
create policy "Authenticated can manage comments" on comments for all using (auth.role() = 'authenticated');

create policy "Public can read reactions" on reactions for select using (true);
create policy "Public can insert reactions" on reactions for insert with check (true);

create policy "Public can read post reactions" on post_reactions for select using (true);
create policy "Public can insert post reactions" on post_reactions for insert with check (true);

create policy "Public can read feedback" on feedback for select using (true);
create policy "Public can insert feedback" on feedback for insert with check (true);
create policy "Authenticated can manage feedback" on feedback for all using (auth.role() = 'authenticated');

create policy "Public can insert upvotes" on upvotes for insert with check (true);
create policy "Public can read upvotes" on upvotes for select using (true);

create policy "Public can subscribe" on subscribers for insert with check (true);
create policy "Authenticated can read subscribers" on subscribers for select using (auth.role() = 'authenticated');
