-- NEXO ERP PRO 9.8 LAB — seed demonstrativo Fase 9
-- Valores, clientes e entregadores são fictícios/configuráveis. Não são dados comerciais definitivos.

INSERT OR REPLACE INTO order_state_transition_allowed (from_state,to_state,permission_code) VALUES
('NEW','CONFIRMED','ORDER_CONFIRM'),
('NEW','CANCELLED','ORDER_CANCEL'),
('CONFIRMED','PREPARING','PRODUCTION_START'),
('CONFIRMED','CANCELLED','ORDER_CANCEL'),
('PREPARING','READY','PRODUCTION_READY'),
('PREPARING','CANCELLED','ORDER_CANCEL'),
('READY','WAITING_DRIVER','DELIVERY_QUEUE'),
('READY','SERVING','TABLE_SERVE'),
('READY','PAID','PAYMENT_CONFIRM'),
('READY','CANCELLED','ORDER_CANCEL'),
('WAITING_DRIVER','OUT_FOR_DELIVERY','DELIVERY_START'),
('WAITING_DRIVER','CANCELLED','ORDER_CANCEL'),
('OUT_FOR_DELIVERY','DELIVERED','DELIVERY_COMPLETE'),
('OUT_FOR_DELIVERY','CANCELLED','ORDER_CANCEL'),
('DELIVERED','PAID','PAYMENT_CONFIRM'),
('SERVING','PAID','PAYMENT_CONFIRM'),
('PAID','FINALIZED','ORDER_FINALIZE');

INSERT OR REPLACE INTO delivery_customer_profile
(customer_id,display_name,phone,whatsapp,notes,active,updated_at) VALUES
('CUST-DEMO-001','Cliente Demonstração 001','(14) 9****-1201','(14) 9****-1201','Cadastro fictício do LAB.',1,'2026-09-03T00:00:00Z'),
('CUST-DEMO-002','Cliente Demonstração 002','(14) 9****-1202','(14) 9****-1202','Cadastro fictício do LAB.',1,'2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO delivery_customer_address
(id,customer_id,label,cep,street,number,complement,neighborhood,city,state_code,reference_text,notes,is_default,active,updated_at) VALUES
('ADDR-DEMO-001-HOME','CUST-DEMO-001','Casa','18700-000','Rua Demonstração A','250',NULL,'Centro','Avaré','SP','Próximo à praça','Endereço fictício.',1,1,'2026-09-03T00:00:00Z'),
('ADDR-DEMO-001-WORK','CUST-DEMO-001','Trabalho','18700-000','Avenida Demonstração B','850','Sala 2','Jardim América','Avaré','SP','Portaria principal','Endereço fictício.',0,1,'2026-09-03T00:00:00Z'),
('ADDR-DEMO-002-HOME','CUST-DEMO-002','Casa','18700-000','Rua Demonstração C','90',NULL,'Vila Nova','Avaré','SP',NULL,'Endereço fictício.',1,1,'2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO delivery_fee_rule
(id,neighborhood,base_fee_cents,free_above_cents,free_delivery,priority,active,updated_at) VALUES
('FEE-DEMO-CENTRO','Centro',400,5000,0,10,1,'2026-09-03T00:00:00Z'),
('FEE-DEMO-JD-AMERICA','Jardim América',600,7000,0,20,1,'2026-09-03T00:00:00Z'),
('FEE-DEMO-VILA-NOVA','Vila Nova',700,NULL,0,30,1,'2026-09-03T00:00:00Z'),
('FEE-DEMO-ZONA-RURAL','Zona Rural',1200,NULL,0,40,1,'2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO delivery_driver
(id,user_id,display_name,phone,status,vehicle,plate,service_region,active,last_seen_at,updated_at) VALUES
('DRV-DEMO-CARLOS','USR-DEMO-CARLOS','Carlos — DEMO',NULL,'AVAILABLE','Moto',NULL,'Centro / Jardim América',1,'2026-09-03T00:00:00Z','2026-09-03T00:00:00Z'),
('DRV-DEMO-JOAO','USR-DEMO-JOAO','João — DEMO',NULL,'DELIVERING','Moto',NULL,'Centro / Vila Nova',1,'2026-09-03T00:00:00Z','2026-09-03T00:00:00Z'),
('DRV-DEMO-MARCOS','USR-DEMO-MARCOS','Marcos — DEMO',NULL,'DELIVERING','Bicicleta',NULL,'Centro',1,'2026-09-03T00:00:00Z','2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO delivery_driver_compensation_rule
(id,driver_id,mode,fixed_cents,per_km_cents,region_name,region_cents,active,updated_at) VALUES
('COMP-DEMO-CARLOS', 'DRV-DEMO-CARLOS','FIXED',500,NULL,NULL,NULL,1,'2026-09-03T00:00:00Z'),
('COMP-DEMO-JOAO',   'DRV-DEMO-JOAO','REGION',NULL,NULL,'Centro',500,1,'2026-09-03T00:00:00Z'),
('COMP-DEMO-MARCOS', 'DRV-DEMO-MARCOS','PER_KM',NULL,180,NULL,NULL,1,'2026-09-03T00:00:00Z');
