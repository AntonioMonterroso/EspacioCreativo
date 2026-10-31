"use strict";
/* ============================================================
   Portal del cliente:
   #/cotizar        → escoge producto, sube su arte, ve el precio, arma su pedido
   #/pedido/CÓDIGO  → sigue su pedido, aprueba la prueba o pide cambios
   ============================================================ */

/* ---------- carrito (vive en la pestaña hasta que se envía) ---------- */
const CLAVE_CARRO = MARCA.clave + ".carro";
let CARRO = { items: [], mostrador: false };
try { CARRO = Object.assign(CARRO, JSON.parse(sessionStorage.getItem(CLAVE_CARRO) || "{}")); } catch (e) { /* nada */ }
function guardarCarro() { try { sessionStorage.setItem(CLAVE_CARRO, JSON.stringify(CARRO)); } catch (e) { aviso("El archivo es muy pesado para guardarlo. Prueba con una imagen más liviana.", "malo"); } }

/* Línea que se está armando */
let LINEA = null;
function nuevaLinea(prodId, extra = {}) {
  const p = DB.producto(prodId);
  const ops = {}; (p.opciones || []).forEach(o => { ops[o.id] = o.valores[0].t; });
  LINEA = Object.assign({ producto_id: p.id, cant: p.medida === "m2" ? 1 : Math.max(1, p.minimo || 1), ancho: p.medida === "m2" ? 2 : "", alto: p.medida === "m2" ? 1 : "", opciones: ops, disenar: false, arte: "", arteNombre: "", nota: "", grabado: null }, extra);
  if (p.id === "agenda" && GRABADO) LINEA.opciones.color = GRABADO.color;
}

VISTAS.cotizar = (p, q) => {
  if (q.get("mostrador") === "1") { CARRO.mostrador = true; CARRO.cot = q.get("cot") === "1"; }
  else if (!CARRO.items.length) { CARRO.mostrador = false; CARRO.cot = false; }
  const pid = q.get("producto"), pl = q.get("planeta");
  if (window.lineaPendiente) { LINEA = window.lineaPendiente; window.lineaPendiente = null; }
  else if (pid && DB.producto(pid)) nuevaLinea(pid, q.get("grabado") === "1" ? { grabado: Object.assign({}, GRABADO, { logoCrudo: "" }) } : {});
  else if (!LINEA || (pl && DB.producto(LINEA.producto_id).planeta !== pl)) nuevaLinea(DB.productos().find(x => x.planeta === (pl || "mantas") && x.activo).id);
  return `
  ${navHTML(true)}
  <main class="cotizar" id="principal">
    <header class="cot-cabeza">
      <p class="eyebrow">${CARRO.cot ? "Nueva cotización formal" : CARRO.mostrador ? "Pedido de mostrador" : "Cotizador en línea"}</p>
      <h1 class="titulo-xl">Arma tu pedido.<br><span class="acento">El precio sale solo.</span></h1>
    </header>
    <div class="cot-grid">
      <div class="cot-pasos">
        <section class="cot-paso" aria-labelledby="t-que">
          <h2 id="t-que" class="cot-titulo"><span>1</span>¿Qué necesitas?</h2>
          <div class="cot-planetas" role="tablist" aria-label="Tipo de trabajo">${PLANETAS.map(x => `
            <button role="tab" aria-selected="${DB.producto(LINEA.producto_id).planeta === x.id}" class="cot-planeta" data-a="cot_planeta" data-id="${x.id}">${ico(x.icono)}<span>${esc(x.corto)}</span></button>`).join("")}
          </div>
          <div class="cot-prods" id="cot-prods">${prodsHTML()}</div>
        </section>
        <section class="cot-paso" aria-labelledby="t-detalle">
          <h2 id="t-detalle" class="cot-titulo"><span>2</span>Detalles</h2>
          <form class="cot-detalle" id="cot-detalle" data-f="cot_agregar" autocomplete="off">${detalleHTML()}</form>
        </section>
      </div>
      <aside class="cot-carro" id="cot-carro" aria-label="Tu pedido">${carroHTML()}</aside>
    </div>
  </main>`;
};

function prodsHTML() {
  const pl = DB.producto(LINEA.producto_id).planeta;
  return DB.productos().filter(x => x.planeta === pl && x.activo).map(x => `
    <label class="cot-prod ${x.id === LINEA.producto_id ? "activo" : ""}">
      <input type="radio" name="producto" value="${x.id}" ${x.id === LINEA.producto_id ? "checked" : ""} data-i="cot_producto">
      <b>${esc(x.nombre)}</b>
      <span>${Q(x.precio)} / ${medidaTxt(x.medida, 1)}${x.tramos.length ? ` · <em>mayoreo</em>` : ""}</span>
      ${x.desc ? `<small>${esc(x.desc)}</small>` : ""}
    </label>`).join("");
}

function detalleHTML() {
  const p = DB.producto(LINEA.producto_id), l = LINEA, c = calcularLinea(p, l);
  const sig = siguienteTramo(p, p.medida === "m2" ? c.base : c.cant);
  const esAgenda = p.id === "agenda";
  return `
    ${p.medida === "m2" ? `
      <div class="cot-medidas">
        <div class="campo"><label for="c-ancho">Ancho (metros)</label><input id="c-ancho" name="ancho" type="number" min="0.1" step="0.1" inputmode="decimal" value="${l.ancho}" data-i="cot_campo"></div>
        <span class="cot-por" aria-hidden="true">×</span>
        <div class="campo"><label for="c-alto">Alto (metros)</label><input id="c-alto" name="alto" type="number" min="0.1" step="0.1" inputmode="decimal" value="${l.alto}" data-i="cot_campo"></div>
        <p class="cot-area">${c.area} m²${p.minimo && c.area < p.minimo ? ` · se cobra el mínimo de ${p.minimo} m²` : ""}</p>
      </div>` : ""}
    <div class="campo">
      <span class="etiqueta" id="e-cant">${p.medida === "m2" ? "¿Cuántas piezas iguales?" : "Cantidad (" + medidaTxt(p.medida, 2) + ")"}</span>
      <div class="contador" role="group" aria-labelledby="e-cant">
        <button type="button" class="btn btn-icono btn-linea" data-a="cot_menos" aria-label="Menos">${ico("minus")}</button>
        <input name="cant" type="number" min="1" inputmode="numeric" value="${c.cant}" data-i="cot_campo" aria-labelledby="e-cant">
        <button type="button" class="btn btn-icono btn-linea" data-a="cot_mas" aria-label="Más">${ico("plus")}</button>
      </div>
    </div>
    ${(p.opciones || []).map(o => `
      <fieldset class="campo">
        <legend>${esc(o.nombre)}</legend>
        <div class="chips">${o.valores.map(v => `
          <label class="chip ${l.opciones[o.id] === v.t ? "activo" : ""}"><input type="radio" name="op_${o.id}" value="${esc(v.t)}" ${l.opciones[o.id] === v.t ? "checked" : ""} data-i="cot_opcion" data-op="${o.id}"><span>${esc(v.t)}${v.extra ? ` <small>+${v.modo === "pct" ? v.extra + "%" : Q(v.extra) + (v.modo === "m2" ? "/m²" : "")}</small>` : ""}</span></label>`).join("")}
        </div>
      </fieldset>`).join("")}
    ${esAgenda && l.grabado ? `
      <div class="cot-grabado">
        <div class="cot-grabado-ag">${agendaSVG(Object.assign({}, l.grabado, { color: l.opciones.color || l.grabado.color }), "cg")}</div>
        <div><b>Tu diseño de «Grábalo tú»</b><p>${esc(l.grabado.texto || "Con tu logo")}${l.grabado.sub ? " · " + esc(l.grabado.sub) : ""}</p>
        <div class="fila-btns"><a href="#/?ancla=grabalo" class="btn btn-linea btn-chico">${ico("edit")} Cambiarlo</a><button type="button" class="btn btn-fantasma btn-chico" data-a="cot_singrabado">Quitar</button></div></div>
      </div>` : esAgenda ? `<p class="cot-pista">${ico("zap")} ¿Quieres verla grabada antes? <a href="#/?ancla=grabalo">Pruébalo en «Grábalo tú»</a>.</p>` : ""}
    ${p.arte ? `
      <fieldset class="campo">
        <legend>Tu arte o logo</legend>
        <div class="cot-arte">
          <label class="cot-subir ${l.arte ? "lleno" : ""}" for="c-arte">
            ${l.arte ? `<img src="${esc(l.arte)}" alt="Arte subido">` : ico("upload")}
            <span>${l.arte ? esc(l.arteNombre || "Arte subido") + " · cambiar" : "Subir archivo (PNG, JPG)"}</span>
          </label>
          <input id="c-arte" type="file" accept="image/*" class="sr" data-i="cot_arte">
          <label class="cot-check"><input type="checkbox" name="disenar" ${l.disenar ? "checked" : ""} data-i="cot_disenar"><span>No tengo arte: diséñenlo ustedes <b>+${Q(DB.config().precio_diseno)}</b></span></label>
        </div>
      </fieldset>` : ""}
    <div class="campo">
      <label for="c-nota">Indicaciones <span class="opcional">(opcional)</span></label>
      <textarea id="c-nota" name="nota" rows="2" placeholder="${p.planeta === "grabado" ? "Nombres, frase, si cada pieza lleva un nombre distinto…" : "Textos, colores, dónde va a ir…"}" data-i="cot_campo">${esc(l.nota)}</textarea>
    </div>
    <div class="cot-precio" aria-live="polite">
      <div class="cot-precio-fila"><span>${p.medida === "m2" ? c.base.toFixed(2).replace(/\.00$/, "") + " m² × " + Q(c.unit) : c.cant + " × " + Q(c.unit)}</span><b>${Q(c.bruto)}</b></div>
      ${c.desc ? `<div class="cot-precio-fila ahorro"><span>Mayoreo ${c.tramo.desde}+ (−${c.tramo.pct}%)</span><b>−${Q(c.desc)}</b></div>` : ""}
      ${c.disenio ? `<div class="cot-precio-fila"><span>Diseño del arte</span><b>${Q(c.disenio)}</b></div>` : ""}
      <div class="cot-precio-fila total"><span>Subtotal</span><b data-odo="subtotal">${Q(c.subtotal)}</b></div>
      ${sig ? `<p class="cot-sig">${ico("tag")} Desde ${sig.desde} ${p.medida === "m2" ? "m²" : medidaTxt(p.medida, 2)} pagas ${sig.pct}% menos.</p>` : ""}
    </div>
    <button class="btn btn-acento btn-grande btn-bloque">${ico("plus")} Agregar al pedido</button>`;
}

function carroHTML() {
  const its = CARRO.items, total = r2(sum(its, i => i.subtotal)), cfg = DB.config();
  return `
    <div class="carro-caja">
      <h2 class="cot-titulo"><span>3</span>Tu pedido</h2>
      ${its.length ? `<ul class="carro-lista">${its.map((i, k) => `
        <li>
          ${i.arte ? `<img src="${esc(i.arte)}" alt="" class="carro-mini">` : i.grabado ? `<span class="carro-mini carro-ag">${agendaSVG(Object.assign({}, i.grabado, { color: i.opciones.color || i.grabado.color }), "cm" + k)}</span>` : `<span class="carro-mini">${ico((PLANETAS.find(x => x.id === DB.producto(i.producto_id).planeta) || {}).icono || "box")}</span>`}
          <div><b>${esc(i.nombre)}</b><span>${lineaResumen(i)}</span></div>
          <b class="carro-precio">${Q(i.subtotal)}</b>
          <button class="btn btn-icono btn-fantasma" data-a="cot_quitar" data-k="${k}" aria-label="Quitar ${esc(i.nombre)}">${ico("trash")}</button>
        </li>`).join("")}</ul>
        <div class="carro-total"><span>Total</span><b data-odo="total">${Q(total)}</b></div>
        <p class="carro-anticipo">Para empezar se deja <b>${cfg.anticipo_pct}% de anticipo (${Q(total * cfg.anticipo_pct / 100)})</b>. El resto al recoger.</p>
        <button class="btn btn-acento btn-grande btn-bloque" data-a="cot_enviar">${CARRO.cot ? "Crear cotización" : CARRO.mostrador ? "Crear pedido" : "Enviar pedido"} ${ico("arrow-r")}</button>
        ${CARRO.mostrador && !CARRO.cot ? `<button class="btn btn-linea btn-bloque" data-a="cot_como_cotizacion">${ico("copy")} Mejor guardarlo como cotización</button>` : ""}`
      : `<p class="carro-vacio">Todavía no hay nada. Escoge un producto, ajusta los detalles y dale a «Agregar al pedido».</p>`}
    </div>`;
}

function lineaResumen(i) {
  const partes = [];
  if (i.medida === "m2") partes.push(`${i.ancho} × ${i.alto} m` + (i.cant > 1 ? ` · ${i.cant} piezas` : ""));
  else partes.push(i.cant + " " + medidaTxt(i.medida, i.cant));
  Object.values(i.opciones || {}).forEach(v => partes.push(v));
  if (i.disenar) partes.push("con diseño");
  if (i.grabado) partes.push("grabado: " + (i.grabado.texto || "logo"));
  return esc(partes.join(" · "));
}

function repintarDetalle() {
  const f = $("#cot-detalle"); if (!f) return;
  const foco = document.activeElement, nombre = foco && foco.name, pos = foco && foco.selectionStart;
  f.innerHTML = detalleHTML();
  if (window.animarOdometros) animarOdometros(f);
  if (nombre && f.elements[nombre] && f.elements[nombre].focus) {
    const el = f.elements[nombre]; if (el.length && !el.tagName) return;
    el.focus({ preventScroll: true }); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) { /* number */ }
  }
}

A.cot_planeta = el => {
  nuevaLinea(DB.productos().find(x => x.planeta === el.dataset.id && x.activo).id);
  $$(".cot-planeta").forEach(b => b.setAttribute("aria-selected", b === el));
  $("#cot-prods").innerHTML = prodsHTML(); repintarDetalle();
};
I.cot_producto = el => { nuevaLinea(el.value); $("#cot-prods").innerHTML = prodsHTML(); repintarDetalle(); };
I.cot_campo = (el, ev) => {
  if (el.name === "nota") { LINEA.nota = el.value; return; }
  LINEA[el.name] = el.type === "number" ? el.value : el.value;
  if (ev.type === "change" || el.name !== "cant" || el.value !== "") repintarDetalle();
};
A.cot_menos = () => { LINEA.cant = Math.max(1, (+LINEA.cant || 1) - 1); repintarDetalle(); };
A.cot_mas = () => { LINEA.cant = (+LINEA.cant || 0) + 1; repintarDetalle(); };
I.cot_opcion = el => { LINEA.opciones[el.dataset.op] = el.value; repintarDetalle(); };
I.cot_disenar = el => { LINEA.disenar = el.checked; repintarDetalle(); };
A.cot_singrabado = () => { LINEA.grabado = null; repintarDetalle(); };
I.cot_arte = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try { LINEA.arte = await leerImagen(a, 900); LINEA.arteNombre = a.name; repintarDetalle(); }
  catch (e) { aviso("Ese archivo no se pudo leer. Para PDF o AI, mándalo por WhatsApp después de enviar el pedido.", "info", 5000); }
};
F.cot_agregar = () => {
  const p = DB.producto(LINEA.producto_id), c = calcularLinea(p, LINEA);
  if (p.medida === "m2" && !(c.area > 0)) { aviso("Escribe el ancho y el alto en metros.", "info"); return; }
  const i = Object.assign({}, LINEA, { id: uid(), nombre: p.nombre, medida: p.medida, cant: c.cant, area: c.area, unit: c.unit, desc: c.desc, disenio: c.disenio, subtotal: c.subtotal });
  if (i.grabado) i.grabado = Object.assign({}, i.grabado, { color: i.opciones.color || i.grabado.color });
  CARRO.items.push(i); guardarCarro();
  if (window.volarAlCarro) volarAlCarro($("#cot-detalle .btn-acento.btn-bloque"), (PLANETAS.find(x => x.id === p.planeta) || {}).icono);
  nuevaLinea(p.id);
  $("#cot-carro").innerHTML = carroHTML(); repintarDetalle();
  if (window.animarOdometros) animarOdometros($("#cot-carro"));
  aviso("Agregado: " + p.nombre);
  if (innerWidth < 1000) $("#cot-carro").scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" });
};
A.cot_quitar = el => { CARRO.items.splice(+el.dataset.k, 1); guardarCarro(); $("#cot-carro").innerHTML = carroHTML(); if (window.animarOdometros) animarOdometros($("#cot-carro")); };
A.cot_enviar = () => abrir("datos");
A.cot_como_cotizacion = () => { CARRO.cot = true; guardarCarro(); abrir("datos"); };

MODALES.datos = () => {
  const total = r2(sum(CARRO.items, i => i.subtotal));
  return `
    <h2>${CARRO.cot ? "¿Para quién es la cotización?" : CARRO.mostrador ? "Datos del cliente" : "¿A quién le avisamos?"}</h2>
    <p class="sub">Total ${Q(total)} · ${plural(CARRO.items.length, "producto", "productos")}. ${CARRO.mostrador ? "" : "Te mandamos la prueba y los avisos por WhatsApp."}</p>
    <form data-f="cot_confirmar" autocomplete="on">
      <div class="campo"><label for="d-nombre">Nombre</label><input id="d-nombre" name="nombre" required autocomplete="name" autofocus></div>
      <div class="campo"><label for="d-tel">WhatsApp</label><input id="d-tel" name="tel" required inputmode="tel" autocomplete="tel" placeholder="5555-5555"></div>
      <div class="campo"><label for="d-emp">Empresa <span class="opcional">(opcional)</span></label><input id="d-emp" name="empresa" autocomplete="organization"></div>
      <div class="campo"><label for="d-nit">NIT para factura <span class="opcional">(opcional)</span></label><input id="d-nit" name="nit" placeholder="CF"></div>
      <div class="campo"><label for="d-fecha">¿Para cuándo lo necesitas? <span class="opcional">(opcional)</span></label><input id="d-fecha" name="fecha" type="date" min="${new Date(Date.now() + DIA).toISOString().slice(0, 10)}"></div>
      <button class="btn btn-acento btn-grande btn-bloque">${CARRO.cot ? "Crear cotización" : CARRO.mostrador ? "Crear pedido" : "Enviar pedido"} ${ico("arrow-r")}</button>
    </form>`;
};
F.cot_confirmar = (f, d) => {
  const tel = d.tel.replace(/\D/g, "");
  if (tel.length < 8) { aviso("Revisa el número de WhatsApp: son 8 dígitos.", "info"); f.tel.focus(); return; }
  if (CARRO.cot) {
    const q = crearCotizacion({ cliente: { nombre: d.nombre.trim(), tel, empresa: d.empresa.trim(), nit: d.nit.trim() }, items: CARRO.items.map(i => Object.assign({}, i, { grabado: i.grabado ? Object.assign({}, i.grabado, { logoCrudo: "" }) : null })) });
    CARRO = { items: [], mostrador: false, cot: false }; guardarCarro(); LINEA = null;
    ui.pila = []; renderModal(); aviso(q.codigo + " creada"); ir("#/cotizacion/" + q.codigo); return;
  }
  const p = DB.crearPedido({
    origen: CARRO.mostrador ? "mostrador" : "web",
    cliente: { nombre: d.nombre.trim(), tel, empresa: d.empresa.trim(), nit: d.nit.trim() },
    items: CARRO.items.map(i => Object.assign({}, i, { grabado: i.grabado ? Object.assign({}, i.grabado, { logoCrudo: "" }) : null })),
    entrega: d.fecha ? +new Date(d.fecha + "T12:00") : null
  });
  const mostrador = CARRO.mostrador;
  CARRO = { items: [], mostrador: false }; guardarCarro(); LINEA = null;
  ui.pila = []; renderModal();
  if (mostrador) { ir("#/panel"); setTimeout(() => abrir("pedido", { cod: p.codigo, ancha: true }), 60); aviso("Pedido " + p.codigo + " creado"); }
  else ir("#/pedido/" + p.codigo + "?nuevo=1");
};

/* ---------- seguimiento del pedido ---------- */
VISTAS.pedido = (p, q) => {
  const ped = DB.pedido(p[0]);
  if (!ped) return `${navHTML(true)}<main class="seguir seguir-vacio" id="principal"><h1 class="titulo-xl">No encontramos ese pedido.</h1><p>Revisa el código que te mandamos por WhatsApp.</p><form class="rastreo" data-f="rastrear"><label for="r2">Código</label><div class="rastreo-fila"><input id="r2" name="codigo" placeholder="EC-1046" required><button class="btn btn-acento">Buscar</button></div></form></main>`;
  const e = ESTADOS[ped.estado], paso = e.paso, nombre = esc(ped.cliente.nombre.split(" ").find(w => !/\.$/.test(w)) || ped.cliente.nombre);
  const prueba = ped.pruebas[ped.pruebas.length - 1];
  const total = totalPedido(ped), pagado = pagadoPedido(ped), saldo = saldoPedido(ped), cfg = DB.config();
  const anticipo = r2(total * cfg.anticipo_pct / 100);
  const nuevo = q.get("nuevo") === "1";
  return `
  ${navHTML(true)}
  <main class="seguir" id="principal">
    ${nuevo ? `
      <section class="seguir-nuevo">
        ${simbolo({ clase: "seguir-sim" })}
        <div>
          <p class="eyebrow">¡Pedido enviado!</p>
          <h1 class="titulo-xl">Tu código es <span class="acento">${ped.codigo}</span></h1>
          <p>Guárdalo: con él ves en qué paso va tu pedido. Mándanos el pedido por WhatsApp para que te atendamos de una vez.</p>
          <div class="fila-btns">
            <a class="btn btn-acento btn-grande" target="_blank" rel="noopener" href="${waAgencia(resumenWA(ped))}">${ico("wa")} Enviar por WhatsApp</a>
            <button class="btn btn-linea btn-grande" data-a="copiar" data-t="${esc(urlBase() + "#/pedido/" + ped.codigo)}">${ico("copy")} Copiar link</button>
          </div>
        </div>
      </section>` : `
      <header class="seguir-cabeza">
        <p class="eyebrow">Pedido ${ped.codigo}</p>
        <h1 class="titulo-xl">Hola, ${nombre}.<br><span class="acento">${esc(e.cliente)}</span></h1>
      </header>`}

    ${ped.estado === "cancelado" ? `<p class="seguir-cancelado">Este pedido se canceló. Si es un error, escríbenos.</p>` : `
    <ol class="ruta" aria-label="Avance del pedido">${ORDEN_ESTADOS.map((k, i) => `
      <li class="ruta-paso ${i < paso ? "hecho" : i === paso ? "actual" : ""}" ${i === paso ? 'aria-current="step"' : ""}>
        <span class="ruta-punto">${i === paso ? simbolo({ clase: "ruta-sim", trazo: 24 }) : i < paso ? ico("check") : ""}</span>
        <span class="ruta-nombre">${esc(ESTADOS[k].t)}</span>
      </li>`).join("")}
    </ol>`}

    ${prueba ? `
      <section class="prueba ${prueba.respuesta ? "respondida" : "pendiente"}" aria-labelledby="t-prueba">
        <div class="prueba-img"><img src="${esc(prueba.img)}" alt="Prueba de diseño del pedido ${ped.codigo}"></div>
        <div class="prueba-texto">
          <p class="eyebrow">Prueba de diseño ${ped.pruebas.length > 1 ? "#" + ped.pruebas.length : ""}</p>
          <h2 id="t-prueba">${prueba.respuesta === "aprobada" ? "Aprobaste esta prueba." : prueba.respuesta === "cambios" ? "Pediste cambios." : "¿Así te gusta?"}</h2>
          ${prueba.respuesta === "cambios" ? `<blockquote>${esc(prueba.comentario)}</blockquote><p>Ya lo estamos corrigiendo. Te mandamos la nueva prueba por WhatsApp.</p>`
            : prueba.respuesta === "aprobada" ? `<p>Pasa a producción. Te avisamos cuando esté listo.</p>`
            : `<p>Revisa textos, colores y teléfonos. Lo que apruebes es lo que se imprime.</p>
               <div class="fila-btns"><button class="btn btn-acento btn-grande" data-a="prueba_aprobar" data-cod="${ped.codigo}">${ico("check")} Aprobar</button><button class="btn btn-linea btn-grande" data-a="prueba_cambios" data-cod="${ped.codigo}">${ico("edit")} Pedir cambios</button></div>`}
        </div>
      </section>` : ""}

    <div class="seguir-grid">
      <section class="seguir-caja" aria-labelledby="t-items">
        <h2 id="t-items">Lo que pediste</h2>
        <ul class="carro-lista">${ped.items.map((i, k) => `
          <li>
            ${i.arte ? `<img src="${esc(i.arte)}" alt="" class="carro-mini">` : i.grabado ? `<span class="carro-mini carro-ag">${agendaSVG(i.grabado, "sp" + k)}</span>` : `<span class="carro-mini">${ico((PLANETAS.find(x => x.id === (DB.producto(i.producto_id) || {}).planeta) || {}).icono || "box")}</span>`}
            <div><b>${esc(i.nombre)}</b><span>${lineaResumen(i)}</span>${i.nota ? `<span class="carro-nota">${esc(i.nota)}</span>` : ""}</div>
            <b class="carro-precio">${Q(i.subtotal)}</b>
          </li>`).join("")}
        </ul>
      </section>
      <section class="seguir-caja" aria-labelledby="t-pago">
        <h2 id="t-pago">Pago</h2>
        <dl class="cuentas">
          <div><dt>Total</dt><dd>${Q(total)}</dd></div>
          <div><dt>Pagado</dt><dd>${Q(pagado)}</dd></div>
          <div class="fuerte"><dt>Saldo</dt><dd>${Q(saldo)}</dd></div>
        </dl>
        ${pagado < anticipo && ped.estado !== "cancelado" ? `<div class="banco"><p>Para empezar se deja <b>${Q(anticipo)}</b> de anticipo:</p><p class="banco-dato">${esc(cfg.banco)}</p><p class="tenue">Manda la foto de la boleta por WhatsApp con tu código.</p></div>` : ""}
        ${ped.entrega ? `<p class="seguir-entrega">${ico("clock")} Entrega estimada: <b>${cap(fechaLarga(ped.entrega))}</b></p>` : ""}
        <div class="fila-btns"><a class="btn btn-linea" target="_blank" rel="noopener" href="${waAgencia("Hola, tengo una consulta sobre mi pedido " + ped.codigo + ".")}">${ico("wa")} Preguntar por WhatsApp</a></div>
      </section>
    </div>

    ${resenaPedidoHTML(ped)}

    <section class="seguir-caja historial" aria-labelledby="t-hist">
      <h2 id="t-hist">Bitácora</h2>
      <ol>${[...ped.historial].reverse().map(h => `<li><b>${esc(ESTADOS[h.estado] ? ESTADOS[h.estado].t : h.estado)}</b>${h.nota ? ` · ${esc(h.nota)}` : ""}<span>${cuandoTxt(h.t)}, ${horaTxt(h.t)}</span></li>`).join("")}</ol>
    </section>
  </main>`;
};

function resumenWA(p) {
  return `Hola ${MARCA.nombre}, envié el pedido ${p.codigo}:\n` + p.items.map(i => `• ${i.nombre} (${lineaResumen(i).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')}) ${Q(i.subtotal)}`).join("\n") +
    `\nTotal: ${Q(totalPedido(p))}\nNombre: ${p.cliente.nombre}${p.cliente.empresa ? " (" + p.cliente.empresa + ")" : ""}\nSeguimiento: ${urlBase()}#/pedido/${p.codigo}` + (p.items.some(i => i.arte) ? "\n(Subí mi arte en el pedido)" : "");
}

A.prueba_aprobar = el => {
  const p = DB.pedido(el.dataset.cod), pr = p.pruebas[p.pruebas.length - 1];
  pr.respuesta = "aprobada"; pr.rt = Date.now();
  p.historial.push({ t: Date.now(), estado: p.estado, quien: "Cliente", nota: "Aprobó la prueba" });
  DB.guardarPedido(); aviso("¡Aprobada! Pasa a producción."); pintar();
};
A.prueba_cambios = el => abrir("cambios", { cod: el.dataset.cod });
MODALES.cambios = m => `
  <h2>¿Qué le cambiamos?</h2>
  <p class="sub">Sé específico: textos, colores, tamaño del logo, un teléfono que falta…</p>
  <form data-f="prueba_cambios">
    <input type="hidden" name="cod" value="${esc(m.cod)}">
    <div class="campo"><label for="cb-txt">Cambios</label><textarea id="cb-txt" name="comentario" rows="4" required autofocus></textarea></div>
    <button class="btn btn-acento btn-bloque">${ico("msg")} Mandar cambios</button>
  </form>`;
F.prueba_cambios = (f, d) => {
  const p = DB.pedido(d.cod), pr = p.pruebas[p.pruebas.length - 1];
  pr.respuesta = "cambios"; pr.comentario = d.comentario.trim(); pr.rt = Date.now();
  p.historial.push({ t: Date.now(), estado: p.estado, quien: "Cliente", nota: "Pidió cambios" });
  DB.guardarPedido(); cerrar(); aviso("Listo, ya le avisamos al diseñador."); pintar();
};
