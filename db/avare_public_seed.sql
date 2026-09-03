-- NEXO ERP PRO 9.8 LAB
-- Seed público de Avaré/SP. NÃO executar automaticamente em produção.
-- Todos os fornecedores abaixo entram como CANDIDATOS e exigem homologação comercial.

CREATE TABLE IF NOT EXISTS public_postal_cache (
  cep TEXT PRIMARY KEY,
  logradouro TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  complemento_postal TEXT,
  faixa_numeracao TEXT,
  source TEXT NOT NULL,
  verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_supplier_candidate (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  city TEXT NOT NULL DEFAULT 'Avaré',
  uf TEXT NOT NULL DEFAULT 'SP',
  status TEXT NOT NULL DEFAULT 'candidate',
  verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_locality_meta (
  city TEXT NOT NULL,
  uf TEXT NOT NULL,
  ibge TEXT,
  ddd TEXT,
  cep_start TEXT,
  cep_end TEXT,
  reported_cep_count INTEGER,
  address_number_policy TEXT NOT NULL,
  PRIMARY KEY(city, uf)
);

INSERT OR REPLACE INTO public_locality_meta
(city,uf,ibge,ddd,cep_start,cep_end,reported_cep_count,address_number_policy)
VALUES
('Avaré','SP','3504503','14','18700-001','18709-999',1524,
 'Número do imóvel deve ser informado/confirmado pelo usuário. CEP não identifica número exato. Faixas postais servem apenas como validação auxiliar.');

-- Exemplos de faixas postais verificadas; a base completa deve ser alimentada pelo resolvedor/cache do ERP privado.
INSERT OR REPLACE INTO public_postal_cache VALUES
('18700-260','Rua Acre','Centro','Avaré','SP','','de 762/763 a 2130/2131','referencia_publica','2026-09-03'),
('18701-570','Rua Acre','Santana','Avaré','SP','','de 2132/2133 ao fim','referencia_publica','2026-09-03'),
('18705-580','Rua Acre','Jardim São Paulo','Avaré','SP','','até 760/761','referencia_publica','2026-09-03'),
('18700-010','Rua Alagoas','Centro','Avaré','SP','','até 1540/1541','referencia_publica','2026-09-03'),
('18705-070','Rua Alagoas','Centro','Avaré','SP','','de 1542/1543 a 1670/1671','referencia_publica','2026-09-03');

INSERT OR REPLACE INTO public_supplier_candidate
(id,category,name,address,phone,status,verified_at) VALUES
('AV-EMB-001','embalagens','PaperBox Fábrica de Embalagens','R. Maestro Amilcar, 128 - Ipiranga, Avaré - SP, 18701-141','(14) 99792-3479','candidate','2026-09-03'),
('AV-EMB-002','embalagens','Rio Novo Embalagens','R. Luís Scarceli, 60 - Jardim Paineiras, Avaré - SP, 18706-280','(14) 3711-3400','candidate','2026-09-03'),
('AV-EMB-003','embalagens','Embalagens Avaré Atacado','Av. Três Marias, 213 - Vila Três Marias, Avaré - SP, 18708-040','(14) 3731-7124','candidate','2026-09-03'),
('AV-EMB-004','embalagens','Lia Embalagens','R. Acre, 1260 - Centro, Avaré - SP, 18700-260','(14) 99733-7531','candidate','2026-09-03'),
('AV-EMB-005','embalagens','E.A Embalagens','R. Alagoas, 1513 - Centro, Avaré - SP, 18700-010','(14) 99610-1022','candidate','2026-09-03'),
('AV-EMB-006','embalagens','Leo’s Doces e Embalagens','R. Dr. Félix Fagundes, 635 - Vila Timóteo, Avaré - SP, 18701-370','(14) 3732-0131','candidate','2026-09-03'),

('AV-MER-001','supermercado','Pinheirão Supermercados - Jardim Europa','Av. Prof. Célso Ferreira da Silva, 1400 - Jardim Europa, Avaré - SP, 18707-150','(14) 3711-9999','candidate','2026-09-03'),
('AV-MER-002','supermercado','Pinheirão Supermercados - Vila São João','R. Dr. Félix Fagundes, 1523 - Vila São João, Avaré - SP, 18702-200','(14) 3731-0380','candidate','2026-09-03'),
('AV-MER-003','supermercado','Aliança Supermercado Loja 02-Avaré','R. Dr. Félix Fagundes, 1072 - Vila São João, Avaré - SP, 18702-200','(14) 99772-7692','candidate','2026-09-03'),
('AV-MER-004','supermercado','Supermercado Tradição','R. Piauí, 473 - Centro, Avaré - SP, 18701-050','','candidate','2026-09-03'),
('AV-MER-005','supermercado','Supermercado Camargo','R. Musa, 2330 - Vila Martins I, Avaré - SP, 18700-540','(14) 3732-4222','candidate','2026-09-03'),
('AV-MER-006','supermercado','Mercado Abavil','R. Pará, 1211 - Centro, Avaré - SP, 18705-030','(14) 99658-9326','candidate','2026-09-03'),

('AV-CAR-001','carnes','Açougue Novilha de Prata','Av. João Victor de Maria, 1151 - Vila São João, Avaré - SP','(14) 3733-6023','candidate','2026-09-03'),
('AV-CAR-002','carnes','Casa de Carne São Gabriel','R. Marta Rocha, 290 - Jardim Bom Sucesso I, Avaré - SP, 18702-320','','candidate','2026-09-03'),
('AV-CAR-003','carnes','UniCarnes','Av. Professor Celso Ferreira da Silva, 1300 - Jardim Europa I, Avaré - SP','(14) 3732-4680','candidate','2026-09-03'),
('AV-CAR-004','carnes','Santo Beef Açougue em Avaré','R. Mato Grosso, 1274 - Centro, Avaré - SP','(14) 3731-2345','candidate','2026-09-03'),
('AV-CAR-005','carnes','Armazém da Carne','R. Jânio Quadros, 681 - Jardim São Paulo, Avaré - SP, 18705-550','(14) 99735-5683','candidate','2026-09-03'),

('AV-ENT-001','entrega','PK2U Tecnologia e Serviços de Entrega','R. Óleo, 20 - Parque Industrial Jurumirim, Avaré - SP, 18704-070','(14) 3448-1137','candidate','2026-09-03'),
('AV-ENT-002','entrega','RR EXPRESS','R. Acre, 1951 - Centro, Avaré - SP, 18700-260','(14) 93300-4625','candidate','2026-09-03'),
('AV-ENT-003','entrega','Transportadora Corrêa','R. Sergipe, 1043 - Centro, Avaré - SP, 18700-050','(14) 3732-2511','candidate','2026-09-03'),
('AV-ENT-004','entrega','Rodonaves Avaré','Av. Dr. Plínio de Almeida Fagundes, 714 - Jardim Paineiras, Avaré - SP, 18705-770','(14) 3514-0800','candidate','2026-09-03'),
('AV-ENT-005','entrega','Transportadora Edjufer','R. Lúcio Dias da Fonseca, 71 - Altos da Boa Vista, Avaré - SP, 18708-620','(14) 3731-2018','candidate','2026-09-03'),

('AV-GAS-001','gas','Ultragaz - Félix Fagundes','R. Dr. Félix Fagundes, 1442 - Vila Timóteo, Avaré - SP, 18702-200','(14) 3731-9393','candidate','2026-09-03'),
('AV-GAS-002','gas','Avaré Gás','R. Professor Amorim, 1072 - Jardim Bom Sucesso II, Avaré - SP','','candidate','2026-09-03'),
('AV-GAS-003','gas','Depósito de Gás Costa Azul','Alameda Campos Verdes - Costa Azul, Avaré - SP, 18703-847','(14) 99797-4525','candidate','2026-09-03'),
('AV-GAS-004','gas','Ultragaz Zanforlin','R. São Paulo, 367 - Centro, Avaré - SP, 18700-070','(14) 3731-1333','candidate','2026-09-03');