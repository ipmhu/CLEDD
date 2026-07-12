-- =============================================
-- CLED – Esquema de base de datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Perfiles (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'miembro',
  grade TEXT,
  section TEXT,
  modality TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubes
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO clubs (name) VALUES
('Comunicación Social y Periodismo'),
('Debate'),
('Lectura'),
('Arte'),
('Baile'),
('Orientación y Vocación Universitaria'),
('Voluntariado y Acción Social');

-- Miembros de clubes
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs ON DELETE CASCADE,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  role_in_club TEXT DEFAULT 'miembro',
  UNIQUE(club_id, user_id)
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ,
  max_capacity INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actividad (para dashboard)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas mínimas
CREATE POLICY "Usuarios ven su perfil" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Usuarios actualizan su perfil" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Miembros ven sus clubes" ON club_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Eventos públicos" ON events FOR SELECT USING (true);
CREATE POLICY "Logs propios" ON activity_logs FOR SELECT USING (user_id = auth.uid());