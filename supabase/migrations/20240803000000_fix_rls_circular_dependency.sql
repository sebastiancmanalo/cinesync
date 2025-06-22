-- =================================================================
-- FIX RLS CIRCULAR DEPENDENCY
-- =================================================================
-- This migration fixes the infinite recursion caused by circular
-- dependencies in the RLS policies.
-- -----------------------------------------------------------------

-- Step 1: Drop the problematic policies that cause circular references
DROP POLICY IF EXISTS "Members can see other members in their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can see their own or shared watchlists" ON public.watchlists;

-- Step 2: Create a SECURITY DEFINER function to check if user is a member
-- This function bypasses RLS and can safely check membership
CREATE OR REPLACE FUNCTION public.is_watchlist_member(list_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.watchlist_members
    WHERE watchlist_id = list_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a SECURITY DEFINER function to check if user owns or is member
CREATE OR REPLACE FUNCTION public.can_access_watchlist(list_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.watchlists
    WHERE id = list_id AND owner_id = auth.uid()
  ) OR public.is_watchlist_member(list_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the watchlists SELECT policy using the function
CREATE POLICY "Users can see their own or shared watchlists"
ON public.watchlists FOR SELECT TO authenticated USING (
  public.can_access_watchlist(id)
);

-- Step 5: Recreate the watchlist_members SELECT policy using the function
CREATE POLICY "Members can see other members in their watchlists"
ON public.watchlist_members FOR SELECT TO authenticated USING (
  public.can_access_watchlist(watchlist_id)
); 