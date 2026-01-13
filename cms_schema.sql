-- Enable Row Level Security
alter table if exists public.site_settings enable row level security;
alter table if exists public.page_sections enable row level security;

-- Create site_settings table
create table if not exists public.site_settings (
  key text primary key,
  value text,
  label text,
  description text,
  input_type text default 'text', -- 'text', 'textarea', 'image', 'url'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create page_sections table
create table if not exists public.page_sections (
  id uuid default gen_random_uuid() primary key,
  page_slug text not null, -- 'home', 'about', 'services', etc.
  section_key text not null, -- 'hero', 'cta', 'features'
  content jsonb default '{}'::jsonb, -- dynamic content
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(page_slug, section_key)
);

-- RLS Policies
-- Allow public read access
create policy "Public read access" on public.site_settings for select using (true);
create policy "Public read access" on public.page_sections for select using (true);

-- Allow authenticated update access (for Admin)
create policy "Admin update access" on public.site_settings for update using (auth.role() = 'authenticated');
create policy "Admin insert access" on public.site_settings for insert with check (auth.role() = 'authenticated');

create policy "Admin update access" on public.page_sections for update using (auth.role() = 'authenticated');
create policy "Admin insert access" on public.page_sections for insert with check (auth.role() = 'authenticated');

-- Initial Seed Data: Site Settings
insert into public.site_settings (key, value, label, input_type, description) values
('contact_email', 'contact@mutanttechnologies.com', 'Contact Email', 'text', 'Email displayed in footer and contact page'),
('phone_number', '+91-7016228551', 'Phone Number', 'text', 'Primary contact number'),
('address', 'B-113 RK iconic Sheetal Park, Rajkot, Gujarat', 'Office Address', 'textarea', 'Physical office location'),
('linkedin_url', 'https://www.linkedin.com/company/mutant-technologies', 'LinkedIn URL', 'url', 'Link to LinkedIn profile'),
('instagram_url', 'https://www.instagram.com/mutanttechnologies', 'Instagram URL', 'url', 'Link to Instagram profile')
on conflict (key) do nothing;

-- Initial Seed Data: Home Page Hero
insert into public.page_sections (page_slug, section_key, content) values
('home', 'hero', '{
  "title": "We Build Digital Experiences",
  "subtitle": "Mutant Technologies transforms your ideas into powerful web and mobile applications.",
  "button_text": "Get Started",
  "button_link": "/contact"
}'::jsonb),
('home', 'cta', '{
  "title": "Ready to Mutate Your Business?",
  "description": "Let''s discuss your next big project.",
  "button_text": "Contact Us"
}'::jsonb)
on conflict (page_slug, section_key) do nothing;
