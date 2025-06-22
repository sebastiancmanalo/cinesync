-- =================================================================
-- Function and Trigger to Sync Public Users Table
-- =================================================================
-- This migration creates a trigger that automatically inserts a new
-- row into the public.users table whenever a new user signs up
-- in Supabase Auth. This ensures that the foreign key constraint
-- on 'watchlists.owner_id' does not fail.
-- -----------------------------------------------------------------

-- Step 1: Create the function to handle the new user insertion.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the existing trigger if it exists, to make the script re-runnable.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger that calls the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 