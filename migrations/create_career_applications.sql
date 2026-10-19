-- Migration: create_career_applications.sql
-- Table to store candidate job applications from the careers portal

CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES careers(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'shortlisted', 'rejected'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to submit their application (insert)
CREATE POLICY "Allow public insert career_applications" 
ON career_applications FOR INSERT WITH CHECK (true);

-- Allow authenticated users (Admin) full access to read and update
CREATE POLICY "Allow admin manage career_applications" 
ON career_applications FOR ALL USING (auth.role() = 'authenticated');
