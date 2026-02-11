-- 1. Ensure the 'images' and 'assets' buckets exist
-- This part usually works as it's just an INSERT
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Note: We are skipping 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY' 
-- as it requires ownership permissions that the default SQL Editor role might not have 
-- in some projects. RLS is typically enabled by default for storage.

-- 2. Drop existing policies to avoid conflicts
-- For 'images' bucket
DROP POLICY IF EXISTS "Public Access to Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- For 'assets' bucket
DROP POLICY IF EXISTS "Public Access to Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON storage.objects;

-- 3. Create comprehensive policies for 'images'

-- Allow public to view images (SELECT)
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow authenticated users to upload images (INSERT)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Allow authenticated users to update their images (UPDATE)
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

-- Allow authenticated users to delete images (DELETE)
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );

-- 4. Create comprehensive policies for 'assets'

-- Allow public to view assets (SELECT)
CREATE POLICY "Public Access to Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- Allow authenticated users to upload assets (INSERT)
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' );

-- Allow authenticated users to update their assets (UPDATE)
CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'assets' );

-- Allow authenticated users to delete assets (DELETE)
CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'assets' );
