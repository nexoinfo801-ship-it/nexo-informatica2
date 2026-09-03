const titles=Object.freeze({
  dashboard:['Dashboard','Visão executiva e saúde operacional do negócio'],
  pdv:['Nova Venda / PDV','Venda rápida, pagamentos e operação de balcão'],
  pedidos:['Pedidos','Fila operacional, status e acompanhamento'],
  produtos:['Produtos','Cadastro, preços, margem e código de barras'],
  estoque:['Estoque','Físico, reservado, disponível, planejado e em trânsito'],
  compras:['Compras','Suprimentos, fornecedores e recebimentos'],
  caixa:['Caixa','Abertura, sangria, suprimento e fechamento'],
  recebimentos:['Recebimentos 360','Venda, previsão e liquidação real'],
  financeiro:['Financeiro','Contas, aging, conciliação, fluxo e DRE'],
  delivery:['Delivery','Pedidos, rotas, taxas e entregas'],
  clientes:['Clientes','Histórico, crédito, relacionamento e retenção'],
  fornecedores:['Fornecedores','Cadastro, negociação e desempenho'],
  relatorios:['Relatórios','Indicadores, exportações e auditoria'],
  ia:['NEXO IA','Insights locais com confirmação humana'],
  integracoes:['Integrações','Conectores, saúde e credenciais seguras'],
  suporte:['Licença e Suporte','Licença, heartbeat, chamados e diagnóstico']
});

const implementedPages=new Set(['dashboard','pdv','recebimentos','financeiro','estoque']);

const demoProducts=Object.freeze([
  {id:'p1',name:'X-Burger Especial',sku:'LANC-001',price:29.9,stock:18},
  {id:'p2',name:'Combo NEXO',sku:'COMB-004',price:42.5,stock:11},
  {id:'p3',name:'Refrigerante 350ml',sku:'BEB-012',price:7.0,stock:64},
  {id:'p4',name:'Porção Fritas M',sku:'POR-006',price:19.9,stock:9},
  {id:'p5',name:'Suco Natural 500ml',sku:'BEB-021',price:12.5,stock:22},
  {id:'p6',name:'Sobremesa da Casa',sku:'SOB-003',price:14.0,stock:6}
]);

const demoReceipts=Object.freeze([
  {id:'R-2048',method:'PIX',source:'PDV',gross:184.9,net:184.9,status:'liquidado',date:'Hoje 14:32'},
  {id:'R-2047',method:'Crédito',source:'PDV',gross:296.0,net:287.12,status:'conciliacao',date:'Hoje 14:18'},
  {id:'R-2046',method:'Marketplace',source:'Delivery',gross:122.5,net:98.7,status:'repasse',date:'Hoje 13:54'},
  {id:'R-2045',method:'Dinheiro',source:'Balcão',gross:74.9,net:74.9,status:'liquidado',date:'Hoje 13:41'},
  {id:'R-2044',method:'Fiado',source:'Cliente',gross:231.0,net:231.0,status:'aberto',date:'Hoje 12:56'}
]);

const demoStock=Object.freeze([
  {sku:'INS-001',name:'Queijo mussarela',physical:8,reserved:3,min:12,inTransit:20,status:'critico'},
  {sku:'INS-009',name:'Pão brioche',physical:34,reserved:8,min:25,inTransit:0,status:'ok'},
  {sku:'BEB-012',name:'Refrigerante 350ml',physical:64,reserved:12,min:30,inTransit:24,status:'ok'},
  {sku:'POR-006',name:'Batata congelada 2kg',physical:9,reserved:4,min:10,inTransit:12,status:'baixo'},
  {sku:'EMB-004',name:'Embalagem delivery M',physical:27,reserved:15,min:30,inTransit:100,status:'baixo'},
  {sku:'SOB-003',name:'Sobremesa da Casa',physical:6,reserved:2,min:8,inTransit:0,status:'critico'}
]);

const cart=new Map();
let selectedPayment='pix';
let receiptFilter='todos';
let stockFilter='todos';

const el={
  nav:document.querySelector('.nav'),
  dashboard:document.getElementById('page-dashboard'),
  placeholder:document.getElementById('page-placeholder'),
  pageTitle:document.getElementById('pageTitle'),
  pageSubtitle:document.getElementById('pageSubtitle'),
  placeholderTitle:document.getElementById('placeholderTitle'),
  placeholderText:document.getElementById('placeholderText'),
  palette:document.getElementById('commandPalette'),
  commandInput:document.getElementById('commandInput'),
  commandResults:document.getElementById('commandResults'),
  globalSearch:document.getElementById('globalSearch'),
  liveRegion:document.getElementById('liveRegion')
};

let lastFocused=null;
let currentPage='dashboard';

function normalizeText(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

function money(value){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)}
function isKnownPage(key){return Object.prototype.hasOwnProperty.call(titles,key)}
function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function button(text,className,action,value){const b=node('button',className,text);b.type='button';if(action)b.dataset.action=action;if(value!==undefined)b.dataset.value=String(value);return b}
function badge(text,tone='neutral'){return node('span',`pill ${tone}`,text)}

function ensureModuleStyles(){
  if(document.querySelector('link[data-lab-modules]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='modules.css';
  link.dataset.labModules='true';
  document.head.appendChild(link);
}

function createSection(key){
  const section=node('section','page module-page');
  section.id=`page-${key}`;
  section.dataset.modulePage=key;
  section.setAttribute('aria-labelledby','pageTitle');
  return section;
}

function createDemoNotice(text){
  const n=node('div','demo-notice');
  n.append(badge('LAB','blue-pill'),node('span','',text));
  return n;
}

function createMetric(label,value,detail,tone='blue'){
  const card=node('article',`module-metric ${tone}`);
  card.append(node('span','module-metric-label',label),node('strong','module-metric-value',value),node('small','module-metric-detail',detail));
  return card;
}

function buildPDV(){
  const section=createSection('pdv');
  section.append(createDemoNotice('Operação demonstrativa: nenhuma venda é gravada no banco nesta camada pública.'));

  const toolbar=node('div','module-toolbar');
  const status=node('div','toolbar-status');status.append(badge('Caixa aberto','ok'),node('span','', 'Operador: Administrador • Terminal LAB-01'));
  const actions=node('div','toolbar-actions');actions.append(button('Suspender','ghost','sale-suspend'),button('Limpar venda','ghost','cart-clear'));
  toolbar.append(status,actions);

  const layout=node('div','pdv-layout');
  const catalog=node('article','panel pdv-catalog');
  const head=node('div','panel-head');
  const ht=node('div');ht.append(node('h2','', 'Produtos'),node('p','', 'Busca por nome, SKU ou código de barras'));
  head.append(ht);
  const search=node('input','module-input');search.id='pdvProductSearch';search.type='search';search.autocomplete='off';search.placeholder='Buscar produto ou SKU…';search.setAttribute('aria-label','Buscar produto no PDV');
  const grid=node('div','product-grid');grid.id='pdvProductGrid';
  catalog.append(head,search,grid);

  const sale=node('article','panel pdv-sale');
  const sh=node('div','panel-head');const sht=node('div');sht.append(node('h2','', 'Venda atual'),node('p','', 'Carrinho e finalização'));sh.append(sht,badge('0 itens','neutral'));sh.querySelector('.pill').id='pdvItemCount';
  const rows=node('div','cart-rows');rows.id='pdvCartRows';
  const empty=node('div','empty-state','Adicione produtos para iniciar a venda.');empty.id='pdvEmpty';rows.append(empty);
  const totals=node('div','sale-totals');
  const subtotal=node('div','sale-total-line');subtotal.append(node('span','', 'Subtotal'),node('strong','',money(0)));subtotal.querySelector('strong').id='pdvSubtotal';
  const discount=node('div','sale-total-line');discount.append(node('span','', 'Descontos'),node('strong','muted-value',money(0)));
  const total=node('div','sale-total-line total');total.append(node('span','', 'Total'),node('strong','',money(0)));total.querySelector('strong').id='pdvTotal';
  totals.append(subtotal,discount,total);

  const payment=node('div','payment-box');payment.append(node('h3','', 'Forma de pagamento'));
  const paymentGrid=node('div','payment-grid');
  [['dinheiro','Dinheiro'],['pix','PIX'],['debito','Débito'],['credito','Crédito'],['fiado','Fiado']].forEach(([value,label])=>{
    const b=button(label,`payment-option${value===selectedPayment?' active':''}`,'select-payment',value);paymentGrid.append(b);
  });
  payment.append(paymentGrid);
  const finalize=button('Finalizar venda de teste','primary wide','sale-finalize');
  const result=node('p','lab-action-result','Nenhuma operação real foi executada.');result.id='pdvResult';result.setAttribute('aria-live','polite');
  sale.append(sh,rows,totals,payment,finalize,result);
  layout.append(catalog,sale);
  section.append(toolbar,layout);
  return section;
}

function buildReceipts(){
  const section=createSection('recebimentos');
  section.append(createDemoNotice('Venda, previsão e liquidação permanecem separadas. Valores abaixo são demonstrativos.'));
  const metrics=node('div','module-metrics');
  metrics.append(createMetric('Vendido hoje',money(12450.90),'Bruto registrado','blue'),createMetric('Liquidado hoje',money(10984.40),'Dinheiro + PIX + liquidações','green'),createMetric('A conciliar',money(2340.50),'Cartões','amber'),createMetric('A receber',money(1043.00),'Repasses + fiado','purple'));

  const grid=node('div','module-grid two');
  const list=node('article','panel');
  const head=node('div','panel-head');const ht=node('div');ht.append(node('h2','', 'Movimentos'),node('p','', 'Acompanhe o estágio financeiro de cada venda'));
  const filters=node('div','filter-row');
  [['todos','Todos'],['liquidado','Liquidados'],['pendente','Pendentes']].forEach(([v,l])=>filters.append(button(l,`filter-chip${v==='todos'?' active':''}`,'receipt-filter',v)));
  head.append(ht,filters);
  const receiptRows=node('div','data-list');receiptRows.id='receiptRows';
  list.append(head,receiptRows);

  const settle=node('article','panel');
  const sth=node('div','panel-head');const stt=node('div');stt.append(node('h2','', 'Agenda de liquidação'),node('p','', 'Previsão por origem'));sth.append(stt,badge('Próximos 7 dias','neutral'));
  const timeline=node('div','settlement-list');
  [['Hoje','PIX','R$ 4.180,90','ok'],['Amanhã','Débito','R$ 914,20','blue-pill'],['+2 dias','Crédito','R$ 1.426,30','warn'],['+7 dias','Marketplace','R$ 812,00','warn']].forEach(([date,name,value,tone])=>{
    const row=node('div','settlement-row');row.append(node('span','settlement-date',date),node('strong','',name),node('b','',value),badge(tone==='ok'?'Confirmado':'Previsto',tone));timeline.append(row);
  });
  settle.append(sth,timeline);
  grid.append(list,settle);
  section.append(metrics,grid);
  return section;
}

function buildFinance(){
  const section=createSection('financeiro');
  section.append(createDemoNotice('Painel gerencial do LAB. Nenhuma baixa ou lançamento é persistido.'));
  const metrics=node('div','module-metrics');
  metrics.append(createMetric('Contas a receber',money(18742.60),'23 títulos em aberto','blue'),createMetric('Contas a pagar',money(12980.20),'17 compromissos','red'),createMetric('Saldo projetado',money(5762.40),'Próximos 30 dias','green'),createMetric('Margem operacional','28,4%','+1,8 p.p. no mês','purple'));

  const grid=node('div','module-grid finance-grid');
  const aging=node('article','panel');
  const ah=node('div','panel-head');const aht=node('div');aht.append(node('h2','', 'Aging de recebíveis'),node('p','', 'Concentração por faixa de vencimento'));ah.append(aht,badge('23 títulos','neutral'));
  const agingRows=node('div','aging-list');
  [['Em dia','R$ 12.840,00','pct-68','ok'],['1–7 dias','R$ 3.420,60','pct-18','warn'],['8–30 dias','R$ 1.581,00','pct-9','warn'],['> 30 dias','R$ 901,00','pct-5','danger']].forEach(([label,value,pct,tone])=>{
    const row=node('div','aging-row');const top=node('div','aging-top');top.append(node('span','',label),node('strong',tone==='danger'?'danger-text':tone==='warn'?'warn-text':'ok-text',value));
    const track=node('div','progress-track');const fill=node('div',`progress-fill ${pct} ${tone}`);track.append(fill);row.append(top,track);agingRows.append(row);
  });
  aging.append(ah,agingRows);

  const cash=node('article','panel');
  const ch=node('div','panel-head');const cht=node('div');cht.append(node('h2','', 'Fluxo de caixa — 7 dias'),node('p','', 'Entradas e saídas previstas'));ch.append(cht,badge('Projetado','blue-pill'));
  const flow=node('div','flow-list');
  [['Hoje','+ R$ 4.320','− R$ 2.180','+ R$ 2.140'],['Amanhã','+ R$ 3.480','− R$ 4.010','− R$ 530'],['Sex','+ R$ 5.900','− R$ 2.640','+ R$ 3.260'],['Sáb','+ R$ 6.700','− R$ 1.320','+ R$ 5.380']].forEach(([d,i,o,b])=>{const row=node('div','flow-row');row.append(node('strong','',d),node('span','ok-text',i),node('span','danger-text',o),node('b',b.startsWith('+')?'ok-text':'danger-text',b));flow.append(row)});
  cash.append(ch,flow);

  const due=node('article','panel finance-wide');
  const dh=node('div','panel-head');const dht=node('div');dht.append(node('h2','', 'Próximos compromissos'),node('p','', 'Prioridade por vencimento'));dh.append(dht,button('Ver contas','ghost','noop'));
  const table=node('div','data-table');
  [['Fornecedor Alpha','Compra #882','Amanhã','R$ 2.840,00','warn'],['Energia elétrica','Operacional','03/09','R$ 1.460,00','neutral'],['Fornecedor Beta','Compra #875','04/09','R$ 3.210,00','neutral'],['Aluguel','Fixo','05/09','R$ 2.500,00','neutral']].forEach(([name,kind,date,value,tone])=>{const row=node('div','data-row finance-row');row.append(node('strong','',name),node('span','',kind),node('span','',date),node('b','',value),badge(tone==='warn'?'Prioridade':'Programado',tone));table.append(row)});
  due.append(dh,table);
  grid.append(aging,cash,due);
  section.append(metrics,grid);
  return section;
}

function buildStock(){
  const section=createSection('estoque');
  section.append(createDemoNotice('Estoque disponível = físico − reservado. Em trânsito não aumenta o físico antes do recebimento.'));
  const metrics=node('div','module-metrics');
  metrics.append(createMetric('SKUs ativos','842','6 com atenção','blue'),createMetric('Abaixo do mínimo','4','2 críticos','red'),createMetric('Valor em estoque',money(86420.30),'Custo médio','green'),createMetric('Em trânsito',money(12840.00),'3 compras abertas','purple'));

  const main=node('div','module-grid stock-grid');
  const list=node('article','panel stock-main');
  const head=node('div','panel-head stock-head');const ht=node('div');ht.append(node('h2','', 'Posição de estoque'),node('p','', 'Físico, reservado, disponível e em trânsito'));
  const controls=node('div','stock-controls');
  const search=node('input','module-input compact');search.id='stockSearch';search.type='search';search.placeholder='Buscar item…';search.setAttribute('aria-label','Buscar item no estoque');controls.append(search);
  [['todos','Todos'],['atencao','Atenção'],['critico','Críticos']].forEach(([v,l])=>controls.append(button(l,`filter-chip${v==='todos'?' active':''}`,'stock-filter',v)));
  head.append(ht,controls);
  const stockRows=node('div','stock-table');stockRows.id='stockRows';
  list.append(head,stockRows);

  const insight=node('article','panel');
  const ih=node('div','panel-head');const iht=node('div');iht.append(node('h2','', 'Reposição sugerida'),node('p','', 'Cálculo demonstrativo por mínimo e reserva'));ih.append(iht,badge('NEXO IA','ai'));
  const suggestions=node('div','suggestion-list');
  [['Queijo mussarela','Comprar 24 kg','Risco em 2 dias','danger'],['Embalagem delivery M','Comprar 150 un.','Cobertura baixa','warn'],['Batata congelada 2kg','Receber compra aberta','12 un. em trânsito','blue-pill']].forEach(([name,action,why,tone])=>{const row=node('div','suggestion-row');const txt=node('div');txt.append(node('strong','',name),node('span','',why));row.append(txt,node('b','',action),badge(tone==='danger'?'Crítico':tone==='warn'?'Atenção':'Planejado',tone));suggestions.append(row)});
  insight.append(ih,suggestions);
  main.append(list,insight);
  section.append(metrics,main);
  return section;
}

function buildImplementedModules(){
  ensureModuleStyles();
  const parent=el.placeholder.parentNode;
  [buildPDV(),buildReceipts(),buildFinance(),buildStock()].forEach(section=>parent.insertBefore(section,el.placeholder));
  renderPDVProducts('');renderCart();renderReceipts();renderStock();
}

function setActiveNav(key){
  document.querySelectorAll('.nav-item').forEach(b=>{
    const active=b.dataset.page===key;b.classList.toggle('active',active);
    if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
}

function hideAllPages(){
  el.dashboard.classList.remove('active');
  el.placeholder.classList.remove('active');
  document.querySelectorAll('.module-page').forEach(p=>p.classList.remove('active'));
}

function openPage(key,{syncHash=true,focusHeading=false}={}){
  const safeKey=isKnownPage(key)?key:'dashboard';
  currentPage=safeKey;
  const [title,subtitle]=titles[safeKey];
  setActiveNav(safeKey);el.pageTitle.textContent=title;el.pageSubtitle.textContent=subtitle;document.title=`${title} — NEXO ERP PRO 9.8 LAB`;
  hideAllPages();
  if(safeKey==='dashboard')el.dashboard.classList.add('active');
  else if(implementedPages.has(safeKey))document.getElementById(`page-${safeKey}`)?.classList.add('active');
  else{
    el.placeholder.classList.add('active');el.placeholderTitle.textContent=title;
    el.placeholderText.textContent=`${subtitle}. Esta área já está enquadrada no Visual Pro 360 e será conectada à lógica privada validada da linha comercial.`;
  }
  if(syncHash&&window.location.hash!==`#${safeKey}`)history.replaceState(null,'',`#${safeKey}`);
  el.liveRegion.textContent=`Módulo ${title} aberto.`;
  if(focusHeading)requestAnimationFrame(()=>el.pageTitle.focus());
}

function resetResults(message='Digite para pesquisar no NEXO ERP PRO.'){el.commandResults.replaceChildren(document.createTextNode(message))}
function createResultButton(key,[title,subtitle]){const b=button('', 'ghost command-result');b.dataset.go=key;b.setAttribute('role','option');b.append(node('strong','',title),node('small','',subtitle));return b}
function renderResults(query){
  const q=normalizeText(query);if(!q){resetResults();return}
  const matches=Object.entries(titles).filter(([,value])=>normalizeText(value.join(' ')).includes(q)).slice(0,8);
  el.commandResults.replaceChildren();if(!matches.length){resetResults('Nenhum módulo encontrado.');return}
  matches.forEach(entry=>el.commandResults.appendChild(createResultButton(...entry)));
}
function getFocusableInPalette(){return [...el.palette.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(n=>n.offsetParent!==null)}
function openPalette(){if(el.palette.classList.contains('open'))return;lastFocused=document.activeElement instanceof HTMLElement?document.activeElement:null;el.palette.classList.add('open');el.palette.setAttribute('aria-hidden','false');el.globalSearch.setAttribute('aria-expanded','true');document.body.classList.add('no-scroll');requestAnimationFrame(()=>el.commandInput.focus())}
function closePalette({restoreFocus=true}={}){if(!el.palette.classList.contains('open'))return;el.palette.classList.remove('open');el.palette.setAttribute('aria-hidden','true');el.globalSearch.setAttribute('aria-expanded','false');el.commandInput.value='';resetResults();document.body.classList.remove('no-scroll');if(restoreFocus&&lastFocused)requestAnimationFrame(()=>lastFocused.focus())}
function activateResult(b){if(!b)return;openPage(b.dataset.go,{focusHeading:true});closePalette({restoreFocus:false})}

function renderPDVProducts(query=''){
  const grid=document.getElementById('pdvProductGrid');if(!grid)return;
  const q=normalizeText(query);const products=demoProducts.filter(p=>normalizeText(`${p.name} ${p.sku}`).includes(q));grid.replaceChildren();
  products.forEach(p=>{const card=button('', 'product-card','add-product',p.id);const top=node('div','product-card-top');top.append(node('strong','',p.name),badge(`${p.stock} disp.`,p.stock<=8?'warn':'neutral'));card.append(top,node('span','product-sku',p.sku),node('b','product-price',money(p.price)));grid.append(card)});
  if(!products.length)grid.append(node('div','empty-state','Nenhum produto encontrado.'));
}

function cartSummary(){let items=0,total=0;for(const [id,qty] of cart){const p=demoProducts.find(x=>x.id===id);if(p){items+=qty;total+=p.price*qty}}return{items,total}}
function renderCart(){
  const rows=document.getElementById('pdvCartRows');if(!rows)return;rows.replaceChildren();
  if(!cart.size)rows.append(node('div','empty-state','Adicione produtos para iniciar a venda.'));
  else for(const [id,qty] of cart){const p=demoProducts.find(x=>x.id===id);if(!p)continue;const row=node('div','cart-row');const info=node('div','cart-info');info.append(node('strong','',p.name),node('span','',`${p.sku} • ${money(p.price)}`));const controls=node('div','qty-controls');controls.append(button('−','qty-btn','cart-dec',id),node('span','qty-value',String(qty)),button('+','qty-btn','cart-inc',id));row.append(info,controls,node('b','cart-line-total',money(p.price*qty)));rows.append(row)}
  const {items,total}=cartSummary();document.getElementById('pdvItemCount').textContent=`${items} ${items===1?'item':'itens'}`;document.getElementById('pdvSubtotal').textContent=money(total);document.getElementById('pdvTotal').textContent=money(total);
}

function statusTone(status){return status==='liquidado'?'ok':status==='aberto'?'neutral':'warn'}
function statusLabel(status){return({liquidado:'Liquidado',conciliacao:'Conciliação',repasse:'Repasse',aberto:'A receber'})[status]||status}
function renderReceipts(){
  const root=document.getElementById('receiptRows');if(!root)return;root.replaceChildren();
  const items=demoReceipts.filter(r=>receiptFilter==='todos'||receiptFilter==='liquidado'&&r.status==='liquidado'||receiptFilter==='pendente'&&r.status!=='liquidado');
  items.forEach(r=>{const row=node('div','receipt-detail-row');const left=node('div');left.append(node('strong','',`${r.id} • ${r.method}`),node('span','',`${r.source} • ${r.date}`));const values=node('div','receipt-values');values.append(node('span','',`Bruto ${money(r.gross)}`),node('b','',`Líquido ${money(r.net)}`));row.append(left,values,badge(statusLabel(r.status),statusTone(r.status)));root.append(row)});
}

function renderStock(){
  const root=document.getElementById('stockRows');if(!root)return;root.replaceChildren();
  const q=normalizeText(document.getElementById('stockSearch')?.value);const items=demoStock.filter(item=>{
    const matchText=!q||normalizeText(`${item.name} ${item.sku}`).includes(q);const matchFilter=stockFilter==='todos'||stockFilter==='critico'&&item.status==='critico'||stockFilter==='atencao'&&item.status!=='ok';return matchText&&matchFilter;
  });
  const header=node('div','stock-row stock-header');['Produto','Físico','Reserv.','Dispon.','Em trânsito','Status'].forEach(t=>header.append(node('strong','',t)));root.append(header);
  items.forEach(item=>{const available=item.physical-item.reserved;const row=node('div','stock-row');const info=node('div','stock-product');info.append(node('strong','',item.name),node('span','',item.sku));row.append(info,node('span','',String(item.physical)),node('span','',String(item.reserved)),node('b',available<item.min?'warn-text':'ok-text',String(available)),node('span','',String(item.inTransit)),badge(item.status==='ok'?'OK':item.status==='critico'?'Crítico':'Baixo',item.status==='ok'?'ok':item.status==='critico'?'danger':'warn'));root.append(row)});
  if(!items.length)root.append(node('div','empty-state','Nenhum item corresponde ao filtro.'));
}

function setFilterButtons(action,value){document.querySelectorAll(`[data-action="${action}"]`).forEach(b=>b.classList.toggle('active',b.dataset.value===value))}
function setPDVResult(message,tone='neutral'){const p=document.getElementById('pdvResult');if(!p)return;p.textContent=message;p.dataset.tone=tone}

el.nav.addEventListener('click',event=>{const b=event.target.closest('[data-page]');if(b)openPage(b.dataset.page,{focusHeading:true})});

document.addEventListener('click',event=>{
  const go=event.target.closest('[data-go]');if(go&&!go.closest('.command-results'))openPage(go.dataset.go,{focusHeading:true});
  const actionButton=event.target.closest('[data-action]');if(!actionButton)return;const action=actionButton.dataset.action;const value=actionButton.dataset.value;
  if(action==='open-search')openPalette();
  else if(action==='close-search')closePalette();
  else if(action==='add-product'){const p=demoProducts.find(x=>x.id===value);if(p){const next=Math.min((cart.get(value)||0)+1,p.stock);cart.set(value,next);renderCart();setPDVResult(`${p.name} adicionado ao carrinho.`,'ok')}}
  else if(action==='cart-inc'){const p=demoProducts.find(x=>x.id===value);if(p){cart.set(value,Math.min((cart.get(value)||0)+1,p.stock));renderCart()}}
  else if(action==='cart-dec'){const next=(cart.get(value)||0)-1;if(next<=0)cart.delete(value);else cart.set(value,next);renderCart()}
  else if(action==='cart-clear'){cart.clear();renderCart();setPDVResult('Venda de teste limpa.')}
  else if(action==='select-payment'){selectedPayment=value;document.querySelectorAll('[data-action="select-payment"]').forEach(b=>b.classList.toggle('active',b.dataset.value===selectedPayment));setPDVResult(`Pagamento selecionado: ${actionButton.textContent}.`,'ok')}
  else if(action==='sale-suspend'){setPDVResult(cart.size?'Venda de laboratório marcada como suspensa. Nenhum dado foi persistido.':'Não há itens para suspender.','warn')}
  else if(action==='sale-finalize'){const {items,total}=cartSummary();setPDVResult(items?`Validação concluída: ${items} item(ns), ${money(total)}, pagamento ${selectedPayment}. Integração real permanece bloqueada no LAB.`:'Adicione pelo menos um produto antes de finalizar. ',items?'ok':'warn')}
  else if(action==='receipt-filter'){receiptFilter=value;setFilterButtons('receipt-filter',value);renderReceipts()}
  else if(action==='stock-filter'){stockFilter=value;setFilterButtons('stock-filter',value);renderStock()}
});

el.globalSearch.addEventListener('click',openPalette);el.palette.addEventListener('click',event=>{if(event.target===el.palette)closePalette()});el.commandInput.addEventListener('input',()=>renderResults(el.commandInput.value));el.commandResults.addEventListener('click',event=>{const b=event.target.closest('[data-go]');if(b)activateResult(b)});

document.addEventListener('input',event=>{if(event.target.id==='pdvProductSearch')renderPDVProducts(event.target.value);if(event.target.id==='stockSearch')renderStock()});

document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openPalette();return}
  if(event.key==='Escape'&&el.palette.classList.contains('open')){event.preventDefault();closePalette();return}
  if(!el.palette.classList.contains('open'))return;
  if(event.key==='Enter'&&document.activeElement===el.commandInput){const first=el.commandResults.querySelector('[data-go]');if(first){event.preventDefault();activateResult(first)}return}
  if(event.key==='ArrowDown'&&document.activeElement===el.commandInput){const first=el.commandResults.querySelector('[data-go]');if(first){event.preventDefault();first.focus()}return}
  if(event.key==='Tab'){const focusable=getFocusableInPalette();if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
});

el.commandResults.addEventListener('keydown',event=>{const results=[...el.commandResults.querySelectorAll('[data-go]')];const index=results.indexOf(document.activeElement);if(index<0)return;if(event.key==='ArrowDown'){event.preventDefault();(results[index+1]||results[0]).focus()}else if(event.key==='ArrowUp'){event.preventDefault();(results[index-1]||el.commandInput).focus()}else if(event.key==='Enter'){event.preventDefault();activateResult(results[index])}});
window.addEventListener('hashchange',()=>{const key=window.location.hash.slice(1);openPage(isKnownPage(key)?key:'dashboard',{syncHash:false})});

buildImplementedModules();
const initialKey=window.location.hash.slice(1);openPage(isKnownPage(initialKey)?initialKey:'dashboard',{syncHash:!initialKey});
