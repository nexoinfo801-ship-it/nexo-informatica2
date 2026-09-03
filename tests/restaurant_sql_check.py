from pathlib import Path
import sqlite3

root = Path(__file__).resolve().parents[1]
schema = (root / 'db' / '9_8_restaurant_domain_schema.sql').read_text(encoding='utf-8')

conn = sqlite3.connect(':memory:')
conn.executescript(schema)
rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
tables = {r[0] for r in rows}
required = {
    'restaurant_table','restaurant_order','restaurant_order_item',
    'product_modifier_group','product_modifier_option','restaurant_order_item_modifier',
    'production_ticket','printer_route','print_job',
    'product_recipe','product_recipe_item','loss_event',
    'thematic_menu_event','thematic_menu_product','restaurant_operation_audit'
}
missing = sorted(required - tables)
if missing:
    raise SystemExit(f'FAIL tabelas ausentes: {missing}')

# Smoke constraints: valid row, then invalid sector must fail.
conn.execute("INSERT INTO restaurant_table(id,label,status,updated_at) VALUES('T1','Mesa 01','FREE','2026-09-03T00:00:00')")
conn.execute("INSERT INTO restaurant_order(id,table_id,channel,status,created_at) VALUES('O1','T1','TABLE','DRAFT','2026-09-03T00:00:00')")
conn.execute("INSERT INTO restaurant_order_item(id,order_id,product_id,product_name_snapshot,quantity,unit_price_cents,production_sector,status,created_at) VALUES('I1','O1','P1','Marmita',1,2500,'KITCHEN','NEW','2026-09-03T00:00:00')")

try:
    conn.execute("INSERT INTO restaurant_order_item(id,order_id,product_id,product_name_snapshot,quantity,unit_price_cents,production_sector,status,created_at) VALUES('I2','O1','P2','Inválido',1,1000,'UNKNOWN','NEW','2026-09-03T00:00:00')")
except sqlite3.IntegrityError:
    print('PASS  CHECK de setor rejeita valor inválido')
else:
    raise SystemExit('FAIL CHECK de setor aceitou UNKNOWN')

print(f'PASS  schema restaurante SQLite válido: {len(required)}/{len(required)} tabelas')
print('PASS  relacionamento mesa -> pedido -> item inserido')
