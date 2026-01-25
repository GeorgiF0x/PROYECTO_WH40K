-- Add social media columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.instagram IS 'Instagram username (without @)';
COMMENT ON COLUMN profiles.twitter IS 'X/Twitter username (without @)';
COMMENT ON COLUMN profiles.youtube IS 'YouTube channel URL or username';
