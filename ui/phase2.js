(()=>{
'use strict';

const phase2Pages=new Set(['pedidos','delivery','produtos','compras','fornecedores','caixa','clientes']);
const oldOpenPage=window.openPage;
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmt=value=>brl.format(value);
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const n=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const btn=(text,className,action,value)=>{const el=n('button',className,text);el.type='button';if(action)el.dataset.p2Action=action;if(value!==undefined)el.dataset.value=String(value);return el};
const pill=(text,tone='neutral')=>n('span',`pill ${tone}`,text);
const metric=(label,value,detail,tone='blue')=>{const el=n('article',`module-metric ${tone}`);el.append(n('span','module-metric-label',label),n('strong','module-metric-value',value),n('small','module-metric-detail',detail));return el};
const panelHead=(title,subtitle,side)=>{const head=n('div','panel-head');const txt=n('div');txt.append(n('h2','',title),n('p','',subtitle));head.append(txt);if(side)head.append(side);return head};
const section=key=>{const el=n('section','page module-page phase2-page');el.id=`page-${key}`;el.dataset.modulePage=key;el.setAttribute('aria-labelledby','pageTitle');return el};
const notice=text=>{const el=n('div','demo-notice');el.append(pill('LAB','blue-pill'),n('span','',text));return el};

const orderRows=[
{id:'P-1192',channel:'Balcão',customer:'Consumidor final',total:54.9,status:'novo',age:'2 min',priority:'normal'},
{id:'P-1191',channel:'Delivery',customer:'Cliente 104',total:93,status:'preparando',age:'8 min',priority:'alta'},
{id:'P-1190',channel:'Marketplace',customer:'Pedido externo',total:68.5,status:'preparando',age:'13 min',priority:'normal'},
{id:'P-1189',channel:'Balcão',customer:'Consumidor final',total:31,status:'pronto',age:'16 min',priority:'normal'},
{id:'P-1188',channel:'Delivery',customer:'Cliente 087',total:126.4,status:'saiu',age:'29 min',priority:'alta'},
{id:'P-1187',channel:'Marketplace',customer:'Pedido externo',total:84,status:'entregue',age:'41 min',priority:'normal'}
];
const deliveryRows=[
{id:'D-341',order:'P-1188',customer:'Cliente 087',zone:'Centro',driver:'Entregador A',eta:'11 min',status:'em_rota',value:126.4},
{id:'D-340',order:'P-1186',customer:'Cliente 063',zone:'Jardins',driver:'Entregador B',eta:'4 min',status:'chegando',value:77.2},
{id:'D-339',order:'P-1184',customer:'Cliente 052',zone:'Centro',driver:'Entregador A',eta:'—',status:'entregue',value:68.5},
{id:'D-338',order:'P-1182',customer:'Cliente 021',zone:'Zona Sul',driver:'Aguardando',eta:'—',status:'aguardando',value:109.9}
];
const productRows=[
{sku:'LANC-001',name:'X-Burger Especial',category:'Lanches',cost:13.4,price:29.9,stock:18,active:true},
{sku:'COMB-004',name:'Combo NEXO',category:'Combos',cost:20.1,price:42.5,stock:11,active:true},
{sku:'BEB-012',name:'Refrigerante 350ml',category:'Bebidas',cost:3.1,price:7,stock:64,active:true},
{sku:'POR-006',name:'Porção Fritas M',category:'Porções',cost:7.8,price:19.9,stock:9,active:true},
{sku:'BEB-021',name:'Suco Natural 500ml',category:'Bebidas',cost:5.2,price:12.5,stock:22,active:true},
{sku:'SOB-003',name:'Sobremesa da Casa',category:'Sobremesas',cost:6.6,price:14,stock:6,active:true}
];
const purchaseRows=[
{id:'C-0882',supplier:'Fornecedor Alpha',created:'Hoje 09:20',eta:'Amanhã',total:2840,status:'aprovada',items:12},
{id:'C-0881',supplier:'Distribuidora Sul',created:'Ontem 17:42',eta:'Hoje',total:1760.5,status:'transito',items:8},
{id:'C-0880',supplier:'Fornecedor Beta',created:'Ontem 14:10',eta:'03/09',total:3210,status:'rascunho',items:15},
{id:'C-0879',supplier:'Embalagens Prime',created:'01/09 11:05',eta:'Hoje',total:980,status:'recebida',items:5}
];
const supplierRows=[
{id:'F-01',name:'Fornecedor Alpha',category:'Frios e laticínios',lead:2,score:96,open:2840,last:'Hoje'},
{id:'F-02',name:'Distribuidora Sul',category:'Bebidas',lead:1,score:92,open:1760.5,last:'Ontem'},
{id:'F-03',name:'Fornecedor Beta',category:'Secos e mercearia',lead:4,score:84,open:3210,last:'Ontem'},
{id:'F-04',name:'Embalagens Prime',category:'Embalagens',lead:3,score:89,open:0,last:'01/09'}
];
const clientRows=[
{id:'CL-104',name:'Cliente 104',segment:'VIP',last:'Hoje',spent:4860.4,open:0,limit:800,orders:42},
{id:'CL-087',name:'Cliente 087',segment:'Recorrente',last:'Hoje',spent:2740.2,open:126.4,limit:500,orders:28},
{id:'CL-063',name:'Cliente 063',segment:'Recorrente',last:'Ontem',spent:1988.3,open:0,limit:300,orders:21},
{id:'CL-052',name:'Cliente 052',segment:'Em risco',last:'18 dias',spent:1542.9,open:231,limit:400,orders:17},
{id:'CL-021',name:'Cliente 021',segment:'Novo',last:'3 dias',spent:328.4,open:0,limit:200,orders:4}
];

let orderFilter='ativos';
let productFilter='todos';
let clientFilter='todos';
const cashState={opening:300,cashSales:3420,supplies:0,withdrawals:450,adjustments:0};

function ensureStyles(){
 if(document.querySelector('link[data-phase2-css]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href='phase2.css';link.dataset.phase2Css='true';document.head.append(link);
}

function buildOrders(){
 const s=section('pedidos');s.append(notice('Fila operacional demonstrativa. Mudanças de status permanecem somente na memória do LAB.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Pedidos ativos','5','2 delivery','blue'),metric('Em preparo','2','1 acima de 10 min','amber'),metric('Prontos','1','Aguardando retirada','green'),metric('Ticket médio',fmt(76.18),'Hoje','purple'));s.append(metrics);
 const card=n('article','panel');
 const filters=n('div','filter-row');[['ativos','Ativos'],['todos','Todos'],['atrasados','Atenção']].forEach(([v,l])=>filters.append(btn(l,`filter-chip${v===orderFilter?' active':''}`,'order-filter',v)));
 card.append(panelHead('Fila de pedidos','Status, canal, tempo e próxima ação',filters));
 const root=n('div','p2-table');root.id='p2OrderRows';card.append(root);s.append(card);return s;
}

function buildDelivery(){
 const s=section('delivery');s.append(notice('Mapa/rota não usa localização real nesta camada. A tela valida somente operação e SLA.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Em rota','2','1 chegando','blue'),metric('SLA médio','27 min','Meta 35 min','green'),metric('Aguardando coleta','1','Pedido pronto','amber'),metric('Taxa média',fmt(7.9),'Por entrega','purple'));s.append(metrics);
 const grid=n('div','module-grid two');
 const list=n('article','panel');list.append(panelHead('Entregas em andamento','Acompanhamento por pedido e região',pill('Operação local','neutral')));const root=n('div','data-list');root.id='p2DeliveryRows';list.append(root);
 const perf=n('article','panel');perf.append(panelHead('Desempenho por faixa','Últimas entregas demonstrativas',pill('Hoje','blue-pill')));
 const sla=n('div','p2-sla');[['Até 25 min','68%','pct-68','ok'],['26–35 min','24%','pct-24','warn'],['> 35 min','8%','pct-8','danger']].forEach(([label,value,pct,tone])=>{const row=n('div','aging-row');const top=n('div','aging-top');top.append(n('span','',label),n('strong',tone==='ok'?'ok-text':tone==='warn'?'warn-text':'danger-text',value));const track=n('div','progress-track');track.append(n('div',`progress-fill ${pct} ${tone}`));row.append(top,track);sla.append(row)});perf.append(sla);grid.append(list,perf);s.append(grid);return s;
}

function buildProducts(){
 const s=section('produtos');s.append(notice('Cadastro demonstrativo. Preço/custo não são alterados no ERP comercial nesta etapa.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Produtos ativos','842','96% do catálogo','blue'),metric('Margem média','48,6%','Base demonstrativa','green'),metric('Sem giro 30d','19','Revisar mix','amber'),metric('Margem baixa','7','Abaixo de 20%','red'));s.append(metrics);
 const card=n('article','panel');
 const controls=n('div','stock-controls');const search=n('input','module-input compact');search.type='search';search.id='p2ProductSearch';search.placeholder='Buscar produto ou SKU…';search.setAttribute('aria-label','Buscar no catálogo');controls.append(search);[['todos','Todos'],['margem','Margem baixa'],['estoque','Estoque baixo']].forEach(([v,l])=>controls.append(btn(l,`filter-chip${v===productFilter?' active':''}`,'product-filter',v)));
 card.append(panelHead('Catálogo e margem','Preço, custo, margem e estoque',controls));const root=n('div','p2-table');root.id='p2ProductRows';card.append(root);s.append(card);return s;
}

function buildPurchases(){
 const s=section('compras');s.append(notice('Aprovação e recebimento abaixo são simulações. Em trânsito nunca aumenta o estoque físico.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Compras abertas','3',fmt(7810.5),'blue'),metric('Em trânsito','1',fmt(1760.5),'purple'),metric('Chegam hoje','2','Conferência pendente','amber'),metric('Recebida hoje','1',fmt(980),'green'));s.append(metrics);
 const grid=n('div','module-grid two');
 const list=n('article','panel');list.append(panelHead('Ordens de compra','Status e previsão de recebimento',btn('Nova compra LAB','primary','purchase-new')));const root=n('div','data-list');root.id='p2PurchaseRows';list.append(root);
 const checklist=n('article','panel');checklist.append(panelHead('Recebimento seguro','Sequência recomendada',pill('4 etapas','neutral')));const steps=n('ol','p2-steps');['Conferir fornecedor e documento','Conferir quantidades e lotes','Registrar divergências antes da entrada','Só então efetivar estoque/custo em transação'].forEach(x=>steps.append(n('li','',x)));checklist.append(steps);grid.append(list,checklist);s.append(grid);return s;
}

function buildSuppliers(){
 const s=section('fornecedores');s.append(notice('Indicadores de fornecedor são fictícios e usados apenas para validar a experiência de compras.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Ativos','38','4 preferenciais','blue'),metric('Lead time médio','2,7 dias','Últimos 90 dias','green'),metric('Pontualidade','91%','Meta 95%','amber'),metric('Em aberto',fmt(7810.5),'3 fornecedores','purple'));s.append(metrics);
 const card=n('article','panel');card.append(panelHead('Desempenho de fornecedores','Prazo, score e compromissos em aberto',pill('Score 0–100','neutral')));const root=n('div','p2-table');root.id='p2SupplierRows';card.append(root);s.append(card);return s;
}

function buildCash(){
 const s=section('caixa');s.append(notice('Caixa físico é separado de cartões, marketplaces e recebíveis. Movimentos abaixo não persistem.'));
 const metrics=n('div','module-metrics');metrics.id='p2CashMetrics';s.append(metrics);
 const grid=n('div','module-grid two');
 const ops=n('article','panel');ops.append(panelHead('Operações de caixa','Somente dinheiro físico',pill('Aberto','ok')));
 const actions=n('div','p2-cash-actions');actions.append(btn('Suprimento + R$ 100','ghost','cash-supply',100),btn('Sangria − R$ 100','ghost','cash-withdraw',100),btn('Simular fechamento','primary','cash-close'));const result=n('p','lab-action-result','Nenhum movimento de caixa foi executado.');result.id='p2CashResult';result.setAttribute('aria-live','polite');ops.append(actions,result);
 const mov=n('article','panel');mov.append(panelHead('Movimentos do turno','Resumo demonstrativo',pill('Hoje','blue-pill')));const list=n('div','settlement-list');list.id='p2CashMovements';mov.append(list);grid.append(ops,mov);s.append(grid);return s;
}

function buildClients(){
 const s=section('clientes');s.append(notice('CRM demonstrativo. Sem telefone, e-mail ou dado pessoal real nesta camada pública.'));
 const metrics=n('div','module-metrics');metrics.append(metric('Clientes ativos','1.284','Últimos 90 dias','blue'),metric('Recorrência','42%','+3 p.p. no mês','green'),metric('Em risco','63','Sem compra > 15 dias','amber'),metric('Fiado em aberto',fmt(231),'1 conta demonstrativa','red'));s.append(metrics);
 const card=n('article','panel');
 const controls=n('div','stock-controls');const search=n('input','module-input compact');search.type='search';search.id='p2ClientSearch';search.placeholder='Buscar cliente…';search.setAttribute('aria-label','Buscar cliente no CRM');controls.append(search);[['todos','Todos'],['risco','Em risco'],['credito','Com saldo']].forEach(([v,l])=>controls.append(btn(l,`filter-chip${v===clientFilter?' active':''}`,'client-filter',v)));
 card.append(panelHead('Clientes 360','Recência, frequência, valor e crédito',controls));const root=n('div','p2-table');root.id='p2ClientRows';card.append(root);s.append(card);return s;
}

function renderOrders(){
 const root=document.getElementById('p2OrderRows');if(!root)return;root.replaceChildren();
 const visible=orderRows.filter(o=>orderFilter==='todos'||orderFilter==='ativos'&&o.status!=='entregue'||orderFilter==='atrasados'&&(o.priority==='alta'||parseInt(o.age,10)>=12));
 const header=n('div','p2-row p2-head');['Pedido','Canal / cliente','Tempo','Total','Status','Ação'].forEach(x=>header.append(n('strong','',x)));root.append(header);
 visible.forEach(o=>{const row=n('div','p2-row');const info=n('div');info.append(n('strong','',o.id),n('span','',o.channel));const customer=n('div');customer.append(n('strong','',o.customer),n('span','',o.priority==='alta'?'Prioridade alta':'Fluxo normal'));const tone=o.status==='entregue'?'ok':o.status==='pronto'?'green':o.status==='saiu'?'blue-pill':o.priority==='alta'?'warn':'neutral';const label={novo:'Novo',preparando:'Preparando',pronto:'Pronto',saiu:'Saiu',entregue:'Entregue'}[o.status];const action=o.status==='entregue'?pill('Concluído','ok'):btn('Avançar','ghost small','order-advance',o.id);row.append(info,customer,n('span','',o.age),n('b','',fmt(o.total)),pill(label,tone==='green'?'ok':tone),action);root.append(row)});
 if(!visible.length)root.append(n('div','empty-state','Nenhum pedido neste filtro.'));
 announce(`${visible.length} pedido(s) exibido(s).`);
}

function renderDelivery(){
 const root=document.getElementById('p2DeliveryRows');if(!root)return;root.replaceChildren();
 deliveryRows.forEach(d=>{const row=n('div','receipt-detail-row');const left=n('div');left.append(n('strong','',`${d.id} • ${d.order}`),n('span','',`${d.customer} • ${d.zone}`));const mid=n('div','receipt-values');mid.append(n('span','',d.driver),n('b','',`ETA ${d.eta}`));const label={em_rota:'Em rota',chegando:'Chegando',entregue:'Entregue',aguardando:'Aguardando'}[d.status];const tone=d.status==='entregue'?'ok':d.status==='aguardando'?'warn':'blue-pill';row.append(left,mid,pill(label,tone));root.append(row)});
}

function renderProducts(){
 const root=document.getElementById('p2ProductRows');if(!root)return;root.replaceChildren();const q=norm(document.getElementById('p2ProductSearch')?.value);
 const visible=productRows.filter(p=>{const margin=(p.price-p.cost)/p.price*100;const text=!q||norm(`${p.name} ${p.sku} ${p.category}`).includes(q);const filter=productFilter==='todos'||productFilter==='margem'&&margin<50||productFilter==='estoque'&&p.stock<=10;return text&&filter});
 const header=n('div','p2-row p2-head p2-product-row');['Produto','Categoria','Custo','Preço','Margem','Estoque'].forEach(x=>header.append(n('strong','',x)));root.append(header);
 visible.forEach(p=>{const margin=(p.price-p.cost)/p.price*100;const info=n('div');info.append(n('strong','',p.name),n('span','',p.sku));const marginEl=n('b',margin<40?'danger-text':margin<50?'warn-text':'ok-text',`${margin.toFixed(1)}%`);root.append(Object.assign(n('div','p2-row p2-product-row'),{appendDummy:null}));const row=root.lastElementChild;row.append(info,n('span','',p.category),n('span','',fmt(p.cost)),n('b','',fmt(p.price)),marginEl,pill(`${p.stock} un.`,p.stock<=8?'warn':'neutral'))});
 if(!visible.length)root.append(n('div','empty-state','Nenhum produto corresponde ao filtro.'));announce(`${visible.length} produto(s) exibido(s).`);
}

function renderPurchases(){
 const root=document.getElementById('p2PurchaseRows');if(!root)return;root.replaceChildren();purchaseRows.forEach(p=>{const row=n('div','receipt-detail-row');const left=n('div');left.append(n('strong','',`${p.id} • ${p.supplier}`),n('span','',`${p.items} itens • criada ${p.created}`));const values=n('div','receipt-values');values.append(n('span','',`Previsão ${p.eta}`),n('b','',fmt(p.total)));const label={aprovada:'Aprovada',transito:'Em trânsito',rascunho:'Rascunho',recebida:'Recebida'}[p.status];const tone=p.status==='recebida'?'ok':p.status==='rascunho'?'neutral':p.status==='transito'?'blue-pill':'warn';const action=p.status==='rascunho'?btn('Aprovar LAB','ghost small','purchase-approve',p.id):p.status==='aprovada'||p.status==='transito'?btn('Receber LAB','ghost small','purchase-receive',p.id):pill(label,tone);row.append(left,values,pill(label,tone),action);root.append(row)});
}

function renderSuppliers(){
 const root=document.getElementById('p2SupplierRows');if(!root)return;root.replaceChildren();const header=n('div','p2-row p2-head p2-supplier-row');['Fornecedor','Categoria','Lead time','Score','Em aberto','Última compra'].forEach(x=>header.append(n('strong','',x)));root.append(header);supplierRows.forEach(s=>{const info=n('div');info.append(n('strong','',s.name),n('span','',s.id));const scoreTone=s.score>=90?'ok':s.score>=85?'warn':'danger';const row=n('div','p2-row p2-supplier-row');row.append(info,n('span','',s.category),n('span','',`${s.lead} dia(s)`),pill(String(s.score),scoreTone),n('b','',fmt(s.open)),n('span','',s.last));root.append(row)});
}

function expectedCash(){return cashState.opening+cashState.cashSales+cashState.supplies-cashState.withdrawals+cashState.adjustments}
function renderCash(){
 const metrics=document.getElementById('p2CashMetrics');if(!metrics)return;metrics.replaceChildren(metric('Fundo inicial',fmt(cashState.opening),'Dinheiro','blue'),metric('Vendas em dinheiro',fmt(cashState.cashSales),'Somente espécie','green'),metric('Sangrias',fmt(cashState.withdrawals),'Retiradas','red'),metric('Esperado no caixa',fmt(expectedCash()),'Fechamento teórico','purple'));
 const list=document.getElementById('p2CashMovements');if(list){list.replaceChildren();[['Abertura',cashState.opening,'blue-pill'],['Vendas em dinheiro',cashState.cashSales,'ok'],['Suprimentos',cashState.supplies,'neutral'],['Sangrias',-cashState.withdrawals,'warn']].forEach(([label,value,tone])=>{const row=n('div','settlement-row');row.append(n('span','settlement-date','Hoje'),n('strong','',label),n('b',value<0?'danger-text':'',fmt(value)),pill(value<0?'Saída':'Entrada',tone));list.append(row)})}
}

function renderClients(){
 const root=document.getElementById('p2ClientRows');if(!root)return;root.replaceChildren();const q=norm(document.getElementById('p2ClientSearch')?.value);const visible=clientRows.filter(c=>{const text=!q||norm(`${c.name} ${c.id} ${c.segment}`).includes(q);const filter=clientFilter==='todos'||clientFilter==='risco'&&c.segment==='Em risco'||clientFilter==='credito'&&c.open>0;return text&&filter});const header=n('div','p2-row p2-head p2-client-row');['Cliente','Segmento','Última compra','Compras','Total histórico','Crédito / saldo'].forEach(x=>header.append(n('strong','',x)));root.append(header);visible.forEach(c=>{const info=n('div');info.append(n('strong','',c.name),n('span','',c.id));const credit=n('div','p2-credit');credit.append(n('strong','',`Limite ${fmt(c.limit)}`),n('span',c.open>0?'warn-text':'ok-text',c.open>0?`Saldo ${fmt(c.open)}`:'Sem saldo'));const row=n('div','p2-row p2-client-row');row.append(info,pill(c.segment,c.segment==='Em risco'?'warn':c.segment==='VIP'?'purple':'neutral'),n('span','',c.last),n('span','',String(c.orders)),n('b','',fmt(c.spent)),credit);root.append(row)});if(!visible.length)root.append(n('div','empty-state','Nenhum cliente corresponde ao filtro.'));announce(`${visible.length} cliente(s) exibido(s).`);
}

function announce(message){const live=document.getElementById('liveRegion');if(live)live.textContent=message}
function setResult(id,message,tone='neutral'){const el=document.getElementById(id);if(el){el.textContent=message;el.dataset.tone=tone}}
function setActive(action,value){document.querySelectorAll(`[data-p2-action="${action}"]`).forEach(el=>el.classList.toggle('active',el.dataset.value===value))}

function buildAll(){
 ensureStyles();const placeholder=document.getElementById('page-placeholder');const parent=placeholder?.parentNode;if(!parent)return;
 [buildOrders(),buildDelivery(),buildProducts(),buildPurchases(),buildSuppliers(),buildCash(),buildClients()].forEach(s=>parent.insertBefore(s,placeholder));
 renderOrders();renderDelivery();renderProducts();renderPurchases();renderSuppliers();renderCash();renderClients();patchPhase1UX();
}

function patchPhase1UX(){
 const noop=document.querySelector('[data-action="noop"]');if(noop){noop.dataset.action='finance-focus-commitments';noop.textContent='Destacar compromissos'}
}

window.openPage=function(key,opts={}){
 const result=oldOpenPage(key,opts);
 if(phase2Pages.has(key)){
   document.getElementById('page-placeholder')?.classList.remove('active');
   document.querySelectorAll('.phase2-page').forEach(page=>page.classList.toggle('active',page.id===`page-${key}`));
 }else if(key!=='dashboard'){
   const active=document.querySelector(`#page-${CSS.escape(key)}.active`);
   const placeholder=document.getElementById('page-placeholder');
   if(!active&&!placeholder?.classList.contains('active')){
     placeholder?.classList.add('active');
     const h=document.getElementById('placeholderTitle');const p=document.getElementById('placeholderText');
     if(h)h.textContent=document.getElementById('pageTitle')?.textContent||'Módulo';
     if(p)p.textContent='O módulo não pôde ser montado no LAB. A tela de segurança foi exibida para evitar uma área em branco.';
     announce('Falha de montagem detectada; exibida tela segura de fallback.');
   }
 }
 return result;
};

document.addEventListener('click',event=>{
 const target=event.target.closest('[data-p2-action]');
 if(target){
   const action=target.dataset.p2Action;const value=target.dataset.value;
   if(action==='order-filter'){orderFilter=value;setActive('order-filter',value);renderOrders()}
   else if(action==='order-advance'){const order=orderRows.find(x=>x.id===value);if(order){const flow=['novo','preparando','pronto','saiu','entregue'];order.status=flow[Math.min(flow.indexOf(order.status)+1,flow.length-1)];renderOrders();announce(`${order.id} avançou para ${order.status} no LAB.`)}}
   else if(action==='product-filter'){productFilter=value;setActive('product-filter',value);renderProducts()}
   else if(action==='client-filter'){clientFilter=value;setActive('client-filter',value);renderClients()}
   else if(action==='purchase-new'){announce('Nova compra: fluxo demonstrativo aberto. Nenhum registro foi criado.')}
   else if(action==='purchase-approve'){const purchase=purchaseRows.find(x=>x.id===value);if(purchase){purchase.status='aprovada';renderPurchases();announce(`${purchase.id} aprovada somente no LAB.`)}}
   else if(action==='purchase-receive'){const purchase=purchaseRows.find(x=>x.id===value);if(purchase){purchase.status='recebida';renderPurchases();announce(`${purchase.id} marcada como recebida no LAB; estoque real não foi alterado.`)}}
   else if(action==='cash-supply'){cashState.supplies+=Number(value)||0;renderCash();setResult('p2CashResult',`Suprimento demonstrativo de ${fmt(Number(value)||0)} adicionado. Nenhum caixa real foi alterado.`,'ok')}
   else if(action==='cash-withdraw'){const amount=Number(value)||0;if(expectedCash()-amount<0)setResult('p2CashResult','Sangria bloqueada no LAB: valor excede o caixa esperado.','warn');else{cashState.withdrawals+=amount;renderCash();setResult('p2CashResult',`Sangria demonstrativa de ${fmt(amount)} registrada apenas em memória.`,'warn')}}
   else if(action==='cash-close'){setResult('p2CashResult',`Fechamento simulado: esperado ${fmt(expectedCash())}. Conferência física continua obrigatória.`,'ok')}
 }

 const phase1=event.target.closest('[data-action]');if(!phase1)return;
 const action=phase1.dataset.action;
 if(action==='receipt-filter')requestAnimationFrame(()=>announce(`${document.querySelectorAll('#receiptRows .receipt-detail-row').length} recebimento(s) exibido(s).`));
 if(action==='stock-filter')requestAnimationFrame(()=>announce(`${document.querySelectorAll('#stockRows .stock-row:not(.stock-header)').length} item(ns) de estoque exibido(s).`));
 if(action==='finance-focus-commitments'){const panel=document.querySelector('.finance-wide');if(panel){panel.setAttribute('tabindex','-1');panel.focus();panel.scrollIntoView({block:'center',behavior:'smooth'});announce('Compromissos financeiros destacados.')}}
 if(action==='add-product'||action==='cart-inc')requestAnimationFrame(()=>{
   const id=phase1.dataset.value;const add=document.querySelector(`[data-action="add-product"][data-value="${CSS.escape(id)}"]`);const inc=document.querySelector(`[data-action="cart-inc"][data-value="${CSS.escape(id)}"]`);const qty=Number(inc?.closest('.cart-row')?.querySelector('.qty-value')?.textContent||0);const stock=Number(add?.querySelector('.pill')?.textContent.match(/\d+/)?.[0]||0);if(stock&&qty>=stock)setResult('pdvResult',`Limite demonstrativo atingido: ${qty} unidade(s), igual ao estoque disponível.`,'warn');
 });
});

document.addEventListener('input',event=>{
 if(event.target.id==='p2ProductSearch')renderProducts();
 if(event.target.id==='p2ClientSearch')renderClients();
});

buildAll();
const current=window.location.hash.slice(1);if(phase2Pages.has(current))window.openPage(current,{syncHash:false});
})();
