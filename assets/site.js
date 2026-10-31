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

/* Formulario de pedidos: resumen y total en vivo; envío a la hoja de Google (si está configurada) o, si no, a Formspree. */
const pedidoForm=document.querySelector('#pedido-form');
if(pedidoForm){
  const config=window.ASAMBLEA_CONTACTO||{};
  const hoja=typeof config.pedidos==='string'&&/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.pedidos)?config.pedidos:'';
  const formspree=typeof config.endpoint==='string'&&/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.endpoint)&&config.privacidadRevisada===true?config.endpoint:'';
  const enviar=document.querySelector('#ped-enviar');const estado=document.querySelector('#ped-estado');
  const vista=document.querySelector('#ped-vista');const cantidades=[...pedidoForm.querySelectorAll('input[data-producto]')];
  const euros=n=>n.toLocaleString('es-ES')+' €';
  const num=i=>Math.max(0,Math.min(50,Math.floor(+i.value||0)));
  const MINIMO=10;
  const GRUPOS=[['Camiseta','Camisetas'],['Sudadera','Sudaderas'],['Tote','Tote bags'],['Chapa','Chapas'],['Rifa','Rifa']];
  function calcular(){
    const out=[];let total=0;
    for(const [prod,nombre] of GRUPOS){
      const items=cantidades.filter(i=>i.dataset.producto===prod&&num(i)>0);
      const n=items.reduce((a,i)=>a+num(i),0);if(!n)continue;
      const importe=n*(+items[0].dataset.precio);total+=importe;
      if(prod==='Rifa')out.push(`Rifa: ${n} ${n===1?'participación':'participaciones'} (${euros(importe)})`);
      else if(!items[0].dataset.detalle)out.push(`${nombre}: ${n} (${euros(importe)})`);
      else out.push(`${nombre}: ${items.map(i=>`${num(i)} × ${i.dataset.detalle}`).join(', ')} (${euros(importe)})`);
    }
    return {lineas:out,total};
  }
  function actualizar(){
    cantidades.forEach(i=>{if(i.value!==''&&String(num(i))!==i.value)i.value=num(i);});
    const {lineas,total}=calcular();const p=vista.querySelector('p');p.replaceChildren();
    document.querySelector('#ped-total').textContent=euros(total);
    if(!lineas.length)p.textContent='Todavía no has elegido nada.';
    else lineas.forEach((t,k)=>{if(k)p.append(document.createElement('br'));p.append(t);});
    let aviso=vista.querySelector('.minimo');
    if(total>0&&total<MINIMO){if(!aviso){aviso=document.createElement('p');aviso.className='minimo';vista.append(aviso);}aviso.textContent=`La compra mínima es de ${euros(MINIMO)}: te faltan ${euros(MINIMO-total)}.`;}
    else if(aviso)aviso.remove();
    return {lineas,total};
  }
  const recogeBox=document.querySelector('#ped-recoge-box');const recoge=document.querySelector('#ped-recoge');
  const recogida=()=>(pedidoForm.querySelector('input[name="recogida"]:checked')||{}).value||'';
  function verRecoge(){const otro=recogida()==='Alguien del cole';if(recogeBox){recogeBox.hidden=!otro;recoge.required=otro;}}
  pedidoForm.addEventListener('change',verRecoge);
  pedidoForm.addEventListener('input',actualizar);
  if(hoja||formspree)enviar.disabled=false;else estado.textContent='Las reservas todavía no están activas. Escríbenos a asambleaceipperu@gmail.com.';
  pedidoForm.addEventListener('submit',async ev=>{
    ev.preventDefault();
    const {lineas,total}=actualizar();
    if(!lineas.length){estado.textContent='Elige al menos una camiseta, una sudadera, una tote bag o unas chapas.';return;}
    if(total<MINIMO){estado.textContent=`La compra mínima es de ${euros(MINIMO)}. Te faltan ${euros(MINIMO-total)}: añade algo más a tu reserva.`;return;}
    const radio=pedidoForm.querySelector('input[name="recogida"]');
    if(radio&&!recogida()){radio.reportValidity();estado.textContent='Elige cómo vas a recogerlo.';return;}
    if(recoge&&recoge.required&&!recoge.value.trim()){recoge.value='';recoge.reportValidity();return;}
    for(const id of ['#ped-nombre','#ped-email','#ped-privacidad']){const el=document.querySelector(id);if(!el.checkValidity()){el.reportValidity();return;}}
    const ref='P-'+new Date().toISOString().slice(5,10).replace('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    document.querySelector('#ped-ref').value=ref;
    const rec=recogida()==='Alguien del cole'?`Lo recoge ${recoge.value.trim()}`:'Lo recoge en el cole quien reserva';
    document.querySelector('#ped-resumen').value=lineas.join('\n')+`\nTotal: ${euros(total)}\nRecogida: ${rec}`;
    document.querySelector('#ped-importe').value=String(total);
    document.querySelector('#ped-asunto').value=`Pedido ${ref} · ${document.querySelector('#ped-nombre').value.trim()} · ${euros(total)}`;
    const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),25000);
    enviar.disabled=true;estado.textContent='Enviando la reserva…';
    try{
      const datos=new FormData(pedidoForm);
      if(hoja){
        // Google Apps Script no permite leer la respuesta desde otro dominio: se envía en modo no-cors.
        await fetch(hoja,{method:'POST',mode:'no-cors',body:new URLSearchParams(datos),signal:ctrl.signal});
      }else{
        const r=await fetch(formspree,{method:'POST',body:datos,headers:{Accept:'application/json'},signal:ctrl.signal});
        if(!r.ok)throw new Error('Formspree');
      }
      pedidoForm.reset();actualizar();verRecoge();
      const ok=document.createElement('span');ok.className='ok';
      ok.textContent=`Reserva enviada. Tu número es ${ref} y el importe, ${euros(total)}. Te escribiremos desde asambleaceipperu@gmail.com para confirmarla y explicarte cómo pagar.`;
      estado.replaceChildren(ok);
    }catch{estado.textContent='No se ha podido enviar. Tu reserva sigue aquí: inténtalo de nuevo o escríbenos a asambleaceipperu@gmail.com.';}
    finally{clearTimeout(t);enviar.disabled=false;}
  });
  actualizar();
}

/* Instagram: si hay un feed de Behold configurado, muestra las últimas publicaciones; si no, se quedan las imágenes de la web. */
(function(){
  const feed=document.querySelector('[data-ig-feed]');
  const url=(window.ASAMBLEA_CONTACTO||{}).instagramFeed;
  if(!feed||typeof url!=='string'||!/^https:\/\/feeds\.behold\.so\/[A-Za-z0-9_-]+$/.test(url))return;
  fetch(url).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
    const posts=(Array.isArray(d)?d:(d.posts||[])).slice(0,6);
    const seguro=u=>typeof u==='string'&&/^https:\/\//.test(u)?u:'';
    const items=posts.map(p=>{
      const img=seguro(((p.sizes||{}).medium||{}).mediaUrl)||seguro(p.thumbnailUrl)||seguro(p.mediaUrl);
      const link=seguro(p.permalink);if(!img||!link)return null;
      const a=document.createElement('a');a.className='ig-post';a.href=link;a.rel='noopener';
      const im=document.createElement('img');im.src=img;im.loading='lazy';
      im.alt=(p.altText||p.prunedCaption||p.caption||'Publicación de la asamblea en Instagram').slice(0,140);
      a.append(im);return a;}).filter(Boolean);
    if(items.length>=3)feed.replaceChildren(...items);
  }).catch(()=>{});
})();
