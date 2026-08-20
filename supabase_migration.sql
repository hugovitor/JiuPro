-- ================================================
-- JiuPro — Script SQL de Migração e Melhorias
-- Execute no Supabase → SQL Editor
-- ================================================

-- 1. Adicionar coluna avatar_url nos alunos (foto de perfil)
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Tabela para tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'professor',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar stripe_connect_id à tabela academies (se não existir)
ALTER TABLE academies ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- 4. Adicionar stripe_customer_id e stripe_subscription_id nos alunos (se não existir)
ALTER TABLE students ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 5. Índices de performance
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_students_academy_id ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- ================================================
-- OPCIONAL: RLS (Row Level Security)
-- Descomente e execute se quiser ativar o RLS
-- Requer que todas as chamadas usem service_role key nas APIs
-- ================================================

-- Habilitar RLS nas tabelas principais
-- ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: service_role tem acesso total (usado pelas APIs server-side)
-- CREATE POLICY "Service role full access" ON academies FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON students FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON invoices FOR ALL USING (true);
-- CREATE POLICY "Service role full access" ON users FOR ALL USING (true);

-- ================================================
-- Verificação final — checar estrutura das tabelas
-- ================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
