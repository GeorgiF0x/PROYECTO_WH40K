-- Añadir columna view_count a miniatures
ALTER TABLE miniatures ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Función RPC para incrementar atómicamente
CREATE OR REPLACE FUNCTION increment_view_count(p_miniature_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE miniatures SET view_count = view_count + 1 WHERE id = p_miniature_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
