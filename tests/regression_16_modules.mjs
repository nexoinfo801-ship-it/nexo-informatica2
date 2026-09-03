import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,app,p2,p3,guard,p4]=await Promise.all([
 readFile(new URL('../ui/index.html',import.meta.url),'utf8'),
 readFile(new URL('../ui/app.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase2.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase3.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/avare-nav-guard.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase4.js',import.meta.url),'utf8')
]);

const pages=['dashboard','pdv','pedidos','produtos','estoque','compras','caixa','recebimentos','financeiro','delivery','clientes','fornecedores','relatorios','ia','integracoes','suporte'];
const builders={pdv:'buildPDV',recebimentos:'buildReceipts',financeiro:'buildFinance',estoque:'buildStock',pedidos:'buildOrders',produtos:'buildProducts',compras:'buildPurchases',caixa:'buildCash',delivery:'buildDelivery',clientes:'buildClients',fornecedores:'buildSuppliers',relatorios:'buildReports',ia:'buildAI',integracoes:'buildIntegrations',suporte:'buildSupport'};
const sources=`${app}\n${p2}\n${p3}\n${guard}\n${p4}`;
const checks=[];
const check=(name,fn)=>{try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}};

check('menu possui exatamente 16 módulos',()=>{const found=[...html.matchAll(/data-page="([a-z0-9_-]+)"/g)].map(m=>m[1]);assert.equal(found.length,16);assert.deepEqual([...new Set(found)].sort(),[...pages].sort())});
for(const page of pages){
 check(`título registrado: ${page}`,()=>assert.match(app,new RegExp(`\\b${page}:\\[`)));
 check(`nav única: ${page}`,()=>assert.equal((html.match(new RegExp(`data-page="${page}"`,'g'))||[]).length,1));
 if(page!=='dashboard')check(`builder/tela: ${page}`,()=>assert.match(sources,new RegExp(`function ${builders[page]}\\(`)));
}
check('dashboard estático presente',()=>assert.match(html,/id="page-dashboard"/));
check('roteamento usa hash conhecido',()=>{assert.match(app,/window\.location\.hash/);assert.match(app,/isKnownPage/)});
check('fallback contra módulo vazio presente',()=>assert.match(p2,/Falha de montagem detectada/));
check('phase2 preserva openPage anterior',()=>assert.match(p2,/const oldOpenPage=window\.openPage/));
check('phase3 preserva openPage anterior',()=>assert.match(p3,/const oldOpenPage=window\.openPage/));
check('guard de navegação carregado antes da fase4',()=>assert.match(html,/avare-nav-guard\.js" defer><\/script>\s*<script src="phase4\.js"/));

const literalTargets=[];
for(const m of html.matchAll(/data-go="([a-z0-9_-]+)"/g))literalTargets.push(m[1]);
for(const m of sources.matchAll(/openPage\??\.??\('([a-z0-9_-]+)'/g))literalTargets.push(m[1]);
for(const target of literalTargets)check(`destino válido: ${target}`,()=>assert.ok(pages.includes(target),`destino desconhecido ${target}`));

check('Estoque integra Suprimentos sem criar 17º módulo',()=>{assert.match(p4,/p4SupplyPanel/);assert.doesNotMatch(html,/data-page="suprimentos"/)});
check('Backup integra Suporte sem criar módulo paralelo',()=>{assert.match(p4,/p4BackupPanel/);assert.doesNotMatch(html,/data-page="backup"/)});
check('Relatório diário integra Relatórios',()=>assert.match(p4,/p4DailyReport/));
check('alerta de estoque abre Estoque',()=>assert.match(p4,/go-stock.*openPage\?\.\('estoque'/s));
check('Delivery Pro permanece subárea do módulo Delivery',()=>{assert.match(guard,/phase9\.js/);assert.doesNotMatch(html,/data-page="entregador"/)});
check('NEXO Intelligence permanece dentro de IA/Suporte/Dashboard',()=>{assert.match(guard,/phase10\.js/);assert.doesNotMatch(html,/data-page="intelligence"/);assert.doesNotMatch(html,/data-page="agent"/)});

let failed=0;
for(const [name,ok,msg] of checks){if(ok)console.log(`PASS  ${name}`);else{failed++;console.error(`FAIL  ${name}: ${msg}`)}}
console.log(`\nResultado 16 módulos: ${checks.length-failed}/${checks.length} verificações PASS`);
if(failed)process.exit(1);

await import('./phase9_delivery_regression.mjs');
await import('./phase10_intelligence_regression.mjs');
