"use strict";
/* ============================================================
   Portafolio que administra la agencia (panel → Portafolio) y
   reseñas de clientes: se piden al entregar, se aprueban en el
   panel y se muestran en la landing.
   ============================================================ */

/* ---------- landing: bitácora filtrable ---------- */
let filtroBitacora = "";
function bitacoraGridHTML() {
  const ts = DB.t("trabajos").filter(t => t.visible && (!filtroBitacora || t.planeta === filtroBitacora)).sort((a, b) => b.t - a.t);
  return ts.map((t, i) => `
    <figure class="mision revela ${t.ancha && !filtroBitacora ? "mision-ancha" : ""}" style="--i:${i}">
      <div class="mision-foto"><img src="${esc(t.img)}" alt="${esc(t.titulo)}" loading="lazy"></div>
      <figcaption><span class="mision-num">Misión ${String(ts.length - i).padStart(2, "0")} · ${esc((PLANETAS.find(p => p.id === t.planeta) || {}).corto || "")}</span><b>${esc(t.titulo)}</b><span>${esc(t.texto)}</span></figcaption>
    </figure>`).join("") + `
    <a href="#/cotizar" class="mision mision-tuya revela">
      ${simbolo({ clase: "mision-sim", trazo: 18 })}
      <b>La próxima misión es la tuya.</b>
      <span class="btn btn-acento">Cotizar ahora ${ico("arrow-r")}</span>
    </a>`;
}
function filtrosBitacoraHTML() {
  const hay = [...new Set(DB.t("trabajos").filter(t => t.visible).map(t => t.planeta))];
  return `<div class="chips bitacora-filtros" role="group" aria-label="Filtrar trabajos">
    <button class="chip ${filtroBitacora ? "" : "activo"}" data-a="filtro_bitacora" data-p="" aria-pressed="${!filtroBitacora}">Todos</button>
    ${PLANETAS.filter(p => hay.includes(p.id)).map(p => `<button class="chip ${filtroBitacora === p.id ? "activo" : ""}" data-a="filtro_bitacora" data-p="${p.id}" aria-pressed="${filtroBitacora === p.id}">${ico(p.icono)} ${esc(p.corto)}</button>`).join("")}
  </div>`;
}
A.filtro_bitacora = el => {
  filtroBitacora = el.dataset.p;
  $(".bitacora-filtros").outerHTML = filtrosBitacoraHTML();
  const g = $(".bitacora-grid"); g.innerHTML = bitacoraGridHTML();
  $$(".revela", g).forEach(x => x.classList.add("visto"));
  if (window.trasPintar) { $$(".mision-foto", g).forEach(f => f.classList.add("imprimiendo")); }
};

/* ---------- landing: reseñas ---------- */
/* calificación: estrellas doradas en una pastilla, con el número al lado */
const ESTRELLA = "M12 2.5l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.7l-6.1 3.4 1.4-6.8-5.1-4.7 6.9-.8z";
const estrellas = (n, numero = true) => `<span class="calif" role="img" aria-label="${n} de 5 estrellas">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" class="${i <= Math.round(n) ? "llena" : ""}" style="--i:${i}" aria-hidden="true"><path d="${ESTRELLA}"/></svg>`).join("")}${numero ? `<b aria-hidden="true">${(+n).toFixed(1)}</b>` : ""}</span>`;
function resenasHTML() {
  const rs = DB.t("resenas").filter(r => r.visible).sort((a, b) => b.estrellas - a.estrellas || b.t - a.t);
  if (!rs.length) return "";
  const prom = sum(rs, r => r.estrellas) / rs.length;
  const empresas = [...new Set(DB.pedidos().filter(p => p.estado === "entregado" && p.cliente.empresa).map(p => p.cliente.empresa))];
  return `
  <section class="resenas" id="resenas" aria-labelledby="t-resenas">
    <header class="sec-cabeza revela">
      <p class="eyebrow">Señales desde la Tierra</p>
      <h2 id="t-resenas" class="titulo-xl">Lo que dicen<br>los que ya despegaron.</h2>
      <p class="resenas-prom">${estrellas(prom)} <span>de 5 · ${plural(rs.length, "reseña", "reseñas")}</span></p>
    </header>
    <div class="resenas-grid">${rs.slice(0, 6).map((r, i) => `
      <blockquote class="resena revela" style="--i:${i}">
        ${estrellas(r.estrellas)}
        <p>«${esc(r.texto)}»</p>
        <footer><span class="cliente-ini">${esc(iniciales(r.empresa || r.nombre))}</span><span><b>${esc(r.nombre)}</b>${r.empresa && r.empresa !== r.nombre ? `<br>${esc(r.empresa)}` : ""}</span></footer>
      </blockquote>`).join("")}
    </div>
    ${empresas.length ? `<div class="empresas revela"><p>Han confiado en nosotros</p><ul>${empresas.map(e => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
  </section>`;
}

/* ---------- seguimiento: pedir la reseña al entregar ---------- */
function resenaPedidoHTML(p) {
  if (p.estado !== "entregado") return "";
  const ya = DB.t("resenas").find(r => r.pedido === p.codigo);
  if (ya) return `<section class="seguir-caja"><h2>Gracias por tu opinión</h2><p>${estrellas(ya.estrellas)}</p><p class="tenue">«${esc(ya.texto)}»</p></section>`;
  return `
    <section class="seguir-caja" aria-labelledby="t-opina">
      <h2 id="t-opina">¿Cómo te fue?</h2>
      <form data-f="dejar_resena" class="pila">
        <input type="hidden" name="cod" value="${p.codigo}">
        <fieldset class="campo"><legend>Calificación</legend><div class="estrellas-elegir">${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="es-${n}" name="estrellas" value="${n}" ${n === 5 ? "checked" : ""}><label for="es-${n}" title="${n} estrellas"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z"/></svg><span class="sr">${n} estrellas</span></label>`).join("")}</div></fieldset>
        <div class="campo"><label for="op-txt">Cuéntanos en una o dos líneas</label><textarea id="op-txt" name="texto" rows="3" required maxlength="240"></textarea></div>
        <button class="btn btn-acento">${ico("check")} Enviar opinión</button>
      </form>
    </section>`;
}
F.dejar_resena = (f, d) => {
  const p = DB.pedido(d.cod);
  DB.t("resenas").push({ id: uid(), nombre: p.cliente.nombre, empresa: p.cliente.empresa || "", texto: d.texto.trim(), estrellas: +d.estrellas, t: Date.now(), visible: false, pedido: p.codigo });
  DB.guardar(); aviso("¡Gracias! La publicamos en cuanto la revisemos."); pintar();
};

/* ---------- panel: portafolio y reseñas ---------- */
PANEL_TABS.portafolio = () => {
  const ts = [...DB.t("trabajos")].sort((a, b) => b.t - a.t), rs = [...DB.t("resenas")].sort((a, b) => (a.visible - b.visible) || b.t - a.t);
  const pendientes = rs.filter(r => !r.visible).length;
  return `
    <section class="fp-caja">
      <div class="fp-titulo"><h3>${ico("image")} Trabajos en la página <em>${ts.filter(t => t.visible).length}</em></h3><button class="btn btn-acento btn-chico" data-a="trabajo_nuevo">${ico("upload")} Subir trabajo</button></div>
      <div class="port-grid">${ts.map(t => `
        <figure class="port-item ${t.visible ? "" : "oculto"}">
          <img src="${esc(t.img)}" alt="${esc(t.titulo)}">
          <figcaption><b>${esc(t.titulo)}</b><span>${esc((PLANETAS.find(p => p.id === t.planeta) || {}).nombre || "")}${t.visible ? "" : " · oculto"}</span></figcaption>
          <div class="fila-btns"><button class="btn btn-linea btn-chico" data-a="trabajo_editar" data-id="${t.id}">${ico("edit")} Editar</button><button class="btn btn-fantasma btn-chico" data-a="trabajo_ver" data-id="${t.id}">${t.visible ? "Ocultar" : "Mostrar"}</button></div>
        </figure>`).join("")}</div>
    </section>
    <section class="fp-caja">
      <h3>${ico("msg")} Reseñas ${pendientes ? `<span class="insignia amarilla">${plural(pendientes, "por revisar", "por revisar")}</span>` : ""}</h3>
      <ul class="lista-simple">${rs.map(r => `
        <li><div><b>${esc(r.empresa || r.nombre)}</b> ${estrellas(r.estrellas, false)}${r.ejemplo ? ` <span class="insignia">Ejemplo</span>` : ""}<span>«${esc(r.texto)}» · ${haceTxt(r.t)}${r.pedido ? " · " + r.pedido : ""}</span></div>
          <span class="estado ${r.visible ? "e-ok" : "e-aviso"}">${r.visible ? "Publicada" : "Por revisar"}</span>
          <button class="btn btn-linea btn-chico" data-a="resena_ver" data-id="${r.id}">${r.visible ? "Ocultar" : "Publicar"}</button></li>`).join("") || `<li class="tenue">Sin reseñas.</li>`}</ul>
    </section>`;
};
A.trabajo_ver = el => { const t = DB.t("trabajos").find(x => x.id === el.dataset.id); t.visible = !t.visible; DB.guardar(); refrescarPanel(); aviso(t.visible ? "Se muestra en la página" : "Oculto de la página"); };
A.resena_ver = el => { const r = DB.t("resenas").find(x => x.id === el.dataset.id); r.visible = !r.visible; DB.guardar(); refrescarPanel(); aviso(r.visible ? "Reseña publicada" : "Reseña oculta"); };
A.trabajo_nuevo = () => abrir("trabajo", {});
A.trabajo_editar = el => abrir("trabajo", { id: el.dataset.id });
let trabajoImg = "";
MODALES.trabajo = m => {
  const t = m.id ? DB.t("trabajos").find(x => x.id === m.id) : { titulo: "", texto: "", planeta: "diseno", img: m.img || "" };
  trabajoImg = t.img;
  return `
    <h2>${m.id ? "Editar trabajo" : "Subir trabajo"}</h2>
    <form data-f="trabajo">
      <input type="hidden" name="id" value="${esc(m.id || "")}">
      <div class="campo"><span class="etiqueta">Foto</span>
        <label class="cot-subir ${t.img ? "lleno" : ""}" for="tr-img" id="tr-prev">${t.img ? `<img src="${esc(t.img)}" alt="">` : ico("upload")}<span>${t.img ? "Cambiar foto" : "Elegir foto"}</span></label>
        <input id="tr-img" type="file" accept="image/*" class="sr" data-i="trabajo_img"></div>
      <div class="campo"><label for="tr-t">Título</label><input id="tr-t" name="titulo" value="${esc(t.titulo)}" required></div>
      <div class="campo"><label for="tr-x">Descripción corta</label><input id="tr-x" name="texto" value="${esc(t.texto)}"></div>
      <div class="campo"><label for="tr-p">Servicio</label><select id="tr-p" name="planeta">${PLANETAS.map(p => `<option value="${p.id}" ${t.planeta === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select></div>
      <div class="fila-btns"><button class="btn btn-acento">${ico("check")} Guardar</button>${m.id ? `<button type="button" class="btn btn-peligro" data-a="trabajo_borrar" data-id="${m.id}">${ico("trash")} Quitar</button>` : ""}</div>
    </form>`;
};
I.trabajo_img = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try { trabajoImg = await leerImagen(a, 1200, 0.82); $("#tr-prev").outerHTML = `<label class="cot-subir lleno" for="tr-img" id="tr-prev"><img src="${esc(trabajoImg)}" alt=""><span>Cambiar foto</span></label>`; }
  catch (e) { aviso("Esa foto no se pudo leer.", "malo"); }
};
F.trabajo = (f, d) => {
  if (!trabajoImg) { aviso("Elige una foto del trabajo.", "info"); return; }
  if (d.id) Object.assign(DB.t("trabajos").find(x => x.id === d.id), { titulo: d.titulo.trim(), texto: d.texto.trim(), planeta: d.planeta, img: trabajoImg });
  else DB.t("trabajos").push({ id: uid(), img: trabajoImg, titulo: d.titulo.trim(), texto: d.texto.trim(), planeta: d.planeta, visible: true, t: Date.now() });
  if (DB.guardar()) { ui.pila = []; renderModal(); refrescarPanel(); aviso("Trabajo guardado en la página"); }
};
A.trabajo_borrar = el => abrir("confirmar", { titulo: "¿Quitar este trabajo?", texto: "Se quita del portafolio de la página.", accion: "trabajo_borrar_si", cod: el.dataset.id, boton: "Sí, quitar" });
A.trabajo_borrar_si = el => { const l = DB.t("trabajos"), i = l.findIndex(x => x.id === el.dataset.cod); if (i >= 0) l.splice(i, 1); DB.guardar(); ui.pila = []; renderModal(); refrescarPanel(); aviso("Trabajo quitado"); };
/* desde la ficha del pedido: la prueba aprobada pasa directo al portafolio */
A.prueba_portafolio = el => {
  const p = DB.pedido(el.dataset.cod), pr = p.pruebas.find(x => x.id === el.dataset.id);
  const planeta = (DB.producto(p.items[0].producto_id) || {}).planeta || "diseno";
  abrir("trabajo", { img: pr.img });
  setTimeout(() => { const f = $("form[data-f=trabajo]"); if (f) { f.titulo.value = p.items[0].nombre + " · " + (p.cliente.empresa || p.cliente.nombre); f.planeta.value = planeta; } }, 40);
};
