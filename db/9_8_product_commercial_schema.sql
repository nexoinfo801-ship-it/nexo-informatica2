-- NEXO ERP PRO 9.8 LAB — Fase 8
-- Produtos, preços, margem, estoque, validade, compras e código de barras.
-- PROPOSTA DE CONTRATO. Não aplicar cegamente no banco comercial sem migração/mapeamento.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS product_category_core (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(parent_id) REFERENCES product_category_core(id)
);

CREATE TABLE IF NOT EXISTS product_master_core (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  brand_name TEXT,
  unit TEXT NOT NULL CHECK(unit IN ('UN','KG','G','L','ML','CX','PCT','FD','RL','M','M2','OTHER')),
  barcode TEXT UNIQUE,
  default_supplier_id TEXT,
  controls_expiry INTEGER NOT NULL DEFAULT 0 CHECK(controls_expiry IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(category_id) REFERENCES product_category_core(id)
);

CREATE TABLE IF NOT EXISTS product_supplier_link (
  product_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  supplier_sku TEXT,
  preferred INTEGER NOT NULL DEFAULT 0 CHECK(preferred IN (0,1)),
  lead_time_days INTEGER CHECK(lead_time_days IS NULL OR lead_time_days >= 0),
  last_purchase_cost_cents INTEGER CHECK(last_purchase_cost_cents IS NULL OR last_purchase_cost_cents >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(product_id, supplier_id),
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_cost_state (
  product_id TEXT PRIMARY KEY,
  unit_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(unit_cost_cents >= 0),
  last_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(last_cost_cents >= 0),
  average_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(average_cost_cents >= 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_price_state (
  product_id TEXT PRIMARY KEY,
  retail_price_cents INTEGER NOT NULL DEFAULT 0 CHECK(retail_price_cents >= 0),
  wholesale_price_cents INTEGER CHECK(wholesale_price_cents IS NULL OR wholesale_price_cents >= 0),
  wholesale_min_qty REAL CHECK(wholesale_min_qty IS NULL OR wholesale_min_qty > 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_stock_policy (
  product_id TEXT PRIMARY KEY,
  minimum_qty REAL NOT NULL DEFAULT 0 CHECK(minimum_qty >= 0),
  maximum_qty REAL CHECK(maximum_qty IS NULL OR maximum_qty >= minimum_qty),
  safety_qty REAL NOT NULL DEFAULT 0 CHECK(safety_qty >= 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_stock_balance (
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL DEFAULT 'MAIN',
  physical_qty REAL NOT NULL DEFAULT 0,
  reserved_qty REAL NOT NULL DEFAULT 0 CHECK(reserved_qty >= 0),
  in_transit_qty REAL NOT NULL DEFAULT 0 CHECK(in_transit_qty >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(product_id, warehouse_id),
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE CASCADE,
  CHECK(physical_qty >= 0),
  CHECK(reserved_qty <= physical_qty)
);

CREATE TABLE IF NOT EXISTS product_inventory_lot (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL DEFAULT 'MAIN',
  lot_code TEXT,
  manufactured_on TEXT,
  expires_on TEXT,
  qty_available REAL NOT NULL CHECK(qty_available >= 0),
  unit_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(unit_cost_cents >= 0),
  received_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE','BLOCKED','EXPIRED','DEPLETED')),
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE RESTRICT,
  CHECK(expires_on IS NULL OR manufactured_on IS NULL OR expires_on >= manufactured_on)
);

CREATE TABLE IF NOT EXISTS product_inventory_movement (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL DEFAULT 'MAIN',
  lot_id TEXT,
  movement_type TEXT NOT NULL CHECK(movement_type IN ('PURCHASE_IN','SALE_OUT','LOSS_OUT','ADJUST_IN','ADJUST_OUT','TRANSFER_IN','TRANSFER_OUT','RETURN_IN','RETURN_OUT')),
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit_cost_cents INTEGER CHECK(unit_cost_cents IS NULL OR unit_cost_cents >= 0),
  source_type TEXT NOT NULL,
  source_id TEXT,
  actor_user_id TEXT NOT NULL,
  reason TEXT,
  occurred_at TEXT NOT NULL,
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE RESTRICT,
  FOREIGN KEY(lot_id) REFERENCES product_inventory_lot(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS purchase_receipt_core (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  document_no TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','CHECKING','RECEIVED','CANCELLED')),
  received_at TEXT,
  actor_user_id TEXT NOT NULL,
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK(total_cents >= 0),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_receipt_item_core (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit_cost_cents INTEGER NOT NULL CHECK(unit_cost_cents >= 0),
  lot_code TEXT,
  expires_on TEXT,
  total_cents INTEGER NOT NULL CHECK(total_cents >= 0),
  FOREIGN KEY(receipt_id) REFERENCES purchase_receipt_core(id) ON DELETE RESTRICT,
  FOREIGN KEY(product_id) REFERENCES product_master_core(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS product_barcode_scan_event (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('USB_HID','CAMERA','MANUAL')),
  context TEXT NOT NULL CHECK(context IN ('PDV','WAITER_PWA','PRODUCT_SEARCH','PURCHASE_RECEIPT','INVENTORY')),
  matched_product_id TEXT,
  device_id TEXT,
  actor_user_id TEXT,
  success INTEGER NOT NULL CHECK(success IN (0,1)),
  occurred_at TEXT NOT NULL,
  FOREIGN KEY(matched_product_id) REFERENCES product_master_core(id) ON DELETE SET NULL
);

CREATE VIEW IF NOT EXISTS product_profitability_view AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  c.unit_cost_cents,
  pr.retail_price_cents,
  pr.wholesale_price_cents,
  (pr.retail_price_cents - c.unit_cost_cents) AS gross_profit_retail_cents,
  CASE WHEN pr.retail_price_cents > 0
       THEN ROUND((pr.retail_price_cents - c.unit_cost_cents) * 100.0 / pr.retail_price_cents, 2)
       ELSE 0 END AS retail_margin_percent,
  CASE WHEN c.unit_cost_cents > 0
       THEN ROUND((pr.retail_price_cents - c.unit_cost_cents) * 100.0 / c.unit_cost_cents, 2)
       ELSE 0 END AS retail_markup_percent
FROM product_master_core p
JOIN product_cost_state c ON c.product_id = p.id
JOIN product_price_state pr ON pr.product_id = p.id;

CREATE INDEX IF NOT EXISTS idx_product_master_name ON product_master_core(name, active);
CREATE INDEX IF NOT EXISTS idx_product_master_barcode ON product_master_core(barcode);
CREATE INDEX IF NOT EXISTS idx_product_lot_expiry ON product_inventory_lot(product_id, expires_on, status);
CREATE INDEX IF NOT EXISTS idx_product_movement_date ON product_inventory_movement(product_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_supplier ON purchase_receipt_core(supplier_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_barcode_scan_context ON product_barcode_scan_event(context, occurred_at);
