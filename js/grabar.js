"use strict";
/* ============================================================
   «Grábalo tú»: la persona escribe su nombre (o sube su logo)
   y lo ve grabado con láser sobre una agenda, en vivo.
   El diseño viaja al cotizador y queda guardado en el pedido.
   ============================================================ */

const AGENDA_COLORES = {
  "Café": { piel: "#7a4a2b", lomo: "#5f3820", costura: "#b07d57", grabado: "#2a160a" },
  "Azul": { piel: "#2f4a6b", lomo: "#233a55", costura: "#6f8bab", grabado: "#c7d2de" },
  "Gris": { piel: "#8a8e91", lomo: "#6d7174", costura: "#b9bcbf", grabado: "#2f3133" },
  "Miel": { piel: "#c28a4a", lomo: "#a26f36", costura: "#e0b47d", grabado: "#4a2a10" }
};
const AGENDA_FUENTES = {
  firma: { t: "Firma", css: "'Great Vibes', cursive", tam: 44, peso: 400, mayus: false },
  clasica: { t: "Clásica", css: "'Cinzel', serif", tam: 28, peso: 700, mayus: false },
  moderna: { t: "Moderna", css: "var(--f-titulo)", tam: 40, peso: 800, mayus: true }
};

const GRABADO_INICIAL = { texto: "Tu Nombre", sub: "", fuente: "firma", color: "Café", logo: "", logoCrudo: "" };
let GRABADO = Object.assign({}, GRABADO_INICIAL);
try { const g = JSON.parse(sessionStorage.getItem(MARCA.clave + ".grabado") || "null"); if (g) GRABADO = Object.assign({}, GRABADO_INICIAL, g); } catch (e) { /* sin almacenamiento */ }
function guardarGrabado() { try { sessionStorage.setItem(MARCA.clave + ".grabado", JSON.stringify(GRABADO)); } catch (e) { /* imagen muy grande: se queda solo en memoria */ } }

/* Agenda en SVG. pre = prefijo para ids (puede haber varias en la misma pantalla). */
function agendaSVG(g, pre = "ag", o = {}) {
  const c = AGENDA_COLORES[g.color] || AGENDA_COLORES["Café"];
  const f = AGENDA_FUENTES[g.fuente] || AGENDA_FUENTES.firma;
  const texto = f.mayus ? String(g.texto || "").toUpperCase() : String(g.texto || "");
  const largo = texto.length;
  const tam = Math.round(f.tam * clamp(13 / Math.max(largo, 9), 0.55, 1.15));
  const yTexto = g.logo ? 262 : 214;
  const grabado = `
    ${g.logo ? `<image href="${esc(g.logo)}" x="96" y="${g.texto ? 104 : 130}" width="128" height="128" preserveAspectRatio="xMidYMid meet"/>` : ""}
    <text x="160" y="${yTexto}" text-anchor="middle" style="font-family:${f.css};font-size:${tam}px;font-weight:${f.peso};letter-spacing:${f.mayus ? 2 : 0}px" fill="${c.grabado}">${esc(texto)}</text>
    ${g.sub ? `<text x="160" y="${yTexto + 30}" text-anchor="middle" style="font-family:var(--f-texto);font-size:12px;font-weight:600;letter-spacing:4px" fill="${c.grabado}">${esc(String(g.sub).toUpperCase())}</text>` : ""}`;
  return `<svg viewBox="0 0 320 420" class="agenda" role="img" aria-label="Agenda ${esc(g.color)} grabada con «${esc(g.texto || "logo")}»">
    <defs>
      <filter id="${pre}-piel" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" result="r"/>
        <feDiffuseLighting in="r" surfaceScale="1.4" lighting-color="#fff" result="l"><feDistantLight azimuth="235" elevation="52"/></feDiffuseLighting>
        <feComposite in="l" in2="SourceGraphic" operator="in" result="t"/>
        <feBlend in="SourceGraphic" in2="t" mode="multiply"/>
      </filter>
      <linearGradient id="${pre}-luz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
      <clipPath id="${pre}-clip">${o.animar ? `<rect class="ag-filas" x="0" y="0" width="320" height="0"/><rect class="ag-fila" x="0" y="0" width="0" height="0"/>` : `<rect x="0" y="0" width="320" height="420"/>`}</clipPath>
      <filter id="${pre}-brillo" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    <rect x="6" y="6" width="308" height="408" rx="16" fill="${c.piel}" filter="url(#${pre}-piel)"/>
    <rect x="6" y="6" width="34" height="408" rx="14" fill="${c.lomo}" opacity=".9"/>
    <rect x="18" y="20" width="284" height="380" rx="10" fill="none" stroke="${c.costura}" stroke-width="2" stroke-dasharray="7 6" opacity=".8"/>
    <rect x="270" y="6" width="14" height="408" fill="${c.lomo}" opacity=".75"/>
    <text x="250" y="384" text-anchor="end" style="font-family:var(--f-titulo);font-size:34px;font-weight:800" fill="#000" opacity=".22">2027</text>
    <text x="250" y="383" text-anchor="end" style="font-family:var(--f-titulo);font-size:34px;font-weight:800" fill="#fff" opacity=".1">2027</text>
    <g class="ag-grabado" clip-path="url(#${pre}-clip)">
      <g transform="translate(0 1.2)" opacity=".18" style="filter:brightness(4)">${grabado}</g>
      ${grabado}
    </g>
    <rect x="6" y="6" width="308" height="408" rx="16" fill="url(#${pre}-luz)" pointer-events="none"/>
    ${o.animar ? `<g class="ag-laser" opacity="0"><line class="ag-rayo" x1="0" y1="-30" x2="0" y2="0" stroke="#ff6a3d" stroke-width="1.5"/><circle r="10" fill="#ffb27a" filter="url(#${pre}-brillo)"/><circle r="2.6" fill="#fff"/></g><g class="ag-chispas"></g>` : ""}
  </svg>`;
}

/* Convierte un logo cualquiera en «grabado»: lo oscuro se graba con el tono de la agenda. */
function logoGrabado(dataURL, color) {
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => {
      const lado = 360, k = Math.min(1, lado / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, w, h);
      const px = cx.getImageData(0, 0, w, h), d = px.data;
      /* ¿Logo claro sobre transparente? Entonces se graba la silueta (alfa), no lo oscuro. */
      let claros = 0, opacos = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 40) { opacos++; if ((d[i] + d[i + 1] + d[i + 2]) / 3 > 200) claros++; }
      const silueta = opacos < w * h * 0.92 && claros > opacos * 0.6;
      const tono = (AGENDA_COLORES[color] || AGENDA_COLORES["Café"]).grabado;
      const [R, G, B] = [1, 3, 5].map(i => parseInt(tono.slice(i, i + 2), 16));
      for (let i = 0; i < d.length; i += 4) {
        const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        const a = silueta ? d[i + 3] / 255 : (1 - lum) * (d[i + 3] / 255);
        d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = a > 0.42 ? 255 : a > 0.25 ? 140 : 0;
      }
      cx.putImageData(px, 0, 0);
      ok(cv.toDataURL("image/png"));
    };
    img.onerror = () => ok("");
    img.src = dataURL;
  });
}

/* Animación del láser: graba fila por fila, de ida y vuelta, con chispas. */
function grabarAnim(caja, alTerminar) {
  const svg = caja.querySelector("svg.agenda");
  if (!svg) return;
  const filas = svg.querySelector(".ag-filas"), fila = svg.querySelector(".ag-fila");
  const laser = svg.querySelector(".ag-laser"), chispas = svg.querySelector(".ag-chispas");
  const tieneLogo = !!GRABADO.logo;
  const y0 = tieneLogo && GRABADO.texto ? 100 : tieneLogo ? 126 : 168, y1 = (tieneLogo ? 262 : 214) + (GRABADO.sub ? 44 : 18);
  const x0 = 56, x1 = 264, N = Math.max(8, Math.round((y1 - y0) / 13)), alto = (y1 - y0) / N;
  if (reducido()) {
    filas.setAttribute("height", 420); filas.setAttribute("width", 320);
    alTerminar && alTerminar(); return () => {};
  }
  const dur = 2400 + N * 40, t0 = performance.now();
  let vivo = true, ultima = 0;
  laser.setAttribute("opacity", "1");
  function paso(t) {
    if (!vivo) return;
    const p = clamp((t - t0) / dur, 0, 1), fp = p * N, i = Math.min(N - 1, Math.floor(fp)), f = fp - i;
    filas.setAttribute("y", y0); filas.setAttribute("height", i * alto);
    const ida = i % 2 === 0, ancho = (x1 - x0) * f;
    fila.setAttribute("y", y0 + i * alto); fila.setAttribute("height", alto + 0.5);
    fila.setAttribute("x", ida ? x0 : x1 - ancho); fila.setAttribute("width", ancho);
    const lx = ida ? x0 + ancho : x1 - ancho, ly = y0 + i * alto + alto / 2;
    laser.setAttribute("transform", `translate(${lx} ${ly})`);
    svg.querySelector(".ag-rayo").setAttribute("y1", -ly - 10);
    if (t - ultima > 45) {
      ultima = t;
      const ch = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const vx = (Math.random() - 0.5) * 50, vy = -20 - Math.random() * 40;
      ch.setAttribute("r", (0.8 + Math.random() * 1.6).toFixed(1)); ch.setAttribute("fill", Math.random() > 0.5 ? "#ffd27a" : "#fff");
      ch.style.transform = `translate(${lx}px, ${ly}px)`;
      ch.animate([{ transform: `translate(${lx}px, ${ly}px)`, opacity: 1 }, { transform: `translate(${lx + vx}px, ${ly + vy + 40}px)`, opacity: 0 }], { duration: 520, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }).onfinish = () => ch.remove();
      chispas.appendChild(ch);
    }
    if (p < 1) requestAnimationFrame(paso);
    else {
      filas.setAttribute("y", 0); filas.setAttribute("height", 420);
      laser.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
      alTerminar && alTerminar();
    }
  }
  requestAnimationFrame(paso);
  return () => { vivo = false; };
}

/* ---------- sección de la landing ---------- */
function grabaloHTML() {
  const g = GRABADO, ag = DB.producto("agenda");
  return `
  <section class="grabalo material material-madera" id="grabalo" aria-labelledby="t-grabalo">
    ${doblez("Cuero y madera · grabado láser")}
    <div class="grabalo-texto">
      <p class="eyebrow">Grábalo tú</p>
      <h2 id="t-grabalo" class="titulo-xl">Escribe tu nombre.<br><span class="acento">Mira el láser.</span></h2>
      <p class="grabalo-lead">Así queda tu agenda antes de pedirla. Cambia el color, la letra o sube tu logo, y dale a grabar.</p>
      <form class="grabalo-form" data-f="grabar" autocomplete="off">
        <div class="campo">
          <label for="g-texto">Nombre o frase</label>
          <input id="g-texto" name="texto" maxlength="26" value="${esc(g.texto)}" data-i="grab_texto">
        </div>
        <div class="campo">
          <label for="g-sub">Segunda línea <span class="opcional">(opcional)</span></label>
          <input id="g-sub" name="sub" maxlength="30" value="${esc(g.sub)}" placeholder="Gerente de ventas" data-i="grab_sub">
        </div>
        <fieldset class="campo">
          <legend>Letra</legend>
          <div class="chips" role="radiogroup">${Object.entries(AGENDA_FUENTES).map(([k, f]) => `
            <label class="chip ${g.fuente === k ? "activo" : ""}"><input type="radio" name="fuente" value="${k}" ${g.fuente === k ? "checked" : ""} data-i="grab_fuente"><span style="font-family:${f.css};${f.mayus ? "text-transform:uppercase;font-weight:800" : ""}">${f.t}</span></label>`).join("")}
          </div>
        </fieldset>
        <fieldset class="campo">
          <legend>Color de la agenda</legend>
          <div class="muestras">${Object.entries(AGENDA_COLORES).map(([k, c]) => `
            <label class="muestra ${g.color === k ? "activo" : ""}" title="${k}"><input type="radio" name="color" value="${k}" ${g.color === k ? "checked" : ""} data-i="grab_color"><span style="background:${c.piel}"></span><em>${k}</em></label>`).join("")}
          </div>
        </fieldset>
        <div class="campo campo-logo">
          <span class="etiqueta">Tu logo <span class="opcional">(opcional)</span></span>
          <div class="fila-btns">
            <label class="btn btn-linea" for="g-logo">${ico("upload")} ${g.logo ? "Cambiar logo" : "Subir logo"}</label>
            <input id="g-logo" type="file" accept="image/*" class="sr" data-i="grab_logo">
            ${g.logo ? `<button type="button" class="btn btn-fantasma" data-a="grab_sinlogo">${ico("trash")} Quitar</button>` : ""}
          </div>
        </div>
        <div class="fila-btns grabalo-acciones">
          <button class="btn btn-acento btn-grande">${ico("zap")} Grabar</button>
          <button type="button" class="btn btn-linea btn-grande" data-a="grab_pedir">Pedir estas agendas ${ico("arrow-r")}</button>
        </div>
      </form>
    </div>
    <div class="grabalo-escena">
      <div class="grabalo-mesa" id="grabalo-mesa">${agendaSVG(g, "gl")}</div>
      <div class="grabalo-precio">
        <span><b>${Q(ag.precio)}</b> c/u con tu grabado</span>
        <span>${ag.tramos.map(t => `${t.desde}+ <b>−${t.pct}%</b>`).join(" · ")}</span>
      </div>
    </div>
  </section>`;
}

let pararLaser = null;
function repintarAgenda(animar) {
  const mesa = $("#grabalo-mesa"); if (!mesa) return;
  if (pararLaser) { pararLaser(); pararLaser = null; }
  mesa.innerHTML = agendaSVG(GRABADO, "gl", { animar });
  if (animar) { mesa.classList.add("grabando"); pararLaser = grabarAnim(mesa, () => mesa.classList.remove("grabando")); }
}
I.grab_texto = el => { GRABADO.texto = el.value; guardarGrabado(); repintarAgenda(false); };
I.grab_sub = el => { GRABADO.sub = el.value; guardarGrabado(); repintarAgenda(false); };
I.grab_fuente = el => {
  GRABADO.fuente = el.value; guardarGrabado();
  $$(".grabalo .chip").forEach(c => c.classList.toggle("activo", c.querySelector("input").checked));
  repintarAgenda(false);
};
I.grab_color = async el => {
  GRABADO.color = el.value;
  $$(".grabalo .muestra").forEach(c => c.classList.toggle("activo", c.querySelector("input").checked));
  if (GRABADO.logoCrudo) GRABADO.logo = await logoGrabado(GRABADO.logoCrudo, GRABADO.color);
  guardarGrabado(); repintarAgenda(false);
};
I.grab_logo = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try {
    GRABADO.logoCrudo = await leerImagen(a, 500);
    GRABADO.logo = await logoGrabado(GRABADO.logoCrudo, GRABADO.color);
    guardarGrabado(); refrescarGrabalo(); repintarAgenda(true);
  } catch (e) { aviso("Esa imagen no se pudo leer. Prueba con PNG o JPG.", "malo"); }
};
A.grab_sinlogo = () => { GRABADO.logo = ""; GRABADO.logoCrudo = ""; guardarGrabado(); refrescarGrabalo(); repintarAgenda(false); };
F.grabar = () => {
  if (!String(GRABADO.texto).trim() && !GRABADO.logo) { aviso("Escribe un nombre o sube tu logo.", "info"); return; }
  repintarAgenda(true);
};
A.grab_pedir = () => {
  guardarGrabado();
  ir("#/cotizar?producto=agenda&grabado=1");
};
function refrescarGrabalo() {
  const s = $("#grabalo"); if (!s) return;
  const foco = document.activeElement && document.activeElement.id;
  s.outerHTML = grabaloHTML();
  if (foco && $("#" + foco)) $("#" + foco).focus({ preventScroll: true });
}
