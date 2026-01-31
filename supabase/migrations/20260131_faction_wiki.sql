-- =============================================================================
-- FACTION WIKI SYSTEM
-- =============================================================================
-- Enables editable wiki pages for each faction with:
-- - Categories for organizing content
-- - Revision history for tracking changes
-- - Contribution system for user suggestions
-- - RLS policies for proper access control
-- =============================================================================

-- =============================================================================
-- WIKI CATEGORIES
-- =============================================================================

CREATE TABLE wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),  -- lucide icon name
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FACTION WIKI PAGES
-- =============================================================================

CREATE TABLE faction_wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faction_id VARCHAR(50) NOT NULL,  -- 'imperium', 'chaos', etc
  category_id UUID REFERENCES wiki_categories(id) ON DELETE SET NULL,

  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT,  -- summary for listings

  content JSONB NOT NULL,  -- Tiptap JSON

  hero_image TEXT,  -- main image
  gallery_images TEXT[],  -- additional images

  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft',  -- draft, published, archived

  views_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(faction_id, slug)
);

-- Indexes
CREATE INDEX idx_wiki_pages_faction ON faction_wiki_pages(faction_id);
CREATE INDEX idx_wiki_pages_status ON faction_wiki_pages(status);
CREATE INDEX idx_wiki_pages_slug ON faction_wiki_pages(slug);
CREATE INDEX idx_wiki_pages_category ON faction_wiki_pages(category_id);
CREATE INDEX idx_wiki_pages_published_at ON faction_wiki_pages(published_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_wiki_pages_updated_at
  BEFORE UPDATE ON faction_wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- WIKI REVISIONS (History)
-- =============================================================================

CREATE TABLE wiki_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES faction_wiki_pages(id) ON DELETE CASCADE,

  content JSONB NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  change_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching revision history
CREATE INDEX idx_wiki_revisions_page ON wiki_revisions(page_id, created_at DESC);

-- =============================================================================
-- WIKI CONTRIBUTIONS (User Suggestions)
-- =============================================================================

CREATE TABLE wiki_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES faction_wiki_pages(id) ON DELETE CASCADE,

  -- For new articles, page_id is NULL
  faction_id VARCHAR(50),
  suggested_title VARCHAR(255),

  content JSONB NOT NULL,  -- suggested content
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_wiki_contributions_status ON wiki_contributions(status);
CREATE INDEX idx_wiki_contributions_contributor ON wiki_contributions(contributor_id);
CREATE INDEX idx_wiki_contributions_page ON wiki_contributions(page_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_contributions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- WIKI CATEGORIES POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view categories
CREATE POLICY "Anyone can view wiki categories"
ON wiki_categories FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage wiki categories"
ON wiki_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- -----------------------------------------------------------------------------
-- WIKI PAGES POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view published wiki pages
CREATE POLICY "Anyone can view published wiki pages"
ON faction_wiki_pages FOR SELECT
USING (status = 'published');

-- Admins/mods can view all pages (including drafts)
CREATE POLICY "Admins can view all wiki pages"
ON faction_wiki_pages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins/mods can create wiki pages
CREATE POLICY "Admins can create wiki pages"
ON faction_wiki_pages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins/mods can update wiki pages
CREATE POLICY "Admins can update wiki pages"
ON faction_wiki_pages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins/mods can delete wiki pages
CREATE POLICY "Admins can delete wiki pages"
ON faction_wiki_pages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- -----------------------------------------------------------------------------
-- WIKI REVISIONS POLICIES
-- -----------------------------------------------------------------------------

-- Anyone can view revisions of published pages
CREATE POLICY "Anyone can view revisions of published pages"
ON wiki_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM faction_wiki_pages
    WHERE id = wiki_revisions.page_id
    AND status = 'published'
  )
);

-- Admins can view all revisions
CREATE POLICY "Admins can view all revisions"
ON wiki_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins can create revisions
CREATE POLICY "Admins can create revisions"
ON wiki_revisions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- -----------------------------------------------------------------------------
-- WIKI CONTRIBUTIONS POLICIES
-- -----------------------------------------------------------------------------

-- Users can create contributions
CREATE POLICY "Users can create contributions"
ON wiki_contributions FOR INSERT
WITH CHECK (auth.uid() = contributor_id);

-- Users can view their own contributions
CREATE POLICY "Users can view own contributions"
ON wiki_contributions FOR SELECT
USING (contributor_id = auth.uid());

-- Admins can view all contributions
CREATE POLICY "Admins can view all contributions"
ON wiki_contributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins can update contributions (approve/reject)
CREATE POLICY "Admins can update contributions"
ON wiki_contributions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins can delete contributions
CREATE POLICY "Admins can delete contributions"
ON wiki_contributions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

INSERT INTO wiki_categories (name, slug, description, icon, sort_order) VALUES
('Historia', 'historia', 'Origenes y eventos historicos', 'BookOpen', 1),
('Personajes', 'personajes', 'Heroes, villanos y figuras legendarias', 'Users', 2),
('Batallas', 'batallas', 'Conflictos y campanas militares', 'Swords', 3),
('Cultura', 'cultura', 'Tradiciones, creencias y organizacion', 'Building', 4),
('Armamento', 'armamento', 'Armas, vehiculos y tecnologia', 'Shield', 5),
('Territorios', 'territorios', 'Planetas, sistemas y dominios', 'MapPin', 6);

-- =============================================================================
-- HELPER FUNCTION: Increment view count
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_wiki_page_views(page_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE faction_wiki_pages
  SET views_count = views_count + 1
  WHERE id = page_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
