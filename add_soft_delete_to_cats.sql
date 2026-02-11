-- Add is_deleted column to cats table
ALTER TABLE cats ADD COLUMN is_deleted BOOLEAN DEFAULT false;

-- Optional: Create index for better performance
CREATE INDEX idx_cats_is_deleted ON cats(is_deleted);
