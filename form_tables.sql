-- Create Subscribers Table for Newsletter
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert their email (Newsletter signup)
CREATE POLICY "Allow public insert" ON subscribers FOR INSERT WITH CHECK (true);

-- Allow authenticated to read (Admin)
CREATE POLICY "Allow authenticated read" ON subscribers FOR SELECT USING (auth.role() = 'authenticated');


-- Create Comments Table for Blog
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public to read comments
CREATE POLICY "Allow public read" ON comments FOR SELECT USING (true);

-- Allow public to post comments
CREATE POLICY "Allow public insert" ON comments FOR INSERT WITH CHECK (true);

-- Allow authenticated to delete/edit (Admin)
CREATE POLICY "Allow admin manage" ON comments FOR ALL USING (auth.role() = 'authenticated');
