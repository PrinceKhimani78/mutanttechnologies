-- Add additional_images column to portfolio table
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS allows access (should be covered by existing policy, but good to check)
-- This assumes public read access is already enabled as per previous walkthrough.
