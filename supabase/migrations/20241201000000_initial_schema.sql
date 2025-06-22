-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlists table
CREATE TABLE public.watchlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist_members table
CREATE TABLE public.watchlist_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(watchlist_id, user_id)
);

-- Create watchlist_items table
CREATE TABLE public.watchlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE NOT NULL,
    tmdb_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    overview TEXT,
    release_date DATE,
    runtime INTEGER,
    media_type TEXT CHECK (media_type IN ('movie', 'tv')) DEFAULT 'movie',
    added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    is_watched BOOLEAN DEFAULT false,
    watched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_watchlists_owner_id ON public.watchlists(owner_id);
CREATE INDEX idx_watchlist_members_watchlist_id ON public.watchlist_members(watchlist_id);
CREATE INDEX idx_watchlist_members_user_id ON public.watchlist_members(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_tmdb_id ON public.watchlist_items(tmdb_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (no recursion)

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Watchlists policies
CREATE POLICY "Users can view owned watchlists" ON public.watchlists
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared watchlists" ON public.watchlists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public watchlists" ON public.watchlists
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update owned watchlists" ON public.watchlists
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete owned watchlists" ON public.watchlists
    FOR DELETE USING (owner_id = auth.uid());

-- Watchlist members policies
CREATE POLICY "Users can view watchlist members" ON public.watchlist_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Watchlist owners can manage members" ON public.watchlist_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_id AND owner_id = auth.uid()
        )
    );

-- Watchlist items policies
CREATE POLICY "Users can view items in accessible watchlists" ON public.watchlist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.watchlists w
            LEFT JOIN public.watchlist_members wm ON w.id = wm.watchlist_id
            WHERE w.id = watchlist_id 
            AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid() OR w.is_public = true)
        )
    );

CREATE POLICY "Users can add items to owned watchlists" ON public.watchlist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can add items to shared watchlists" ON public.watchlist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'editor')
        )
    );

CREATE POLICY "Users can update items in owned watchlists" ON public.watchlist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in shared watchlists" ON public.watchlist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'editor')
        )
    );

CREATE POLICY "Users can delete items from owned watchlists" ON public.watchlist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.watchlists 
            WHERE id = watchlist_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from shared watchlists" ON public.watchlist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.watchlist_members 
            WHERE watchlist_id = watchlist_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'editor')
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_id UUID,
    full_name TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET 
        full_name = COALESCE(update_user_profile.full_name, full_name),
        avatar_url = COALESCE(update_user_profile.avatar_url, avatar_url),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 