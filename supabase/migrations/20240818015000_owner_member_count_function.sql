-- Function to get the true member count for a watchlist (for the owner)
CREATE OR REPLACE FUNCTION get_watchlist_member_count(p_watchlist_id uuid, p_user_id uuid)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  -- Only allow the owner to get the true count
  IF EXISTS (SELECT 1 FROM public.watchlists WHERE id = p_watchlist_id AND owner_id = p_user_id) THEN
    SELECT count(*) INTO result FROM public.watchlist_members WHERE watchlist_id = p_watchlist_id;
    RETURN result;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 