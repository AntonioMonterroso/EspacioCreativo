"use strict";
/* ============================================================
   Probador en tu fachada (#/probador): el cliente sube una foto
   de su local o su carro, coloca encima una manta, un rótulo,
   un sandblast o su logo, lo mueve y lo escala, ve el precio y
   lo manda al cotizador con la imagen de prueba como arte.
   ============================================================ */

const TIPOS_PRUEBA = {
  manta: { t: "Manta", producto: "manta", icono: "flag", ancho: 3, alto: 1, colores: { Amarillo: ["#f5c205", "#111"], Negro: ["#111", "#f5c205"], Blanco: ["#f6f4ee", "#111"] } },
  rotulo: { t: "Rótulo de vinil", producto: "vinil", icono: "scissors", ancho: 2, alto: 0.5, colores: { Blanco: ["#ffffff"], Negro: ["#141414"], Dorado: ["#d4a93a"], Amarillo: ["#f5c205"] } },
  sandblast: { t: "Sandblast", producto: "esmerilado", icono: "glass", ancho: 1.8, alto: 0.6, colores: { Esmerilado: ["#eef3f5"] } },
  logo: { t: "Mi logo en vinil", producto: "vinil", icono: "sticker", ancho: 1, alto: 1, colores: { Original: [""] } }
};
let PRUEBA = { foto: "", ratio: 4 / 3, tipo: "manta", texto: "GRAN APERTURA", sub: "Tel. 5555-5555", color: "Amarillo", logo: "", x: 0.2, y: 0.08, w: 0.6, ancho: 3, alto: 1 };

/* Fachada de ejemplo para probar sin foto */
function fachadaEjemplo() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#cfc6b6"/><rect y="0" width="1200" height="70" fill="#b9ae9b"/>
    <rect x="0" y="760" width="1200" height="140" fill="#8e8a84"/><rect x="0" y="752" width="1200" height="14" fill="#a9a59e"/>
    <rect x="70" y="300" width="640" height="420" fill="#40525c"/><rect x="70" y="300" width="640" height="420" fill="none" stroke="#2c2c2c" stroke-width="14"/>
    <path d="M120 320 L300 320 L170 700 L90 700Z" fill="#fff" opacity=".1"/><path d="M380 320 L460 320 L330 700 L300 700Z" fill="#fff" opacity=".08"/>
    <line x1="390" y1="300" x2="390" y2="720" stroke="#2c2c2c" stroke-width="10"/>
    <rect x="800" y="300" width="300" height="452" fill="#5b4433"/><rect x="820" y="320" width="260" height="250" fill="#40525c"/><circle cx="1060" cy="600" r="10" fill="#d4a93a"/>
    <rect x="60" y="120" width="1080" height="140" fill="#e2dbcd"/><rect x="60" y="120" width="1080" height="140" fill="none" stroke="#a69c8a" stroke-width="4" stroke-dasharray="14 10"/>
    <text x="600" y="205" text-anchor="middle" font-family="Arial" font-size="34" fill="#a69c8a">tu fachada aquí · sube una foto</text>
    <rect x="1040" y="660" width="60" height="100" rx="8" fill="#6b8f5e"/><circle cx="1070" cy="640" r="44" fill="#7da56d"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* Lo que se coloca encima, en SVG del tamaño proporcional a sus medidas */
function piezaSVG(p = PRUEBA) {
  const T = TIPOS_PRUEBA[p.tipo], c = T.colores[p.color] || Object.values(T.colores)[0];
  const W = 1000, H = Math.round(W * p.alto / Math.max(0.1, p.ancho)), txt = esc(p.texto || ""), sub = esc(p.sub || "");
  const tam = Math.min(H * 0.48, W / Math.max(4, (p.texto || "").length) * 1.6);
  if (p.tipo === "manta") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <rect width="${W}" height="${H}" fill="${c[0]}"/><rect x="0" y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${c[1]}" opacity=".92"/>
      <text x="${W / 2}" y="${H * 0.52}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="900" font-size="${tam}" fill="${c[1]}">${txt}</text>
      <text x="${W / 2}" y="${H * 0.93}" text-anchor="middle" font-family="Sora, Arial, sans-serif" font-weight="700" font-size="${H * 0.11}" fill="${c[0]}">${sub}</text>
      ${[0.03, 0.5, 0.97].map(x => `<circle cx="${W * x}" cy="${H * 0.08}" r="${Math.max(6, H * 0.03)}" fill="#ddd" stroke="#666" stroke-width="3"/>`).join("")}</svg>`;
  if (p.tipo === "rotulo") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <text x="${W / 2}" y="${H * 0.62}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="${Math.min(H * 0.7, W / Math.max(4, (p.texto || "").length) * 1.75)}" fill="${c[0]}" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">${txt}</text>
      ${sub ? `<text x="${W / 2}" y="${H * 0.92}" text-anchor="middle" font-family="Sora, Arial, sans-serif" font-weight="600" font-size="${H * 0.14}" fill="${c[0]}">${sub}</text>` : ""}</svg>`;
  if (p.tipo === "sandblast") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><filter id="ruido"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .45 0"/></filter>
      <mask id="calado"><rect width="${W}" height="${H}" fill="#fff"/><text x="${W / 2}" y="${H * 0.64}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="${Math.min(H * 0.55, W / Math.max(4, (p.texto || "").length) * 1.6)}" fill="#000">${txt}</text></mask></defs>
      <g mask="url(#calado)"><rect width="${W}" height="${H}" fill="#eef3f5" opacity=".72"/><rect width="${W}" height="${H}" filter="url(#ruido)" opacity=".6"/></g></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${p.logo ? `<image href="${esc(p.logo)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet"/>` : `<rect width="${W}" height="${H}" fill="none" stroke="#f5c205" stroke-width="10" stroke-dasharray="30 20"/><text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-family="Sora, Arial" font-size="70" fill="#f5c205">Sube tu logo</text>`}</svg>`;
}

VISTAS.probador = () => {
  const p = PRUEBA, T = TIPOS_PRUEBA[p.tipo];
  return `
  ${navHTML(true)}
  <main class="probador" id="principal">
    <header class="cot-cabeza">
      <p class="eyebrow">Probador</p>
      <h1 class="titulo-xl">Míralo en tu local<br><span class="acento">antes de pedirlo.</span></h1>
      <p class="grabalo-lead">Sube una foto de tu fachada, tu vitrina o tu carro. Coloca la manta o el rótulo, arrástralo a su lugar y ajusta el tamaño.</p>
    </header>
    <div class="probador-grid">
      <div class="probador-escenario">
        <div class="probador-foto" id="pb-foto" style="aspect-ratio:${p.ratio}">
          <img src="${esc(p.foto || fachadaEjemplo())}" alt="${p.foto ? "Tu foto" : "Fachada de ejemplo"}" draggable="false">
          <div class="probador-pieza pieza-${p.tipo}" id="pb-pieza" tabindex="0" role="img" aria-label="${esc(T.t)} de ${p.ancho} × ${p.alto} metros. Arrástrala o usa las flechas para moverla."
            style="left:${p.x * 100}%;top:${p.y * 100}%;width:${p.w * 100}%;aspect-ratio:${p.ancho}/${p.alto}">
            ${piezaSVG()}
            <span class="pb-asa" id="pb-asa" aria-hidden="true"></span>
          </div>
        </div>
        <p class="tenue probador-ayuda">${ico("arrow-ur")} Arrastra para mover · la esquina amarilla cambia el tamaño · con teclado: flechas para mover, + y − para el tamaño.</p>
      </div>
      <form class="probador-panel cot-paso" data-f="pb_cotizar" autocomplete="off">
        <div class="campo"><span class="etiqueta">Tu foto</span>
          <div class="fila-btns"><label class="btn btn-linea" for="pb-subir">${ico("image")} ${p.foto ? "Cambiar foto" : "Subir foto"}</label><input id="pb-subir" type="file" accept="image/*" class="sr" data-i="pb_foto">
          ${p.foto ? `<button type="button" class="btn btn-fantasma" data-a="pb_sinfoto">Usar ejemplo</button>` : ""}</div></div>
        <fieldset class="campo"><legend>¿Qué quieres probar?</legend>
          <div class="pb-tipos">${Object.entries(TIPOS_PRUEBA).map(([k, x]) => `<label class="cot-planeta ${p.tipo === k ? "activo" : ""}" ${p.tipo === k ? 'aria-selected="true"' : ""}><input type="radio" name="tipo" value="${k}" class="sr" ${p.tipo === k ? "checked" : ""} data-i="pb_tipo">${ico(x.icono)}<span>${x.t}</span></label>`).join("")}</div>
        </fieldset>
        ${p.tipo === "logo" ? `<div class="campo"><span class="etiqueta">Tu logo</span><div class="fila-btns"><label class="btn btn-linea" for="pb-logo">${ico("upload")} ${p.logo ? "Cambiar logo" : "Subir logo"}</label><input id="pb-logo" type="file" accept="image/*" class="sr" data-i="pb_logo"></div></div>`
          : `<div class="campo"><label for="pb-texto">${p.tipo === "sandblast" ? "Texto calado en el vidrio" : "Texto"}</label><input id="pb-texto" name="texto" maxlength="28" value="${esc(p.texto)}" data-i="pb_campo"></div>
             ${p.tipo !== "sandblast" ? `<div class="campo"><label for="pb-sub">Segunda línea <span class="opcional">(opcional)</span></label><input id="pb-sub" name="sub" maxlength="34" value="${esc(p.sub)}" data-i="pb_campo"></div>` : ""}`}
        ${Object.keys(T.colores).length > 1 ? `<fieldset class="campo"><legend>Color</legend><div class="chips">${Object.keys(T.colores).map(k => `<label class="chip ${p.color === k ? "activo" : ""}"><input type="radio" name="color" value="${k}" ${p.color === k ? "checked" : ""} data-i="pb_color"><span>${k}</span></label>`).join("")}</div></fieldset>` : ""}
        <div class="cot-medidas">
          <div class="campo"><label for="pb-ancho">Ancho real (m)</label><input id="pb-ancho" name="ancho" type="number" min="0.2" step="0.1" inputmode="decimal" value="${p.ancho}" data-i="pb_medida"></div>
          <span class="cot-por" aria-hidden="true">×</span>
          <div class="campo"><label for="pb-alto">Alto real (m)</label><input id="pb-alto" name="alto" type="number" min="0.1" step="0.1" inputmode="decimal" value="${p.alto}" data-i="pb_medida"></div>
        </div>
        <div class="cot-precio" id="pb-precio">${precioPrueba()}</div>
        <div class="fila-btns">
          <button class="btn btn-acento btn-grande">${ico("arrow-r")} Cotizar esto</button>
          <button type="button" class="btn btn-linea" data-a="pb_descargar">${ico("upload")} Guardar imagen</button>
        </div>
      </form>
    </div>
  </main>`;
};
function precioPrueba() {
  const p = PRUEBA, prod = DB.producto(TIPOS_PRUEBA[p.tipo].producto), c = calcularLinea(prod, { ancho: p.ancho, alto: p.alto, cant: 1, opciones: {} });
  return `<div class="cot-precio-fila"><span>${esc(prod.nombre)} · ${c.base} m²</span><b>${Q(c.bruto)}</b></div><div class="cot-precio-fila total"><span>Aproximado</span><b data-odo="prueba">${Q(c.subtotal)}</b></div>`;
}

function repintarPieza() {
  const pz = $("#pb-pieza"); if (!pz) return;
  pz.style.left = PRUEBA.x * 100 + "%"; pz.style.top = PRUEBA.y * 100 + "%"; pz.style.width = PRUEBA.w * 100 + "%";
  pz.style.aspectRatio = PRUEBA.ancho + "/" + PRUEBA.alto;
  pz.querySelector("svg").outerHTML = piezaSVG();
  const pr = $("#pb-precio"); if (pr) { pr.innerHTML = precioPrueba(); if (window.animarOdometros) animarOdometros(pr); }
}
I.pb_campo = el => { PRUEBA[el.name] = el.value; repintarPieza(); };
I.pb_medida = el => { const v = +el.value; if (v > 0) { PRUEBA[el.name] = v; repintarPieza(); } };
I.pb_color = el => { PRUEBA.color = el.value; $$(".probador .chip").forEach(c => c.classList.toggle("activo", c.querySelector("input").checked)); repintarPieza(); };
I.pb_tipo = el => {
  const T = TIPOS_PRUEBA[el.value];
  Object.assign(PRUEBA, { tipo: el.value, color: Object.keys(T.colores)[0], ancho: T.ancho, alto: T.alto, texto: el.value === "rotulo" ? "TU NEGOCIO" : el.value === "sandblast" ? "OFICINA" : PRUEBA.texto });
  pintar();
};
I.pb_foto = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try {
    PRUEBA.foto = await leerImagen(a, 1400, 0.85);
    const img = new Image(); img.onload = () => { PRUEBA.ratio = img.width / img.height; pintar(); }; img.src = PRUEBA.foto;
  } catch (e) { aviso("Esa foto no se pudo leer. Prueba con JPG o PNG.", "malo"); }
};
A.pb_sinfoto = () => { PRUEBA.foto = ""; PRUEBA.ratio = 4 / 3; pintar(); };
I.pb_logo = async el => {
  const a = el.files && el.files[0]; if (!a) return;
  try {
    PRUEBA.logo = await leerImagen(a, 700);
    const img = new Image(); img.onload = () => { PRUEBA.alto = r2(PRUEBA.ancho * img.height / img.width); pintar(); }; img.src = PRUEBA.logo;
  } catch (e) { aviso("Ese logo no se pudo leer.", "malo"); }
};

/* arrastrar y escalar con puntero o teclado */
DESPUES.probador = () => {
  const foto = $("#pb-foto"), pz = $("#pb-pieza"), asa = $("#pb-asa");
  let modo = null, ini = null;
  const r = () => foto.getBoundingClientRect();
  pz.addEventListener("pointerdown", ev => {
    ev.preventDefault(); pz.setPointerCapture(ev.pointerId);
    modo = ev.target === asa ? "tam" : "mover"; ini = { x: ev.clientX, y: ev.clientY, px: PRUEBA.x, py: PRUEBA.y, w: PRUEBA.w };
    pz.classList.add("tomada");
  });
  pz.addEventListener("pointermove", ev => {
    if (!modo) return;
    const R = r(), dx = (ev.clientX - ini.x) / R.width, dy = (ev.clientY - ini.y) / R.height;
    if (modo === "mover") { PRUEBA.x = clamp(ini.px + dx, -0.3, 0.95); PRUEBA.y = clamp(ini.py + dy, -0.3, 0.95); }
    else PRUEBA.w = clamp(ini.w + dx, 0.08, 1.4);
    pz.style.left = PRUEBA.x * 100 + "%"; pz.style.top = PRUEBA.y * 100 + "%"; pz.style.width = PRUEBA.w * 100 + "%";
  });
  const soltar = () => { modo = null; pz.classList.remove("tomada"); };
  pz.addEventListener("pointerup", soltar); pz.addEventListener("pointercancel", soltar);
  pz.addEventListener("keydown", ev => {
    const paso = ev.shiftKey ? 0.05 : 0.01, m = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[ev.key];
    if (m) { ev.preventDefault(); PRUEBA.x = clamp(PRUEBA.x + m[0], -0.3, 0.95); PRUEBA.y = clamp(PRUEBA.y + m[1], -0.3, 0.95); repintarPieza(); }
    if (ev.key === "+" || ev.key === "=") { PRUEBA.w = clamp(PRUEBA.w + 0.03, 0.08, 1.4); repintarPieza(); }
    if (ev.key === "-") { PRUEBA.w = clamp(PRUEBA.w - 0.03, 0.08, 1.4); repintarPieza(); }
  });
  if (window.animarOdometros) animarOdometros($("#pb-precio"));
};

/* imagen final (foto + pieza) para el cotizador o para guardar */
function componerPrueba() {
  return new Promise(ok => {
    const W = 1200, H = Math.round(W / PRUEBA.ratio), cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const cx = cv.getContext("2d"), fondo = new Image();
    fondo.onload = () => {
      cx.drawImage(fondo, 0, 0, W, H);
      const pieza = new Image();
      pieza.onload = () => {
        const w = PRUEBA.w * W, h = w * PRUEBA.alto / PRUEBA.ancho;
        cx.drawImage(pieza, PRUEBA.x * W, PRUEBA.y * H, w, h);
        ok(cv.toDataURL("image/jpeg", 0.82));
      };
      pieza.onerror = () => ok(cv.toDataURL("image/jpeg", 0.82));
      pieza.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(piezaSVG());
    };
    fondo.src = PRUEBA.foto || fachadaEjemplo();
  });
}
A.pb_descargar = async () => {
  const url = await componerPrueba(), a = document.createElement("a");
  a.href = url; a.download = "prueba-" + PRUEBA.tipo + ".jpg"; document.body.appendChild(a); a.click(); a.remove();
};
F.pb_cotizar = async () => {
  const T = TIPOS_PRUEBA[PRUEBA.tipo], prod = DB.producto(T.producto), img = await componerPrueba();
  nuevaLinea(prod.id, { ancho: PRUEBA.ancho, alto: PRUEBA.alto, arte: img, arteNombre: "Prueba en mi fachada", nota: [PRUEBA.texto, PRUEBA.sub].filter(Boolean).join(" · ") });
  if (PRUEBA.tipo === "manta") LINEA.opciones.acabado = "Ojetes cada 50 cm";
  window.lineaPendiente = LINEA;
  ir("#/cotizar");
};
