(()=>{
'use strict';
const action=document.querySelector('[data-p3-action="ia-local"][data-value="entrega"]');
if(action){
  action.dataset.p3Action='ia-go';
  action.dataset.value='delivery';
  action.setAttribute('aria-label','Abrir Delivery para comparar operadores candidatos em Avaré');
}

// Bootstrap local de extensões do LAB. Mantém o index estável e carrega somente arquivos self/CSP-safe.
if(!document.querySelector('script[data-phase8-loader]')){const script=document.createElement('script');script.src='phase8.js';script.async=false;script.dataset.phase8Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase9-loader]')){const script=document.createElement('script');script.src='phase9.js';script.async=false;script.dataset.phase9Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase10-loader]')){const script=document.createElement('script');script.src='phase10.js';script.async=false;script.dataset.phase10Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase11-loader]')){const script=document.createElement('script');script.src='phase11.js';script.async=false;script.dataset.phase11Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase12-loader]')){const script=document.createElement('script');script.src='phase12.js';script.async=false;script.dataset.phase12Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase13-loader]')){const script=document.createElement('script');script.src='phase13.js';script.async=false;script.dataset.phase13Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase14-loader]')){const script=document.createElement('script');script.src='phase14.js';script.async=false;script.dataset.phase14Loader='true';document.head.append(script)}
if(!document.querySelector('script[data-phase15-loader]')){const script=document.createElement('script');script.src='phase15.js';script.async=false;script.dataset.phase15Loader='true';document.head.append(script)}
})();
