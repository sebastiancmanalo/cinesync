-- =================================================================
-- COMPLETELY DISABLE RLS FOR DEBUGGING
-- =================================================================
-- This migration completely disables RLS on all tables to eliminate
-- any possibility of infinite recursion. This is INSECURE and for
-- debugging only.
-- -----------------------------------------------------------------

-- Step 1: Drop all old policies and functions for a clean slate.
-- Use CASCADE to handle dependencies automatically.

-- Drop all policies on watchlists
DROP POLICY IF EXISTS "Enable read access for watchlist owners and members" ON public.watchlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users with correct owner" ON public.watchlists;
DROP POLICY IF EXISTS "Enable update for watchlist owners" ON public.watchlists;
DROP POLICY IF EXISTS "Enable delete for watchlist owners" ON public.watchlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.watchlists;
DROP POLICY IF EXISTS "Enable full access for members of the watchlist" ON public.watchlists;

-- Drop all policies on watchlist_members
DROP POLICY IF EXISTS "Enable read access for fellow members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Allow members to be added by watchlist owners" ON public.watchlist_members;
DROP POLICY IF EXISTS "Allow members to update their own role" ON public.watchlist_members;
DROP POLICY IF EXISTS "Allow members to be removed by owner or themselves" ON public.watchlist_members;
DROP POLICY IF EXISTS "Enable full access for members of the watchlist" ON public.watchlist_members;

-- Drop all policies on watchlist_items
DROP POLICY IF EXISTS "Enable read access for members" ON public.watchlist_items;
DROP POLICY IF EXISTS "Allow members to add items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Allow members to update items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Allow members to delete items" ON public.watchlist_items;
DROP POLICY IF EXISTS "Enable full access for members of the watchlist" ON public.watchlist_items;

-- Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.is_member_of(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_owner_of(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_is_member(uuid) CASCADE;

-- Step 2: COMPLETELY DISABLE RLS on all tables
-- This is the most aggressive approach to eliminate recursion

ALTER TABLE public.watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items DISABLE ROW LEVEL SECURITY; 