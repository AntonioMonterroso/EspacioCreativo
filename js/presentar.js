"use strict";
/* ============================================================
   Modo presentación (#/presentar): para la reunión de venta.
   El celular del cliente a la izquierda y el panel o el modo
   taller a la derecha, en vivo: lo que se pide en el celular
   aparece en el panel (comparten los datos del navegador).
   ============================================================ */
PROTEGIDA.presentar = ["dueno"];
const presentarUI = { lado: "panel" };
const GUION = [
  ["Despegue", "En el celular: la cuenta regresiva, el cohete y el humo."],
  ["Grábalo tú", "Escribe el nombre del dueño y dale a Grabar."],
  ["Pide", "«Pedir estas agendas», 30 piezas: el mayoreo se aplica solo. Envía el pedido."],
  ["Llega", "A la derecha el pedido aparece en «Recibido». Ábrelo, sube una prueba."],
  ["Aprueba", "En el celular, el seguimiento muestra la prueba: «Aprobar»."],
  ["Produce", "Cambia a Taller: «Empezar» y «Terminar». El material se descuenta y el pedido queda listo."]
];
VISTAS.presentar = () => `
  <div class="presentar">
    <header class="presentar-barra">
      ${logotipo("logotipo-nav")}
      <h1>Modo presentación</h1>
      <div class="chips" role="group" aria-label="Pantalla de la derecha">
        ${[["panel", "Panel"], ["taller", "Modo taller"]].map(([k, n]) => `<button class="chip ${presentarUI.lado === k ? "activo" : ""}" data-a="presentar_lado" data-l="${k}" aria-pressed="${presentarUI.lado === k}">${n}</button>`).join("")}
      </div>
      <button class="btn btn-fantasma" data-a="presentar_reiniciar">${ico("refresh")} Reiniciar demo</button>
      <a href="#/panel" class="btn btn-linea">${ico("arrow-l")} Salir</a>
    </header>
    <div class="presentar-cuerpo">
      <div class="presentar-cel">
        <div class="cel-marco"><span class="cel-isla"></span><iframe title="Celular del cliente" src="${urlBase()}#/" id="pr-cel"></iframe></div>
        <button class="btn btn-fantasma btn-chico" data-a="presentar_inicio">${ico("refresh")} Volver al inicio del celular</button>
      </div>
      <div class="presentar-pantalla">
        <div class="laptop-marco"><iframe title="${presentarUI.lado === "panel" ? "Panel de la agencia" : "Modo taller"}" src="${urlBase()}#/${presentarUI.lado}" id="pr-pan"></iframe></div>
      </div>
      <ol class="presentar-guion">${GUION.map(([t, x], i) => `<li><b>${i + 1}. ${t}</b><span>${x}</span></li>`).join("")}</ol>
    </div>
    <p class="presentar-chico">El modo presentación se ve mejor en una laptop o una TV. En el celular abre la <a href="#/">página</a> y el <a href="#/panel">panel</a> por separado.</p>
  </div>`;
A.presentar_lado = el => { presentarUI.lado = el.dataset.l; pintar(); };
A.presentar_inicio = () => { const f = $("#pr-cel"); f.src = urlBase() + "#/?r=" + Date.now(); };
A.presentar_reiniciar = () => abrir("confirmar", { titulo: "¿Reiniciar la demo?", texto: "Vuelven los pedidos y precios de ejemplo para empezar la presentación desde cero.", accion: "presentar_reiniciar_si", boton: "Sí, reiniciar" });
A.presentar_reiniciar_si = () => {
  DB.reiniciar(); ui.pila = []; renderModal();
  try { sessionStorage.removeItem(MARCA.clave + ".intro"); sessionStorage.removeItem(MARCA.clave + ".carro"); } catch (e) { /* nada */ }
  pintar(); aviso("Demo reiniciada");
};
