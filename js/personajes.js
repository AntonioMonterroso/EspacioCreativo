"use strict";
/* ============================================================
   Personajes grises de la landing (en lugar de las donas):
   marcianito (portada), satélite impresora (servicios),
   platillo volador (trabajos) y astronauta con rodillo (mayoristas).
   Todos en SVG; el movimiento lo pone css/personajes.css.
   ============================================================ */

const GRIS = { claro: "#c9ced3", medio: "#a3a9af", base: "#868c93", oscuro: "#5c6167", tinta: "#26292c" };

const PERSONAJES = {
  marciano: () => `
    <svg viewBox="-10 -30 220 250" class="pj pj-marciano" aria-hidden="true">
      <defs>
        <radialGradient id="mc-piel" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${GRIS.claro}"/><stop offset=".65" stop-color="${GRIS.medio}"/><stop offset="1" stop-color="${GRIS.oscuro}"/></radialGradient>
      </defs>
      <g class="mc-antena"><path d="M100 22 Q96 4 104 -12" stroke="${GRIS.oscuro}" stroke-width="4" fill="none" stroke-linecap="round"/><circle class="mc-luz" cx="104" cy="-14" r="8" fill="var(--acento)"/></g>
      <path d="M76 150 Q72 196 82 206 L118 206 Q128 196 124 150Z" fill="${GRIS.base}"/>
      <circle cx="100" cy="178" r="9" fill="var(--acento)"/><path d="M96 178 L100 172 L104 178 L100 184Z" fill="${GRIS.tinta}"/>
      <path d="M78 160 Q58 178 60 196" stroke="${GRIS.base}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <g class="mc-brazo"><path d="M122 160 Q144 150 150 128" stroke="${GRIS.base}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <g fill="${GRIS.medio}"><circle cx="151" cy="122" r="9"/><rect x="143" y="104" width="5" height="16" rx="2.5"/><rect x="150" y="101" width="5" height="18" rx="2.5"/><rect x="157" y="105" width="5" height="15" rx="2.5"/></g></g>
      <path d="M100 20 C152 20 168 62 162 92 C156 126 126 152 100 154 C74 152 44 126 38 92 C32 62 48 20 100 20Z" fill="url(#mc-piel)"/>
      <g class="mc-ojos">
        <g class="mc-ojo"><ellipse cx="74" cy="90" rx="19" ry="27" transform="rotate(-24 74 90)" fill="${GRIS.tinta}"/><g class="mc-mira"><circle cx="68" cy="80" r="6" fill="#fff"/><circle cx="78" cy="98" r="2.5" fill="#fff" opacity=".7"/></g></g>
        <g class="mc-ojo"><ellipse cx="126" cy="90" rx="19" ry="27" transform="rotate(24 126 90)" fill="${GRIS.tinta}"/><g class="mc-mira"><circle cx="120" cy="80" r="6" fill="#fff"/><circle cx="130" cy="98" r="2.5" fill="#fff" opacity=".7"/></g></g>
      </g>
      <path d="M90 130 Q100 138 110 130" stroke="${GRIS.tinta}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="62" cy="116" rx="7" ry="4" fill="#d79aa0" opacity=".45"/><ellipse cx="138" cy="116" rx="7" ry="4" fill="#d79aa0" opacity=".45"/>
    </svg>`,

  satelite: () => `
    <svg viewBox="0 0 260 230" class="pj pj-satelite" aria-hidden="true">
      <g class="st-panel st-izq">
        <rect x="4" y="66" width="70" height="46" rx="4" fill="${GRIS.oscuro}"/>
        ${[0, 1, 2].map(i => `<line x1="${4 + 23.3 * (i + 1)}" y1="66" x2="${4 + 23.3 * (i + 1)}" y2="112" stroke="${GRIS.tinta}" stroke-width="2"/>`).join("")}<line x1="4" y1="89" x2="74" y2="89" stroke="${GRIS.tinta}" stroke-width="2"/>
        <rect x="4" y="66" width="70" height="46" rx="4" fill="none" stroke="${GRIS.medio}" stroke-width="2"/>
      </g>
      <g class="st-panel st-der">
        <rect x="186" y="66" width="70" height="46" rx="4" fill="${GRIS.oscuro}"/>
        ${[0, 1, 2].map(i => `<line x1="${186 + 23.3 * (i + 1)}" y1="66" x2="${186 + 23.3 * (i + 1)}" y2="112" stroke="${GRIS.tinta}" stroke-width="2"/>`).join("")}<line x1="186" y1="89" x2="256" y2="89" stroke="${GRIS.tinta}" stroke-width="2"/>
        <rect x="186" y="66" width="70" height="46" rx="4" fill="none" stroke="${GRIS.medio}" stroke-width="2"/>
      </g>
      <rect x="74" y="86" width="16" height="6" fill="${GRIS.base}"/><rect x="170" y="86" width="16" height="6" fill="${GRIS.base}"/>
      <g class="st-antena"><path d="M130 52 L130 28" stroke="${GRIS.oscuro}" stroke-width="4"/><path d="M112 34 Q130 6 148 34Z" fill="${GRIS.medio}"/><circle class="st-luz" cx="130" cy="18" r="5" fill="var(--acento)"/></g>
      <defs><clipPath id="st-salida"><rect x="96" y="128" width="68" height="110"/></clipPath></defs>
      <g clip-path="url(#st-salida)"><g class="st-papel">
        <rect x="104" y="40" width="52" height="92" fill="#f6f4ee"/>
        <rect x="110" y="48" width="28" height="7" fill="var(--acento)"/>
        <rect x="110" y="62" width="40" height="3" fill="${GRIS.oscuro}"/><rect x="110" y="70" width="34" height="3" fill="${GRIS.oscuro}"/><rect x="110" y="78" width="38" height="3" fill="${GRIS.oscuro}"/>
        <rect x="110" y="90" width="40" height="22" fill="${GRIS.tinta}"/>${simboloMini(130, 101, 0.07)}
      </g></g>
      <rect x="90" y="52" width="80" height="78" rx="12" fill="${GRIS.medio}"/>
      <rect x="90" y="52" width="80" height="22" rx="10" fill="${GRIS.claro}"/>
      <rect x="100" y="120" width="60" height="8" rx="4" fill="${GRIS.tinta}"/>
      <circle cx="104" cy="92" r="5" fill="var(--acento)" class="st-led"/><rect x="114" y="88" width="44" height="8" rx="4" fill="${GRIS.oscuro}"/>
    </svg>`,

  platillo: () => `
    <svg viewBox="0 0 260 260" class="pj pj-platillo" aria-hidden="true">
      <defs>
        <linearGradient id="pl-rayo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5c205" stop-opacity=".75"/><stop offset="1" stop-color="#f5c205" stop-opacity="0"/></linearGradient>
        <linearGradient id="pl-cupula" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ecef" stop-opacity=".9"/><stop offset="1" stop-color="#9fb2bb" stop-opacity=".55"/></linearGradient>
      </defs>
      <path class="pl-rayo" d="M102 92 L158 92 L206 250 L54 250Z" fill="url(#pl-rayo)"/>
      <g class="pl-botin"><circle cx="130" cy="218" r="17" fill="var(--acento)"/><circle cx="130" cy="218" r="12" fill="none" stroke="${GRIS.tinta}" stroke-width="2"/><text x="130" y="223" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="14" fill="${GRIS.tinta}">EC</text></g>
      <g class="pl-nave">
        <path d="M92 70 Q96 26 130 24 Q164 26 168 70Z" fill="url(#pl-cupula)"/>
        <ellipse cx="130" cy="56" rx="12" ry="14" fill="${GRIS.medio}"/><ellipse cx="125" cy="56" rx="3.5" ry="5" fill="${GRIS.tinta}"/><ellipse cx="135" cy="56" rx="3.5" ry="5" fill="${GRIS.tinta}"/>
        <path d="M106 40 Q112 32 122 30" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
        <ellipse cx="130" cy="76" rx="96" ry="24" fill="${GRIS.base}"/>
        <ellipse cx="130" cy="70" rx="96" ry="18" fill="${GRIS.medio}"/>
        <ellipse cx="130" cy="88" rx="44" ry="8" fill="${GRIS.oscuro}"/>
        ${[-72, -36, 0, 36, 72].map((dx, i) => `<circle class="pl-luz" style="--i:${i}" cx="${130 + dx}" cy="${78 - Math.abs(dx) * 0.06}" r="5" fill="var(--acento)"/>`).join("")}
      </g>
    </svg>`,

  astronauta: () => `
    <svg viewBox="0 0 240 240" class="pj pj-astro" aria-hidden="true">
      <path class="as-pintura" pathLength="1" d="M40 210 C70 170 40 140 80 120 S120 120 132 150" stroke="var(--acento-sobre)" stroke-width="14" fill="none" stroke-linecap="round"/>
      <rect x="132" y="92" width="34" height="56" rx="10" fill="${GRIS.oscuro}"/>
      <path d="M96 110 Q92 160 104 176 L150 176 Q162 160 156 110Z" fill="${GRIS.claro}"/>
      <path d="M104 176 L98 206 Q98 214 108 214 L116 214 L122 180Z" fill="${GRIS.medio}"/><path d="M150 176 L158 204 Q160 212 150 213 L142 213 L134 180Z" fill="${GRIS.medio}"/>
      <rect x="112" y="130" width="28" height="18" rx="4" fill="${GRIS.base}"/><circle cx="120" cy="139" r="3" fill="var(--acento-sobre)"/><circle cx="131" cy="139" r="3" fill="#c63b2b"/>
      <path d="M156 122 Q178 112 186 92" stroke="${GRIS.claro}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <g class="as-brazo">
        <path d="M98 124 Q78 138 72 158" stroke="${GRIS.claro}" stroke-width="14" fill="none" stroke-linecap="round"/>
        <circle cx="71" cy="162" r="9" fill="${GRIS.medio}"/>
        <path d="M71 162 L120 150 L132 154" stroke="${GRIS.oscuro}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="124" y="140" width="40" height="22" rx="10" fill="var(--acento-sobre)"/><rect x="128" y="144" width="32" height="5" rx="2.5" fill="#fff" opacity=".18"/>
      </g>
      <circle cx="126" cy="82" r="38" fill="${GRIS.claro}"/>
      <circle cx="126" cy="84" r="28" fill="${GRIS.tinta}"/>
      <path d="M108 72 Q116 60 132 60" stroke="var(--acento-sobre)" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/>
      <circle cx="140" cy="96" r="4" fill="#fff" opacity=".5"/>
      <circle cx="188" cy="90" r="8" fill="${GRIS.medio}"/>
    </svg>`
};

/* el símbolo de la marca en chiquito, para estampar dentro de los dibujos */
function simboloMini(cx, cy, k) {
  return `<g transform="translate(${cx} ${cy}) scale(${k})" fill="none" stroke="var(--acento)" stroke-width="20">
    <path d="${lazo(124, 46, 37)}"/><path d="${lazo(112, 46, 37)}" transform="rotate(120)"/><path d="${lazo(112, 46, 37)}" transform="rotate(240)"/></g>`;
}

/* personaje(tipo, { x, y, tam, vel, rot, clase }) → contenedor posicionado como las formas tornasol */
function personaje(tipo, o = {}) {
  return `<span class="personaje personaje-${tipo} ${o.clase || ""}" ${tipo === "marciano" ? 'role="img" aria-label="Marcianito que saluda"' : 'aria-hidden="true"'}
    style="--x:${o.x || "0"};--y:${o.y || "0"};--tam:${o.tam || "160px"};--vel:${o.vel ?? 120};--rot:${o.rot ?? 20}">${PERSONAJES[tipo]()}</span>`;
}

/* El marcianito mira al puntero, parpadea y saluda cuando te acercas (o lo tocas). */
function vidaPersonajes() {
  const marcianos = $$(".personaje-marciano");
  if (!marcianos.length || reducido()) return () => {};
  let pend = false;
  const mirar = () => {
    pend = false;
    marcianos.forEach(m => {
      const r = m.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.42;
      const dx = PUNTERO.x - cx, dy = PUNTERO.y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      m.style.setProperty("--ox", (dx / d * 5 * k).toFixed(2) + "px");
      m.style.setProperty("--oy", (dy / d * 5 * k).toFixed(2) + "px");
      if (d < 200 && !m.classList.contains("saluda")) saludar(m);
    });
  };
  const alMover = () => { if (!pend) { pend = true; requestAnimationFrame(mirar); } };
  const saludar = m => { m.classList.add("saluda"); setTimeout(() => m.classList.remove("saluda"), 2600); };
  const alTocar = ev => { const m = ev.target.closest(".personaje-marciano"); if (m) saludar(m); };
  addEventListener("pointermove", alMover, { passive: true });
  document.addEventListener("pointerdown", alTocar);
  setTimeout(() => marcianos.forEach(saludar), 1800);
  return () => { removeEventListener("pointermove", alMover); document.removeEventListener("pointerdown", alTocar); };
}
