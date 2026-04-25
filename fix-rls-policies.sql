-- ============================================================================
-- LoyerSûr CI — RLS Policy Fix
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================
--
-- DIAGNOSIS:
-- ┌─────────────┬────────────┬──────────┬─────────────────────┐
-- │ Table       │ Column     │ DB Type  │ FK Target           │
-- ├─────────────┼────────────┼──────────┼─────────────────────┤
-- │ profiles    │ id         │ UUID     │ auth.users.id       │
-- │ profiles    │ agent_id   │ TEXT     │ (unique, nullable)  │
-- │ properties  │ agent_id   │ TEXT     │ profiles.agent_id   │
-- │ bookings    │ agent_id   │ UUID     │ profiles.id         │
-- └─────────────┴────────────┴──────────┴─────────────────────┘
--
-- KEY INSIGHT:
--   properties.agent_id is TEXT (e.g. "sree0327") → FK to profiles.agent_id
--   bookings.agent_id   is UUID (e.g. "263d7b...")  → FK to profiles.id
--
-- The properties RLS must compare TEXT agent_id via a subquery.
-- The bookings RLS can compare UUID directly with auth.uid().
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: DROP ALL EXISTING PROPERTIES POLICIES (clean slate)
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Anyone can read properties"          ON public.properties;
DROP POLICY IF EXISTS "Landlords can insert own properties"  ON public.properties;
DROP POLICY IF EXISTS "Landlords can update own properties"  ON public.properties;
DROP POLICY IF EXISTS "Landlords can delete own properties"  ON public.properties;

-- Make sure RLS is enabled
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: RECREATE PROPERTIES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- SELECT: Anyone (including anonymous visitors) can browse listings
CREATE POLICY "properties_select_anyone"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: Only authenticated landlords can insert, and only with their own agent_id
-- The subquery resolves auth.uid() (UUID) → profiles.agent_id (TEXT)
-- so it can be compared against properties.agent_id (TEXT).
CREATE POLICY "properties_insert_own"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = (
      SELECT p.agent_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );

-- UPDATE: Landlords can only update their own properties
CREATE POLICY "properties_update_own"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (
    agent_id = (
      SELECT p.agent_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );

-- DELETE: Landlords can only delete their own properties
CREATE POLICY "properties_delete_own"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (
    agent_id = (
      SELECT p.agent_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: DROP AND RECREATE BOOKINGS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════
-- bookings.agent_id is UUID → FK to profiles.id
-- bookings.tenant_id is UUID → FK to profiles.id
-- auth.uid() returns UUID → direct comparison works

DROP POLICY IF EXISTS "Tenants can create bookings"    ON public.bookings;
DROP POLICY IF EXISTS "Tenants can read own bookings"  ON public.bookings;
DROP POLICY IF EXISTS "Agents can update booking status" ON public.bookings;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- SELECT: Tenants see their own bookings, agents see bookings for their properties
CREATE POLICY "bookings_select_own"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = tenant_id
    OR auth.uid() = agent_id
  );

-- INSERT: Only tenants can create bookings (tenant_id must match caller)
CREATE POLICY "bookings_insert_tenant"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = tenant_id
  );

-- UPDATE: Only the agent can update booking status (confirm/reschedule/cancel)
CREATE POLICY "bookings_update_agent"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = agent_id
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: VERIFY — Quick sanity check
-- ═══════════════════════════════════════════════════════════════════════════════

-- This should show the new policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('properties', 'bookings')
ORDER BY tablename, cmd;


-- ═══════════════════════════════════════════════════════════════════════════════
-- TROUBLESHOOTING: If INSERT still fails after running this, check:
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- 1. Verify that the logged-in user has a profiles row with agent_id set:
--    SELECT id, agent_id, role, verified FROM profiles WHERE id = '<your-auth-uid>';
--
-- 2. Verify the insert is sending the correct agent_id TEXT value:
--    The code must send  agent_id: profile.agent_id  (e.g. "sree0327")
--    NOT  agent_id: profile.id  (the UUID)
--
-- 3. Verify the user's JWT role is "authenticated" (not "anon"):
--    SELECT auth.uid(), auth.role();  -- run as the user
--
-- 4. If agent_id is NULL in profiles, the subquery returns NULL,
--    and NULL = NULL is false in SQL → insert denied.
--    Fix: UPDATE profiles SET agent_id = 'sree0327' WHERE id = '<uuid>';
