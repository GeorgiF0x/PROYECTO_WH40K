-- =============================================
-- CREATORS - Evolución del perfil de usuario
-- =============================================

-- Enum para tipos de creador
CREATE TYPE creator_type AS ENUM (
  'painter',           -- Pintor de miniaturas
  'youtuber',          -- YouTuber/Streamer
  'artist',            -- Artista (ilustrador, escultor digital)
  'blogger',           -- Escritor/Blogger de lore
  'instructor'         -- Instructor/Profesor
);

-- Enum para estado de solicitud de creador
CREATE TYPE creator_status AS ENUM (
  'none',              -- No ha solicitado
  'pending',           -- Solicitud pendiente
  'approved',          -- Aprobado como creador
  'rejected'           -- Rechazado
);

-- Añadir columnas de creador a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_status creator_status DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_type creator_type;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_services TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_commissions BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pinned_miniatures UUID[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_application_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_rejection_reason TEXT;

-- Tabla para solicitudes de creador (historial y detalles)
CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_type creator_type NOT NULL,
  motivation TEXT NOT NULL,
  portfolio_links TEXT[],
  social_links JSONB,
  status creator_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_creator_status ON profiles(creator_status) WHERE creator_status != 'none';
CREATE INDEX IF NOT EXISTS idx_profiles_creator_type ON profiles(creator_type) WHERE creator_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_accepts_commissions ON profiles(accepts_commissions) WHERE accepts_commissions = true;
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_user ON creator_applications(user_id);

-- Trigger para updated_at en creator_applications
CREATE TRIGGER update_creator_applications_updated_at
  BEFORE UPDATE ON creator_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para creator_applications
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can view own applications"
  ON creator_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear solicitudes
CREATE POLICY "Users can create applications"
  ON creator_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden actualizar solicitudes (aprobar/rechazar)
-- Por ahora permitimos update para testing, en producción restringir a admins
CREATE POLICY "Users can update own pending applications"
  ON creator_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Vista para creadores públicos (solo aprobados)
CREATE OR REPLACE VIEW public_creators AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.creator_type,
  p.creator_bio,
  p.creator_services,
  p.accepts_commissions,
  p.portfolio_url,
  p.pinned_miniatures,
  p.creator_verified_at,
  p.favorite_factions,
  (SELECT COUNT(*) FROM miniatures m WHERE m.user_id = p.id) as miniatures_count,
  (SELECT COUNT(*) FROM follows f WHERE f.following_id = p.id) as followers_count,
  p.instagram,
  p.twitter,
  p.youtube,
  p.website
FROM profiles p
WHERE p.creator_status = 'approved'
ORDER BY p.creator_verified_at DESC;

-- Función para verificar elegibilidad de creador
CREATE OR REPLACE FUNCTION check_creator_eligibility(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  profile_record RECORD;
  has_social BOOLEAN;
  eligibility JSONB;
BEGIN
  -- Obtener perfil
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'Profile not found');
  END IF;

  -- Verificar si tiene al menos una red social
  has_social := (
    profile_record.instagram IS NOT NULL OR
    profile_record.twitter IS NOT NULL OR
    profile_record.youtube IS NOT NULL OR
    profile_record.website IS NOT NULL
  );

  -- Construir respuesta de elegibilidad (sin requisito de miniaturas)
  -- Los 5 enlaces de contenido se validan en el formulario de solicitud
  eligibility := jsonb_build_object(
    'eligible', (
      profile_record.avatar_url IS NOT NULL AND
      profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) >= 10 AND
      has_social
    ),
    'checks', jsonb_build_object(
      'has_avatar', profile_record.avatar_url IS NOT NULL,
      'has_bio', profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) >= 10,
      'has_social', has_social
    )
  );

  RETURN eligibility;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para solicitar ser creador
CREATE OR REPLACE FUNCTION apply_for_creator(
  user_uuid UUID,
  p_creator_type creator_type,
  p_motivation TEXT,
  p_portfolio_links TEXT[] DEFAULT NULL,
  p_social_links JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  eligibility JSONB;
  application_id UUID;
BEGIN
  -- Verificar elegibilidad
  eligibility := check_creator_eligibility(user_uuid);

  IF NOT (eligibility->>'eligible')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not eligible', 'eligibility', eligibility);
  END IF;

  -- Verificar que no tenga solicitud pendiente
  IF EXISTS (SELECT 1 FROM creator_applications WHERE user_id = user_uuid AND status = 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already has pending application');
  END IF;

  -- Verificar que no sea ya creador
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid AND creator_status = 'approved') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a creator');
  END IF;

  -- Crear solicitud
  INSERT INTO creator_applications (user_id, creator_type, motivation, portfolio_links, social_links)
  VALUES (user_uuid, p_creator_type, p_motivation, p_portfolio_links, p_social_links)
  RETURNING id INTO application_id;

  -- Actualizar perfil con estado pendiente
  UPDATE profiles
  SET creator_status = 'pending',
      creator_application_date = NOW()
  WHERE id = user_uuid;

  RETURN jsonb_build_object('success', true, 'application_id', application_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para aprobar/rechazar creador (admin)
CREATE OR REPLACE FUNCTION review_creator_application(
  application_uuid UUID,
  reviewer_uuid UUID,
  p_approved BOOLEAN,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  app_record RECORD;
BEGIN
  -- Obtener solicitud
  SELECT * INTO app_record FROM creator_applications WHERE id = application_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;

  IF app_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application already reviewed');
  END IF;

  -- Actualizar solicitud
  UPDATE creator_applications
  SET status = CASE WHEN p_approved THEN 'approved'::creator_status ELSE 'rejected'::creator_status END,
      reviewed_by = reviewer_uuid,
      reviewed_at = NOW(),
      rejection_reason = p_rejection_reason,
      updated_at = NOW()
  WHERE id = application_uuid;

  -- Actualizar perfil
  IF p_approved THEN
    UPDATE profiles
    SET creator_status = 'approved',
        creator_type = app_record.creator_type,
        creator_verified_at = NOW()
    WHERE id = app_record.user_id;
  ELSE
    UPDATE profiles
    SET creator_status = 'rejected',
        creator_rejection_reason = p_rejection_reason
    WHERE id = app_record.user_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON COLUMN profiles.creator_status IS 'Estado de creador: none, pending, approved, rejected';
COMMENT ON COLUMN profiles.creator_type IS 'Tipo de creador: painter, youtuber, artist, blogger, instructor';
COMMENT ON COLUMN profiles.creator_services IS 'Servicios que ofrece el creador';
COMMENT ON COLUMN profiles.accepts_commissions IS 'Si acepta encargos/comisiones';
COMMENT ON COLUMN profiles.pinned_miniatures IS 'IDs de miniaturas destacadas en el perfil';
COMMENT ON TABLE creator_applications IS 'Solicitudes para convertirse en creador verificado';
