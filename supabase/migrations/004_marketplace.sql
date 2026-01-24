-- =============================================================================
-- MARKETPLACE ENHANCEMENTS
-- =============================================================================

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE listings
    SET views_count = views_count + 1
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO anon;

-- =============================================================================
-- STORAGE BUCKET FOR LISTINGS
-- =============================================================================
-- Note: Run this in Supabase Dashboard -> Storage or via Admin API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Storage policies for listings bucket (run after creating bucket)
-- Allow authenticated users to upload to their own folder
-- CREATE POLICY "Users can upload listing images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'listings' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow public read access to listing images
-- CREATE POLICY "Public can view listing images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'listings');

-- Allow users to delete their own listing images
-- CREATE POLICY "Users can delete own listing images"
-- ON storage.objects FOR DELETE
-- USING (
--     bucket_id = 'listings' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );
