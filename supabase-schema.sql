-- ============================================================
-- UNICORN DESTINATIONS — Supabase Database Setup
-- Run in: Supabase Dashboard → Your Project → SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
--    Extends auth.users with name, phone, and role
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'client'
                   CHECK (role IN ('admin', 'client')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "own_profile_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "own_profile_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "own_profile_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read ALL profiles (for admin dashboard)
CREATE POLICY "admin_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. AUTO-CREATE PROFILE ON SIGN-UP
--    Trigger fires when a new user registers via Supabase Auth
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. AUTO-UPDATE updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- PHONE OTP SETUP
-- ============================================================
-- 1. Go to Supabase Dashboard → Authentication → Providers
-- 2. Enable "Phone" provider
-- 3. Add Twilio credentials (Account SID, Auth Token, Message Service SID)
--    OR use Twilio Verify for OTP delivery
-- ============================================================


-- ============================================================
-- PROMOTE A USER TO ADMIN
-- After registering normally, run this to make them admin:
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';
-- ============================================================