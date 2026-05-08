-- Create table for pixel clients
CREATE TABLE IF NOT EXISTS public.pixel_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to their login
    company_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    installation_status TEXT DEFAULT 'pending', -- 'pending' or 'verified'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for visitors
CREATE TABLE IF NOT EXISTS public.pixel_visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.pixel_clients(id) ON DELETE CASCADE,
    anonymous_id TEXT NOT NULL, -- The tracking cookie ID
    ip_address TEXT,
    company_name TEXT, -- Identified via IP-API
    city TEXT,
    country TEXT,
    email TEXT, -- Identity Resolution
    first_visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, anonymous_id)
);

-- Create table for events (page views)
CREATE TABLE IF NOT EXISTS public.pixel_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES public.pixel_visitors(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.pixel_clients(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    event_type TEXT DEFAULT 'pageview', -- 'pageview', 'click', 'form_capture'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pixel_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pixel_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES (For the Client Dashboard)
-- --------------------------------------------------------

-- 1. Clients can only see their own client record
CREATE POLICY "Clients can view own profile" 
ON public.pixel_clients FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Clients can only view visitors tagged with their client_id
CREATE POLICY "Clients can view own visitors" 
ON public.pixel_visitors FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM public.pixel_clients WHERE user_id = auth.uid()
  )
);

-- 3. Clients can only view events tagged with their client_id
CREATE POLICY "Clients can view own events" 
ON public.pixel_events FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM public.pixel_clients WHERE user_id = auth.uid()
  )
);

-- Note: All INSERT and UPDATE operations will be handled securely 
-- via the Next.js API route using the Supabase Service Role Key, 
-- which automatically bypasses RLS. This prevents malicious actors 
-- from sending fake traffic directly to the database.
