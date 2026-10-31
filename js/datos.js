"use strict";
/* ============================================================
   Datos locales (localStorage) con la forma de las tablas que
   tendrá Supabase: productos, pedidos y config.
   Para pasar a Supabase solo cambia este archivo: el resto de
   pantallas usa DB.* y nunca toca localStorage directo.
   ============================================================ */

/* Los 7 planetas = las líneas de servicio de la agencia. */
const PLANETAS = [
  { id: "diseno", nombre: "Diseño gráfico", corto: "Diseño", icono: "pen", desc: "Logos, artes para redes, flyers y la imagen completa de tu negocio. Te mandamos la prueba antes de imprimir." },
  { id: "mantas", nombre: "Mantas", corto: "Mantas", icono: "flag", desc: "Mantas vinílicas impresas a gran formato, con ojetes o bolsillos para colgar. Para fachadas, eventos y ferias." },
  { id: "adhesivos", nombre: "Adhesivos", corto: "Adhesivos", icono: "sticker", desc: "Calcomanías y etiquetas para productos, en vinil brillante, mate o transparente. Las troquelamos a la forma de tu logo." },
  { id: "corte", nombre: "Corte digital", corto: "Corte", icono: "scissors", desc: "Letras y logos cortados en vinil para vitrinas, carros y paredes. Sin fondo, solo la forma." },
  { id: "grabado", nombre: "Grabado láser", corto: "Láser", icono: "zap", desc: "Agendas, termos, llaveros y placas grabados con láser. Con tu nombre o tu logo, y precio especial por mayor." },
  { id: "impresion", nombre: "Impresión láser", corto: "Impresión", icono: "printer", desc: "Tarjetas de presentación, hojas a color, volantes y papelería de oficina, listos el mismo día." },
  { id: "sandblast", nombre: "Sandblast", corto: "Sandblast", icono: "glass", desc: "Vinil esmerilado para vidrios de oficina: da privacidad, deja pasar la luz y lleva tu logo calado." }
];

const ESTADOS = {
  recibido: { t: "Recibido", c: "neutro", cliente: "Recibimos tu pedido", paso: 0 },
  diseno: { t: "En diseño", c: "activo", cliente: "Estamos diseñando", paso: 1 },
  prueba: { t: "Prueba por aprobar", c: "aviso", cliente: "Tu prueba está lista", paso: 2 },
  produccion: { t: "En producción", c: "activo", cliente: "En producción", paso: 3 },
  listo: { t: "Listo para recoger", c: "ok", cliente: "¡Listo para recoger!", paso: 4 },
  entregado: { t: "Entregado", c: "listo", cliente: "Entregado", paso: 5 },
  cancelado: { t: "Cancelado", c: "apagado", cliente: "Cancelado", paso: -1 }
};
const ORDEN_ESTADOS = ["recibido", "diseno", "prueba", "produccion", "listo", "entregado"];
const METODOS = { efectivo: "Efectivo", transferencia: "Transferencia", deposito: "Depósito", tarjeta: "Tarjeta" };

/* Precios DE EJEMPLO (se confirman con la agencia). Medida: m2 = por metro cuadrado, pieza, ciento, millar, hoja, servicio. */
function productosBase() {
  const P = (id, planeta, nombre, medida, precio, o = {}) => Object.assign({ id, planeta, nombre, medida, precio, minimo: 1, tramos: [], opciones: [], arte: true, activo: true, desc: "" }, o);
  const MAYOREO = [{ desde: 12, pct: 5 }, { desde: 25, pct: 10 }, { desde: 50, pct: 15 }, { desde: 100, pct: 20 }];
  return [
    P("logo", "diseno", "Diseño de logotipo", "servicio", 650, { arte: false, desc: "3 propuestas, 2 rondas de cambios y archivos finales." }),
    P("arte", "diseno", "Arte para manta, flyer o post", "servicio", 150, { arte: false, desc: "Una pieza lista para imprimir o publicar." }),
    P("redes", "diseno", "Paquete de 8 posts para redes", "servicio", 450, { arte: false, desc: "Plantilla de marca y 8 artes del mes." }),

    P("manta", "mantas", "Manta vinílica impresa", "m2", 65, { minimo: 1, desc: "Impresión a todo color, lista para exterior.",
      opciones: [{ id: "acabado", nombre: "Acabado", valores: [{ t: "Solo impresión", extra: 0 }, { t: "Ojetes cada 50 cm", extra: 10, modo: "m2" }, { t: "Bolsillos para tubo", extra: 25, modo: "fijo" }] }] }),
    P("rollup", "mantas", "Roll-up 85 × 200 cm con estructura", "pieza", 450, { desc: "Banner portátil con su maleta.", tramos: [{ desde: 5, pct: 8 }] }),

    P("calco", "adhesivos", "Calcomanías", "ciento", 120, { minimo: 1, desc: "Precio por ciento de calcomanías.",
      tramos: [{ desde: 5, pct: 10 }, { desde: 10, pct: 18 }],
      opciones: [
        { id: "medida", nombre: "Medida", valores: [{ t: "5 × 5 cm", extra: 0 }, { t: "7 × 7 cm", extra: 40 }, { t: "10 × 10 cm", extra: 95 }] },
        { id: "material", nombre: "Material", valores: [{ t: "Vinil brillante", extra: 0 }, { t: "Vinil mate", extra: 10, modo: "pct" }, { t: "Transparente", extra: 15, modo: "pct" }, { t: "Troquelado a la forma", extra: 20, modo: "pct" }] }
      ] }),
    P("etiquetas", "adhesivos", "Etiquetas en rollo para producto", "millar", 380, { desc: "Para frascos, bolsas y cajas." }),

    P("vinil", "corte", "Rotulación en vinil de corte", "m2", 85, { desc: "Letras y logos para vitrinas, paredes y carros.",
      opciones: [{ id: "tipo", nombre: "Vinil", valores: [{ t: "Color sólido", extra: 0 }, { t: "Reflectivo", extra: 40, modo: "pct" }, { t: "Dorado o plateado", extra: 25, modo: "pct" }] }] }),

    P("agenda", "grabado", "Agenda 2027 grabada con láser", "pieza", 95, { minimo: 1, tramos: MAYOREO, desc: "Agenda ejecutiva con tu nombre o logo grabado.",
      opciones: [{ id: "color", nombre: "Color", valores: [{ t: "Café", extra: 0 }, { t: "Azul", extra: 0 }, { t: "Gris", extra: 0 }, { t: "Miel", extra: 0 }] }] }),
    P("termo", "grabado", "Termo de acero grabado", "pieza", 85, { tramos: MAYOREO }),
    P("llavero", "grabado", "Llavero de madera grabado", "pieza", 15, { tramos: MAYOREO }),
    P("placa", "grabado", "Placa de reconocimiento", "pieza", 175, { tramos: [{ desde: 5, pct: 5 }, { desde: 10, pct: 10 }] }),

    P("tarjetas", "impresion", "Tarjetas de presentación", "millar", 225, { desc: "Full color, tiro y retiro.",
      opciones: [{ id: "acabado", nombre: "Acabado", valores: [{ t: "Mate", extra: 0 }, { t: "Brillante", extra: 0 }, { t: "Plastificado mate", extra: 60, modo: "fijo" }] }] }),
    P("color", "impresion", "Impresión a color tamaño carta", "hoja", 2.5, { tramos: [{ desde: 100, pct: 10 }, { desde: 500, pct: 20 }] }),
    P("volantes", "impresion", "Volantes media carta", "millar", 350),

    P("esmerilado", "sandblast", "Sandblast con vinil de corte", "m2", 120, { desc: "Vinil esmerilado instalado en vidrio.",
      opciones: [{ id: "logo", nombre: "Detalle", valores: [{ t: "Franja lisa", extra: 0 }, { t: "Con logo calado", extra: 75, modo: "fijo" }] }] })
  ];
}
const MEDIDAS = { m2: ["m²", "m²"], pieza: ["pieza", "piezas"], ciento: ["ciento", "cientos"], millar: ["millar", "millares"], hoja: ["hoja", "hojas"], servicio: ["servicio", "servicios"] };
const medidaTxt = (m, n) => (MEDIDAS[m] || [m, m])[n === 1 ? 0 : 1];

/* ---------- cálculo de una línea del pedido ---------- */
function calcularLinea(prod, l) {
  const area = prod.medida === "m2" ? r2(Math.max(0, (+l.ancho || 0)) * Math.max(0, (+l.alto || 0))) : 0;
  const cant = Math.max(1, Math.round(+l.cant || 1));
  const base = prod.medida === "m2" ? Math.max(area, prod.minimo || 0) * cant : cant;
  let unit = prod.precio, fijo = 0, pct = 0, porM2 = 0;
  (prod.opciones || []).forEach(o => {
    const v = o.valores.find(x => x.t === (l.opciones || {})[o.id]) || o.valores[0];
    if (!v || !v.extra) return;
    if (v.modo === "fijo") fijo += v.extra;
    else if (v.modo === "pct") pct += v.extra;
    else if (v.modo === "m2") porM2 += v.extra;
    else unit += v.extra;
  });
  unit = r2((unit + porM2) * (1 + pct / 100));
  const tramo = [...(prod.tramos || [])].sort((a, b) => b.desde - a.desde).find(t => (prod.medida === "m2" ? base : cant) >= t.desde);
  const bruto = r2(unit * base + fijo * cant);
  const desc = tramo ? r2(bruto * tramo.pct / 100) : 0;
  const disenio = l.disenar && prod.arte ? (DB.listo() ? DB.config().precio_diseno : 100) : 0;
  return { area, cant, base, unit, bruto, desc, tramo, disenio, subtotal: r2(bruto - desc + disenio) };
}
function siguienteTramo(prod, cant) {
  return [...(prod.tramos || [])].sort((a, b) => a.desde - b.desde).find(t => cant < t.desde) || null;
}
const totalPedido = p => r2(sum(p.items, i => i.subtotal));
const pagadoPedido = p => r2(sum(p.pagos || [], x => x.monto));
const saldoPedido = p => r2(totalPedido(p) - pagadoPedido(p));

/* ---------- pruebas de diseño de ejemplo (SVG) ---------- */
function mockPrueba(tipo, texto, sub) {
  const A = MARCA.colores.acento, t = esc(texto), s = esc(sub || "");
  const svg = tipo === "manta"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340"><rect width="800" height="340" fill="#111"/><rect x="0" y="0" width="800" height="340" fill="${A}"/><rect x="0" y="230" width="800" height="110" fill="#111"/><text x="40" y="150" font-family="Arial Black,Arial" font-weight="900" font-size="88" fill="#111">${t}</text><text x="40" y="200" font-family="Arial" font-size="30" fill="#111">${s}</text><text x="40" y="298" font-family="Arial" font-weight="700" font-size="34" fill="${A}">Tel. 7771-0000 · Retalhuleu</text>${[30, 400, 770].map(x => `<circle cx="${x}" cy="22" r="8" fill="#ddd" stroke="#888"/>`).join("")}</svg>`
    : tipo === "calco"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#eee"/><circle cx="300" cy="300" r="230" fill="#fff" stroke="#bbb" stroke-dasharray="8 8"/><circle cx="300" cy="300" r="205" fill="#1d3a2f"/><text x="300" y="285" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="64" fill="#f3e6c8">${t}</text><text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="28" letter-spacing="6" fill="#f3e6c8">${s.toUpperCase()}</text></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760"><rect width="600" height="760" fill="#e9e4da"/><rect x="70" y="40" width="460" height="680" rx="18" fill="#6b3f24"/><rect x="88" y="58" width="424" height="644" rx="12" fill="none" stroke="#a87a55" stroke-width="3" stroke-dasharray="10 8"/><text x="300" y="380" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="40" fill="#2e1a0e">${t}</text><text x="300" y="430" text-anchor="middle" font-family="Arial" font-size="24" letter-spacing="5" fill="#2e1a0e">${s.toUpperCase()}</text><text x="470" y="690" text-anchor="end" font-family="Arial" font-size="40" font-weight="700" fill="#4e2c17">2027</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ---------- datos de ejemplo ---------- */
function semilla() {
  const ahora = Date.now();
  const hace = (d, h = 0) => ahora - d * DIA - h * HORA;
  const prods = productosBase();
  const pr = id => prods.find(p => p.id === id);
  const linea = (id, l) => { const p = pr(id); const c = calcularLinea(p, l); return Object.assign({ id: uid(), producto_id: id, nombre: p.nombre, medida: p.medida, opciones: {}, nota: "" }, l, { cant: c.cant, area: c.area, unit: c.unit, desc: c.desc, disenio: c.disenio, subtotal: c.subtotal }); };
  const ped = (n, estado, dias, cliente, items, o = {}) => {
    const creado = hace(dias, 3);
    const camino = ORDEN_ESTADOS.slice(0, ORDEN_ESTADOS.indexOf(estado) + 1);
    const historial = camino.map((e, i) => ({ t: creado + i * Math.max(1, dias * DIA / (camino.length + 1)) * (dias ? 1 : 0.02), estado: e, quien: i ? "Equipo" : "Cliente" }));
    return Object.assign({
      id: uid(), codigo: "EC-" + n, creado, origen: "web", cliente, items, notas: "", entrega: hace(-Math.max(1, 3 - dias)), estado, historial, pruebas: [], pagos: []
    }, o);
  };
  const pedidos = [
    ped(1048, "recibido", 0.05, { nombre: "Lucía Barrios", tel: "55123344", empresa: "Café La Ceiba" }, [linea("calco", { cant: 5, opciones: { medida: "7 × 7 cm", material: "Troquelado a la forma" } })], { notas: "Logo redondo, fondo verde." }),
    ped(1047, "diseno", 1, { nombre: "Ing. Marco Pérez", tel: "40112233", empresa: "Ferretería El Volcán" }, [linea("manta", { ancho: 3, alto: 1, cant: 1, opciones: { acabado: "Ojetes cada 50 cm" }, disenar: true })],
      { pagos: [{ id: uid(), t: hace(1), monto: 150, metodo: "transferencia", nota: "Anticipo" }] }),
    ped(1046, "prueba", 2, { nombre: "Andrea Gómez", tel: "57001122", empresa: "Colegio San Antonio" }, [linea("agenda", { cant: 40, opciones: { color: "Café" }, nota: "Logo del colegio y nombre de cada maestro" })],
      { pruebas: [{ id: uid(), t: hace(0, 2), img: mockPrueba("agenda", "Colegio San Antonio", "Ciclo 2027"), respuesta: null, comentario: "" }],
        pagos: [{ id: uid(), t: hace(2), monto: 1600, metodo: "deposito", nota: "Anticipo 50 %" }] }),
    ped(1045, "produccion", 3, { nombre: "Carlos Rodas", tel: "31998877", empresa: "Taller Rodas" }, [linea("vinil", { ancho: 2, alto: 0.6, cant: 1, opciones: { tipo: "Reflectivo" } }), linea("tarjetas", { cant: 1, opciones: { acabado: "Plastificado mate" } })],
      { pruebas: [{ id: uid(), t: hace(2), img: mockPrueba("manta", "TALLER RODAS", "Enderezado y pintura"), respuesta: "aprobada", comentario: "¡Así quedó perfecto!", rt: hace(2, -3) }],
        pagos: [{ id: uid(), t: hace(3), monto: 200, metodo: "efectivo", nota: "Anticipo" }] }),
    ped(1044, "listo", 4, { nombre: "Sofía Chávez", tel: "48776655", empresa: "" }, [linea("termo", { cant: 12, nota: "Nombres distintos, lista por WhatsApp" })],
      { pagos: [{ id: uid(), t: hace(4), monto: 500, metodo: "transferencia", nota: "Anticipo" }] }),
    ped(1043, "entregado", 6, { nombre: "Hotel Reu Plaza", tel: "77710000", empresa: "Hotel Reu Plaza" }, [linea("esmerilado", { ancho: 4, alto: 1.2, cant: 1, opciones: { logo: "Con logo calado" } })],
      { pagos: [{ id: uid(), t: hace(6), monto: 400, metodo: "transferencia", nota: "Anticipo" }, { id: uid(), t: hace(1), monto: 251, metodo: "efectivo", nota: "Saldo" }] }),
    ped(1042, "prueba", 3, { nombre: "Dulcería Mi Pueblo", tel: "51234567", empresa: "Dulcería Mi Pueblo" }, [linea("calco", { cant: 10, opciones: { medida: "5 × 5 cm", material: "Vinil brillante" } })],
      { pruebas: [{ id: uid(), t: hace(2), img: mockPrueba("calco", "Mi Pueblo", "Dulces típicos"), respuesta: "cambios", comentario: "¿Se puede el fondo color vino en vez de verde?", rt: hace(1) }],
        pagos: [{ id: uid(), t: hace(3), monto: 500, metodo: "deposito", nota: "Anticipo" }] })
  ];
  return {
    version: 6,
    productos: prods,
    pedidos,
    config: {
      pin: "0000", anticipo_pct: 50, precio_diseno: 100, consecutivo: 1049,
      banco: "Banrural · Monetaria 0000-00000-0 · a nombre de " + MARCA.nombre,
      horario: "Lunes a viernes 8:00 a 18:00 · Sábado 8:00 a 13:00",
      msj: {
        recibido: "Hola {nombre}, recibimos tu pedido {codigo} en {agencia}. Total {total}. Síguelo aquí: {link}",
        diseno: "Hola {nombre}, ya estamos diseñando tu pedido {codigo}. Te mandamos la prueba muy pronto: {link}",
        prueba: "Hola {nombre}, tu prueba del pedido {codigo} está lista. Apruébala o pide cambios aquí: {link}",
        produccion: "Hola {nombre}, tu pedido {codigo} ya está en producción. Te avisamos cuando esté listo: {link}",
        listo: "¡Hola {nombre}! Tu pedido {codigo} está listo para recoger. Saldo pendiente: {saldo}. {link}",
        entregado: "Gracias por confiar en {agencia}, {nombre}. ¿Nos dejas tu opinión? {link}"
      }
    }
  };
}

/* ---------- acceso a los datos ---------- */
const DB = (() => {
  const CLAVE = MARCA.clave + ".datos";
  let d = null;
  function cargar() {
    try { d = JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch (e) { d = null; }
    if (!d || d.version !== 6) { d = null; d = semilla(); guardar(); }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); return true; }
    catch (e) { aviso("El navegador ya no tiene espacio para más imágenes. Borra pruebas viejas o usa imágenes más livianas.", "malo", 6000); return false; }
  }
  return {
    CLAVE, cargar, guardar,
    listo: () => !!d,
    reiniciar() { d = null; d = semilla(); guardar(); },
    config: () => d.config,
    productos: () => d.productos,
    producto: id => d.productos.find(p => p.id === id),
    pedidos: () => [...d.pedidos].sort((a, b) => b.creado - a.creado),
    pedido: cod => d.pedidos.find(p => p.codigo.toUpperCase() === String(cod || "").toUpperCase().trim()),
    crearPedido(datos) {
      const codigo = "EC-" + d.config.consecutivo++;
      const p = Object.assign({ id: uid(), codigo, creado: Date.now(), origen: "web", notas: "", pruebas: [], pagos: [], estado: "recibido",
        historial: [{ t: Date.now(), estado: "recibido", quien: datos.origen === "mostrador" ? "Equipo" : "Cliente" }] }, datos);
      d.pedidos.push(p); guardar(); return p;
    },
    cambiarEstado(p, estado, quien = "Equipo", nota = "") {
      p.estado = estado; p.historial.push({ t: Date.now(), estado, quien, nota });
      if (estado === "produccion" && typeof crearOrdenes === "function") crearOrdenes(p);
      guardar();
    },
    /* tablas del taller: ordenes, materiales, movimientos, cotizaciones, cierres */
    t: nombre => (d[nombre] = d[nombre] || []),
    guardarPedido() { return guardar(); }
  };
})();

function mensaje(clave, p) {
  const plantilla = DB.config().msj[clave] || "";
  return plantilla.replace(/\{(\w+)\}/g, (_, k) => ({
    nombre: (p.cliente.nombre || "").split(" ")[0], codigo: p.codigo, agencia: MARCA.nombre,
    total: Q(totalPedido(p)), saldo: Q(saldoPedido(p)), link: urlBase() + "#/pedido/" + p.codigo
  }[k] ?? ""));
}
