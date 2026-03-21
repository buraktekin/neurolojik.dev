-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('photo', 'food', 'travel', 'life', 'code')),
  excerpt TEXT,
  blocks JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  -- Tags (for location, dish, etc.)
  tags JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC NULLS LAST);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_featured ON posts(featured) WHERE featured = true;
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) STORED;

CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate if slug is empty or null
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Create base slug from title
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
      base_slug := 'post';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append counter if needed
    WHILE EXISTS (SELECT 1 FROM posts WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_generate_slug
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug();

-- Category statistics view
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

-- Comments for documentation
COMMENT ON TABLE posts IS 'Blog posts with blocks-based content';
COMMENT ON COLUMN posts.blocks IS 'JSONB array of content blocks (Notion-style)';
COMMENT ON COLUMN posts.tags IS 'JSONB array of tags for filtering (e.g., location, dish name)';
COMMENT ON COLUMN posts.status IS 'Post visibility: draft (not visible), published (public), hidden (unlisted but accessible via link)';

