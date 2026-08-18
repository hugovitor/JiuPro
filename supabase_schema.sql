-- 1. Academias
CREATE TABLE IF NOT EXISTS academies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mensalidade_padrao TEXT NOT NULL DEFAULT '150,00',
  dia_vencimento TEXT NOT NULL DEFAULT '10',
  whatsapp_template TEXT,
  logo_url TEXT
);

-- 2. Administradores (Mestres)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Professor'
);

-- 3. Atletas (Alunos)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '123456',
  faixa TEXT NOT NULL DEFAULT 'Branca',
  graus INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativo',
  data_matricula TEXT NOT NULL,
  mensalidade TEXT NOT NULL DEFAULT '150,00',
  dia_vencimento TEXT NOT NULL DEFAULT '10',
  chave_pix TEXT NOT NULL,
  peso TEXT,
  altura TEXT,
  badges TEXT[] DEFAULT '{}'
);

-- 4. Faturas Financeiras
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  vencimento TEXT NOT NULL,
  valor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Atrasado'
);

-- 5. Histórico de Presenças
CREATE TABLE IF NOT EXISTS attendances (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  treino TEXT NOT NULL
);

-- 6. Fila de Chamada / Check-ins do Dia
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  faixa TEXT NOT NULL,
  graus INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  horario TEXT NOT NULL,
  data TEXT NOT NULL
);

-- 7. Campeonatos e Pódios
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  campeonato TEXT NOT NULL,
  data TEXT NOT NULL,
  categoria TEXT NOT NULL,
  resultado TEXT NOT NULL
);

-- 8. Mural de Avisos
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Diário Técnico de Treinos
CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  categoria TEXT NOT NULL,
  posicao TEXT NOT NULL,
  notas TEXT NOT NULL
);

-- 10. Produtos da Cantina / Loja
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  preco TEXT NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0
);

-- 11. Vendas Realizadas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  valor TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 12. Rede Social (Posts da Comunidade)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  academy_id TEXT REFERENCES academies(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_faixa TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  likes TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]'::jsonb
);

-- 13. Notificações do Sistema
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  read BOOLEAN DEFAULT FALSE
);
