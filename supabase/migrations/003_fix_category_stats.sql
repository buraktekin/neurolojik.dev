-- Fix category stats view and permissions
-- This migration ensures the view exists and has proper permissions

-- Drop and recreate the view to ensure it's up to date
DROP VIEW IF EXISTS category_stats;

CREATE VIEW category_stats AS
SELECT 
  category,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  COUNT(*) FILTER (WHERE featured = true AND status = 'published') as featured_count,
  MAX(published_at) as latest_published_at,
  MAX(updated_at) as latest_updated_at
FROM posts
GROUP BY category;

-- Ensure proper permissions
GRANT SELECT ON category_stats TO anon;
GRANT SELECT ON category_stats TO authenticated;

-- Add comment
COMMENT ON VIEW category_stats IS 'Aggregated statistics for each post category';
