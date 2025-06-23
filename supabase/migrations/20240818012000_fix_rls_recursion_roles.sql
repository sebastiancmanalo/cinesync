-- Helper function to safely get a user's role in a watchlist
CREATE OR REPLACE FUNCTION get_watchlist_role(p_watchlist_id uuid, p_user_id uuid)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT role INTO result
  FROM public.watchlist_members
  WHERE watchlist_id = p_watchlist_id AND user_id = p_user_id
  LIMIT 1;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Owners can manage members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners and editors can manage items in watchlists they belong to" ON public.watchlist_items;

-- Recreate policies using the helper function

-- Only owner can manage members
CREATE POLICY "Owners can manage members of their watchlists"
  ON public.watchlist_members
  FOR ALL
  USING (
    get_watchlist_role(watchlist_id, auth.uid()) = 'owner'
  )
  WITH CHECK (
    get_watchlist_role(watchlist_id, auth.uid()) = 'owner'
  );

-- Only owner/editor can add/delete items
CREATE POLICY "Owners and editors can manage items in watchlists they belong to"
  ON public.watchlist_items
  FOR ALL
  USING (
    get_watchlist_role(watchlist_id, auth.uid()) IN ('owner', 'editor')
  )
  WITH CHECK (
    get_watchlist_role(watchlist_id, auth.uid()) IN ('owner', 'editor')
  ); 