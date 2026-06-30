-- ResumeIQ AI — Shared Reports Table (Phase 11)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.shared_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id text NOT NULL, -- references analyses.id
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shared links
DROP POLICY IF EXISTS "Users can view their own shared links" ON public.shared_reports;
CREATE POLICY "Users can view their own shared links"
  ON public.shared_reports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create shared links" ON public.shared_reports;
CREATE POLICY "Users can create shared links"
  ON public.shared_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their shared links" ON public.shared_reports;
CREATE POLICY "Users can delete their shared links"
  ON public.shared_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access for shared reports via token (used by the share page)
-- This allows anyone with the token to read the share record
DROP POLICY IF EXISTS "Anyone can view shared reports by token" ON public.shared_reports;
CREATE POLICY "Anyone can view shared reports by token"
  ON public.shared_reports FOR SELECT
  USING (true);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_shared_reports_token ON public.shared_reports(share_token);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
