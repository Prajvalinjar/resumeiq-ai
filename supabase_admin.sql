-- ResumeIQ AI — Admin Setup (Phase 12)
-- Run this in your Supabase SQL Editor

-- Add is_admin column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update the handle_new_user trigger to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, is_admin)
  VALUES (new.id, new.email, 2, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To make a user admin, run:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-admin@email.com';

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
