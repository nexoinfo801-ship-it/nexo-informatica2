from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
con=sqlite3.connect(':memory:')
con.executescript((root/'db/9_8_driver_catalog_schema.sql').read_text(encoding='utf-8'))
con.executescript((root/'db/9_8_driver_catalog_seed.sql').read_text(encoding='utf-8'))

expected={'peripheral_vendor','peripheral_model','driver_source','driver_package','driver_model_compatibility','product_label_template','product_label_job','driver_ai_recommendation','driver_catalog_audit'}
actual={r[0] for r in con.execute("select name from sqlite_master where type='table'")}
assert expected <= actual, f'missing tables: {expected-actual}'
models=con.execute('select count(*) from peripheral_model').fetchone()[0]
sources=con.execute('select count(*) from driver_source').fetchone()[0]
packages=con.execute('select count(*) from driver_package').fetchone()[0]
labels=con.execute('select count(*) from product_label_template').fetchone()[0]
assert models >= 18
assert sources >= 12
assert packages >= 10
assert labels >= 4
assert con.execute("select count(*) from driver_source where source_type='RESELLER' and trust_level<3").fetchone()[0] >= 2
assert con.execute("select count(*) from driver_package where catalog_status='HOMOLOGATED'").fetchone()[0] == 0
assert con.execute("select count(*) from peripheral_model where driver_mode='HID_NO_DRIVER'").fetchone()[0] >= 1

try:
    con.execute("insert into driver_package(id,source_id,package_name,os_family,package_kind,sha256) values('BAD','SRC_BZ_ELGIN','bad','WINDOWS','PRINTER_DRIVER','123')")
    raise AssertionError('invalid SHA-256 accepted')
except sqlite3.IntegrityError:
    pass

print(f'PASS  driver catalog SQLite: {models} modelos, {sources} fontes, {packages} pacotes, {labels} templates')
print('PASS  reseller não homologado automaticamente')
print('PASS  SHA-256 inválido rejeitado')
