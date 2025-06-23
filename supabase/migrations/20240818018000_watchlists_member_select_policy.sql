-- Allow both owners and members to select (read) watchlists
DROP POLICY IF EXISTS "Owner can access their watchlists" ON public.watchlists;

CREATE POLICY "Members can access watchlists they belong to"
  ON public.watchlists
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.watchlist_members
      WHERE watchlist_id = watchlists.id AND user_id = auth.uid()
    )
  );

-- Keep update/delete restricted to owner only (no change to WITH CHECK policies) 