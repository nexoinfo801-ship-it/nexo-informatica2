(()=>{
'use strict';
const action=document.querySelector('[data-p3-action="ia-local"][data-value="entrega"]');
if(action){
  action.dataset.p3Action='ia-go';
  action.dataset.value='delivery';
  action.setAttribute('aria-label','Abrir Delivery para comparar operadores candidatos em Avaré');
}
})();
