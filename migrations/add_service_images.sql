-- Add image fields to services table
-- Run this in Supabase SQL Editor

-- Add new image columns
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS hero_image TEXT,
ADD COLUMN IF NOT EXISTS benefits_image TEXT,
ADD COLUMN IF NOT EXISTS feature_mockup_image TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.services.hero_image IS 'Image displayed in hero section (right side of service detail page)';
COMMENT ON COLUMN public.services.benefits_image IS 'Image displayed in benefits/accordion section (left sticky image)';
COMMENT ON COLUMN public.services.feature_mockup_image IS 'Default mockup image for features section';

-- Optional: Add some default images for existing services (you can customize these URLs)
-- UPDATE public.services 
-- SET hero_image = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop'
-- WHERE slug = 'web-development' AND hero_image IS NULL;
