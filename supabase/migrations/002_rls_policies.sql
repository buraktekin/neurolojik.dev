-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Policy 1: Anyone can view published posts (for public blog)
CREATE POLICY "Public can view published posts"
  ON posts
  FOR SELECT
  USING (status = 'published');

-- Policy 2: Authenticated users can view their own posts (any status)
CREATE POLICY "Users can view own posts"
  ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT ON posts TO authenticated;
GRANT INSERT ON posts TO authenticated;
GRANT UPDATE ON posts TO authenticated;
GRANT DELETE ON posts TO authenticated;

-- Grant read-only access to anonymous users (for public posts)
GRANT SELECT ON posts TO anon;

-- Grant access to the category_stats view
GRANT SELECT ON category_stats TO anon;
GRANT SELECT ON category_stats TO authenticated;

-- Comments
COMMENT ON POLICY "Public can view published posts" ON posts IS 
  'Allows anyone to read published posts for the public blog';
COMMENT ON POLICY "Users can view own posts" ON posts IS 
  'Allows authenticated users to see all their own posts regardless of status';

