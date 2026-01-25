-- =============================================================================
-- ADD FACTION COLORS AND FAVORITE FACTIONS
-- =============================================================================

-- Add color columns to tags table for factions
ALTER TABLE tags ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7);
ALTER TABLE tags ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7);
ALTER TABLE tags ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add favorite factions to profiles (array of up to 3 faction tag IDs)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_factions UUID[] DEFAULT '{}';

-- =============================================================================
-- INSERT NEW FACTIONS (Chaos Legions, Space Marine Chapters, etc.)
-- =============================================================================

-- CHAOS LEGIONS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Black Legion', 'black-legion', 'faction', '#1A1A1A', '#CFB53B'),
    ('Word Bearers', 'word-bearers', 'faction', '#8B0000', '#4A4A4A'),
    ('Iron Warriors', 'iron-warriors', 'faction', '#4A4A4A', '#FFD700'),
    ('Night Lords', 'night-lords', 'faction', '#1A237E', '#00BCD4'),
    ('Alpha Legion', 'alpha-legion', 'faction', '#00695C', '#4FC3F7'),
    ('Emperor''s Children', 'emperors-children', 'faction', '#9C27B0', '#FFD700'),
    ('Sons of Horus', 'sons-of-horus', 'faction', '#2E7D32', '#212121')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- SPACE MARINE CHAPTERS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Ultramarines', 'ultramarines', 'faction', '#1565C0', '#FFD700'),
    ('Blood Angels', 'blood-angels', 'faction', '#C62828', '#212121'),
    ('Dark Angels', 'dark-angels', 'faction', '#1B5E20', '#E8E8E0'),
    ('Space Wolves', 'space-wolves', 'faction', '#546E7A', '#FFD700'),
    ('Imperial Fists', 'imperial-fists', 'faction', '#FDD835', '#212121'),
    ('Salamanders', 'salamanders', 'faction', '#2E7D32', '#212121'),
    ('Raven Guard', 'raven-guard', 'faction', '#212121', '#FAFAFA'),
    ('Iron Hands', 'iron-hands', 'faction', '#212121', '#78909C'),
    ('White Scars', 'white-scars', 'faction', '#FAFAFA', '#C62828'),
    ('Black Templars', 'black-templars', 'faction', '#212121', '#FAFAFA'),
    ('Crimson Fists', 'crimson-fists', 'faction', '#1565C0', '#C62828'),
    ('Flesh Tearers', 'flesh-tearers', 'faction', '#C62828', '#212121'),
    ('Deathwatch', 'deathwatch', 'faction', '#212121', '#78909C'),
    ('Blood Ravens', 'blood-ravens', 'faction', '#8B0000', '#E8E8E0'),
    ('Lamenters', 'lamenters', 'faction', '#FDD835', '#212121'),
    ('Minotaurs', 'minotaurs', 'faction', '#8D6E63', '#FFD700')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- CHAOS DAEMONS BY GOD
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Khorne Daemons', 'khorne-daemons', 'faction', '#B71C1C', '#FFD700'),
    ('Nurgle Daemons', 'nurgle-daemons', 'faction', '#558B2F', '#8D6E63'),
    ('Tzeentch Daemons', 'tzeentch-daemons', 'faction', '#1565C0', '#FF4081'),
    ('Slaanesh Daemons', 'slaanesh-daemons', 'faction', '#9C27B0', '#212121')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- AELDARI CRAFTWORLDS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Ulthwe', 'ulthwe', 'faction', '#212121', '#E8E8E0'),
    ('Saim-Hann', 'saim-hann', 'faction', '#C62828', '#FAFAFA'),
    ('Biel-Tan', 'biel-tan', 'faction', '#2E7D32', '#FAFAFA'),
    ('Alaitoc', 'alaitoc', 'faction', '#1565C0', '#FDD835'),
    ('Iyanden', 'iyanden', 'faction', '#FDD835', '#1565C0'),
    ('Harlequins', 'harlequins', 'faction', '#9C27B0', '#00BCD4'),
    ('Ynnari', 'ynnari', 'faction', '#C62828', '#FAFAFA'),
    ('Corsairs', 'corsairs', 'faction', '#00695C', '#FFD700')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- TYRANID HIVE FLEETS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Hive Fleet Leviathan', 'leviathan', 'faction', '#E8E8E0', '#6A1B9A'),
    ('Hive Fleet Kraken', 'kraken', 'faction', '#C62828', '#FDD835'),
    ('Hive Fleet Behemoth', 'behemoth', 'faction', '#1565C0', '#C62828'),
    ('Hive Fleet Jormungandr', 'jormungandr', 'faction', '#5D4037', '#FDD835'),
    ('Hive Fleet Hydra', 'hydra', 'faction', '#2E7D32', '#8D6E63'),
    ('Hive Fleet Gorgon', 'gorgon', 'faction', '#2E7D32', '#FDD835')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- ORKS CLANS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Goffs', 'goffs', 'faction', '#212121', '#FAFAFA'),
    ('Evil Sunz', 'evil-sunz', 'faction', '#C62828', '#FDD835'),
    ('Bad Moons', 'bad-moons', 'faction', '#FDD835', '#212121'),
    ('Deathskulls', 'deathskulls', 'faction', '#1565C0', '#FAFAFA'),
    ('Blood Axes', 'blood-axes', 'faction', '#5D4037', '#2E7D32'),
    ('Snakebites', 'snakebites', 'faction', '#8D6E63', '#2E7D32'),
    ('Freebooterz', 'freebooterz', 'faction', '#C62828', '#212121')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- NECRON DYNASTIES
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Sautekh Dynasty', 'sautekh', 'faction', '#4A4A4A', '#00E676'),
    ('Nihilakh Dynasty', 'nihilakh', 'faction', '#00695C', '#FFD700'),
    ('Mephrit Dynasty', 'mephrit', 'faction', '#FF5722', '#4A4A4A'),
    ('Novokh Dynasty', 'novokh', 'faction', '#C62828', '#4A4A4A'),
    ('Nephrekh Dynasty', 'nephrekh', 'faction', '#FFD700', '#4A4A4A'),
    ('Szarekhan Dynasty', 'szarekhan', 'faction', '#212121', '#00E676')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- T'AU SEPTS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('T''au Sept', 'tau-sept', 'faction', '#E65100', '#FAFAFA'),
    ('Vior''la Sept', 'viorla-sept', 'faction', '#FAFAFA', '#C62828'),
    ('Sa''cea Sept', 'sacea-sept', 'faction', '#FF5722', '#FAFAFA'),
    ('Farsight Enclaves', 'farsight-enclaves', 'faction', '#C62828', '#4A4A4A'),
    ('Bork''an Sept', 'borkan-sept', 'faction', '#00695C', '#FAFAFA'),
    ('Dal''yth Sept', 'dalyth-sept', 'faction', '#8D6E63', '#E65100')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- IMPERIAL GUARD REGIMENTS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Cadian Shock Troops', 'cadian', 'faction', '#5D4037', '#4A4A4A'),
    ('Catachan Jungle Fighters', 'catachan', 'faction', '#2E7D32', '#8D6E63'),
    ('Death Korps of Krieg', 'death-korps', 'faction', '#455A64', '#5D4037'),
    ('Tallarn Desert Raiders', 'tallarn', 'faction', '#D7CCC8', '#5D4037'),
    ('Vostroyan Firstborn', 'vostroyan', 'faction', '#C62828', '#FFD700'),
    ('Mordian Iron Guard', 'mordian', 'faction', '#1565C0', '#FFD700'),
    ('Armageddon Steel Legion', 'armageddon', 'faction', '#5D4037', '#4A4A4A'),
    ('Valhallan Ice Warriors', 'valhallan', 'faction', '#455A64', '#C62828')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- SISTERS OF BATTLE ORDERS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Order of Our Martyred Lady', 'martyred-lady', 'faction', '#212121', '#C62828'),
    ('Order of the Bloody Rose', 'bloody-rose', 'faction', '#C62828', '#212121'),
    ('Order of the Ebon Chalice', 'ebon-chalice', 'faction', '#212121', '#FAFAFA'),
    ('Order of the Argent Shroud', 'argent-shroud', 'faction', '#BDBDBD', '#C62828'),
    ('Order of the Sacred Rose', 'sacred-rose', 'faction', '#FAFAFA', '#212121'),
    ('Order of the Valorous Heart', 'valorous-heart', 'faction', '#212121', '#FAFAFA')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- AGE OF SIGMAR - CHAOS
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Blades of Khorne', 'blades-of-khorne', 'faction', '#B71C1C', '#CFB53B'),
    ('Disciples of Tzeentch', 'disciples-of-tzeentch', 'faction', '#1565C0', '#FFD700'),
    ('Maggotkin of Nurgle', 'maggotkin', 'faction', '#558B2F', '#8D6E63'),
    ('Hedonites of Slaanesh', 'hedonites', 'faction', '#9C27B0', '#FFD700'),
    ('Slaves to Darkness', 'slaves-to-darkness', 'faction', '#212121', '#C62828'),
    ('Skaven', 'skaven', 'faction', '#5D4037', '#2E7D32'),
    ('Beasts of Chaos', 'beasts-of-chaos', 'faction', '#5D4037', '#8D6E63')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- AGE OF SIGMAR - ORDER
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Stormcast Eternals', 'stormcast-eternals', 'faction', '#FFD700', '#1565C0'),
    ('Cities of Sigmar', 'cities-of-sigmar', 'faction', '#1565C0', '#FAFAFA'),
    ('Lumineth Realm-lords', 'lumineth', 'faction', '#FAFAFA', '#FFD700'),
    ('Idoneth Deepkin', 'idoneth', 'faction', '#00695C', '#00BCD4'),
    ('Sylvaneth', 'sylvaneth', 'faction', '#2E7D32', '#8D6E63'),
    ('Daughters of Khaine', 'daughters-of-khaine', 'faction', '#C62828', '#212121'),
    ('Fyreslayers', 'fyreslayers', 'faction', '#FF5722', '#FFD700'),
    ('Kharadron Overlords', 'kharadron', 'faction', '#CFB53B', '#4A4A4A'),
    ('Seraphon', 'seraphon', 'faction', '#1565C0', '#FFD700')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- AGE OF SIGMAR - DEATH
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Soulblight Gravelords', 'soulblight', 'faction', '#C62828', '#212121'),
    ('Ossiarch Bonereapers', 'ossiarch', 'faction', '#E8E8E0', '#6A1B9A'),
    ('Nighthaunt', 'nighthaunt', 'faction', '#00BCD4', '#212121'),
    ('Flesh-eater Courts', 'flesh-eaters', 'faction', '#8D6E63', '#C62828')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- AGE OF SIGMAR - DESTRUCTION
INSERT INTO tags (name, slug, category, primary_color, secondary_color) VALUES
    ('Orruk Warclans', 'orruk-warclans', 'faction', '#2E7D32', '#FDD835'),
    ('Ogor Mawtribes', 'ogor-mawtribes', 'faction', '#8D6E63', '#C62828'),
    ('Gloomspite Gitz', 'gloomspite', 'faction', '#FDD835', '#2E7D32'),
    ('Sons of Behemat', 'sons-of-behemat', 'faction', '#8D6E63', '#5D4037')
ON CONFLICT (slug) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- =============================================================================
-- UPDATE EXISTING FACTION COLORS
-- =============================================================================
UPDATE tags SET primary_color = '#1565C0', secondary_color = '#FFD700' WHERE slug = 'space-marines' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#212121', secondary_color = '#B71C1C' WHERE slug = 'chaos-space-marines' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#2E7D32', secondary_color = '#FFEB3B' WHERE slug = 'orks' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#ECEFF1', secondary_color = '#42A5F5' WHERE slug = 'aeldari' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#4A148C', secondary_color = '#000000' WHERE slug = 'drukhari' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#6A1B9A', secondary_color = '#C62828' WHERE slug = 'tyranids' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#00E676', secondary_color = '#424242' WHERE slug = 'necrons' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#E65100', secondary_color = '#FAFAFA' WHERE slug = 'tau-empire' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#B71C1C', secondary_color = '#9E9E9E' WHERE slug = 'adeptus-mechanicus' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#FFD700', secondary_color = '#B71C1C' WHERE slug = 'adeptus-custodes' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#37474F', secondary_color = '#FFD700' WHERE slug = 'imperial-knights' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#212121', secondary_color = '#6A1B9A' WHERE slug = 'chaos-knights' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#558B2F', secondary_color = '#D7CCC8' WHERE slug = 'death-guard' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#0D47A1', secondary_color = '#FFD700' WHERE slug = 'thousand-sons' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#C62828', secondary_color = '#FAFAFA' WHERE slug = 'world-eaters' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#B71C1C', secondary_color = '#6A1B9A' WHERE slug = 'chaos-daemons' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#5D4037', secondary_color = '#8D6E63' WHERE slug = 'astra-militarum' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#78909C', secondary_color = '#1565C0' WHERE slug = 'grey-knights' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#212121', secondary_color = '#C62828' WHERE slug = 'adepta-sororitas' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#E65100', secondary_color = '#6D4C41' WHERE slug = 'leagues-of-votann' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#6A1B9A', secondary_color = '#1565C0' WHERE slug = 'genestealer-cults' AND primary_color IS NULL;
UPDATE tags SET primary_color = '#37474F', secondary_color = '#FFD700' WHERE slug = 'agents-imperium' AND primary_color IS NULL;

-- Create index for faster faction lookups
CREATE INDEX IF NOT EXISTS idx_tags_faction_colors ON tags(slug) WHERE category = 'faction';
