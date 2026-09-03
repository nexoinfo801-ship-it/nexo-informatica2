PRAGMA foreign_keys = ON;

-- NEXO APRENDER 9.8 LAB
-- Conteúdo versionado, contexto mínimo e publicação governada.

CREATE TABLE IF NOT EXISTS learning_path (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  target_role TEXT,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED','ALL')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learning_module (
  id INTEGER PRIMARY KEY,
  path_id INTEGER NOT NULL REFERENCES learning_path(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  module_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(path_id,code)
);

CREATE TABLE IF NOT EXISTS learning_lesson (
  id INTEGER PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES learning_module(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  estimated_minutes INTEGER CHECK(estimated_minutes IS NULL OR estimated_minutes>=0),
  software_version_min TEXT,
  software_version_max TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED')),
  author_ref TEXT,
  reviewer_ref TEXT,
  published_at TEXT,
  UNIQUE(module_id,code)
);

CREATE TABLE IF NOT EXISTS learning_step (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES learning_lesson(id) ON DELETE CASCADE,
  step_no INTEGER NOT NULL CHECK(step_no>0),
  instruction TEXT NOT NULL,
  target_selector_key TEXT,
  expected_event TEXT,
  validation_rule TEXT,
  UNIQUE(lesson_id,step_no)
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY,
  tenant_ref TEXT NOT NULL,
  user_ref TEXT NOT NULL,
  lesson_id INTEGER NOT NULL REFERENCES learning_lesson(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK(state IN ('NOT_STARTED','IN_PROGRESS','COMPLETED','SKIPPED')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_ref,user_ref,lesson_id)
);

CREATE TABLE IF NOT EXISTS learning_event (
  id INTEGER PRIMARY KEY,
  tenant_ref TEXT NOT NULL,
  user_ref TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('TUTORIAL_STARTED','TUTORIAL_COMPLETED','TUTORIAL_ABANDONED','HELP_OPENED','AI_ASKED','ERROR_EXPLAINED','SUPPORT_HANDOFF')),
  module_key TEXT,
  lesson_id INTEGER REFERENCES learning_lesson(id),
  screen_key TEXT,
  duration_ms INTEGER CHECK(duration_ms IS NULL OR duration_ms>=0),
  error_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_article (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  module_key TEXT NOT NULL,
  function_key TEXT,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED','ALL')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED')),
  current_version INTEGER NOT NULL DEFAULT 1 CHECK(current_version>0)
);

CREATE TABLE IF NOT EXISTS knowledge_version (
  id INTEGER PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES knowledge_article(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL CHECK(version_no>0),
  software_version_min TEXT,
  software_version_max TEXT,
  body_markdown TEXT NOT NULL,
  author_ref TEXT,
  reviewer_ref TEXT,
  status TEXT NOT NULL CHECK(status IN ('DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED')),
  published_at TEXT,
  UNIQUE(article_id,version_no)
);

CREATE TABLE IF NOT EXISTS contextual_help (
  id INTEGER PRIMARY KEY,
  module_key TEXT NOT NULL,
  screen_key TEXT,
  field_key TEXT,
  title TEXT NOT NULL,
  help_text TEXT NOT NULL,
  article_id INTEGER REFERENCES knowledge_article(id),
  software_version_min TEXT,
  software_version_max TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS guided_task (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  module_key TEXT NOT NULL,
  lesson_id INTEGER REFERENCES learning_lesson(id),
  completion_event TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS learning_support_handoff (
  id INTEGER PRIMARY KEY,
  tenant_ref TEXT NOT NULL,
  user_ref TEXT NOT NULL,
  module_key TEXT NOT NULL,
  screen_key TEXT,
  error_code TEXT,
  attempted_article_code TEXT,
  attempted_lesson_code TEXT,
  support_ticket_ref TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_ai_interaction (
  id INTEGER PRIMARY KEY,
  tenant_ref TEXT NOT NULL,
  user_ref TEXT NOT NULL,
  role TEXT NOT NULL,
  module_key TEXT,
  screen_key TEXT,
  software_version TEXT NOT NULL,
  question_class TEXT NOT NULL,
  resolved_by TEXT NOT NULL CHECK(resolved_by IN ('KNOWLEDGE','GUIDE','AI','SUPPORT')),
  content_version_ref TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO learning_path(code,title,target_role,difficulty,status,sort_order) VALUES
('FIRST_DAY','Primeiro dia',NULL,'BEGINNER','PUBLISHED',10),
('OPERATION','Operação','WAITER','ALL','PUBLISHED',20),
('MANAGEMENT','Gestão','ADMIN','INTERMEDIATE','PUBLISHED',30),
('ADMINISTRATION','Administração','ADMIN','ADVANCED','PUBLISHED',40);

INSERT OR IGNORE INTO knowledge_article(code,title,module_key,function_key,difficulty,status,current_version) VALUES
('HOW_CLOSE_CASH','Como fechar o caixa','caixa','close','BEGINNER','PUBLISHED',1),
('WHAT_IS_MIN_STOCK','O que é estoque mínimo','estoque','minimum_stock','BEGINNER','PUBLISHED',1),
('HOW_SEND_WAITER_ORDER','Como enviar pedido pelo Garçom Mobile','pedidos','waiter_send','BEGINNER','PUBLISHED',1);

INSERT OR IGNORE INTO knowledge_version(article_id,version_no,software_version_min,software_version_max,body_markdown,author_ref,reviewer_ref,status,published_at)
SELECT id,1,'9.8',NULL,'Conteúdo demonstrativo LAB. O procedimento oficial precisa acompanhar a versão instalada.','NEXO','REVIEWER','PUBLISHED',CURRENT_TIMESTAMP FROM knowledge_article;
