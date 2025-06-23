-- Add review fields to watchlist_items
ALTER TABLE public.watchlist_items
  ADD COLUMN IF NOT EXISTS review_text TEXT,
  ADD COLUMN IF NOT EXISTS review_rating INTEGER CHECK (review_rating BETWEEN 1 AND 5); 