-- =================================================================
-- DEFINITIVE RLS DISABLE
-- =================================================================
-- This migration fully disables RLS on all relevant tables to
-- ensure the application is in a stable, working state.
-- -----------------------------------------------------------------

-- Step 1: Drop all functions that were part of previous RLS attempts
DROP FUNCTION IF EXISTS is_watchlist_member(uuid, uuid);
DROP FUNCTION IF EXISTS is_watchlist_owner(uuid, uuid);

-- Step 2: Drop all existing RLS policies on the tables to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Allow authenticated users to read watchlist items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Allow authenticated users to read watchlist members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Members can see other members in their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can see their own or shared watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Owners can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Owners can delete their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Members can view watchlist items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Owners and members can manage watchlist items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Owners can add members to their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Members can leave watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.watchlist_members;

-- Step 3: Disable Row Level Security on all tables
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-create simple, permissive policies to allow access for logged-in users.
-- This ensures the app works without the complexity and errors of the previous RLS setup.
CREATE POLICY "Allow authenticated users to read watchlists"
ON public.watchlists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage watchlists"
ON public.watchlists FOR ALL
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Allow authenticated users to read watchlist items"
ON public.watchlist_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage watchlist items"
ON public.watchlist_items FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read watchlist members"
ON public.watchlist_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage watchlist members"
ON public.watchlist_members FOR ALL
TO authenticated
USING (true);

-- Re-enable RLS with the new, simple policies
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;

-- Ensure public.users is accessible
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to users"
ON public.users FOR SELECT
TO authenticated
USING (true);

ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists FORCE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members FORCE ROW LEVEL SECURITY;

-- Final sanity check: Grant usage on schema to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role; 