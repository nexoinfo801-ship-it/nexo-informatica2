PRAGMA foreign_keys = ON;

-- NEXO Fiscal 9.8 LAB
-- Contrato público: sem certificado privado, senha, XML fiscal real ou endpoint secreto.
-- Regras tributárias são versionadas e precisam de fonte oficial + vigência; não são decididas pela IA.

CREATE TABLE IF NOT EXISTS fiscal_company_profile (
  id INTEGER PRIMARY KEY,
  tenant_ref TEXT NOT NULL,
  cnpj TEXT NOT NULL CHECK(length(cnpj)=14),
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  state_registration TEXT,
  municipal_registration TEXT,
  tax_regime TEXT NOT NULL,
  ibge_city_code TEXT NOT NULL,
  state_code TEXT NOT NULL CHECK(length(state_code)=2),
  environment TEXT NOT NULL DEFAULT 'HOMOLOGATION' CHECK(environment IN ('HOMOLOGATION','PRODUCTION')),
  enable_nfe INTEGER NOT NULL DEFAULT 0 CHECK(enable_nfe IN (0,1)),
  enable_nfce INTEGER NOT NULL DEFAULT 0 CHECK(enable_nfce IN (0,1)),
  enable_nfse INTEGER NOT NULL DEFAULT 0 CHECK(enable_nfse IN (0,1)),
  status TEXT NOT NULL DEFAULT 'DISABLED' CHECK(status IN ('DISABLED','CONFIGURING','HOMOLOGATION','READY_FOR_PRODUCTION','ACTIVE','BLOCKED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_ref,cnpj)
);

CREATE TABLE IF NOT EXISTS fiscal_rule_version (
  id INTEGER PRIMARY KEY,
  rule_key TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  document_model TEXT,
  valid_from TEXT,
  valid_to TEXT,
  status TEXT NOT NULL CHECK(status IN ('DRAFT','VERIFIED','ACTIVE','SUPERSEDED','REVOKED')),
  source_authority TEXT NOT NULL,
  source_reference TEXT NOT NULL,
  verified_at TEXT,
  rule_payload_json TEXT NOT NULL DEFAULT '{}',
  notes TEXT,
  UNIQUE(rule_key,jurisdiction,source_reference)
);

CREATE TABLE IF NOT EXISTS fiscal_product_profile (
  id INTEGER PRIMARY KEY,
  product_ref TEXT NOT NULL UNIQUE,
  ncm TEXT CHECK(ncm IS NULL OR length(ncm)=8),
  cfop_default TEXT CHECK(cfop_default IS NULL OR length(cfop_default)=4),
  cst TEXT,
  csosn TEXT,
  origin_code TEXT,
  commercial_unit TEXT,
  fiscal_ready INTEGER NOT NULL DEFAULT 0 CHECK(fiscal_ready IN (0,1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fiscal_certificate_ref (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES fiscal_company_profile(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK(certificate_type IN ('A1','A3')),
  storage_kind TEXT NOT NULL CHECK(storage_kind IN ('WINDOWS_CERT_STORE','PKCS12_LOCAL_REF','TOKEN_CSP','CLOUD_PROVIDER_REF')),
  subject_cn TEXT,
  serial_number TEXT,
  valid_from TEXT,
  valid_to TEXT,
  thumbprint TEXT,
  status TEXT NOT NULL CHECK(status IN ('UNKNOWN','VALID','EXPIRING','EXPIRED','UNAVAILABLE')),
  secret_material_present INTEGER NOT NULL DEFAULT 0 CHECK(secret_material_present=0),
  checked_at TEXT
);

CREATE TABLE IF NOT EXISTS fiscal_document (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES fiscal_company_profile(id),
  order_ref TEXT,
  model TEXT NOT NULL CHECK(model IN ('55','65','NFSE')),
  environment TEXT NOT NULL CHECK(environment IN ('HOMOLOGATION','PRODUCTION')),
  idempotency_key TEXT NOT NULL UNIQUE,
  number TEXT,
  series TEXT,
  access_key TEXT,
  protocol TEXT,
  recipient_document_type TEXT CHECK(recipient_document_type IN ('CPF','CNPJ','FOREIGN','NONE')),
  recipient_document_hash TEXT,
  gross_total_cents INTEGER NOT NULL DEFAULT 0 CHECK(gross_total_cents>=0),
  status TEXT NOT NULL CHECK(status IN ('DRAFT','VALIDATED','QUEUED','PROCESSING','AUTHORIZED','REJECTED','CANCELLED','CONTINGENCY','ERROR')),
  rule_snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fiscal_document_item (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES fiscal_document(id) ON DELETE CASCADE,
  product_ref TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity>0),
  unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents>=0),
  total_cents INTEGER NOT NULL CHECK(total_cents>=0),
  ncm TEXT,
  cfop TEXT,
  cst_or_csosn TEXT,
  origin_code TEXT,
  unit TEXT
);

CREATE TABLE IF NOT EXISTS fiscal_event (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES fiscal_document(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN ('AUTHORIZE','CANCEL','CORRECTION','VOID_NUMBER','CONTINGENCY_ENTER','CONTINGENCY_EXIT','STATUS_QUERY')),
  request_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('PENDING','ACCEPTED','REJECTED','ERROR')),
  protocol TEXT,
  authority_code TEXT,
  authority_message TEXT,
  reason TEXT,
  actor_ref TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fiscal_transmission_attempt (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES fiscal_document(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  environment TEXT NOT NULL CHECK(environment IN ('HOMOLOGATION','PRODUCTION')),
  attempt_no INTEGER NOT NULL CHECK(attempt_no>0),
  correlation_id TEXT NOT NULL,
  result TEXT NOT NULL CHECK(result IN ('SUCCESS','REJECTED','TIMEOUT','NETWORK_ERROR','CERT_ERROR','VALIDATION_ERROR')),
  authority_code TEXT,
  latency_ms INTEGER CHECK(latency_ms IS NULL OR latency_ms>=0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id,service,attempt_no)
);

CREATE TABLE IF NOT EXISTS fiscal_rejection_catalog (
  authority_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  user_message TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('INFO','WARNING','HIGH','CRITICAL')),
  source_reference TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS fiscal_audit (
  id INTEGER PRIMARY KEY,
  company_id INTEGER REFERENCES fiscal_company_profile(id),
  document_id INTEGER REFERENCES fiscal_document(id),
  actor_ref TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo histórico propositalmente marcado como REVOKED. O runtime deverá resolver a regra vigente por fonte/verificação.
INSERT OR IGNORE INTO fiscal_rule_version
(rule_key,jurisdiction,document_model,valid_from,valid_to,status,source_authority,source_reference,verified_at,rule_payload_json,notes)
VALUES
('NFCE_RECIPIENT_CNPJ_POLICY','BR','65',NULL,'2026-04-08','REVOKED','CONFAZ','Ajuste SINIEF 11/25 revogado pelo Ajuste SINIEF 12/26','2026-09-03','{"historical":true,"enforce":false}','Não aplicar como regra vigente. Manter somente para histórico/auditoria de versões normativas.');

INSERT OR IGNORE INTO fiscal_rejection_catalog(authority_code,title,user_message,suggested_action,severity,source_reference) VALUES
('204','Duplicidade','O documento pode já ter sido processado.','Consultar status/protocolo antes de qualquer novo envio.','HIGH','Catálogo fiscal — validar por versão/UF'),
('225','Falha de validação do XML','O documento possui dados fiscais incompletos ou incompatíveis.','Revisar cadastro fiscal e validar novamente antes do envio.','HIGH','Catálogo fiscal — validar por versão/UF');
