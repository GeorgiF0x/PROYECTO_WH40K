-- =============================================================================
-- WARHAMMER 40K COMMUNITY PLATFORM - INITIAL SCHEMA
-- =============================================================================
-- Following Supabase PostgreSQL best practices:
-- - UUID primary keys for scalability
-- - Proper indexing on foreign keys and frequently queried columns
-- - Row Level Security (RLS) enabled on all tables
-- - Triggers for automatic timestamp updates
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE tag_category AS ENUM ('faction', 'technique', 'game_system', 'other');
CREATE TYPE article_category AS ENUM ('warhammer_40k', 'age_of_sigmar', 'painting', 'tournaments', 'news');
CREATE TYPE listing_condition AS ENUM ('nib', 'nos', 'assembled', 'painted', 'pro_painted');
CREATE TYPE listing_type AS ENUM ('sale', 'trade', 'both');
CREATE TYPE listing_status AS ENUM ('active', 'reserved', 'sold', 'inactive');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'message', 'mention', 'system');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE content_type AS ENUM ('miniature', 'listing', 'comment', 'message', 'profile');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    new_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extract part before @ and clean it
    base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9]', '', 'g'));

    -- Ensure minimum length
    IF LENGTH(base_username) < 3 THEN
        base_username := base_username || 'user';
    END IF;

    new_username := base_username;

    -- Check for uniqueness and add number if needed
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
        counter := counter + 1;
        new_username := base_username || counter::TEXT;
    END LOOP;

    RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,30}$')
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        generate_username_from_email(NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- FOLLOWS
-- =============================================================================

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Indexes for efficient follower/following queries
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- =============================================================================
-- BADGES & USER BADGES
-- =============================================================================

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- =============================================================================
-- TAGS
-- =============================================================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    category tag_category DEFAULT 'other' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tags_category ON tags(category);
CREATE INDEX idx_tags_slug ON tags(slug);

-- =============================================================================
-- MINIATURES (Gallery)
-- =============================================================================

CREATE TABLE miniatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}' NOT NULL,
    thumbnail_url TEXT,
    faction_id UUID REFERENCES tags(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_miniatures_user ON miniatures(user_id);
CREATE INDEX idx_miniatures_faction ON miniatures(faction_id);
CREATE INDEX idx_miniatures_created_at ON miniatures(created_at DESC);
CREATE INDEX idx_miniatures_likes ON miniatures(likes_count DESC);

CREATE TRIGGER update_miniatures_updated_at
    BEFORE UPDATE ON miniatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Junction table for miniature tags
CREATE TABLE miniature_tags (
    miniature_id UUID NOT NULL REFERENCES miniatures(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (miniature_id, tag_id)
);

CREATE INDEX idx_miniature_tags_tag ON miniature_tags(tag_id);

-- =============================================================================
-- MINIATURE LIKES
-- =============================================================================

CREATE TABLE miniature_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    miniature_id UUID NOT NULL REFERENCES miniatures(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_miniature_like UNIQUE (miniature_id, user_id)
);

CREATE INDEX idx_miniature_likes_miniature ON miniature_likes(miniature_id);
CREATE INDEX idx_miniature_likes_user ON miniature_likes(user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_miniature_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE miniatures SET likes_count = likes_count + 1 WHERE id = NEW.miniature_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE miniatures SET likes_count = likes_count - 1 WHERE id = OLD.miniature_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER miniature_likes_count_trigger
    AFTER INSERT OR DELETE ON miniature_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_miniature_likes_count();

-- =============================================================================
-- MINIATURE COMMENTS
-- =============================================================================

CREATE TABLE miniature_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    miniature_id UUID NOT NULL REFERENCES miniatures(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_miniature_comments_miniature ON miniature_comments(miniature_id);
CREATE INDEX idx_miniature_comments_user ON miniature_comments(user_id);
CREATE INDEX idx_miniature_comments_created ON miniature_comments(created_at DESC);

CREATE TRIGGER update_miniature_comments_updated_at
    BEFORE UPDATE ON miniature_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update comments_count
CREATE OR REPLACE FUNCTION update_miniature_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE miniatures SET comments_count = comments_count + 1 WHERE id = NEW.miniature_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE miniatures SET comments_count = comments_count - 1 WHERE id = OLD.miniature_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER miniature_comments_count_trigger
    AFTER INSERT OR DELETE ON miniature_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_miniature_comments_count();

-- =============================================================================
-- ARTICLES (Blog/News)
-- =============================================================================

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category article_category DEFAULT 'news' NOT NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published, published_at DESC) WHERE published = TRUE;
CREATE INDEX idx_articles_featured ON articles(featured, published_at DESC) WHERE featured = TRUE AND published = TRUE;

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ARTICLE COMMENTS
-- =============================================================================

CREATE TABLE article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_article_comments_article ON article_comments(article_id);
CREATE INDEX idx_article_comments_user ON article_comments(user_id);

CREATE TRIGGER update_article_comments_updated_at
    BEFORE UPDATE ON article_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- LISTINGS (Marketplace)
-- =============================================================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'EUR' NOT NULL,
    condition listing_condition NOT NULL,
    listing_type listing_type DEFAULT 'sale' NOT NULL,
    status listing_status DEFAULT 'active' NOT NULL,
    images TEXT[] DEFAULT '{}' NOT NULL,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    faction_id UUID REFERENCES tags(id) ON DELETE SET NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    favorites_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common search patterns
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_active ON listings(created_at DESC) WHERE status = 'active';
CREATE INDEX idx_listings_condition ON listings(condition) WHERE status = 'active';
CREATE INDEX idx_listings_price ON listings(price) WHERE status = 'active';
CREATE INDEX idx_listings_faction ON listings(faction_id) WHERE status = 'active';
CREATE INDEX idx_listings_location ON listings(location) WHERE status = 'active' AND location IS NOT NULL;

-- GIN index for full-text search on title and description
CREATE INDEX idx_listings_search ON listings USING GIN (
    to_tsvector('spanish', title || ' ' || description)
) WHERE status = 'active';

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- LISTING FAVORITES
-- =============================================================================

CREATE TABLE listing_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_listing_favorite UNIQUE (listing_id, user_id)
);

CREATE INDEX idx_listing_favorites_listing ON listing_favorites(listing_id);
CREATE INDEX idx_listing_favorites_user ON listing_favorites(user_id);

-- Trigger to update favorites_count
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_favorites_count_trigger
    AFTER INSERT OR DELETE ON listing_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_favorites_count();

-- =============================================================================
-- SELLER REVIEWS
-- =============================================================================

CREATE TABLE seller_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT no_self_review CHECK (seller_id != reviewer_id),
    CONSTRAINT unique_review_per_listing UNIQUE (seller_id, reviewer_id, listing_id)
);

CREATE INDEX idx_seller_reviews_seller ON seller_reviews(seller_id);
CREATE INDEX idx_seller_reviews_reviewer ON seller_reviews(reviewer_id);

-- =============================================================================
-- CONVERSATIONS (Chat)
-- =============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_conversations_listing ON conversations(listing_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CONVERSATION PARTICIPANTS
-- =============================================================================

CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_read_at TIMESTAMPTZ,

    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- =============================================================================
-- MESSAGES
-- =============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Update conversation updated_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_updates_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read = FALSE;

-- =============================================================================
-- REPORTS (Moderation)
-- =============================================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status report_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE miniatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE miniature_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE miniature_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE miniature_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- FOLLOWS
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow/unfollow" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- BADGES
CREATE POLICY "Badges are viewable by everyone" ON badges
    FOR SELECT USING (true);

-- USER BADGES
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

-- TAGS
CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

-- MINIATURES
CREATE POLICY "Miniatures are viewable by everyone" ON miniatures
    FOR SELECT USING (true);

CREATE POLICY "Users can create miniatures" ON miniatures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own miniatures" ON miniatures
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own miniatures" ON miniatures
    FOR DELETE USING (auth.uid() = user_id);

-- MINIATURE TAGS
CREATE POLICY "Miniature tags are viewable by everyone" ON miniature_tags
    FOR SELECT USING (true);

CREATE POLICY "Users can manage tags on own miniatures" ON miniature_tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM miniatures WHERE id = miniature_id AND user_id = auth.uid())
    );

-- MINIATURE LIKES
CREATE POLICY "Likes are viewable by everyone" ON miniature_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like miniatures" ON miniature_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike miniatures" ON miniature_likes
    FOR DELETE USING (auth.uid() = user_id);

-- MINIATURE COMMENTS
CREATE POLICY "Comments are viewable by everyone" ON miniature_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment on miniatures" ON miniature_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON miniature_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON miniature_comments
    FOR DELETE USING (auth.uid() = user_id);

-- ARTICLES
CREATE POLICY "Published articles are viewable by everyone" ON articles
    FOR SELECT USING (published = true OR author_id = auth.uid());

CREATE POLICY "Admins can manage articles" ON articles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- ARTICLE COMMENTS
CREATE POLICY "Article comments are viewable by everyone" ON article_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment on articles" ON article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own article comments" ON article_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own article comments" ON article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- LISTINGS
CREATE POLICY "Active listings are viewable by everyone" ON listings
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can create listings" ON listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own listings" ON listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own listings" ON listings
    FOR DELETE USING (auth.uid() = seller_id);

-- LISTING FAVORITES
CREATE POLICY "Users can view own favorites" ON listing_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON listing_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON listing_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- SELLER REVIEWS
CREATE POLICY "Reviews are viewable by everyone" ON seller_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON seller_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- CONVERSATIONS
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

-- CONVERSATION PARTICIPANTS
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- MESSAGES
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- =============================================================================
-- STORAGE BUCKETS (Run this in Supabase Dashboard -> Storage)
-- =============================================================================
-- Note: Storage buckets need to be created via Dashboard or Admin API:
-- - avatars (public)
-- - miniatures (public)
-- - listings (public)
-- - articles (public)

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Insert default tags (factions)
INSERT INTO tags (name, slug, category) VALUES
    ('Space Marines', 'space-marines', 'faction'),
    ('Chaos Space Marines', 'chaos-space-marines', 'faction'),
    ('Orks', 'orks', 'faction'),
    ('Aeldari', 'aeldari', 'faction'),
    ('Drukhari', 'drukhari', 'faction'),
    ('Tyranids', 'tyranids', 'faction'),
    ('Necrons', 'necrons', 'faction'),
    ('T''au Empire', 'tau-empire', 'faction'),
    ('Adeptus Mechanicus', 'adeptus-mechanicus', 'faction'),
    ('Adeptus Custodes', 'adeptus-custodes', 'faction'),
    ('Imperial Knights', 'imperial-knights', 'faction'),
    ('Chaos Knights', 'chaos-knights', 'faction'),
    ('Death Guard', 'death-guard', 'faction'),
    ('Thousand Sons', 'thousand-sons', 'faction'),
    ('World Eaters', 'world-eaters', 'faction'),
    ('Chaos Daemons', 'chaos-daemons', 'faction'),
    ('Astra Militarum', 'astra-militarum', 'faction'),
    ('Grey Knights', 'grey-knights', 'faction'),
    ('Adepta Sororitas', 'adepta-sororitas', 'faction'),
    ('Leagues of Votann', 'leagues-of-votann', 'faction'),
    ('Genestealer Cults', 'genestealer-cults', 'faction'),
    ('Agents of the Imperium', 'agents-imperium', 'faction');

-- Insert painting technique tags
INSERT INTO tags (name, slug, category) VALUES
    ('Airbrush', 'airbrush', 'technique'),
    ('Wet Blending', 'wet-blending', 'technique'),
    ('Edge Highlighting', 'edge-highlighting', 'technique'),
    ('NMM (Non-Metallic Metal)', 'nmm', 'technique'),
    ('OSL (Object Source Lighting)', 'osl', 'technique'),
    ('Glazing', 'glazing', 'technique'),
    ('Dry Brushing', 'dry-brushing', 'technique'),
    ('Zenithal Priming', 'zenithal-priming', 'technique'),
    ('Contrast Paint', 'contrast-paint', 'technique'),
    ('Speed Paint', 'speed-paint', 'technique'),
    ('Weathering', 'weathering', 'technique'),
    ('Basing', 'basing', 'technique'),
    ('Freehand', 'freehand', 'technique'),
    ('Conversion', 'conversion', 'technique'),
    ('Kitbash', 'kitbash', 'technique');

-- Insert game system tags
INSERT INTO tags (name, slug, category) VALUES
    ('Warhammer 40,000', 'warhammer-40k', 'game_system'),
    ('Age of Sigmar', 'age-of-sigmar', 'game_system'),
    ('Kill Team', 'kill-team', 'game_system'),
    ('Warcry', 'warcry', 'game_system'),
    ('Horus Heresy', 'horus-heresy', 'game_system'),
    ('Necromunda', 'necromunda', 'game_system'),
    ('Blood Bowl', 'blood-bowl', 'game_system'),
    ('Underworlds', 'underworlds', 'game_system');

-- Insert default badges
INSERT INTO badges (name, description) VALUES
    ('Novato', 'Bienvenido a la comunidad'),
    ('Pintor Prolífico', 'Has compartido más de 10 miniaturas'),
    ('Artista', 'Has compartido más de 50 miniaturas'),
    ('Maestro Pintor', 'Has compartido más de 100 miniaturas'),
    ('Popular', 'Una de tus miniaturas ha recibido 50+ likes'),
    ('Vendedor Verificado', 'Has completado 5+ ventas exitosas'),
    ('Comerciante Elite', 'Has completado 25+ ventas con rating 5 estrellas'),
    ('Colaborador', 'Has aportado contenido valioso a la comunidad'),
    ('Veterano', 'Miembro activo por más de 1 año');
