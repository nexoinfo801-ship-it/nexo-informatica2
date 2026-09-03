from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
schema=(root/'db'/'9_8_intelligence_central_schema.sql').read_text(encoding='utf-8')
seed=(root/'db'/'9_8_intelligence_central_seed.sql').read_text(encoding='utf-8')
conn=sqlite3.connect(':memory:')
try:
    conn.executescript(schema)
    conn.executescript(seed)
    required={
        'nexo_tenant','nexo_plan','nexo_license','nexo_license_device','nexo_agent_heartbeat',
        'nexo_usage_daily','nexo_usage_score_snapshot','nexo_backup_remote_record','nexo_backup_restore_test',
        'nexo_support_ticket_central','nexo_software_version','nexo_update_deployment','nexo_notification_central',
        'nexo_ai_recommendation','nexo_ai_usage','nexo_central_audit'
    }
    found={r[0] for r in conn.execute("select name from sqlite_master where type='table'")}
    missing=required-found
    if missing: raise SystemExit(f'FAIL  tabelas ausentes: {sorted(missing)}')
    assert conn.execute('select count(*) from nexo_tenant').fetchone()[0]==3
    assert conn.execute('select count(*) from nexo_license').fetchone()[0]==3
    assert conn.execute('select count(*) from nexo_ai_recommendation').fetchone()[0]==2
    cols={r[1] for r in conn.execute('pragma table_info(nexo_usage_daily)')}
    forbidden={'customer_name','customer_phone','customer_address','order_payload','sale_detail'}
    assert not (cols & forbidden)
    # SHA-256 inválido deve ser rejeitado.
    try:
        conn.execute("insert into nexo_backup_remote_record(id,tenant_id,device_id,backup_kind,created_at,size_bytes,sha256,encrypted,upload_status,integrity_status,restore_test_status) values('BAD','TENANT-DEMO-001','DEV-DEMO-001','DAILY','2026-09-03',1,'abc',1,'UPLOADED','SUCCESS','SUCCESS')")
        raise AssertionError('hash inválido aceito')
    except sqlite3.IntegrityError:
        pass
    # Score fora de 0..100 deve ser rejeitado.
    try:
        conn.execute("insert into nexo_usage_score_snapshot(id,tenant_id,period_start,period_end,score,classification,rule_version,calculated_at) values('BAD-S','TENANT-DEMO-001','2026-09-01','2026-09-02',101,'HIGH','x','2026-09-03')")
        raise AssertionError('score inválido aceito')
    except sqlite3.IntegrityError:
        pass
    # Estado de IA exige valores controlados.
    try:
        conn.execute("insert into nexo_ai_recommendation(id,recommendation_type,severity,summary,requires_human_approval,action_state,created_at) values('BAD-AI','HEALTH','HIGH','x',1,'AUTO_BLOCKED','2026-09-03')")
        raise AssertionError('estado IA crítico inválido aceito')
    except sqlite3.IntegrityError:
        pass
    print(f'PASS  NEXO Intelligence SQLite: {len(required)}/{len(required)} tabelas')
    print('PASS  3 tenants DEMO, 3 licenças e 2 recomendações IA carregadas')
    print('PASS  telemetria minimizada e restrições de hash/score/IA validadas')
finally:
    conn.close()
