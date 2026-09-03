-- NEXO ERP PRO 9.8 LAB — Fase 7
-- Garçom Mobile + Pratos Executivos + Empresas/Marcas de Bebidas
-- PROPOSTA DE CONTRATO. Não aplicar cegamente no banco comercial sem migração/mapeamento.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS waiter_profile (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  can_request_cancel INTEGER NOT NULL DEFAULT 1 CHECK(can_request_cancel IN (0,1)),
  can_request_close INTEGER NOT NULL DEFAULT 1 CHECK(can_request_close IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waiter_device (
  id TEXT PRIMARY KEY,
  waiter_id TEXT NOT NULL,
  device_label TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('ANDROID','IOS','WINDOWS','OTHER')),
  trusted INTEGER NOT NULL DEFAULT 0 CHECK(trusted IN (0,1)),
  last_seen_at TEXT,
  revoked_at TEXT,
  FOREIGN KEY(waiter_id) REFERENCES waiter_profile(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS waiter_session (
  id TEXT PRIMARY KEY,
  waiter_id TEXT NOT NULL,
  device_id TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY(waiter_id) REFERENCES waiter_profile(id) ON DELETE RESTRICT,
  FOREIGN KEY(device_id) REFERENCES waiter_device(id) ON DELETE SET NULL,
  CHECK(expires_at > created_at)
);

CREATE TABLE IF NOT EXISTS waiter_order_submission (
  id TEXT PRIMARY KEY,
  waiter_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  order_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  client_created_at TEXT NOT NULL,
  received_at TEXT,
  ack_at TEXT,
  state TEXT NOT NULL DEFAULT 'DRAFT' CHECK(state IN ('DRAFT','QUEUED_LOCAL','RECEIVED','ACKED','REJECTED')),
  reject_reason TEXT,
  payload_hash TEXT NOT NULL,
  FOREIGN KEY(waiter_id) REFERENCES waiter_profile(id) ON DELETE RESTRICT,
  FOREIGN KEY(table_id) REFERENCES restaurant_table(id) ON DELETE RESTRICT,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS waiter_notification (
  id TEXT PRIMARY KEY,
  waiter_id TEXT NOT NULL,
  order_id TEXT,
  kind TEXT NOT NULL CHECK(kind IN ('ORDER_READY','ORDER_CANCELLED','ITEM_UNAVAILABLE','CLOSE_REQUESTED','PAYMENT_COMPLETED','SYSTEM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY(waiter_id) REFERENCES waiter_profile(id) ON DELETE RESTRICT,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS waiter_realtime_event (
  id TEXT PRIMARY KEY,
  waiter_id TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  delivered_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  FOREIGN KEY(waiter_id) REFERENCES waiter_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS beverage_company (
  id TEXT PRIMARY KEY,
  legal_or_trade_name TEXT NOT NULL UNIQUE,
  company_kind TEXT NOT NULL CHECK(company_kind IN ('BEVERAGE_SYSTEM','BREWERY','FOOD_BEVERAGE','BOTTLER','DISTRIBUTOR','OTHER')),
  country_code TEXT NOT NULL DEFAULT 'BR',
  official_source_url TEXT,
  status TEXT NOT NULL DEFAULT 'REFERENCE' CHECK(status IN ('REFERENCE','CANDIDATE','VERIFIED','HOMOLOGATED','INACTIVE')),
  notes TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beverage_brand (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  beverage_category TEXT NOT NULL CHECK(beverage_category IN ('SOFT_DRINK','JUICE','WATER','SPORTS','TEA','ENERGY','BEER','RTD','OTHER')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(company_id) REFERENCES beverage_company(id) ON DELETE RESTRICT,
  UNIQUE(company_id, brand_name)
);

CREATE TABLE IF NOT EXISTS executive_dish (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  sale_price_cents INTEGER NOT NULL CHECK(sale_price_cents >= 0),
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(estimated_cost_cents >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  production_sector TEXT NOT NULL DEFAULT 'KITCHEN' CHECK(production_sector IN ('KITCHEN','BAR','EXPEDITION','NONE')),
  demo_only INTEGER NOT NULL DEFAULT 1 CHECK(demo_only IN (0,1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS executive_dish_component (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL,
  component_name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  required INTEGER NOT NULL DEFAULT 1 CHECK(required IN (0,1)),
  can_replace INTEGER NOT NULL DEFAULT 0 CHECK(can_replace IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(dish_id) REFERENCES executive_dish(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS beverage_catalog_reference (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  volume_ml INTEGER CHECK(volume_ml IS NULL OR volume_ml > 0),
  barcode TEXT,
  product_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(brand_id) REFERENCES beverage_brand(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_waiter_session_waiter ON waiter_session(waiter_id, revoked_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_waiter_submission_state ON waiter_order_submission(waiter_id, state, client_created_at);
CREATE INDEX IF NOT EXISTS idx_waiter_notification_unread ON waiter_notification(waiter_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_waiter_event_delivery ON waiter_realtime_event(waiter_id, delivered_at, created_at);
CREATE INDEX IF NOT EXISTS idx_beverage_brand_company ON beverage_brand(company_id, beverage_category, active);
CREATE INDEX IF NOT EXISTS idx_executive_dish_active ON executive_dish(active, name);
