(()=>{
'use strict';
const action=document.querySelector('[data-p3-action="ia-local"][data-value="entrega"]');
if(action){
  action.dataset.p3Action='ia-go';
  action.dataset.value='delivery';
  action.setAttribute('aria-label','Abrir Delivery para comparar operadores candidatos em Avaré');
}

// Bootstrap local de extensões do LAB. Mantém o index estável e carrega somente arquivos self/CSP-safe.
for(const phase of [8,9,10,11,12,13,14,15]){
  if(document.querySelector(`script[data-phase${phase}-loader]`))continue;
  const script=document.createElement('script');
  script.src=`phase${phase}.js`;
  script.async=false;
  script.dataset[`phase${phase}Loader`]='true';
  document.head.append(script);
}
})();
