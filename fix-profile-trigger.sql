-- ============================================================
-- LoyerSûr CI — Fix: Profile Auto-Creation Trigger
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── STEP 1: Recreate the trigger function ─────────────────────
-- Uses SECURITY DEFINER so it can bypass RLS and insert into profiles.
-- agent_id and all newer columns are left NULL — they get set later.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── STEP 2: Drop and recreate the trigger cleanly ─────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── STEP 3: Backfill — create profiles for any existing auth
--            users that are missing a profiles row ──────────────
-- This covers YOUR account that already exists in auth.users
-- but has no matching row in public.profiles.

INSERT INTO public.profiles (id, full_name, email, phone, role, verified)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  u.email,
  COALESCE(u.raw_user_meta_data->>'phone', NULL),
  COALESCE(u.raw_user_meta_data->>'role', 'tenant'),
  false
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);


-- ── STEP 4: Verify ────────────────────────────────────────────
-- You should see your account appear in the results below.

SELECT
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.verified,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;
