import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [html,js,css]=await Promise.all([
  readFile(new URL('../ui/index.html',import.meta.url),'utf8'),
  readFile(new URL('../ui/app.js',import.meta.url),'utf8'),
  readFile(new URL('../ui/styles.css',import.meta.url),'utf8')
]);

const checks=[];
function check(name,fn){
  try{fn();checks.push([name,true])}
  catch(error){checks.push([name,false,error.message])}
}

check('CSP default-src self',()=>assert.match(html,/default-src 'self'/));
check('CSP script-src self',()=>assert.match(html,/script-src 'self'/));
check('CSP style-src self',()=>assert.match(html,/style-src 'self'/));
check('CSP sem rede no protótipo',()=>assert.match(html,/connect-src 'none'/));
check('CSP bloqueia object',()=>assert.match(html,/object-src 'none'/));
check('sem script inline',()=>assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i));
check('sem style inline',()=>assert.doesNotMatch(html,/\sstyle\s*=/i));
check('sem handlers HTML inline',()=>assert.doesNotMatch(html,/\son(?:click|change|submit|load|error|input|keydown|keyup)\s*=/i));
check('todo button declara type',()=>assert.doesNotMatch(html,/<button(?![^>]*\btype=)[^>]*>/i));
check('command palette é diálogo modal',()=>assert.match(html,/role="dialog"[^>]*aria-modal="true"/));
check('navegação possui aria-current inicial',()=>assert.match(html,/data-page="dashboard"[^>]*aria-current="page"/));
check('sem innerHTML no JavaScript',()=>assert.doesNotMatch(js,/\.innerHTML\s*=/));
check('sem eval',()=>assert.doesNotMatch(js,/\beval\s*\(/));
check('sem new Function',()=>assert.doesNotMatch(js,/new\s+Function\s*\(/));
check('sem document.write',()=>assert.doesNotMatch(js,/document\.write\s*\(/));
check('event delegation presente',()=>assert.match(js,/document\.addEventListener\('click'/));
check('busca normaliza acentos',()=>assert.match(js,/normalize\('NFD'\)/));
check('focus-visible presente',()=>assert.match(css,/:focus-visible/));
check('reduced-motion presente',()=>assert.match(css,/prefers-reduced-motion:reduce/));
check('menu compacto não usa marcador genérico',()=>assert.doesNotMatch(css,/content:\s*["']•["']/));
check('sem URLs remotas na UI',()=>assert.doesNotMatch(`${html}\n${css}\n${js}`,/https?:\/\//i));

const requiredPages=['dashboard','pdv','pedidos','produtos','estoque','compras','caixa','recebimentos','financeiro','delivery','clientes','fornecedores','relatorios','ia','integracoes','suporte'];
for(const page of requiredPages){
  check(`módulo ${page} presente`,()=>assert.match(html,new RegExp(`data-page="${page}"`)));
}

let failed=0;
for(const [name,ok,message] of checks){
  if(ok)console.log(`PASS  ${name}`);
  else{failed++;console.error(`FAIL  ${name}: ${message}`)}
}
console.log(`\nResultado: ${checks.length-failed}/${checks.length} verificações PASS`);
if(failed)process.exit(1);
