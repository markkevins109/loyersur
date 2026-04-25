-- ============================================================
-- LoyerSûr CI — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Extends auth.users with role and verification status

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  role         TEXT NOT NULL CHECK (role IN ('landlord', 'tenant')),
  verified     BOOLEAN DEFAULT false,
  avatar_url   TEXT,
  trust_score  NUMERIC(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  bio          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ── 2. VERIFICATIONS ──────────────────────────────────────────
-- CNI + Face verification records for landlords

CREATE TABLE IF NOT EXISTS public.verifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cni_front_url   TEXT,
  cni_back_url    TEXT,
  selfie_url      TEXT,
  mrz_data        JSONB,
  extracted_name  TEXT,
  extracted_dob   TEXT,
  extracted_doc_no TEXT,
  face_confidence NUMERIC(5,2),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'manual_review')),
  failure_reason  TEXT,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can insert own verification"
  ON public.verifications FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can read own verification"
  ON public.verifications FOR SELECT USING (auth.uid() = landlord_id);


-- ── 3. PROPERTIES ─────────────────────────────────────────────
-- Real estate listings uploaded by verified landlords

CREATE TABLE IF NOT EXISTS public.properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  title_en        TEXT,
  description     TEXT,
  description_en  TEXT,
  price           INTEGER NOT NULL,                        -- Monthly rent in FCFA
  city            TEXT NOT NULL DEFAULT 'Abidjan',
  neighborhood    TEXT NOT NULL,
  bedrooms        INTEGER NOT NULL DEFAULT 1,
  bathrooms       INTEGER NOT NULL DEFAULT 1,
  area            NUMERIC NOT NULL,                        -- Square meters
  property_type   TEXT DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'villa', 'studio', 'office', 'house')),
  features        TEXT[],                                  -- Amenities list
  features_en     TEXT[],
  images          TEXT[],                                  -- Supabase Storage public URLs
  coordinates     JSONB,                                   -- { lat: number, lng: number }
  verified        BOOLEAN DEFAULT false,
  available       BOOLEAN DEFAULT true,
  rating          NUMERIC(3,1) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read available properties"
  ON public.properties FOR SELECT USING (available = true);

CREATE POLICY "Landlords can insert own properties"
  ON public.properties FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Landlords can update own properties"
  ON public.properties FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Landlords can delete own properties"
  ON public.properties FOR DELETE USING (auth.uid() = agent_id);


-- ── 4. BOOKINGS ───────────────────────────────────────────────
-- Viewing appointment requests from tenants

CREATE TABLE IF NOT EXISTS public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  preferred_date   TIMESTAMPTZ NOT NULL,
  rescheduled_to   TIMESTAMPTZ,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'cancelled', 'completed')),
  message          TEXT,
  agent_note       TEXT,                                   -- Agent's message when rescheduling
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can read own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = agent_id);

CREATE POLICY "Agents can update booking status"
  ON public.bookings FOR UPDATE USING (auth.uid() = agent_id);


-- ── 5. SAVED PROPERTIES ───────────────────────────────────────
-- Tenant wishlist / favourites

CREATE TABLE IF NOT EXISTS public.saved_properties (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, property_id)
);

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants manage own saved properties"
  ON public.saved_properties FOR ALL USING (auth.uid() = tenant_id);


-- ── 6. REVIEWS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can write reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);


-- ── 7. TRIGGER: auto-update updated_at ────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 8. AUTO-CREATE PROFILE ON SIGNUP (CRITICAL) ─────────────
-- This trigger fires whenever a new user signs up via Supabase Auth.
-- It creates a matching row in public.profiles automatically,
-- reading the role from user_metadata set during signup.

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
  ON CONFLICT (id) DO NOTHING;  -- safe to re-run, won't duplicate
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 9. STORAGE BUCKETS (run these separately if needed) ───────
-- In Supabase Dashboard → Storage, create these buckets:
--   - "property-images"  (public)
--   - "cni-documents"    (private)
--   - "selfies"          (private)
