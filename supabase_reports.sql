-- ResumeIQ AI — Resume Reports Table
-- Run this in your Supabase SQL Editor after the initial setup

-- Create resume_reports table
CREATE TABLE IF NOT EXISTS public.resume_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  resume_text text,
  ats_score integer NOT NULL DEFAULT 0,
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  missing_keywords jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  job_role text NOT NULL DEFAULT '',
  report_url text,
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.resume_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own records

-- SELECT: Users can read their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.resume_reports;
CREATE POLICY "Users can view their own reports"
  ON public.resume_reports FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own reports
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.resume_reports;
CREATE POLICY "Users can insert their own reports"
  ON public.resume_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own reports
DROP POLICY IF EXISTS "Users can update their own reports" ON public.resume_reports;
CREATE POLICY "Users can update their own reports"
  ON public.resume_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can delete their own reports
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.resume_reports;
CREATE POLICY "Users can delete their own reports"
  ON public.resume_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_resume_reports_updated_at ON public.resume_reports;
CREATE TRIGGER update_resume_reports_updated_at
  BEFORE UPDATE ON public.resume_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_resume_reports_user_id ON public.resume_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_reports_ats_score ON public.resume_reports(ats_score);
CREATE INDEX IF NOT EXISTS idx_resume_reports_created_at ON public.resume_reports(created_at DESC);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
