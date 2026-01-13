-- Create Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON testimonials FOR ALL USING (auth.role() = 'authenticated');


-- Create Ongoing Projects Table
CREATE TABLE IF NOT EXISTS ongoing_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    color TEXT DEFAULT 'bg-blue-500', 
    year TEXT DEFAULT '2024',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Ongoing Projects
ALTER TABLE ongoing_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON ongoing_projects FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON ongoing_projects FOR ALL USING (auth.role() = 'authenticated');


-- Seed Initial Testimonials (from current code)
INSERT INTO testimonials (quote, author, role, rating) VALUES
('Mutant Technologies delivered on every promise. Their in-depth understanding of digital marketing has propelled our product to new heights.', 'Issa Yattassaye', 'Product Manager', 5),
('From start to finish, Mutant Technologies provided stellar service and results. Their dedication and skill have made a remarkable difference for us.', 'Kim Loah', 'Manager', 5),
('The team at Mutant Technologies transformed our online strategy with their expertise and creativity. Their commitment to our growth has been exceptional.', 'Nicolas Boucher', 'Head Marketing', 5),
('Working with Mutant Technologies has been a game-changer. Their tailored approach and strategic insights have significantly enhanced our digital presence.', 'Rohit Maharjan', 'Head Marketing', 5);


-- Seed Initial Ongoing Projects (from current code, using placeholders)
INSERT INTO ongoing_projects (title, category, description, image_url, color, year) VALUES
('Neon Horizon', 'Web Application', 'A futuristic dashboard for managing IoT devices in smart cities.', '/ongoing-1.jpg', 'bg-cyan-500', '2024'),
('Vertex AI', 'Machine Learning', 'AI-driven analytics platform for predicting market trends.', '/ongoing-2.jpg', 'bg-violet-500', '2024'),
('Cyber Shield', 'Security', 'Enterprise-grade firewall management and threat detection system.', '/ongoing-3.jpg', 'bg-red-500', '2025');


-- Add Marquee Text to Site Settings
INSERT INTO site_settings (key, value, label, input_type) VALUES
('marquee_text', 'Web Development • SEO • Digital Marketing • Cyber Security •', 'Scrolling Marquee Text', 'text')
ON CONFLICT (key) DO NOTHING;
