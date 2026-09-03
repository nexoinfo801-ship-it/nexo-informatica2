(()=>{
'use strict';

const n=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const btn=(text,className,action,value)=>{const el=n('button',className,text);el.type='button';el.dataset.p4Action=action;if(value!==undefined)el.dataset.value=String(value);return el};
const pill=(text,tone='neutral')=>n('span',`pill ${tone}`,text);
const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const panelHead=(title,subtitle,side)=>{const head=n('div','panel-head');const text=n('div');text.append(n('h2','',title),n('p','',subtitle));head.append(text);if(side)head.append(side);return head};
const announce=message=>{const live=document.getElementById('liveRegion');if(live)live.textContent=message};

const supplyItems=Object.freeze([
 {sku:'INS-001',name:'Queijo mussarela',physical:8,reserved:3,min:12,max:40,safety:6,onOrder:20,leadDays:2,supplier:'Fornecedor Alpha'},
 {sku:'POR-006',name:'Batata congelada 2kg',physical:9,reserved:4,min:10,max:30,safety:5,onOrder:12,leadDays:2,supplier:'Fornecedor Beta'},
 {sku:'EMB-004',name:'Embalagem delivery M',physical:27,reserved:15,min:30,max:180,safety:20,onOrder:100,leadDays:3,supplier:'PaperBox / cotar'},
 {sku:'SOB-003',name:'Sobremesa da Casa',physical:6,reserved:2,min:8,max:24,safety:4,onOrder:0,leadDays:1,supplier:'Fornecedor a definir'},
 {sku:'BEB-012',name:'Refrigerante 350ml',physical:64,reserved:12,min:30,max:96,safety:18,onOrder:24,leadDays:1,supplier:'Distribuidora Sul'}
]);

const backupHistory=[
 {when:'Hoje 02:12',kind:'Automático',status:'Verificado',size:'18,4 MB'},
 {when:'Ontem 02:08',kind:'Automático',status:'Verificado',size:'18,1 MB'},
 {when:'Há 2 dias 02:11',kind:'Automático',status:'Verificado',size:'17,9 MB'},
 {when:'Há 3 dias 14:36',kind:'Manual',status:'Verificado',size:'17,8 MB'}
];

const dailyReport=Object.freeze({
 sales:{count:186,total:12450.90,cancellations:3,cancelledValue:184.50,adjustments:2},
 products:{unitsSold:412,distinct:67,top:'X-Burger Especial'},
 stock:{purchaseEntries:128,saleOutputs:412,lossOutputs:4,positiveAdjustments:2,negativeAdjustments:1},
 finance:{inflow:10984.40,outflow:5320.60,net:5663.80},
 payments:[
  ['Dinheiro',3420.00],['PIX',4180.90],['Débito',914.20],['Crédito',2892.80],['Marketplace',812.00],['Fiado',231.00]
 ],
 cash:{opening:300.00,cashSales:3420.00,supplies:100.00,withdrawals:450.00,expected:3370.00}
});

let stockAlertAcknowledged=false;

function available(item){return item.physical-item.reserved}
function projected(item){return available(item)+item.onOrder}
function alertItems(){return supplyItems.filter(item=>available(item)<=item.min)}
function alertTone(item){return available(item)<=item.safety?'danger':'warn'}
function suggestionQty(item){return Math.max(0,item.max-projected(item))}

function ensureStyles(){
 if(document.querySelector('link[data-phase4-css]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href='phase4.css';link.dataset.phase4Css='true';document.head.append(link);
}

function appendGlobalStockAlert(){
 const main=document.querySelector('main.main');const topbar=main?.querySelector('.topbar');
 if(!main||!topbar||document.getElementById('p4GlobalStockAlert'))return;
 const alerts=alertItems();if(!alerts.length)return;
 const critical=alerts.filter(item=>alertTone(item)==='danger').length;
 const box=n('section','p4-global-alert');box.id='p4GlobalStockAlert';box.setAttribute('role','alert');
 const text=n('div');text.append(n('strong','',`${alerts.length} item(ns) com estoque baixo`),n('span','',critical?`${critical} crítico(s). Revise Suprimentos antes de ocorrer ruptura.`:'Revise Suprimentos para evitar ruptura.'));
 const actions=n('div','p4-alert-actions');actions.append(btn('Abrir Estoque','ghost small','go-stock'),btn('Ciente nesta sessão','ghost small','ack-stock-alert'));
 box.append(pill(critical?'CRÍTICO':'ATENÇÃO',critical?'danger':'warn'),text,actions);
 topbar.insertAdjacentElement('afterend',box);
}

function appendSupplyModule(){
 const page=document.getElementById('page-estoque');if(!page||document.getElementById('p4SupplyPanel'))return;
 const alerts=alertItems();const critical=alerts.filter(item=>alertTone(item)==='danger').length;const onOrder=supplyItems.reduce((sum,item)=>sum+item.onOrder,0);
 const wrap=n('div','p4-supply-wrap');wrap.id='p4SupplyPanel';
 const metrics=n('div','module-metrics');
 const metric=(label,value,detail,tone)=>{const el=n('article',`module-metric ${tone}`);el.append(n('span','module-metric-label',label),n('strong','module-metric-value',value),n('small','module-metric-detail',detail));return el};
 metrics.append(metric('Alertas de estoque',String(alerts.length),`${critical} crítico(s)`,'red'),metric('Itens em trânsito',String(onOrder),'Não somam ao físico','purple'),metric('Políticas ativas',String(supplyItems.length),'Mín./máx./segurança','blue'),metric('Lead time médio','1,8 dias','Amostra do LAB','green'));
 const card=n('article','panel');card.append(panelHead('Suprimentos e Reposição','Mínimo, máximo, segurança, lead time, fornecedor e compra sugerida',pill('LAB','blue-pill')));
 const rows=n('div','p4-supply-table');
 const header=n('div','p4-supply-row p4-head');['Item','Disponível','Mín./Máx.','Em trânsito','Projetado','Sugestão','Ação'].forEach(label=>header.append(n('strong','',label)));rows.append(header);
 supplyItems.forEach(item=>{
  const avail=available(item);const qty=suggestionQty(item);const row=n('div','p4-supply-row');
  const info=n('div');info.append(n('strong','',item.name),n('span','',`${item.sku} • ${item.supplier} • lead ${item.leadDays}d`));
  const status=avail<=item.min?pill(avail<=item.safety?'Crítico':'Baixo',alertTone(item)):pill('OK','ok');
  const action=qty>0?btn(`Preparar ${qty}`,'ghost small','prepare-supply',item.sku):pill(item.onOrder>0?'Aguardar recebimento':'Coberto','neutral');
  row.append(info,n('b',avail<=item.min?'warn-text':'ok-text',String(avail)),n('span','',`${item.min} / ${item.max}`),n('span','',String(item.onOrder)),n('span','',String(projected(item))),status,action);rows.append(row);
 });
 card.append(rows);
 const rule=n('div','p4-rule');rule.append(n('strong','', 'Regra do LAB'),n('span','', 'Alerta quando disponível ≤ mínimo; crítico quando disponível ≤ estoque de segurança. Quantidade sugerida considera o que já está em trânsito.'));
 wrap.append(metrics,card,rule);page.append(wrap);
}

function appendBackupPanel(){
 const page=document.getElementById('page-suporte');if(!page||document.getElementById('p4BackupPanel'))return;
 const card=n('article','panel p4-backup-panel');card.id='p4BackupPanel';
 card.append(panelHead('Backup automático diário','Histórico, integridade e recuperação controlada',pill('Projeto 9.8','ok')));
 const meta=n('div','p4-backup-meta');
 [['Agendamento','1× por dia • horário configurável'],['Catch-up','Se o PC estiver desligado, executar no próximo início'],['Verificação','quick_check + SHA-256 antes de marcar como válido'],['Retenção padrão','30 diários + 12 mensais, configurável']].forEach(([a,b])=>{const row=n('div','p4-meta-row');row.append(n('strong','',a),n('span','',b));meta.append(row)});
 const history=n('div','p4-backup-history');backupHistory.forEach(item=>{const row=n('div','p4-backup-row');row.append(n('strong','',item.when),n('span','',item.kind),n('span','',item.size),pill(item.status,'ok'));history.append(row)});
 const actions=n('div','p4-backup-actions');actions.append(btn('Executar backup LAB','primary','backup-run'),btn('Validar restauração LAB','ghost','backup-restore-test'));
 const result=n('p','lab-action-result','Nenhum backup real é criado na camada pública.');result.id='p4BackupResult';result.setAttribute('aria-live','polite');
 card.append(meta,history,actions,result);page.append(card);
}

function reportSection(title,rows){
 const card=n('article','panel p4-daily-section');card.append(n('h3','',title));const list=n('div','p4-daily-list');
 rows.forEach(([label,value,tone])=>{const row=n('div','p4-daily-row');row.append(n('span','',label),n('strong',tone||'',value));list.append(row)});card.append(list);return card;
}

function appendDailyReport(){
 const page=document.getElementById('page-relatorios');if(!page||document.getElementById('p4DailyReport'))return;
 const wrap=n('section','p4-daily-report');wrap.id='p4DailyReport';
 const head=n('article','panel p4-daily-head');head.append(panelHead('Relatório Diário Completo','Consolidação auditável das operações do dia',pill('FECHAMENTO','blue-pill')));
 const summary=n('div','module-metrics');const metric=(label,value,detail,tone)=>{const el=n('article',`module-metric ${tone}`);el.append(n('span','module-metric-label',label),n('strong','module-metric-value',value),n('small','module-metric-detail',detail));return el};
 summary.append(metric('Vendas',String(dailyReport.sales.count),money(dailyReport.sales.total),'blue'),metric('Entrada financeira',money(dailyReport.finance.inflow),`Saídas ${money(dailyReport.finance.outflow)}`,'green'),metric('Produtos vendidos',String(dailyReport.products.unitsSold),`${dailyReport.products.distinct} SKUs`,'purple'),metric('Cancelamentos',String(dailyReport.sales.cancellations),money(dailyReport.sales.cancelledValue),'red'));head.append(summary);
 const grid=n('div','p4-daily-grid');
 grid.append(
  reportSection('Vendas e produtos',[[ 'Total de vendas',money(dailyReport.sales.total),'ok-text'],['Vendas realizadas',String(dailyReport.sales.count)],['Unidades vendidas',String(dailyReport.products.unitsSold)],['Produtos/SKUs distintos',String(dailyReport.products.distinct)],['Mais vendido',dailyReport.products.top],['Cancelamentos / valor',`${dailyReport.sales.cancellations} • ${money(dailyReport.sales.cancelledValue)}`],['Ajustes auditados',String(dailyReport.sales.adjustments)]]),
  reportSection('Movimentações de estoque',[[ 'Entradas por compras',`${dailyReport.stock.purchaseEntries} un.`,'ok-text'],['Saídas por vendas',`${dailyReport.stock.saleOutputs} un.`],['Perdas',`${dailyReport.stock.lossOutputs} un.`,'danger-text'],['Ajustes positivos',`+${dailyReport.stock.positiveAdjustments} un.`,'ok-text'],['Ajustes negativos',`-${dailyReport.stock.negativeAdjustments} un.`,'warn-text']]),
  reportSection('Financeiro',[[ 'Entradas financeiras',money(dailyReport.finance.inflow),'ok-text'],['Saídas financeiras',money(dailyReport.finance.outflow),'danger-text'],['Saldo líquido do dia',money(dailyReport.finance.net),'ok-text']]),
  reportSection('Caixa físico',[[ 'Fundo inicial',money(dailyReport.cash.opening)],['Vendas em dinheiro',money(dailyReport.cash.cashSales),'ok-text'],['Suprimentos',money(dailyReport.cash.supplies),'ok-text'],['Sangrias',money(dailyReport.cash.withdrawals),'danger-text'],['Caixa esperado',money(dailyReport.cash.expected),'ok-text']])
 );
 const payments=n('article','panel p4-payments');payments.append(n('h3','', 'Formas de pagamento'));const paymentList=n('div','p4-payment-grid');dailyReport.payments.forEach(([method,value])=>{const row=n('div','p4-payment-row');row.append(n('span','',method),n('strong','',money(value)));paymentList.append(row)});payments.append(paymentList);
 const general=n('article','panel p4-general');general.append(n('h3','', 'Resumo geral e conferência'),n('p','', 'O relatório diário deve cruzar venda, itens, pagamentos, estoque, financeiro, cancelamentos, ajustes, caixa e auditoria. Divergências entre totais devem aparecer como alerta e impedir o fechamento silencioso.'),btn('Gerar prévia diária LAB','primary','daily-report-generate'));
 const result=n('p','lab-action-result','Prévia ainda não gerada nesta sessão.');result.id='p4DailyResult';result.setAttribute('aria-live','polite');general.append(result);
 wrap.append(head,grid,payments,general);page.append(wrap);
}

function buildAll(){ensureStyles();appendGlobalStockAlert();appendSupplyModule();appendBackupPanel();appendDailyReport()}

function setResult(id,message,tone='neutral'){const el=document.getElementById(id);if(el){el.textContent=message;el.dataset.tone=tone}}

document.addEventListener('click',event=>{
 const target=event.target.closest('[data-p4-action]');if(!target)return;const action=target.dataset.p4Action;const value=target.dataset.value;
 if(action==='go-stock'){window.openPage?.('estoque',{focusHeading:true})}
 else if(action==='ack-stock-alert'){stockAlertAcknowledged=true;document.getElementById('p4GlobalStockAlert')?.remove();announce('Alerta de estoque reconhecido nesta sessão do LAB.')}
 else if(action==='prepare-supply'){const item=supplyItems.find(x=>x.sku===value);if(item){const qty=suggestionQty(item);announce(`Rascunho de suprimento preparado para ${item.name}: ${qty} unidade(s). Nada foi gravado.`)}}
 else if(action==='backup-run')setResult('p4BackupResult','Backup LAB simulado: criação → quick_check → SHA-256 → histórico. Nenhum arquivo real foi alterado.','ok')
 else if(action==='backup-restore-test')setResult('p4BackupResult','Teste de restauração LAB simulado em banco isolado; produção exige fechamento/controlador exclusivo do banco.','ok')
 else if(action==='daily-report-generate'){const paymentTotal=dailyReport.payments.reduce((sum,[,value])=>sum+value,0);const diff=Math.abs(paymentTotal-dailyReport.sales.total);setResult('p4DailyResult',diff<0.005?`Prévia conferida: formas de pagamento fecham com ${money(dailyReport.sales.total)}. Snapshot real será assinado com hash no Electron privado.`:`Divergência detectada: ${money(diff)}. Fechamento deve ser bloqueado.` ,diff<0.005?'ok':'warn')}
});

buildAll();
})();