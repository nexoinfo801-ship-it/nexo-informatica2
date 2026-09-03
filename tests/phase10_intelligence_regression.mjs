import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [ui,css,schema,seed]=await Promise.all([
 readFile(new URL('../ui/phase10.js',import.meta.url),'utf8'),
 readFile(new URL('../ui/phase10.css',import.meta.url),'utf8'),
 readFile(new URL('../db/9_8_intelligence_central_schema.sql',import.meta.url),'utf8'),
 readFile(new URL('../db/9_8_intelligence_central_seed.sql',import.meta.url),'utf8')
]);
const checks=[];const check=(name,fn)=>{try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}};
check('phase10 sem innerHTML',()=>assert.doesNotMatch(ui,/innerHTML/));
check('phase10 sem eval/new Function',()=>{assert.doesNotMatch(ui,/\beval\s*\(/);assert.doesNotMatch(ui,/new Function/)});
check('phase10 sem URL remota',()=>assert.doesNotMatch(ui,/https?:\/\//));
check('NEXO Intelligence presente',()=>assert.match(ui,/NEXO Intelligence/));
check('Agent presente em suporte',()=>assert.match(ui,/NEXO Agent/));
check('IA declara que não executa regra crítica',()=>assert.match(ui,/IA não executa regra crítica/));
check('fluxo IA inclui autorização',()=>assert.match(ui,/PEDIR AUTORIZAÇÃO/));
check('recomendação exige revisão humana',()=>assert.match(ui,/Solicitar revisão humana/));
check('telemetria é minimizada',()=>assert.match(ui,/Agregadas\/minimizadas/));
check('falha internet não vira revogação',()=>assert.match(ui,/Falha de internet não equivale a revogação/));
check('schema cria tenant e licença',()=>{assert.match(schema,/CREATE TABLE IF NOT EXISTS nexo_tenant/);assert.match(schema,/CREATE TABLE IF NOT EXISTS nexo_license\s*\(/)});
check('schema cria heartbeat e usage agregado',()=>{assert.match(schema,/nexo_agent_heartbeat/);assert.match(schema,/nexo_usage_daily/)});
check('schema cria backup e restore test',()=>{assert.match(schema,/nexo_backup_remote_record/);assert.match(schema,/nexo_backup_restore_test/)});
check('schema cria suporte e update',()=>{assert.match(schema,/nexo_support_ticket_central/);assert.match(schema,/nexo_update_deployment/)});
check('schema IA separado de licença',()=>{const ai=schema.match(/CREATE TABLE IF NOT EXISTS nexo_ai_recommendation[\s\S]*?;\n/)?.[0]||'';assert.doesNotMatch(ai,/UPDATE\s+nexo_license/i);assert.match(ai,/requires_human_approval/)});
check('uso diário não possui cliente final',()=>{const usage=schema.match(/CREATE TABLE IF NOT EXISTS nexo_usage_daily[\s\S]*?;\n/)?.[0]||'';assert.doesNotMatch(usage,/customer|phone|address|order_item|sale_value/i)});
check('backup exige SHA-256 de 64',()=>assert.match(schema,/length\(sha256\)=64/));
check('planos suportam ciclos definidos',()=>assert.match(schema,/TRIAL','MONTHLY','QUARTERLY','SEMIANNUAL','ANNUAL','LIFETIME/));
check('usage score possui quatro faixas',()=>assert.match(schema,/HIGH','MEDIUM','LOW','INACTIVE/));
check('seed é explicitamente DEMO',()=>assert.match(seed,/dados DEMO sem PII real/));
check('seed não contém email ou telefone',()=>assert.doesNotMatch(seed,/@|\+55|\(14\)/));
check('layout phase10 responsivo',()=>{assert.match(css,/@media\(max-width:900px\)/);assert.match(css,/@media\(max-width:560px\)/)});
let failed=0;for(const [name,ok,msg] of checks){if(ok)console.log(`PASS  ${name}`);else{failed++;console.error(`FAIL  ${name}: ${msg}`)}}
console.log(`\nResultado Phase 10: ${checks.length-failed}/${checks.length} verificações PASS`);if(failed)process.exit(1);
