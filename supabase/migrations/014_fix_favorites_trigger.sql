-- =============================================================================
-- FIX LISTING FAVORITES TRIGGER
-- =============================================================================
-- The update_listing_favorites_count() trigger runs as the calling user,
-- but the listings UPDATE RLS policy only allows seller_id = auth.uid().
-- A buyer favoriting a listing cannot update the favorites_count because
-- they are not the seller. Fix: make the trigger SECURITY DEFINER so it
-- bypasses RLS when updating the counter.

CREATE OR REPLACE FUNCTION update_listing_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings SET favorites_count = favorites_count + 1 WHERE id = NEW.listing_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listings SET favorites_count = favorites_count - 1 WHERE id = OLD.listing_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
