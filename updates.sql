-- Portfolio Table
create table if not exists portfolio (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  project_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Portfolio
alter table portfolio enable row level security;

-- Policies for Portfolio
create policy "Public can view portfolio" on portfolio
  for select using (true);

create policy "Authenticated users can manage portfolio" on portfolio
  for all using (auth.role() = 'authenticated');


-- Subscribers Table
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Subscribers
alter table subscribers enable row level security;

-- Policies for Subscribers
create policy "Public can subscribe" on subscribers
  for insert with check (true);

create policy "Authenticated users can view subscribers" on subscribers
  for select using (auth.role() = 'authenticated');


-- Comments Table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_slug text not null,
  author_name text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Comments
alter table comments enable row level security;

-- Policies for Comments
create policy "Public can view comments" on comments
  for select using (true);

create policy "Public can insert comments" on comments
  for insert with check (true);


-- Post Likes Table
create table if not exists post_likes (
  slug text primary key,
  count integer default 0
);

-- Enable RLS for Post Likes
alter table post_likes enable row level security;

-- Policies for Post Likes
create policy "Public can view likes" on post_likes
  for select using (true);

create policy "Public can update likes" on post_likes
  for update using (true);
  
create policy "Public can insert likes" on post_likes
  for insert with check (true);
