-- Supabase Storage Setup SQL
-- Run this in your Supabase SQL Editor to create the images bucket and policies

-- 1. Create the 'images' storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create storage policies for the 'images' bucket

-- Policy: Allow public to view images
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Policy: Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );

-- 4. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Verification query - run this to check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'images';
