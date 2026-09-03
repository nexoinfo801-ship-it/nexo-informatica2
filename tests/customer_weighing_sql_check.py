from pathlib import Path
import sqlite3
root=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
try:
    for name in ['9_8_customer_crm_schema.sql','9_8_weighing_selfservice_schema.sql']:
        conn.executescript((root/'db'/name).read_text(encoding='utf-8'))
        print('PASS  SQL válido:',name)
    required={
        'crm_customer','crm_customer_address','crm_customer_loyalty','crm_customer_finance','crm_customer_order_link','crm_customer_note','crm_duplicate_review','crm_customer_audit',
        'weighing_device','weighing_product_policy','weighing_barcode_rule','weighing_session','weighing_inventory_balance','weighing_inventory_movement','weighing_production_batch','weighing_inventory_count','weighing_label_job','weighing_audit'
    }
    found={r[0] for r in conn.execute("select name from sqlite_master where type='table'")}
    missing=required-found
    if missing: raise SystemExit(f'FAIL tabelas ausentes: {sorted(missing)}')
    print(f'PASS  {len(required)}/{len(required)} tabelas F14/F15 presentes')
    conn.execute("insert into crm_customer(id,code,name,phone_normalized) values('1','C001','Demo','14999990000')")
    try:
        conn.execute("insert into crm_customer(id,code,name,phone_normalized) values('2','C002','Dup','14999990000')")
        raise SystemExit('FAIL telefone duplicado aceito')
    except sqlite3.IntegrityError: print('PASS  telefone duplicado rejeitado')
    conn.execute("insert into crm_customer_address(id,customer_id,label,is_primary) values('A1','1','Casa',1)")
    try:
        conn.execute("insert into crm_customer_address(id,customer_id,label,is_primary) values('A2','1','Trabalho',1)")
        raise SystemExit('FAIL dois endereços principais aceitos')
    except sqlite3.IntegrityError: print('PASS  segundo endereço principal rejeitado')
    conn.execute("insert into weighing_session(id,product_id,gross_grams,tare_grams,net_grams,price_per_kg_cents,total_cents,idempotency_key) values('W1','P1',650,100,550,5990,3295,'K1')")
    try:
        conn.execute("insert into weighing_session(id,product_id,gross_grams,tare_grams,net_grams,price_per_kg_cents,total_cents,idempotency_key) values('W2','P1',650,100,500,5990,2995,'K2')")
        raise SystemExit('FAIL peso líquido inconsistente aceito')
    except sqlite3.IntegrityError: print('PASS  peso líquido inconsistente rejeitado')
    try:
        conn.execute("insert into weighing_session(id,product_id,gross_grams,tare_grams,net_grams,price_per_kg_cents,total_cents,idempotency_key) values('W3','P1',650,100,550,5990,3295,'K1')")
        raise SystemExit('FAIL idempotência duplicada aceita')
    except sqlite3.IntegrityError: print('PASS  idempotência duplicada rejeitada')
finally:
    conn.close()
