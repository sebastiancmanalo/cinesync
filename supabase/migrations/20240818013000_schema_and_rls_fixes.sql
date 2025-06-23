-- 1. Alter watchlist_items to add all expected columns
ALTER TABLE public.watchlist_items
  ADD COLUMN IF NOT EXISTS movie_id INTEGER,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS overview TEXT,
  ADD COLUMN IF NOT EXISTS poster_path TEXT,
  ADD COLUMN IF NOT EXISTS backdrop_path TEXT,
  ADD COLUMN IF NOT EXISTS release_date TEXT,
  ADD COLUMN IF NOT EXISTS runtime INTEGER,
  ADD COLUMN IF NOT EXISTS vote_average NUMERIC,
  ADD COLUMN IF NOT EXISTS genres JSONB,
  ADD COLUMN IF NOT EXISTS watched BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS watched_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS media_type TEXT;

-- 2. Drop problematic RLS policies
DROP POLICY IF EXISTS "Owners can manage members of their watchlists" ON public.watchlist_members;
DROP POLICY IF EXISTS "Owners and editors can manage items in watchlists they belong to" ON public.watchlist_items;

-- 3. Recreate correct RLS policies
-- Only the owner (from watchlists) can manage members
CREATE POLICY "Owners can manage members of their watchlists"
  ON public.watchlist_members
  FOR ALL
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
  )
  WITH CHECK (
    is_watchlist_owner(watchlist_id, auth.uid())
  );

-- Only owner/editor can add/delete items (use get_watchlist_role)
CREATE POLICY "Owners and editors can manage items in watchlists they belong to"
  ON public.watchlist_items
  FOR ALL
  USING (
    get_watchlist_role(watchlist_id, auth.uid()) IN ('owner', 'editor')
  )
  WITH CHECK (
    get_watchlist_role(watchlist_id, auth.uid()) IN ('owner', 'editor')
  ); 