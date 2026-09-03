-- NEXO ERP PRO 9.8 LAB — Fase 10 NEXO Intelligence / Central
-- CONTRATO PÚBLICO DE ARQUITETURA. Sem chaves, tokens, PII de clientes finais ou conteúdo de vendas.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS nexo_tenant (
  id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','SUSPENDED','CANCELLED')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nexo_plan (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('TRIAL','MONTHLY','QUARTERLY','SEMIANNUAL','ANNUAL','LIFETIME')),
  device_limit INTEGER NOT NULL DEFAULT 1 CHECK(device_limit > 0),
  backup_daily_retention INTEGER NOT NULL DEFAULT 30 CHECK(backup_daily_retention >= 0),
  backup_weekly_retention INTEGER NOT NULL DEFAULT 12 CHECK(backup_weekly_retention >= 0),
  backup_monthly_retention INTEGER NOT NULL DEFAULT 12 CHECK(backup_monthly_retention >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS nexo_license (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('TRIAL','ACTIVE','EXPIRING','EXPIRED','SUSPENDED','CANCELLED')),
  starts_at TEXT NOT NULL,
  expires_at TEXT,
  max_devices INTEGER NOT NULL CHECK(max_devices > 0),
  offline_valid_until TEXT,
  last_rules_evaluation_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id),
  FOREIGN KEY(plan_id) REFERENCES nexo_plan(id)
);

CREATE TABLE IF NOT EXISTS nexo_license_device (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  installation_fingerprint_hash TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','REPLACED','REVOKED')),
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT,
  app_version TEXT,
  UNIQUE(license_id, installation_fingerprint_hash),
  FOREIGN KEY(license_id) REFERENCES nexo_license(id)
);

CREATE TABLE IF NOT EXISTS nexo_agent_heartbeat (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  windows_version TEXT,
  db_schema_version TEXT,
  free_disk_mb INTEGER CHECK(free_disk_mb IS NULL OR free_disk_mb >= 0),
  service_status TEXT NOT NULL CHECK(service_status IN ('OK','DEGRADED','FAILED')),
  backup_status TEXT CHECK(backup_status IN ('SUCCESS','WARNING','FAILED','NOT_CONFIGURED')),
  critical_error_count INTEGER NOT NULL DEFAULT 0 CHECK(critical_error_count >= 0),
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id),
  FOREIGN KEY(device_id) REFERENCES nexo_license_device(id)
);

-- Métricas agregadas/minimizadas. Não contém cliente final, item, pedido detalhado ou valor individual de venda.
CREATE TABLE IF NOT EXISTS nexo_usage_daily (
  tenant_id TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  active_sessions INTEGER NOT NULL DEFAULT 0 CHECK(active_sessions >= 0),
  orders_count INTEGER NOT NULL DEFAULT 0 CHECK(orders_count >= 0),
  sales_count INTEGER NOT NULL DEFAULT 0 CHECK(sales_count >= 0),
  stock_actions_count INTEGER NOT NULL DEFAULT 0 CHECK(stock_actions_count >= 0),
  cash_actions_count INTEGER NOT NULL DEFAULT 0 CHECK(cash_actions_count >= 0),
  delivery_actions_count INTEGER NOT NULL DEFAULT 0 CHECK(delivery_actions_count >= 0),
  modules_used_json TEXT NOT NULL DEFAULT '[]',
  last_activity_at TEXT,
  PRIMARY KEY(tenant_id, usage_date),
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

CREATE TABLE IF NOT EXISTS nexo_usage_score_snapshot (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
  classification TEXT NOT NULL CHECK(classification IN ('HIGH','MEDIUM','LOW','INACTIVE')),
  rule_version TEXT NOT NULL,
  calculated_at TEXT NOT NULL,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id),
  CHECK(period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS nexo_backup_remote_record (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  backup_kind TEXT NOT NULL CHECK(backup_kind IN ('DAILY','WEEKLY','MONTHLY','PRE_UPDATE','MANUAL')),
  created_at TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
  sha256 TEXT NOT NULL CHECK(length(sha256)=64),
  encrypted INTEGER NOT NULL DEFAULT 1 CHECK(encrypted IN (0,1)),
  upload_status TEXT NOT NULL CHECK(upload_status IN ('PENDING','UPLOADED','FAILED')),
  integrity_status TEXT NOT NULL CHECK(integrity_status IN ('PENDING','SUCCESS','WARNING','FAILED')),
  restore_test_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(restore_test_status IN ('PENDING','SUCCESS','FAILED','NOT_SCHEDULED')),
  storage_object_ref TEXT,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id),
  FOREIGN KEY(device_id) REFERENCES nexo_license_device(id)
);

CREATE TABLE IF NOT EXISTS nexo_backup_restore_test (
  id TEXT PRIMARY KEY,
  backup_id TEXT NOT NULL,
  tested_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('SUCCESS','FAILED')),
  details_code TEXT,
  FOREIGN KEY(backup_id) REFERENCES nexo_backup_remote_record(id)
);

CREATE TABLE IF NOT EXISTS nexo_support_ticket_central (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('CRITICAL','HIGH','NORMAL','LOW')),
  status TEXT NOT NULL CHECK(status IN ('NEW','ASSIGNED','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED')),
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

CREATE TABLE IF NOT EXISTS nexo_software_version (
  version TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK(channel IN ('STABLE','BETA')),
  min_supported_version TEXT,
  published_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS nexo_update_deployment (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  from_version TEXT,
  to_version TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('PLANNED','BACKUP_REQUIRED','READY','INSTALLING','SUCCESS','FAILED','ROLLED_BACK')),
  backup_id TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id),
  FOREIGN KEY(device_id) REFERENCES nexo_license_device(id),
  FOREIGN KEY(backup_id) REFERENCES nexo_backup_remote_record(id)
);

CREATE TABLE IF NOT EXISTS nexo_notification_central (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  category TEXT NOT NULL CHECK(category IN ('LICENSE','BACKUP','INCIDENT','SUPPORT','UPDATE','MAINTENANCE','SECURITY','USAGE')),
  severity TEXT NOT NULL CHECK(severity IN ('INFO','WARNING','HIGH','CRITICAL')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  acknowledged_at TEXT,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

-- IA só registra análise/recomendação. Não altera licença, backup, permissões ou financeiro diretamente.
CREATE TABLE IF NOT EXISTS nexo_ai_recommendation (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  recommendation_type TEXT NOT NULL CHECK(recommendation_type IN ('USAGE','HEALTH','BACKUP','SUPPORT','TRAINING','UPDATE','COMMERCIAL')),
  severity TEXT NOT NULL CHECK(severity IN ('INFO','WARNING','HIGH','CRITICAL')),
  summary TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  suggested_action TEXT,
  requires_human_approval INTEGER NOT NULL DEFAULT 1 CHECK(requires_human_approval IN (0,1)),
  action_state TEXT NOT NULL DEFAULT 'PROPOSED' CHECK(action_state IN ('PROPOSED','APPROVED','REJECTED','EXECUTED','EXPIRED')),
  created_at TEXT NOT NULL,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

CREATE TABLE IF NOT EXISTS nexo_ai_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  model_family TEXT NOT NULL,
  function_name TEXT NOT NULL,
  usage_units INTEGER NOT NULL DEFAULT 0 CHECK(usage_units >= 0),
  estimated_cost_micros INTEGER NOT NULL DEFAULT 0 CHECK(estimated_cost_micros >= 0),
  occurred_at TEXT NOT NULL,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

CREATE TABLE IF NOT EXISTS nexo_central_audit (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  actor_type TEXT NOT NULL CHECK(actor_type IN ('ADMIN','SUPPORT','AGENT','RULE_ENGINE','AI_SERVICE','SYSTEM')),
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  reason TEXT,
  occurred_at TEXT NOT NULL,
  correlation_id TEXT,
  FOREIGN KEY(tenant_id) REFERENCES nexo_tenant(id)
);

CREATE INDEX IF NOT EXISTS idx_nexo_license_status ON nexo_license(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_nexo_heartbeat_tenant_time ON nexo_agent_heartbeat(tenant_id, received_at);
CREATE INDEX IF NOT EXISTS idx_nexo_usage_date ON nexo_usage_daily(usage_date, tenant_id);
CREATE INDEX IF NOT EXISTS idx_nexo_backup_tenant_time ON nexo_backup_remote_record(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_nexo_ticket_status ON nexo_support_ticket_central(status, priority, opened_at);
CREATE INDEX IF NOT EXISTS idx_nexo_notification_severity ON nexo_notification_central(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_nexo_ai_rec_state ON nexo_ai_recommendation(action_state, severity, created_at);
