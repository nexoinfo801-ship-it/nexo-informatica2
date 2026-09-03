(()=>{
'use strict';
const d=document;
const el=(tag,cls,text)=>{const n=d.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const btn=(text,action,value,cls='ghost')=>{const b=el('button',cls,text);b.type='button';b.dataset.p9Action=action;if(value!==undefined)b.dataset.value=String(value);return b};
const pill=(text,tone='neutral')=>el('span',`pill ${tone}`,text);
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmt=v=>brl.format(v);
const announce=msg=>{const live=d.getElementById('liveRegion');if(live)live.textContent=msg};
const setResult=(msg,tone='neutral')=>{const n=d.getElementById('p9Result');if(n){n.textContent=msg;n.dataset.tone=tone}announce(msg)};

const stateLabels={NEW:'Novo',CONFIRMED:'Confirmado',PREPARING:'Em preparação',READY:'Pronto',WAITING_DRIVER:'Aguardando entregador',OUT_FOR_DELIVERY:'Saiu para entrega',DELIVERED:'Entregue',SERVING:'Servindo',PAID:'Pago',FINALIZED:'Finalizado',CANCELLED:'Cancelado'};
const flow=['NEW','CONFIRMED','PREPARING','READY','WAITING_DRIVER','OUT_FOR_DELIVERY','DELIVERED','PAID','FINALIZED'];
const nextState={NEW:'CONFIRMED',CONFIRMED:'PREPARING',PREPARING:'READY',READY:'WAITING_DRIVER',WAITING_DRIVER:'OUT_FOR_DELIVERY',OUT_FOR_DELIVERY:'DELIVERED',DELIVERED:'PAID',PAID:'FINALIZED'};

const orders=[
 {id:'000152',customer:'Cliente Demonstração 001',phone:'(14) 9****-1201',address:'Rua Demonstração A, 250',neighborhood:'Centro',reference:'Próximo à praça',payment:'PIX',total:52,fee:4,origin:'WHATSAPP',waiter:'João — Garçom',driver:'Carlos — DEMO',state:'OUT_FOR_DELIVERY',version:6,orderedAt:'12:05',elapsed:43,notes:'Sem cebola'},
 {id:'000153',customer:'Cliente Demonstração 002',phone:'(14) 9****-1202',address:'Rua Demonstração C, 90',neighborhood:'Vila Nova',reference:'Casa com portão cinza',payment:'Dinheiro',total:48,fee:7,origin:'PHONE',waiter:'Atendente 02',driver:null,state:'WAITING_DRIVER',version:5,orderedAt:'12:22',elapsed:27,notes:'Troco para R$ 50,00'},
 {id:'000154',customer:'Cliente Demonstração 003',phone:'(14) 9****-1203',address:'Avenida Demonstração B, 850',neighborhood:'Jardim América',reference:'Portaria principal',payment:'Crédito',total:86.4,fee:6,origin:'APP',waiter:'Atendente 01',driver:null,state:'READY',version:4,orderedAt:'12:31',elapsed:18,notes:'2 marmitas + bebidas'},
 {id:'000155',customer:'Cliente Demonstração 004',phone:'(14) 9****-1204',address:'Rua Demonstração D, 45',neighborhood:'Centro',reference:'Fundos',payment:'PIX',total:39.9,fee:4,origin:'WHATSAPP',waiter:'Atendente 02',driver:null,state:'PREPARING',version:3,orderedAt:'12:38',elapsed:11,notes:'Sem alho'},
 {id:'000156',customer:'Cliente Demonstração 005',phone:'(14) 9****-1205',address:'Rua Demonstração E, 100',neighborhood:'Centro',reference:'Ao lado da farmácia',payment:'Débito',total:62,fee:0,origin:'SITE',waiter:'Atendente 01',driver:'João — DEMO',state:'DELIVERED',version:7,orderedAt:'11:55',elapsed:51,notes:'Entrega grátis por regra DEMO'}
];
const drivers=[
 {id:'CARLOS',name:'Carlos — DEMO',status:'AVAILABLE',region:'Centro / Jardim América',active:0,vehicle:'Moto'},
 {id:'JOAO',name:'João — DEMO',status:'DELIVERING',region:'Centro / Vila Nova',active:1,vehicle:'Moto'},
 {id:'MARCOS',name:'Marcos — DEMO',status:'DELIVERING',region:'Centro',active:2,vehicle:'Bicicleta'}
];
const feeRules=[
 {area:'Centro',fee:4,freeAbove:50},{area:'Jardim América',fee:6,freeAbove:70},{area:'Vila Nova',fee:7,freeAbove:null},{area:'Zona Rural',fee:12,freeAbove:null}
];
const addresses=[
 {label:'Casa',address:'Rua Demonstração A, 250',area:'Centro',default:true},{label:'Trabalho',address:'Avenida Demonstração B, 850 • Sala 2',area:'Jardim América',default:false}
];
const occurrences=[
 {order:'000149',type:'Cliente não atendeu',time:'11:48',status:'Resolvida'},
 {order:'000147',type:'Endereço incorreto',time:'11:21',status:'Em análise'}
];
const processed=new Map();
let selected='000152';
let boardFilter='ACTIVE';

function ensureCss(){if(d.querySelector('link[data-phase9-css]'))return;const l=d.createElement('link');l.rel='stylesheet';l.href='phase9.css';l.dataset.phase9Css='true';d.head.append(l)}
function once(key,fn){if(processed.has(key))return processed.get(key);const result=fn();processed.set(key,result);return result}
function orderById(id){return orders.find(o=>o.id===id)}
function transition(order,to,expectedVersion){
 if(!order)return {ok:false,msg:'Pedido não encontrado.'};
 if(order.version!==expectedVersion)return {ok:false,msg:`Conflito de atualização no pedido #${order.id}. Recarregue os dados antes de continuar.`};
 if(nextState[order.state]!==to)return {ok:false,msg:`Transição ${order.state} → ${to} não permitida no LAB.`};
 order.state=to;order.version+=1;
 return {ok:true,msg:`Pedido #${order.id}: ${stateLabels[to]}.`};
}
function statusTone(state){if(['DELIVERED','PAID','FINALIZED'].includes(state))return'ok';if(['WAITING_DRIVER','PREPARING','READY'].includes(state))return'warn';if(state==='CANCELLED')return'danger';return'blue-pill'}
function visibleOrders(){if(boardFilter==='ALL')return orders;return orders.filter(o=>!['FINALIZED','CANCELLED'].includes(o.state))}
function buildMetric(label,value,detail,tone='blue'){const c=el('article',`module-metric ${tone}`);c.append(el('span','module-metric-label',label),el('strong','module-metric-value',value),el('small','module-metric-detail',detail));return c}
function panelHead(title,subtitle,side){const h=el('div','panel-head');const t=el('div');t.append(el('h2','',title),el('p','',subtitle));h.append(t);if(side)h.append(side);return h}

function renderMetrics(root){root.replaceChildren();const delivered=35,ongoing=orders.filter(o=>!['DELIVERED','PAID','FINALIZED','CANCELLED'].includes(o.state)).length;root.append(buildMetric('Entregas hoje','38','35 concluídas','blue'),buildMetric('Em andamento',String(ongoing),'Amostra do LAB','amber'),buildMetric('Tempo médio','34 min','Meta configurável','green'),buildMetric('Faturamento delivery',fmt(4850),'Demonstração','purple'),buildMetric('Taxa média',fmt(6.2),'Por entrega','blue'),buildMetric('Entregues','35','92,1%','green'))}
function renderTimeline(order){const row=el('div','p9-status-timeline');const idx=flow.indexOf(order.state);flow.forEach((s,i)=>{const step=el('span',`p9-step${i<idx?' done':''}${i===idx?' active':''}`,stateLabels[s]);row.append(step)});return row}
function renderBoard(root){root.replaceChildren();const groups=[['PREPARING','Em preparação'],['READY','Pronto'],['WAITING_DRIVER','Aguardando entregador'],['OUT_FOR_DELIVERY','Em rota'],['DELIVERED','Entregue'],['OTHER','Outros']];const data=visibleOrders();groups.forEach(([state,label])=>{let list=state==='OTHER'?data.filter(o=>!['PREPARING','READY','WAITING_DRIVER','OUT_FOR_DELIVERY','DELIVERED'].includes(o.state)):data.filter(o=>o.state===state);const col=el('section','p9-column');const ch=el('div','p9-column-head');ch.append(el('strong','',label),pill(String(list.length),list.length?'blue-pill':'neutral'));col.append(ch);const body=el('div','p9-column-list');if(!list.length)body.append(el('small','muted','Nenhum pedido'));list.forEach(o=>body.append(renderOrderCard(o)));col.append(body);root.append(col)})}
function renderOrderCard(o){const c=el('article','p9-order');const top=el('div','p9-order-top');top.append(el('h3','',`Pedido #${o.id}`),pill(stateLabels[o.state],statusTone(o.state)));const meta=el('div','p9-order-meta');meta.append(el('span','',o.customer),el('span','',o.neighborhood),el('span','',`${o.origin} • ${o.payment}`),el('span','',`${o.elapsed} min • ${fmt(o.total)}`));const dr=el('small','',o.driver?`Entregador: ${o.driver}`:'Entregador: aguardando');const actions=el('div','p9-actions');actions.append(btn('Abrir','select-order',o.id,'ghost'));if(o.state==='READY')actions.append(btn('Enviar ao Delivery','advance',o.id,'primary'));if(o.state==='WAITING_DRIVER')actions.append(btn('Sugerir entregador','suggest-driver',o.id,'ghost'));c.append(top,meta,dr,actions);return c}
function renderDrivers(root){root.replaceChildren();drivers.forEach(x=>{const c=el('div','p9-driver');c.append(el('strong','',x.name),pill(x.status==='AVAILABLE'?'Disponível':x.status==='DELIVERING'?'Em entrega':'Offline',x.status==='AVAILABLE'?'ok':x.status==='DELIVERING'?'warn':'neutral'),el('small','',`${x.vehicle} • ${x.region}`),el('small','',`${x.active} entrega(s) ativa(s)`));root.append(c)})}
function renderMobile(root){const o=orderById(selected)||orders[0];root.replaceChildren();const shell=el('div','p9-mobile-shell');const top=el('div','p9-mobile-top');top.append(el('strong','',o.driver||'Entregador Mobile'),pill(o.driver?'Sessão DEMO':'Não atribuído',o.driver?'ok':'warn'));const card=el('div','p9-mobile-card');card.append(el('h3','',`Pedido #${o.id}`),pill(stateLabels[o.state],statusTone(o.state)),renderTimeline(o));const details=el('div','p9-mobile-details');[['Cliente',o.customer],['Telefone',o.phone],['Endereço',o.address],['Bairro',o.neighborhood],['Referência',o.reference],['Pagamento',o.payment],['Valor',fmt(o.total)],['Taxa',fmt(o.fee)]].forEach(([a,b])=>{const r=el('div','p9-row');r.append(el('b','',a),el('span','',b));details.append(r)});const route=el('div','p9-route-note','LAB: “Abrir rota” apenas simula o comando. O aplicativo de mapas será aberto somente pela camada mobile privada com endereço confirmado.');const actions=el('div','p9-mobile-actions');actions.append(btn('🗺️ Abrir rota','route',o.id,'ghost'));
 if(o.state==='WAITING_DRIVER')actions.append(btn('Iniciar entrega','advance',o.id,'primary'));
 if(o.state==='OUT_FOR_DELIVERY'){actions.append(btn('Cheguei ao local','arrive',o.id,'ghost'),btn('Entrega concluída','advance',o.id,'primary'),btn('Registrar ocorrência','occurrence',o.id,'ghost'))}
 if(o.state==='DELIVERED')actions.append(btn('Registrar pagamento/confirmar','advance',o.id,'primary'));
 card.append(details,route,actions);shell.append(top,card);root.append(shell)}
function renderAddresses(root){root.replaceChildren();addresses.forEach(a=>{const r=el('div','p9-address');const left=el('div');left.append(el('strong','',a.label),el('small','',a.address));r.append(left,el('span','',a.area),pill(a.default?'Padrão':'Alternativo',a.default?'ok':'neutral'));root.append(r)})}
function renderFees(root){root.replaceChildren();feeRules.forEach(f=>{const r=el('div','p9-fee');const left=el('div');left.append(el('strong','',f.area),el('small','',f.freeAbove?`Grátis acima de ${fmt(f.freeAbove)}`:'Sem gratuidade automática'));r.append(left,el('strong','',fmt(f.fee)),pill('DEMO','neutral'));root.append(r)})}
function renderOccurrences(root){root.replaceChildren();occurrences.forEach(x=>{const r=el('div','p9-occurrence');const left=el('div');left.append(el('strong','',`#${x.order} • ${x.type}`),el('small','',x.time));r.append(left,el('span','',x.status),pill(x.status==='Resolvida'?'Resolvida':'Atenção',x.status==='Resolvida'?'ok':'warn'));root.append(r)})}
function renderSettlement(root){root.replaceChildren();[['Dinheiro esperado',280],['Dinheiro entregue',280],['PIX em entregas',190],['Remuneração estimada',35]].forEach(([label,val])=>{const r=el('div','p9-money-row');r.append(el('span','',label),el('strong','',fmt(val)),pill(label==='Dinheiro esperado'?'Acerto':'Info','neutral'));root.append(r)});root.append(btn('Simular fechamento do acerto','settle',null,'ghost'))}
function renderRoles(root){root.replaceChildren();const w=el('div','p9-role');w.append(el('strong','','Garçom Mobile'),el('p','','Mesas, comandas, produtos, observações, envio e solicitação de fechamento.'));const ulw=el('ul');['Sem alterar preço','Sem estoque/financeiro','Servidor valida permissão'].forEach(x=>ulw.append(el('li','',x)));w.append(ulw);const dr=el('div','p9-role');dr.append(el('strong','','Entregador Mobile'),el('p','','Somente entregas atribuídas, rota, status, ocorrência e recebimento.'));const uld=el('ul');['Sem ver caixa global','Sem alterar produtos/preços','Servidor valida cada comando'].forEach(x=>uld.append(el('li','',x)));dr.append(uld);root.append(w,dr)}

function mount(){ensureCss();const page=d.getElementById('page-delivery');if(!page||d.getElementById('p9DeliveryPro'))return;const wrap=el('section','p9-wrap');wrap.id='p9DeliveryPro';const metrics=el('div','module-metrics');metrics.id='p9Metrics';const controls=el('div','p9-actions');controls.append(btn('Ativos','filter','ACTIVE','filter-chip active'),btn('Todos','filter','ALL','filter-chip'));
 const boardPanel=el('article','panel');boardPanel.append(panelHead('Delivery Pro — Fluxo operacional','Pedido único, estados controlados e tempo de operação',controls));const board=el('div','p9-board');board.id='p9Board';boardPanel.append(board);
 const grid1=el('div','p9-grid');const driverPanel=el('article','panel');driverPanel.append(panelHead('Entregadores','Disponibilidade, região e carga atual',pill('Sugestão assistida','blue-pill')));const driverGrid=el('div','p9-driver-grid');driverGrid.id='p9Drivers';driverPanel.append(driverGrid);const mobilePanel=el('article','panel');mobilePanel.append(panelHead('Entregador Mobile','Terminal restrito por perfil',pill('PWA/LAN alvo','purple')));const mobile=el('div','');mobile.id='p9Mobile';mobilePanel.append(mobile);grid1.append(driverPanel,mobilePanel);
 const grid2=el('div','p9-grid');const addressPanel=el('article','panel');addressPanel.append(panelHead('Cliente e endereços','Mais de um endereço por cliente; número confirmado pelo usuário',pill('Casa + Trabalho','neutral')));const addr=el('div','p9-addresses');addr.id='p9Addresses';addressPanel.append(addr);const feesPanel=el('article','panel');feesPanel.append(panelHead('Taxas por região','Valores demonstrativos e regras de gratuidade',pill('Servidor calcula','blue-pill')));const fees=el('div','p9-fees');fees.id='p9Fees';feesPanel.append(fees);grid2.append(addressPanel,feesPanel);
 const grid3=el('div','p9-grid');const occPanel=el('article','panel');occPanel.append(panelHead('Central de ocorrências','Problemas ficam registrados e resolvidos',pill('Auditável','warn')));const occ=el('div','p9-occurrences');occ.id='p9Occurrences';occPanel.append(occ);const setPanel=el('article','panel');setPanel.append(panelHead('Acerto do entregador','Dinheiro recebido não vira caixa físico antes da prestação de contas',pill('Conciliação','green')));const settlement=el('div','p9-settlement');settlement.id='p9Settlement';setPanel.append(settlement);grid3.append(occPanel,setPanel);
 const rolePanel=el('article','panel');rolePanel.append(panelHead('Perfis Mobile','A interface esconde; o servidor realmente bloqueia',pill('RBAC','blue-pill')));const roles=el('div','p9-role-box');roles.id='p9Roles';rolePanel.append(roles);
 const result=el('div','p9-result');result.id='p9Result';result.setAttribute('role','status');result.setAttribute('aria-live','polite');
 wrap.append(metrics,boardPanel,grid1,grid2,grid3,rolePanel,result);page.append(wrap);renderAll()}
function renderAll(){const ids={m:'p9Metrics',b:'p9Board',d:'p9Drivers',mo:'p9Mobile',a:'p9Addresses',f:'p9Fees',o:'p9Occurrences',s:'p9Settlement',r:'p9Roles'};renderMetrics(d.getElementById(ids.m));renderBoard(d.getElementById(ids.b));renderDrivers(d.getElementById(ids.d));renderMobile(d.getElementById(ids.mo));renderAddresses(d.getElementById(ids.a));renderFees(d.getElementById(ids.f));renderOccurrences(d.getElementById(ids.o));renderSettlement(d.getElementById(ids.s));renderRoles(d.getElementById(ids.r))}
function suggestDriver(order){const available=drivers.filter(x=>x.status==='AVAILABLE').sort((a,b)=>a.active-b.active)[0];if(!available)return {ok:false,msg:'Nenhum entregador disponível no LAB.'};if(order.driver)return {ok:false,msg:`Pedido #${order.id} já possui entregador.`};order.driver=available.name;available.active+=1;available.status='DELIVERING';return {ok:true,msg:`${available.name} sugerido para o pedido #${order.id}. Atribuição definitiva exige confirmação do gerente.`}}

d.addEventListener('click',ev=>{const b=ev.target.closest('[data-p9-action]');if(!b)return;const action=b.dataset.p9Action;const id=b.dataset.value;const order=id?orderById(id):null;
 if(action==='filter'){boardFilter=id;d.querySelectorAll('[data-p9-action="filter"]').forEach(x=>x.classList.toggle('active',x.dataset.value===id));renderBoard(d.getElementById('p9Board'));return}
 if(action==='select-order'){selected=id;renderMobile(d.getElementById('p9Mobile'));setResult(`Pedido #${id} aberto no Entregador Mobile.`,'ok');return}
 if(action==='suggest-driver'){const res=once(`ASSIGN:${id}`,()=>suggestDriver(order));renderAll();setResult(res.msg,res.ok?'ok':'warn');return}
 if(action==='route'){setResult(`LAB: rota do pedido #${id} não abriu serviço externo. A camada privada usará o endereço confirmado.`,'neutral');return}
 if(action==='arrive'){const res=once(`ARRIVE:${id}`,()=>({ok:true,msg:`Chegada registrada uma única vez para o pedido #${id} (simulação).`}));setResult(res.msg,'ok');return}
 if(action==='occurrence'){const res=once(`OCC:${id}:DEMO`,()=>{occurrences.unshift({order:id,type:'Cliente ausente — DEMO',time:'agora',status:'Em análise'});return {ok:true,msg:`Ocorrência registrada para o pedido #${id} sem duplicação.`}});renderOccurrences(d.getElementById('p9Occurrences'));setResult(res.msg,'warn');return}
 if(action==='advance'&&order){const target=nextState[order.state];if(!target){setResult(`Pedido #${id} não possui próxima etapa automática no LAB.`,'warn');return}const key=`STATE:${id}:${order.state}->${target}`;const expected=order.version;const res=once(key,()=>transition(order,target,expected));selected=id;renderAll();setResult(res.msg,res.ok?'ok':'danger');return}
 if(action==='settle'){const res=once('SETTLEMENT:CARLOS:DEMO',()=>({ok:true,msg:'Acerto DEMO conferido: diferença R$ 0,00. Nenhum caixa real foi alterado.'}));setResult(res.msg,'ok')}
});

const observer=new MutationObserver(()=>queueMicrotask(mount));
d.addEventListener('DOMContentLoaded',()=>{mount();observer.observe(d.getElementById('workspace')||d.body,{childList:true,subtree:true})});
})();
