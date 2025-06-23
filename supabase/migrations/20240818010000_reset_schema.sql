-- Drop all relevant tables if they exist
DROP TABLE IF EXISTS public.watchlist_items CASCADE;
DROP TABLE IF EXISTS public.watchlist_members CASCADE;
DROP TABLE IF EXISTS public.watchlists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate the schema with all correct columns and constraints

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT
);

CREATE TABLE public.watchlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE public.watchlist_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id uuid NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE (watchlist_id, user_id)
);

CREATE TABLE public.watchlist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id uuid NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL,
    media_type TEXT NOT NULL,
    added_by uuid NOT NULL REFERENCES public.profiles(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Trigger for copying email to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_watchlist_owner(p_watchlist_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.watchlists
    WHERE id = p_watchlist_id AND owner_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_watchlist_member(p_watchlist_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.watchlist_members
    WHERE watchlist_id = p_watchlist_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can access their watchlists"
  ON public.watchlists
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can view members of watchlists they belong to"
  ON public.watchlist_members
  FOR SELECT
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  );
CREATE POLICY "Owners can manage members of their watchlists"
  ON public.watchlist_members
  FOR ALL
  USING (is_watchlist_owner(watchlist_id, auth.uid()))
  WITH CHECK (is_watchlist_owner(watchlist_id, auth.uid()));

CREATE POLICY "Users can view items in watchlists they belong to"
  ON public.watchlist_items
  FOR SELECT
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  );
CREATE POLICY "Members can manage items in watchlists they belong to"
  ON public.watchlist_items
  FOR ALL
  USING (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  )
  WITH CHECK (
    is_watchlist_owner(watchlist_id, auth.uid())
    OR
    is_watchlist_member(watchlist_id, auth.uid())
  );

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid()); 