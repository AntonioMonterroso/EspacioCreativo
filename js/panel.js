"use strict";
/* ============================================================
   Panel ligero de la agencia (#/panel, PIN):
   tablero de pedidos por estado, ficha del pedido (pruebas,
   pagos, estados, avisos por WhatsApp), precios y ajustes.
   Fase 2 (taller completo) crece desde aquí.
   ============================================================ */
PROTEGIDA.panel = ["dueno", "diseno", "taller"];
const panelUI = { tab: "tablero", buscar: "" };

/* Secciones del panel: [nombre, icono, grupo]. Cada archivo registra su pantalla en PANEL_TABS. */
const PESTANAS = {
  tablero: ["Pedidos", "panel", "Operación"], produccion: ["Producción", "printer", "Operación"], diseno: ["Diseño", "pen", "Operación"],
  entregas: ["Entregas", "clock", "Operación"], inventario: ["Inventario", "box", "Gestión"], caja: ["Caja y costos", "cash", "Gestión"],
  clientes: ["Clientes", "msg", "Clientes"], cotizaciones: ["Cotizaciones", "copy", "Clientes"], portafolio: ["Portafolio y reseñas", "image", "Clientes"], precios: ["Precios", "tag", "Ajustes"], ajustes: ["Ajustes", "cog", "Ajustes"]
};
const PANEL_TABS = {};
const tabsDe = rol => (ROLES[rol] || ROLES.dueno).tabs;
const puede = tab => tabsDe(sesion.rol).includes(tab);
window.alEntrar = rol => { panelUI.tab = tabsDe(rol)[0]; };

VISTAS.panel = () => {
  if (!puede(panelUI.tab)) panelUI.tab = tabsDe(sesion.rol)[0];
  const t = panelUI.tab, grupos = {};
  tabsDe(sesion.rol).forEach(k => { const g = PESTANAS[k][2]; (grupos[g] = grupos[g] || []).push(k); });
  const bajos = sesion.rol !== "diseno" ? materialesBajos().length : 0;
  return `
  <div class="panel">
    <aside class="panel-lado" id="panel-lado">
      <div class="panel-lado-cabeza">
        <a href="#/" class="nav-marca" aria-label="Ir a la página">${logotipo("logotipo-nav")}</a>
        <button class="btn btn-icono btn-fantasma panel-cerrar-menu" data-a="panel_menu" aria-label="Cerrar menú">${ico("x")}</button>
      </div>
      <p class="panel-rol">${ico("lock")} ${esc(ROLES[sesion.rol].t)}</p>
      <nav aria-label="Secciones del panel">
        ${Object.entries(grupos).map(([g, ks]) => `<p class="panel-grupo">${g}</p>${ks.map(k => `
          <button class="panel-tab ${t === k ? "activo" : ""}" data-a="panel_tab" data-t="${k}" ${t === k ? 'aria-current="page"' : ""}>${ico(PESTANAS[k][1])}<span>${PESTANAS[k][0]}</span>${k === "inventario" && bajos ? `<em class="panel-alerta">${bajos}</em>` : ""}</button>`).join("")}`).join("")}
      </nav>
      <div class="panel-lado-pie">
        ${puede("produccion") ? `<a href="#/taller" class="btn btn-linea btn-bloque">${ico("eye")} Modo taller</a>` : ""}
        ${sesion.rol === "dueno" ? `<a href="#/presentar" class="btn btn-linea btn-bloque">${ico("panel")} Modo presentación</a>` : ""}
        <button class="btn btn-fantasma btn-bloque" data-a="salir">${ico("out")} Salir</button>
      </div>
    </aside>
    <div class="panel-velo" data-a="panel_menu"></div>
    <div class="panel-principal">
      <header class="panel-barra">
        <button class="btn btn-icono btn-linea panel-abrir-menu" data-a="panel_menu" aria-label="Abrir menú">${ico("menu")}</button>
        <h1 class="panel-titulo">${PESTANAS[t][0]}</h1>
        ${puede("tablero") ? `<a href="#/cotizar?mostrador=1" class="btn btn-acento">${ico("plus")}<span class="solo-ancho"> Pedido de mostrador</span></a>` : ""}
      </header>
      <main class="panel-cuerpo" id="principal">${(PANEL_TABS[t] || tableroHTML)()}</main>
    </div>
  </div>`;
};
PANEL_TABS.tablero = () => tableroHTML();
PANEL_TABS.precios = () => preciosHTML();
PANEL_TABS.ajustes = () => ajustesHTML();
A.panel_tab = el => { panelUI.tab = el.dataset.t; document.body.classList.remove("menu-panel"); pintar(); };
A.panel_menu = () => document.body.classList.toggle("menu-panel");

function coincide(p, q) {
  if (!q) return true;
  const n = q.toLowerCase().replace(/\s+/g, " ").trim(), d = n.replace(/\D/g, "");
  return p.codigo.toLowerCase().includes(n) || (p.cliente.nombre || "").toLowerCase().includes(n) || (p.cliente.empresa || "").toLowerCase().includes(n) ||
    (p.cliente.nit || "").toLowerCase().includes(n) || (d.length >= 3 && String(p.cliente.tel).includes(d));
}

function tableroHTML() {
  const todos = DB.pedidos(), ps = todos.filter(p => coincide(p, panelUI.buscar));
  const activos = todos.filter(p => !["entregado", "cancelado"].includes(p.estado));
  const porCobrar = r2(sum(activos, saldoPedido));
  const esperando = activos.filter(p => p.estado === "prueba" && p.pruebas.length && !p.pruebas[p.pruebas.length - 1].respuesta).length;
  const respondidas = activos.filter(p => p.estado === "prueba" && p.pruebas.length && p.pruebas[p.pruebas.length - 1].respuesta).length;
  const listos = activos.filter(p => p.estado === "listo").length;
  return `
    <section class="panel-cifras" aria-label="Resumen">
      <div class="cifra"><span>Pedidos activos</span><b>${activos.length}</b></div>
      <div class="cifra"><span>Por cobrar</span><b>${Q(porCobrar)}</b></div>
      <div class="cifra ${respondidas ? "alerta" : ""}"><span>Pruebas respondidas</span><b>${respondidas}</b><small>${esperando} esperando al cliente</small></div>
      <div class="cifra"><span>Listos para entregar</span><b>${listos}</b></div>
    </section>
    <div class="panel-buscar">
      <label class="sr" for="p-buscar">Buscar pedido</label>
      ${ico("search")}<input id="p-buscar" type="search" placeholder="Buscar por código, nombre, empresa, NIT o teléfono" value="${esc(panelUI.buscar)}" data-i="panel_buscar" autocomplete="off">
    </div>
    <div class="tablero" id="tablero">${columnasHTML(ps)}</div>`;
}
function columnasHTML(ps) {
  return ORDEN_ESTADOS.map(k => {
    let lista = ps.filter(p => p.estado === k);
    const total = lista.length;
    if (k === "entregado") lista = lista.slice(0, 5);
    return `
      <section class="columna col-${k}" aria-label="${esc(ESTADOS[k].t)}">
        <h2><span class="punto-estado e-${ESTADOS[k].c}"></span>${esc(ESTADOS[k].t)}<em>${total}</em></h2>
        ${lista.map(tarjetaHTML).join("") || `<p class="columna-vacia">Nada aquí.</p>`}
        ${k === "entregado" && total > 5 ? `<p class="columna-vacia">y ${total - 5} más</p>` : ""}
      </section>`;
  }).join("");
}
I.panel_buscar = el => { panelUI.buscar = el.value; $("#tablero").innerHTML = columnasHTML(DB.pedidos().filter(p => coincide(p, panelUI.buscar))); };

function tarjetaHTML(p) {
  const pr = p.pruebas[p.pruebas.length - 1], saldo = saldoPedido(p);
  const insignia = p.estado === "prueba" && pr ? (pr.respuesta === "aprobada" ? `<span class="insignia ok">${ico("check")} Aprobada</span>` : pr.respuesta === "cambios" ? `<span class="insignia amarilla">${ico("edit")} Pidió cambios</span>` : `<span class="insignia">${ico("clock")} Esperando</span>`) : "";
  return `
    <button class="tarjeta-ped" data-a="ver_pedido" data-cod="${p.codigo}">
      <span class="tp-arriba"><b>${p.codigo}</b>${p.origen === "mostrador" ? `<span class="insignia">Mostrador</span>` : ""}<span class="tp-hace">${haceTxt(p.creado)}</span></span>
      <span class="tp-cliente">${esc(p.cliente.empresa || p.cliente.nombre)}</span>
      <span class="tp-items">${esc(p.items.map(i => i.nombre).join(" · "))}</span>
      ${insignia}
      <span class="tp-abajo"><span>${Q(totalPedido(p))}</span>${saldo > 0 ? `<span class="tp-saldo">Saldo ${Q(saldo)}</span>` : `<span class="tp-pagado">${ico("check")} Pagado</span>`}</span>
      ${p.entrega && !["entregado", "cancelado"].includes(p.estado) ? `<span class="tp-entrega ${dia0(p.entrega) <= dia0() ? "urgente" : ""}">${ico("clock")} ${cuandoTxt(p.entrega)}</span>` : ""}
    </button>`;
}
A.ver_pedido = el => abrir("pedido", { cod: el.dataset.cod, ancha: true });

/* ---------- ficha del pedido ---------- */
MODALES.pedido = m => {
  const p = DB.pedido(m.cod); if (!p) return "<p>Ese pedido ya no existe.</p>";
  const e = ESTADOS[p.estado], i = ORDEN_ESTADOS.indexOf(p.estado), sig = ORDEN_ESTADOS[i + 1];
  const total = totalPedido(p), pagado = pagadoPedido(p), saldo = saldoPedido(p);
  return `
    <div class="ficha-ped">
      <header class="fp-cabeza">
        <p class="eyebrow">${p.origen === "mostrador" ? "Mostrador" : "Pedido en línea"} · ${cuandoTxt(p.creado)}, ${horaTxt(p.creado)}</p>
        <h2>${p.codigo} <span class="estado e-${e.c}">${esc(e.t)}</span></h2>
      </header>
      <div class="fp-grid">
        <div class="pila">
          <section class="fp-caja">
            <h3>Cliente</h3>
            <p class="fp-cliente"><b>${esc(p.cliente.nombre)}</b>${p.cliente.empresa ? ` · ${esc(p.cliente.empresa)}` : ""}<br>${telFmt(p.cliente.tel)}${p.cliente.nit ? ` · NIT ${esc(p.cliente.nit)}` : ""}</p>
            <div class="fila-btns">
              <a class="btn btn-linea btn-chico" target="_blank" rel="noopener" href="${waLink(p.cliente.tel, "Hola " + p.cliente.nombre.split(" ")[0] + ", ")}">${ico("wa")} Escribirle</a>
              <a class="btn btn-fantasma btn-chico" target="_blank" rel="noopener" href="#/pedido/${p.codigo}">${ico("eye")} Ver como cliente</a>
            </div>
          </section>
          <section class="fp-caja">
            <h3>Equipo y entrega</h3>
            <div class="fp-fila">
              <label class="sr" for="fp-dis">Diseñador</label>
              <select id="fp-dis">${[["", "Sin diseñador"], ...(DB.config().disenadores || []).map(x => [x.id, x.nombre])].map(([v, n]) => `<option value="${v}" ${p.disenador === v ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
              <button class="btn btn-linea btn-chico" data-a="asignar" data-cod="${p.codigo}">Asignar</button>
            </div>
            <div class="fp-fila">
              <label class="sr" for="fp-ent">Fecha de entrega</label>
              <input id="fp-ent" type="date" value="${p.entrega ? new Date(p.entrega - new Date(p.entrega).getTimezoneOffset() * MIN).toISOString().slice(0, 10) : ""}">
              <button class="btn btn-linea btn-chico" data-a="fecha_entrega" data-cod="${p.codigo}">Guardar fecha</button>
            </div>
          </section>
          <section class="fp-caja">
            <h3>Productos</h3>
            <ul class="carro-lista">${p.items.map((it, k) => `
              <li>
                ${it.arte ? `<a href="${esc(it.arte)}" target="_blank" rel="noopener" class="carro-mini" title="Abrir el arte"><img src="${esc(it.arte)}" alt="Arte del cliente"></a>` : it.grabado ? `<span class="carro-mini carro-ag">${agendaSVG(it.grabado, "fp" + k)}</span>` : `<span class="carro-mini">${ico((PLANETAS.find(x => x.id === (DB.producto(it.producto_id) || {}).planeta) || {}).icono || "box")}</span>`}
                <div><b>${esc(it.nombre)}</b><span>${lineaResumen(it)}</span>${it.nota ? `<span class="carro-nota">${esc(it.nota)}</span>` : ""}</div>
                <b class="carro-precio">${Q(it.subtotal)}</b>
              </li>`).join("")}
            </ul>
          </section>
          <section class="fp-caja">
            <div class="fp-titulo"><h3>Pruebas de diseño</h3>
              <label class="btn btn-linea btn-chico" for="fp-prueba">${ico("upload")} Subir prueba</label>
              <input id="fp-prueba" type="file" accept="image/*" class="sr" data-i="subir_prueba" data-cod="${p.codigo}">
            </div>
            ${p.pruebas.length ? `<div class="fp-pruebas">${[...p.pruebas].reverse().map((pr, k) => `
              <figure class="fp-prueba">
                <img src="${esc(pr.img)}" alt="Prueba ${p.pruebas.length - k}">
                <figcaption>
                  <b>Prueba ${p.pruebas.length - k}</b> · ${cuandoTxt(pr.t)}
                  ${pr.respuesta === "aprobada" ? `<span class="insignia ok">${ico("check")} Aprobada</span><button class="btn btn-fantasma btn-chico" data-a="prueba_portafolio" data-cod="${p.codigo}" data-id="${pr.id}">${ico("image")} Al portafolio</button>` : pr.respuesta === "cambios" ? `<span class="insignia amarilla">${ico("edit")} Cambios</span><q>${esc(pr.comentario)}</q>` : `<span class="insignia">${ico("clock")} Esperando respuesta</span>`}
                </figcaption>
              </figure>`).join("")}</div>` : `<p class="tenue">Todavía no hay pruebas. Al subir una, el pedido pasa a «Prueba por aprobar».</p>`}
          </section>
        </div>
        <div class="pila">
          <section class="fp-caja">
            <h3>Avance</h3>
            <ol class="fp-ruta">${ORDEN_ESTADOS.map((k, n) => `<li class="${n < i ? "hecho" : n === i ? "actual" : ""}">${esc(ESTADOS[k].t)}</li>`).join("")}</ol>
            ${p.estado === "cancelado" ? `<p class="tenue">Cancelado.</p>` : `
              <div class="pila">
                ${sig ? `<button class="btn btn-acento btn-bloque" data-a="estado" data-cod="${p.codigo}" data-e="${sig}">Pasar a «${esc(ESTADOS[sig].t)}» ${ico("arrow-r")}</button>` : ""}
                <a class="btn btn-linea btn-bloque" target="_blank" rel="noopener" href="${waLink(p.cliente.tel, mensaje(p.estado, p))}">${ico("wa")} Avisar al cliente</a>
                <div class="fila-btns fp-mas">
                  <label class="sr" for="fp-otro">Mover a otro estado</label>
                  <select id="fp-otro">${ORDEN_ESTADOS.filter(k => k !== p.estado).map(k => `<option value="${k}">${esc(ESTADOS[k].t)}</option>`).join("")}</select>
                  <button class="btn btn-fantasma btn-chico" data-a="estado_otro" data-cod="${p.codigo}">Mover</button>
                </div>
              </div>`}
          </section>
          ${ordenesDe(p.codigo).length ? `<section class="fp-caja">
            <h3>Producción</h3>
            <ul class="fp-ops">${ordenesDe(p.codigo).map(o => `<li><span class="punto-estado e-${ESTADOS_OP[o.estado].c}"></span><div><b>${o.codigo} · ${esc((MAQUINAS.find(m => m.id === o.maquina) || {}).nombre)}</b><span>${esc(o.nombre)} · ${esc(ESTADOS_OP[o.estado].t)}</span></div></li>`).join("")}</ul>
          </section>` : ""}
          ${sesion.rol === "dueno" ? `<section class="fp-caja">
            <h3>Costo y ganancia</h3>
            <dl class="cuentas">
              <div><dt>Material</dt><dd>${Q(costoPedido(p))}</dd></div>
              <div class="fuerte"><dt>Ganancia sobre material</dt><dd>${Q(total - costoPedido(p))}</dd></div>
            </dl>
            <p class="tenue">${total ? Math.round((total - costoPedido(p)) / total * 100) : 0}% del total. No incluye mano de obra ni luz.</p>
          </section>` : ""}
          <section class="fp-caja">
            <div class="fp-titulo"><h3>Pagos</h3><button class="btn btn-linea btn-chico" data-a="nuevo_pago" data-cod="${p.codigo}">${ico("cash")} Registrar pago</button></div>
            <dl class="cuentas">
              <div><dt>Total</dt><dd>${Q(total)}</dd></div>
              <div><dt>Pagado</dt><dd>${Q(pagado)}</dd></div>
              <div class="fuerte"><dt>Saldo</dt><dd>${Q(saldo)}</dd></div>
            </dl>
            ${(p.pagos || []).length ? `<ul class="fp-pagos">${p.pagos.map(x => `<li><span>${cuandoTxt(x.t)} · ${esc(METODOS[x.metodo] || x.metodo)}${x.nota ? " · " + esc(x.nota) : ""}</span><b>${Q(x.monto)}</b></li>`).join("")}</ul>` : `<p class="tenue">Sin pagos todavía.</p>`}
          </section>
          <section class="fp-caja">
            <h3>Bitácora</h3>
            <ol class="fp-hist">${[...p.historial].reverse().map(h => `<li><b>${esc(ESTADOS[h.estado] ? ESTADOS[h.estado].t : h.estado)}</b>${h.nota ? ` · ${esc(h.nota)}` : ""}<span>${esc(h.quien || "")} · ${cuandoTxt(h.t)}, ${horaTxt(h.t)}</span></li>`).join("")}</ol>
            ${p.estado !== "cancelado" ? `<button class="btn btn-peligro btn-chico" data-a="cancelar" data-cod="${p.codigo}">${ico("x")} Cancelar pedido</button>` : ""}
          </section>
        </div>
      </div>
    </div>`;
};

function refrescarPanel() {
  repintarModal();
  if (ruta().nombre === "taller") { const tt = $("#taller-cuerpo"); if (tt) tt.innerHTML = tallerCuerpoHTML(); return; }
  const cuerpo = $(".panel-cuerpo");
  if (cuerpo && panelUI.tab !== "tablero") { cuerpo.innerHTML = PANEL_TABS[panelUI.tab](); return; }
  const t = $("#tablero");
  if (t) { t.innerHTML = columnasHTML(DB.pedidos().filter(p => coincide(p, panelUI.buscar))); }
  const c = $(".panel-cifras"); if (c && panelUI.tab === "tablero") { const tmp = document.createElement("div"); tmp.innerHTML = tableroHTML(); c.replaceWith(tmp.querySelector(".panel-cifras")); }
}

A.estado = el => {
  const p = DB.pedido(el.dataset.cod), e = el.dataset.e;
  DB.cambiarEstado(p, e);
  refrescarPanel();
  avisoConWA(p, e);
};
A.estado_otro = el => { const sel = $("#fp-otro"); A.estado({ dataset: { cod: el.dataset.cod, e: sel.value } }); };
function avisoConWA(p, e) {
  aviso(p.codigo + " → " + ESTADOS[e].t);
  abrir("avisar", { cod: p.codigo, e });
}
MODALES.avisar = m => {
  const p = DB.pedido(m.cod), txt = mensaje(m.e, p);
  return `
    <h2>¿Le avisamos a ${esc(p.cliente.nombre.split(" ")[0])}?</h2>
    <p class="sub">El pedido pasó a «${esc(ESTADOS[m.e].t)}». Este es el mensaje (lo puedes cambiar en Ajustes):</p>
    <blockquote class="wa-burbuja">${esc(txt)}</blockquote>
    <div class="fila-btns">
      <a class="btn btn-acento" target="_blank" rel="noopener" href="${waLink(p.cliente.tel, txt)}" data-a="cerrar_wa">${ico("wa")} Mandar por WhatsApp</a>
      <button class="btn btn-fantasma" data-a="cerrar">Ahora no</button>
    </div>`;
};
A.cerrar_wa = el => { window.open(el.href, "_blank", "noopener"); cerrar(); };

I.subir_prueba = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try {
    const img = await leerImagen(a, 1100, 0.8);
    const p = DB.pedido(el.dataset.cod);
    p.pruebas.push({ id: uid(), t: Date.now(), img, respuesta: null, comentario: "" });
    if (p.estado !== "prueba") DB.cambiarEstado(p, "prueba", "Equipo", "Prueba " + p.pruebas.length);
    else { p.historial.push({ t: Date.now(), estado: "prueba", quien: "Equipo", nota: "Prueba " + p.pruebas.length }); DB.guardarPedido(); }
    refrescarPanel(); avisoConWA(p, "prueba");
  } catch (e) { aviso("Esa imagen no se pudo leer.", "malo"); }
};

A.nuevo_pago = el => abrir("pago", { cod: el.dataset.cod });
MODALES.pago = m => {
  const p = DB.pedido(m.cod), saldo = saldoPedido(p), anticipo = r2(totalPedido(p) * DB.config().anticipo_pct / 100);
  const sugerido = pagadoPedido(p) < anticipo ? r2(anticipo - pagadoPedido(p)) : saldo;
  return `
    <h2>Registrar pago</h2>
    <p class="sub">${p.codigo} · saldo ${Q(saldo)}</p>
    <form data-f="pago">
      <input type="hidden" name="cod" value="${p.codigo}">
      <div class="campo"><label for="pg-monto">Monto (Q)</label><input id="pg-monto" name="monto" type="number" step="0.01" min="0.01" inputmode="decimal" value="${sugerido}" required autofocus></div>
      <fieldset class="campo"><legend>Forma de pago</legend><div class="chips">${Object.entries(METODOS).map(([k, n], j) => `<label class="chip ${j ? "" : "activo"}"><input type="radio" name="metodo" value="${k}" ${j ? "" : "checked"} data-i="chip_radio"><span>${n}</span></label>`).join("")}</div></fieldset>
      <div class="campo"><label for="pg-nota">Nota <span class="opcional">(opcional)</span></label><input id="pg-nota" name="nota" placeholder="${pagadoPedido(p) ? "Saldo" : "Anticipo"}"></div>
      <button class="btn btn-acento btn-bloque">${ico("check")} Guardar pago</button>
    </form>`;
};
I.chip_radio = el => $$(`input[name="${el.name}"]`, el.form).forEach(x => x.closest(".chip").classList.toggle("activo", x.checked));
F.pago = (f, d) => {
  const p = DB.pedido(d.cod), monto = r2(+d.monto);
  if (!(monto > 0)) { aviso("Escribe el monto.", "info"); return; }
  p.pagos.push({ id: uid(), t: Date.now(), monto, metodo: d.metodo, nota: d.nota.trim() || (pagadoPedido(p) ? "Saldo" : "Anticipo") });
  p.historial.push({ t: Date.now(), estado: p.estado, quien: "Equipo", nota: "Pago " + Q(monto) });
  DB.guardarPedido(); cerrar(); refrescarPanel(); aviso("Pago de " + Q(monto) + " guardado");
};

A.cancelar = el => abrir("confirmar", { titulo: "¿Cancelar " + el.dataset.cod + "?", texto: "El pedido queda en la bitácora como cancelado. Los pagos registrados no se borran.", accion: "cancelar_si", cod: el.dataset.cod, boton: "Sí, cancelar" });
MODALES.confirmar = m => `
  <h2>${esc(m.titulo)}</h2>
  <p class="sub">${esc(m.texto)}</p>
  <div class="fila-btns"><button class="btn btn-peligro" data-a="${m.accion}" data-cod="${esc(m.cod || "")}">${esc(m.boton)}</button><button class="btn btn-fantasma" data-a="cerrar">No</button></div>`;
A.cancelar_si = el => { const p = DB.pedido(el.dataset.cod); cerrar(); DB.cambiarEstado(p, "cancelado"); refrescarPanel(); aviso(p.codigo + " cancelado"); };

/* ---------- precios ---------- */
function preciosHTML() {
  return `
    <header class="panel-sec"><p class="tenue">Lo que cambies aquí se ve al momento en la página y en el cotizador. Los precios de la demo son de ejemplo.</p></header>
    ${PLANETAS.map(pl => `
      <section class="fp-caja precios-grupo">
        <h2>${ico(pl.icono)} ${esc(pl.nombre)}</h2>
        <ul class="precios-lista">${DB.productos().filter(x => x.planeta === pl.id).map(x => `
          <li class="${x.activo ? "" : "apagado"}">
            <div><b>${esc(x.nombre)}</b><span>${x.tramos.length ? "Mayoreo: " + x.tramos.map(t => t.desde + "+ −" + t.pct + "%").join(" · ") : "Sin mayoreo"}${x.activo ? "" : " · oculto"}</span></div>
            <b class="precio">${Q(x.precio)}<small>/${medidaTxt(x.medida, 1)}</small></b>
            <button class="btn btn-linea btn-chico" data-a="editar_prod" data-id="${x.id}">${ico("edit")} Editar</button>
          </li>`).join("")}
        </ul>
      </section>`).join("")}`;
}
A.editar_prod = el => abrir("producto", { id: el.dataset.id });
MODALES.producto = m => {
  const x = DB.producto(m.id);
  return `
    <h2>${esc(x.nombre)}</h2>
    <p class="sub">Precio por ${medidaTxt(x.medida, 1)}.</p>
    <form data-f="producto">
      <input type="hidden" name="id" value="${x.id}">
      <div class="campo"><label for="pr-precio">Precio (Q)</label><input id="pr-precio" name="precio" type="number" step="0.01" min="0" value="${x.precio}" required autofocus></div>
      ${x.medida === "m2" ? `<div class="campo"><label for="pr-min">Mínimo que se cobra (m²)</label><input id="pr-min" name="minimo" type="number" step="0.1" min="0" value="${x.minimo}"></div>` : ""}
      <div class="campo"><label for="pr-tramos">Mayoreo <span class="opcional">(desde:descuento, separados por coma)</span></label><input id="pr-tramos" name="tramos" value="${x.tramos.map(t => t.desde + ":" + t.pct).join(", ")}" placeholder="12:5, 25:10"></div>
      <div class="campo"><label for="pr-desc">Descripción</label><input id="pr-desc" name="desc" value="${esc(x.desc)}"></div>
      <label class="cot-check"><input type="checkbox" name="activo" ${x.activo ? "checked" : ""}><span>Se muestra en la página y el cotizador</span></label>
      <button class="btn btn-acento btn-bloque">${ico("check")} Guardar</button>
    </form>`;
};
F.producto = (f, d) => {
  const x = DB.producto(d.id);
  x.precio = r2(+d.precio); if (d.minimo != null) x.minimo = +d.minimo || 0; x.desc = d.desc.trim(); x.activo = !!d.activo;
  x.tramos = (d.tramos || "").split(",").map(s => s.split(":").map(n => +n.trim())).filter(([a, b]) => a > 0 && b > 0).map(([desde, pct]) => ({ desde, pct }));
  DB.guardarPedido(); cerrar(); pintar(); aviso("Precio guardado");
};

/* ---------- ajustes ---------- */
function ajustesHTML() {
  const c = DB.config();
  return `
    
    <form class="fp-caja ajustes" data-f="ajustes">
      <div class="ajustes-grid">
        <div class="campo"><label for="aj-ant">Anticipo (%)</label><input id="aj-ant" name="anticipo_pct" type="number" min="0" max="100" value="${c.anticipo_pct}"></div>
        <div class="campo"><label for="aj-dis">Precio de diseño de arte (Q)</label><input id="aj-dis" name="precio_diseno" type="number" min="0" value="${c.precio_diseno}"></div>
${Object.entries(ROLES).map(([k, r]) => `<div class="campo"><label for="aj-pin-${k}">PIN ${esc(r.t.toLowerCase())}</label><input id="aj-pin-${k}" name="pin_${k}" inputmode="numeric" maxlength="6" value="${esc(c.pins[k])}"></div>`).join("")}
      </div>
      <div class="campo"><label for="aj-banco">Cuenta para depósitos</label><input id="aj-banco" name="banco" value="${esc(c.banco)}"></div>
      <div class="campo"><label for="aj-hor">Horario</label><input id="aj-hor" name="horario" value="${esc(c.horario)}"></div>
      <h2>Mensajes de WhatsApp</h2>
      <p class="tenue">Puedes usar {nombre}, {codigo}, {total}, {saldo}, {link} y {agencia}.</p>
      ${ORDEN_ESTADOS.map(k => `<div class="campo"><label for="aj-m-${k}">${esc(ESTADOS[k].t)}</label><textarea id="aj-m-${k}" name="msj_${k}" rows="2">${esc(c.msj[k])}</textarea></div>`).join("")}
      <button class="btn btn-acento">${ico("check")} Guardar ajustes</button>
    </form>
    <section class="fp-caja">
      <h2>Demo</h2>
      <p class="tenue">Vuelve a los pedidos y precios de ejemplo. Se borra lo que se haya probado.</p>
      <button class="btn btn-peligro" data-a="reiniciar">${ico("refresh")} Reiniciar demo</button>
    </section>`;
}
F.ajustes = (f, d) => {
  const c = DB.config();
  c.anticipo_pct = clamp(+d.anticipo_pct || 0, 0, 100); c.precio_diseno = +d.precio_diseno || 0;
  const pins = Object.keys(ROLES).map(k => d["pin_" + k]);
  if (!pins.every(x => /^\d{4,6}$/.test(x))) { aviso("Cada PIN debe tener de 4 a 6 números.", "info"); return; }
  if (new Set(pins).size !== pins.length) { aviso("Cada rol necesita un PIN distinto.", "info"); return; }
  Object.keys(ROLES).forEach(k => { c.pins[k] = d["pin_" + k]; });
  c.banco = d.banco.trim(); c.horario = d.horario.trim();
  ORDEN_ESTADOS.forEach(k => { c.msj[k] = d["msj_" + k]; });
  DB.guardarPedido(); aviso("Ajustes guardados");
};
A.reiniciar = () => abrir("confirmar", { titulo: "¿Reiniciar la demo?", texto: "Se borran los pedidos de prueba y vuelven los de ejemplo.", accion: "reiniciar_si", boton: "Sí, reiniciar" });
A.reiniciar_si = () => { DB.reiniciar(); ui.pila = []; renderModal(); panelUI.tab = "tablero"; pintar(); aviso("Demo reiniciada"); };

A.asignar = el => {
  const p = DB.pedido(el.dataset.cod), v = $("#fp-dis").value;
  p.disenador = v; const n = ((DB.config().disenadores || []).find(x => x.id === v) || {}).nombre;
  p.historial.push({ t: Date.now(), estado: p.estado, quien: ROLES[sesion.rol].t, nota: n ? "Asignado a " + n : "Sin diseñador" });
  DB.guardarPedido(); refrescarPanel(); aviso(n ? p.codigo + " → " + n : "Diseñador quitado");
};
A.fecha_entrega = el => {
  const p = DB.pedido(el.dataset.cod), v = $("#fp-ent").value;
  p.entrega = v ? +new Date(v + "T12:00") : null;
  DB.guardarPedido(); refrescarPanel(); aviso(v ? "Entrega: " + fechaLarga(p.entrega) : "Fecha quitada");
};
