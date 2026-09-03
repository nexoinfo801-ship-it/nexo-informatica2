import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [data,sql,guard]=await Promise.all([
  readFile(new URL('../ui/avare-data.js',import.meta.url),'utf8'),
  readFile(new URL('../db/avare_public_seed.sql',import.meta.url),'utf8'),
  readFile(new URL('../ui/avare-nav-guard.js',import.meta.url),'utf8')
]);

const ids=text=>[...text.matchAll(/['"](AV-(?:EMB|MER|CAR|ENT|GAS)-\d{3})['"]/g)].map(m=>m[1]);
const dataIds=[...new Set(ids(data))].sort();
const sqlIds=[...new Set(ids(sql))].sort();

assert.equal(dataIds.length,26,'A camada pública deve ter 26 candidatos únicos');
assert.equal(sqlIds.length,26,'O seed SQL deve ter os mesmos 26 candidatos');
assert.deepEqual(sqlIds,dataIds,'IDs do seed SQL e da UI precisam ser idênticos');

for(const [category,count] of [['embalagens',6],['supermercado',6],['carnes',5],['entrega',5],['gas',4]]){
  const matches=[...data.matchAll(new RegExp(`category:'${category}'`,'g'))];
  assert.equal(matches.length,count,`Categoria ${category} deve ter ${count} candidatos`);
}

assert.match(data,/name:'RR EXPRESS'/);
assert.match(data,/R\. Acre, 1951 - Centro, Avaré - SP, 18700-260/);
assert.doesNotMatch(data,/Entregas RR/);
assert.doesNotMatch(data,/R\. Acre, 1951 - Santana/);
assert.match(sql,/'AV-ENT-002','entrega','RR EXPRESS','R\. Acre, 1951 - Centro/);

assert.match(guard,/data-p3-action="ia-local"/);
assert.match(guard,/action\.dataset\.p3Action='ia-go'/);
assert.match(guard,/action\.dataset\.value='delivery'/);

console.log('PASS  base Avaré: 26/26 candidatos alinhados UI ↔ SQL');
console.log('PASS  RR EXPRESS corrigido para Rua Acre, 1951 - Centro');
console.log('PASS  insight de entrega local redirecionado para Delivery');
