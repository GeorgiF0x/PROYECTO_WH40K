-- =============================================================================
-- FIX MESSAGING RLS POLICIES
-- =============================================================================
-- The original conversation_participants SELECT policy was self-referential,
-- causing 500 errors. This migration fixes that with a SECURITY DEFINER
-- helper function, and adds an RPC for atomically creating conversations
-- with participants.

-- 1. Helper: check if auth.uid() is a participant (bypasses RLS)
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conv_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix conversation_participants SELECT policy
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR is_conversation_participant(conversation_id)
    );

-- 3. Fix conversation_participants INSERT policy
--    Allow users to add others when creating a conversation (via RPC below)
--    or add themselves
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
CREATE POLICY "Users can add conversation participants" ON conversation_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR is_conversation_participant(conversation_id)
    );

-- 4. RPC: atomically create conversation + add both participants
--    Bypasses per-row RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_conversation_with_participants(
    p_listing_id UUID,
    p_user_a UUID,
    p_user_b UUID
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Ensure the caller is one of the participants
    IF auth.uid() != p_user_a AND auth.uid() != p_user_b THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    INSERT INTO conversations (listing_id)
    VALUES (p_listing_id)
    RETURNING id INTO v_conversation_id;

    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES
        (v_conversation_id, p_user_a),
        (v_conversation_id, p_user_b);

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_conversation_participant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID, UUID) TO authenticated;
