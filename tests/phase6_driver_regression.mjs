import {readFile} from 'node:fs/promises';

const [html,js,css,schema,seed,docs]=await Promise.all([
 readFile('ui/index.html','utf8'),readFile('ui/phase6.js','utf8'),readFile('ui/phase6.css','utf8'),
 readFile('db/9_8_driver_catalog_schema.sql','utf8'),readFile('db/9_8_driver_catalog_seed.sql','utf8'),readFile('docs/FASE6_CENTRAL_DRIVERS_PERIFERICOS_9.8.md','utf8')
]);
const checks=[];const ok=(name,cond)=>checks.push([name,Boolean(cond)]);
ok('phase6 carregado após phase5',html.indexOf('phase6.js')>html.indexOf('phase5.js'));
ok('phase6 CSS local/self',js.includes("l.href='phase6.css'"));
ok('phase6 sem innerHTML',!js.includes('innerHTML'));
ok('phase6 sem eval',!js.includes('eval('));
ok('phase6 sem URL remota na UI',!js.includes('https://')&&!js.includes('http://'));
ok('Central de Drivers em Integrações',js.includes("getElementById('page-integracoes')")&&js.includes('Central de Drivers & Periféricos'));
ok('Etiquetas em Produtos',js.includes("getElementById('page-produtos')")&&js.includes('Etiquetas de Produto'));
ok('NEXO IA Driver Care',js.includes('NEXO IA — Driver Care')&&js.includes('Cuidador de Periféricos'));
ok('IA não instala sem aprovação',js.includes('exige confirmação do administrador')&&js.includes('aprovação humana'));
ok('HID reconhece que não precisa driver',js.includes('HID_NO_DRIVER')&&js.includes('Nenhum driver extra necessário'));
ok('catálogo contém Elgin i7/i8/i9',seed.includes('ELGIN_I7')&&seed.includes('ELGIN_I8')&&seed.includes('ELGIN_I9'));
ok('catálogo contém MP-4200 TH/ADV/HS',seed.includes('BEM_MP4200_TH')&&seed.includes('BEM_MP4200_ADV')&&seed.includes('BEM_MP4200_HS'));
ok('catálogo contém Epson TM-T20X',seed.includes('EPSON_T20X')&&seed.includes('6.07R1'));
ok('catálogo contém Zebra ZD/DS',seed.includes('ZEBRA_ZD220')&&seed.includes('ZEBRA_ZD421')&&seed.includes('ZEBRA_DS2208'));
ok('catálogo contém Argox',seed.includes('ARGOX_OS214PRO')&&seed.includes('12.5.0'));
ok('catálogo contém Datalogic',seed.includes('DATALOGIC_QS2500')&&seed.includes('7.1.5'));
ok('fontes Bz Tech cadastradas',seed.includes('driver-elgin-i7-i8-e-i9-windows-e-linux')&&seed.includes('driver-bematech-mp-4200'));
ok('fontes oficiais possuem trust 3',seed.includes("'OFFICIAL'")&&seed.includes("3,'2026-09-03'"));
ok('reseller não vira homologado',seed.includes("'PKG_ELGIN_MULTI'")&&seed.includes("'CANDIDATE'"));
ok('schema valida hash SHA256',schema.includes('length(sha256)=64'));
ok('schema diferencia driver de leitor e impressora',schema.includes("'PRINTER_DRIVER'")&&schema.includes("'SCANNER_DRIVER'"));
ok('schema possui compatibilidade modelo/pacote',schema.includes('driver_model_compatibility'));
ok('schema possui recomendação de IA',schema.includes('driver_ai_recommendation'));
ok('schema possui auditoria',schema.includes('driver_catalog_audit'));
ok('schema possui etiqueta de produto',schema.includes('product_label_template')&&schema.includes('product_label_job'));
ok('templates incluem EAN13 Code128 QR',seed.includes("'EAN13'")&&seed.includes("'CODE128'")&&seed.includes("'QR'"));
ok('linguagens de etiqueta previstas',schema.includes("'ZPL'")&&schema.includes("'EPL'")&&schema.includes("'PPLA'")&&schema.includes("'PPLB'"));
ok('documentação proíbe binário embutido',docs.includes('não embute executáveis de terceiros'));
ok('documentação exige assinatura e SHA-256',docs.includes('assinatura')&&docs.includes('SHA-256'));
ok('layout responsivo phase6',css.includes('@media(max-width:720px)'));
let failures=0;for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'}  ${name}`);if(!pass)failures++}console.log(`\nResultado Phase 6: ${checks.length-failures}/${checks.length} verificações PASS`);if(failures)process.exit(1);
