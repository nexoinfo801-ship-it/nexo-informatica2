PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS weighing_device(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  station TEXT,
  connection_type TEXT NOT NULL CHECK(connection_type IN('SERIAL','USB','NETWORK','MANUAL')),
  protocol TEXT,
  status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK(status IN('ONLINE','UNSTABLE','OFFLINE')),
  last_seen_at TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1))
);

CREATE TABLE IF NOT EXISTS weighing_product_policy(
  product_id TEXT PRIMARY KEY,
  sale_mode TEXT NOT NULL CHECK(sale_mode IN('UNIT','WEIGHT','VOLUME','SELF_SERVICE_KG','SELF_SERVICE_FIXED','COMBO')),
  unit TEXT NOT NULL,
  price_per_unit_cents INTEGER NOT NULL CHECK(price_per_unit_cents>=0),
  scale_enabled INTEGER NOT NULL DEFAULT 0 CHECK(scale_enabled IN(0,1)),
  weighing_device_id TEXT REFERENCES weighing_device(id),
  tare_mode TEXT NOT NULL DEFAULT 'NONE' CHECK(tare_mode IN('NONE','REGISTERED','MANUAL','DEVICE')),
  registered_tare_grams INTEGER NOT NULL DEFAULT 0 CHECK(registered_tare_grams>=0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1))
);

CREATE TABLE IF NOT EXISTS weighing_barcode_rule(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  total_length INTEGER NOT NULL CHECK(total_length>0),
  product_start INTEGER NOT NULL CHECK(product_start>=0),
  product_length INTEGER NOT NULL CHECK(product_length>0),
  value_mode TEXT NOT NULL CHECK(value_mode IN('WEIGHT_GRAMS','PRICE_CENTS')),
  value_start INTEGER NOT NULL CHECK(value_start>=0),
  value_length INTEGER NOT NULL CHECK(value_length>0),
  check_digit_mode TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1))
);

CREATE TABLE IF NOT EXISTS weighing_session(
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT NOT NULL,
  device_id TEXT REFERENCES weighing_device(id),
  gross_grams INTEGER NOT NULL CHECK(gross_grams>=0),
  tare_grams INTEGER NOT NULL DEFAULT 0 CHECK(tare_grams>=0),
  net_grams INTEGER NOT NULL CHECK(net_grams>=0),
  price_per_kg_cents INTEGER NOT NULL CHECK(price_per_kg_cents>=0),
  total_cents INTEGER NOT NULL CHECK(total_cents>=0),
  idempotency_key TEXT NOT NULL UNIQUE,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(net_grams=gross_grams-tare_grams),
  CHECK(tare_grams<=gross_grams)
);

CREATE TABLE IF NOT EXISTS weighing_inventory_balance(
  product_id TEXT PRIMARY KEY,
  quantity_milliunits INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weighing_inventory_movement(
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK(movement_type IN('PRODUCTION_IN','SALE_OUT','LOSS_OUT','ADJUSTMENT_IN','ADJUSTMENT_OUT','INVENTORY')),
  quantity_milliunits INTEGER NOT NULL CHECK(quantity_milliunits>0),
  reference_id TEXT,
  reason TEXT,
  user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weighing_production_batch(
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  planned_yield_grams INTEGER NOT NULL CHECK(planned_yield_grams>0),
  actual_yield_grams INTEGER CHECK(actual_yield_grams>=0),
  input_grams INTEGER NOT NULL CHECK(input_grams>0),
  loss_grams INTEGER NOT NULL DEFAULT 0 CHECK(loss_grams>=0),
  total_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(total_cost_cents>=0),
  produced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(actual_yield_grams IS NULL OR actual_yield_grams+loss_grams<=input_grams)
);

CREATE TABLE IF NOT EXISTS weighing_inventory_count(
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  system_milliunits INTEGER NOT NULL,
  counted_milliunits INTEGER NOT NULL,
  difference_milliunits INTEGER NOT NULL,
  reason TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(difference_milliunits=counted_milliunits-system_milliunits)
);

CREATE TABLE IF NOT EXISTS weighing_label_job(
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  template_id TEXT,
  barcode_value TEXT,
  net_grams INTEGER,
  price_per_kg_cents INTEGER,
  total_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN('QUEUED','PRINTED','FAILED','CANCELLED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weighing_audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id TEXT,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
