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
