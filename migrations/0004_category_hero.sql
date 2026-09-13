-- Optional photo background for category page heroes (falls back to the
-- built-in illustration when empty).
ALTER TABLE categories ADD COLUMN hero_image TEXT;
ALTER TABLE categories ADD COLUMN hero_image_position TEXT;
