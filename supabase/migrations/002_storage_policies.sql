-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- AVATARS BUCKET
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');


-- MINIATURES BUCKET
-- Allow users to upload miniature images
CREATE POLICY "Users can upload miniature images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'miniatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own miniature images
CREATE POLICY "Users can update own miniature images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'miniatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own miniature images
CREATE POLICY "Users can delete own miniature images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'miniatures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to miniatures
CREATE POLICY "Miniatures are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'miniatures');


-- LISTINGS BUCKET
-- Allow users to upload listing images
CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listings' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own listing images
CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'listings' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own listing images
CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listings' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to listings
CREATE POLICY "Listings are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');


-- ARTICLES BUCKET (Admin only for upload)
-- Allow admins to upload article images
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'articles' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow admins to update article images
CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'articles' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow admins to delete article images
CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'articles' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow public access to articles
CREATE POLICY "Articles are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'articles');
