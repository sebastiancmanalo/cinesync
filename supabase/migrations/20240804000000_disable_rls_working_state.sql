-- =================================================================
-- DISABLE RLS - WORKING STATE
-- =================================================================
-- This migration disables RLS and removes all policies to get back
-- to the working state where the application was functioning.
-- -----------------------------------------------------------------

-- Step 1: Drop all RLS policies
DROP POLICY IF EXISTS "Users can see their own or shared watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can create their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Owners can update their own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Owners can delete their own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Members can see other members in their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners can add members to their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners can update member roles in their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners or members can leave a watchlist" ON public.watchlist_members;

DROP POLICY IF EXISTS "Members can manage items in their watchlists" ON public.watchlist_items;

-- Step 2: Drop all functions
DROP FUNCTION IF EXISTS public.is_watchlist_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_watchlist_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_watchlist(uuid) CASCADE;

-- Step 3: Disable RLS on all tables
ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items DISABLE ROW LEVEL SECURITY;

-- Step 4: Create simple permissive policies for authenticated users
CREATE POLICY "Allow all access for authenticated users on watchlists" ON public.watchlists
FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all access for authenticated users on watchlist_members" ON public.watchlist_members
FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all access for authenticated users on watchlist_items" ON public.watchlist_items
FOR ALL TO authenticated USING (true); 