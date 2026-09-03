-- NEXO ERP PRO 9.8 LAB — Fase 9 Delivery Pro + Entregador Mobile
-- PROPOSTA DE CONTRATO. Migrar/mapear para o banco privado antes de uso comercial.
PRAGMA foreign_keys = ON;

-- Fonte canônica do ciclo operacional do pedido. O mesmo order_id atravessa todos os setores.
CREATE TABLE IF NOT EXISTS order_lifecycle (
  order_id TEXT PRIMARY KEY,
  origin TEXT NOT NULL CHECK(origin IN ('COUNTER','WAITER','PHONE','WHATSAPP','SITE','APP','DELIVERY','MARKETPLACE','OTHER')),
  current_state TEXT NOT NULL DEFAULT 'NEW' CHECK(current_state IN (
    'NEW','CONFIRMED','PREPARING','READY','WAITING_DRIVER','OUT_FOR_DELIVERY','DELIVERED','SERVING','PAID','FINALIZED','CANCELLED'
  )),
  payment_state TEXT NOT NULL DEFAULT 'PENDING' CHECK(payment_state IN ('PENDING','PARTIAL','PAID','REFUNDED','FAILED')),
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES restaurant_order(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_state_transition_allowed (
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  permission_code TEXT NOT NULL,
  PRIMARY KEY(from_state,to_state)
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_profile TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES order_lifecycle(order_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS mobile_operation_guard (
  idempotency_key TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  device_id TEXT,
  operation_kind TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'RECEIVED' CHECK(state IN ('RECEIVED','PROCESSED','REJECTED')),
  response_hash TEXT,
  created_at TEXT NOT NULL,
  processed_at TEXT
);

-- Cadastro de endereço de delivery desacoplado do schema privado de Clientes.
CREATE TABLE IF NOT EXISTS delivery_customer_profile (
  customer_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_customer_address (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  label TEXT NOT NULL,
  cep TEXT,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state_code TEXT NOT NULL CHECK(length(state_code)=2),
  reference_text TEXT,
  notes TEXT,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES delivery_customer_profile(customer_id) ON DELETE RESTRICT,
  UNIQUE(customer_id,label)
);

CREATE TABLE IF NOT EXISTS delivery_fee_rule (
  id TEXT PRIMARY KEY,
  neighborhood TEXT NOT NULL,
  base_fee_cents INTEGER NOT NULL CHECK(base_fee_cents >= 0),
  free_above_cents INTEGER CHECK(free_above_cents IS NULL OR free_above_cents >= 0),
  free_delivery INTEGER NOT NULL DEFAULT 0 CHECK(free_delivery IN (0,1)),
  priority INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_driver (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK(status IN ('AVAILABLE','DELIVERING','OFFLINE')),
  vehicle TEXT,
  plate TEXT,
  service_region TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  last_seen_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_driver_compensation_rule (
  id TEXT PRIMARY KEY,
  driver_id TEXT,
  mode TEXT NOT NULL CHECK(mode IN ('FIXED','PER_KM','REGION')),
  fixed_cents INTEGER CHECK(fixed_cents IS NULL OR fixed_cents >= 0),
  per_km_cents INTEGER CHECK(per_km_cents IS NULL OR per_km_cents >= 0),
  region_name TEXT,
  region_cents INTEGER CHECK(region_cents IS NULL OR region_cents >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL,
  FOREIGN KEY(driver_id) REFERENCES delivery_driver(id) ON DELETE RESTRICT,
  CHECK(
    (mode='FIXED' AND fixed_cents IS NOT NULL) OR
    (mode='PER_KM' AND per_km_cents IS NOT NULL) OR
    (mode='REGION' AND region_name IS NOT NULL AND region_cents IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS delivery_assignment (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  address_id TEXT NOT NULL,
  driver_id TEXT,
  status TEXT NOT NULL DEFAULT 'WAITING_DRIVER' CHECK(status IN ('WAITING_DRIVER','ASSIGNED','STARTED','ARRIVED','COMPLETED','CANCELLED')),
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK(delivery_fee_cents >= 0),
  driver_compensation_cents INTEGER NOT NULL DEFAULT 0 CHECK(driver_compensation_cents >= 0),
  assigned_at TEXT,
  started_at TEXT,
  arrived_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES order_lifecycle(order_id) ON DELETE RESTRICT,
  FOREIGN KEY(address_id) REFERENCES delivery_customer_address(id) ON DELETE RESTRICT,
  FOREIGN KEY(driver_id) REFERENCES delivery_driver(id) ON DELETE RESTRICT
);

-- Impede dois entregadores ativos simultaneamente no mesmo pedido.
CREATE UNIQUE INDEX IF NOT EXISTS uq_delivery_active_assignment
ON delivery_assignment(order_id)
WHERE status IN ('WAITING_DRIVER','ASSIGNED','STARTED','ARRIVED');

CREATE TABLE IF NOT EXISTS delivery_occurrence (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  assignment_id TEXT,
  occurrence_type TEXT NOT NULL CHECK(occurrence_type IN (
    'NO_ANSWER','WRONG_ADDRESS','CUSTOMER_ABSENT','CUSTOMER_REFUSED','MISSING_ITEM','DELAY','DRIVER_ISSUE','ORDER_CANCELLED','PAYMENT_FAILED','OTHER'
  )),
  severity TEXT NOT NULL DEFAULT 'WARN' CHECK(severity IN ('INFO','WARN','CRITICAL')),
  description TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by_user_id TEXT,
  FOREIGN KEY(order_id) REFERENCES order_lifecycle(order_id) ON DELETE RESTRICT,
  FOREIGN KEY(assignment_id) REFERENCES delivery_assignment(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS delivery_payment_collection (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  assignment_id TEXT,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH','PIX','DEBIT','CREDIT','TRANSFER','OTHER')),
  order_amount_cents INTEGER NOT NULL CHECK(order_amount_cents >= 0),
  amount_received_cents INTEGER NOT NULL DEFAULT 0 CHECK(amount_received_cents >= 0),
  change_due_cents INTEGER NOT NULL DEFAULT 0 CHECK(change_due_cents >= 0),
  collected_by_driver INTEGER NOT NULL DEFAULT 0 CHECK(collected_by_driver IN (0,1)),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','COLLECTED','TRANSFERRED_TO_CASHIER','RECONCILED','VOID')),
  collected_at TEXT,
  reconciled_at TEXT,
  FOREIGN KEY(order_id) REFERENCES order_lifecycle(order_id) ON DELETE RESTRICT,
  FOREIGN KEY(assignment_id) REFERENCES delivery_assignment(id) ON DELETE SET NULL,
  CHECK(change_due_cents = CASE WHEN amount_received_cents > order_amount_cents THEN amount_received_cents - order_amount_cents ELSE 0 END)
);

CREATE TABLE IF NOT EXISTS delivery_driver_settlement (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  cash_expected_cents INTEGER NOT NULL DEFAULT 0 CHECK(cash_expected_cents >= 0),
  cash_delivered_cents INTEGER NOT NULL DEFAULT 0 CHECK(cash_delivered_cents >= 0),
  difference_cents INTEGER NOT NULL DEFAULT 0,
  compensation_due_cents INTEGER NOT NULL DEFAULT 0 CHECK(compensation_due_cents >= 0),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','CLOSED','REVIEW')),
  closed_by_user_id TEXT,
  closed_at TEXT,
  notes TEXT,
  FOREIGN KEY(driver_id) REFERENCES delivery_driver(id) ON DELETE RESTRICT,
  CHECK(period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS delivery_proof (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  assignment_id TEXT,
  proof_kind TEXT NOT NULL CHECK(proof_kind IN ('STATUS','SIGNATURE_REFERENCE','PHOTO_REFERENCE')),
  reference_uri TEXT,
  sha256 TEXT CHECK(sha256 IS NULL OR (length(sha256)=64 AND sha256 NOT GLOB '*[^0-9A-Fa-f]*')),
  captured_by_user_id TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES order_lifecycle(order_id) ON DELETE RESTRICT,
  FOREIGN KEY(assignment_id) REFERENCES delivery_assignment(id) ON DELETE SET NULL
);

-- Guard de transição. A aplicação ainda deve validar perfil/permissão e expected version.
CREATE TRIGGER IF NOT EXISTS trg_order_lifecycle_transition_guard
BEFORE UPDATE OF current_state ON order_lifecycle
WHEN NEW.current_state <> OLD.current_state
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM order_state_transition_allowed t
      WHERE t.from_state = OLD.current_state AND t.to_state = NEW.current_state
    ) THEN RAISE(ABORT,'INVALID_ORDER_STATE_TRANSITION')
  END;
  SELECT CASE
    WHEN NEW.version <> OLD.version + 1 THEN RAISE(ABORT,'ORDER_VERSION_MUST_INCREMENT')
  END;
END;

CREATE INDEX IF NOT EXISTS idx_order_lifecycle_state ON order_lifecycle(current_state,updated_at);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id,occurred_at);
CREATE INDEX IF NOT EXISTS idx_mobile_guard_actor ON mobile_operation_guard(actor_user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_address_customer ON delivery_customer_address(customer_id,active);
CREATE INDEX IF NOT EXISTS idx_delivery_fee_neighborhood ON delivery_fee_rule(neighborhood,active,priority);
CREATE INDEX IF NOT EXISTS idx_delivery_driver_status ON delivery_driver(status,active,last_seen_at);
CREATE INDEX IF NOT EXISTS idx_delivery_assignment_driver ON delivery_assignment(driver_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_occurrence_order ON delivery_occurrence(order_id,created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_collection_driver ON delivery_payment_collection(assignment_id,status,collected_at);
CREATE INDEX IF NOT EXISTS idx_delivery_settlement_driver ON delivery_driver_settlement(driver_id,status,period_end);
