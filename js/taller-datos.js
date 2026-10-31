"use strict";
/* ============================================================
   Datos del taller (Fase 2): máquinas, materiales, órdenes de
   producción, movimientos de inventario, cotizaciones, cierres de
   caja, diseñadores y roles. Extiende la semilla de datos.js.
   ============================================================ */

const MAQUINAS = [
  { id: "gran", nombre: "Gran formato", icono: "printer", desc: "Lona, vinil impreso, calcomanías" },
  { id: "corte", nombre: "Plotter de corte", icono: "scissors", desc: "Vinil de corte y esmerilado" },
  { id: "laser", nombre: "Láser CO₂", icono: "zap", desc: "Agendas, termos, madera, placas" },
  { id: "impresora", nombre: "Impresora láser", icono: "printer", desc: "Tarjetas, hojas y volantes" }
];
const ESTADOS_OP = { cola: { t: "En cola", c: "neutro" }, proceso: { t: "Trabajando", c: "activo" }, hecha: { t: "Terminada", c: "ok" } };
const ROLES = {
  dueno: { t: "Dueño", tabs: ["tablero", "produccion", "diseno", "entregas", "inventario", "caja", "clientes", "cotizaciones", "portafolio", "precios", "ajustes"] },
  diseno: { t: "Diseño", tabs: ["tablero", "diseno", "entregas", "clientes", "cotizaciones", "portafolio"] },
  taller: { t: "Taller", tabs: ["produccion", "entregas", "inventario"] }
};

/* máquina, consumo de material por unidad de venta y días para avisar recompra */
const TALLER_PRODUCTO = {
  manta: { maquina: "gran", consumo: [["lona", 1.1]] },
  rollup: { maquina: "gran", consumo: [["lona", 1.8], ["rollup_b", 1]] },
  calco: { maquina: "gran", consumo: [["vinil_imp", 0.35]], recompra: 90 },
  etiquetas: { maquina: "gran", consumo: [["vinil_imp", 1.2]], recompra: 90 },
  vinil: { maquina: "corte", consumo: [["vinil_corte", 1.15]] },
  esmerilado: { maquina: "corte", consumo: [["esmerilado", 1.15]] },
  agenda: { maquina: "laser", consumo: [["agenda_b", 1]], recompra: 330 },
  termo: { maquina: "laser", consumo: [["termo_b", 1]] },
  llavero: { maquina: "laser", consumo: [["llavero_b", 1]] },
  placa: { maquina: "laser", consumo: [["placa_b", 1]] },
  tarjetas: { maquina: "impresora", consumo: [["cartulina", 100]], recompra: 180 },
  color: { maquina: "impresora", consumo: [["bond", 1]] },
  volantes: { maquina: "impresora", consumo: [["bond", 500]], recompra: 60 }
};

function materialesBase() {
  const M = (id, nombre, unidad, stock, minimo, costo) => ({ id, nombre, unidad, stock, minimo, costo });
  return [
    M("lona", "Lona 13 oz", "m²", 96, 30, 18), M("vinil_imp", "Vinil para impresión", "m²", 14, 15, 22),
    M("vinil_corte", "Vinil de corte (colores)", "m²", 42, 10, 30), M("esmerilado", "Vinil esmerilado", "m²", 22, 8, 45),
    M("agenda_b", "Agendas 2027 en blanco", "pieza", 120, 50, 42), M("termo_b", "Termos de acero", "pieza", 26, 12, 38),
    M("llavero_b", "Llaveros de madera", "pieza", 260, 80, 3.5), M("placa_b", "Placas de acrílico", "pieza", 4, 5, 70),
    M("rollup_b", "Estructuras roll-up", "pieza", 6, 2, 190), M("cartulina", "Cartulina couché 300 g", "hoja", 1800, 500, 0.6),
    M("bond", "Papel bond carta", "hoja", 2600, 500, 0.1)
  ];
}

/* ---------- cálculos ---------- */
function baseItem(it) {
  const p = DB.producto(it.producto_id) || {};
  return p.medida === "m2" ? Math.max(+it.area || 0, p.minimo || 0) * (it.cant || 1) : (it.cant || 1);
}
function consumoItem(it) {
  const t = TALLER_PRODUCTO[it.producto_id]; if (!t) return [];
  const b = baseItem(it);
  return t.consumo.map(([m, q]) => [m, r2(q * b)]);
}
const materialDe = id => DB.t("materiales").find(m => m.id === id);
function costoPedido(p) { return r2(sum(p.items, it => sum(consumoItem(it), ([m, q]) => q * ((materialDe(m) || {}).costo || 0)))); }
function descOP(it) {
  const partes = [it.medida === "m2" ? `${it.ancho} × ${it.alto} m` + (it.cant > 1 ? ` · ${it.cant} pzs` : "") : it.cant + " " + medidaTxt(it.medida, it.cant)];
  Object.values(it.opciones || {}).forEach(v => partes.push(v));
  return partes.join(" · ");
}

/* ---------- órdenes de producción ---------- */
function crearOrdenes(p) {
  const ops = DB.t("ordenes"), cfg = DB.config();
  p.items.forEach(it => {
    const t = TALLER_PRODUCTO[it.producto_id];
    if (!t || ops.some(o => o.pedido === p.codigo && o.item === it.id)) return;
    ops.push({ id: uid(), codigo: "OP-" + (cfg.consecutivo_op = (cfg.consecutivo_op || 300) + 1), pedido: p.codigo, item: it.id, maquina: t.maquina,
      nombre: it.nombre, desc: descOP(it), nota: it.nota || "", estado: "cola", creado: Date.now(), inicio: null, fin: null, operador: "" });
  });
}
const ordenesDe = cod => DB.t("ordenes").filter(o => o.pedido === cod);
function moverOrden(op, estado, quien = "Taller") {
  op.estado = estado;
  if (estado === "proceso") { op.inicio = Date.now(); op.operador = quien; }
  let listo = null;
  if (estado === "hecha") {
    op.fin = Date.now();
    const p = DB.pedido(op.pedido), it = p && p.items.find(i => i.id === op.item);
    if (it) consumoItem(it).forEach(([m, q]) => {
      const mat = materialDe(m); if (!mat) return;
      mat.stock = r2(mat.stock - q);
      DB.t("movimientos").push({ id: uid(), t: Date.now(), material: m, cant: -q, motivo: op.codigo + " · " + p.codigo, quien });
    });
    if (p && p.estado === "produccion" && ordenesDe(p.codigo).every(o => o.estado === "hecha")) { DB.cambiarEstado(p, "listo", quien, "Producción terminada"); listo = p; }
  }
  DB.guardar();
  return listo;
}
const materialesBajos = () => DB.t("materiales").filter(m => m.stock <= m.minimo);

/* ---------- clientes y recompra ---------- */
function clientes() {
  const mapa = new Map();
  const llave = c => String(c.tel || "").replace(/\D/g, "") || (c.nombre || "").toLowerCase();
  DB.pedidos().forEach(p => {
    const k = llave(p.cliente); if (!mapa.has(k)) mapa.set(k, { id: k, cliente: Object.assign({}, p.cliente), pedidos: [], cotizaciones: [] });
    const c = mapa.get(k); c.pedidos.push(p);
    if (!c.cliente.nit && p.cliente.nit) c.cliente.nit = p.cliente.nit;
  });
  DB.t("cotizaciones").forEach(q => {
    const k = llave(q.cliente); if (!mapa.has(k)) mapa.set(k, { id: k, cliente: Object.assign({}, q.cliente), pedidos: [], cotizaciones: [] });
    mapa.get(k).cotizaciones.push(q);
  });
  return [...mapa.values()].map(c => Object.assign(c, {
    total: r2(sum(c.pedidos.filter(p => p.estado !== "cancelado"), totalPedido)),
    ultimo: Math.max(0, ...c.pedidos.map(p => p.creado), ...c.cotizaciones.map(q => q.creado))
  })).sort((a, b) => b.ultimo - a.ultimo);
}
function recompras() {
  const lista = [];
  clientes().forEach(c => {
    const ultimos = {};
    c.pedidos.filter(p => p.estado !== "cancelado").forEach(p => p.items.forEach(it => { if (!ultimos[it.producto_id] || ultimos[it.producto_id].t < p.creado) ultimos[it.producto_id] = { t: p.creado, it, p }; }));
    Object.entries(ultimos).forEach(([pid, u]) => {
      const dias = (TALLER_PRODUCTO[pid] || {}).recompra; if (!dias) return;
      const pasaron = Math.floor((Date.now() - u.t) / DIA);
      if (pasaron >= dias - 20) lista.push({ c, pid, nombre: u.it.nombre, dias, pasaron, pedido: u.p });
    });
  });
  return lista.sort((a, b) => (b.pasaron - b.dias) - (a.pasaron - a.dias));
}

/* ---------- semilla del taller (se suma a la de datos.js) ---------- */
const semillaPedidos = semilla;
semilla = function () {
  const d = semillaPedidos();
  const ahora = Date.now(), hace = (dias, h = 0) => ahora - dias * DIA - h * HORA;
  d.config.pins = { dueno: "0000", diseno: "1111", taller: "2222" };
  d.config.disenadores = [{ id: "d1", nombre: "Ana López" }, { id: "d2", nombre: "Luis Hernández" }];
  d.config.cot_vigencia = 15; d.config.consecutivo_cot = 204; d.config.consecutivo_op = 300;
  d.config.cot_condiciones = "Precios en quetzales, incluyen IVA. Se trabaja con 50% de anticipo y el saldo al entregar. Los tiempos de entrega corren desde la aprobación del diseño y el anticipo.";
  d.config.msj_recompra = "Hola {nombre}, el año pasado te hicimos {producto} en {agencia}. ¿Te apartamos las de este año? Te mantenemos el precio de mayoreo.";
  d.materiales = materialesBase();
  d.ordenes = []; d.movimientos = []; d.cierres = [];

  /* diseñador asignado a los pedidos de ejemplo */
  const asignar = { "EC-1048": "d2", "EC-1047": "d1", "EC-1046": "d1", "EC-1042": "d2", "EC-1045": "d1" };
  d.pedidos.forEach(p => { p.disenador = asignar[p.codigo] || ""; });

  /* pedidos viejos para clientes y recompra */
  const prods = d.productos, pr = id => prods.find(x => x.id === id);
  const linea = (id, l) => { const p = pr(id), c = calcularLinea(p, l); return Object.assign({ id: uid(), producto_id: id, nombre: p.nombre, medida: p.medida, opciones: {}, nota: "" }, l, { cant: c.cant, area: c.area, unit: c.unit, desc: c.desc, disenio: c.disenio, subtotal: c.subtotal }); };
  const viejo = (n, dias, cliente, items, disenador) => {
    const t = hace(dias), total = r2(sum(items, i => i.subtotal));
    return { id: uid(), codigo: "EC-" + n, creado: t, origen: "web", cliente, items, notas: "", entrega: t + 5 * DIA, estado: "entregado", disenador,
      historial: ORDEN_ESTADOS.map((e, i) => ({ t: t + i * DIA, estado: e, quien: i ? "Equipo" : "Cliente" })), pruebas: [], pagos: [{ id: uid(), t, monto: total, metodo: "transferencia", nota: "Pagado" }] };
  };
  d.pedidos.push(
    viejo(912, 352, { nombre: "Andrea Gómez", tel: "57001122", empresa: "Colegio San Antonio", nit: "1234567-8" }, [linea("agenda", { cant: 35, opciones: { color: "Azul" }, nota: "Escudo del colegio" })], "d1"),
    viejo(955, 205, { nombre: "Óscar Pineda", tel: "42335566", empresa: "Agroservicio El Surco", nit: "8765432-1" }, [linea("tarjetas", { cant: 2, opciones: { acabado: "Mate" } })], "d2"),
    viejo(1001, 104, { nombre: "Lucía Barrios", tel: "55123344", empresa: "Café La Ceiba" }, [linea("calco", { cant: 3, opciones: { medida: "5 × 5 cm", material: "Vinil brillante" } })], "d2"),
    viejo(1022, 40, { nombre: "Hotel Reu Plaza", tel: "77710000", empresa: "Hotel Reu Plaza", nit: "5544332-2" }, [linea("placa", { cant: 6 }), linea("manta", { ancho: 4, alto: 1, cant: 1, opciones: { acabado: "Ojetes cada 50 cm" } })], "d1")
  );

  /* órdenes del pedido en producción */
  const enProd = d.pedidos.find(p => p.codigo === "EC-1045");
  const op = (it, maquina, estado, horas) => ({ id: uid(), codigo: "OP-" + (++d.config.consecutivo_op), pedido: "EC-1045", item: it.id, maquina, nombre: it.nombre, desc: "", nota: it.nota || "", estado, creado: hace(1), inicio: estado === "proceso" ? ahora - horas * HORA : null, fin: null, operador: estado === "proceso" ? "Taller" : "" });
  d.ordenes.push(op(enProd.items[0], "corte", "proceso", 0.6), op(enProd.items[1], "impresora", "cola"));
  d.ordenes.forEach(o => { const it = enProd.items.find(i => i.id === o.item); o.desc = [it.medida === "m2" ? `${it.ancho} × ${it.alto} m` : it.cant + " " + medidaTxt(it.medida, it.cant), ...Object.values(it.opciones || {})].join(" · "); });

  /* entradas de material de la semana */
  d.movimientos.push(
    { id: uid(), t: hace(5), material: "lona", cant: 50, motivo: "Compra a Distribuidora Gráfica", costo: 900, pago: "transferencia", quien: "Dueño" },
    { id: uid(), t: hace(2), material: "agenda_b", cant: 100, motivo: "Compra de agendas 2027", costo: 4200, pago: "transferencia", quien: "Dueño" },
    { id: uid(), t: hace(0, 3), material: "vinil_corte", cant: 10, motivo: "Compra de vinil", costo: 300, pago: "efectivo", quien: "Dueño" }
  );

  /* cotizaciones */
  const cot = (n, dias, cliente, items, estado) => ({ id: uid(), codigo: "COT-" + n, creado: hace(dias), cliente, items, estado, vigencia: d.config.cot_vigencia, notas: "", pedido: "" });
  d.cotizaciones = [
    cot(203, 1, { nombre: "Gerardo Ruiz", tel: "47778899", empresa: "Gimnasio Titán" }, [linea("rollup", { cant: 3 }), linea("manta", { ancho: 6, alto: 1.2, cant: 1, opciones: { acabado: "Ojetes cada 50 cm" }, disenar: true })], "enviada"),
    cot(202, 6, { nombre: "Andrea Gómez", tel: "57001122", empresa: "Colegio San Antonio" }, [linea("agenda", { cant: 40, opciones: { color: "Café" } })], "aceptada"),
    cot(201, 24, { nombre: "Marisol Ochoa", tel: "33221100", empresa: "Clínica Dental Sonríe" }, [linea("vinil", { ancho: 2.4, alto: 0.8, cant: 1 }), linea("tarjetas", { cant: 1 })], "enviada")
  ];
  d.cotizaciones[1].pedido = "EC-1046";

  /* un cobro de hoy en efectivo para que la caja tenga movimiento */
  const nuevo = d.pedidos.find(p => p.codigo === "EC-1048");
  nuevo.pagos.push({ id: uid(), t: ahora - HORA, monto: 432, metodo: "efectivo", nota: "Anticipo 50 %" });

  /* portafolio (lo administra la agencia desde el panel) y reseñas */
  d.trabajos = MARCA.trabajos.map((t, i) => ({ id: uid(), img: t.img, titulo: t.titulo, texto: t.texto, planeta: t.planeta, ancha: !!t.ancha, visible: true, t: hace(30 - i * 5) }));
  d.trabajos.push(
    { id: uid(), img: mockPrueba("manta", "TALLER RODAS", "Enderezado y pintura"), titulo: "Manta para taller", texto: "3 × 1 m con ojetes, lista para la fachada.", planeta: "mantas", visible: true, t: hace(3) },
    { id: uid(), img: mockPrueba("calco", "Mi Pueblo", "Dulces típicos"), titulo: "Calcomanías troqueladas", texto: "Para frascos de dulces típicos.", planeta: "adhesivos", visible: true, t: hace(2) }
  );
  /* reseñas DE EJEMPLO para la demo: con Supabase solo se muestran las reales que dejan los clientes */
  const R = (nombre, empresa, texto, estrellas, dias, visible = true) => ({ id: uid(), nombre, empresa, texto, estrellas, t: hace(dias), visible, ejemplo: true });
  d.resenas = [
    R("Andrea Gómez", "Colegio San Antonio", "Las agendas quedaron igualitas a la prueba. Los maestros felices con su nombre grabado.", 5, 340),
    R("Hotel Reu Plaza", "Hotel Reu Plaza", "El sandblast de la recepción quedó elegante y no perdimos nada de luz.", 5, 30),
    R("Óscar Pineda", "Agroservicio El Surco", "Rápidos con las tarjetas y el diseño salió a la primera.", 4, 200),
    R("Lucía Barrios", "Café La Ceiba", "Me mandaron la prueba por WhatsApp y aprobé desde el celular. Así da gusto.", 5, 95),
    R("Carlos Rodas", "Taller Rodas", "Buen trabajo, solo tardó un día más de lo dicho.", 4, 1, false)
  ];

  /* cierre de caja de ayer */
  d.cierres = [{ id: uid(), t: dia0() - 2 * HORA, esperado: 485, contado: 480, diferencia: -5, nota: "Faltaron Q5 de cambio", quien: "Dueño" }];
  return d;
};
