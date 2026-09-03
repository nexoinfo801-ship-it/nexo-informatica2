import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,p5,css,schema,doc,p0]=await Promise.all([
  readFile(new URL('../ui/index.html',import.meta.url),'utf8'),
  readFile(new URL('../ui/phase5.js',import.meta.url),'utf8'),
  readFile(new URL('../ui/phase5.css',import.meta.url),'utf8'),
  readFile(new URL('../db/9_8_restaurant_domain_schema.sql',import.meta.url),'utf8'),
  readFile(new URL('../docs/FASE5_RESTAURANTE_MARMITARIA_9.8.md',import.meta.url),'utf8'),
  readFile(new URL('../docs/P0_INSTALADOR_R3_COUNT.md',import.meta.url),'utf8')
]);

const checks=[];
const check=(name,fn)=>{try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}};

check('phase5 carregado depois da phase4',()=>assert.match(html,/phase4\.js" defer><\/script>\s*<script src="phase5\.js" defer><\/script>/));
check('phase5 CSS local/self',()=>assert.match(p5,/link\.href='phase5\.css'/));
for(const [name,re] of [
 ['sem innerHTML',/\.innerHTML\s*=/],['sem insertAdjacentHTML',/insertAdjacentHTML\s*\(/],['sem eval',/\beval\s*\(/],['sem new Function',/new\s+Function\s*\(/],['sem document.write',/document\.write\s*\(/],['sem URL remota',/https?:\/\//i]
]) check(`phase5 ${name}`,()=>assert.doesNotMatch(p5,re));

check('não cria novos módulos top-level',()=>assert.equal((html.match(/class="nav-item/g)||[]).length,16));
check('Salão está dentro de Pedidos',()=>{assert.match(p5,/appendRestaurantOperations/);assert.match(p5,/page-pedidos/)});
check('abas Restaurante presentes',()=>{for(const term of ['Salão','Garçom Mobile','Cozinha KDS','Bar','Impressão','Cardápio Temático'])assert.match(p5,new RegExp(term))});
check('fluxo de mesa completo',()=>{for(const s of ['FREE','OCCUPIED','ORDER_SENT','PREPARING','READY','SERVING','CLOSING'])assert.match(p5,new RegExp(s))});
check('roteamento Cozinha/Bar',()=>{assert.match(p5,/sector:'KITCHEN'/);assert.match(p5,/sector:'BAR'/)});
check('KDS possui ciclo operacional',()=>{for(const s of ['NEW','ACCEPTED','PREPARING','READY','DELIVERED'])assert.match(p5,new RegExp(s))});
check('tickets entregues levam mesa a Servindo',()=>assert.match(p5,/every\(t=>t\.status==='DELIVERED'\)\)table\.status='SERVING'/));
check('envio garçom cria tickets separados',()=>{assert.match(p5,/K-212/);assert.match(p5,/B-091/);assert.match(p5,/roteado para Cozinha e Bar/)});
check('pedido garçom é idempotente na sessão',()=>assert.match(p5,/if\(waiterOrderSent\)return/));
check('modificadores têm mínimo e máximo',()=>{assert.match(p5,/min:1,max:1/);assert.match(p5,/min:1,max:3/)});
check('modificadores bloqueiam acima do máximo',()=>assert.match(p5,/modifierCount\(group\)>=group\.max/));
check('envio valida mínimo/máximo',()=>{assert.match(p5,/function validateModifierSelection/);assert.match(p5,/const validation=validateModifierSelection\(\)/)});
check('modificadores possuem cota grátis',()=>assert.match(p5,/freeQuota/));
check('modificadores suportam adicional/substituição',()=>{assert.match(p5,/Carne adicional/);assert.match(p5,/Trocar ovo por carne/);assert.match(schema,/can_substitute/)});
check('impressoras por quatro destinos',()=>{for(const x of ['CAIXA','COZINHA','BAR','EXPEDIÇÃO'])assert.match(p5,new RegExp(x))});
check('impressora não finge teste físico',()=>{assert.match(p5,/CAIXA'.*state:'CONFIGURED'/);assert.match(p5,/teste físico ainda pendente/)});
check('fila de impressão alvo não perde falha silenciosa',()=>assert.match(p5,/QUEUED → PRINTING → PRINTED \/ FAILED/));
check('cardápio temático com preço fixo',()=>{assert.match(p5,/Almoço Mexicano/);assert.match(doc,/preço fixo/)});
check('Ficha Técnica em Produtos',()=>{assert.match(p5,/Ficha Técnica \/ Composição/);assert.match(p5,/page-produtos/)});
check('Margem e Markup separados',()=>{assert.match(p5,/Margem sobre venda/);assert.match(p5,/Markup sobre custo/);assert.match(doc,/margem 33,33%, markup 50%/)});
check('Perdas em Estoque',()=>{assert.match(p5,/Perdas e Desperdício/);assert.match(p5,/page-estoque/)});
check('Perdas possuem custo e responsável',()=>{assert.match(p5,/unitCost/);assert.match(p5,/responsible/)});
check('Relatório estendido inclui cozinha/bar/delivery',()=>{for(const x of ['Cozinha','Bar','Delivery','Perdas','Conferência'])assert.match(p5,new RegExp(x))});
check('Integrações usam maturidade explícita',()=>{for(const s of ['IMPLEMENTED','CONFIGURED','TESTED','HOMOLOGATED','NOT_CONFIGURED'])assert.match(p5,new RegExp(s))});
check('backup não é marcado Testado só por regressão estática',()=>assert.match(p5,/Backup diário'.*state:'IMPLEMENTED'/));
check('nenhuma operação pública persiste dados reais',()=>assert.match(doc,/nenhuma venda\/comanda é persistida/));

const requiredTables=['restaurant_table','restaurant_order','restaurant_order_item','product_modifier_group','product_modifier_option','restaurant_order_item_modifier','production_ticket','printer_route','print_job','product_recipe','product_recipe_item','loss_event','thematic_menu_event','thematic_menu_product','restaurant_operation_audit'];
for(const table of requiredTables)check(`schema cria ${table}`,()=>assert.match(schema,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)));
check('schema limita setores de preparo',()=>assert.match(schema,/production_sector IN \('KITCHEN','BAR','EXPEDITION','NONE'\)/));
check('schema limita destino de impressora',()=>assert.match(schema,/destination IN \('CASHIER','KITCHEN','BAR','EXPEDITION'\)/));
check('schema possui auditoria before/after',()=>{assert.match(schema,/before_json/);assert.match(schema,/after_json/);assert.match(schema,/actor_user_id/)});
check('P0 Count não está falsamente corrigido',()=>{assert.match(p0,/BLOQUEANTE DE HOMOLOGAÇÃO WINDOWS/);assert.match(p0,/não afirma que o defeito foi corrigido/i)});
check('P0 exige teste Windows 10 e 11',()=>{assert.match(p0,/Windows 10 x64/);assert.match(p0,/Windows 11 x64/)});
check('layout phase5 responsivo',()=>{assert.match(css,/@media\(max-width:850px\)/);assert.match(css,/@media\(max-width:560px\)/)});

let failed=0;
for(const [name,ok,msg] of checks){if(ok)console.log(`PASS  ${name}`);else{failed++;console.error(`FAIL  ${name}: ${msg}`)}}
console.log(`\nResultado Phase 5: ${checks.length-failed}/${checks.length} verificações PASS`);
if(failed)process.exit(1);
