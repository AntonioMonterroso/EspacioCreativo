"use strict";
/* ============================================================
   Animaciones de imprenta y de viaje:
   - títulos CMYK que se registran, fotos que salen impresas, plotter
   - el cohete cruza entre pantallas y viaja a cada planeta; órbita 3D
   - botones magnéticos, sello al presionar, cursor de mira de registro
   - precio que rueda, producto que vuela al carrito, ruta del pedido
   Todo se apaga con «reducir movimiento».
   ============================================================ */
const fino = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const curva = "cubic-bezier(0.65, 0, 0.35, 1)";

/* ---------- imprenta: capas CMYK que llegan desfasadas y se alinean ---------- */
function prepararCMYK(raiz) {
  $$(".titulo-xl, .seguir-cabeza h1", raiz).forEach(el => {
    if (el.dataset.cmyk || el.closest(".grabalo")) return;
    el.dataset.cmyk = "1";
    const html = el.innerHTML;
    el.classList.add("cmyk");
    el.innerHTML = `<span class="cmyk-base">${html}</span>` + ["c", "m", "y"].map(k => `<span class="cmyk-capa cmyk-${k}" aria-hidden="true">${html}</span>`).join("");
  });
}
function observarImprenta(raiz) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, clase = el.classList.contains("cmyk") ? "imprime" : el.classList.contains("plotter") ? "corta" : "imprimiendo";
    io.unobserve(el);
    /* si el cohete todavía está cruzando la pantalla, se espera a que salga */
    setTimeout(() => el.classList.add(clase), document.body.classList.contains("en-viaje") ? 420 : 0);
  }), { rootMargin: "0px 0px -15% 0px" });
  $$(".cmyk, .mision-foto, .plotter", raiz).forEach(el => io.observe(el));
  return () => io.disconnect();
}

/* ---------- viaje entre pantallas ---------- */
function viajeEntrePantallas(pintarNueva) {
  const capa = document.createElement("div");
  capa.className = "viaje"; capa.setAttribute("aria-hidden", "true");
  capa.innerHTML = `<div class="viaje-panel"><img src="${MARCA.letras}" alt="" class="viaje-letras"></div><div class="viaje-cohete">${simbolo({ clase: "viaje-sim", cohete: true, fuego: true })}</div>`;
  document.body.appendChild(capa);
  document.body.classList.add("en-viaje");
  const panel = $(".viaje-panel", capa), cohete = $(".viaje-cohete", capa);
  const ida = 420, vuelta = 460;
  cohete.animate([{ transform: "translate(-20vw, 60vh) rotate(62deg)" }, { transform: "translate(50vw, 40vh) rotate(62deg)", offset: 0.48 }, { transform: "translate(120vw, 18vh) rotate(62deg)" }], { duration: ida + vuelta, easing: curva, fill: "forwards" });
  panel.animate([{ transform: "translateX(-135%) skewX(-14deg)" }, { transform: "translateX(0) skewX(-14deg)" }], { duration: ida, easing: curva, fill: "forwards" }).onfinish = () => {
    pintarNueva();
    panel.animate([{ transform: "translateX(0) skewX(-14deg)" }, { transform: "translateX(135%) skewX(-14deg)" }], { duration: vuelta, easing: curva, fill: "forwards" }).onfinish = () => { capa.remove(); document.body.classList.remove("en-viaje"); };
  };
}

/* ---------- el cohete viaja del sol al planeta ---------- */
function viajeAPlaneta(boton, alLlegar) {
  const mapa = $("#orbita-mapa"), sol = $(".orbita-sol", mapa), bola = $(".planeta-bola", boton);
  if (!mapa || !sol || !bola || reducido()) { alLlegar(); return; }
  const m = mapa.getBoundingClientRect(), a = sol.getBoundingClientRect(), b = bola.getBoundingClientRect();
  const x0 = a.left + a.width / 2 - m.left, y0 = a.top + a.height / 2 - m.top, x1 = b.left + b.width / 2 - m.left, y1 = b.top + b.height / 2 - m.top;
  const dx = x1 - x0, dy = y1 - y0, largo = Math.hypot(dx, dy) || 1;
  const mx = (x0 + x1) / 2 - dy / largo * 50, my = (y0 + y1) / 2 + dx / largo * 50;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  const v = document.createElement("div");
  v.className = "viajero"; v.innerHTML = simbolo({ clase: "viajero-sim" });
  mapa.appendChild(v);
  const pt = t => { const u = 1 - t; return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1]; };
  const marcos = Array.from({ length: 9 }, (_, i) => { const [x, y] = pt(i / 8); return { transform: `translate(${x}px, ${y}px) rotate(${ang}deg) scale(${i === 8 ? 0.6 : 1})` }; });
  v.animate(marcos, { duration: 620, easing: curva, fill: "forwards" }).onfinish = () => {
    v.remove(); boton.classList.remove("llega"); void boton.offsetWidth; boton.classList.add("llega"); alLlegar();
  };
  for (let i = 1; i < 8; i++) setTimeout(() => {
    const [x, y] = pt(i / 8), p = document.createElement("span");
    p.className = "rastro"; p.style.transform = `translate(${x}px, ${y}px)`; mapa.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }, i * 70);
}

/* ---------- órbita que se inclina con el mouse ---------- */
function orbita3D() {
  const sec = $("#orbita"), mapa = $("#orbita-mapa");
  if (!sec || !mapa || !fino() || reducido()) return () => {};
  const mover = ev => {
    const r = mapa.getBoundingClientRect();
    const x = clamp((ev.clientX - (r.left + r.width / 2)) / r.width, -0.6, 0.6), y = clamp((ev.clientY - (r.top + r.height / 2)) / r.height, -0.6, 0.6);
    mapa.style.setProperty("--ry", (x * 22).toFixed(2) + "deg"); mapa.style.setProperty("--rx", (32 - y * 18).toFixed(2) + "deg");
  };
  const salir = () => { mapa.style.setProperty("--ry", "0deg"); mapa.style.setProperty("--rx", "0deg"); };
  sec.addEventListener("pointermove", mover); sec.addEventListener("pointerleave", salir);
  return () => { sec.removeEventListener("pointermove", mover); sec.removeEventListener("pointerleave", salir); };
}

/* ---------- micro-interacciones globales (se instalan una vez) ---------- */
const MAGNETICOS = ".btn-acento, .btn-linea, .btn-negro, .contacto-wa, .ventana-x";
function instalarMicro() {
  if (instalarMicro.listo || reducido()) return;
  instalarMicro.listo = true;
  let iman = null;
  const soltar = () => { if (iman) { iman.style.translate = ""; iman.classList.remove("iman"); iman = null; } };
  document.addEventListener("pointermove", ev => {
    if (ev.pointerType !== "mouse") return;
    const el = ev.target.closest(MAGNETICOS);
    if (el !== iman) { soltar(); iman = el; if (el) el.classList.add("iman"); }
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.translate = `${((ev.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((ev.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
  }, { passive: true });
  document.addEventListener("pointerleave", soltar);

  /* sello de tinta donde se presiona */
  document.addEventListener("pointerdown", ev => {
    const el = ev.target.closest(".btn, .chip, .cot-prod, .cot-planeta, .planeta-bola, .orbita-tab, .tarjeta-ped, .panel-tab");
    if (!el) return;
    const r = el.getBoundingClientRect(), s = document.createElement("span");
    s.className = "sello"; s.setAttribute("aria-hidden", "true");
    s.style.left = (ev.clientX - r.left) + "px"; s.style.top = (ev.clientY - r.top) + "px";
    s.style.setProperty("--giro", Math.round(Math.random() * 60 - 30) + "deg");
    el.appendChild(s); setTimeout(() => s.remove(), 650);
  }, { passive: true });

  /* cursor: mira de registro de imprenta (solo mouse, solo páginas públicas) */
  if (!fino()) return;
  const mira = document.createElement("div");
  mira.className = "mira"; mira.setAttribute("aria-hidden", "true");
  mira.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M20 1v8M20 31v8M1 20h8M31 20h8" stroke="currentColor" stroke-width="1.5"/></svg>`;
  document.body.appendChild(mira);
  let x = -100, y = -100, mx = -100, my = -100, vivo = false;
  const cuadro = () => {
    mx += (x - mx) * 0.32; my += (y - my) * 0.32;
    mira.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)`;
    if (Math.abs(x - mx) + Math.abs(y - my) > 0.3) requestAnimationFrame(cuadro); else vivo = false;
  };
  document.addEventListener("pointermove", ev => {
    if (ev.pointerType !== "mouse") return;
    x = ev.clientX; y = ev.clientY; mira.classList.add("ver");
    mira.classList.toggle("sobre", !!ev.target.closest("a, button, label, [data-a], .planeta"));
    mira.classList.toggle("texto", !!ev.target.closest("input:not([type=radio]):not([type=checkbox]), textarea, select"));
    if (!vivo) { vivo = true; requestAnimationFrame(cuadro); }
  }, { passive: true });
  document.addEventListener("pointerdown", () => mira.classList.add("presiona"));
  document.addEventListener("pointerup", () => mira.classList.remove("presiona"));
  document.addEventListener("pointerleave", () => mira.classList.remove("ver"));
}

/* ---------- portal: números que ruedan como contador ---------- */
const ODO = {};
function animarOdometros(raiz = document) {
  $$("[data-odo]", raiz).forEach(el => {
    const nuevo = el.textContent.trim(), clave = el.dataset.odo, viejo = ODO[clave] ?? nuevo;
    ODO[clave] = nuevo;
    if (reducido() || viejo === nuevo) return;
    const n = Math.max(nuevo.length, viejo.length), vj = viejo.padStart(n, " "), nv = nuevo.padStart(n, " ");
    el.setAttribute("aria-label", nuevo);
    el.innerHTML = [...nv].map((ch, i) => /\d/.test(ch)
      ? `<span class="odo-col" aria-hidden="true"><span class="odo-tira" style="--d:${/\d/.test(vj[i]) ? vj[i] : 0};--i:${n - i}">${"0123456789".split("").map(d => `<span>${d}</span>`).join("")}</span></span>`
      : `<span aria-hidden="true">${ch === " " ? "" : esc(ch)}</span>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => $$(".odo-tira", el).forEach((t, k) => t.style.setProperty("--d", nv.replace(/\D/g, "")[k]))));
  });
}

/* ---------- portal: el producto vuela al carrito ---------- */
function volarAlCarro(desde, icono) {
  const caja = $("#cot-carro .carro-caja");
  if (!desde || !caja || reducido()) return;
  const a = desde.getBoundingClientRect(), b = caja.getBoundingClientRect();
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const enPantalla = b.top < innerHeight - 40;
  const x1 = enPantalla ? b.left + b.width / 2 : x0, y1 = enPantalla ? b.top + 60 : innerHeight + 40;
  const v = document.createElement("div");
  v.className = "volador"; v.innerHTML = ico(icono || "box");
  document.body.appendChild(v);
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 140;
  v.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(0.95)`, opacity: 0 },
    { transform: `translate(${mx}px, ${my}px) scale(1.15) rotate(-12deg)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${x1}px, ${y1}px) scale(0.6) rotate(8deg)`, opacity: 1 }
  ], { duration: 720, easing: curva, fill: "forwards" }).onfinish = () => {
    v.remove();
    caja.classList.remove("recibe"); void caja.offsetWidth; caja.classList.add("recibe");
  };
}

/* ---------- seguimiento: el cohete recorre la ruta hasta el paso actual ---------- */
function recorrerRuta() {
  const ruta = $(".ruta"), actual = ruta && $(".ruta-paso.actual", ruta);
  if (!actual || reducido()) return;
  const pasos = $$(".ruta-paso", ruta), k = pasos.indexOf(actual);
  const p0 = $(".ruta-punto", pasos[0]).getBoundingClientRect(), p1 = $(".ruta-punto", actual).getBoundingClientRect(), r = ruta.getBoundingClientRect();
  const dur = 320 + k * 260;
  if (!k) return;
  pasos.forEach((p, i) => { if (i < k) p.style.setProperty("--retraso", Math.round(dur * (i + 1) / (k + 1)) + "ms"); });
  ruta.classList.add("recorre");
  const v = document.createElement("div");
  v.className = "ruta-viajero"; v.setAttribute("aria-hidden", "true"); v.innerHTML = simbolo({ clase: "viajero-sim" });
  ruta.appendChild(v);
  const pos = q => `translate(${q.left + q.width / 2 - r.left}px, ${q.top + q.height / 2 - r.top}px)`;
  const vertical = Math.abs(p1.top - p0.top) > Math.abs(p1.left - p0.left);
  v.animate([{ transform: pos(p0) + ` rotate(${vertical ? 180 : 90}deg)` }, { transform: pos(p1) + ` rotate(${vertical ? 180 : 90}deg)` }], { duration: dur, easing: curva, fill: "forwards" }).onfinish = () => { v.remove(); ruta.classList.add("llego"); };
}

/* ---------- se llama después de pintar cada pantalla ---------- */
let pararImprenta = null;
function trasPintar(vista) {
  if (pararImprenta) { pararImprenta(); pararImprenta = null; }
  document.body.classList.toggle("con-mira", fino() && !reducido() && !["panel", "pin", "taller"].includes(vista));
  document.body.classList.toggle("con-anim", !reducido());
  instalarMicro();
  if (reducido()) return;
  prepararCMYK($("#app"));
  pararImprenta = observarImprenta($("#app"));
  if (vista === "") { const quitar = orbita3D(); const antes = window.limpiarVista; window.limpiarVista = () => { quitar(); antes && antes(); }; }
  if (vista === "pedido") setTimeout(recorrerRuta, 60);
  if (vista === "cotizar") animarOdometros($("#app"));
}
