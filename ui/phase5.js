(()=>{
'use strict';

const n=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const btn=(text,className,action,value)=>{const el=n('button',className,text);el.type='button';if(action)el.dataset.p5Action=action;if(value!==undefined)el.dataset.value=String(value);return el};
const pill=(text,tone='neutral')=>n('span',`pill ${tone}`,text);
const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const panelHead=(title,subtitle,side)=>{const head=n('div','panel-head');const txt=n('div');txt.append(n('h2','',title),n('p','',subtitle));head.append(txt);if(side)head.append(side);return head};
const announce=message=>{const live=document.getElementById('liveRegion');if(live)live.textContent=message};
const setResult=(id,message,tone='neutral')=>{const el=document.getElementById(id);if(el){el.textContent=message;el.dataset.tone=tone}};

const tableState=[
 {id:'T01',label:'Mesa 01',status:'FREE',waiter:'—',guests:0,total:0},
 {id:'T02',label:'Mesa 02',status:'OCCUPIED',waiter:'Ana',guests:2,total:78.50},
 {id:'T03',label:'Mesa 03',status:'PREPARING',waiter:'João',guests:4,total:164.90},
 {id:'T04',label:'Mesa 04',status:'READY',waiter:'Maria',guests:2,total:92.00},
 {id:'T05',label:'Mesa 05',status:'SERVING',waiter:'Ana',guests:3,total:133.40},
 {id:'T06',label:'Mesa 06',status:'CLOSING',waiter:'João',guests:2,total:86.30},
 {id:'T07',label:'Mesa 07',status:'FREE',waiter:'—',guests:0,total:0},
 {id:'T08',label:'Mesa 08',status:'OCCUPIED',waiter:'João',guests:2,total:61.90}
];

const productionTickets=[
 {id:'K-210',order:'P-1204',table:'Mesa 03',sector:'KITCHEN',status:'PREPARING',age:11,waiter:'João',items:['2 × Marmita Grande','Bife • arroz • feijão • salada','1 sem cebola • 1 trocar ovo por carne']},
 {id:'K-211',order:'P-1205',table:'Mesa 04',sector:'KITCHEN',status:'READY',age:8,waiter:'Maria',items:['1 × Marmita Média','Frango • arroz • feijão • farofa']},
 {id:'B-089',order:'P-1204',table:'Mesa 03',sector:'BAR',status:'PREPARING',age:5,waiter:'João',items:['2 × Coca-Cola','gelo + limão']},
 {id:'B-090',order:'P-1205',table:'Mesa 04',sector:'BAR',status:'READY',age:4,waiter:'Maria',items:['1 × Suco de laranja','sem açúcar']}
];

const modifierGroups=[
 {name:'Proteína',min:1,max:1,required:true,freeQuota:1,options:[['Bife',0],['Frango',0],['Linguiça',0],['Ovo',0],['Carne adicional',6]]},
 {name:'Acompanhamentos',min:1,max:3,required:true,freeQuota:3,options:[['Arroz',0],['Feijão',0],['Salada',0],['Farofa',0],['Batata',3]]},
 {name:'Remoções',min:0,max:4,required:false,freeQuota:4,options:[['Sem cebola',0],['Sem alho',0],['Sem refogado',0],['Sem salada',0]]},
 {name:'Substituições',min:0,max:1,required:false,freeQuota:0,options:[['Trocar ovo por carne',5],['Trocar arroz por salada',0]]}
];

const printerRoutes=[
 {destination:'CAIXA',printer:'EPSON TM-T20 — Caixa',state:'CONFIGURED',detail:'Rota cadastrada; teste físico ainda pendente'},
 {destination:'COZINHA',printer:'Bematech MP-4200 — Cozinha',state:'CONFIGURED',detail:'Itens KITCHEN; hardware ainda não homologado'},
 {destination:'BAR',printer:'Elgin i9 — Bar',state:'CONFIGURED',detail:'Itens BAR; hardware ainda não homologado'},
 {destination:'EXPEDIÇÃO',printer:'Fila Windows — Expedição',state:'IMPLEMENTED',detail:'Contrato de conferência/retirada'}
];

const thematicMenus=[
 {name:'Almoço Mexicano',date:'15/09/2026',hours:'11:00–15:00',price:42.90,items:8,state:'Programado'},
 {name:'Almoço Italiano',date:'22/09/2026',hours:'11:00–15:00',price:44.90,items:9,state:'Rascunho'},
 {name:'Almoço Caipira',date:'29/09/2026',hours:'11:00–15:00',price:39.90,items:7,state:'Rascunho'}
];

const losses=[
 {item:'Carne bovina',qty:'2,0 kg',unitCost:25,total:50,reason:'Desperdício no preparo',responsible:'Cozinha A'},
 {item:'Arroz cozido',qty:'1,5 kg',unitCost:7.2,total:10.8,reason:'Sobra não reaproveitável',responsible:'Cozinha B'},
 {item:'Refrigerante lata',qty:'2 un.',unitCost:3.1,total:6.2,reason:'Avaria',responsible:'Bar'}
];

const integrationMaturity=[
 {name:'Consulta CEP',state:'IMPLEMENTED',detail:'Contrato e cache definidos; rede bloqueada no LAB'},
 {name:'Impressão por setor',state:'CONFIGURED',detail:'Rotas demonstrativas; teste e homologação física pendentes'},
 {name:'Garçom mobile/LAN',state:'IMPLEMENTED',detail:'UI/contrato definidos; servidor privado ainda não ligado'},
 {name:'Fiscal / TEF',state:'NOT_CONFIGURED',detail:'Depende de provedor, credenciais e homologação'},
 {name:'Backup diário',state:'IMPLEMENTED',detail:'Contrato e regressão estática prontos; geração/restauração física ainda são gates privados'}
];

const selectedModifiers=new Set(['Bife','Arroz','Feijão','Salada','Sem cebola','Trocar ovo por carne']);
let restaurantTab='salao';
let selectedTableId='T08';
let waiterOrderSent=false;

function ensureStyles(){
 if(document.querySelector('link[data-phase5-css]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href='phase5.css';link.dataset.phase5Css='true';document.head.append(link);
}

function statusLabel(status){return({FREE:'Livre',OCCUPIED:'Ocupada',ORDER_SENT:'Pedido enviado',PREPARING:'Em preparo',READY:'Pronto',SERVING:'Servindo',CLOSING:'Fechamento',NEW:'Novo',ACCEPTED:'Aceito',DELIVERED:'Entregue'})[status]||status}
function statusTone(status){return status==='FREE'||status==='READY'||status==='DELIVERED'?'ok':status==='OCCUPIED'||status==='ORDER_SENT'?'blue-pill':status==='PREPARING'||status==='ACCEPTED'?'warn':status==='CLOSING'?'purple':'neutral'}
function maturityLabel(status){return({IMPLEMENTED:'Implementado',CONFIGURED:'Configurado',TESTED:'Testado',HOMOLOGATED:'Homologado',NOT_CONFIGURED:'Não configurado'})[status]||status}
function maturityTone(status){return status==='HOMOLOGATED'?'ok':status==='TESTED'?'blue-pill':status==='CONFIGURED'?'purple':status==='IMPLEMENTED'?'neutral':'warn'}
function modifierGroupForOption(option){return modifierGroups.find(group=>group.options.some(([label])=>label===option))}
function modifierCount(group){return group.options.filter(([label])=>selectedModifiers.has(label)).length}
function validateModifierSelection(){
 for(const group of modifierGroups){const count=modifierCount(group);if(count<group.min)return{ok:false,message:`${group.name}: escolha pelo menos ${group.min}.`};if(count>group.max)return{ok:false,message:`${group.name}: escolha no máximo ${group.max}.`}}
 return{ok:true,message:'Modificadores válidos.'};
}
function toggleModifier(option){
 const group=modifierGroupForOption(option);if(!group)return;
 if(selectedModifiers.has(option)){selectedModifiers.delete(option);renderRestaurant();return}
 if(modifierCount(group)>=group.max){announce(`${group.name}: limite máximo de ${group.max} escolha(s).`);setResult('p5WaiterResult',`${group.name}: limite máximo de ${group.max} escolha(s).`,'warn');return}
 selectedModifiers.add(option);renderRestaurant();
}

function restaurantNotice(){const box=n('div','demo-notice');box.append(pill('LAB','blue-pill'),n('span','', 'Operação Restaurante é demonstrativa: estados mudam somente nesta sessão e não baixam estoque nem gravam venda real.'));return box}

function appendRestaurantOperations(){
 const page=document.getElementById('page-pedidos');if(!page||document.getElementById('p5RestaurantOps'))return;
 const wrap=n('section','p5-restaurant');wrap.id='p5RestaurantOps';wrap.append(restaurantNotice());
 const tabs=n('div','p5-tabs');
 [['salao','Salão'],['garcom','Garçom Mobile'],['cozinha','Cozinha KDS'],['bar','Bar'],['impressao','Impressão'],['tematico','Cardápio Temático']].forEach(([value,label])=>tabs.append(btn(label,`filter-chip${value===restaurantTab?' active':''}`,'restaurant-tab',value)));
 const head=n('article','panel p5-restaurant-head');head.append(panelHead('Operação Restaurante / Marmitaria','Mesa → roteamento por setor → produção → serviço → caixa',tabs));wrap.append(head);
 const content=n('div','p5-restaurant-content');content.id='p5RestaurantContent';wrap.append(content);page.append(wrap);renderRestaurant();
}

function renderRestaurant(){
 const root=document.getElementById('p5RestaurantContent');if(!root)return;root.replaceChildren();
 document.querySelectorAll('[data-p5-action="restaurant-tab"]').forEach(b=>b.classList.toggle('active',b.dataset.value===restaurantTab));
 if(restaurantTab==='salao')renderSalon(root);
 else if(restaurantTab==='garcom')renderWaiter(root);
 else if(restaurantTab==='cozinha')renderKDS(root,'KITCHEN');
 else if(restaurantTab==='bar')renderKDS(root,'BAR');
 else if(restaurantTab==='impressao')renderPrinters(root);
 else renderThematic(root);
}

function renderSalon(root){
 const metrics=n('div','module-metrics');
 const count=s=>tableState.filter(t=>t.status===s).length;
 const metric=(l,v,d,t)=>{const c=n('article',`module-metric ${t}`);c.append(n('span','module-metric-label',l),n('strong','module-metric-value',v),n('small','module-metric-detail',d));return c};
 metrics.append(metric('Mesas livres',String(count('FREE')),'Prontas para abrir','green'),metric('Em atendimento',String(tableState.length-count('FREE')-count('CLOSING')),'Salão ativo','blue'),metric('Prontas',String(count('READY')),'Garçom deve retirar','purple'),metric('Fechamento',String(count('CLOSING')),'Aguardando caixa','amber'));root.append(metrics);
 const layout=n('div','p5-salon-layout');const grid=n('article','panel');grid.append(panelHead('Mapa do Salão','Selecione uma mesa para acompanhar o fluxo',pill('8 mesas','neutral')));const cards=n('div','p5-table-grid');
 tableState.forEach(t=>{const card=btn('',`p5-table-card${t.id===selectedTableId?' selected':''}`,'select-table',t.id);card.append(n('strong','',t.label),pill(statusLabel(t.status),statusTone(t.status)),n('span','',t.waiter==='—'?'Sem garçom':`Garçom ${t.waiter}`),n('b','',t.total?money(t.total):'Livre'));cards.append(card)});grid.append(cards);
 const detail=n('article','panel');const t=tableState.find(x=>x.id===selectedTableId)||tableState[0];detail.append(panelHead(t.label,`${t.guests||0} pessoa(s) • Garçom ${t.waiter}`,pill(statusLabel(t.status),statusTone(t.status))));const flow=n('div','p5-flow');['Livre','Ocupada','Pedido enviado','Em preparo','Pronto','Servindo','Fechamento'].forEach(label=>flow.append(n('span','p5-flow-step',label)));detail.append(flow,n('p','p5-help','O estado global da mesa acompanha os tickets de produção e a passagem para o Caixa. Mudanças reais exigirão transação + auditoria no Electron privado.'),btn('Abrir no Garçom','primary p5-wide','open-waiter',t.id));layout.append(grid,detail);root.append(layout);
}

function renderModifierGroup(group){
 const card=n('div','p5-mod-group');const title=n('div','p5-mod-title');title.append(n('strong','',group.name),pill(`${group.min}–${group.max} • grátis ${group.freeQuota}`,group.required?'blue-pill':'neutral'));card.append(title);const opts=n('div','p5-mod-options');
 group.options.forEach(([label,extra])=>{const active=selectedModifiers.has(label);const b=btn('',`p5-mod-option${active?' active':''}`,'modifier-toggle',label);b.append(n('span','',label),n('b','',extra?`+ ${money(extra)}`:'Incluso'));opts.append(b)});card.append(opts);return card;
}

function renderWaiter(root){
 const layout=n('div','p5-waiter-layout');const phone=n('article','panel p5-phone');phone.append(panelHead('Garçom Mobile — Mesa 08','Interface touch para celular/tablet',pill(waiterOrderSent?'Enviado':'Rascunho',waiterOrderSent?'ok':'warn')));
 const order=n('div','p5-order-card');order.append(n('h3','', 'Marmita Grande'),n('p','', 'Monte o pedido usando opções estruturadas; observação livre fica apenas para exceções.'));modifierGroups.forEach(g=>order.append(renderModifierGroup(g)));
 const drinks=n('div','p5-order-card');drinks.append(n('h3','', 'Bebidas'),n('div','p5-drink-row','1 × Coca-Cola • gelo + limão'),n('div','p5-drink-row','1 × Suco de laranja • sem açúcar'));
 const send=btn(waiterOrderSent?'Pedido enviado nesta sessão':'ENVIAR PEDIDO','primary p5-send','waiter-send');send.disabled=waiterOrderSent;const result=n('p','lab-action-result',waiterOrderSent?'Cozinha e Bar receberam tickets separados.':'Nenhum pedido real foi criado.');result.id='p5WaiterResult';result.setAttribute('aria-live','polite');phone.append(order,drinks,send,result);
 const status=n('article','panel');status.append(panelHead('Comunicação em tempo real','Mesma comanda, setores independentes',pill('ROTEADOR','purple')));const route=n('div','p5-route');[['Marmita Grande','COZINHA','KITCHEN'],['Coca-Cola','BAR','BAR'],['Suco de laranja','BAR','BAR']].forEach(([item,label,sector])=>{const row=n('div','p5-route-row');row.append(n('strong','',item),pill(label,sector==='BAR'?'purple':'blue-pill'));route.append(row)});status.append(route);
 const notif=n('div','p5-waiter-notify');notif.append(n('h3','', 'Atualizações para o garçom'));const related=productionTickets.filter(t=>t.table==='Mesa 08');if(!related.length)notif.append(n('p','',waiterOrderSent?'Aguardando atualização dos setores.':'Envie o pedido para gerar tickets demonstrativos.'));else related.forEach(t=>notif.append(n('p','',`${t.sector==='KITCHEN'?'Cozinha':'Bar'}: ${statusLabel(t.status)}`)));status.append(notif);layout.append(phone,status);root.append(layout);
}

function nextTicketStatus(status){return({NEW:'ACCEPTED',ACCEPTED:'PREPARING',PREPARING:'READY',READY:'DELIVERED'})[status]||status}
function renderKDS(root,sector){
 const tickets=productionTickets.filter(t=>t.sector===sector);const title=sector==='KITCHEN'?'Cozinha KDS':'Bar';const metrics=n('div','module-metrics');const metric=(l,v,d,t)=>{const c=n('article',`module-metric ${t}`);c.append(n('span','module-metric-label',l),n('strong','module-metric-value',v),n('small','module-metric-detail',d));return c};
 metrics.append(metric('Novos',String(tickets.filter(t=>t.status==='NEW').length),'Aguardando aceite','red'),metric('Em preparo',String(tickets.filter(t=>['ACCEPTED','PREPARING'].includes(t.status)).length),'Fila ativa','amber'),metric('Prontos',String(tickets.filter(t=>t.status==='READY').length),'Avisar garçom','green'),metric('Tempo alvo',sector==='KITCHEN'?'18 min':'6 min','Configuração por setor','blue'));root.append(metrics);
 const board=n('article','panel');board.append(panelHead(title,sector==='KITCHEN'?'Somente itens de produção da cozinha':'Somente bebidas/sobremesas roteadas ao bar',pill('KDS','blue-pill')));const cards=n('div','p5-kds-grid');tickets.forEach(t=>{const card=n('div',`p5-ticket ${t.status.toLowerCase()}`);const top=n('div','p5-ticket-top');top.append(n('strong','',`${t.table} • ${t.order}`),pill(statusLabel(t.status),statusTone(t.status)));card.append(top,n('span','p5-ticket-meta',`Garçom ${t.waiter} • ${t.age} min`));const items=n('ul','p5-ticket-items');t.items.forEach(item=>items.append(n('li','',item)));card.append(items);if(t.status!=='DELIVERED'){const next=nextTicketStatus(t.status);card.append(btn(next===t.status?'Concluído':statusLabel(next),'primary p5-wide','ticket-advance',t.id))}cards.append(card)});board.append(cards);root.append(board);
}

function renderPrinters(root){
 const card=n('article','panel');card.append(panelHead('Impressão por setor','Rotas independentes mantendo vínculo com pedido e mesa',pill('Hardware pendente','warn')));const rows=n('div','p5-printer-list');printerRoutes.forEach(r=>{const row=n('div','p5-printer-row');const info=n('div');info.append(n('strong','',r.destination),n('span','',r.detail));row.append(info,n('span','',r.printer),pill(maturityLabel(r.state),maturityTone(r.state)),btn('Teste LAB','ghost small','printer-test',r.destination));rows.append(row)});card.append(rows);const queue=n('div','p5-print-queue');queue.append(n('h3','', 'Fila persistente — contrato alvo'),n('p','', 'QUEUED → PRINTING → PRINTED / FAILED. Falha precisa guardar tentativas, erro e permitir reimpressão auditada; nunca perder silenciosamente uma comanda.'));card.append(queue);root.append(card);
}

function renderThematic(root){
 const metrics=n('div','module-metrics');const metric=(l,v,d,t)=>{const c=n('article',`module-metric ${t}`);c.append(n('span','module-metric-label',l),n('strong','module-metric-value',v),n('small','module-metric-detail',d));return c};metrics.append(metric('Eventos','3','1 programado','blue'),metric('Preço fixo',money(42.90),'Exemplo próximo evento','green'),metric('Janela','11h–15h','Venda determinística','purple'),metric('Produtos vinculados','8','Almoço Mexicano','amber'));root.append(metrics);
 const grid=n('div','p5-theme-grid');thematicMenus.forEach(e=>{const card=n('article','panel p5-theme-card');card.append(pill(e.state,e.state==='Programado'?'ok':'neutral'),n('h2','',e.name),n('p','',`${e.date} • ${e.hours}`),n('strong','p5-theme-price',money(e.price)),n('span','',`${e.items} produtos vinculados`),btn('Revisar evento','ghost p5-wide','theme-review',e.name));grid.append(card)});root.append(grid);
}

function appendProductFoodPanel(){
 const page=document.getElementById('page-produtos');if(!page||document.getElementById('p5FoodProduct'))return;
 const cost=10,price=15,profit=price-cost,margin=profit/price*100,markup=profit/cost*100;const wrap=n('section','p5-product-food');wrap.id='p5FoodProduct';
 const grid=n('div','module-grid two');const recipe=n('article','panel');recipe.append(panelHead('Ficha Técnica / Composição','CMV, rendimento e baixa de ingredientes',pill('MARMITA','blue-pill')));const rows=n('div','p5-recipe-list');[['Arroz','180 g','R$ 1,10'],['Feijão','140 g','R$ 1,25'],['Bife','160 g','R$ 5,20'],['Salada','90 g','R$ 0,90'],['Embalagem','1 un.','R$ 0,85']].forEach(([item,qty,c])=>{const row=n('div','p5-recipe-row');row.append(n('strong','',item),n('span','',qty),n('b','',c));rows.append(row)});recipe.append(rows,n('p','p5-help','A baixa real deve acontecer pela ficha técnica somente após a operação canônica de produção/venda definida no banco privado.'));
 const economics=n('article','panel');economics.append(panelHead('Custo, Margem e Markup','Conceitos exibidos separadamente',pill('Sem ambiguidade','ok')));const econ=n('div','p5-economics');[['Custo',money(cost)],['Venda',money(price)],['Lucro bruto',money(profit)],['Margem sobre venda',`${margin.toFixed(2).replace('.',',')}%`],['Markup sobre custo',`${markup.toFixed(2).replace('.',',')}%`]].forEach(([a,b])=>{const row=n('div','p5-econ-row');row.append(n('span','',a),n('strong','',b));econ.append(row)});economics.append(econ);grid.append(recipe,economics);wrap.append(grid);
 const mods=n('article','panel');mods.append(panelHead('Matriz de Modificadores','Mínimo, máximo, cota grátis, preço e substituição',pill('Estruturado','purple')));const table=n('div','p5-mod-matrix');modifierGroups.forEach(g=>{const row=n('div','p5-mod-matrix-row');row.append(n('strong','',g.name),n('span','',`mín. ${g.min}`),n('span','',`máx. ${g.max}`),pill(g.required?'Obrigatório':'Opcional',g.required?'blue-pill':'neutral'),n('span','',`cota grátis ${g.freeQuota} • ${g.options.some(([,p])=>p>0)?'possui adicionais':'sem adicional'}`));table.append(row)});mods.append(table);wrap.append(mods);page.append(wrap);
}

function appendLossPanel(){
 const page=document.getElementById('page-estoque');if(!page||document.getElementById('p5LossPanel'))return;
 const total=losses.reduce((sum,x)=>sum+x.total,0);const card=n('article','panel p5-loss-panel');card.id='p5LossPanel';card.append(panelHead('Perdas e Desperdício','Quantidade, custo, motivo, responsável e auditoria',pill(money(total),'danger')));const rows=n('div','p5-loss-list');losses.forEach(x=>{const row=n('div','p5-loss-row');const info=n('div');info.append(n('strong','',x.item),n('span','',`${x.qty} • ${x.reason}`));row.append(info,n('span','',x.responsible),n('span','',`Custo un. ${money(x.unitCost)}`),n('b','danger-text',money(x.total)));rows.append(row)});card.append(rows,btn('Registrar perda LAB','ghost','loss-register'));const result=n('p','lab-action-result','Nenhuma perda real registrada.');result.id='p5LossResult';result.setAttribute('aria-live','polite');card.append(result);page.append(card);
}

function appendRestaurantReport(){
 const page=document.getElementById('page-relatorios');if(!page||document.getElementById('p5RestaurantReport'))return;
 const card=n('section','panel p5-report');card.id='p5RestaurantReport';card.append(panelHead('Operação Restaurante — Relatório Diário','Extensão do fechamento com produção, salão e perdas',pill('DIÁRIO','blue-pill')));const grid=n('div','p5-report-grid');[
  ['Salão','42 pedidos','Ticket médio R$ 71,30','2 cancelamentos'],
  ['Cozinha','86 itens produzidos','Tempo médio 16m 40s','4 atrasados'],
  ['Bar','61 itens produzidos','Tempo médio 4m 20s','1 atrasado'],
  ['Delivery','37 entregues','3 atrasadas','Taxas R$ 292,30'],
  ['Perdas',money(losses.reduce((s,x)=>s+x.total,0)),'3 ocorrências','Auditoria obrigatória'],
  ['Conferência','Vendas = Pagamentos','Diferença R$ 0,00','Produção conciliada']
 ].forEach(([title,a,b,c])=>{const item=n('article','p5-report-card');item.append(n('strong','',title),n('span','',a),n('span','',b),n('small','',c));grid.append(item)});card.append(grid);page.append(card);
}

function appendIntegrationMaturity(){
 const page=document.getElementById('page-integracoes');if(!page||document.getElementById('p5IntegrationMaturity'))return;
 const card=n('article','panel p5-integration');card.id='p5IntegrationMaturity';card.append(panelHead('Maturidade das Integrações','Separar existência técnica de prontidão comercial',pill('Sem % ambígua','ok')));const legend=n('div','p5-maturity-legend');['IMPLEMENTED','CONFIGURED','TESTED','HOMOLOGATED','NOT_CONFIGURED'].forEach(s=>legend.append(pill(maturityLabel(s),maturityTone(s))));card.append(legend);const rows=n('div','p5-integration-list');integrationMaturity.forEach(i=>{const row=n('div','p5-integration-row');const text=n('div');text.append(n('strong','',i.name),n('span','',i.detail));row.append(text,pill(maturityLabel(i.state),maturityTone(i.state)));rows.append(row)});card.append(rows,n('p','p5-help','“Homologado” será reservado a teste real com serviço, credencial, Windows ou hardware quando o conector depender deles.'));page.append(card);
}

function updateTableFromTickets(tableLabel){
 const table=tableState.find(t=>t.label===tableLabel);if(!table)return;const tickets=productionTickets.filter(t=>t.table===tableLabel);if(!tickets.length)return;
 if(tickets.every(t=>t.status==='DELIVERED'))table.status='SERVING';
 else if(tickets.every(t=>['READY','DELIVERED'].includes(t.status)))table.status='READY';
 else if(tickets.some(t=>['ACCEPTED','PREPARING'].includes(t.status)))table.status='PREPARING';
 else if(tickets.some(t=>t.status==='NEW'))table.status='ORDER_SENT';
}

function sendWaiterDemo(){
 if(waiterOrderSent)return;const validation=validateModifierSelection();if(!validation.ok){setResult('p5WaiterResult',validation.message,'warn');announce(validation.message);return}
 waiterOrderSent=true;const table=tableState.find(t=>t.id==='T08');if(table){table.status='ORDER_SENT';table.waiter='João';table.total=61.90}
 productionTickets.push(
  {id:'K-212',order:'P-1206',table:'Mesa 08',sector:'KITCHEN',status:'NEW',age:0,waiter:'João',items:['1 × Marmita Grande','Bife • arroz • feijão • salada','Sem cebola • trocar ovo por carne']},
  {id:'B-091',order:'P-1206',table:'Mesa 08',sector:'BAR',status:'NEW',age:0,waiter:'João',items:['1 × Coca-Cola — gelo + limão','1 × Suco de laranja — sem açúcar']}
 );announce('Pedido demonstrativo da Mesa 08 roteado para Cozinha e Bar.');renderRestaurant();
}

function buildAll(){ensureStyles();appendRestaurantOperations();appendProductFoodPanel();appendLossPanel();appendRestaurantReport();appendIntegrationMaturity()}

document.addEventListener('click',event=>{
 const target=event.target.closest('[data-p5-action]');if(!target)return;const action=target.dataset.p5Action;const value=target.dataset.value;
 if(action==='restaurant-tab'){restaurantTab=value;renderRestaurant()}
 else if(action==='select-table'){selectedTableId=value;renderRestaurant()}
 else if(action==='open-waiter'){selectedTableId=value;restaurantTab='garcom';renderRestaurant()}
 else if(action==='modifier-toggle')toggleModifier(value);
 else if(action==='waiter-send')sendWaiterDemo();
 else if(action==='ticket-advance'){const ticket=productionTickets.find(t=>t.id===value);if(ticket){ticket.status=nextTicketStatus(ticket.status);updateTableFromTickets(ticket.table);announce(`${ticket.id}: ${statusLabel(ticket.status)}.`);renderRestaurant()}}
 else if(action==='printer-test')announce(`Teste LAB da rota ${value}: nenhum dado foi enviado para impressora física.`)
 else if(action==='theme-review')announce(`Evento ${value} aberto somente para revisão demonstrativa.`)
 else if(action==='loss-register')setResult('p5LossResult','Registro de perda LAB validado: produto + quantidade + custo + motivo + responsável + auditoria. Nada persistido.','ok');
});

buildAll();
})();
