-- =================================================================
-- FINAL, CORRECT RLS POLICIES
-- =================================================================
-- This migration re-enables RLS and establishes the definitive,
-- non-recursive security policies for the application.
-- -----------------------------------------------------------------

-- Step 1: Drop the insecure 'debugging' policies and any old functions.
DROP POLICY IF EXISTS "Allow all access for authenticated users on watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Allow all access for authenticated users on watchlist_members" ON public.watchlist_members;
DROP POLICY IF EXISTS "Allow all access for authenticated users on watchlist_items" ON public.watchlist_items;
DROP FUNCTION IF EXISTS public.check_watchlist_owner(uuid) CASCADE;


-- Step 2: Re-enable Row Level Security on all tables.
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists FORCE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items FORCE ROW LEVEL SECURITY;


-- Step 3: Create a SECURITY DEFINER function to safely check for ownership.
-- This is the key to breaking the recursive loop. This function runs with
-- the permissions of its creator, allowing it to bypass the RLS checks
-- on the watchlists table when called from a policy on another table.
CREATE OR REPLACE FUNCTION public.is_watchlist_owner(list_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.watchlists
    WHERE id = list_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 4: Define the final policies for the 'watchlists' table.

CREATE POLICY "Users can see their own or shared watchlists"
ON public.watchlists FOR SELECT TO authenticated USING (
  (owner_id = auth.uid()) OR
  (EXISTS (
    SELECT 1
    FROM public.watchlist_members
    WHERE watchlist_members.watchlist_id = watchlists.id AND watchlist_members.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their own watchlists"
ON public.watchlists FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own watchlists"
ON public.watchlists FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own watchlists"
ON public.watchlists FOR DELETE TO authenticated
USING (owner_id = auth.uid());


-- Step 5: Define the final policies for the 'watchlist_members' table.

CREATE POLICY "Members can see other members in their watchlists"
ON public.watchlist_members FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.watchlist_members AS m
    WHERE m.watchlist_id = watchlist_members.watchlist_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can add members to their watchlists"
ON public.watchlist_members FOR INSERT TO authenticated
WITH CHECK (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "Owners can update member roles in their watchlists"
ON public.watchlist_members FOR UPDATE TO authenticated
USING (public.is_watchlist_owner(watchlist_id));

CREATE POLICY "Owners or members can leave a watchlist"
ON public.watchlist_members FOR DELETE TO authenticated USING (
  (public.is_watchlist_owner(watchlist_id)) OR
  (user_id = auth.uid())
);


-- Step 6: Define the final policies for the 'watchlist_items' table.

CREATE POLICY "Members can manage items in their watchlists"
ON public.watchlist_items FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.watchlist_members
    WHERE watchlist_members.watchlist_id = watchlist_items.watchlist_id AND watchlist_members.user_id = auth.uid()
  )
); 