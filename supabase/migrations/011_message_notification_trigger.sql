-- Trigger function: create notification for message recipients
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS trigger AS $$
DECLARE
  participant RECORD;
  sender_username TEXT;
  conv_listing_id UUID;
BEGIN
  -- Get sender username
  SELECT username INTO sender_username
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Get listing_id from conversation
  SELECT listing_id INTO conv_listing_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Notify all other participants
  FOR participant IN
    SELECT user_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      participant.user_id,
      'message',
      'Nuevo mensaje de ' || COALESCE(sender_username, 'alguien'),
      LEFT(NEW.content, 100),
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'sender_username', COALESCE(sender_username, ''),
        'listing_id', COALESCE(conv_listing_id::text, '')
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();

-- Enable realtime for messages table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
