'use strict';
document.body.classList.add('js');
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#menu');
menuButton.hidden=false;
function closeMenu(){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('is-open')){closeMenu();menuButton.focus();}});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
let statusTimer;
function notify(message){const status=document.querySelector('#status');status.textContent=message;clearTimeout(statusTimer);statusTimer=setTimeout(()=>{status.textContent='';},4500);}
async function copy(url,button){
  let result=button.parentElement.querySelector('.copied-url');
  if(!result){result=document.createElement('label');result.className='copied-url';const label=document.createElement('span');label.textContent='Enlace directo (selecciónalo y cópialo):';const input=document.createElement('input');input.readOnly=true;input.addEventListener('click',()=>input.select());result.append(label,input);button.parentElement.append(result);}
  result.querySelector('input').value=url;
  notify('Enlace preparado debajo del botón.');
  try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await Promise.race([navigator.clipboard.writeText(url),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Timeout')),1500))]);notify('Enlace copiado.');}
  catch{notify('No se pudo copiar solo. Selecciona el enlace que aparece debajo.');}
}
document.querySelectorAll('.copy-link').forEach(button=>button.addEventListener('click',()=>{const url=new URL(location.href);url.hash=button.dataset.target;copy(url.href,button);}));
document.querySelectorAll('.copy-url').forEach(button=>button.addEventListener('click',()=>copy(new URL(button.dataset.url,location.href).href,button)));
const contactForm=document.querySelector('#contact-form');
if(contactForm){
  const config=window.ASAMBLEA_CONTACTO||{};
  const sendButton=document.querySelector('#send-message');
  const sendStatus=document.querySelector('#send-status');
  const endpointValid=typeof config.endpoint==='string'&&/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint);
  const ready=endpointValid&&config.privacidadRevisada===true;
  const tema=new URLSearchParams(location.search).get('tema');const temas={caja:'Caja de resistencia',material:'Material solidario'};if(temas[tema])document.querySelector('#subject').value=temas[tema];
  if(ready){sendButton.disabled=false;sendStatus.textContent='';const state=document.querySelector('#contact-state');state.textContent='O usa el formulario: llega al mismo correo.';state.classList.add('activo');}
  contactForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!ready){sendStatus.textContent='El formulario todavía no está activo. Mientras tanto, escríbenos a asambleaceipperu@gmail.com.';return;}
    if(!contactForm.reportValidity())return;
    if(!document.querySelector('#message').value.trim()){sendStatus.textContent='Escribe un mensaje antes de enviarlo.';document.querySelector('#message').focus();return;}
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    sendButton.disabled=true;sendStatus.textContent='Enviando mensaje…';
    try{
      const response=await fetch(config.endpoint,{method:'POST',body:new FormData(contactForm),headers:{Accept:'application/json'},signal:controller.signal});
      if(!response.ok)throw new Error('Service did not accept the message');
      contactForm.reset();sendStatus.textContent='Mensaje enviado. Gracias por escribirnos.';
    }catch{sendStatus.textContent='No se ha podido enviar. Tu texto sigue aquí: inténtalo de nuevo en unos minutos o pregunta en la asamblea.';}
    finally{clearTimeout(timer);sendButton.disabled=false;}
  });
}

/* Formulario de pedidos: arma un resumen legible, calcula la rifa y envía la reserva a Formspree. */
const pedidoForm=document.querySelector('#pedido-form');
if(pedidoForm){
  const config=window.ASAMBLEA_CONTACTO||{};
  const listo=typeof config.endpoint==='string'&&/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint)&&config.privacidadRevisada===true;
  const enviar=document.querySelector('#ped-enviar');const estado=document.querySelector('#ped-estado');
  const vista=document.querySelector('#ped-vista');const cantidades=[...pedidoForm.querySelectorAll('input[data-producto]')];
  const euros=n=>n.toLocaleString('es-ES')+' €';
  function lineas(){
    const out=[];
    const cam=cantidades.filter(i=>i.dataset.producto==='Camiseta'&&+i.value>0);
    if(cam.length)out.push('Camisetas: '+cam.map(i=>`${+i.value} × ${i.dataset.detalle}`).join(', '));
    const ch=document.querySelector('#chapas');
    if(+ch.value>0){const m=document.querySelector('#chapas-modelos').value.trim();out.push(`Chapas: ${+ch.value}`+(m?` (modelos: ${m})`:''));}
    const r=document.querySelector('#rifa-n');
    if(+r.value>0)out.push(`Rifa: ${+r.value} participaciones (${euros(+r.value*5)})`);
    return out;
  }
  function actualizar(){
    cantidades.forEach(i=>{const v=Math.max(0,Math.min(50,Math.floor(+i.value||0)));if(String(v)!==i.value&&i.value!=='')i.value=v;});
    document.querySelector('#rifa-importe').textContent=euros((+document.querySelector('#rifa-n').value||0)*5);
    const l=lineas();
    vista.querySelector('p').innerHTML='';
    if(!l.length){vista.querySelector('p').textContent='Todavía no has elegido nada.';return l;}
    l.forEach((t,k)=>{if(k)vista.querySelector('p').append(document.createElement('br'));vista.querySelector('p').append(t);});
    return l;
  }
  pedidoForm.addEventListener('input',actualizar);
  if(listo){enviar.disabled=false;}else{estado.textContent='Las reservas todavía no están activas. Escríbenos a asambleaceipperu@gmail.com.';}
  pedidoForm.addEventListener('submit',async ev=>{
    ev.preventDefault();
    const l=actualizar();
    if(!l.length){estado.textContent='Elige al menos una camiseta, una chapa o una participación.';return;}
    for(const id of ['#ped-nombre','#ped-email','#ped-privacidad']){const el=document.querySelector(id);if(!el.checkValidity()){el.reportValidity();return;}}
    const ref='P-'+new Date().toISOString().slice(5,10).replace('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    document.querySelector('#ped-ref').value=ref;
    document.querySelector('#ped-resumen').value=l.join('\n');
    document.querySelector('#ped-asunto').value=`Pedido ${ref} · ${document.querySelector('#ped-nombre').value.trim()}`;
    const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),20000);
    enviar.disabled=true;estado.textContent='Enviando la reserva…';
    try{
      const r=await fetch(config.endpoint,{method:'POST',body:new FormData(pedidoForm),headers:{Accept:'application/json'},signal:ctrl.signal});
      if(!r.ok)throw new Error('Formspree');
      pedidoForm.reset();actualizar();
      estado.innerHTML='';const ok=document.createElement('span');ok.className='ok';
      ok.textContent=`Reserva enviada. Tu número es ${ref}. Te escribiremos desde asambleaceipperu@gmail.com para confirmarla y explicarte cómo pagar.`;estado.append(ok);
    }catch{estado.textContent='No se ha podido enviar. Tu reserva sigue aquí: inténtalo de nuevo o escríbenos a asambleaceipperu@gmail.com.';}
    finally{clearTimeout(t);enviar.disabled=false;}
  });
  actualizar();
}
