"use strict";
/* ============================================================
   Capa creativa de la landing:
   - formas tornasol 3D (las de su banner) que giran con el scroll
   - cuenta regresiva 3·2·1 y despegue al abrir (una vez por visita)
   - título que se graba con láser letra por letra
   - materiales reales por sección; la esquina se despega como calcomanía
   - estela de chispas que sigue al mouse y constelaciones en las estrellas
   ============================================================ */

/* tipo: dona | gota · o: { x, y, tam, vel, rot, giro, clase } en unidades CSS */
function tornasol(tipo, o = {}) {
  return `<span class="tornasol tornasol-${tipo} ${o.clase || ""}" aria-hidden="true"
    style="--x:${o.x || "0"};--y:${o.y || "0"};--tam:${o.tam || "160px"};--vel:${o.vel ?? 120};--rot:${o.rot ?? 40};--giro:${o.giro || "0deg"}"><span></span></span>`;
}

/* ---------- puntero compartido (estela + constelaciones) ---------- */
const PUNTERO = { x: -999, y: -999, activo: false };
const finoPuntero = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

function estela() {
  if (reducido()) return () => {};
  const cv = document.createElement("canvas");
  cv.className = "estela-mouse"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const cx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, corriendo = false, ult = null;
  const chispas = [];
  function medir() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function soltar(x, y, n, fuerza) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * fuerza;
      chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.4, vida: 1, tam: 0.8 + Math.random() * 2.2, c: Math.random() < 0.55 ? "245,194,5" : Math.random() < 0.5 ? "255,128,64" : "255,255,255" });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(cuadro); }
  }
  function cuadro() {
    cx.clearRect(0, 0, W, H);
    for (let i = chispas.length - 1; i >= 0; i--) {
      const s = chispas[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.035; s.vx *= 0.97; s.vida -= 0.028;
      if (s.vida <= 0) { chispas.splice(i, 1); continue; }
      cx.fillStyle = `rgba(${s.c},${s.vida.toFixed(2)})`;
      cx.beginPath(); cx.arc(s.x, s.y, s.tam * s.vida, 0, 7); cx.fill();
    }
    if (chispas.length) requestAnimationFrame(cuadro); else { corriendo = false; cx.clearRect(0, 0, W, H); }
  }
  function mover(ev) {
    PUNTERO.x = ev.clientX; PUNTERO.y = ev.clientY; PUNTERO.activo = true;
    if (ev.pointerType !== "mouse") return;
    if (ult) {
      const d = Math.hypot(ev.clientX - ult.x, ev.clientY - ult.y);
      if (d > 4) soltar(ev.clientX, ev.clientY, Math.min(4, Math.ceil(d / 10)), 1.1);
    }
    ult = { x: ev.clientX, y: ev.clientY };
  }
  function tocar(ev) { PUNTERO.x = ev.clientX; PUNTERO.y = ev.clientY; PUNTERO.activo = true; if (ev.pointerType !== "mouse") soltar(ev.clientX, ev.clientY, 18, 3.2); }
  function salir() { PUNTERO.activo = false; ult = null; }
  medir();
  addEventListener("resize", medir);
  addEventListener("pointermove", mover, { passive: true });
  addEventListener("pointerdown", tocar, { passive: true });
  document.addEventListener("pointerleave", salir);
  return () => { cv.remove(); removeEventListener("resize", medir); removeEventListener("pointermove", mover); removeEventListener("pointerdown", tocar); document.removeEventListener("pointerleave", salir); };
}

/* ---------- título grabado con láser ---------- */
function partirLetras(h1) {
  h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
  let i = 0;
  $$(".textura, .punto", h1).forEach(el => {
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = [...el.textContent].map(ch => ch === " " ? " " : `<span class="letra" style="--i:${i++}">${esc(ch)}</span>`).join("");
  });
  return i;
}
function laserTitulo() {
  const h1 = $(".hero-titulo"); if (!h1) return;
  const n = partirLetras(h1);
  if (reducido()) { h1.classList.add("grabado"); return; }
  const caja = h1.parentElement, base = caja.getBoundingClientRect();
  const puntos = $$(".letra", h1).map(l => { const r = l.getBoundingClientRect(); return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height * 0.55 }; });
  const dot = document.createElement("span"); dot.className = "laser-dot"; dot.setAttribute("aria-hidden", "true"); caja.appendChild(dot);
  const paso = 55, dur = n * paso;
  h1.classList.add("quemando");
  dot.animate(puntos.map((p, k) => ({ transform: `translate(${p.x}px, ${p.y}px)`, offset: k / Math.max(1, n - 1) })), { duration: dur, easing: "linear", fill: "forwards" });
  dot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.04 }, { opacity: 1, offset: 0.96 }, { opacity: 0 }], { duration: dur + 120, fill: "forwards" }).onfinish = () => { dot.remove(); h1.classList.add("grabado"); };
}

/* ---------- humo: bocanadas que nacen en la plataforma y se abren a toda la pantalla ---------- */
function bocanadas(n, semilla = 7) {
  const r = azar(semilla);
  return Array.from({ length: n }, (_, i) => {
    const x = 50 + (r() - 0.5) * 34, dx = ((r() - 0.5) * 120).toFixed(1), dy = (-r() * 95 - 5).toFixed(1), s = (5 + r() * 5).toFixed(2);
    return `<span class="bocanada" style="--i:${i};--x:${x.toFixed(1)}%;--dx:${dx}vw;--dy:${dy}vh;--s:${s};--g:${Math.round(r() * 360)}deg"></span>`;
  }).join("");
}
function azar(semilla) { let t = semilla >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- cuenta regresiva y despegue (una vez por visita) ---------- */
function cuentaRegresiva(listo) {
  let visto = false;
  try { visto = sessionStorage.getItem(MARCA.clave + ".intro") === "1"; } catch (e) { /* nada */ }
  if (visto || reducido() || location.hash.includes("ancla=")) { listo(); return; }
  try { sessionStorage.setItem(MARCA.clave + ".intro", "1"); } catch (e) { /* nada */ }
  const capa = document.createElement("div");
  capa.className = "intro"; capa.setAttribute("aria-hidden", "true");
  capa.innerHTML = `
    <div class="intro-cohete">${simbolo({ clase: "intro-sim", cohete: true, fuego: true })}</div>
    <div class="intro-humo">${bocanadas(20, 11)}</div>
    <p class="intro-num"></p>
    <button class="intro-saltar" type="button">Saltar</button>`;
  document.body.appendChild(capa);
  document.body.classList.add("con-intro");
  const num = $(".intro-num", capa), timers = [];
  let fin = false;
  const terminar = () => {
    if (fin) return; fin = true; timers.forEach(clearTimeout);
    /* el fondo se va, el humo se queda y se disipa dejando ver la página */
    capa.classList.add("despega", "sale");
    document.body.classList.remove("con-intro");
    listo();
    setTimeout(() => capa.remove(), 1700);
  };
  $(".intro-saltar", capa).addEventListener("click", terminar);
  const mostrar = (t, cls = "") => { num.textContent = t; num.className = "intro-num " + cls; void num.offsetWidth; num.classList.add("ver"); };
  [["3", 0], ["2", 650], ["1", 1300]].forEach(([t, ms]) => timers.push(setTimeout(() => { mostrar(t); capa.classList.add("tiembla-" + t); }, ms + 150)));
  timers.push(setTimeout(() => { mostrar("¡Despegue!", "despegue-txt"); capa.classList.add("despega"); }, 2100));
  timers.push(setTimeout(terminar, 3350));
}

/* ---------- materiales: progreso de cada sección y de cada forma ---------- */
function materiales() {
  const secs = $$(".material"), formas = $$(".tornasol-flota");
  const maxC = () => Math.min(innerWidth * 0.3, 320);
  function cuadro() {
    const h = innerHeight, m = maxC();
    secs.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top > h || r.bottom < 0) return;
      const v = clamp((h - r.top) / (h * 0.75), 0, 1);
      s.style.setProperty("--c", ((1 - v) * m).toFixed(1) + "px");
    });
    formas.forEach(f => {
      const r = f.getBoundingClientRect();
      const t = clamp(((r.top + r.height / 2) - h / 2) / h, -1.5, 1.5);
      f.style.setProperty("--t", t.toFixed(3));
    });
  }
  let pendiente = false;
  const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; cuadro(); }); } };
  cuadro();
  addEventListener("scroll", alScroll, { passive: true }); addEventListener("resize", alScroll);
  return () => { removeEventListener("scroll", alScroll); removeEventListener("resize", alScroll); };
}

/* Estrellas cerca del puntero se unen en constelación (lo llama el cuadro de estrellas del despegue). */
function constelacion(cx, estrellas, W, H, rect) {
  if (!PUNTERO.activo) return;
  const px = PUNTERO.x - rect.left, py = PUNTERO.y - rect.top;
  if (px < 0 || py < 0 || px > W || py > H) return;
  const cerca = [];
  for (const s of estrellas) { const x = s.x * W, y = s.y * H, d = Math.hypot(x - px, y - py); if (d < 150) cerca.push({ x, y, d }); }
  cerca.sort((a, b) => a.d - b.d).splice(9);
  cx.lineWidth = 0.8;
  cerca.forEach((a, i) => {
    cx.strokeStyle = `rgba(245,194,5,${(0.55 * (1 - a.d / 150)).toFixed(2)})`;
    cx.beginPath(); cx.moveTo(px, py); cx.lineTo(a.x, a.y); cx.stroke();
    const b = cerca[i + 1]; if (!b) return;
    cx.strokeStyle = `rgba(255,255,255,${(0.28 * (1 - b.d / 150)).toFixed(2)})`;
    cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
    cx.fillStyle = "rgba(245,194,5,.9)"; cx.beginPath(); cx.arc(a.x, a.y, 1.8, 0, 7); cx.fill();
  });
}
