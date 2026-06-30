-- ResumeIQ AI — Comprehensive RLS Policies
-- Run this after all tables have been created

-- =============================================
-- ANALYSES TABLE — Add missing UPDATE policy
-- =============================================
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.analyses;
CREATE POLICY "Users can update their own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- RESUME_REPORTS TABLE — Full CRUD policies
-- (Already created in supabase_reports.sql,
--  included here for completeness)
-- =============================================
ALTER TABLE public.resume_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reports" ON public.resume_reports;
CREATE POLICY "Users can view their own reports"
  ON public.resume_reports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.resume_reports;
CREATE POLICY "Users can insert their own reports"
  ON public.resume_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reports" ON public.resume_reports;
CREATE POLICY "Users can update their own reports"
  ON public.resume_reports FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reports" ON public.resume_reports;
CREATE POLICY "Users can delete their own reports"
  ON public.resume_reports FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- CHAT_MESSAGES TABLE — Add missing DELETE policy
-- =============================================
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
