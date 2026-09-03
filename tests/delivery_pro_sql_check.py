from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
restaurant=(root/'db/9_8_restaurant_domain_schema.sql').read_text(encoding='utf-8')
delivery=(root/'db/9_8_delivery_pro_schema.sql').read_text(encoding='utf-8')
seed=(root/'db/9_8_delivery_pro_seed.sql').read_text(encoding='utf-8')

con=sqlite3.connect(':memory:')
con.executescript(restaurant)
con.executescript(delivery)
con.executescript(seed)

required={
 'order_lifecycle','order_state_transition_allowed','order_status_history','mobile_operation_guard',
 'delivery_customer_profile','delivery_customer_address','delivery_fee_rule','delivery_driver',
 'delivery_driver_compensation_rule','delivery_assignment','delivery_occurrence',
 'delivery_payment_collection','delivery_driver_settlement','delivery_proof'
}
tables={r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
missing=required-tables
assert not missing, f'tabelas ausentes: {sorted(missing)}'

# Pedido canônico de teste.
con.execute("INSERT INTO restaurant_order(id,table_id,channel,status,waiter_user_id,guest_label,subtotal_cents,discount_cents,total_cents,created_at,version) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            ('ORD-DEL-001',None,'DELIVERY','READY','USR-ATT','Cliente Demo',5000,0,5000,'2026-09-03T12:00:00Z',1))
con.execute("INSERT INTO order_lifecycle(order_id,origin,current_state,payment_state,version,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
            ('ORD-DEL-001','WHATSAPP','NEW','PENDING',1,'2026-09-03T12:00:00Z','2026-09-03T12:00:00Z'))

# Transição válida exige incremento de versão.
con.execute("UPDATE order_lifecycle SET current_state='CONFIRMED',version=2,updated_at=? WHERE order_id=?",('2026-09-03T12:01:00Z','ORD-DEL-001'))
assert con.execute("SELECT current_state,version FROM order_lifecycle WHERE order_id='ORD-DEL-001'").fetchone()==('CONFIRMED',2)

# Transição inválida deve ser bloqueada.
try:
    con.execute("UPDATE order_lifecycle SET current_state='DELIVERED',version=3 WHERE order_id='ORD-DEL-001'")
    raise AssertionError('transição inválida não foi bloqueada')
except sqlite3.IntegrityError as exc:
    assert 'INVALID_ORDER_STATE_TRANSITION' in str(exc)

# Versão sem incremento correto deve ser bloqueada.
try:
    con.execute("UPDATE order_lifecycle SET current_state='PREPARING',version=4 WHERE order_id='ORD-DEL-001'")
    raise AssertionError('versionamento inválido não foi bloqueado')
except sqlite3.IntegrityError as exc:
    assert 'ORDER_VERSION_MUST_INCREMENT' in str(exc)

# Idempotência: mesma chave não pode existir duas vezes.
row=('IDEMP-DEMO-001','USR-ATT','DEV-01','DELIVERY_START','ORDER','ORD-DEL-001','a'*64,'PROCESSED','b'*64,'2026-09-03T12:02:00Z','2026-09-03T12:02:01Z')
con.execute("INSERT INTO mobile_operation_guard VALUES(?,?,?,?,?,?,?,?,?,?,?)",row)
try:
    con.execute("INSERT INTO mobile_operation_guard VALUES(?,?,?,?,?,?,?,?,?,?,?)",row)
    raise AssertionError('idempotency_key duplicada não foi bloqueada')
except sqlite3.IntegrityError:
    pass

# Cliente DEMO possui mais de um endereço.
count=con.execute("SELECT COUNT(*) FROM delivery_customer_address WHERE customer_id='CUST-DEMO-001'").fetchone()[0]
assert count==2, count

# Dois assignments ativos do mesmo pedido devem ser bloqueados.
con.execute("INSERT INTO delivery_assignment(id,order_id,address_id,driver_id,status,delivery_fee_cents,driver_compensation_cents,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
            ('ASN-001','ORD-DEL-001','ADDR-DEMO-001-HOME','DRV-DEMO-CARLOS','ASSIGNED',400,500,'2026-09-03T12:03:00Z','2026-09-03T12:03:00Z'))
try:
    con.execute("INSERT INTO delivery_assignment(id,order_id,address_id,driver_id,status,delivery_fee_cents,driver_compensation_cents,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
                ('ASN-002','ORD-DEL-001','ADDR-DEMO-001-HOME','DRV-DEMO-JOAO','STARTED',400,500,'2026-09-03T12:04:00Z','2026-09-03T12:04:00Z'))
    raise AssertionError('dois assignments ativos não foram bloqueados')
except sqlite3.IntegrityError:
    pass

# Troco deve fechar matematicamente.
con.execute("INSERT INTO delivery_payment_collection(id,order_id,assignment_id,payment_method,order_amount_cents,amount_received_cents,change_due_cents,collected_by_driver,status,collected_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
            ('PAY-001','ORD-DEL-001','ASN-001','CASH',4800,5000,200,1,'COLLECTED','2026-09-03T12:40:00Z'))
try:
    con.execute("INSERT INTO delivery_payment_collection(id,order_id,assignment_id,payment_method,order_amount_cents,amount_received_cents,change_due_cents,collected_by_driver,status,collected_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
                ('PAY-002','ORD-DEL-001','ASN-001','CASH',4800,5000,100,1,'COLLECTED','2026-09-03T12:41:00Z'))
    raise AssertionError('troco inconsistente não foi bloqueado')
except sqlite3.IntegrityError:
    pass

# Enum de ocorrência também é protegido.
try:
    con.execute("INSERT INTO delivery_occurrence(id,order_id,assignment_id,occurrence_type,severity,description,actor_user_id,created_at) VALUES(?,?,?,?,?,?,?,?)",
                ('OCC-BAD','ORD-DEL-001','ASN-001','UNKNOWN','WARN','Teste','USR-ATT','2026-09-03T12:42:00Z'))
    raise AssertionError('ocorrência inválida não foi bloqueada')
except sqlite3.IntegrityError:
    pass

rules=con.execute("SELECT COUNT(*) FROM delivery_fee_rule WHERE active=1").fetchone()[0]
drivers=con.execute("SELECT COUNT(*) FROM delivery_driver WHERE active=1").fetchone()[0]
transitions=con.execute("SELECT COUNT(*) FROM order_state_transition_allowed").fetchone()[0]
print(f'PASS  Delivery Pro SQLite: {len(required)}/{len(required)} tabelas, {transitions} transições, {rules} taxas DEMO, {drivers} entregadores DEMO')
print('PASS  transição inválida e versionamento incorreto rejeitados')
print('PASS  idempotência duplicada e dois assignments ativos rejeitados')
print('PASS  múltiplos endereços, troco e enum de ocorrências validados')
