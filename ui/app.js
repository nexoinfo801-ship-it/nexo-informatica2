const titles={dashboard:['Dashboard','Visão executiva e saúde operacional do negócio'],pdv:['Nova Venda / PDV','Venda rápida, pagamentos e operação de balcão'],pedidos:['Pedidos','Fila operacional, status e acompanhamento'],produtos:['Produtos','Cadastro, preços, margem e código de barras'],estoque:['Estoque','Físico, reservado, disponível, planejado e em trânsito'],compras:['Compras','Suprimentos, fornecedores e recebimentos'],caixa:['Caixa','Abertura, sangria, suprimento e fechamento'],recebimentos:['Recebimentos 360','Venda, previsão e liquidação real'],financeiro:['Financeiro','Contas, aging, conciliação, fluxo e DRE'],delivery:['Delivery','Pedidos, rotas, taxas e entregas'],clientes:['Clientes','Histórico, crédito, relacionamento e retenção'],fornecedores:['Fornecedores','Cadastro, negociação e desempenho'],relatorios:['Relatórios','Indicadores, exportações e auditoria'],ia:['NEXO IA','Insights locais com confirmação humana'],integracoes:['Integrações','Conectores, saúde e credenciais seguras'],suporte:['Licença e Suporte','Licença, heartbeat, chamados e diagnóstico']};

const nav=document.querySelector('.nav');
const dashboard=document.getElementById('page-dashboard');
const placeholder=document.getElementById('page-placeholder');
const pageTitle=document.getElementById('pageTitle');
const pageSubtitle=document.getElementById('pageSubtitle');
const placeholderTitle=document.getElementById('placeholderTitle');
const palette=document.getElementById('commandPalette');
const commandInput=document.getElementById('commandInput');

function openPage(key){
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===key));
  const [title,subtitle]=titles[key]||['Módulo','NEXO ERP PRO 9.8 LAB'];
  pageTitle.textContent=title; pageSubtitle.textContent=subtitle;
  if(key==='dashboard'){
    dashboard.classList.add('active'); placeholder.classList.remove('active');
  }else{
    dashboard.classList.remove('active'); placeholder.classList.add('active');
    placeholderTitle.textContent=title;
    document.getElementById('placeholderText').textContent=`${subtitle}. Esta área já está enquadrada no Visual Pro 360 e será conectada à lógica privada validada da linha comercial.`;
  }
}

nav.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)openPage(b.dataset.page)});

function openPalette(){palette.classList.add('open');palette.setAttribute('aria-hidden','false');setTimeout(()=>commandInput.focus(),0)}
function closePalette(){palette.classList.remove('open');palette.setAttribute('aria-hidden','true');commandInput.value=''}
document.getElementById('globalSearch').addEventListener('click',openPalette);
palette.addEventListener('click',e=>{if(e.target===palette)closePalette()});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}
  if(e.key==='Escape')closePalette();
});

commandInput.addEventListener('input',()=>{
  const q=commandInput.value.trim().toLowerCase();
  const out=document.querySelector('.command-results');
  if(!q){out.textContent='Digite para pesquisar no NEXO ERP PRO.';return}
  const matches=Object.entries(titles).filter(([,v])=>v.join(' ').toLowerCase().includes(q)).slice(0,6);
  out.innerHTML=matches.length?matches.map(([k,v])=>`<button class="ghost command-result" data-go="${k}">${v[0]}<br><small>${v[1]}</small></button>`).join(' '):'Nenhum módulo encontrado.';
});
document.querySelector('.command-results').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){openPage(b.dataset.go);closePalette()}});
