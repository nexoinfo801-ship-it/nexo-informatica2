-- NEXO ERP PRO 9.8 LAB — seed demonstrativo Fase 7
-- Pratos/preços são exemplos configuráveis do LAB, não tabela comercial definitiva.

INSERT OR REPLACE INTO beverage_company
(id, legal_or_trade_name, company_kind, country_code, official_source_url, status, notes, updated_at) VALUES
('BEV_COCA_COLA_BR','Sistema Coca-Cola Brasil','BEVERAGE_SYSTEM','BR','https://www.coca-cola.com/br/pt/about-us/sistema','VERIFIED','Fabricantes franqueados e portfólio amplo de bebidas no Brasil.','2026-09-03T00:00:00Z'),
('BEV_AMBEV','Ambev S.A.','BREWERY','BR','https://ri.ambev.com.br/visao-geral/historico/','VERIFIED','Empresa de bebidas; marcas próprias incluem Brahma, Antarctica e Guaraná Antarctica.','2026-09-03T00:00:00Z'),
('BEV_HEINEKEN_BR','Grupo HEINEKEN Brasil','BREWERY','BR','https://www.heinekenbrasil.com.br/nossas-marcas','VERIFIED','Portfólio de cervejas e bebidas não alcoólicas no Brasil.','2026-09-03T00:00:00Z'),
('BEV_PEPSICO_BR','PepsiCo Brasil','FOOD_BEVERAGE','BR','https://www.pepsico.com.br/nossas-marcas','VERIFIED','Divisão de bebidas com Pepsi, Gatorade, H2OH!, Lipton e outras marcas.','2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO beverage_brand
(id, company_id, brand_name, beverage_category, active) VALUES
('BR_COCA_COLA','BEV_COCA_COLA_BR','Coca-Cola','SOFT_DRINK',1),
('BR_FANTA','BEV_COCA_COLA_BR','Fanta','SOFT_DRINK',1),
('BR_SPRITE','BEV_COCA_COLA_BR','Sprite','SOFT_DRINK',1),
('BR_DEL_VALLE','BEV_COCA_COLA_BR','Del Valle','JUICE',1),
('BR_BRAHMA','BEV_AMBEV','Brahma','BEER',1),
('BR_ANTARCTICA','BEV_AMBEV','Antarctica','BEER',1),
('BR_GUARANA_ANT','BEV_AMBEV','Guaraná Antarctica','SOFT_DRINK',1),
('BR_ORIGINAL','BEV_AMBEV','Original','BEER',1),
('BR_HEINEKEN','BEV_HEINEKEN_BR','Heineken','BEER',1),
('BR_AMSTEL','BEV_HEINEKEN_BR','Amstel','BEER',1),
('BR_EISENBAHN','BEV_HEINEKEN_BR','Eisenbahn','BEER',1),
('BR_ITUBAINA','BEV_HEINEKEN_BR','Itubaína','SOFT_DRINK',1),
('BR_PEPSI','BEV_PEPSICO_BR','Pepsi','SOFT_DRINK',1),
('BR_GATORADE','BEV_PEPSICO_BR','Gatorade','SPORTS',1),
('BR_H2OH','BEV_PEPSICO_BR','H2OH!','SOFT_DRINK',1),
('BR_LIPTON','BEV_PEPSICO_BR','Lipton','TEA',1),
('BR_KERO_COCO','BEV_PEPSICO_BR','Kero Coco','OTHER',1);

INSERT OR REPLACE INTO executive_dish
(id, product_id, name, description, sale_price_cents, estimated_cost_cents, active, production_sector, demo_only, updated_at) VALUES
('EXEC_BIFE_01',NULL,'Executivo Bife Acebolado','Arroz, feijão, bife acebolado, salada e batata.',2990,1280,1,'KITCHEN',1,'2026-09-03T00:00:00Z'),
('EXEC_FRANGO_01',NULL,'Executivo Frango Grelhado','Arroz, feijão, frango grelhado, salada e farofa.',2790,1050,1,'KITCHEN',1,'2026-09-03T00:00:00Z'),
('EXEC_LINGUICA_01',NULL,'Executivo Linguiça Acebolada','Arroz, feijão, linguiça acebolada, salada e farofa.',2790,1080,1,'KITCHEN',1,'2026-09-03T00:00:00Z'),
('EXEC_PARMEGIANA_FRANGO',NULL,'Executivo Frango à Parmegiana','Arroz, feijão, filé de frango à parmegiana e batata.',3490,1540,1,'KITCHEN',1,'2026-09-03T00:00:00Z'),
('EXEC_PARMEGIANA_BIFE',NULL,'Executivo Bife à Parmegiana','Arroz, feijão, bife à parmegiana e batata.',3690,1690,1,'KITCHEN',1,'2026-09-03T00:00:00Z'),
('EXEC_OMELETE_01',NULL,'Executivo Omelete','Arroz, feijão, omelete, salada e batata.',2490,890,1,'KITCHEN',1,'2026-09-03T00:00:00Z');

INSERT OR REPLACE INTO executive_dish_component
(id, dish_id, component_name, quantity, unit, required, can_replace, sort_order) VALUES
('C_BIFE_ARROZ','EXEC_BIFE_01','Arroz',150,'g',1,1,1),
('C_BIFE_FEIJAO','EXEC_BIFE_01','Feijão',100,'g',1,1,2),
('C_BIFE_PROT','EXEC_BIFE_01','Bife acebolado',150,'g',1,1,3),
('C_BIFE_SALADA','EXEC_BIFE_01','Salada',50,'g',1,1,4),
('C_BIFE_BATATA','EXEC_BIFE_01','Batata',80,'g',1,1,5),
('C_FRANGO_ARROZ','EXEC_FRANGO_01','Arroz',150,'g',1,1,1),
('C_FRANGO_FEIJAO','EXEC_FRANGO_01','Feijão',100,'g',1,1,2),
('C_FRANGO_PROT','EXEC_FRANGO_01','Frango grelhado',150,'g',1,1,3),
('C_FRANGO_SALADA','EXEC_FRANGO_01','Salada',50,'g',1,1,4),
('C_FRANGO_FAROFA','EXEC_FRANGO_01','Farofa',50,'g',1,1,5);

INSERT OR REPLACE INTO beverage_catalog_reference
(id, brand_id, product_name, volume_ml, barcode, product_id, active) VALUES
('REF_COCA_350','BR_COCA_COLA','Coca-Cola 350 ml',350,NULL,NULL,1),
('REF_COCA_ZERO_350','BR_COCA_COLA','Coca-Cola Sem Açúcar 350 ml',350,NULL,NULL,1),
('REF_GUARANA_350','BR_GUARANA_ANT','Guaraná Antarctica 350 ml',350,NULL,NULL,1),
('REF_PEPSI_350','BR_PEPSI','Pepsi 350 ml',350,NULL,NULL,1),
('REF_H2OH_500','BR_H2OH','H2OH! 500 ml',500,NULL,NULL,1),
('REF_GATORADE_500','BR_GATORADE','Gatorade 500 ml',500,NULL,NULL,1);
