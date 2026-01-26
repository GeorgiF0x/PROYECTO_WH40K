-- Listing product categories
CREATE TYPE listing_category AS ENUM (
  'miniatures',    -- Miniaturas (default)
  'novels',        -- Novelas / Black Library
  'codex',         -- Codex y libros de reglas
  'paints',        -- Pinturas y materiales
  'tools',         -- Herramientas (cortadoras, limas, etc.)
  'terrain',       -- Terreno y escenografia
  'accessories',   -- Accesorios (dados, fundas, tapetes, etc.)
  'other'          -- Otros
);

ALTER TABLE listings ADD COLUMN category listing_category DEFAULT 'miniatures' NOT NULL;

-- Partial index for active listings filtered by category
CREATE INDEX idx_listings_category ON listings(category) WHERE status = 'active';
