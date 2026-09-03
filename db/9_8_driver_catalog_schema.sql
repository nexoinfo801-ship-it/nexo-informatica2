PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS peripheral_vendor (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  official_support_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS peripheral_model (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES peripheral_vendor(id),
  model_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('THERMAL_RECEIPT','LABEL_PRINTER','BARCODE_SCANNER')),
  connection_modes TEXT NOT NULL DEFAULT 'USB',
  driver_mode TEXT NOT NULL CHECK (driver_mode IN ('REQUIRED','OPTIONAL','HID_NO_DRIVER')),
  printer_languages TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  UNIQUE(vendor_id, model_name)
);

CREATE TABLE IF NOT EXISTS driver_source (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL','RESELLER','REFERENCE')),
  page_url TEXT NOT NULL,
  trust_level INTEGER NOT NULL CHECK (trust_level BETWEEN 1 AND 3),
  last_verified_date TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS driver_package (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES driver_source(id),
  package_name TEXT NOT NULL,
  version TEXT,
  os_family TEXT NOT NULL CHECK (os_family IN ('WINDOWS','LINUX','MACOS','ANDROID','MULTI')),
  architecture TEXT NOT NULL DEFAULT 'ANY',
  package_kind TEXT NOT NULL CHECK (package_kind IN ('PRINTER_DRIVER','SCANNER_DRIVER','VIRTUAL_COM','UTILITY','FIRMWARE','SDK','LABEL_SOFTWARE')),
  signed_status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (signed_status IN ('VERIFIED','CLAIMED','UNKNOWN','NOT_APPLICABLE')),
  sha256 TEXT,
  release_date TEXT,
  catalog_status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK (catalog_status IN ('CANDIDATE','VERIFIED','HOMOLOGATED','BLOCKED')),
  notes TEXT,
  CHECK (sha256 IS NULL OR length(sha256)=64)
);

CREATE TABLE IF NOT EXISTS driver_model_compatibility (
  driver_package_id TEXT NOT NULL REFERENCES driver_package(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL REFERENCES peripheral_model(id) ON DELETE CASCADE,
  support_level TEXT NOT NULL CHECK (support_level IN ('DECLARED','DOCUMENTED','TESTED','HOMOLOGATED')),
  notes TEXT,
  PRIMARY KEY(driver_package_id, model_id)
);

CREATE TABLE IF NOT EXISTS product_label_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  width_mm REAL NOT NULL CHECK (width_mm > 0),
  height_mm REAL NOT NULL CHECK (height_mm > 0),
  symbology TEXT NOT NULL CHECK (symbology IN ('EAN13','CODE128','QR','NONE')),
  printer_language TEXT NOT NULL CHECK (printer_language IN ('WINDOWS_SPOOLER','ZPL','EPL','PPLA','PPLB')),
  data_fields TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE IF NOT EXISTS product_label_job (
  id TEXT PRIMARY KEY,
  product_ref TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES product_label_template(id),
  printer_model_id TEXT REFERENCES peripheral_model(id),
  copies INTEGER NOT NULL DEFAULT 1 CHECK (copies BETWEEN 1 AND 10000),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','QUEUED','PRINTING','PRINTED','FAILED','CANCELLED')),
  last_error TEXT,
  requested_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  printed_at TEXT
);

CREATE TABLE IF NOT EXISTS driver_ai_recommendation (
  id TEXT PRIMARY KEY,
  detected_model_id TEXT REFERENCES peripheral_model(id),
  detected_os TEXT NOT NULL,
  detected_arch TEXT,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('NO_DRIVER_REQUIRED','RECOMMEND_PACKAGE','UPDATE_PACKAGE','PRINT_TEST','LABEL_CALIBRATION','NEEDS_MANUAL_REVIEW')),
  driver_package_id TEXT REFERENCES driver_package(id),
  confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  rationale TEXT NOT NULL,
  requires_human_approval INTEGER NOT NULL DEFAULT 1 CHECK (requires_human_approval IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS driver_catalog_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('SOURCE','MODEL','PACKAGE','LABEL_TEMPLATE','LABEL_JOB','AI_RECOMMENDATION')),
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_peripheral_model_category ON peripheral_model(category);
CREATE INDEX IF NOT EXISTS idx_driver_package_os ON driver_package(os_family, architecture, catalog_status);
CREATE INDEX IF NOT EXISTS idx_label_job_status ON product_label_job(status, created_at);
CREATE INDEX IF NOT EXISTS idx_driver_ai_model ON driver_ai_recommendation(detected_model_id, created_at);
