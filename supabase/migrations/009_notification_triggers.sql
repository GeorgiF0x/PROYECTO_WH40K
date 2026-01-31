-- ============================================================
-- 009: Notification Triggers
-- Auto-insert notifications on like, comment, and follow events
-- ============================================================

-- 1. LIKE → notify miniature owner
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  owner_id uuid;
  actor_name text;
  mini_title text;
BEGIN
  -- Get miniature owner and title
  SELECT m.user_id, m.title INTO owner_id, mini_title
  FROM miniatures m
  WHERE m.id = NEW.miniature_id;

  -- Skip self-notification
  IF owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor username
  SELECT p.username INTO actor_name
  FROM profiles p
  WHERE p.id = NEW.user_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    owner_id,
    'like',
    'Nuevo like en tu miniatura',
    actor_name || ' ha dado like a "' || mini_title || '"',
    jsonb_build_object(
      'miniature_id', NEW.miniature_id,
      'actor_id', NEW.user_id,
      'actor_username', actor_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_miniature_like ON miniature_likes;
CREATE TRIGGER on_miniature_like
  AFTER INSERT ON miniature_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- 2. COMMENT → notify miniature owner
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  owner_id uuid;
  actor_name text;
  mini_title text;
BEGIN
  -- Get miniature owner and title
  SELECT m.user_id, m.title INTO owner_id, mini_title
  FROM miniatures m
  WHERE m.id = NEW.miniature_id;

  -- Skip self-notification
  IF owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor username
  SELECT p.username INTO actor_name
  FROM profiles p
  WHERE p.id = NEW.user_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    owner_id,
    'comment',
    'Nuevo comentario en tu miniatura',
    actor_name || ' ha comentado en "' || mini_title || '"',
    jsonb_build_object(
      'miniature_id', NEW.miniature_id,
      'comment_id', NEW.id,
      'actor_id', NEW.user_id,
      'actor_username', actor_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_miniature_comment ON miniature_comments;
CREATE TRIGGER on_miniature_comment
  AFTER INSERT ON miniature_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- 3. FOLLOW → notify followed user
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  actor_name text;
BEGIN
  -- Skip self-follow (shouldn't happen, but safety check)
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW;
  END IF;

  -- Get actor username
  SELECT p.username INTO actor_name
  FROM profiles p
  WHERE p.id = NEW.follower_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.following_id,
    'follow',
    'Nuevo seguidor',
    actor_name || ' ha comenzado a seguirte',
    jsonb_build_object(
      'actor_id', NEW.follower_id,
      'actor_username', actor_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow ON follows;
CREATE TRIGGER on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Enable realtime for notifications table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
