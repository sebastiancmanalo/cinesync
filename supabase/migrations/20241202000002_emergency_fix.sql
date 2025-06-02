-- EMERGENCY FIX: Completely reset RLS policies to fix infinite recursion

-- Step 1: Check current policies (uncomment to run)
-- SELECT * FROM pg_policies WHERE tablename IN ('watchlists', 'watchlist_members');

-- Step 2: Disable RLS temporarily to test if that's the issue
ALTER TABLE watchlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_invitations DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view watchlists they own or are members of" ON watchlists;
DROP POLICY IF EXISTS "Users can view their own watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can view shared watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can create watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlists" ON watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlists" ON watchlists;
DROP POLICY IF EXISTS "watchlists_select_own" ON watchlists;
DROP POLICY IF EXISTS "watchlists_select_member" ON watchlists;
DROP POLICY IF EXISTS "watchlists_insert" ON watchlists;
DROP POLICY IF EXISTS "watchlists_update" ON watchlists;
DROP POLICY IF EXISTS "watchlists_delete" ON watchlists;

DROP POLICY IF EXISTS "Users can view their own memberships" ON watchlist_members;
DROP POLICY IF EXISTS "Users can view members of their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can view all memberships" ON watchlist_members;
DROP POLICY IF EXISTS "Users can create memberships for their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can create memberships" ON watchlist_members;
DROP POLICY IF EXISTS "Users can update memberships in their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can update memberships" ON watchlist_members;
DROP POLICY IF EXISTS "Users can delete memberships from their watchlists" ON watchlist_members;
DROP POLICY IF EXISTS "Users can delete memberships" ON watchlist_members;
DROP POLICY IF EXISTS "members_select_all" ON watchlist_members;
DROP POLICY IF EXISTS "members_insert" ON watchlist_members;
DROP POLICY IF EXISTS "members_update" ON watchlist_members;
DROP POLICY IF EXISTS "members_delete" ON watchlist_members;

-- Step 4: Re-enable RLS with extremely simple policies
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_invitations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create extremely simple policies that won't cause recursion
-- Watchlists: Allow all operations for authenticated users
CREATE POLICY "allow_all_watchlists" ON watchlists FOR ALL TO authenticated USING (true);

-- Watchlist Members: Allow all operations for authenticated users
CREATE POLICY "allow_all_members" ON watchlist_members FOR ALL TO authenticated USING (true);

-- Watchlist Items: Allow all operations for authenticated users
CREATE POLICY "allow_all_items" ON watchlist_items FOR ALL TO authenticated USING (true);

-- Votes: Allow all operations for authenticated users
CREATE POLICY "allow_all_votes" ON votes FOR ALL TO authenticated USING (true);

-- Comments: Allow all operations for authenticated users
CREATE POLICY "allow_all_comments" ON comments FOR ALL TO authenticated USING (true);

-- Watchlist Invitations: Allow all operations for authenticated users
CREATE POLICY "allow_all_invitations" ON watchlist_invitations FOR ALL TO authenticated USING (true);
