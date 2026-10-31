"use strict";
/* ============================================================
   Símbolo de la marca redibujado en SVG: un cohete dentro de una
   triquetra (tres lazos) con su llama. Se dibuja en vivo con
   stroke-dashoffset, por eso no basta la imagen.
   ============================================================ */

/* Lazo (vesica) desde (0, atras) hasta la punta (0, -largo), con media anchura `ancho`. */
function lazo(largo, atras, ancho) {
  const c = (largo + atras) / 2, r = r2((c * c + ancho * ancho) / (2 * ancho));
  return `M0 ${atras} A${r} ${r} 0 0 1 0 ${-largo} A${r} ${r} 0 0 1 0 ${atras}Z`;
}
const LLAMA = "M0 56 C-13 66 -15 80 -4 94 C-6 84 -1 78 3 74 C4 82 9 86 8 94 C17 82 14 66 0 56Z";

/* Punta del cohete: sigue los arcos del lazo de arriba desde y=-100 hasta la punta. */
const PUNTA = "M-19.7 -100 A116.1 116.1 0 0 1 0 -124 A116.1 116.1 0 0 1 19.7 -100Z";
const ALETAS = "M-9 26 Q-30 44 -31 70 L-13 57 Z M9 26 Q30 44 31 70 L13 57 Z";
/* Fuego en capas (naranja, amarillo, blanco) con brillo y chispas: solo en las animaciones. */
function fuegoSVG() {
  return `<g class="sim-llama fuego">
      <ellipse class="fuego-brillo" cx="0" cy="84" rx="30" ry="40" fill="#ff8a2a" opacity=".55"/>
      <path class="fuego-ext" d="M0 50 C-24 68 -25 100 0 140 C25 100 24 68 0 50Z" fill="#ff6a1a"/>
      <path class="fuego-med" d="M0 54 C-16 68 -17 94 0 120 C17 94 16 68 0 54Z" fill="#ffc53a"/>
      <path class="fuego-int" d="M0 56 C-8 66 -9 82 0 98 C9 82 8 66 0 56Z" fill="#fff6d6"/>
      ${[-12, -5, 3, 10, -8, 7].map((x, i) => `<circle class="chispa" style="--i:${i};--dx:${x * 2.2}px" cx="${x}" cy="100" r="${1.6 + (i % 3) * 0.6}" fill="${i % 2 ? "#ffd27a" : "#fff"}"/>`).join("")}
    </g>`;
}

/* simbolo({ clase, trazo, conLlama, cohete, fuego }) → SVG del cohete-triquetra.
   cohete: suma punta y aletas (solo animaciones; el logo de la marca no cambia). fuego: llama en capas. */
function simbolo(o = {}) {
  const t = o.trazo || 17;
  return `<svg class="simbolo ${o.clase || ""}" viewBox="${o.fuego ? "-135 -150 270 300" : "-135 -140 270 250"}" aria-hidden="true" focusable="false">
    ${o.cohete ? `<path class="sim-aletas" d="${ALETAS}" fill="currentColor"/>` : ""}
    <g class="sim-lazos" fill="none" stroke="currentColor" stroke-width="${t}" stroke-linejoin="round" stroke-linecap="round">
      <path class="sim-lazo sim-l1" pathLength="1" d="${lazo(124, 46, 37)}"/>
      <path class="sim-lazo sim-l2" pathLength="1" d="${lazo(112, 46, 37)}" transform="rotate(120)"/>
      <path class="sim-lazo sim-l3" pathLength="1" d="${lazo(112, 46, 37)}" transform="rotate(240)"/>
    </g>
    <g class="sim-ventanas" fill="currentColor">
      <circle class="sim-v1" cx="0" cy="-74" r="9"/>
      <circle class="sim-v2" cx="0" cy="-16" r="9"/>
    </g>
    ${o.cohete ? `<path class="sim-punta" d="${PUNTA}" fill="currentColor"/>` : ""}
    ${o.fuego ? fuegoSVG() : o.conLlama === false ? "" : `<path class="sim-llama" d="${LLAMA}" fill="currentColor"/>`}
  </svg>`;
}

/* Logotipo completo: símbolo + letras originales (PNG transparente recortado del logo). */
function logotipo(clase = "") {
  return `<span class="logotipo ${clase}">${simbolo({ clase: "logotipo-sim", trazo: 19 })}<img src="${MARCA.letras}" alt="${esc(MARCA.nombre)}" width="475" height="149"></span>`;
}
