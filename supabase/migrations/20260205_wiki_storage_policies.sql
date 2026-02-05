-- =============================================================================
-- WIKI STORAGE BUCKET + POLICIES
-- =============================================================================
-- Fixes: "new row violates row-level security policy" on wiki image upload

-- 1. Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiki',
  'wiki',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Allow authenticated users with wiki_role OR admin to upload
CREATE POLICY "Wiki contributors can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wiki' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (
      is_admin = true
      OR role IN ('admin', 'moderator')
      OR wiki_role IS NOT NULL
    )
  )
);

-- 3. Allow same users to update their uploads
CREATE POLICY "Wiki contributors can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wiki' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (
      is_admin = true
      OR role IN ('admin', 'moderator')
      OR wiki_role IS NOT NULL
    )
  )
);

-- 4. Allow admins to delete wiki images
CREATE POLICY "Admins can delete wiki images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wiki' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- 5. Public read access
CREATE POLICY "Wiki images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'wiki');
