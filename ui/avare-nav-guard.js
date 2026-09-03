(()=>{
'use strict';
const action=document.querySelector('[data-p3-action="ia-local"][data-value="entrega"]');
if(action){
  action.dataset.p3Action='ia-go';
  action.dataset.value='delivery';
  action.setAttribute('aria-label','Abrir Delivery para comparar operadores candidatos em Avaré');
}

// Bootstrap local de extensões do LAB. Mantém o index estável e carrega somente arquivos self/CSP-safe.
const load=(src,key)=>{
  if(document.querySelector(`script[data-${key}-loader]`))return;
  const script=document.createElement('script');
  script.src=src;
  script.async=false;
  script.dataset[`${key}Loader`]='true';
  document.head.append(script);
};
load('phase8.js','phase8');
load('phase9.js','phase9');
load('phase10.js','phase10');
load('phase11.js','phase11');
load('phase12.js','phase12');
load('phase13.js','phase13');
})();
