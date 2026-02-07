-- Add dnaImage field to About sections
-- Run this in Supabase SQL Editor

-- Update home page about section to include dnaImage field
UPDATE public.page_sections
SET content = jsonb_set(
  content,
  '{dnaImage}',
  '""'::jsonb
)
WHERE page_slug = 'home' AND section_key = 'about' AND NOT (content ? 'dnaImage');

-- Update about page about section to include dnaImage field
UPDATE public.page_sections
SET content = jsonb_set(
  content,
  '{dnaImage}',
  '""'::jsonb
)
WHERE page_slug = 'about' AND section_key = 'about' AND NOT (content ? 'dnaImage');
