-- Indexing activity log
-- Records every sitemap resubmission, index-status check, and IndexNow push
-- made from /admin/seo/indexing, so past actions and errors stay visible
-- instead of only showing whatever the last live check returned.

CREATE TABLE IF NOT EXISTS public.indexing_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,       -- 'sitemap_submit' | 'inspect' | 'indexnow_submit'
  url TEXT,                   -- null for sitemap-level actions
  status TEXT NOT NULL,       -- 'success' | 'error'
  message TEXT,               -- short human-readable result or error
  triggered_by TEXT,          -- admin email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS indexing_log_created_at_idx ON public.indexing_log (created_at DESC);

-- RLS on, no policies: this table is only ever read/written by server routes
-- using the service role key (which bypasses RLS), never directly from the
-- browser client - so no anon/authenticated policy is needed.
ALTER TABLE public.indexing_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================
