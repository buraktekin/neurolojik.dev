-- Migration: Add atomic view count increment function
-- This ensures view counts are accurate even with concurrent requests

-- Reset all view counts to 0
UPDATE posts SET view_count = 0;

-- Create function to atomically increment view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION increment_view_count IS 'Atomically increments the view count for a post';

-- Made with Bob
