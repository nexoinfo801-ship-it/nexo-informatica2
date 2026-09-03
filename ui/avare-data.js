(()=>{
'use strict';

window.NEXO_AVARE_PUBLIC_DATA=Object.freeze({
  municipality:Object.freeze({
    city:'Avaré',state:'SP',ibge:'3504503',ddd:'14',cepStart:'18700-001',cepEnd:'18709-999',reportedCepCount:1524,
    addressNumberPolicy:'O número do imóvel não é derivado do CEP. Deve ser informado/confirmado pelo usuário. Faixas postais podem ser usadas somente como validação auxiliar.'
  }),
  postalStrategy:Object.freeze({
    mode:'lookup-and-cache',
    primary:'ViaCEP',
    fallback:'BrasilAPI',
    authoritativeBulk:'Correios DNE / API autorizada quando disponível',
    notes:'No ERP privado, consultar o CEP no processo principal, validar cidade/UF, gravar cache local e pedir confirmação do número/complemento. Não fazer varredura de 10 mil CEPs nem inventar numeração.'
  }),
  numberRangeExamples:Object.freeze([
    {street:'Rua Acre',cep:'18700-260',neighborhood:'Centro',range:'de 762/763 a 2130/2131'},
    {street:'Rua Acre',cep:'18701-570',neighborhood:'Santana',range:'de 2132/2133 ao fim'},
    {street:'Rua Acre',cep:'18705-580',neighborhood:'Jardim São Paulo',range:'até 760/761'},
    {street:'Rua Alagoas',cep:'18700-010',neighborhood:'Centro',range:'até 1540/1541'},
    {street:'Rua Alagoas',cep:'18705-070',neighborhood:'Centro',range:'de 1542/1543 a 1670/1671'}
  ]),
  supplierCandidates:Object.freeze([
    {id:'AV-EMB-001',category:'embalagens',name:'PaperBox Fábrica de Embalagens',address:'R. Maestro Amilcar, 128 - Ipiranga, Avaré - SP, 18701-141',phone:'(14) 99792-3479',status:'candidato'},
    {id:'AV-EMB-002',category:'embalagens',name:'Rio Novo Embalagens',address:'R. Luís Scarceli, 60 - Jardim Paineiras, Avaré - SP, 18706-280',phone:'(14) 3711-3400',status:'candidato'},
    {id:'AV-EMB-003',category:'embalagens',name:'Embalagens Avaré Atacado',address:'Av. Três Marias, 213 - Vila Três Marias, Avaré - SP, 18708-040',phone:'(14) 3731-7124',status:'candidato'},
    {id:'AV-EMB-004',category:'embalagens',name:'Lia Embalagens',address:'R. Acre, 1260 - Centro, Avaré - SP, 18700-260',phone:'(14) 99733-7531',status:'candidato'},
    {id:'AV-EMB-005',category:'embalagens',name:'E.A Embalagens',address:'R. Alagoas, 1513 - Centro, Avaré - SP, 18700-010',phone:'(14) 99610-1022',status:'candidato'},
    {id:'AV-EMB-006',category:'embalagens',name:'Leo’s Doces e Embalagens',address:'R. Dr. Félix Fagundes, 635 - Vila Timóteo, Avaré - SP, 18701-370',phone:'(14) 3732-0131',status:'candidato'},

    {id:'AV-MER-001',category:'supermercado',name:'Pinheirão Supermercados - Jardim Europa',address:'Av. Prof. Célso Ferreira da Silva, 1400 - Jardim Europa, Avaré - SP, 18707-150',phone:'(14) 3711-9999',status:'candidato'},
    {id:'AV-MER-002',category:'supermercado',name:'Pinheirão Supermercados - Vila São João',address:'R. Dr. Félix Fagundes, 1523 - Vila São João, Avaré - SP, 18702-200',phone:'(14) 3731-0380',status:'candidato'},
    {id:'AV-MER-003',category:'supermercado',name:'Aliança Supermercado Loja 02-Avaré',address:'R. Dr. Félix Fagundes, 1072 - Vila São João, Avaré - SP, 18702-200',phone:'(14) 99772-7692',status:'candidato'},
    {id:'AV-MER-004',category:'supermercado',name:'Supermercado Tradição',address:'R. Piauí, 473 - Centro, Avaré - SP, 18701-050',phone:'',status:'candidato'},
    {id:'AV-MER-005',category:'supermercado',name:'Supermercado Camargo',address:'R. Musa, 2330 - Vila Martins I, Avaré - SP, 18700-540',phone:'(14) 3732-4222',status:'candidato'},
    {id:'AV-MER-006',category:'supermercado',name:'Mercado Abavil',address:'R. Pará, 1211 - Centro, Avaré - SP, 18705-030',phone:'(14) 99658-9326',status:'candidato'},

    {id:'AV-CAR-001',category:'carnes',name:'Açougue Novilha de Prata',address:'Av. João Victor de Maria, 1151 - Vila São João, Avaré - SP',phone:'(14) 3733-6023',status:'candidato'},
    {id:'AV-CAR-002',category:'carnes',name:'Casa de Carne São Gabriel',address:'R. Marta Rocha, 290 - Jardim Bom Sucesso I, Avaré - SP, 18702-320',phone:'',status:'candidato'},
    {id:'AV-CAR-003',category:'carnes',name:'UniCarnes',address:'Av. Professor Celso Ferreira da Silva, 1300 - Jardim Europa I, Avaré - SP',phone:'(14) 3732-4680',status:'candidato'},
    {id:'AV-CAR-004',category:'carnes',name:'Santo Beef Açougue em Avaré',address:'R. Mato Grosso, 1274 - Centro, Avaré - SP',phone:'(14) 3731-2345',status:'candidato'},
    {id:'AV-CAR-005',category:'carnes',name:'Armazém da Carne',address:'R. Jânio Quadros, 681 - Jardim São Paulo, Avaré - SP, 18705-550',phone:'(14) 99735-5683',status:'candidato'},

    {id:'AV-ENT-001',category:'entrega',name:'PK2U Tecnologia e Serviços de Entrega',address:'R. Óleo, 20 - Parque Industrial Jurumirim, Avaré - SP, 18704-070',phone:'(14) 3448-1137',status:'candidato'},
    {id:'AV-ENT-002',category:'entrega',name:'Entregas RR',address:'R. Acre, 1951 - Santana, Avaré - SP, 18700-260',phone:'(14) 99819-3997',status:'candidato'},
    {id:'AV-ENT-003',category:'entrega',name:'Transportadora Corrêa',address:'R. Sergipe, 1043 - Centro, Avaré - SP, 18700-050',phone:'(14) 3732-2511',status:'candidato'},
    {id:'AV-ENT-004',category:'entrega',name:'Rodonaves Avaré',address:'Av. Dr. Plínio de Almeida Fagundes, 714 - Jardim Paineiras, Avaré - SP, 18705-770',phone:'(14) 3514-0800',status:'candidato'},
    {id:'AV-ENT-005',category:'entrega',name:'Transportadora Edjufer',address:'R. Lúcio Dias da Fonseca, 71 - Altos da Boa Vista, Avaré - SP, 18708-620',phone:'(14) 3731-2018',status:'candidato'},

    {id:'AV-GAS-001',category:'gas',name:'Ultragaz - Félix Fagundes',address:'R. Dr. Félix Fagundes, 1442 - Vila Timóteo, Avaré - SP, 18702-200',phone:'(14) 3731-9393',status:'candidato'},
    {id:'AV-GAS-002',category:'gas',name:'Avaré Gás',address:'R. Professor Amorim, 1072 - Jardim Bom Sucesso II, Avaré - SP',phone:'',status:'candidato'},
    {id:'AV-GAS-003',category:'gas',name:'Depósito de Gás Costa Azul',address:'Alameda Campos Verdes - Costa Azul, Avaré - SP, 18703-847',phone:'(14) 99797-4525',status:'candidato'},
    {id:'AV-GAS-004',category:'gas',name:'Ultragaz Zanforlin',address:'R. São Paulo, 367 - Centro, Avaré - SP, 18700-070',phone:'(14) 3731-1333',status:'candidato'}
  ]),
  verifiedAt:'2026-09-03'
});
})();