from pathlib import Path
import sqlite3
import runpy

root=Path(__file__).resolve().parents[1]
files=[root/'db'/'avare_public_seed.sql',root/'db'/'9_8_lab_domain_schema.sql']
conn=sqlite3.connect(':memory:')
try:
    for path in files:
        sql=path.read_text(encoding='utf-8')
        conn.executescript(sql)
        print(f'PASS  SQL válido: {path.name}')
    required={
        'public_postal_cache','public_supplier_candidate','public_locality_meta',
        'stock_replenishment_policy','stock_alert_event','backup_history','daily_report_snapshot'
    }
    found={row[0] for row in conn.execute("select name from sqlite_master where type='table'")}
    missing=required-found
    if missing:
        raise SystemExit(f'FAIL  tabelas ausentes: {sorted(missing)}')
    print(f'PASS  {len(required)}/{len(required)} tabelas contratuais presentes')
    print('PASS  schemas SQLite carregados em banco temporário')
finally:
    conn.close()

# O workflow já executa este gate; encadeamos o contrato Delivery Pro sem alterar o pipeline Actions.
runpy.run_path(str(root/'tests'/'delivery_pro_sql_check.py'),run_name='__main__')
