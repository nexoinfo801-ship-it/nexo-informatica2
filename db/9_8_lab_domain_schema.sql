-- NEXO ERP PRO 9.8 LAB
-- Esquema PROPOSTO para novas capacidades. Não executar automaticamente em produção.
-- Adaptar às tabelas canônicas do ERP privado após auditoria de compatibilidade.

CREATE TABLE IF NOT EXISTS stock_replenishment_policy (
  warehouse_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  min_stock REAL NOT NULL DEFAULT 0 CHECK(min_stock >= 0),
  max_stock REAL NOT NULL DEFAULT 0 CHECK(max_stock >= min_stock),
  safety_stock REAL NOT NULL DEFAULT 0 CHECK(safety_stock >= 0),
  lead_time_days INTEGER NOT NULL DEFAULT 0 CHECK(lead_time_days >= 0),
  preferred_supplier_id TEXT,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (warehouse_id, sku)
);

CREATE TABLE IF NOT EXISTS stock_alert_event (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  threshold_state TEXT NOT NULL CHECK(threshold_state IN ('LOW','CRITICAL','RECOVERED')),
  available_qty REAL NOT NULL,
  min_stock REAL NOT NULL,
  safety_stock REAL NOT NULL,
  opened_at TEXT NOT NULL,
  acknowledged_at TEXT,
  acknowledged_by TEXT,
  snoozed_until TEXT,
  resolved_at TEXT,
  dedupe_key TEXT NOT NULL,
  UNIQUE(dedupe_key, opened_at)
);

CREATE INDEX IF NOT EXISTS idx_stock_alert_active
ON stock_alert_event(warehouse_id, sku, resolved_at, threshold_state);

CREATE TABLE IF NOT EXISTS backup_history (
  id TEXT PRIMARY KEY,
  backup_day TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  trigger_type TEXT NOT NULL CHECK(trigger_type IN ('scheduled','catchup','manual')),
  file_name TEXT NOT NULL,
  size_bytes INTEGER,
  sha256 TEXT,
  quick_check_result TEXT,
  status TEXT NOT NULL CHECK(status IN ('creating','verified','failed','quarantined')),
  app_version TEXT,
  schema_version INTEGER,
  error_message TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_backup_one_scheduled_per_day
ON backup_history(backup_day)
WHERE status='verified' AND trigger_type IN ('scheduled','catchup');

CREATE TABLE IF NOT EXISTS daily_report_snapshot (
  report_day TEXT NOT NULL,
  revision INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('live','closed')),
  generated_at TEXT NOT NULL,
  generated_by TEXT,
  audit_high_watermark TEXT,
  payload_json TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  reconciliation_status TEXT NOT NULL CHECK(reconciliation_status IN ('ok','warning','blocked')),
  PRIMARY KEY(report_day, revision)
);

CREATE INDEX IF NOT EXISTS idx_daily_report_latest
ON daily_report_snapshot(report_day, revision DESC);

-- O cache postal de Avaré já é definido em avare_public_seed.sql.
-- Não armazenar número do imóvel como dado derivado do CEP.
-- O número pertence ao cadastro/endereço do cliente e exige confirmação humana.
