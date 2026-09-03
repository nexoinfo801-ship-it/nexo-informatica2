(()=>{
'use strict';

const pages=new Set(['relatorios','ia','integracoes','suporte']);
const oldOpenPage=window.openPage;
const data=window.NEXO_AVARE_PUBLIC_DATA||{municipality:{},supplierCandidates:[],numberRangeExamples:[],postalStrategy:{}};
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmt=v=>brl.format(v);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const n=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const btn=(text,className,action,value)=>{const el=n('button',className,text);el.type='button';if(action)el.dataset.p3Action=action;if(value!==undefined)el.dataset.value=String(value);return el};
const pill=(text,tone='neutral')=>n('span',`pill ${tone}`,text);
const metric=(label,value,detail,tone='blue')=>{const el=n('article',`module-metric ${tone}`);el.append(n('span','module-metric-label',label),n('strong','module-metric-value',value),n('small','module-metric-detail',detail));return el};
const section=key=>{const el=n('section','page module-page phase3-page');el.id=`page-${key}`;el.dataset.modulePage=key;el.setAttribute('aria-labelledby','pageTitle');return el};
const notice=text=>{const el=n('div','demo-notice');el.append(pill('LAB','blue-pill'),n('span','',text));return el};
const panelHead=(title,subtitle,side)=>{const head=n('div','panel-head');const text=n('div');text.append(n('h2','',title),n('p','',subtitle));head.append(text);if(side)head.append(side);return head};
const announce=message=>{const live=document.getElementById('liveRegion');if(live)live.textContent=message};

let localSupplierFilter='todos';
let localSupplierQuery='';

function ensureStyles(){
 if(document.querySelector('link[data-phase3-css]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href='phase3.css';link.dataset.phase3Css='true';document.head.append(link);
}

function buildReports(){
 const s=section('relatorios');s.append(notice('Pré-visualizações demonstrativas. Exportações reais serão geradas somente no Electron privado com trilha de auditoria.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Faturamento 30d',fmt(286420.7),'+8,4%','blue'),metric('Recebido 30d',fmt(268914.3),'93,9% do faturado','green'),metric('Margem','28,4%','Após custos','purple'),metric('Pendências',fmt(17506.4),'Conciliação + recebíveis','amber'));s.append(metrics);
 const grid=n('div','p3-report-grid');
 [
  ['Vendas e margem','Receita, descontos, CMV, margem e ticket médio','VENDAS'],
  ['Recebimentos 360','Liquidados, cartões, repasses, fiado e aging','RECEBIMENTOS'],
  ['Estoque e giro','Físico, reservado, mínimo, cobertura e ruptura','ESTOQUE'],
  ['Compras e fornecedores','Lead time, preço, divergências e desempenho','COMPRAS'],
  ['Caixa e financeiro','Fundo, sangrias, contas, fluxo e DRE','FINANCEIRO'],
  ['Clientes e retenção','Recência, frequência, valor, crédito e risco','CLIENTES']
 ].forEach(([title,desc,code])=>{const card=n('article','panel p3-report-card');card.append(pill(code,'neutral'),n('h2','',title),n('p','',desc),btn('Gerar prévia LAB','ghost p3-wide','report-preview',code));grid.append(card)});s.append(grid);
 const result=n('article','panel p3-result-panel');result.id='p3ReportResult';result.append(panelHead('Prévia de relatório','Selecione um relatório acima',pill('Sem exportar','neutral')),n('p','p3-result-text','Nenhum relatório gerado nesta sessão.'));s.append(result);return s;
}

function buildAI(){
 const s=section('ia');s.append(notice('NEXO IA recomenda e prepara ações; movimentações de estoque, financeiro, compras ou pedidos exigem confirmação humana.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Insights ativos','7','4 operacionais','purple'),metric('Risco de ruptura','2 itens','Próximos 3 dias','red'),metric('Recebimentos','2 pendências',fmt(3152.5),'amber'),metric('Oportunidade','+3,1 p.p.','Margem potencial','green'));s.append(metrics);
 const grid=n('div','p3-ai-grid');
 const insights=[
  ['Reposição','Queijo mussarela e embalagens devem atingir nível crítico.','Preparar compra','danger','ia-prepare','compras'],
  ['Recebimentos','Cartões e marketplace ainda não foram liquidados.','Abrir Recebimentos 360','warn','ia-go','recebimentos'],
  ['Margem','Combo NEXO tem espaço para revisão de preço/custo.','Abrir Produtos','purple','ia-go','produtos'],
  ['Clientes','Segmento “Em risco” merece campanha de retenção.','Abrir Clientes','blue-pill','ia-go','clientes'],
  ['Entrega local','Existem operadores candidatos em Avaré para comparação de SLA.','Comparar entregas','neutral','ia-local','entrega']
 ];
 insights.forEach(([title,text,action,tone,act,value])=>{const card=n('article','panel p3-insight-card');card.append(pill(title,tone),n('h2','',title),n('p','',text),btn(action,'ghost p3-wide',act,value));grid.append(card)});s.append(grid);
 const result=n('div','p3-ai-result');result.id='p3AiResult';result.setAttribute('aria-live','polite');result.textContent='Nenhuma ação preparada.';s.append(result);return s;
}

function buildIntegrations(){
 const s=section('integracoes');s.append(notice('A camada pública não faz chamadas de rede. O Electron privado fará consultas HTTPS com allowlist, timeout, validação e cache.'));
 const m=data.municipality||{};const suppliers=data.supplierCandidates||[];
 const metrics=n('div','module-metrics');metrics.append(metric('Cidade base',`${m.city||'Avaré'} / ${m.state||'SP'}`,`IBGE ${m.ibge||'3504503'}`,'blue'),metric('Faixa CEP',`${m.cepStart||'18700-001'}`,`até ${m.cepEnd||'18709-999'}`,'green'),metric('CEPs reportados',String(m.reportedCepCount||1524),'Referência pública; cache sob demanda','purple'),metric('Candidatos locais',String(suppliers.length),'Não homologados','amber'));s.append(metrics);
 const grid=n('div','module-grid two');
 const connectors=n('article','panel');connectors.append(panelHead('Conectores planejados','Estado da integração no LAB',pill('Privado depois','neutral')));
 const list=n('div','p3-connector-list');[
  ['ViaCEP','Consulta por CEP','Planejado','blue-pill'],
  ['BrasilAPI','Fallback de CEP','Planejado','neutral'],
  ['Correios DNE / API autorizada','Carga/validação postal oficial','Opcional','warn'],
  ['Central NEXO','Licença, suporte e releases','Privado','purple'],
  ['Fiscal / TEF / marketplaces','Somente com credenciais e homologação','Externo','warn']
 ].forEach(([name,desc,status,tone])=>{const row=n('div','p3-connector-row');const text=n('div');text.append(n('strong','',name),n('span','',desc));row.append(text,pill(status,tone));list.append(row)});connectors.append(list);
 const postal=n('article','panel');postal.append(panelHead('Endereço Avaré','Modelo seguro de preenchimento',pill('CEP + confirmação','ok')));
 const policy=n('ol','p3-policy');[
  'Usuário informa o CEP.',
  'Processo principal consulta provider HTTPS e valida Avaré/SP quando aplicável.',
  'Logradouro e bairro são sugeridos e armazenados em cache local.',
  'Número e complemento são sempre informados/confirmados pelo usuário.',
  'Faixa de numeração serve apenas para detectar inconsistência; nunca identifica automaticamente um imóvel.'
 ].forEach(x=>policy.append(n('li','',x)));postal.append(policy);grid.append(connectors,postal);s.append(grid);
 const ranges=n('article','panel');ranges.append(panelHead('Exemplos de faixas postais','Casos em que a mesma rua possui CEP diferente por numeração',pill('Avaré','blue-pill')));const root=n('div','p3-range-list');(data.numberRangeExamples||[]).forEach(r=>{const row=n('div','p3-range-row');row.append(n('strong','',r.street),n('span','',r.cep),n('span','',r.neighborhood),n('b','',r.range));root.append(row)});ranges.append(root);s.append(ranges);return s;
}

function buildSupport(){
 const s=section('suporte');s.append(notice('Licença, suporte e conectividade são estados independentes. Falha de internet não equivale a revogação.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Licença','ATIVA','Verificação assinada','green'),metric('Plano','Mensal','Renovação controlada','blue'),metric('Heartbeat','60 s','Configurável','purple'),metric('Suporte','Ativo','SLA demonstrativo','green'));s.append(metrics);
 const grid=n('div','module-grid two');
 const license=n('article','panel');license.append(panelHead('Estado da licença','Sem exibir chave ou segredo',pill('Assinada','ok')));
 const states=n('div','p3-state-list');[
  ['Licença local','Válida','ok'],['Último ACK','Hoje 14:42','ok'],['Internet','Disponível no cenário','blue-pill'],['Revogação','Não recebida','neutral'],['Máquina','LAB-01','neutral']
 ].forEach(([a,b,t])=>{const row=n('div','p3-state-row');row.append(n('span','',a),pill(b,t));states.append(row)});license.append(states,btn('Simular diagnóstico','primary p3-wide','support-diagnostic'));
 const support=n('article','panel');support.append(panelHead('Suporte 360','Chamados e diagnóstico seguro',pill('Sem segredos','blue-pill')));
 const tickets=n('div','p3-ticket-list');[
  ['NX-1042','Financeiro','Em análise','warn'],['NX-1038','Impressão','Respondido','ok'],['NX-1031','Licença','Concluído','ok']
 ].forEach(([id,cat,status,tone])=>{const row=n('div','p3-ticket-row');row.append(n('strong','',id),n('span','',cat),pill(status,tone));tickets.append(row)});support.append(tickets,btn('Novo chamado LAB','ghost p3-wide','support-ticket'));grid.append(license,support);s.append(grid);
 const result=n('p','lab-action-result');result.id='p3SupportResult';result.textContent='Nenhum diagnóstico gerado.';result.setAttribute('aria-live','polite');s.append(result);return s;
}

function categoryLabel(c){return({embalagens:'Embalagens',supermercado:'Supermercados',carnes:'Carnes',entrega:'Entregas',gas:'Gás'})[c]||c}
function categoryTone(c){return c==='embalagens'?'purple':c==='supermercado'?'green':c==='carnes'?'danger':c==='entrega'?'blue-pill':'warn'}

function appendLocalSupplierPanel(){
 const page=document.getElementById('page-fornecedores');if(!page||document.getElementById('p3LocalSuppliers'))return;
 const card=n('article','panel p3-local-panel');card.id='p3LocalSuppliers';
 const controls=n('div','stock-controls');const search=n('input','module-input compact');search.type='search';search.id='p3LocalSupplierSearch';search.placeholder='Buscar candidato local…';search.setAttribute('aria-label','Buscar fornecedor candidato em Avaré');controls.append(search);
 [['todos','Todos'],['embalagens','Embalagens'],['supermercado','Mercados'],['carnes','Carnes'],['gas','Gás']].forEach(([v,l])=>controls.append(btn(l,`filter-chip${v===localSupplierFilter?' active':''}`,'local-supplier-filter',v)));
 card.append(panelHead('Candidatos locais — Avaré','Pesquisa pública para cotação; nenhum está homologado automaticamente',controls));const root=n('div','p3-local-list');root.id='p3LocalSupplierRows';card.append(root);page.append(card);renderLocalSuppliers();
}

function appendDeliveryCandidates(){
 const page=document.getElementById('page-delivery');if(!page||document.getElementById('p3DeliveryCandidates'))return;
 const card=n('article','panel p3-local-panel');card.id='p3DeliveryCandidates';card.append(panelHead('Operadores candidatos em Avaré','Comparar cobertura, preço, SLA e contrato antes de habilitar',pill('Não homologados','warn')));const root=n('div','p3-local-list');
 (data.supplierCandidates||[]).filter(x=>x.category==='entrega').forEach(x=>{const row=n('div','p3-local-row');const text=n('div');text.append(n('strong','',x.name),n('span','',x.address));row.append(text,n('span','',x.phone||'Contato a validar'),pill('Candidato','blue-pill'));root.append(row)});card.append(root);page.append(card);
}

function renderLocalSuppliers(){
 const root=document.getElementById('p3LocalSupplierRows');if(!root)return;root.replaceChildren();const q=norm(localSupplierQuery);
 const visible=(data.supplierCandidates||[]).filter(x=>x.category!=='entrega'&&(localSupplierFilter==='todos'||x.category===localSupplierFilter)&&(!q||norm(`${x.name} ${x.address} ${x.category}`).includes(q)));
 visible.forEach(x=>{const row=n('div','p3-local-row');const text=n('div');text.append(n('strong','',x.name),n('span','',x.address));const contact=n('div','p3-local-contact');contact.append(n('span','',x.phone||'Contato a validar'),pill(categoryLabel(x.category),categoryTone(x.category)));row.append(text,contact,pill('Candidato','neutral'));root.append(row)});
 if(!visible.length)root.append(n('div','empty-state','Nenhum candidato corresponde ao filtro.'));announce(`${visible.length} fornecedor(es) candidato(s) exibido(s).`);
}

function buildAll(){
 ensureStyles();const placeholder=document.getElementById('page-placeholder');const parent=placeholder?.parentNode;if(!parent)return;
 [buildReports(),buildAI(),buildIntegrations(),buildSupport()].forEach(s=>parent.insertBefore(s,placeholder));appendLocalSupplierPanel();appendDeliveryCandidates();
}

window.openPage=function(key,opts={}){
 const result=oldOpenPage(key,opts);document.querySelectorAll('.phase3-page').forEach(page=>page.classList.remove('active'));
 if(pages.has(key)){
   document.getElementById('page-placeholder')?.classList.remove('active');
   document.getElementById(`page-${key}`)?.classList.add('active');
 }
 return result;
};

document.addEventListener('click',event=>{
 const target=event.target.closest('[data-p3-action]');if(!target)return;const action=target.dataset.p3Action;const value=target.dataset.value;
 if(action==='local-supplier-filter'){localSupplierFilter=value;document.querySelectorAll('[data-p3-action="local-supplier-filter"]').forEach(b=>b.classList.toggle('active',b.dataset.value===value));renderLocalSuppliers()}
 else if(action==='report-preview'){const result=document.getElementById('p3ReportResult');const text=result?.querySelector('.p3-result-text');if(text){text.textContent=`Prévia ${value}: período 30 dias • dados demonstrativos • nenhuma exportação criada.`;announce(`Prévia do relatório ${value} gerada no LAB.`)}}
 else if(action==='ia-go'){window.openPage(value,{focusHeading:true})}
 else if(action==='ia-local'){window.openPage('fornecedores',{focusHeading:true});localSupplierFilter=value==='entrega'?'todos':localSupplierFilter;announce('Base local de candidatos aberta para comparação.')}
 else if(action==='ia-prepare'){const el=document.getElementById('p3AiResult');if(el){el.textContent='Rascunho preparado: revisar estoque, fornecedor, quantidade, preço e aprovação antes de criar qualquer compra real.';el.dataset.tone='warn'}announce('Rascunho de compra preparado, sem persistência.')}
 else if(action==='support-diagnostic'){const el=document.getElementById('p3SupportResult');if(el){el.textContent='Diagnóstico LAB: banco demonstrativo OK • licença ativa • backup referencial OK • nenhum segredo incluído.';el.dataset.tone='ok'}announce('Diagnóstico demonstrativo gerado.')}
 else if(action==='support-ticket'){const el=document.getElementById('p3SupportResult');if(el){el.textContent='Chamado LAB preparado. Envio real depende do gateway privado HTTPS.';el.dataset.tone='neutral'}announce('Chamado demonstrativo preparado.')}
});

document.addEventListener('input',event=>{if(event.target.id==='p3LocalSupplierSearch'){localSupplierQuery=event.target.value;renderLocalSuppliers()}});

buildAll();
const current=window.location.hash.slice(1);if(pages.has(current))window.openPage(current,{syncHash:false});
})();