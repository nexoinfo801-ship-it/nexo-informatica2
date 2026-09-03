PRAGMA foreign_keys = ON;

-- Extensão do Delivery Pro: mapa/ETA/rastreamento temporário e indicadores.
-- Nenhuma coleta permanente por padrão; cada sessão é vinculada a uma entrega ativa.

CREATE TABLE IF NOT EXISTS delivery_tracking_session (
  id INTEGER PRIMARY KEY,
  order_ref TEXT NOT NULL,
  driver_ref TEXT NOT NULL,
  consent_policy_ref TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PENDING','ACTIVE','PAUSED','ENDED')),
  started_at TEXT,
  ended_at TEXT,
  retention_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(status!='ENDED' OR ended_at IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_delivery_tracking_active_order
ON delivery_tracking_session(order_ref)
WHERE status IN ('PENDING','ACTIVE','PAUSED');

CREATE TABLE IF NOT EXISTS delivery_location_sample (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES delivery_tracking_session(id) ON DELETE CASCADE,
  captured_at TEXT NOT NULL,
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  accuracy_m REAL CHECK(accuracy_m IS NULL OR accuracy_m>=0),
  source TEXT NOT NULL CHECK(source IN ('DEVICE_GPS','LAST_KNOWN','MANUAL'))
);

CREATE TABLE IF NOT EXISTS delivery_route_snapshot (
  id INTEGER PRIMARY KEY,
  order_ref TEXT NOT NULL,
  route_provider TEXT NOT NULL,
  origin_label TEXT NOT NULL,
  destination_label TEXT NOT NULL,
  distance_m INTEGER CHECK(distance_m IS NULL OR distance_m>=0),
  duration_s INTEGER CHECK(duration_s IS NULL OR duration_s>=0),
  eta_at TEXT,
  status TEXT NOT NULL CHECK(status IN ('ESTIMATED','STALE','UNAVAILABLE')),
  calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_delay_event (
  id INTEGER PRIMARY KEY,
  order_ref TEXT NOT NULL,
  expected_minutes INTEGER NOT NULL CHECK(expected_minutes>=0),
  elapsed_minutes INTEGER NOT NULL CHECK(elapsed_minutes>=0),
  severity TEXT NOT NULL CHECK(severity IN ('WARNING','HIGH','CRITICAL')),
  detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_by TEXT,
  acknowledged_at TEXT
);

CREATE TABLE IF NOT EXISTS delivery_daily_metric (
  id INTEGER PRIMARY KEY,
  metric_date TEXT NOT NULL,
  region_key TEXT NOT NULL DEFAULT 'ALL',
  deliveries_total INTEGER NOT NULL DEFAULT 0 CHECK(deliveries_total>=0),
  delivered_total INTEGER NOT NULL DEFAULT 0 CHECK(delivered_total>=0),
  delayed_total INTEGER NOT NULL DEFAULT 0 CHECK(delayed_total>=0),
  occurrence_total INTEGER NOT NULL DEFAULT 0 CHECK(occurrence_total>=0),
  avg_delivery_minutes REAL CHECK(avg_delivery_minutes IS NULL OR avg_delivery_minutes>=0),
  avg_distance_km REAL CHECK(avg_distance_km IS NULL OR avg_distance_km>=0),
  delivery_revenue_cents INTEGER NOT NULL DEFAULT 0 CHECK(delivery_revenue_cents>=0),
  avg_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK(avg_fee_cents>=0),
  UNIQUE(metric_date,region_key)
);
