-- NEXO ERP PRO 9.8 LAB — domínio Restaurante/Marmitaria
-- PROPOSTA DE CONTRATO. Não aplicar cegamente no banco comercial sem migração/mapeamento.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS restaurant_table (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4 CHECK(seats > 0),
  status TEXT NOT NULL DEFAULT 'FREE' CHECK(status IN ('FREE','OCCUPIED','ORDER_SENT','PREPARING','READY','SERVING','CLOSING')),
  waiter_user_id TEXT,
  opened_at TEXT,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS restaurant_order (
  id TEXT PRIMARY KEY,
  table_id TEXT,
  channel TEXT NOT NULL CHECK(channel IN ('TABLE','COUNTER','TAKEAWAY','DELIVERY')),
  status TEXT NOT NULL CHECK(status IN ('DRAFT','SENT','PREPARING','PARTIAL_READY','READY','SERVING','CLOSING','CLOSED','CANCELLED')),
  waiter_user_id TEXT,
  guest_label TEXT,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  closed_at TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(table_id) REFERENCES restaurant_table(id)
);

CREATE TABLE IF NOT EXISTS restaurant_order_item (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents >= 0),
  production_sector TEXT NOT NULL DEFAULT 'NONE' CHECK(production_sector IN ('KITCHEN','BAR','EXPEDITION','NONE')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','ACCEPTED','PREPARING','READY','DELIVERED','CANCELLED')),
  created_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS product_modifier_group (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  min_choices INTEGER NOT NULL DEFAULT 0 CHECK(min_choices >= 0),
  max_choices INTEGER NOT NULL DEFAULT 1 CHECK(max_choices >= min_choices),
  required INTEGER NOT NULL DEFAULT 0 CHECK(required IN (0,1)),
  free_quota INTEGER NOT NULL DEFAULT 0 CHECK(free_quota >= 0),
  production_sector TEXT CHECK(production_sector IN ('KITCHEN','BAR','EXPEDITION','NONE')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS product_modifier_option (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  extra_price_cents INTEGER NOT NULL DEFAULT 0,
  can_substitute INTEGER NOT NULL DEFAULT 0 CHECK(can_substitute IN (0,1)),
  substitute_product_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(group_id) REFERENCES product_modifier_group(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_order_item_modifier (
  order_item_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  option_name_snapshot TEXT NOT NULL,
  extra_price_cents INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(order_item_id, option_id),
  FOREIGN KEY(order_item_id) REFERENCES restaurant_order_item(id) ON DELETE RESTRICT,
  FOREIGN KEY(option_id) REFERENCES product_modifier_option(id)
);

CREATE TABLE IF NOT EXISTS production_ticket (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  sector TEXT NOT NULL CHECK(sector IN ('KITCHEN','BAR','EXPEDITION')),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','ACCEPTED','PREPARING','READY','DELIVERED','CANCELLED')),
  sequence_no INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  accepted_at TEXT,
  preparing_at TEXT,
  ready_at TEXT,
  delivered_at TEXT,
  responsible_user_id TEXT,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id) ON DELETE RESTRICT,
  UNIQUE(order_id, sector, sequence_no)
);

CREATE TABLE IF NOT EXISTS printer_route (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL CHECK(destination IN ('CASHIER','KITCHEN','BAR','EXPEDITION')),
  printer_name TEXT NOT NULL,
  driver_kind TEXT NOT NULL DEFAULT 'WINDOWS_QUEUE' CHECK(driver_kind IN ('WINDOWS_QUEUE','ESC_POS','PDF_TEST')),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  copies INTEGER NOT NULL DEFAULT 1 CHECK(copies BETWEEN 1 AND 5),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS print_job (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  production_ticket_id TEXT,
  destination TEXT NOT NULL CHECK(destination IN ('CASHIER','KITCHEN','BAR','EXPEDITION')),
  state TEXT NOT NULL DEFAULT 'QUEUED' CHECK(state IN ('QUEUED','PRINTING','PRINTED','FAILED','CANCELLED')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  last_error TEXT,
  payload_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  printed_at TEXT,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id),
  FOREIGN KEY(production_ticket_id) REFERENCES production_ticket(id)
);

CREATE TABLE IF NOT EXISTS product_recipe (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  yield_quantity REAL NOT NULL DEFAULT 1 CHECK(yield_quantity > 0),
  yield_unit TEXT NOT NULL DEFAULT 'UN',
  labor_cost_cents INTEGER NOT NULL DEFAULT 0,
  packaging_cost_cents INTEGER NOT NULL DEFAULT 0,
  overhead_cost_cents INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_recipe_item (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  stock_product_id TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit TEXT NOT NULL,
  waste_percent REAL NOT NULL DEFAULT 0 CHECK(waste_percent >= 0 AND waste_percent < 100),
  unit_cost_cents INTEGER NOT NULL CHECK(unit_cost_cents >= 0),
  FOREIGN KEY(recipe_id) REFERENCES product_recipe(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loss_event (
  id TEXT PRIMARY KEY,
  stock_product_id TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit TEXT NOT NULL,
  unit_cost_cents INTEGER NOT NULL CHECK(unit_cost_cents >= 0),
  total_cost_cents INTEGER NOT NULL CHECK(total_cost_cents >= 0),
  reason TEXT NOT NULL,
  responsible_user_id TEXT NOT NULL,
  notes TEXT,
  occurred_at TEXT NOT NULL,
  audit_event_id TEXT
);

CREATE TABLE IF NOT EXISTS thematic_menu_event (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  fixed_price_cents INTEGER NOT NULL CHECK(fixed_price_cents >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  CHECK(ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS thematic_menu_product (
  event_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  PRIMARY KEY(event_id, product_id),
  FOREIGN KEY(event_id) REFERENCES thematic_menu_event(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_operation_audit (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  terminal_id TEXT,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_restaurant_table_status ON restaurant_table(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_order_table_status ON restaurant_order(table_id, status);
CREATE INDEX IF NOT EXISTS idx_restaurant_item_order_sector ON restaurant_order_item(order_id, production_sector, status);
CREATE INDEX IF NOT EXISTS idx_production_ticket_sector_status ON production_ticket(sector, status, created_at);
CREATE INDEX IF NOT EXISTS idx_print_job_state ON print_job(state, destination, created_at);
CREATE INDEX IF NOT EXISTS idx_loss_event_date ON loss_event(occurred_at, stock_product_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_audit_entity ON restaurant_operation_audit(entity_type, entity_id, occurred_at);
