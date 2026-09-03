import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,js,css,moduleCss,phase2,phase2Css]=await Promise.all([
  readFile(new URL('../ui/index.html',import.meta.url),'utf8'),
  readFile(new URL('../ui/app.js',import.meta.url),'utf8'),
  readFile(new URL('../ui/styles.css',import.meta.url),'utf8'),
  readFile(new URL('../ui/modules.css',import.meta.url),'utf8'),
  readFile(new URL('../ui/phase2.js',import.meta.url),'utf8'),
  readFile(new URL('../ui/phase2.css',import.meta.url),'utf8')
]);

const allJs=`${js}\n${phase2}`;
const allCss=`${css}\n${moduleCss}\n${phase2Css}`;
const checks=[];
function check(name,fn){try{fn();checks.push([name,true])}catch(error){checks.push([name,false,error.message])}}

check('CSP default-src self',()=>assert.match(html,/default-src 'self'/));
check('CSP script-src self',()=>assert.match(html,/script-src 'self'/));
check('CSP style-src self',()=>assert.match(html,/style-src 'self'/));
check('CSP sem rede no protótipo',()=>assert.match(html,/connect-src 'none'/));
check('CSP bloqueia object',()=>assert.match(html,/object-src 'none'/));
check('sem script inline',()=>assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i));
check('phase2 carregado após app',()=>assert.match(html,/app\.js" defer><\/script>\s*<script src="phase2\.js" defer><\/script>/));
check('sem style inline',()=>assert.doesNotMatch(html,/\sstyle\s*=/i));
check('sem handlers HTML inline',()=>assert.doesNotMatch(html,/\son(?:click|change|submit|load|error|input|keydown|keyup)\s*=/i));
check('todo button HTML declara type',()=>assert.doesNotMatch(html,/<button(?![^>]*\btype=)[^>]*>/i));
check('command palette é diálogo modal',()=>assert.match(html,/role="dialog"[^>]*aria-modal="true"/));
check('navegação possui aria-current inicial',()=>assert.match(html,/data-page="dashboard"[^>]*aria-current="page"/));
check('sem innerHTML no JavaScript',()=>assert.doesNotMatch(allJs,/\.innerHTML\s*=/));
check('sem insertAdjacentHTML',()=>assert.doesNotMatch(allJs,/insertAdjacentHTML\s*\(/));
check('sem eval',()=>assert.doesNotMatch(allJs,/\beval\s*\(/));
check('sem new Function',()=>assert.doesNotMatch(allJs,/new\s+Function\s*\(/));
check('sem document.write',()=>assert.doesNotMatch(allJs,/document\.write\s*\(/));
check('event delegation presente',()=>assert.match(allJs,/document\.addEventListener\('click'/));
check('busca normaliza acentos',()=>assert.match(js,/normalize\('NFD'\)/));
check('focus-visible presente',()=>assert.match(css,/:focus-visible/));
check('reduced-motion presente',()=>assert.match(css,/prefers-reduced-motion:reduce/));
check('menu compacto não usa marcador genérico',()=>assert.doesNotMatch(css,/content:\s*["']•["']/));
check('sem URLs remotas na UI',()=>assert.doesNotMatch(`${html}\n${allCss}\n${allJs}`,/https?:\/\//i));
check('módulos CSS carregados apenas de self',()=>assert.match(js,/link\.href='modules\.css'/));
check('phase2 CSS carregado apenas de self',()=>assert.match(phase2,/link\.href='phase2\.css'/));
check('PDV operacional presente',()=>assert.match(js,/function buildPDV\(/));
check('Recebimentos 360 operacional presente',()=>assert.match(js,/function buildReceipts\(/));
check('Financeiro operacional presente',()=>assert.match(js,/function buildFinance\(/));
check('Estoque operacional presente',()=>assert.match(js,/function buildStock\(/));
check('Pedidos operacional presente',()=>assert.match(phase2,/function buildOrders\(/));
check('Delivery operacional presente',()=>assert.match(phase2,/function buildDelivery\(/));
check('Produtos operacional presente',()=>assert.match(phase2,/function buildProducts\(/));
check('Compras operacional presente',()=>assert.match(phase2,/function buildPurchases\(/));
check('Fornecedores operacional presente',()=>assert.match(phase2,/function buildSuppliers\(/));
check('Caixa operacional presente',()=>assert.match(phase2,/function buildCash\(/));
check('Clientes CRM operacional presente',()=>assert.match(phase2,/function buildClients\(/));
check('PDV não persiste venda real',()=>assert.match(js,/Integração real permanece bloqueada no LAB/));
check('Estoque calcula disponível por físico menos reservado',()=>assert.match(js,/item\.physical\s*-\s*item\.reserved/));
check('Recebimentos mantém filtro de pendências',()=>assert.match(js,/receiptFilter==='pendente'/));
check('Compra LAB não altera estoque real',()=>assert.match(phase2,/estoque real não foi alterado/));
check('Caixa esperado separa fundo, dinheiro, suprimento e sangria',()=>assert.match(phase2,/cashState\.opening\+cashState\.cashSales\+cashState\.supplies-cashState\.withdrawals/));
check('CRM público não contém email ou telefone',()=>{assert.doesNotMatch(phase2,/@[a-z0-9.-]+\.[a-z]{2,}/i);assert.doesNotMatch(phase2,/\b\d{2}\s?9?\d{4}[-\s]?\d{4}\b/)});
check('fallback evita módulo em branco',()=>assert.match(phase2,/Falha de montagem detectada/));
check('badges críticos têm estilo',()=>assert.match(phase2Css,/\.pill\.danger/));
check('badges VIP têm estilo',()=>assert.match(phase2Css,/\.pill\.purple/));
check('layout operacional responsivo',()=>assert.match(moduleCss,/@media\(max-width:850px\)/));
check('layout fase 2 responsivo',()=>assert.match(phase2Css,/@media\(max-width:850px\)/));

const requiredPages=['dashboard','pdv','pedidos','produtos','estoque','compras','caixa','recebimentos','financeiro','delivery','clientes','fornecedores','relatorios','ia','integracoes','suporte'];
for(const page of requiredPages)check(`módulo ${page} presente`,()=>assert.match(html,new RegExp(`data-page="${page}"`)));

let failed=0;
for(const [name,ok,message] of checks){if(ok)console.log(`PASS  ${name}`);else{failed++;console.error(`FAIL  ${name}: ${message}`)}}
console.log(`\nResultado: ${checks.length-failed}/${checks.length} verificações PASS`);
if(failed)process.exit(1);
