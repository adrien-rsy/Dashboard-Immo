-- Table pour la Prospection
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  phone TEXT,
  notes TEXT,
  link TEXT,
  status TEXT DEFAULT 'À appeler',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les Projets
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB DEFAULT '{}'::jsonb,
  lots JSONB DEFAULT '[]'::jsonb,
  scenarios JSONB DEFAULT '[]'::jsonb,
  costs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) simple - À ajuster plus tard pour l'auth
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access on prospects" ON prospects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
