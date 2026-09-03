(()=>{
'use strict';
const n=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const pill=(text,tone='neutral')=>n('span',`pill ${tone}`,text);
const btn=(text,action,value)=>{const el=n('button','ghost p10-action',text);el.type='button';el.dataset.p10Action=action;if(value!==undefined)el.dataset.value=String(value);return el};
const announce=message=>{const live=document.getElementById('liveRegion');if(live)live.textContent=message};

const intelligence={
 licenses:{active:187,trial:23,expiring:11,expired:4},
 usage:{high:112,medium:51,low:24,inactive:9},
 backups:{ok:183,warning:2,failed:1,notConfigured:1},
 systems:{updated:174,outdated:22},
 alerts:[
  {severity:'CRITICAL',text:'1 backup com falha de integridade — revisar antes de atualização.'},
  {severity:'HIGH',text:'2 instalações com backup em alerta.'},
  {severity:'WARNING',text:'7 clientes sem comunicação recente.'},
  {severity:'WARNING',text:'11 licenças próximas do vencimento.'},
  {severity:'INFO',text:'22 instalações em versão anterior à recomendada.'}
 ],
 recommendations:[
  {tenant:'Marmitaria Demonstração LAB',type:'HEALTH',severity:'HIGH',summary:'Pouco espaço livre, backup em alerta e erros críticos recentes.',action:'Abrir diagnóstico; não atualizar antes de backup válido.'},
  {tenant:'Marmitaria Demonstração LAB',type:'TRAINING',severity:'WARNING',summary:'Pedidos e caixa são usados, mas estoque e delivery quase não aparecem nas métricas agregadas.',action:'Sugerir treinamento de ficha técnica, estoque e delivery.'}
 ]
};

function ensureStyles(){if(document.querySelector('link[data-phase10-css]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='phase10.css';link.dataset.phase10Css='true';document.head.append(link)}
function metric(label,value,detail,tone){const a=n('article',`module-metric ${tone}`);a.append(n('span','module-metric-label',label),n('strong','module-metric-value',value),n('small','module-metric-detail',detail));return a}
function head(title,subtitle,side){const h=n('div','panel-head');const t=n('div');t.append(n('h2','',title),n('p','',subtitle));h.append(t);if(side)h.append(side);return h}
function severityTone(s){return s==='CRITICAL'?'danger':s==='HIGH'?'warn':s==='WARNING'?'blue-pill':'neutral'}

function appendIntelligence(){
 const page=document.getElementById('page-ia');if(!page||document.getElementById('p10Intelligence'))return;
 const root=n('section','p10-root');root.id='p10Intelligence';
 const intro=n('article','panel p10-hero');intro.append(head('NEXO Intelligence','Central de análise para licenças, uso, saúde, backup e suporte',pill('IA não executa regra crítica','purple')));
 const flow=n('div','p10-flow');['OBSERVAR','ANALISAR','SUGERIR','PEDIR AUTORIZAÇÃO','EXECUTAR REGRA PERMITIDA','REGISTRAR'].forEach((x,i)=>{flow.append(pill(x,i<3?'purple':i===3?'warn':'neutral'));if(i<5)flow.append(n('span','p10-arrow','→'))});intro.append(flow,n('p','p10-note','Licenciamento, permissões, restauração, fechamento financeiro e bloqueios continuam sob motores determinísticos do backend.'));
 root.append(intro);
 const metrics=n('div','module-metrics');metrics.append(metric('Licenças ativas',String(intelligence.licenses.active),'23 em teste','green'),metric('Vencendo',String(intelligence.licenses.expiring),'Próximos 7 dias','amber'),metric('Backups OK',String(intelligence.backups.ok),'2 alertas • 1 falha','blue'),metric('Versões antigas',String(intelligence.systems.outdated),'Atualização controlada','purple'));root.append(metrics);
 const grid=n('div','module-grid two');
 const alerts=n('article','panel');alerts.append(head('Alertas priorizados','Somente metadados operacionais e métricas minimizadas',pill('LGPD / minimização','ok')));const list=n('div','p10-list');intelligence.alerts.forEach(a=>{const row=n('div','p10-row');row.append(pill(a.severity,severityTone(a.severity)),n('span','',a.text));list.append(row)});alerts.append(list);
 const usage=n('article','panel');usage.append(head('Índice de Uso NEXO','Score calculado por regras objetivas; IA apenas interpreta',pill('Regra v1','blue-pill')));const bars=n('div','p10-usage');[['Alta',112,'green'],['Média',51,'blue-pill'],['Baixa',24,'warn'],['Inativa',9,'danger']].forEach(([label,value,tone])=>{const row=n('div','p10-usage-row');row.append(n('span','',label),n('strong','',String(value)),pill(`${Math.round(value/196*100)}%`,tone));bars.append(row)});usage.append(bars);
 grid.append(alerts,usage);root.append(grid);
 const rec=n('article','panel');rec.append(head('Recomendações da IA','Toda ação sensível continua pendente de aprovação humana',pill('PROPOSED','purple')));const recList=n('div','p10-recommendations');intelligence.recommendations.forEach((r,idx)=>{const card=n('div','p10-rec');const top=n('div','p10-rec-top');top.append(pill(r.type,r.type==='HEALTH'?'warn':'blue-pill'),pill(r.severity,severityTone(r.severity)));card.append(top,n('strong','',r.tenant),n('p','',r.summary),n('small','',r.action),btn('Solicitar revisão humana','review-recommendation',idx));recList.append(card)});rec.append(recList);root.append(rec);
 page.append(root);
}

function appendAgentSupport(){
 const page=document.getElementById('page-suporte');if(!page||document.getElementById('p10Agent'))return;
 const root=n('section','p10-root');root.id='p10Agent';
 const metrics=n('div','module-metrics');metrics.append(metric('Agent','ONLINE','Heartbeat recebido','green'),metric('Backup','ATENÇÃO','Validação pendente em 1 cenário','amber'),metric('Disco livre','6,2 GB','Exemplo LAB','red'),metric('Versão','9.7','Atualização disponível','purple'));root.append(metrics);
 const grid=n('div','module-grid two');
 const agent=n('article','panel');agent.append(head('NEXO Agent','Serviço alvo para heartbeat, backup, atualização e diagnóstico',pill('Contrato LAB','neutral')));const items=n('div','p10-list');[['Heartbeat','60 s configurável','ok'],['Métricas','Agregadas/minimizadas','ok'],['Backup','Consistente → criptografado → upload → validação','blue-pill'],['Atualização','Backup válido obrigatório antes do update','warn'],['Recuperação','Nova máquina → autenticação → backup → validação','purple']].forEach(([a,b,t])=>{const row=n('div','p10-row');row.append(n('strong','',a),n('span','',b),pill('Definido',t));items.append(row)});agent.append(items);
 const privacy=n('article','panel');privacy.append(head('Privacidade e autoridade','O Agent não envia conteúdo desnecessário',pill('Central segura','green')));const rules=n('ul','p10-rules');['Uso enviado como contagem/módulo, não como pedidos detalhados.','Chave do provedor de IA nunca vai no executável do cliente.','Falha de internet não equivale a revogação de licença.','IA não bloqueia licença nem restaura banco por decisão própria.','Acesso remoto exige solicitação, autorização e auditoria.'].forEach(x=>rules.append(n('li','',x)));privacy.append(rules);
 grid.append(agent,privacy);root.append(grid);
 page.append(root);
}

function appendDashboardHealth(){
 const page=document.getElementById('page-dashboard');if(!page||document.getElementById('p10DashboardIntel'))return;
 const card=n('article','panel p10-dashboard');card.id='p10DashboardIntel';card.append(head('NEXO Intelligence','Resumo executivo da plataforma — dados demonstrativos',pill('LAB','purple')));const row=n('div','p10-dashboard-row');row.append(pill('1 backup falho','danger'),pill('11 licenças vencendo','warn'),pill('7 sem comunicação','blue-pill'),pill('22 versões antigas','neutral'));card.append(row);page.append(card);
}

function load(){ensureStyles();appendIntelligence();appendAgentSupport();appendDashboardHealth()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();

document.addEventListener('click',event=>{const target=event.target.closest('[data-p10-action]');if(!target)return;if(target.dataset.p10Action==='review-recommendation'){const idx=Number(target.dataset.value||0);const r=intelligence.recommendations[idx];target.disabled=true;target.textContent='Revisão solicitada';announce(`Recomendação ${r?.type||''} marcada para revisão humana no LAB. Nenhuma ação crítica foi executada.`)}});
})();
