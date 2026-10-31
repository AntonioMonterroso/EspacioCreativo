"use strict";
/* ============================================================
   Clientes y recompra, cotización formal (PDF) y carga de los
   diseñadores.
   ============================================================ */

/* ---------- clientes ---------- */
const clientesUI = { buscar: "" };
function coincideCliente(c, q) {
  if (!q) return true;
  const n = q.toLowerCase().trim(), d = n.replace(/\D/g, "");
  return [c.cliente.nombre, c.cliente.empresa, c.cliente.nit].some(x => String(x || "").toLowerCase().includes(n)) || (d.length >= 3 && String(c.cliente.tel).includes(d));
}
function mensajeRecompra(r) {
  return DB.config().msj_recompra.replace(/\{(\w+)\}/g, (_, k) => ({ nombre: (r.c.cliente.nombre || "").split(" ").find(w => !/\.$/.test(w)) || "", producto: r.nombre.toLowerCase(), agencia: MARCA.nombre }[k] ?? ""));
}
PANEL_TABS.clientes = () => {
  const rs = recompras();
  return `
    ${rs.length ? `<section class="fp-caja recompra">
      <h3>${ico("refresh")} Toca recompra <em>${rs.length}</em></h3>
      <ul class="lista-simple">${rs.map(r => `
        <li><div><b>${esc(r.c.cliente.empresa || r.c.cliente.nombre)}</b> · ${esc(r.nombre)}<span>Lo pidió hace ${r.pasaron} días (${r.pedido.codigo}) · se repite cada ${r.dias} días</span></div>
          <div class="fila-btns"><a class="btn btn-acento btn-chico" target="_blank" rel="noopener" href="${waLink(r.c.cliente.tel, mensajeRecompra(r))}">${ico("wa")} Escribirle</a><button class="btn btn-linea btn-chico" data-a="repetir_pedido" data-cod="${r.pedido.codigo}">${ico("copy")} Volver a pedir</button></div></li>`).join("")}</ul>
    </section>` : ""}
    <div class="panel-buscar">
      <label class="sr" for="c-buscar">Buscar cliente</label>
      ${ico("search")}<input id="c-buscar" type="search" placeholder="Buscar por NIT, nombre, empresa o teléfono" value="${esc(clientesUI.buscar)}" data-i="buscar_cliente" autocomplete="off">
    </div>
    <div class="clientes" id="clientes">${listaClientes()}</div>`;
};
function listaClientes() {
  return clientes().filter(c => coincideCliente(c, clientesUI.buscar)).map(c => `
    <button class="cliente-tarjeta" data-a="ver_cliente" data-id="${esc(c.id)}">
      <span class="cliente-ini">${esc(iniciales(c.cliente.empresa || c.cliente.nombre))}</span>
      <span class="cliente-datos"><b>${esc(c.cliente.empresa || c.cliente.nombre)}</b><span>${c.cliente.empresa ? esc(c.cliente.nombre) + " · " : ""}${telFmt(c.cliente.tel)}${c.cliente.nit ? " · NIT " + esc(c.cliente.nit) : ""}</span></span>
      <span class="cliente-num"><b>${Q(c.total)}</b><span>${plural(c.pedidos.length, "pedido", "pedidos")} · ${haceTxt(c.ultimo)}</span></span>
    </button>`).join("") || `<p class="tenue">Ningún cliente coincide.</p>`;
}
I.buscar_cliente = el => { clientesUI.buscar = el.value; $("#clientes").innerHTML = listaClientes(); };
A.ver_cliente = el => abrir("cliente", { id: el.dataset.id, ancha: true });
MODALES.cliente = m => {
  const c = clientes().find(x => x.id === m.id); if (!c) return "<p>No encontrado.</p>";
  const artes = []; c.pedidos.forEach(p => p.items.forEach(it => { if (it.arte || it.grabado) artes.push({ it, p }); }));
  return `
    <h2>${esc(c.cliente.empresa || c.cliente.nombre)}</h2>
    <p class="sub">${esc(c.cliente.nombre)} · ${telFmt(c.cliente.tel)}${c.cliente.nit ? " · NIT " + esc(c.cliente.nit) : ""}</p>
    <div class="fila-btns"><a class="btn btn-linea btn-chico" target="_blank" rel="noopener" href="${waLink(c.cliente.tel, "Hola " + (c.cliente.nombre || "").split(" ")[0] + ", ")}">${ico("wa")} WhatsApp</a></div>
    <section class="panel-cifras cifras-chicas">
      <div class="cifra"><span>Ha comprado</span><b>${Q(c.total)}</b></div>
      <div class="cifra"><span>Pedidos</span><b>${c.pedidos.length}</b></div>
      <div class="cifra"><span>Por cobrar</span><b>${Q(sum(c.pedidos.filter(p => p.estado !== "cancelado"), p => Math.max(0, saldoPedido(p))))}</b></div>
    </section>
    ${artes.length ? `<section class="fp-caja"><h3>Artes guardados</h3><div class="artes">${artes.map(({ it, p }, k) => `<figure>${it.arte ? `<img src="${esc(it.arte)}" alt="Arte de ${esc(it.nombre)}">` : agendaSVG(it.grabado, "ca" + k)}<figcaption>${esc(it.nombre)} · ${p.codigo}</figcaption></figure>`).join("")}</div></section>` : ""}
    <section class="fp-caja"><h3>Historial</h3>
      <ul class="lista-simple">${c.pedidos.map(p => `<li><div><b>${p.codigo}</b> · ${cap(cuandoTxt(p.creado))} · ${Q(totalPedido(p))}<span>${esc(p.items.map(i => i.nombre).join(" · "))}</span></div>
        <span class="estado e-${ESTADOS[p.estado].c}">${esc(ESTADOS[p.estado].t)}</span>
        <div class="fila-btns"><button class="btn btn-fantasma btn-chico" data-a="ver_pedido" data-cod="${p.codigo}">Ver</button><button class="btn btn-linea btn-chico" data-a="repetir_pedido" data-cod="${p.codigo}">${ico("copy")} Volver a pedir</button></div></li>`).join("") || `<li class="tenue">Sin pedidos.</li>`}</ul>
    </section>
    ${c.cotizaciones.length ? `<section class="fp-caja"><h3>Cotizaciones</h3><ul class="lista-simple">${c.cotizaciones.map(q => `<li><div><b>${q.codigo}</b> · ${Q(sum(q.items, i => i.subtotal))}<span>${cap(cuandoTxt(q.creado))}</span></div><span class="estado e-${ESTADOS_COT[estadoCot(q)].c}">${ESTADOS_COT[estadoCot(q)].t}</span><a class="btn btn-fantasma btn-chico" href="#/cotizacion/${q.codigo}">Ver</a></li>`).join("")}</ul></section>` : ""}`;
};
A.repetir_pedido = el => abrir("confirmar_repetir", { cod: el.dataset.cod });
MODALES.confirmar_repetir = m => {
  const p = DB.pedido(m.cod);
  return `<h2>¿Volver a pedir ${p.codigo}?</h2>
    <p class="sub">Se crea un pedido nuevo para ${esc(p.cliente.empresa || p.cliente.nombre)} con lo mismo: ${esc(p.items.map(i => i.cant + " " + i.nombre).join(", "))} · ${Q(totalPedido(p))}. Los precios se recalculan con la lista de hoy.</p>
    <div class="fila-btns"><button class="btn btn-acento" data-a="repetir_si" data-cod="${p.codigo}">${ico("copy")} Crear pedido</button><button class="btn btn-fantasma" data-a="cerrar">No</button></div>`;
};
A.repetir_si = el => {
  const viejo = DB.pedido(el.dataset.cod);
  const items = viejo.items.map(it => { const p = DB.producto(it.producto_id), c = calcularLinea(p, it); return Object.assign({}, it, { id: uid(), unit: c.unit, desc: c.desc, disenio: 0, disenar: false, subtotal: r2(c.subtotal - c.disenio) }); });
  const nuevo = DB.crearPedido({ origen: "mostrador", cliente: Object.assign({}, viejo.cliente), items, entrega: null, disenador: viejo.disenador || "", notas: "Repetición de " + viejo.codigo });
  ui.pila = []; renderModal(); refrescarPanel();
  aviso(nuevo.codigo + " creado (repite " + viejo.codigo + ")");
  abrir("pedido", { cod: nuevo.codigo, ancha: true });
};

/* ---------- cotizaciones ---------- */
const ESTADOS_COT = { enviada: { t: "Enviada", c: "aviso" }, aceptada: { t: "Aceptada", c: "ok" }, rechazada: { t: "Rechazada", c: "apagado" }, vencida: { t: "Vencida", c: "apagado" } };
const venceCot = q => q.creado + (q.vigencia || DB.config().cot_vigencia) * DIA;
const estadoCot = q => q.estado === "enviada" && venceCot(q) < Date.now() ? "vencida" : q.estado;
const totalCot = q => r2(sum(q.items, i => i.subtotal));
function crearCotizacion(datos) {
  const cfg = DB.config();
  const q = Object.assign({ id: uid(), codigo: "COT-" + (cfg.consecutivo_cot = (cfg.consecutivo_cot || 200) + 1), creado: Date.now(), estado: "enviada", vigencia: cfg.cot_vigencia, notas: "", pedido: "" }, datos);
  DB.t("cotizaciones").push(q); DB.guardar(); return q;
}
function cotizacionACliente(q) {
  if (q.pedido) return DB.pedido(q.pedido);
  const p = DB.crearPedido({ origen: "cotizacion", cliente: Object.assign({}, q.cliente), items: q.items.map(i => Object.assign({}, i, { id: uid() })), entrega: null, notas: "Desde " + q.codigo });
  q.estado = "aceptada"; q.pedido = p.codigo; DB.guardar(); return p;
}
PANEL_TABS.cotizaciones = () => {
  const qs = [...DB.t("cotizaciones")].sort((a, b) => b.creado - a.creado);
  const abiertas = qs.filter(q => estadoCot(q) === "enviada");
  return `
    <section class="panel-cifras">
      <div class="cifra"><span>Esperando respuesta</span><b>${abiertas.length}</b><small>${Q(sum(abiertas, totalCot))} en juego</small></div>
      <div class="cifra"><span>Aceptadas</span><b>${qs.filter(q => q.estado === "aceptada").length}</b></div>
      <div class="cifra"><span>Vencidas o rechazadas</span><b>${qs.filter(q => ["vencida", "rechazada"].includes(estadoCot(q))).length}</b></div>
      <a class="cifra cifra-accion" href="#/cotizar?mostrador=1&cot=1">${ico("plus")}<b>Nueva cotización</b></a>
    </section>
    <ul class="cot-lista">${qs.map(q => {
      const e = estadoCot(q), dias = Math.ceil((venceCot(q) - Date.now()) / DIA);
      return `<li>
        <div class="cot-info"><b>${q.codigo}</b> · ${esc(q.cliente.empresa || q.cliente.nombre)}<span>${esc(q.items.map(i => i.nombre).join(" · "))}</span><span>${cap(cuandoTxt(q.creado))} · ${e === "enviada" ? (dias > 0 ? "vence en " + plural(dias, "día", "días") : "vence hoy") : q.pedido ? "pedido " + q.pedido : ""}</span></div>
        <b class="cot-total">${Q(totalCot(q))}</b>
        <span class="estado e-${ESTADOS_COT[e].c}">${ESTADOS_COT[e].t}</span>
        <div class="fila-btns">
          <a class="btn btn-linea btn-chico" href="#/cotizacion/${q.codigo}">${ico("eye")} PDF</a>
          <a class="btn btn-fantasma btn-chico" target="_blank" rel="noopener" href="${waLink(q.cliente.tel, "Hola " + (q.cliente.nombre || "").split(" ")[0] + ", te comparto la cotización " + q.codigo + " de " + MARCA.nombre + ": " + urlBase() + "#/cotizacion/" + q.codigo)}">${ico("wa")}</a>
          ${e === "enviada" || e === "vencida" ? `<button class="btn btn-acento btn-chico" data-a="cot_a_pedido" data-cod="${q.codigo}">Convertir en pedido</button><button class="btn btn-fantasma btn-chico" data-a="cot_rechazar" data-cod="${q.codigo}">Rechazada</button>` : ""}
        </div>
      </li>`;
    }).join("") || `<li class="tenue">Sin cotizaciones.</li>`}</ul>`;
};
const cotizacion = cod => DB.t("cotizaciones").find(q => q.codigo.toUpperCase() === String(cod || "").toUpperCase());
A.cot_a_pedido = el => { const p = cotizacionACliente(cotizacion(el.dataset.cod)); refrescarPanel(); aviso("Ahora es el pedido " + p.codigo); abrir("pedido", { cod: p.codigo, ancha: true }); };
A.cot_rechazar = el => { const q = cotizacion(el.dataset.cod); q.estado = "rechazada"; DB.guardar(); refrescarPanel(); aviso(q.codigo + " marcada como rechazada"); };

/* documento de la cotización: se imprime o se guarda como PDF desde el navegador */
VISTAS.cotizacion = p => {
  const q = cotizacion(p[0]);
  if (!q) return `${navHTML(true)}<main class="seguir seguir-vacio" id="principal"><h1 class="titulo-xl">No encontramos esa cotización.</h1></main>`;
  const cfg = DB.config(), e = estadoCot(q), total = totalCot(q), equipo = sesion.ok;
  return `
  ${navHTML(true)}
  <main class="cot-pagina" id="principal">
    <div class="cot-acciones no-imprimir">
      <button class="btn btn-acento" data-a="imprimir">${ico("printer")} Imprimir o guardar PDF</button>
      ${e === "enviada" && !equipo ? `<button class="btn btn-linea" data-a="cot_aceptar" data-cod="${q.codigo}">${ico("check")} Aceptar cotización</button>` : ""}
      ${equipo ? `<a class="btn btn-fantasma" href="#/panel" data-a="volver_cot">${ico("arrow-l")} Volver al panel</a>` : ""}
      <span class="estado e-${ESTADOS_COT[e].c}">${ESTADOS_COT[e].t}</span>
    </div>
    <article class="cot-doc">
      <header class="cot-doc-cabeza">
        <div class="cot-doc-marca">${simbolo({ clase: "cot-doc-sim" })}<img src="${MARCA.letras}" alt="${esc(MARCA.nombre)}"></div>
        <div class="cot-doc-titulo"><h1>Cotización</h1><p>${q.codigo}</p></div>
      </header>
      <div class="cot-doc-datos">
        <div><h2>Para</h2><p><b>${esc(q.cliente.empresa || q.cliente.nombre)}</b><br>${q.cliente.empresa ? esc(q.cliente.nombre) + "<br>" : ""}Tel. ${telFmt(q.cliente.tel)}${q.cliente.nit ? "<br>NIT " + esc(q.cliente.nit) : ""}</p></div>
        <div><h2>De</h2><p><b>${esc(MARCA.nombre)}</b><br>${esc(MARCA.direccion)}<br>Tel. ${MARCA.telefonos.join(" · ")}<br>${esc(MARCA.correo)}</p></div>
        <div><h2>Fecha</h2><p>${cap(fechaLarga(q.creado))} ${new Date(q.creado).getFullYear()}<br><b>Válida hasta</b> ${fechaLarga(venceCot(q))}</p></div>
      </div>
      <table class="cot-tabla">
        <thead><tr><th>Producto</th><th>Detalle</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Subtotal</th></tr></thead>
        <tbody>${q.items.map(i => `<tr><td>${esc(i.nombre)}</td><td>${lineaResumen(i)}${i.nota ? "<br><i>" + esc(i.nota) + "</i>" : ""}${i.desc ? `<br><span class="cot-ahorro">Mayoreo −${Q(i.desc)}</span>` : ""}</td><td class="num">${i.medida === "m2" ? r2(i.area * i.cant) + " m²" : i.cant}</td><td class="num">${Q(i.unit)}</td><td class="num">${Q(i.subtotal)}</td></tr>`).join("")}</tbody>
        <tfoot>
          <tr><td colspan="4">Total</td><td class="num">${Q(total)}</td></tr>
          <tr class="cot-anticipo"><td colspan="4">Anticipo para empezar (${cfg.anticipo_pct}%)</td><td class="num">${Q(total * cfg.anticipo_pct / 100)}</td></tr>
        </tfoot>
      </table>
      <div class="cot-doc-pie">
        <div><h2>Condiciones</h2><p>${esc(cfg.cot_condiciones)}</p></div>
        <div><h2>Depósitos</h2><p>${esc(cfg.banco)}</p></div>
      </div>
      <p class="cot-doc-gracias">Gracias por pensar en nosotros. <b>Despegamos tu marca.</b></p>
    </article>
  </main>`;
};
A.imprimir = () => window.print();
A.cot_aceptar = el => {
  const p = cotizacionACliente(cotizacion(el.dataset.cod));
  aviso("¡Aceptada! Tu pedido es " + p.codigo); ir("#/pedido/" + p.codigo + "?nuevo=1");
};
A.volver_cot = () => { panelUI.tab = "cotizaciones"; ir("#/panel"); };

/* ---------- carga de los diseñadores ---------- */
PANEL_TABS.diseno = () => {
  const dis = [{ id: "", nombre: "Sin asignar" }, ...(DB.config().disenadores || [])];
  const activos = DB.pedidos().filter(p => ["recibido", "diseno", "prueba"].includes(p.estado));
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const stats = d => {
    const mios = DB.pedidos().filter(p => (p.disenador || "") === d.id);
    const aprob = mios.map(p => ({ p, a: p.pruebas.find(x => x.respuesta === "aprobada") })).filter(x => x.a);
    const delMes = aprob.filter(x => (x.a.rt || x.a.t) >= +mes);
    const rondas = aprob.length ? sum(aprob, x => x.p.pruebas.length) / aprob.length : 0;
    const horas = aprob.length ? sum(aprob, x => ((x.a.rt || x.a.t) - x.p.creado) / HORA) / aprob.length : 0;
    return { activos: activos.filter(p => (p.disenador || "") === d.id), delMes: delMes.length, rondas, horas };
  };
  return `
    <div class="disenadores">${dis.map(d => {
      const s = stats(d);
      return `<section class="maq">
        <h2>${d.id ? `<span class="cliente-ini">${esc(iniciales(d.nombre))}</span>` : ico("pen")} ${esc(d.nombre)}<em>${s.activos.length}</em></h2>
        ${d.id ? `<p class="dis-stats"><span><b>${s.delMes}</b> aprobados este mes</span><span><b>${s.rondas ? s.rondas.toFixed(1) : "—"}</b> pruebas por diseño</span><span><b>${s.horas ? (s.horas < 48 ? Math.round(s.horas) + " h" : Math.round(s.horas / 24) + " días") : "—"}</b> hasta aprobar</span></p>` : ""}
        ${s.activos.map(p => {
          const pr = p.pruebas[p.pruebas.length - 1];
          return `<button class="tarjeta-ped" data-a="ver_pedido" data-cod="${p.codigo}">
            <span class="tp-arriba"><b>${p.codigo}</b><span class="tp-hace">${haceTxt(p.creado)}</span></span>
            <span class="tp-cliente">${esc(p.cliente.empresa || p.cliente.nombre)}</span>
            <span class="tp-items">${esc(p.items.map(i => i.nombre).join(" · "))}</span>
            <span class="tp-abajo"><span class="estado e-${ESTADOS[p.estado].c}">${esc(ESTADOS[p.estado].t)}</span><span>${plural(p.pruebas.length, "prueba", "pruebas")}</span></span>
            ${pr && pr.respuesta === "cambios" ? `<span class="insignia amarilla">${ico("edit")} Pidió cambios</span>` : pr && pr.respuesta === "aprobada" ? `<span class="insignia ok">${ico("check")} Aprobada</span>` : ""}
          </button>`;
        }).join("") || `<p class="columna-vacia">Sin diseños pendientes.</p>`}
      </section>`;
    }).join("")}</div>`;
};
