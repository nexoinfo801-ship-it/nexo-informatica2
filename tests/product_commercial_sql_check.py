import sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
schema=(root/'db/9_8_product_commercial_schema.sql').read_text(encoding='utf-8')
seed=(root/'db/9_8_product_commercial_seed.sql').read_text(encoding='utf-8')
con=sqlite3.connect(':memory:')
con.executescript(schema)
con.executescript(seed)
cur=con.cursor()
assert cur.execute('select count(*) from product_category_core').fetchone()[0] >= 11
assert cur.execute('select count(*) from product_master_core').fetchone()[0] == 12
assert cur.execute('select count(*) from product_profitability_view').fetchone()[0] == 12
profit=cur.execute("select gross_profit_retail_cents, retail_margin_percent, retail_markup_percent from product_profitability_view where product_id='P_EMB_MARMITA_750'").fetchone()
assert profit[0] == 65
assert abs(profit[1]-43.33) < 0.01
assert abs(profit[2]-76.47) < 0.01
low=cur.execute('''select count(*) from product_stock_balance b join product_stock_policy p on p.product_id=b.product_id where (b.physical_qty-b.reserved_qty)<=p.minimum_qty''').fetchone()[0]
assert low >= 1
try:
    cur.execute("insert into product_master_core(id,sku,name,category_id,unit,barcode,controls_expiry,active,created_at,updated_at) values('DUP','DUP','Duplicado','CAT_OUTROS','UN','7890000000011',0,1,'x','x')")
    raise AssertionError('barcode duplicado deveria falhar')
except sqlite3.IntegrityError:
    pass
try:
    cur.execute("insert into product_inventory_lot(id,product_id,warehouse_id,lot_code,manufactured_on,expires_on,qty_available,unit_cost_cents,received_at,status) values('BADLOT','P_BEB_COCA350','MAIN','BAD','2026-09-10','2026-09-01',1,100,'2026-09-01','AVAILABLE')")
    raise AssertionError('validade anterior à fabricação deveria falhar')
except sqlite3.IntegrityError:
    pass
try:
    cur.execute("insert into product_inventory_movement(id,product_id,warehouse_id,movement_type,quantity,source_type,actor_user_id,occurred_at) values('BADMOV','P_BEB_COCA350','MAIN','SALE_OUT',-1,'SALE','U1','2026-09-03')")
    raise AssertionError('movimento negativo deveria falhar')
except sqlite3.IntegrityError:
    pass
try:
    cur.execute("insert into product_stock_balance(product_id,warehouse_id,physical_qty,reserved_qty,in_transit_qty,updated_at) values('P_EMB_MARMITA_750','BAD',2,3,0,'x')")
    raise AssertionError('reservado maior que físico deveria falhar')
except sqlite3.IntegrityError:
    pass
print('PASS  Fase 8 SQLite: 12 produtos, rentabilidade, estoque, lotes, compras e barcode')
print('PASS  Margem 43,33% e markup 76,47% validados para EMB-001')
print('PASS  Barcode duplicado, validade inválida, movimento negativo e reserva impossível rejeitados')
