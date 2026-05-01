-- Add fields to store CNI identity verification data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cni_number text,
ADD COLUMN IF NOT EXISTS cni_dob text,
ADD COLUMN IF NOT EXISTS cni_expiry text,
ADD COLUMN IF NOT EXISTS cni_mrz text;

-- (Optional) Secure these columns from regular users using RLS if they are sensitive
-- But since users can update their own profile, it is fine as is.
