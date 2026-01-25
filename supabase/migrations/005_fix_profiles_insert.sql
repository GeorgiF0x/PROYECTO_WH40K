-- =============================================================================
-- FIX: Improve profile creation robustness
-- =============================================================================
-- Note: INSERT policy "Users can insert own profile" already exists from previous fix

-- Ensure the handle_new_user function handles errors gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use INSERT ... ON CONFLICT to handle race conditions
    INSERT INTO profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        generate_username_from_email(COALESCE(NEW.email, NEW.id::text)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
