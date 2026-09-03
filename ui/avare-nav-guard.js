(()=>{
'use strict';
const action=document.querySelector('[data-p3-action="ia-local"][data-value="entrega"]');
if(action){
  action.dataset.p3Action='ia-go';
  action.dataset.value='delivery';
  action.setAttribute('aria-label','Abrir Delivery para comparar operadores candidatos em Avaré');
}

// Bootstrap local de extensões do LAB. Mantém o index estável e carrega somente arquivos self/CSP-safe.
if(!document.querySelector('script[data-phase8-loader]')){
  const script=document.createElement('script');
  script.src='phase8.js';
  script.async=false;
  script.dataset.phase8Loader='true';
  document.head.append(script);
}
})();
