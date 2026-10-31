"use strict";
/* ============================================================
   Utilidades, iconos, avisos, ventanas apiladas, rutas y acciones.
   Contrato para todas las pantallas:
   - VISTAS[ruta] = p => html        (p = partes de la ruta después del nombre)
   - PROTEGIDA[ruta] = true          (pide PIN)
   - A[nombre](el, ev)  ← clic en [data-a="nombre"]
   - F[nombre](form, datos, ev) ← submit de form[data-f="nombre"]
   - I[nombre](el, ev)  ← input/change en [data-i="nombre"]
   - MODALES[tipo] = m => html; abrir(tipo, datos); cerrar()
   - DESPUES[ruta]() y MODAL_DESPUES[tipo](m) corren tras pintar
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const sum = (a, f = x => x) => a.reduce((s, x) => s + (+f(x) || 0), 0);
const r2 = n => Math.round((+n || 0) * 100) / 100;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const MIN = 60000, HORA = 3600000, DIA = 86400000;
const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- formatos ---------- */
const Q = n => {
  n = r2(n); const dec = Math.abs(n % 1) > 0.001;
  return (n < 0 ? "−" : "") + "Q" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: 2 });
};
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const dia0 = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
function fechaCorta(t) { const d = new Date(t); return d.getDate() + " " + MESES[d.getMonth()].slice(0, 3); }
function fechaLarga(t) { const d = new Date(t); return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; }
function horaTxt(t) { const d = new Date(t); let h = d.getHours(); const m = d.getMinutes(); const ap = h < 12 ? "a. m." : "p. m."; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + ap; }
function cuandoTxt(t) {
  const k = Math.round((dia0(t) - dia0()) / DIA);
  return k === 0 ? "Hoy" : k === 1 ? "Mañana" : k === -1 ? "Ayer" : k > 1 && k < 7 ? cap(DIAS[new Date(t).getDay()]) : fechaCorta(t);
}
function haceTxt(t) {
  const m = Math.round((Date.now() - t) / MIN);
  if (m < 1) return "ahora"; if (m < 60) return "hace " + m + " min";
  const h = Math.round(m / 60); if (h < 24) return "hace " + h + " h";
  const d = Math.round(h / 24); return d === 1 ? "ayer" : "hace " + d + " días";
}
const cap = s => (s = String(s || "")) && s[0].toUpperCase() + s.slice(1);
const iniciales = n => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
const telFmt = t => String(t || "").replace(/\D/g, "").replace(/^502/, "").replace(/^(\d{4})(\d{4})$/, "$1-$2");
const waLink = (tel, texto) => { const d = String(tel).replace(/\D/g, ""); return "https://wa.me/" + (d.length === 8 ? "502" : "") + d + "?text=" + encodeURIComponent(texto); };
const urlBase = () => location.href.split("#")[0];
const plural = (n, a, b) => n + " " + (n === 1 ? a : b);

/* ---------- iconos (Lucide, ISC) ---------- */
const ICONOS = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "chev-r": '<path d="m9 18 6-6-6-6"/>', "chev-l": '<path d="m15 18-6-6 6-6"/>', "chev-d": '<path d="m6 9 6 6 6-6"/>',
  "arrow-r": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', "arrow-l": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-ur": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  ig: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  pen: '<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  sticker: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h.01"/><path d="M16 13h.01"/><path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  cog: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  glass: '<rect width="16" height="20" x="4" y="2" rx="1"/><path d="M4 8h16"/><path d="M4 14h16"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'
};
const ico = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

/* ---------- avisos propios (nunca alert/confirm del navegador) ---------- */
function aviso(texto, tipo = "ok", ms = 3200) {
  const el = document.createElement("div");
  el.className = "aviso aviso-" + tipo; el.setAttribute("role", "status");
  el.innerHTML = `${ico(tipo === "malo" ? "x" : tipo === "info" ? "msg" : "check")}<span>${esc(texto)}</span>`;
  $("#avisos").appendChild(el);
  requestAnimationFrame(() => el.classList.add("ver"));
  setTimeout(() => { el.classList.remove("ver"); setTimeout(() => el.remove(), 260); }, ms);
}

/* ---------- ventanas apiladas: una ventana encima de otra, sin cerrar la primera ---------- */
const MODALES = {}, MODAL_DESPUES = {};
const ui = { pila: [] };
function abrir(tipo, datos = {}) { ui.pila.push(Object.assign({}, datos, { tipo })); renderModal(); }
function cerrar() { ui.pila.pop(); renderModal(); }
function renderModal() {
  const capa = $("#capa");
  if (!ui.pila.length) { capa.innerHTML = ""; capa.classList.remove("abierta"); document.body.classList.remove("sin-scroll"); return; }
  capa.classList.add("abierta"); document.body.classList.add("sin-scroll");
  capa.innerHTML = ui.pila.map((m, i) => `<div class="velo" data-a="${i === ui.pila.length - 1 ? "cerrar" : ""}" style="z-index:${10 + i * 2}"></div>
    <div class="ventana ${m.ancha ? "ancha" : ""}" role="dialog" aria-modal="true" style="z-index:${11 + i * 2}" ${i < ui.pila.length - 1 ? 'aria-hidden="true"' : ""}>
      <button class="ventana-x" data-a="cerrar" aria-label="Cerrar">${ico("x")}</button>
      ${(MODALES[m.tipo] || (() => ""))(m)}
    </div>`).join("");
  const top = ui.pila[ui.pila.length - 1];
  if (MODAL_DESPUES[top.tipo]) MODAL_DESPUES[top.tipo](top);
  const f = $$(".ventana", capa).pop().querySelector("[autofocus], input, select, textarea, button:not(.ventana-x)");
  if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
}
function repintarModal() { if (ui.pila.length) renderModal(); }

/* ---------- rutas ---------- */
const VISTAS = {}, DESPUES = {}, PROTEGIDA = {}, A = {}, F = {}, I = {};
/* sesión del equipo: rol = dueno | diseno | taller (cada uno con su PIN) */
const sesion = { ok: false, rol: "" };
try { sesion.rol = sessionStorage.getItem(MARCA.clave + ".rol") || ""; sesion.ok = !!sesion.rol; } catch (e) { /* sin almacenamiento */ }

function ruta() {
  const h = location.hash.replace(/^#\/?/, "");
  const [camino, q] = h.split("?");
  const partes = camino.split("/").filter(Boolean);
  return { nombre: partes[0] || "", p: partes.slice(1), q: new URLSearchParams(q || "") };
}
function ir(h) { if (location.hash === h) pintar(); else location.hash = h; }

function pintar() {
  const r = ruta(), antes = pintar.vista;
  if (ui.pila.length && antes !== r.nombre) { ui.pila = []; renderModal(); }
  pintar.vista = r.nombre;
  /* Cambio de pantalla: el cohete cruza y la pantalla nueva se pinta debajo (animaciones.js). */
  if (window.viajeEntrePantallas && antes !== undefined && antes !== r.nombre && !reducido()) { viajeEntrePantallas(() => pintarAhora(r)); return; }
  pintarAhora(r);
}
function pintarAhora(r) {
  const vista = VISTAS[r.nombre] ? r.nombre : "";
  const permitido = PROTEGIDA[vista] && (PROTEGIDA[vista] === true || PROTEGIDA[vista].includes(sesion.rol));
  if (PROTEGIDA[vista] && (!sesion.ok || !permitido)) { $("#app").innerHTML = VISTAS.pin(r); document.body.dataset.vista = "pin"; if (window.trasPintar) trasPintar("pin"); return; }
  document.body.dataset.vista = vista || "inicio";
  if (window.limpiarVista) { window.limpiarVista(); window.limpiarVista = null; }
  $("#app").innerHTML = VISTAS[vista](r.p, r.q);
  if (DESPUES[vista]) DESPUES[vista](r.p, r.q);
  if (!r.q.get("ancla")) window.scrollTo(0, 0);
  if (window.trasPintar) trasPintar(vista);
}

/* ---------- PIN del panel ---------- */
VISTAS.pin = () => `
  <main class="pin-pantalla">
    <form class="pin-caja" data-f="pin">
      <img src="${MARCA.logoImg}" alt="${esc(MARCA.nombre)}" class="pin-logo">
      <h1>Entrada del equipo</h1>
      <p>Escribe el PIN del equipo.</p>
      <label class="sr" for="pin">PIN</label>
      <input id="pin" name="pin" inputmode="numeric" autocomplete="off" maxlength="6" class="pin-input" autofocus>
      <button class="btn btn-acento btn-bloque">${ico("lock")} Entrar</button>
      <a href="#/" class="btn btn-fantasma btn-bloque">Volver a la página</a>
      <p class="pin-ayuda">Demo: dueño <b>0000</b> · diseño <b>1111</b> · taller <b>2222</b></p>
    </form>
  </main>`;
F.pin = (f, d) => {
  const pins = DB.config().pins || { dueno: DB.config().pin };
  const rol = Object.keys(pins).find(k => pins[k] === d.pin);
  if (rol) {
    sesion.ok = true; sesion.rol = rol; try { sessionStorage.setItem(MARCA.clave + ".rol", rol); } catch (e) { /* nada */ }
    if (window.alEntrar) alEntrar(rol);
    pintar();
  } else { aviso("Ese PIN no es. Prueba otra vez.", "malo"); f.pin.value = ""; f.pin.focus(); }
};
A.salir = () => { sesion.ok = false; sesion.rol = ""; try { sessionStorage.removeItem(MARCA.clave + ".rol"); } catch (e) { /* nada */ } ir("#/"); };

/* ---------- acciones ---------- */
document.addEventListener("click", ev => {
  const el = ev.target.closest("[data-a]");
  if (!el || !el.dataset.a) return;
  if (el.dataset.a === "cerrar") { ev.preventDefault(); cerrar(); return; }
  const fn = A[el.dataset.a];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});
document.addEventListener("submit", ev => {
  const f = ev.target.closest("form[data-f]"); if (!f) return;
  ev.preventDefault();
  const datos = Object.fromEntries(new FormData(f).entries());
  (F[f.dataset.f] || (() => {}))(f, datos, ev);
});
["input", "change"].forEach(tipo => document.addEventListener(tipo, ev => {
  const el = ev.target.closest("[data-i]"); if (!el) return;
  const fn = I[el.dataset.i]; if (fn) fn(el, ev);
}));
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && ui.pila.length) cerrar(); });
A.ir = el => ir(el.dataset.h);
A.copiar = el => {
  const t = el.dataset.t;
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => aviso("Copiado")).catch(() => aviso("No se pudo copiar; mantén presionado el texto.", "info"));
};

/* ---------- imágenes que suben las personas: se achican antes de guardarlas ---------- */
function leerImagen(archivo, lado = 900, calidad = 0.82) {
  return new Promise((ok, mal) => {
    if (!archivo || !/^image\//.test(archivo.type)) { mal(new Error("tipo")); return; }
    const lector = new FileReader();
    lector.onerror = () => mal(new Error("lectura"));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => mal(new Error("imagen"));
      img.onload = () => {
        const k = Math.min(1, lado / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        const png = /png|svg|gif/.test(archivo.type);
        ok(c.toDataURL(png ? "image/png" : "image/jpeg", calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

function arrancar() {
  DB.cargar();
  window.addEventListener("hashchange", pintar);
  /* Otra pestaña guardó (un cliente pidió, el panel cambió un estado): repintar. */
  window.addEventListener("storage", ev => {
    if (ev.key !== DB.CLAVE) return;
    const antes = DB.pedidos().length;
    DB.cargar();
    const n = DB.pedidos().length;
    const v = ruta().nombre;
    if ((v === "panel" || v === "taller") && sesion.ok) {
      if (n > antes) aviso("Llegó un pedido nuevo: " + DB.pedidos()[0].codigo, "info", 5000);
      if (!ui.pila.length) pintar(); else repintarModal();
    } else if (v === "pedido") pintar();
  });
  pintar();
}
