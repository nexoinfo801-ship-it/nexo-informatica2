(()=>{
'use strict';

const d=document;
const el=(tag,cls,text)=>{const n=d.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const button=(text,action,value,cls='ghost')=>{const b=el('button',cls,text);b.type='button';b.dataset.p6Action=action;if(value!==undefined)b.dataset.value=value;return b};
const pill=(text,tone='neutral')=>el('span',`pill ${tone}`,text);
const head=(title,subtitle,side)=>{const h=el('div','panel-head');const t=el('div');t.append(el('h2','',title),el('p','',subtitle));h.append(t);if(side)h.append(side);return h};

const peripherals=[
 {id:'ELGIN_I7',vendor:'Elgin',model:'i7 / i7 Plus',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows / Linux',source:'Bz Tech + fabricante',trust:'Candidato',package:'Elgin i7/i8/i9 Driver Pack'},
 {id:'ELGIN_I8',vendor:'Elgin',model:'i8',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows / Linux',source:'Bz Tech + fabricante',trust:'Candidato',package:'Elgin i7/i8/i9 Driver Pack'},
 {id:'ELGIN_I9',vendor:'Elgin',model:'i9 Full / Full 2',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows / Linux / ARM',source:'Bz Tech + fabricante',trust:'Candidato',package:'Elgin i7/i8/i9 Driver Pack'},
 {id:'BEM_MP4200_TH',vendor:'Bematech',model:'MP-4200 TH',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows / Linux',source:'Bz Tech',trust:'Candidato',package:'Spooler 5.0.04 / Linux'},
 {id:'BEM_MP4200_ADV',vendor:'Bematech',model:'MP-4200 TH ADV',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows / Linux',source:'Bz Tech',trust:'Candidato',package:'Spooler 5.0.04 / Linux'},
 {id:'BEM_MP4200_HS',vendor:'Bematech',model:'MP-4200 HS',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows',source:'Bz Tech',trust:'Candidato',package:'MP-4200 HS Driver'},
 {id:'EPSON_T20X',vendor:'Epson',model:'TM-T20X',category:'Cupom',kind:'THERMAL_RECEIPT',mode:'REQUIRED',os:'Windows 11/10',source:'Epson oficial',trust:'Verificado',package:'APD 6.07R1'},
 {id:'ELGIN_L42PRO',vendor:'Elgin',model:'L42 Pro Full',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows',source:'Elgin oficial',trust:'Verificado',package:'EPL / ZPL / PPLA / PPLB'},
 {id:'ZEBRA_ZD220',vendor:'Zebra',model:'ZD220',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows',source:'Zebra oficial',trust:'Verificado',package:'Zebra Printer Driver'},
 {id:'ZEBRA_ZD230',vendor:'Zebra',model:'ZD230',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows',source:'Zebra oficial',trust:'Verificado',package:'Zebra Printer Driver'},
 {id:'ZEBRA_ZD421',vendor:'Zebra',model:'ZD421',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows',source:'Zebra oficial',trust:'Verificado',package:'Windows Printer Driver v10'},
 {id:'ARGOX_OS214PRO',vendor:'Argox',model:'OS-214 Pro',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows / Linux',source:'Argox oficial',trust:'Verificado',package:'Windows 12.5.0 / Linux 1.10.0'},
 {id:'ARGOX_OS214NU',vendor:'Argox',model:'OS-214NU',category:'Etiqueta',kind:'LABEL_PRINTER',mode:'REQUIRED',os:'Windows / Linux',source:'Argox oficial',trust:'Verificado',package:'Windows / Linux Driver'},
 {id:'ELGIN_FLASH2',vendor:'Elgin',model:'Flash II',category:'Leitor',kind:'BARCODE_SCANNER',mode:'HID_NO_DRIVER',os:'Windows / Linux / macOS',source:'Elgin oficial',trust:'Verificado',package:'USB HID — sem driver extra'},
 {id:'ZEBRA_DS2208',vendor:'Zebra',model:'DS2208',category:'Leitor',kind:'BARCODE_SCANNER',mode:'OPTIONAL',os:'Windows',source:'Zebra oficial',trust:'Verificado',package:'HID sem driver / CDC 2.15.0004'},
 {id:'DATALOGIC_QS2500',vendor:'Datalogic',model:'QuickScan 2500',category:'Leitor',kind:'BARCODE_SCANNER',mode:'OPTIONAL',os:'Windows 10/11',source:'Datalogic oficial',trust:'Verificado',package:'USB-COM 7.1.5'},
 {id:'DATALOGIC_GRY4200',vendor:'Datalogic',model:'Gryphon 4200',category:'Leitor',kind:'BARCODE_SCANNER',mode:'OPTIONAL',os:'Windows 10/11',source:'Datalogic oficial',trust:'Verificado',package:'USB-COM 7.1.5'},
 {id:'DATALOGIC_GRY4600',vendor:'Datalogic',model:'Gryphon 4600',category:'Leitor',kind:'BARCODE_SCANNER',mode:'OPTIONAL',os:'Windows 10/11',source:'Datalogic oficial',trust:'Verificado',package:'USB-COM 7.1.5'}
];

const labelTemplates=[
 {id:'LBL_PRICE_40X25',name:'Preço 40×25 mm',sym:'EAN-13',lang:'Spooler Windows'},
 {id:'LBL_PRODUCT_50X30',name:'Produto 50×30 mm',sym:'Code 128',lang:'ZPL'},
 {id:'LBL_SHELF_60X40',name:'Gôndola 60×40 mm',sym:'EAN-13',lang:'ZPL'},
 {id:'LBL_QR_50X50',name:'QR Produto 50×50 mm',sym:'QR',lang:'ZPL'}
];

let category='ALL';
let selectedModel='EPSON_T20X';

function ensureCss(){if(d.querySelector('link[data-phase6-css]'))return;const l=d.createElement('link');l.rel='stylesheet';l.href='phase6.css';l.dataset.phase6Css='true';d.head.append(l)}
function trustTone(value){return value==='Verificado'?'ok':value==='Homologado'?'ok':'warn'}
function driverAdvice(model){
 if(model.mode==='HID_NO_DRIVER')return {tone:'ok',title:'Nenhum driver extra necessário',text:`${model.vendor} ${model.model} pode operar como teclado USB-HID. A IA recomenda testar leitura no PDV antes de instalar qualquer pacote.`};
 if(model.trust==='Candidato')return {tone:'warn',title:'Validação obrigatória antes da instalação',text:`${model.package}. A fonte está cadastrada, mas o NEXO deve validar HTTPS, assinatura digital, hash SHA-256 e compatibilidade do Windows antes de liberar instalação.`};
 return {tone:'blue-pill',title:'Pacote recomendado pelo catálogo',text:`${model.package} para ${model.os}. Mesmo sendo fonte verificada, a instalação exige confirmação do administrador e teste de impressão/leitura.`};
}

function renderDriverCenter(){
 const page=d.getElementById('page-integracoes');if(!page||d.getElementById('p6DriverCenter'))return;
 const wrap=el('section','p6-wrap');wrap.id='p6DriverCenter';
 const top=el('article','panel');const actions=el('div','p6-actions');actions.append(button('Todos','filter','ALL','filter-chip active'),button('Cupom','filter','THERMAL_RECEIPT','filter-chip'),button('Etiquetas','filter','LABEL_PRINTER','filter-chip'),button('Leitores','filter','BARCODE_SCANNER','filter-chip'));top.append(head('Central de Drivers & Periféricos','Catálogo seguro para impressoras, etiquetas e leitores',actions));
 const warning=el('div','demo-notice');warning.append(pill('LAB','blue-pill'),el('span','', 'O catálogo armazena metadados e fontes. O NEXO não executa instaladores automaticamente nem baixa binários sem validação.'));
 const list=el('div','p6-driver-grid');list.id='p6DriverGrid';
 const ai=el('article','panel p6-ai-card');ai.id='p6DriverAi';ai.append(head('NEXO IA — Driver Care','Diagnóstico, recomendação e proteção contra driver incorreto',pill('IA','ai')));const result=el('div','p6-ai-result');result.id='p6AiResult';ai.append(result,button('Simular detecção de periféricos','device-scan',null,'primary'));
 wrap.append(top,warning,list,ai);page.append(wrap);renderDriverList();renderAiAdvice();
}

function renderDriverList(){
 const root=d.getElementById('p6DriverGrid');if(!root)return;root.replaceChildren();
 const filtered=category==='ALL'?peripherals:peripherals.filter(p=>p.kind===category);
 filtered.forEach(p=>{const c=el('article','panel p6-driver-card');const title=el('div','p6-card-title');title.append(el('strong','',`${p.vendor} ${p.model}`),pill(p.category,p.kind==='BARCODE_SCANNER'?'purple':p.kind==='LABEL_PRINTER'?'blue-pill':'neutral'));c.append(title,el('p','p6-driver-package',p.package));const meta=el('div','p6-meta');meta.append(el('span','',p.os),el('span','',p.source),pill(p.trust,trustTone(p.trust)));c.append(meta,button('Analisar com NEXO IA','analyze-driver',p.id,'ghost'));root.append(c)});
 d.querySelectorAll('[data-p6-action="filter"]').forEach(b=>b.classList.toggle('active',b.dataset.value===category));
}

function renderAiAdvice(){const root=d.getElementById('p6AiResult');if(!root)return;const m=peripherals.find(p=>p.id===selectedModel)||peripherals[0];const a=driverAdvice(m);root.replaceChildren();root.append(pill(`${m.vendor} ${m.model}`,a.tone),el('h3','',a.title),el('p','',a.text));const checks=el('ul','p6-checks');['Modelo e USB VID/PID','Windows e arquitetura','Fonte autorizada','Assinatura digital','SHA-256','Ponto de restauração/rollback','Teste de impressão ou leitura'].forEach(x=>checks.append(el('li','',x)));root.append(checks)}

function renderLabelCenter(){
 const page=d.getElementById('page-produtos');if(!page||d.getElementById('p6LabelCenter'))return;
 const panel=el('article','panel p6-label-center');panel.id='p6LabelCenter';panel.append(head('Etiquetas de Produto','Preço, SKU, código de barras e QR por modelo de etiqueta',pill('4 modelos','blue-pill')));
 const form=el('div','p6-label-form');
 const name=el('input','');name.id='p6LabelName';name.placeholder='Nome do produto';name.value='Marmita Grande';
 const sku=el('input','');sku.id='p6LabelSku';sku.placeholder='SKU / código';sku.value='7891234567895';
 const price=el('input','');price.id='p6LabelPrice';price.placeholder='Preço';price.value='29,90';
 const qty=el('input','');qty.id='p6LabelQty';qty.type='number';qty.min='1';qty.max='1000';qty.value='1';
 const select=el('select','');select.id='p6LabelTemplate';labelTemplates.forEach(t=>{const o=el('option','',`${t.name} • ${t.sym}`);o.value=t.id;select.append(o)});
 form.append(name,sku,price,qty,select,button('Gerar etiqueta LAB','label-preview',null,'primary'));
 const preview=el('div','p6-label-preview');preview.id='p6LabelPreview';panel.append(form,preview);page.append(panel);renderLabelPreview();
}

function renderLabelPreview(){const root=d.getElementById('p6LabelPreview');if(!root)return;const t=labelTemplates.find(x=>x.id===d.getElementById('p6LabelTemplate')?.value)||labelTemplates[0];const name=d.getElementById('p6LabelName')?.value||'Produto';const sku=d.getElementById('p6LabelSku')?.value||'0000000000000';const price=d.getElementById('p6LabelPrice')?.value||'0,00';const qty=Math.max(1,Math.min(1000,Number(d.getElementById('p6LabelQty')?.value||1)));root.replaceChildren();const tag=el('div','p6-label-paper');tag.append(el('strong','',name),el('b','',`R$ ${price}`),el('span','p6-barcode',t.sym==='QR'?'▦ QR':`|||| ||| |||| ${sku}`),el('small','',`${t.name} • ${t.lang}`));root.append(tag,el('p','p6-label-note',`${qty} cópia(s) em rascunho. Nenhum trabalho foi enviado para uma impressora física.`))}

function renderAiModule(){
 const page=d.getElementById('page-ia');if(!page||d.getElementById('p6AiModule'))return;const p=el('article','panel');p.id='p6AiModule';p.append(head('NEXO IA — Cuidador de Periféricos','Mantém catálogo, diagnostica compatibilidade e orienta instalação segura',pill('Driver Care','ai')));const grid=el('div','p6-ai-capabilities');[
 ['Detectar','Identificar impressora/leitor, conexão, SO e arquitetura.'],['Recomendar','Escolher driver compatível; em USB-HID evitar instalação desnecessária.'],['Validar','Conferir fonte, assinatura, hash e versão antes de liberar.'],['Etiquetas','Escolher linguagem/tamanho e orientar calibração.'],['Diagnosticar','Distinguir driver, porta, spooler, firmware, cabo e configuração.'],['Auditar','Registrar recomendação, aprovação humana, teste e rollback.']
 ].forEach(([a,b])=>{const c=el('div','p6-capability');c.append(el('strong','',a),el('p','',b));grid.append(c)});p.append(grid,el('p','p6-safety','Regra de segurança: a IA pode recomendar e preparar; instalação com privilégio administrativo exige aprovação humana.'));page.append(p)
}

function ensureAll(){ensureCss();renderDriverCenter();renderLabelCenter();renderAiModule()}

d.addEventListener('click',ev=>{const b=ev.target.closest('[data-p6-action]');if(!b)return;const action=b.dataset.p6Action;if(action==='filter'){category=b.dataset.value;renderDriverList()}else if(action==='analyze-driver'){selectedModel=b.dataset.value;renderAiAdvice();d.getElementById('p6DriverAi')?.scrollIntoView({block:'nearest'})}else if(action==='device-scan'){selectedModel=['ELGIN_I9','ZEBRA_DS2208','ARGOX_OS214PRO'][Math.floor(Math.random()*3)];renderAiAdvice()}else if(action==='label-preview'){renderLabelPreview()}});
d.addEventListener('input',ev=>{if(['p6LabelName','p6LabelSku','p6LabelPrice','p6LabelQty'].includes(ev.target.id))renderLabelPreview()});
d.addEventListener('change',ev=>{if(ev.target.id==='p6LabelTemplate')renderLabelPreview()});

const observer=new MutationObserver(()=>queueMicrotask(ensureAll));
d.addEventListener('DOMContentLoaded',()=>{ensureAll();const root=d.getElementById('workspace')||d.body;observer.observe(root,{childList:true,subtree:true})});
})();
