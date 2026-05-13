-- Add Integration columns to pixel_clients
ALTER TABLE pixel_clients 
ADD COLUMN IF NOT EXISTS ga_id TEXT,
ADD COLUMN IF NOT EXISTS meta_id TEXT,
ADD COLUMN IF NOT EXISTS google_ads_id TEXT,
ADD COLUMN IF NOT EXISTS tiktok_id TEXT;

-- Add UTM columns to pixel_events for per-event attribution
ALTER TABLE pixel_events
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add Attribution columns to pixel_visitors for first-touch and last-touch analysis
ALTER TABLE pixel_visitors
ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
ADD COLUMN IF NOT EXISTS last_utm_source TEXT;

-- Add Lead Scoring column to pixel_visitors
ALTER TABLE pixel_visitors
ADD COLUMN IF NOT EXISTS intent_score INTEGER DEFAULT 0;
