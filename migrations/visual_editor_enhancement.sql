-- Visual Editor Enhancement Migration
-- This migration adds SEO metadata support and seeds missing section data

-- ============================================
-- 1. Create page_metadata table for SEO
-- ============================================

CREATE TABLE IF NOT EXISTS public.page_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.page_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public read access" ON public.page_metadata;
CREATE POLICY "Public read access" ON public.page_metadata 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update access" ON public.page_metadata;
CREATE POLICY "Admin update access" ON public.page_metadata 
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin insert access" ON public.page_metadata;
CREATE POLICY "Admin insert access" ON public.page_metadata 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin delete access" ON public.page_metadata;
CREATE POLICY "Admin delete access" ON public.page_metadata 
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 2. Seed default SEO metadata
-- ============================================

INSERT INTO public.page_metadata (page_slug, title, description, keywords, robots) VALUES
('home', 
 'Mutant Technologies - Shine Bright Online | Web Development & Digital Marketing', 
 'Transform your digital presence with Mutant Technologies. Expert web development, SEO, digital marketing, and cybersecurity services in Rajkot, Gujarat.',
 ARRAY['web development', 'digital marketing', 'SEO', 'cybersecurity', 'Rajkot', 'Gujarat'],
 'index, follow'),

('about', 
 'About Us - Mutant Technologies | Digital Innovation Experts', 
 'Learn about Mutant Technologies - a team of passionate developers and marketers dedicated to transforming businesses through innovative digital solutions.',
 ARRAY['about mutant technologies', 'digital agency', 'web development team'],
 'index, follow'),

('services', 
 'Our Services - Web Development, SEO & Digital Marketing | Mutant Technologies', 
 'Comprehensive digital services including custom web development, mobile apps, SEO optimization, digital marketing, and enterprise cybersecurity solutions.',
 ARRAY['web development services', 'SEO services', 'digital marketing', 'mobile app development'],
 'index, follow'),

('contact', 
 'Contact Us - Get in Touch | Mutant Technologies', 
 'Ready to transform your digital presence? Contact Mutant Technologies today. Located in Rajkot, Gujarat. Call us at +91-7016228551.',
 ARRAY['contact mutant technologies', 'web development inquiry', 'digital marketing contact'],
 'index, follow')

ON CONFLICT (page_slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  robots = EXCLUDED.robots,
  updated_at = NOW();

-- ============================================
-- 3. Seed missing section data
-- ============================================

-- About Section
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'about', '{
  "title": "We Don''t Just Follow Trends,",
  "subtitle": "We Set Them.",
  "description": "At Mutant Technologies, we believe in the power of mutation – the constant evolution required to stay ahead in the digital age. We don''t just build websites; we craft digital experiences that captivate, convert, and scale.",
  "features": [
    {
      "icon": "Zap",
      "title": "Lightning Fast",
      "description": "Optimized performance for instant loading"
    },
    {
      "icon": "Shield",
      "title": "Secure & Reliable",
      "description": "Enterprise-grade security built-in"
    },
    {
      "icon": "Rocket",
      "title": "Infinitely Scalable",
      "description": "Grows seamlessly with your business"
    },
    {
      "icon": "Target",
      "title": "Precision Focused",
      "description": "Data-driven strategies that deliver results"
    }
  ]
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Services Section Header
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'services', '{
  "title": "What We Do",
  "subtitle": "Comprehensive digital solutions tailored to your needs"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Contact Section
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'contact', '{
  "title": "Let''s Start a Conversation",
  "description": "Ready to transform your digital presence? Get in touch with us today.",
  "phone": "(+91) 7016228551",
  "email": "contact@mutanttechnologies.com",
  "address": "B-113 RK iconic Sheetal Park, Rajkot, Gujarat"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Ongoing Projects Section
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'ongoing', '{
  "title": "Ongoing Works",
  "description": "Witness the future in the making. Here are some of the cutting-edge projects currently on our workbench."
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Service Marquee
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'service_marquee', '{
  "text": "Web Development • SEO Optimization • Digital Marketing • Cyber Security • UI/UX Design • Mobile Apps • E-commerce Solutions •"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Testimonials Section
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'testimonials', '{
  "title": "What Our Clients Say",
  "subtitle": "Real feedback from real people who trust us with their digital presence"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Hero Section (update if exists)
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'hero', '{
  "title1": "SHINE",
  "title2": "BRIGHT",
  "subtitle": "We blend creativity and technology to boost your digital presence.",
  "button_text": "Start Your Project",
  "button_link": "/contact"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- CTA Section
INSERT INTO public.page_sections (page_slug, section_key, content) VALUES
('home', 'cta', '{
  "title": "Ready to Mutate Your Business?",
  "description": "Let''s discuss your next big project and transform your digital presence.",
  "button_text": "Get Started Today",
  "button_link": "/contact"
}'::jsonb)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================
-- 4. Add updated_at trigger for page_metadata
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_page_metadata_updated_at ON public.page_metadata;
CREATE TRIGGER update_page_metadata_updated_at
    BEFORE UPDATE ON public.page_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration Complete
-- ============================================
-- Run this SQL in your Supabase SQL Editor
