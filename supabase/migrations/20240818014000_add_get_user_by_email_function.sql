-- Add a function to look up a user by email in public.profiles
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id uuid,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
    SELECT id, full_name, avatar_url, email
    FROM public.profiles
    WHERE lower(email) = lower(user_email)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 