-- NEXO ERP PRO 9.8 LAB — dados DEMO sem PII real
INSERT OR IGNORE INTO nexo_plan(id,name,billing_cycle,device_limit,backup_daily_retention,backup_weekly_retention,backup_monthly_retention,active) VALUES
('PLAN-PRO-M','Profissional Mensal','MONTHLY',3,30,12,12,1),
('PLAN-TRIAL','Teste 14 dias','TRIAL',1,7,0,0,1);

INSERT OR IGNORE INTO nexo_tenant(id,legal_name,status,created_at) VALUES
('TENANT-DEMO-001','Restaurante Exemplo LAB','ACTIVE','2026-09-03T00:00:00'),
('TENANT-DEMO-002','Marmitaria Demonstração LAB','ACTIVE','2026-09-03T00:00:00'),
('TENANT-DEMO-003','Restaurante Treinamento LAB','ACTIVE','2026-09-03T00:00:00');

INSERT OR IGNORE INTO nexo_license(id,tenant_id,plan_id,status,starts_at,expires_at,max_devices,offline_valid_until,last_rules_evaluation_at,updated_at) VALUES
('LIC-DEMO-001','TENANT-DEMO-001','PLAN-PRO-M','ACTIVE','2026-09-01','2026-10-01',3,'2026-09-10','2026-09-03T02:00:00','2026-09-03T02:00:00'),
('LIC-DEMO-002','TENANT-DEMO-002','PLAN-PRO-M','EXPIRING','2026-08-10','2026-09-10',3,'2026-09-08','2026-09-03T02:00:00','2026-09-03T02:00:00'),
('LIC-DEMO-003','TENANT-DEMO-003','PLAN-TRIAL','TRIAL','2026-09-01','2026-09-15',1,'2026-09-06','2026-09-03T02:00:00','2026-09-03T02:00:00');

INSERT OR IGNORE INTO nexo_license_device(id,license_id,installation_fingerprint_hash,label,status,first_seen_at,last_seen_at,app_version) VALUES
('DEV-DEMO-001','LIC-DEMO-001','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','CAIXA-01','ACTIVE','2026-09-01T09:00:00','2026-09-03T02:30:00','9.8-LAB'),
('DEV-DEMO-002','LIC-DEMO-002','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','CAIXA-01','ACTIVE','2026-08-10T09:00:00','2026-09-03T01:10:00','9.7'),
('DEV-DEMO-003','LIC-DEMO-003','cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc','TREINO-01','ACTIVE','2026-09-01T10:00:00','2026-09-02T18:00:00','9.8-LAB');

INSERT OR IGNORE INTO nexo_agent_heartbeat(id,tenant_id,device_id,received_at,app_version,windows_version,db_schema_version,free_disk_mb,service_status,backup_status,critical_error_count) VALUES
('HB-DEMO-001','TENANT-DEMO-001','DEV-DEMO-001','2026-09-03T02:30:00','9.8-LAB','Windows 11','160',48200,'OK','SUCCESS',0),
('HB-DEMO-002','TENANT-DEMO-002','DEV-DEMO-002','2026-09-03T01:10:00','9.7','Windows 10','150',6200,'DEGRADED','WARNING',2),
('HB-DEMO-003','TENANT-DEMO-003','DEV-DEMO-003','2026-09-02T18:00:00','9.8-LAB','Windows 11','160',38100,'OK','NOT_CONFIGURED',0);

INSERT OR REPLACE INTO nexo_usage_daily(tenant_id,usage_date,active_sessions,orders_count,sales_count,stock_actions_count,cash_actions_count,delivery_actions_count,modules_used_json,last_activity_at) VALUES
('TENANT-DEMO-001','2026-09-02',5,118,104,41,32,27,'["PEDIDOS","CAIXA","ESTOQUE","DELIVERY"]','2026-09-02T22:10:00'),
('TENANT-DEMO-002','2026-09-02',2,22,20,0,9,0,'["PEDIDOS","CAIXA"]','2026-09-02T18:12:00'),
('TENANT-DEMO-003','2026-09-02',1,4,3,1,2,0,'["PEDIDOS","CAIXA"]','2026-09-02T17:40:00');

INSERT OR IGNORE INTO nexo_usage_score_snapshot(id,tenant_id,period_start,period_end,score,classification,rule_version,calculated_at) VALUES
('US-DEMO-001','TENANT-DEMO-001','2026-08-04','2026-09-02',88,'HIGH','usage-v1','2026-09-03T00:10:00'),
('US-DEMO-002','TENANT-DEMO-002','2026-08-04','2026-09-02',42,'LOW','usage-v1','2026-09-03T00:10:00'),
('US-DEMO-003','TENANT-DEMO-003','2026-09-01','2026-09-02',18,'INACTIVE','usage-v1','2026-09-03T00:10:00');

INSERT OR IGNORE INTO nexo_backup_remote_record(id,tenant_id,device_id,backup_kind,created_at,size_bytes,sha256,encrypted,upload_status,integrity_status,restore_test_status,storage_object_ref) VALUES
('BKP-DEMO-001','TENANT-DEMO-001','DEV-DEMO-001','DAILY','2026-09-02T23:10:00',192937984,'1111111111111111111111111111111111111111111111111111111111111111',1,'UPLOADED','SUCCESS','SUCCESS','demo://backup/001'),
('BKP-DEMO-002','TENANT-DEMO-002','DEV-DEMO-002','DAILY','2026-09-02T23:12:00',173015040,'2222222222222222222222222222222222222222222222222222222222222222',1,'UPLOADED','WARNING','PENDING','demo://backup/002');

INSERT OR IGNORE INTO nexo_backup_restore_test(id,backup_id,tested_at,status,details_code) VALUES
('RST-DEMO-001','BKP-DEMO-001','2026-09-03T00:30:00','SUCCESS','READABLE_AND_QUICKCHECK_OK');

INSERT OR IGNORE INTO nexo_ai_recommendation(id,tenant_id,recommendation_type,severity,summary,evidence_json,suggested_action,requires_human_approval,action_state,created_at) VALUES
('AI-DEMO-001','TENANT-DEMO-002','HEALTH','HIGH','Instalação com pouco espaço livre, backup em alerta e dois erros críticos recentes.','{"free_disk_mb":6200,"backup_status":"WARNING","critical_errors":2}','Abrir diagnóstico de suporte e revisar backup antes de qualquer atualização.',1,'PROPOSED','2026-09-03T02:40:00'),
('AI-DEMO-002','TENANT-DEMO-002','TRAINING','WARNING','Uso baixo de estoque e delivery em relação a pedidos e caixa.','{"usage_score":42,"stock_actions":0,"delivery_actions":0}','Oferecer treinamento de ficha técnica, estoque e delivery.',1,'PROPOSED','2026-09-03T02:42:00');
