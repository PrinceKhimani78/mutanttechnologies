-- Seed 'About' Page Content
INSERT INTO page_sections (page_slug, section_key, content)
VALUES 
(
    'about', 
    'hero', 
    '{"title": "About Mutant", "subtitle": "Redefining the digital landscape through innovation and creativity."}'::jsonb
),
(
    'about',
    'features',
    '[
        {"title": "Our Mission", "desc": "To empower businesses with digital solutions that drive real, measurable growth.", "icon": "Target"},
        {"title": "Our Vision", "desc": "To be the global standard for creative innovation and technical excellence.", "icon": "Lightbulb"},
        {"title": "Our Team", "desc": "A collective of passionate designers, developers, and strategists.", "icon": "Users"}
    ]'::jsonb
);

-- Seed 'Services' Page Header
INSERT INTO page_sections (page_slug, section_key, content)
VALUES
(
    'services',
    'header',
    '{"title": "What We Do", "subtitle": "Comprehensive digital solutions aligned with your goals."}'::jsonb
);

-- Seed 'Portfolio' Page Header
INSERT INTO page_sections (page_slug, section_key, content)
VALUES
(
    'portfolio',
    'header',
    '{"title": "Our Work", "subtitle": "A showcase of our finest digital creations."}'::jsonb
);
