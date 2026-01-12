-- Create services table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  icon text, -- Storing icon name (e.g., 'Monitor')
  color text,
  bg_gradient text,
  features jsonb,
  content text,
  tools jsonb,
  process jsonb,
  benefits jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.services enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
on public.services
for select
to public
using (true);

-- Insert data
insert into public.services (slug, title, short_description, description, icon, color, bg_gradient, features, content, tools, process, benefits)
values
  (
    'web-development',
    'Web Development',
    'We build clean, fast, good-looking websites that don’t confuse your customers.',
    'We build clean, fast, good-looking websites that don’t confuse your customers or embarrass your business.',
    'Monitor',
    'bg-blue-600',
    'from-blue-600/20 to-purple-600/20',
    '["Custom Website Development", "Ecommerce Website Development", "Responsive Website Design", "CMS Website Development", "Web Application Development"]',
    'People decide in a few seconds whether to stay on your website or close it. A basic or messy site hurts your brand. We combine smart design, clean code, and clear user journeys to build a website that supports your marketing, builds your credibility, and makes it easier for people to contact or buy from you.',
    '["Next.js", "React", "Node.js", "Tailwind CSS", "WordPress", "Shopify"]',
    '[{"step": "01", "title": "Discovery and Planning", "description": "We start by understanding your business, your target audience, and your goals."}, {"step": "02", "title": "Structure and Wireframes", "description": "We plan the structure, including sitemaps and basic wireframes."}, {"step": "03", "title": "Design", "description": "Our team creates clean and modern layouts that match your brand."}, {"step": "04", "title": "Development", "description": "We convert layouts into a working website with clean code."}, {"step": "05", "title": "Testing and Optimization", "description": "We test across devices and browsers, fixing bugs and improving speed."}, {"step": "06", "title": "Launch and Support", "description": "We launch your site and provide ongoing updates and support."}]',
    '[{"title": "Clear Communication", "description": "We speak in simple language, keep you in the loop, and avoid technical confusion."}, {"title": "Focus on Results", "description": "We care about leads, sale, and user experience, not just design or code in isolation."}, {"title": "End-to-End Service", "description": "From idea to launch, everything is handled by our in-house team."}]'
  ),
  (
    'app-development',
    'App Development',
    'Simple, high-performing mobile apps that connect you directly with customers.',
    'Mobile usage is growing faster than ever. We create simple, high-performing, and user-friendly mobile applications that help local brands connect directly with customers.',
    'Smartphone',
    'bg-indigo-600',
    'from-indigo-600/20 to-blue-600/20',
    '["Custom Development", "Ecommerce Development", "iOS & Android Development", "Cross-Platform Solutions"]',
    'Today, your customers spend more time on their phones than anywhere else. Need an app for booking, delivery, or internal management? We build mobile experiences that feel natural, load fast, and work flawlessly.',
    '["React Native", "Flutter", "Swift", "Kotlin", "Firebase"]',
    '[{"step": "01", "title": "Discovery and Planning", "description": "We understand your business model then outline features based on value."}, {"step": "02", "title": "Wireframing and Strategy", "description": "We create visual blueprints to ensure user journeys are smooth."}, {"step": "03", "title": "Design", "description": "Crafting clean, user-friendly layouts matched to your brand style."}, {"step": "04", "title": "Development", "description": "Building with modern frameworks and secure code practices."}, {"step": "05", "title": "Testing and Optimization", "description": "Each version is tested across devices for speed and usability."}, {"step": "06", "title": "Launch and Support", "description": "Monitoring and improving your app based on user feedback."}]',
    '[{"title": "Local Focus", "description": "We understand the local audience and design for their specific behavior."}, {"title": "Transparent Updates", "description": "You are involved at every step with clear updates and honest feedback."}, {"title": "Result-Driven", "description": "Every app we build aims to improve your visibility, usability, and revenue."}]'
  ),
  (
    'digital-marketing',
    'Digital Marketing',
    'Strategies that create meaningful content, consistent visibility, and quality leads.',
    'We verify your brand isn''t built by chance. It''s built by visibility, trust, and timing. We treat marketing like a process, blending creativity with analytics for consistent growth.',
    'BarChart',
    'bg-purple-600',
    'from-purple-600/20 to-pink-600/20',
    '["Social Media Marketing", "Performance Marketing (Ads)", "Content Strategy", "Lead Generation", "Influencer Collaborations"]',
    'Your audience doesn''t just want ads, they want connection. From social media storytelling to high-ROI performance campaigns, we build systems that connect your story to your audience and turn engagement into measurable results.',
    '["Meta Ads", "Google Ads", "LinkedIn", "HubSpot", "Canva"]',
    '[{"step": "01", "title": "Discover", "description": "Understanding your brand, market, and audience."}, {"step": "02", "title": "Strategize", "description": "Every platform and post has a goal tied to your metrics."}, {"step": "03", "title": "Create", "description": "Turning strategy into scroll-stopping design and copy."}, {"step": "04", "title": "Deploy", "description": "Launching, monitoring, and optimizing in real time."}, {"step": "05", "title": "Analyze & Improve", "description": "Monthly insights guide likely next moves for better results."}]',
    '[{"title": "Local Understanding", "description": "We tailor every strategy specifically for your local audience''s behavior."}, {"title": "Measurable ROI", "description": "Whether it''s engagement or cost-per-lead, you see the numbers that matter."}, {"title": "Long-Term Systems", "description": "We don''t run one-off campaigns. We build long-term systems for stable growth."}]'
  ),
  (
    'graphic-design',
    'Graphic Design',
    'Designs that speak before you do—logos, social posts, and brand systems.',
    'Design is not decoration. It’s the first conversation your brand has with the world. We create designs that speak before you do, blending creativity with clarity.',
    'Layout',
    'bg-pink-600',
    'from-pink-600/20 to-rose-600/20',
    '["Creative Graphic Design", "Social Media Design", "Marketing Collateral", "UI/UX Design", "Website Design"]',
    'Poor design can make great ideas invisible. We transform your visual identity—from logos to landing pages—so people don''t just notice your brand, they remember it. Every pixel has a purpose.',
    '["Photoshop", "Illustrator", "Figma", "After Effects", "InDesign"]',
    '[{"step": "01", "title": "Understand", "description": "We dive deep into your brand’s goals, audience, and voice."}, {"step": "02", "title": "Conceptualize", "description": "Brainstorming and refining ideas that align with your story."}, {"step": "03", "title": "Create", "description": "Bringing concepts to life with thoughtful composition."}, {"step": "04", "title": "Collaborate", "description": "You’re part of the process—every draft, every decision."}, {"step": "05", "title": "Deliver", "description": "Polished visuals optimized for performance, print, and pixels."}]',
    '[{"title": "Business Intent", "description": "We design for conversion and communication, not just for decoration."}, {"title": "Consistency", "description": "We ensure your brand looks cohesive across web, social, and print."}, {"title": "Timeless Quality", "description": "We don''t just follow trends; we create visuals that last."}]'
  ),
  (
    'seo',
    'SEO',
    'Smart work that improves your visibility—no magic tricks, just results.',
    'We help your business show up when people search—no magic tricks, just smart work that improves your visibility and brings long-term organic traffic.',
    'Search',
    'bg-green-600',
    'from-green-600/20 to-emerald-600/20',
    '["On-Page SEO", "Off-Page SEO & Link Building", "Technical SEO", "SEO Content Writing", "Ecommerce SEO"]',
    'If your website isn''t optimized, it might never show up. We combine technical structure, valuable content, and trusted backlinks to tell Google clearly: you belong on page one. We build credibility, not just chase algorithms.',
    '["SEMrush", "Ahrefs", "Google Search Console", "Screaming Frog", "Yoast"]',
    '[{"step": "01", "title": "Understand", "description": "Complete audit regarding performance and content gaps."}, {"step": "02", "title": "Plan", "description": "Strategy blending technical optimization, content, and links."}, {"step": "03", "title": "Implement", "description": "Optimizing, writing, and structuring everything for performance."}, {"step": "04", "title": "Measure", "description": "Tracking rankings, traffic, and conversions."}, {"step": "05", "title": "Refine", "description": "Adapting to trends and algorithms to keep you on top."}]',
    '[{"title": "Sustainable Growth", "description": "We use ethical, white-hat techniques that build lasting rankings."}, {"title": "Complete Visibility", "description": "Transparent reporting so you understand exactly what we are doing."}, {"title": "Local Insight", "description": "We understand how local audiences search but optimize with global standards."}]'
  ),
  (
    'geo',
    'GEO',
    'Generative Engine Optimization to get you recommended by AI like ChatGPT.',
    'Search has changed. People are asking AI. We optimize your content so AI models like ChatGPT and Gemini recognize, understand, and recommend your brand.',
    'Globe',
    'bg-cyan-600',
    'from-cyan-600/20 to-blue-600/20',
    '["Structured Content for AI", "Authority Building", "Chatbot Optimization", "AI-Ready Content Creation"]',
    'GEO (Generative Engine Optimization) is the next step after SEO. We align your website and content so AI systems identify you as a credible source and recommend you in their answers.',
    '["Schema.org", "ChatGPT", "Gemini", "Claude", "Perplexity"]',
    '[{"step": "01", "title": "Audit & Discovery", "description": "Analyzing how AI models interpret your brand currently."}, {"step": "02", "title": "Strategy & Planning", "description": "Defining key topics to position your expertise."}, {"step": "03", "title": "Content Optimization", "description": "Restructuring content to match AI patterns."}, {"step": "04", "title": "Authority Building", "description": "Strengthening off-site signals for credibility."}, {"step": "05", "title": "Testing & Tracking", "description": "Simulating AI queries to adjust visibility."}]',
    '[{"title": "Future-Ready", "description": "We prepare your brand for the new era of AI-driven search."}, {"title": "Conversational Visibility", "description": "Get mentioned in direct answers, not just search links."}, {"title": "Content-First", "description": "We focus on high-quality, factual content that builds real authority."}]'
  ),
  (
    'brand-identity',
    'Brand Identity',
    'We build identities, logos, and strategies that look stunning and feel authentic.',
    'Every great brand starts with a story. We help you discover who you are and create a visual and verbal identity that sparks recognition and trust.',
    'Sparkles',
    'bg-fuchsia-600',
    'from-fuchsia-600/20 to-purple-600/20',
    '["Brand Strategy & Positioning", "Logo & Visual Identity", "Brand Voice & Messaging", "Style Guides"]',
    'Your brand is the emotional bridge between your business and your audience. We craft logos, color systems, and messaging that ensure your brand looks and sounds consistent everywhere.',
    '["Illustrator", "Photoshop", "CorelDraw", "Figma"]',
    '[{"step": "01", "title": "Discovery & Research", "description": "Understanding your vision, audience, and market."}, {"step": "02", "title": "Strategy & Concept", "description": "Defining positioning and creative direction."}, {"step": "03", "title": "Visual Identity Design", "description": "Crafting logos, color systems, and typography."}, {"step": "04", "title": "Voice & Messaging", "description": "Shaping how your brand speaks and connects."}, {"step": "05", "title": "Implementation", "description": "Applying the brand across web, social, and print."}]',
    '[{"title": "Strategic Thinking", "description": "Every color and shape has a purpose tied to your business goals."}, {"title": "Creative Consistency", "description": "We unify your visuals across web, social, and print."}, {"title": "Local & Global", "description": "We tailor designs to resonate with both local culture and global standards."}]'
  ),
  (
    'cyber-security',
    'Cyber Security',
    'Proactive protection to keep your business safe from digital threats.',
    'We help businesses stay secure in an era of digital threats. Our focus is simple: prevention, protection, and peace of mind for your data and systems.',
    'Shield',
    'bg-red-600',
    'from-red-600/20 to-orange-600/20',
    '["Vulnerability Assessment (VAPT)", "Risk Assessment", "Managed Security (SOC)", "Data Protection Training"]',
    'A single breach can cost trust. We don''t wait for incidents; we anticipate them. Our services cover network testing, security audits, and real-time monitoring to ensure your business resilience.',
    '["Burp Suite", "Nmap", "Metasploit", "Wireshark", "Kali Linux"]',
    '[{"step": "01", "title": "Audit & Discovery", "description": "Evaluating your current infrastructure and vulnerabilities."}, {"step": "02", "title": "Vulnerability Mapping", "description": "Categorizing potential threats by severity."}, {"step": "03", "title": "Strategic Planning", "description": "Designing a custom defense strategy."}, {"step": "04", "title": "Implementation & Monitoring", "description": "Deploying measures and monitoring continuously."}, {"step": "05", "title": "Incident Response", "description": "Analyzing and containing any incidents swiftly."}]',
    '[{"title": "Proactive Defense", "description": "We monitor and prevent threats, not just react to them."}, {"title": "Custom Solutions", "description": "Security tailored to your specific industry and risks."}, {"title": "Peace of Mind", "description": "Focus on your business knowing your digital back is covered."}]'
  ),
  (
    'ai-automations',
    'AI Automations',
    'Systems that do the boring tasks for you, so your business runs smoother.',
    'The future is about working smarter. We integrate AI-powered automation into your workflows, marketing, and CRM to save time and scale faster.',
    'Brain',
    'bg-teal-600',
    'from-teal-600/20 to-emerald-600/20',
    '["Workflow Automation", "Marketing Automation", "CRM Integration", "Business Process Automation"]',
    'Stop doing manual data entry. We connect your tools (like CRMs, email, website) so they talk to each other. From nurturing leads while you sleep to automating invoices, we build systems that run like clockwork.',
    '["Zapier", "Make.com", "OpenAI API", "HubSpot", "GoHighLevel"]',
    '[{"step": "01", "title": "Workflow Analysis", "description": "Mapping out existing systems to find improvements."}, {"step": "02", "title": "Tool Selection", "description": "Choosing the best tools for your business needs."}, {"step": "03", "title": "Integration & Setup", "description": "Connecting systems and designing logic flows."}, {"step": "04", "title": "Testing & Optimization", "description": "Running tests to ensure accuracy and efficiency."}, {"step": "05", "title": "Training & Support", "description": "Guiding your team to operate the automation ecosystem."}]',
    '[{"title": "Fewer Errors", "description": "Automated workflows remove the risk of human error."}, {"title": "Faster Execution", "description": "Tasks that took hours now happen instantly."}, {"title": "Scalability", "description": "Handle more clients and work without increasing your manual workload."}]'
  );
