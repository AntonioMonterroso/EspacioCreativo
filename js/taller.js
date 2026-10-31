"use strict";
/* ============================================================
   Taller: producción por máquina (+ modo taller para tablet/TV),
   entregas y calendario, inventario de material, caja y costos.
   ============================================================ */

/* ---------- órdenes de producción ---------- */
const maquina = id => MAQUINAS.find(m => m.id === id) || { nombre: id, icono: "box" };
function tiempoTxt(ms) { const m = Math.max(0, Math.round(ms / MIN)); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + (m % 60) + " min"; }

function opHTML(o, grande) {
  const p = DB.pedido(o.pedido) || { cliente: {}, items: [] }, it = p.items.find(i => i.id === o.item) || {};
  const tarde = p.entrega && dia0(p.entrega) < dia0(), hoy = p.entrega && dia0(p.entrega) === dia0();
  return `
    <article class="op op-${o.estado} ${grande ? "op-grande" : ""}">
      <header class="op-cabeza"><b>${o.codigo}</b><span class="estado e-${ESTADOS_OP[o.estado].c}">${ESTADOS_OP[o.estado].t}</span></header>
      <div class="op-cuerpo">
        ${it.arte ? `<a class="op-arte" href="${esc(it.arte)}" target="_blank" rel="noopener" title="Abrir el arte"><img src="${esc(it.arte)}" alt="Arte del cliente"></a>` : it.grabado ? `<span class="op-arte">${agendaSVG(it.grabado, "op" + o.id)}</span>` : ""}
        <div>
          <p class="op-nombre">${esc(o.nombre)}</p>
          <p class="op-desc">${esc(o.desc)}</p>
          ${o.nota ? `<p class="op-nota">${ico("msg")} ${esc(o.nota)}</p>` : ""}
          <p class="op-pedido">${p.codigo} · ${esc(p.cliente.empresa || p.cliente.nombre)}</p>
        </div>
      </div>
      <footer class="op-pie">
        ${p.entrega ? `<span class="op-entrega ${tarde ? "tarde" : hoy ? "hoy" : ""}">${ico("clock")} ${tarde ? "Atrasado · " : ""}${cuandoTxt(p.entrega)}</span>` : "<span></span>"}
        ${o.estado === "proceso" ? `<span class="op-timer">${tiempoTxt(Date.now() - o.inicio)}</span>` : o.estado === "hecha" ? `<span class="op-timer">${ico("check")} ${tiempoTxt(o.fin - (o.inicio || o.fin))}</span>` : ""}
      </footer>
      ${o.estado === "cola" ? `<button class="btn btn-acento btn-bloque ${grande ? "btn-grande" : ""}" data-a="op_mover" data-id="${o.id}" data-e="proceso">${ico("zap")} Empezar</button>`
        : o.estado === "proceso" ? `<div class="fila-btns op-btns"><button class="btn btn-acento ${grande ? "btn-grande" : ""}" data-a="op_mover" data-id="${o.id}" data-e="hecha">${ico("check")} Terminar</button><button class="btn btn-fantasma" data-a="op_mover" data-id="${o.id}" data-e="cola">Pausar</button></div>` : ""}
    </article>`;
}
function columnasMaquinas(grande) {
  const ops = DB.t("ordenes"), hoy = dia0();
  return MAQUINAS.map(m => {
    const activas = ops.filter(o => o.maquina === m.id && o.estado !== "hecha").sort((a, b) => (a.estado === "proceso" ? -1 : 0) - (b.estado === "proceso" ? -1 : 0) || a.creado - b.creado);
    const hechas = ops.filter(o => o.maquina === m.id && o.estado === "hecha" && o.fin >= hoy);
    return `
      <section class="maq ${grande ? "maq-grande" : ""}" aria-label="${esc(m.nombre)}">
        <h2>${ico(m.icono)} ${esc(m.nombre)}<em>${activas.length}</em></h2>
        ${activas.map(o => opHTML(o, grande)).join("") || `<p class="columna-vacia">${ico("check")} Sin trabajo en cola.</p>`}
        ${hechas.length ? `<p class="maq-hechas">${ico("check")} ${plural(hechas.length, "terminada", "terminadas")} hoy</p>` : ""}
      </section>`;
  }).join("");
}

PANEL_TABS.produccion = () => {
  const listos = DB.pedidos().filter(p => p.estado === "prueba" && p.pruebas.length && p.pruebas[p.pruebas.length - 1].respuesta === "aprobada");
  const bajos = materialesBajos();
  return `
    ${bajos.length ? `<div class="alerta-barra">${ico("box")} Se está acabando: ${bajos.map(m => `<b>${esc(m.nombre)}</b> (${m.stock} ${m.unidad})`).join(", ")}</div>` : ""}
    ${listos.length && puede("tablero") ? `<section class="fp-caja"><h3>${ico("check")} Aprobados, listos para producir</h3><ul class="lista-simple">${listos.map(p => `
      <li><div><b>${p.codigo}</b> · ${esc(p.cliente.empresa || p.cliente.nombre)}<span>${esc(p.items.map(i => i.nombre).join(" · "))}</span></div><button class="btn btn-acento btn-chico" data-a="estado" data-cod="${p.codigo}" data-e="produccion">Mandar a producción</button></li>`).join("")}</ul></section>` : ""}
    <div class="maquinas">${columnasMaquinas(false)}</div>`;
};

A.op_mover = el => {
  const o = DB.t("ordenes").find(x => x.id === el.dataset.id); if (!o) return;
  const listo = moverOrden(o, el.dataset.e, ROLES[sesion.rol].t);
  refrescarPanel();
  if (el.dataset.e === "hecha") aviso(o.codigo + " terminada. Material descontado.");
  if (listo) { aviso(listo.codigo + " está listo para entregar", "ok", 4500); if (puede("tablero")) abrir("avisar", { cod: listo.codigo, e: "listo" }); }
};

/* ---------- modo taller: pantalla grande para tablet o TV ---------- */
PROTEGIDA.taller = ["dueno", "taller"];
VISTAS.taller = () => `
  <div class="taller">
    <header class="taller-barra">
      ${logotipo("logotipo-nav")}
      <h1>Modo taller</h1>
      <span class="taller-reloj" id="taller-reloj">${horaTxt(Date.now())}</span>
      <a href="#/panel" class="btn btn-linea">${ico("arrow-l")} Panel</a>
    </header>
    <main class="taller-cuerpo" id="taller-cuerpo">${tallerCuerpoHTML()}</main>
  </div>`;
function tallerCuerpoHTML() {
  const bajos = materialesBajos();
  return `${bajos.length ? `<div class="alerta-barra">${ico("box")} Pedir: ${bajos.map(m => esc(m.nombre)).join(", ")}</div>` : ""}<div class="maquinas maquinas-grandes">${columnasMaquinas(true)}</div>`;
}
DESPUES.taller = () => {
  const reloj = setInterval(() => { const r = $("#taller-reloj"); if (r) r.textContent = horaTxt(Date.now()); }, 15000);
  const repinta = setInterval(() => { if (!ui.pila.length) { const c = $("#taller-cuerpo"); if (c) c.innerHTML = tallerCuerpoHTML(); } }, 30000);
  window.limpiarVista = () => { clearInterval(reloj); clearInterval(repinta); };
};

/* ---------- entregas y calendario ---------- */
const entregaUI = { mes: null, dia: null };
const pendientesEntrega = () => DB.pedidos().filter(p => p.entrega && !["entregado", "cancelado"].includes(p.estado));
function entregaFila(p) {
  const saldo = saldoPedido(p);
  return `<li class="ent-fila">
    <div><b>${p.codigo}</b> · ${esc(p.cliente.empresa || p.cliente.nombre)}<span>${esc(p.items.map(i => i.nombre).join(" · "))}</span></div>
    <span class="estado e-${ESTADOS[p.estado].c}">${esc(ESTADOS[p.estado].t)}</span>
    ${saldo > 0 && puede("tablero") ? `<span class="tp-saldo">Saldo ${Q(saldo)}</span>` : ""}
    <div class="fila-btns">
      ${p.estado === "listo" ? `<button class="btn btn-acento btn-chico" data-a="entregar" data-cod="${p.codigo}">${ico("check")} Entregar</button>` : ""}
      ${puede("tablero") ? `<button class="btn btn-fantasma btn-chico" data-a="ver_pedido" data-cod="${p.codigo}">Ver</button>` : ""}
    </div>
  </li>`;
}
PANEL_TABS.entregas = () => {
  const ps = pendientesEntrega(), hoy = dia0();
  const atrasados = ps.filter(p => dia0(p.entrega) < hoy), deHoy = ps.filter(p => dia0(p.entrega) === hoy);
  const semana = ps.filter(p => dia0(p.entrega) > hoy && dia0(p.entrega) <= hoy + 7 * DIA).sort((a, b) => a.entrega - b.entrega);
  const base = entregaUI.mes ? new Date(entregaUI.mes) : new Date(); base.setDate(1); base.setHours(0, 0, 0, 0);
  const primero = (base.getDay() + 6) % 7, diasMes = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const todos = DB.pedidos().filter(p => p.entrega && p.estado !== "cancelado");
  const celdas = Array.from({ length: primero }, () => `<span class="cal-vacio"></span>`).concat(Array.from({ length: diasMes }, (_, i) => {
    const t = +new Date(base.getFullYear(), base.getMonth(), i + 1), del = todos.filter(p => dia0(p.entrega) === t);
    const tarde = del.some(p => t < hoy && p.estado !== "entregado");
    return `<button class="cal-dia ${t === hoy ? "hoy" : ""} ${entregaUI.dia === t ? "activo" : ""} ${tarde ? "tarde" : ""}" data-a="cal_dia" data-t="${t}" aria-label="${fechaLarga(t)}: ${plural(del.length, "entrega", "entregas")}">
      <span>${i + 1}</span>${del.length ? `<em>${del.length}</em>` : ""}</button>`;
  }));
  const delDia = entregaUI.dia ? todos.filter(p => dia0(p.entrega) === entregaUI.dia) : [];
  return `
    <div class="ent-grid">
      <div class="pila">
        ${atrasados.length ? `<section class="fp-caja ent-tarde"><h3>${ico("clock")} Atrasados <em>${atrasados.length}</em></h3><ul class="lista-simple">${atrasados.map(entregaFila).join("")}</ul></section>` : ""}
        <section class="fp-caja"><h3>Hoy <em>${deHoy.length}</em></h3>${deHoy.length ? `<ul class="lista-simple">${deHoy.map(entregaFila).join("")}</ul>` : `<p class="tenue">Nada para entregar hoy.</p>`}</section>
        <section class="fp-caja"><h3>Próximos 7 días <em>${semana.length}</em></h3>${semana.length ? `<ul class="lista-simple">${semana.map(p => entregaFila(p).replace("<div><b>", `<div><small class="ent-cuando">${cap(cuandoTxt(p.entrega))}</small><b>`)).join("")}</ul>` : `<p class="tenue">Sin entregas esta semana.</p>`}</section>
      </div>
      <section class="fp-caja calendario" aria-label="Calendario de entregas">
        <div class="cal-cabeza">
          <button class="btn btn-icono btn-fantasma" data-a="cal_mes" data-d="-1" aria-label="Mes anterior">${ico("chev-l")}</button>
          <h3>${cap(MESES[base.getMonth()])} ${base.getFullYear()}</h3>
          <button class="btn btn-icono btn-fantasma" data-a="cal_mes" data-d="1" aria-label="Mes siguiente">${ico("chev-r")}</button>
        </div>
        <div class="cal-semana">${["L", "M", "M", "J", "V", "S", "D"].map(x => `<span>${x}</span>`).join("")}</div>
        <div class="cal-dias">${celdas.join("")}</div>
        ${entregaUI.dia ? `<div class="cal-detalle"><h4>${cap(fechaLarga(entregaUI.dia))}</h4>${delDia.length ? `<ul class="lista-simple">${delDia.map(entregaFila).join("")}</ul>` : `<p class="tenue">Sin entregas ese día.</p>`}</div>` : `<p class="tenue">Toca un día para ver sus entregas.</p>`}
      </section>
    </div>`;
};
A.cal_mes = el => { const b = entregaUI.mes ? new Date(entregaUI.mes) : new Date(); b.setDate(1); b.setMonth(b.getMonth() + +el.dataset.d); entregaUI.mes = +b; entregaUI.dia = null; refrescarPanel(); };
A.cal_dia = el => { entregaUI.dia = entregaUI.dia === +el.dataset.t ? null : +el.dataset.t; refrescarPanel(); };
A.entregar = el => abrir("entregar", { cod: el.dataset.cod });
MODALES.entregar = m => {
  const p = DB.pedido(m.cod), saldo = saldoPedido(p);
  return `
    <h2>Entregar ${p.codigo}</h2>
    <p class="sub">${esc(p.cliente.empresa || p.cliente.nombre)} · ${esc(p.items.map(i => i.nombre).join(" · "))}</p>
    ${saldo > 0 ? `<div class="alerta-barra">${ico("cash")} Tiene saldo de <b>${Q(saldo)}</b>. Regístralo antes de entregar.</div>
      <div class="fila-btns"><button class="btn btn-acento" data-a="nuevo_pago" data-cod="${p.codigo}">${ico("cash")} Registrar pago</button><button class="btn btn-fantasma" data-a="entregar_si" data-cod="${p.codigo}">Entregar con saldo</button></div>`
      : `<div class="fila-btns"><button class="btn btn-acento" data-a="entregar_si" data-cod="${p.codigo}">${ico("check")} Confirmar entrega</button><button class="btn btn-fantasma" data-a="cerrar">Ahora no</button></div>`}`;
};
A.entregar_si = el => { const p = DB.pedido(el.dataset.cod); ui.pila = []; renderModal(); DB.cambiarEstado(p, "entregado", ROLES[sesion.rol].t); refrescarPanel(); aviso(p.codigo + " entregado"); if (puede("tablero")) abrir("avisar", { cod: p.codigo, e: "entregado" }); };

/* ---------- inventario ---------- */
PANEL_TABS.inventario = () => {
  const mats = DB.t("materiales"), movs = [...DB.t("movimientos")].sort((a, b) => b.t - a.t).slice(0, 14), dueno = sesion.rol === "dueno";
  return `
    ${materialesBajos().length ? `<div class="alerta-barra">${ico("box")} ${plural(materialesBajos().length, "material está", "materiales están")} en el mínimo o abajo.</div>` : ""}
    <section class="fp-caja">
      <div class="fp-titulo"><h3>Materiales</h3>${dueno ? `<button class="btn btn-linea btn-chico" data-a="mat_nuevo">${ico("plus")} Nuevo material</button>` : ""}</div>
      <ul class="inv-lista">${mats.map(m => {
        const pct = clamp(m.stock / Math.max(1, m.minimo * 3) * 100, 2, 100), bajo = m.stock <= m.minimo;
        return `<li class="${bajo ? "bajo" : ""}">
          <div class="inv-nombre"><b>${esc(m.nombre)}</b><span>Mínimo ${m.minimo} ${esc(m.unidad)}${dueno ? ` · ${Q(m.costo)} c/${esc(m.unidad)}` : ""}</span></div>
          <div class="inv-barra" role="img" aria-label="${m.stock} ${esc(m.unidad)}"><span style="width:${pct}%"></span></div>
          <b class="inv-stock">${m.stock} <small>${esc(m.unidad)}</small></b>
          <div class="fila-btns"><button class="btn btn-linea btn-chico" data-a="mat_entrada" data-id="${m.id}">${ico("plus")} Entrada</button><button class="btn btn-fantasma btn-chico" data-a="mat_ajuste" data-id="${m.id}">Ajustar</button></div>
        </li>`;
      }).join("")}</ul>
    </section>
    <section class="fp-caja">
      <h3>Movimientos recientes</h3>
      <ul class="lista-simple">${movs.map(x => { const m = materialDe(x.material) || { nombre: x.material, unidad: "" }; return `<li><div><b class="${x.cant < 0 ? "sale" : "entra"}">${x.cant > 0 ? "+" : ""}${x.cant} ${esc(m.unidad)}</b> ${esc(m.nombre)}<span>${esc(x.motivo)} · ${cuandoTxt(x.t)} ${horaTxt(x.t)}</span></div>${dueno && x.costo ? `<span class="tenue">${Q(x.costo)}</span>` : ""}</li>`; }).join("") || `<li class="tenue">Sin movimientos.</li>`}</ul>
    </section>`;
};
A.mat_entrada = el => abrir("mat_entrada", { id: el.dataset.id });
MODALES.mat_entrada = m => {
  const x = materialDe(m.id);
  return `
    <h2>Entrada de material</h2><p class="sub">${esc(x.nombre)} · hay ${x.stock} ${esc(x.unidad)}</p>
    <form data-f="mat_entrada">
      <input type="hidden" name="id" value="${x.id}">
      <div class="campo"><label for="me-cant">Cantidad que entra (${esc(x.unidad)})</label><input id="me-cant" name="cant" type="number" step="0.01" min="0.01" required autofocus></div>
      ${sesion.rol === "dueno" ? `<div class="campo"><label for="me-costo">Costo total de la compra (Q) <span class="opcional">(opcional)</span></label><input id="me-costo" name="costo" type="number" step="0.01" min="0"></div>
      <fieldset class="campo"><legend>Se pagó con</legend><div class="chips">${[["transferencia", "Transferencia"], ["efectivo", "Efectivo de caja"], ["credito", "Crédito"]].map(([k, n], j) => `<label class="chip ${j ? "" : "activo"}"><input type="radio" name="pago" value="${k}" ${j ? "" : "checked"} data-i="chip_radio"><span>${n}</span></label>`).join("")}</div></fieldset>` : ""}
      <div class="campo"><label for="me-mot">Proveedor o nota</label><input id="me-mot" name="motivo" placeholder="Compra a…"></div>
      <button class="btn btn-acento btn-bloque">${ico("check")} Guardar entrada</button>
    </form>`;
};
F.mat_entrada = (f, d) => {
  const x = materialDe(d.id), cant = r2(+d.cant); if (!(cant > 0)) return;
  const costo = r2(+d.costo || 0);
  x.stock = r2(x.stock + cant);
  if (costo) x.costo = r2(costo / cant);
  DB.t("movimientos").push({ id: uid(), t: Date.now(), material: x.id, cant, motivo: d.motivo.trim() || "Entrada", costo: costo || 0, pago: d.pago || "", quien: ROLES[sesion.rol].t });
  DB.guardar(); cerrar(); refrescarPanel(); aviso("+" + cant + " " + x.unidad + " de " + x.nombre);
};
A.mat_ajuste = el => abrir("mat_ajuste", { id: el.dataset.id });
MODALES.mat_ajuste = m => {
  const x = materialDe(m.id);
  return `
    <h2>Ajustar por conteo</h2><p class="sub">${esc(x.nombre)} · el sistema dice ${x.stock} ${esc(x.unidad)}</p>
    <form data-f="mat_ajuste">
      <input type="hidden" name="id" value="${x.id}">
      <div class="campo"><label for="ma-real">Lo que hay de verdad (${esc(x.unidad)})</label><input id="ma-real" name="real" type="number" step="0.01" min="0" value="${x.stock}" required autofocus></div>
      ${sesion.rol === "dueno" ? `<div class="campo"><label for="ma-min">Mínimo para avisar</label><input id="ma-min" name="minimo" type="number" step="0.01" min="0" value="${x.minimo}"></div>` : ""}
      <div class="campo"><label for="ma-nota">Motivo</label><input id="ma-nota" name="motivo" placeholder="Conteo, merma, se dañó…"></div>
      <button class="btn btn-acento btn-bloque">${ico("check")} Guardar ajuste</button>
    </form>`;
};
F.mat_ajuste = (f, d) => {
  const x = materialDe(d.id), real = r2(+d.real), dif = r2(real - x.stock);
  if (d.minimo != null && d.minimo !== "") x.minimo = +d.minimo;
  if (dif) DB.t("movimientos").push({ id: uid(), t: Date.now(), material: x.id, cant: dif, motivo: "Ajuste: " + (d.motivo.trim() || "conteo"), quien: ROLES[sesion.rol].t });
  x.stock = real; DB.guardar(); cerrar(); refrescarPanel(); aviso("Inventario ajustado");
};
A.mat_nuevo = () => abrir("mat_nuevo");
MODALES.mat_nuevo = () => `
  <h2>Nuevo material</h2>
  <form data-f="mat_nuevo">
    <div class="campo"><label for="mn-n">Nombre</label><input id="mn-n" name="nombre" required autofocus></div>
    <div class="ajustes-grid">
      <div class="campo"><label for="mn-u">Unidad</label><select id="mn-u" name="unidad"><option>m²</option><option>pieza</option><option>hoja</option><option>rollo</option><option>litro</option></select></div>
      <div class="campo"><label for="mn-s">Hay ahora</label><input id="mn-s" name="stock" type="number" step="0.01" min="0" value="0"></div>
      <div class="campo"><label for="mn-m">Mínimo</label><input id="mn-m" name="minimo" type="number" step="0.01" min="0" value="0"></div>
      <div class="campo"><label for="mn-c">Costo por unidad (Q)</label><input id="mn-c" name="costo" type="number" step="0.01" min="0" value="0"></div>
    </div>
    <button class="btn btn-acento btn-bloque">${ico("check")} Crear</button>
  </form>`;
F.mat_nuevo = (f, d) => {
  DB.t("materiales").push({ id: uid(), nombre: d.nombre.trim(), unidad: d.unidad, stock: +d.stock || 0, minimo: +d.minimo || 0, costo: +d.costo || 0 });
  DB.guardar(); cerrar(); refrescarPanel(); aviso("Material creado");
};

/* ---------- caja y costos ---------- */
function pagosDesde(t0, t1 = Infinity) {
  const out = [];
  DB.pedidos().forEach(p => (p.pagos || []).forEach(x => { if (x.t >= t0 && x.t < t1) out.push(Object.assign({ pedido: p }, x)); }));
  return out.sort((a, b) => b.t - a.t);
}
PANEL_TABS.caja = () => {
  const hoy = dia0(), pagos = pagosDesde(hoy), cierre = DB.t("cierres").find(c => c.t >= hoy);
  const porMetodo = Object.keys(METODOS).map(k => [k, r2(sum(pagos.filter(x => x.metodo === k), x => x.monto))]);
  const salidas = DB.t("movimientos").filter(x => x.t >= hoy && x.pago === "efectivo" && x.costo);
  const efectivo = r2((porMetodo.find(([k]) => k === "efectivo") || [0, 0])[1] - sum(salidas, x => x.costo));
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const delMes = DB.pedidos().filter(p => p.creado >= +mes && p.estado !== "cancelado");
  const vendido = r2(sum(delMes, totalPedido)), costo = r2(sum(delMes, costoPedido)), cobrado = r2(sum(pagosDesde(+mes), x => x.monto));
  const porCobrar = r2(sum(DB.pedidos().filter(p => p.estado !== "cancelado"), p => Math.max(0, saldoPedido(p))));
  return `
    <section class="panel-cifras">
      <div class="cifra"><span>Cobrado hoy</span><b>${Q(sum(pagos, x => x.monto))}</b><small>${plural(pagos.length, "pago", "pagos")}</small></div>
      <div class="cifra"><span>Efectivo en caja</span><b>${Q(efectivo)}</b><small>cobros − compras en efectivo</small></div>
      <div class="cifra"><span>Vendido este mes</span><b>${Q(vendido)}</b><small>cobrado ${Q(cobrado)}</small></div>
      <div class="cifra alerta"><span>Ganancia sobre material</span><b>${Q(vendido - costo)}</b><small>${vendido ? Math.round((vendido - costo) / vendido * 100) : 0}% · por cobrar ${Q(porCobrar)}</small></div>
    </section>
    <div class="ent-grid">
      <section class="fp-caja">
        <div class="fp-titulo"><h3>Caja de hoy</h3>${cierre ? `<span class="insignia ok">${ico("check")} Cerrada</span>` : `<button class="btn btn-acento btn-chico" data-a="cerrar_caja">${ico("lock")} Cerrar caja</button>`}</div>
        <dl class="cuentas">${porMetodo.map(([k, v]) => `<div><dt>${METODOS[k]}</dt><dd>${Q(v)}</dd></div>`).join("")}
          ${salidas.length ? `<div><dt>Compras en efectivo</dt><dd>−${Q(sum(salidas, x => x.costo))}</dd></div>` : ""}
          <div class="fuerte"><dt>Efectivo esperado</dt><dd>${Q(efectivo)}</dd></div></dl>
        <ul class="lista-simple">${pagos.map(x => `<li><div><b>${Q(x.monto)}</b> · ${esc(METODOS[x.metodo] || x.metodo)}<span>${x.pedido.codigo} · ${esc(x.pedido.cliente.empresa || x.pedido.cliente.nombre)} · ${horaTxt(x.t)}</span></div></li>`).join("") || `<li class="tenue">Todavía no hay cobros hoy.</li>`}</ul>
        ${DB.t("cierres").length ? `<h4>Cierres anteriores</h4><ul class="lista-simple">${[...DB.t("cierres")].sort((a, b) => b.t - a.t).slice(0, 5).map(c => `<li><div><b>${cap(cuandoTxt(c.t))}</b> · contado ${Q(c.contado)}<span>${c.nota ? esc(c.nota) + " · " : ""}${esc(c.quien)}</span></div><span class="${c.diferencia < 0 ? "tp-saldo" : "tenue"}">${c.diferencia ? (c.diferencia > 0 ? "+" : "") + Q(c.diferencia) : "Cuadró"}</span></li>`).join("")}</ul>` : ""}
      </section>
      <section class="fp-caja">
        <h3>Costos del mes</h3>
        <ul class="costos-lista">${delMes.map(p => { const t = totalPedido(p), c = costoPedido(p); return `<li><div><b>${p.codigo}</b> · ${esc(p.cliente.empresa || p.cliente.nombre)}<span>Vendido ${Q(t)} · material ${Q(c)}</span></div><b class="${t - c < 0 ? "tp-saldo" : "costo-ok"}">${Q(t - c)}</b></li>`; }).join("") || `<li class="tenue">Sin pedidos este mes.</li>`}</ul>
        <p class="tenue">La ganancia es sobre el material (lo que se descuenta del inventario). No incluye sueldos, luz ni renta.</p>
      </section>
    </div>`;
};
A.cerrar_caja = () => abrir("cierre");
MODALES.cierre = () => {
  const hoy = dia0(), pagos = pagosDesde(hoy);
  const esperado = r2(sum(pagos.filter(x => x.metodo === "efectivo"), x => x.monto) - sum(DB.t("movimientos").filter(x => x.t >= hoy && x.pago === "efectivo" && x.costo), x => x.costo));
  return `
    <h2>Cerrar caja</h2><p class="sub">Debería haber <b>${Q(esperado)}</b> en efectivo.</p>
    <form data-f="cierre">
      <input type="hidden" name="esperado" value="${esperado}">
      <div class="campo"><label for="ci-c">Efectivo contado (Q)</label><input id="ci-c" name="contado" type="number" step="0.01" min="0" required autofocus></div>
      <div class="campo"><label for="ci-n">Nota <span class="opcional">(opcional)</span></label><input id="ci-n" name="nota"></div>
      <button class="btn btn-acento btn-bloque">${ico("lock")} Cerrar caja de hoy</button>
    </form>`;
};
F.cierre = (f, d) => {
  const contado = r2(+d.contado), esperado = r2(+d.esperado), dif = r2(contado - esperado);
  DB.t("cierres").push({ id: uid(), t: Date.now(), esperado, contado, diferencia: dif, nota: d.nota.trim(), quien: ROLES[sesion.rol].t });
  DB.guardar(); cerrar(); refrescarPanel(); aviso(dif ? "Caja cerrada con diferencia de " + Q(dif) : "Caja cerrada: cuadró");
};
