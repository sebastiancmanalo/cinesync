-- Drop unified review and watched columns from watchlist_items
ALTER TABLE public.watchlist_items
  DROP COLUMN IF EXISTS review_text,
  DROP COLUMN IF EXISTS review_rating,
  DROP COLUMN IF EXISTS watched,
  DROP COLUMN IF EXISTS watched_at; 