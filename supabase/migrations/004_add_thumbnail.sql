-- Add thumbnail field to posts table
ALTER TABLE posts ADD COLUMN thumbnail TEXT;

-- Add comment
COMMENT ON COLUMN posts.thumbnail IS 'Base64 data URL of the post thumbnail image';
