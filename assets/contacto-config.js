/* Configuración pública del buzón. No introducir contraseñas ni claves privadas.
   1. Crear y verificar un formulario en Formspree.
   2. Copiar aquí su endpoint https://formspree.io/f/ID_REAL.
   3. Completar privacidad.html con los datos reales.
   4. Cambiar privacidadRevisada a true y comprobar un envío real.
   Instrucciones completas: CONTACTO-Y-PUBLICACION.md, fuera de la carpeta web. */
window.ASAMBLEA_CONTACTO = {
  endpoint: 'https://formspree.io/f/xgaoglpe',
  privacidadRevisada: true,
  // Dirección de la aplicación web de Google Apps Script que guarda los pedidos en la hoja (https://script.google.com/macros/s/…/exec).
  // Mientras esté vacía, los pedidos se envían por Formspree al correo de la asamblea.
  pedidos: ''
};
