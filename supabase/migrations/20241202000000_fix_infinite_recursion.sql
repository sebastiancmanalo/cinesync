-- Fix infinite recursion in RLS policies
-- Drop all existing policies that cause circular references

DROP POLICY IF EXISTS "Users can view watchlists they own or are members of" ON watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON watchlists;

DROP POLICY IF EXISTS "Users can view their own memberships" ON watchlist_members;
DROP POLICY IF EXISTS "Users can view members of their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can create memberships for their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can update memberships in their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can delete memberships from their watchlists" ON watchlist_members;

-- Create simple, non-recursive policies for watchlists
CREATE POLICY "Users can view their own watchlists"
  ON watchlists
  FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared watchlists"
  ON watchlists
  FOR SELECT
  USING (
    id IN (
      SELECT watchlist_id 
      FROM watchlist_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create watchlists"
  ON watchlists
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own watchlists"
  ON watchlists
  FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own watchlists"
  ON watchlists
  FOR DELETE
  USING (owner_id = auth.uid());

-- Create simple policies for watchlist_members
CREATE POLICY "Users can view all memberships"
  ON watchlist_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create memberships"
  ON watchlist_members
  FOR INSERT
  WITH CHECK (
    -- Allow if user is the owner of the watchlist
    EXISTS (
      SELECT 1 FROM watchlists 
      WHERE id = watchlist_id 
      AND owner_id = auth.uid()
    )
    OR
    -- Allow if user is adding themselves
    user_id = auth.uid()
  );

CREATE POLICY "Users can update memberships"
  ON watchlist_members
  FOR UPDATE
  USING (
    -- Allow if user is the owner of the watchlist
    EXISTS (
      SELECT 1 FROM watchlists 
      WHERE id = watchlist_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memberships"
  ON watchlist_members
  FOR DELETE
  USING (
    -- Allow if user is the owner of the watchlist
    EXISTS (
      SELECT 1 FROM watchlists 
      WHERE id = watchlist_id 
      AND owner_id = auth.uid()
    )
    OR
    -- Allow if user is removing themselves
    user_id = auth.uid()
  );
