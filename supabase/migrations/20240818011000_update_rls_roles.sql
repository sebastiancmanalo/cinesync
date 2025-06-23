-- Update RLS policies for role-based access

-- Remove old policies
DROP POLICY IF EXISTS "Owner can access their watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can view members of watchlists they belong to" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners can manage members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Users can view items in watchlists they belong to" ON public.watchlist_items;
DROP POLICY IF EXISTS "Members can manage items in watchlists they belong to" ON public.watchlist_items;

-- Watchlists: Only owner can select, update, delete
CREATE POLICY "Owner can access and delete their watchlists"
  ON public.watchlists
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Watchlist Members: Only owner can add/remove, all members can view
CREATE POLICY "Users can view members of watchlists they belong to"
  ON public.watchlist_members
  FOR SELECT
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  );
CREATE POLICY "Owners can manage members of their watchlists"
  ON public.watchlist_members
  FOR ALL
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    AND (
      SELECT role FROM public.watchlist_members
      WHERE watchlist_id = watchlist_members.watchlist_id AND user_id = auth.uid()
    ) = 'owner'
  )
  WITH CHECK (
    is_watchlist_owner(watchlist_id, auth.uid())
    AND (
      SELECT role FROM public.watchlist_members
      WHERE watchlist_id = watchlist_members.watchlist_id AND user_id = auth.uid()
    ) = 'owner'
  );

-- Watchlist Items: Owner and editor can add/delete, viewer can only view
CREATE POLICY "Users can view items in watchlists they belong to"
  ON public.watchlist_items
  FOR SELECT
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  );
CREATE POLICY "Owners and editors can manage items in watchlists they belong to"
  ON public.watchlist_items
  FOR ALL
  USING (
    (
      SELECT role FROM public.watchlist_members
      WHERE watchlist_id = watchlist_items.watchlist_id AND user_id = auth.uid()
    ) IN ('owner', 'editor')
  )
  WITH CHECK (
    (
      SELECT role FROM public.watchlist_members
      WHERE watchlist_id = watchlist_items.watchlist_id AND user_id = auth.uid()
    ) IN ('owner', 'editor')
  ); 