PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS crm_customer(
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_normalized TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN('ACTIVE','INACTIVE','BLOCKED')),
  preferred_channel TEXT CHECK(preferred_channel IN('COUNTER','TABLE','DELIVERY','PHONE','WHATSAPP','SITE','APP') OR preferred_channel IS NULL),
  cpf_cnpj TEXT,
  birth_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_crm_customer_phone ON crm_customer(phone_normalized) WHERE phone_normalized IS NOT NULL AND phone_normalized<>'';

CREATE TABLE IF NOT EXISTS crm_customer_address(
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES crm_customer(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Casa',
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  district TEXT,
  city TEXT,
  state TEXT,
  reference TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN(0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_crm_primary_address ON crm_customer_address(customer_id) WHERE is_primary=1 AND active=1;

CREATE TABLE IF NOT EXISTS crm_customer_loyalty(
  customer_id TEXT PRIMARY KEY REFERENCES crm_customer(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0 CHECK(points>=0),
  tier TEXT NOT NULL DEFAULT 'STANDARD',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_customer_finance(
  customer_id TEXT PRIMARY KEY REFERENCES crm_customer(id) ON DELETE CASCADE,
  credit_limit_cents INTEGER NOT NULL DEFAULT 0 CHECK(credit_limit_cents>=0),
  open_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK(open_balance_cents>=0),
  overdue_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK(overdue_balance_cents>=0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_customer_order_link(
  customer_id TEXT NOT NULL REFERENCES crm_customer(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  order_total_cents INTEGER NOT NULL DEFAULT 0 CHECK(order_total_cents>=0),
  origin TEXT NOT NULL,
  ordered_at TEXT NOT NULL,
  PRIMARY KEY(customer_id,order_id)
);

CREATE TABLE IF NOT EXISTS crm_customer_note(
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES crm_customer(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'OPERATIONAL' CHECK(visibility IN('OPERATIONAL','ADMIN','FINANCE')),
  note TEXT NOT NULL,
  author_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_duplicate_review(
  id TEXT PRIMARY KEY,
  candidate_customer_id TEXT REFERENCES crm_customer(id),
  matched_customer_id TEXT REFERENCES crm_customer(id),
  match_type TEXT NOT NULL CHECK(match_type IN('PHONE','CPF_CNPJ','MANUAL')),
  decision TEXT NOT NULL DEFAULT 'PENDING' CHECK(decision IN('PENDING','USE_EXISTING','ALLOW_DUPLICATE','MERGED')),
  reason TEXT,
  decided_by TEXT,
  decided_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_customer_audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL,
  field_name TEXT,
  before_value TEXT,
  after_value TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW IF NOT EXISTS crm_customer_summary AS
SELECT c.id,c.code,c.name,c.phone_normalized,c.status,c.preferred_channel,
       COUNT(DISTINCT o.order_id) AS orders_count,
       COALESCE(SUM(o.order_total_cents),0) AS lifetime_value_cents,
       CASE WHEN COUNT(DISTINCT o.order_id)=0 THEN 0 ELSE CAST(COALESCE(SUM(o.order_total_cents),0) AS REAL)/COUNT(DISTINCT o.order_id) END AS avg_ticket_cents,
       MAX(o.ordered_at) AS last_order_at,
       COALESCE(l.points,0) AS loyalty_points,COALESCE(l.tier,'STANDARD') AS loyalty_tier,
       COALESCE(f.credit_limit_cents,0) AS credit_limit_cents,COALESCE(f.open_balance_cents,0) AS open_balance_cents,COALESCE(f.overdue_balance_cents,0) AS overdue_balance_cents
FROM crm_customer c
LEFT JOIN crm_customer_order_link o ON o.customer_id=c.id
LEFT JOIN crm_customer_loyalty l ON l.customer_id=c.id
LEFT JOIN crm_customer_finance f ON f.customer_id=c.id
GROUP BY c.id;
