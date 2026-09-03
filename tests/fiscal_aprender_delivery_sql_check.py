from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
conn.execute('PRAGMA foreign_keys=ON')
try:
    for name in ['9_8_fiscal_lab_schema.sql','9_8_aprender_schema.sql','9_8_delivery_enterprise_extension.sql']:
        conn.executescript((root/'db'/name).read_text(encoding='utf-8'))
        print(f'PASS  SQL válido: {name}')

    tables={r[0] for r in conn.execute("select name from sqlite_master where type='table'")}
    fiscal={'fiscal_company_profile','fiscal_rule_version','fiscal_product_profile','fiscal_certificate_ref','fiscal_document','fiscal_document_item','fiscal_event','fiscal_transmission_attempt','fiscal_rejection_catalog','fiscal_audit'}
    aprender={'learning_path','learning_module','learning_lesson','learning_step','learning_progress','learning_event','knowledge_article','knowledge_version','contextual_help','guided_task','learning_support_handoff','learning_ai_interaction'}
    delivery={'delivery_tracking_session','delivery_location_sample','delivery_route_snapshot','delivery_delay_event','delivery_daily_metric'}
    assert fiscal <= tables, sorted(fiscal-tables)
    assert aprender <= tables, sorted(aprender-tables)
    assert delivery <= tables, sorted(delivery-tables)
    print(f'PASS  Fiscal SQLite: {len(fiscal)}/{len(fiscal)} tabelas')
    print(f'PASS  Aprender SQLite: {len(aprender)}/{len(aprender)} tabelas')
    print(f'PASS  Delivery Enterprise SQLite: {len(delivery)}/{len(delivery)} tabelas')

    historical=conn.execute("select status,rule_payload_json from fiscal_rule_version where rule_key='NFCE_RECIPIENT_CNPJ_POLICY'").fetchone()
    assert historical and historical[0]=='REVOKED' and '"enforce":false' in historical[1]
    print('PASS  regra fiscal histórica/revogada não é aplicada como vigente')

    conn.execute("insert into fiscal_company_profile(id,tenant_ref,cnpj,legal_name,tax_regime,ibge_city_code,state_code) values(1,'TENANT-X','12345678000190','Empresa LAB','SIMPLES','3504503','SP')")
    try:
        conn.execute("insert into fiscal_certificate_ref(company_id,certificate_type,storage_kind,status,secret_material_present) values(1,'A1','PKCS12_LOCAL_REF','UNKNOWN',1)")
        raise AssertionError('segredo fiscal aceito')
    except sqlite3.IntegrityError:
        pass
    print('PASS  schema fiscal rejeita material secreto do certificado')

    article=conn.execute("select id from knowledge_article limit 1").fetchone()[0]
    try:
        conn.execute("insert into learning_progress(tenant_ref,user_ref,lesson_id,state,progress_percent) values('T','U',999,'IN_PROGRESS',101)")
        raise AssertionError('progresso >100 aceito')
    except sqlite3.IntegrityError:
        pass
    assert article
    print('PASS  Aprender valida progresso e conteúdo base')

    conn.execute("insert into delivery_tracking_session(id,order_ref,driver_ref,consent_policy_ref,status,started_at) values(1,'ORDER-1','DRV-1','POLICY-1','ACTIVE',CURRENT_TIMESTAMP)")
    try:
        conn.execute("insert into delivery_tracking_session(order_ref,driver_ref,consent_policy_ref,status,started_at) values('ORDER-1','DRV-2','POLICY-1','ACTIVE',CURRENT_TIMESTAMP)")
        raise AssertionError('duas sessões ativas aceitas')
    except sqlite3.IntegrityError:
        pass
    try:
        conn.execute("insert into delivery_location_sample(session_id,captured_at,latitude,longitude,source) values(1,CURRENT_TIMESTAMP,100,0,'DEVICE_GPS')")
        raise AssertionError('latitude inválida aceita')
    except sqlite3.IntegrityError:
        pass
    print('PASS  rastreamento bloqueia sessão ativa duplicada e coordenada inválida')
finally:
    conn.close()
