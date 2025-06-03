-- Create user_google_credentials table
CREATE TABLE user_google_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_google_credentials ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own credentials
CREATE POLICY "Users can view their own credentials"
  ON user_google_credentials
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own credentials
CREATE POLICY "Users can insert their own credentials"
  ON user_google_credentials
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own credentials
CREATE POLICY "Users can update their own credentials"
  ON user_google_credentials
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_google_credentials_updated_at
  BEFORE UPDATE ON user_google_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 