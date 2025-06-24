-- Enable half-star ratings and RLS for watchlist_item_reviews
ALTER TABLE public.watchlist_item_reviews
  ALTER COLUMN review_rating TYPE NUMERIC(2,1) USING review_rating::NUMERIC,
  ALTER COLUMN review_rating DROP DEFAULT,
  ALTER COLUMN review_rating DROP NOT NULL;

ALTER TABLE public.watchlist_item_reviews
  DROP CONSTRAINT IF EXISTS watchlist_item_reviews_review_rating_check,
  ADD CONSTRAINT watchlist_item_reviews_review_rating_check CHECK (review_rating >= 0.5 AND review_rating <= 5 AND (review_rating * 10) % 5 = 0);

-- Enable RLS
ALTER TABLE public.watchlist_item_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Only the user can insert/update/delete their review
CREATE POLICY "Users can manage their own reviews"
  ON public.watchlist_item_reviews
  FOR ALL
  USING (user_id = auth.uid());

-- Policy: Members of the watchlist can select reviews for their watchlists
CREATE POLICY "Members can read reviews for their watchlists"
  ON public.watchlist_item_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlist_items wi
      JOIN public.watchlist_members wm ON wi.watchlist_id = wm.watchlist_id
      WHERE wi.id = watchlist_item_reviews.watchlist_item_id
        AND wm.user_id = auth.uid()
    )
  );

-- (Optional) Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_watchlist_item_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.watchlist_item_reviews;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.watchlist_item_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_watchlist_item_reviews_updated_at(); 