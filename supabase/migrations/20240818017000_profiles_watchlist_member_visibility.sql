-- Allow users to view profiles of members in the same watchlist
CREATE POLICY "Users can view profiles of watchlist members"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlist_members
      WHERE user_id = profiles.id
        AND watchlist_id IN (
          SELECT watchlist_id FROM public.watchlist_members WHERE user_id = auth.uid()
        )
    )
    OR id = auth.uid() -- Always allow users to see their own profile
  ); 