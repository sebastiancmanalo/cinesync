-- Create watchlist_events table
CREATE TABLE watchlist_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  watchlist_item_id UUID NOT NULL REFERENCES watchlist_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE watchlist_events ENABLE ROW LEVEL SECURITY;

-- Allow users to view events for watchlists they are members of
CREATE POLICY "Users can view events for their watchlists"
  ON watchlist_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM watchlist_members
      WHERE watchlist_members.watchlist_id = watchlist_events.watchlist_id
      AND watchlist_members.user_id = auth.uid()
    )
  );

-- Allow users to create events for watchlists they are members of
CREATE POLICY "Users can create events for their watchlists"
  ON watchlist_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM watchlist_members
      WHERE watchlist_members.watchlist_id = watchlist_events.watchlist_id
      AND watchlist_members.user_id = auth.uid()
    )
  );

-- Allow users to update events they created
CREATE POLICY "Users can update their own events"
  ON watchlist_events
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Allow users to delete events they created
CREATE POLICY "Users can delete their own events"
  ON watchlist_events
  FOR DELETE
  USING (owner_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_watchlist_events_updated_at
  BEFORE UPDATE ON watchlist_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 