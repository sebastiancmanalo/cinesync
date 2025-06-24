-- Fix get_watchlist_member_count to always return the correct member count for any user
CREATE OR REPLACE FUNCTION get_watchlist_member_count(p_watchlist_id uuid, p_user_id uuid)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT count(*) INTO result FROM public.watchlist_members WHERE watchlist_id = p_watchlist_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 