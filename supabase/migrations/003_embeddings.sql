-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to miniatures table
ALTER TABLE miniatures
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS miniatures_embedding_idx
ON miniatures
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to search miniatures by similarity
CREATE OR REPLACE FUNCTION search_miniatures_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  thumbnail_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.description,
    m.thumbnail_url,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM miniatures m
  WHERE m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find similar miniatures to a given one
CREATE OR REPLACE FUNCTION find_similar_miniatures(
  miniature_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  thumbnail_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_embedding vector(1536);
BEGIN
  -- Get the embedding of the source miniature
  SELECT embedding INTO source_embedding
  FROM miniatures
  WHERE miniatures.id = miniature_id;

  IF source_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.description,
    m.thumbnail_url,
    1 - (m.embedding <=> source_embedding) AS similarity
  FROM miniatures m
  WHERE m.id != miniature_id
    AND m.embedding IS NOT NULL
  ORDER BY m.embedding <=> source_embedding
  LIMIT match_count;
END;
$$;
