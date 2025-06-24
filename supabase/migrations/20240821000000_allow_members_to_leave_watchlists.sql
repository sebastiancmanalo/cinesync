-- Allow members to remove themselves from watchlists
-- This policy allows any member (owner, editor, viewer) to delete their own membership record

CREATE POLICY "Members can remove themselves from watchlists"
  ON public.watchlist_members
  FOR DELETE
  USING (
    user_id = auth.uid()
    AND
    get_watchlist_role(watchlist_id, auth.uid()) IS NOT NULL
  );

-- Note: The existing "Owners can manage members of their watchlists" policy 
-- still allows owners to add/remove any member, while this new policy
-- specifically allows any member to remove themselves 