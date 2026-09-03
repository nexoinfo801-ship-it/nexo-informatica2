import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,p4,css,contract,schema]=await Promise.all([
 readFile(new URL('../ui/index.html',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase4.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase4.css',import.meta.url),'utf8'),
 readFile(new URL('../docs/CONTRATO_PRIVADO_SQLITE_IPC_CEP_9.8.md',import.meta.url),'utf8'),
 readFile(new URL('../db/9_8_lab_domain_schema.sql',import.meta.url),'utf8')
]);

const checks=[];
const check=(name,fn)=>{try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}};

check('phase4 carregado por último',()=>assert.match(html,/avare-nav-guard\.js" defer><\/script>\s*<script src="phase4\.js" defer><\/script>/));
check('phase4 CSS local/self',()=>assert.match(p4,/link\.href='phase4\.css'/));
check('phase4 sem innerHTML',()=>assert.doesNotMatch(p4,/\.innerHTML\s*=/));
check('phase4 sem insertAdjacentHTML',()=>assert.doesNotMatch(p4,/insertAdjacentHTML\s*\(/));
check('phase4 sem eval',()=>assert.doesNotMatch(p4,/\beval\s*\(/));
check('phase4 sem new Function',()=>assert.doesNotMatch(p4,/new\s+Function\s*\(/));
check('phase4 sem document.write',()=>assert.doesNotMatch(p4,/document\.write\s*\(/));
check('phase4 sem URL remota',()=>assert.doesNotMatch(`${p4}\n${css}`,/https?:\/\//i));
check('Suprimentos explícito no Estoque',()=>assert.match(p4,/Suprimentos e Reposição/));
check('disponível = físico - reservado',()=>assert.match(p4,/item\.physical-item\.reserved/));
check('alerta baixo usa disponível <= mínimo',()=>assert.match(p4,/available\(item\)<=item\.min/));
check('alerta crítico usa estoque de segurança',()=>assert.match(p4,/available\(item\)<=item\.safety/));
check('projetado considera estoque em trânsito',()=>assert.match(p4,/available\(item\)\+item\.onOrder/));
check('sugestão só abre para item no mínimo',()=>assert.match(p4,/available\(item\)<=item\.min\?Math\.max\(0,item\.max-projected\(item\)\):0/));
check('alerta global possui role alert',()=>assert.match(p4,/setAttribute\('role','alert'\)/));
check('rascunho de suprimento não grava compra real',()=>assert.match(p4,/Nada foi gravado/));
check('backup diário possui catch-up',()=>assert.match(p4,/Catch-up/));
check('backup exige quick_check e SHA-256',()=>{assert.match(p4,/quick_check/);assert.match(p4,/SHA-256/)});
check('backup público não cria arquivo real',()=>assert.match(p4,/Nenhum arquivo real foi alterado/));
check('histórico de backup presente',()=>assert.match(p4,/backupHistory/));
check('relatório diário completo presente',()=>assert.match(p4,/Relatório Diário Completo/));
for(const term of ['Vendas e produtos','Movimentações de estoque','Financeiro','Caixa físico','Formas de pagamento','Cancelamentos'])check(`relatório contém ${term}`,()=>assert.match(p4,new RegExp(term)));
check('formas de pagamento reconciliam com vendas',()=>assert.match(p4,/paymentTotal-dailyReport\.sales\.total/));
check('divergência pode bloquear fechamento',()=>assert.match(p4,/Fechamento deve ser bloqueado/));
check('contrato IPC valida senderFrame',()=>assert.match(contract,/senderFrame/));
check('contrato não expõe ipcRenderer genérico',()=>assert.match(contract,/não expõe `ipcRenderer` genérico/));
check('contrato prevê Online Backup API ou VACUUM INTO',()=>assert.match(contract,/Online Backup API ou `VACUUM INTO`/));
check('contrato define backup diário e catch-up',()=>assert.match(contract,/um backup automático por dia local/));
check('contrato CEP mantém número manual',()=>assert.match(contract,/número e complemento permanecem campos informados\/confirmados pelo usuário/));
check('contrato relatório possui reconciliationIssue',()=>assert.match(contract,/reconciliationIssue/));
check('schema cria política de reposição',()=>assert.match(schema,/CREATE TABLE IF NOT EXISTS stock_replenishment_policy/));
check('schema cria alertas',()=>assert.match(schema,/CREATE TABLE IF NOT EXISTS stock_alert_event/));
check('schema cria histórico de backup',()=>assert.match(schema,/CREATE TABLE IF NOT EXISTS backup_history/));
check('schema cria snapshots diários',()=>assert.match(schema,/CREATE TABLE IF NOT EXISTS daily_report_snapshot/));
check('schema impede múltiplo backup automático válido por dia',()=>assert.match(schema,/idx_backup_one_scheduled_per_day/));
check('layout phase4 responsivo',()=>assert.match(css,/@media\(max-width:650px\)/));

let failed=0;
for(const [name,ok,msg] of checks){if(ok)console.log(`PASS  ${name}`);else{failed++;console.error(`FAIL  ${name}: ${msg}`)}}
console.log(`\nResultado Phase 4: ${checks.length-failed}/${checks.length} verificações PASS`);
if(failed)process.exit(1);
