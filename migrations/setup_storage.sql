-- Create the assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the assets bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Allow authenticated uploads (if you have auth setup)
-- If you want public uploads (dangerous but for testing):
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'assets');

-- Allow owner to update/delete
CREATE POLICY "Public Update/Delete" ON storage.objects
FOR ALL USING (bucket_id = 'assets');
