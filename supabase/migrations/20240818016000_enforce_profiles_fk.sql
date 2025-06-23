-- Enforce referential integrity for watchlist_members.user_id
ALTER TABLE public.watchlist_members
  DROP CONSTRAINT IF EXISTS watchlist_members_user_id_fkey;
ALTER TABLE public.watchlist_members
  ADD CONSTRAINT watchlist_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE; 