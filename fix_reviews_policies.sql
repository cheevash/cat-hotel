-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts or errors if they essentially already exist
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

-- Re-create policies
CREATE POLICY "Public reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING ( auth.uid() = user_id );
