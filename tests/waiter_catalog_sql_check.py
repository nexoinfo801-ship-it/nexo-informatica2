import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
restaurant = (root / 'db' / '9_8_restaurant_domain_schema.sql').read_text(encoding='utf-8')
schema = (root / 'db' / '9_8_waiter_mobile_catalog_schema.sql').read_text(encoding='utf-8')
seed = (root / 'db' / '9_8_waiter_mobile_catalog_seed.sql').read_text(encoding='utf-8')

con = sqlite3.connect(':memory:')
con.executescript(restaurant)
con.executescript(schema)
con.executescript(seed)

required = {
    'waiter_profile','waiter_device','waiter_session','waiter_order_submission',
    'waiter_notification','waiter_realtime_event','beverage_company','beverage_brand',
    'executive_dish','executive_dish_component','beverage_catalog_reference'
}
existing = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
missing = required - existing
assert not missing, f'tabelas ausentes: {sorted(missing)}'

companies = con.execute('SELECT COUNT(*) FROM beverage_company').fetchone()[0]
brands = con.execute('SELECT COUNT(*) FROM beverage_brand').fetchone()[0]
dishes = con.execute('SELECT COUNT(*) FROM executive_dish').fetchone()[0]
refs = con.execute('SELECT COUNT(*) FROM beverage_catalog_reference').fetchone()[0]
assert companies == 4, companies
assert brands >= 17, brands
assert dishes == 6, dishes
assert refs >= 6, refs

# Empresa e marca não podem ser confundidas.
ambev = con.execute("SELECT id FROM beverage_company WHERE legal_or_trade_name='Ambev S.A.'").fetchone()
assert ambev
for brand in ('Brahma','Antarctica','Guaraná Antarctica'):
    row = con.execute('SELECT company_id FROM beverage_brand WHERE brand_name=?',(brand,)).fetchone()
    assert row and row[0] == 'BEV_AMBEV', (brand, row)

# Preços de pratos executivos são demonstrativos/configuráveis.
assert con.execute('SELECT COUNT(*) FROM executive_dish WHERE demo_only=1').fetchone()[0] == dishes

# Idempotência obrigatória: mesma chave não pode gerar duas submissões.
con.execute("INSERT INTO waiter_profile VALUES ('W1','U1','João',1,1,1,'2026-09-03','2026-09-03')")
con.execute("INSERT INTO restaurant_table(id,label,seats,status,updated_at) VALUES ('T1','Mesa 01',4,'OCCUPIED','2026-09-03')")
con.execute("INSERT INTO waiter_order_submission(id,waiter_id,table_id,idempotency_key,client_created_at,state,payload_hash) VALUES ('S1','W1','T1','KEY-1','2026-09-03','DRAFT','abc')")
try:
    con.execute("INSERT INTO waiter_order_submission(id,waiter_id,table_id,idempotency_key,client_created_at,state,payload_hash) VALUES ('S2','W1','T1','KEY-1','2026-09-03','DRAFT','def')")
    raise AssertionError('idempotency_key duplicada foi aceita')
except sqlite3.IntegrityError:
    pass

print(f'PASS  Fase 7 SQLite: {len(required)}/{len(required)} tabelas, {companies} empresas, {brands} marcas, {dishes} pratos executivos, {refs} referências de bebida')
print('PASS  Marcas Brahma/Antarctica/Guaraná Antarctica vinculadas à Ambev')
print('PASS  idempotency_key duplicada rejeitada')
