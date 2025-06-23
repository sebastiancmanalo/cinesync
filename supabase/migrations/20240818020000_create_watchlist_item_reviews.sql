-- Per-user reviews and watched status for watchlist items
CREATE TABLE public.watchlist_item_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_item_id uuid NOT NULL REFERENCES public.watchlist_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_text TEXT,
  review_rating INTEGER CHECK (review_rating BETWEEN 1 AND 5),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE (watchlist_item_id, user_id)
); 