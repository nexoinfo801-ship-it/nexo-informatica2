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
  return String(value||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .trim();
}

function isKnownPage(key){return Object.prototype.hasOwnProperty.call(titles,key)}

function setActiveNav(key){
  document.querySelectorAll('.nav-item').forEach(button=>{
    const active=button.dataset.page===key;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
}

function openPage(key,{syncHash=true,focusHeading=false}={}){
  const safeKey=isKnownPage(key)?key:'dashboard';
  currentPage=safeKey;
  const [title,subtitle]=titles[safeKey];

  setActiveNav(safeKey);
  el.pageTitle.textContent=title;
  el.pageSubtitle.textContent=subtitle;
  document.title=`${title} — NEXO ERP PRO 9.8 LAB`;

  if(safeKey==='dashboard'){
    el.dashboard.classList.add('active');
    el.placeholder.classList.remove('active');
  }else{
    el.dashboard.classList.remove('active');
    el.placeholder.classList.add('active');
    el.placeholderTitle.textContent=title;
    el.placeholderText.textContent=`${subtitle}. Esta área já está enquadrada no Visual Pro 360 e será conectada à lógica privada validada da linha comercial.`;
  }

  if(syncHash && window.location.hash!==`#${safeKey}`){
    history.replaceState(null,'',`#${safeKey}`);
  }

  el.liveRegion.textContent=`Módulo ${title} aberto.`;
  if(focusHeading)requestAnimationFrame(()=>el.pageTitle.focus());
}

function resetResults(message='Digite para pesquisar no NEXO ERP PRO.'){
  el.commandResults.replaceChildren(document.createTextNode(message));
}

function createResultButton(key,[title,subtitle]){
  const button=document.createElement('button');
  button.type='button';
  button.className='ghost command-result';
  button.dataset.go=key;
  button.setAttribute('role','option');

  const strong=document.createElement('strong');
  strong.textContent=title;
  const small=document.createElement('small');
  small.textContent=subtitle;
  button.append(strong,small);
  return button;
}

function renderResults(query){
  const q=normalizeText(query);
  if(!q){resetResults();return}

  const matches=Object.entries(titles)
    .filter(([,value])=>normalizeText(value.join(' ')).includes(q))
    .slice(0,8);

  el.commandResults.replaceChildren();
  if(!matches.length){
    resetResults('Nenhum módulo encontrado.');
    return;
  }
  matches.forEach(entry=>el.commandResults.appendChild(createResultButton(...entry)));
}

function getFocusableInPalette(){
  return [...el.palette.querySelectorAll('button:not([disabled]),input:not([disabled])')]
    .filter(node=>node.offsetParent!==null);
}

function openPalette(){
  if(el.palette.classList.contains('open'))return;
  lastFocused=document.activeElement instanceof HTMLElement?document.activeElement:null;
  el.palette.classList.add('open');
  el.palette.setAttribute('aria-hidden','false');
  el.globalSearch.setAttribute('aria-expanded','true');
  document.body.classList.add('no-scroll');
  requestAnimationFrame(()=>el.commandInput.focus());
}

function closePalette({restoreFocus=true}={}){
  if(!el.palette.classList.contains('open'))return;
  el.palette.classList.remove('open');
  el.palette.setAttribute('aria-hidden','true');
  el.globalSearch.setAttribute('aria-expanded','false');
  el.commandInput.value='';
  resetResults();
  document.body.classList.remove('no-scroll');
  if(restoreFocus && lastFocused)requestAnimationFrame(()=>lastFocused.focus());
}

function activateResult(button){
  if(!button)return;
  openPage(button.dataset.go,{focusHeading:true});
  closePalette({restoreFocus:false});
}

el.nav.addEventListener('click',event=>{
  const button=event.target.closest('[data-page]');
  if(button)openPage(button.dataset.page,{focusHeading:true});
});

document.addEventListener('click',event=>{
  const go=event.target.closest('[data-go]');
  if(go && !go.closest('.command-results'))openPage(go.dataset.go,{focusHeading:true});

  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='open-search')openPalette();
  if(action==='close-search')closePalette();
});

el.globalSearch.addEventListener('click',openPalette);
el.palette.addEventListener('click',event=>{if(event.target===el.palette)closePalette()});
el.commandInput.addEventListener('input',()=>renderResults(el.commandInput.value));

el.commandResults.addEventListener('click',event=>{
  const button=event.target.closest('[data-go]');
  if(button)activateResult(button);
});

document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();
    openPalette();
    return;
  }

  if(event.key==='Escape' && el.palette.classList.contains('open')){
    event.preventDefault();
    closePalette();
    return;
  }

  if(!el.palette.classList.contains('open'))return;

  if(event.key==='Enter' && document.activeElement===el.commandInput){
    const first=el.commandResults.querySelector('[data-go]');
    if(first){event.preventDefault();activateResult(first)}
    return;
  }

  if(event.key==='ArrowDown' && document.activeElement===el.commandInput){
    const first=el.commandResults.querySelector('[data-go]');
    if(first){event.preventDefault();first.focus()}
    return;
  }

  if(event.key==='Tab'){
    const focusable=getFocusableInPalette();
    if(!focusable.length)return;
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus()}
  }
});

el.commandResults.addEventListener('keydown',event=>{
  const results=[...el.commandResults.querySelectorAll('[data-go]')];
  const index=results.indexOf(document.activeElement);
  if(index<0)return;
  if(event.key==='ArrowDown'){
    event.preventDefault();
    (results[index+1]||results[0]).focus();
  }else if(event.key==='ArrowUp'){
    event.preventDefault();
    (results[index-1]||el.commandInput).focus();
  }else if(event.key==='Enter'){
    event.preventDefault();
    activateResult(results[index]);
  }
});

window.addEventListener('hashchange',()=>{
  const key=window.location.hash.slice(1);
  openPage(isKnownPage(key)?key:'dashboard',{syncHash:false});
});

const initialKey=window.location.hash.slice(1);
openPage(isKnownPage(initialKey)?initialKey:'dashboard',{syncHash:!initialKey});
