"use strict";
/* ============================================================
   Escenas de cada planeta: cómo se ve el trabajo cuando se hace.
   Cada una es un SVG 400×250; la animación la pone landing.css
   cuando el contenedor tiene la clase .corre.
   ============================================================ */

const ESCENAS = {
  diseno: () => `
    <svg viewBox="0 0 400 250" class="esc esc-diseno" aria-hidden="true">
      <defs><pattern id="pt-reticula" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff22"/></pattern></defs>
      <rect width="400" height="250" fill="url(#pt-reticula)"/>
      <path class="d-relleno" d="M200 30 C150 80 150 170 200 220 C250 170 250 80 200 30Z" fill="var(--acento)"/>
      <path class="d-trazo" pathLength="1" d="M200 30 C150 80 150 170 200 220 C250 170 250 80 200 30Z" fill="none" stroke="var(--acento)" stroke-width="3"/>
      <g class="d-asas" stroke="#fff" stroke-width="1.2">
        <line x1="200" y1="30" x2="150" y2="80"/><line x1="200" y1="220" x2="150" y2="170"/>
        <line x1="200" y1="220" x2="250" y2="170"/><line x1="200" y1="30" x2="250" y2="80"/>
        <circle cx="150" cy="80" r="4" fill="#111"/><circle cx="150" cy="170" r="4" fill="#111"/><circle cx="250" cy="170" r="4" fill="#111"/><circle cx="250" cy="80" r="4" fill="#111"/>
      </g>
      <g class="d-nodos" fill="#fff"><rect x="195" y="25" width="10" height="10"/><rect x="195" y="215" width="10" height="10"/></g>
      <circle class="d-v" cx="200" cy="95" r="12" fill="#111"/><circle class="d-v d-v2" cx="200" cy="150" r="12" fill="#111"/>
      <g class="d-pluma"><path d="M0 0 L14 30 L0 24 L-14 30Z" fill="#fff"/><circle cx="0" cy="18" r="3" fill="#111"/></g>
      <text x="20" y="236" class="esc-nota">pluma · curvas · prueba al cliente</text>
    </svg>`,

  mantas: () => `
    <svg viewBox="0 0 400 250" class="esc esc-mantas" aria-hidden="true">
      <line x1="40" y1="34" x2="360" y2="34" stroke="#555" stroke-width="3"/>
      <g class="m-lona">
        <rect x="56" y="34" width="288" height="176" fill="var(--acento)"/>
        <rect x="56" y="150" width="288" height="60" fill="#111"/>
        <text x="74" y="98" class="m-grande">GRAN</text>
        <text x="74" y="138" class="m-grande">APERTURA</text>
        <text x="74" y="188" class="m-chica">Sábado 9 a. m. · Calle Real</text>
        ${[70, 200, 330].map(x => `<circle cx="${x}" cy="46" r="5" fill="#ddd" stroke="#777"/>`).join("")}
      </g>
      <g class="m-rollo"><rect x="50" y="26" width="300" height="20" rx="10" fill="#d8d3c4"/><rect x="50" y="26" width="300" height="7" rx="3.5" fill="#f2efe6"/></g>
      <text x="20" y="236" class="esc-nota">gran formato · lista para exterior</text>
    </svg>`,

  adhesivos: () => `
    <svg viewBox="0 0 400 250" class="esc esc-adhesivos" aria-hidden="true">
      <rect x="110" y="30" width="180" height="180" rx="10" fill="#e9e6dd"/>
      <rect x="128" y="48" width="144" height="144" rx="72" fill="none" stroke="#b9b4a6" stroke-dasharray="5 5"/>
      <g class="a-calco">
        <circle cx="200" cy="120" r="72" fill="var(--acento)"/>
        <circle cx="200" cy="120" r="60" fill="none" stroke="#111" stroke-width="3"/>
        <text x="200" y="118" text-anchor="middle" class="a-txt">¡HOLA!</text>
        <text x="200" y="146" text-anchor="middle" class="a-sub">HECHO EN REU</text>
        <path class="a-esquina" d="M262 156 Q240 168 236 192 Q258 186 262 156Z" fill="#fff6d6"/>
      </g>
      <text x="20" y="236" class="esc-nota">vinil · troquelado a la forma</text>
    </svg>`,

  corte: () => `
    <svg viewBox="0 0 400 250" class="esc esc-corte" aria-hidden="true">
      <rect x="30" y="60" width="340" height="120" fill="#2a2a2a"/>
      <rect class="c-sobra" x="30" y="60" width="340" height="120" fill="var(--acento)" opacity=".28"/>
      <text x="200" y="152" text-anchor="middle" class="c-letras">REU</text>
      <g class="c-cuchilla"><line x1="0" y1="-60" x2="0" y2="-4" stroke="#999" stroke-width="6"/><path d="M-5 -4 L5 -4 L0 6Z" fill="#fff"/></g>
      <text x="20" y="236" class="esc-nota">la cuchilla corta · se quita la sobra</text>
    </svg>`,

  grabado: () => `
    <svg viewBox="0 0 400 250" class="esc esc-grabado" aria-hidden="true">
      <defs>
        <linearGradient id="g-madera" x1="0" x2="1"><stop offset="0" stop-color="#c8935c"/><stop offset=".5" stop-color="#d9a873"/><stop offset="1" stop-color="#bf8752"/></linearGradient>
        <clipPath id="g-avance"><rect class="g-clip" x="70" y="80" width="260" height="120"/></clipPath>
        <filter id="g-brillo"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect x="60" y="78" width="280" height="130" rx="8" fill="url(#g-madera)"/>
      ${[96, 118, 141, 167, 190].map((y, i) => `<path d="M64 ${y} q70 ${i % 2 ? 6 : -6} 140 0 t132 0" stroke="#a8743f" stroke-width="1.2" fill="none" opacity=".55"/>`).join("")}
      <g clip-path="url(#g-avance)">
        <text x="200" y="138" text-anchor="middle" class="g-txt">Hecho en Reu</text>
        <text x="200" y="172" text-anchor="middle" class="g-sub">CON CARIÑO · 2027</text>
      </g>
      <g class="g-cabezal">
        <rect x="-18" y="20" width="36" height="22" rx="4" fill="#3a3a3a"/>
        <line x1="0" y1="42" x2="0" y2="140" stroke="#ff5b2e" stroke-width="2" class="g-rayo"/>
        <circle cx="0" cy="140" r="9" fill="#ffb27a" filter="url(#g-brillo)" class="g-punto"/>
        <circle cx="0" cy="140" r="3" fill="#fff"/>
      </g>
      <g class="g-humo" fill="#ffffff">${[0, 1, 2].map(i => `<circle class="g-h g-h${i}" cx="${200 + i * 30 - 30}" cy="120" r="${5 + i * 2}" opacity="0"/>`).join("")}</g>
      <text x="20" y="236" class="esc-nota">madera · acero · cuero · acrílico</text>
    </svg>`,

  impresion: () => `
    <svg viewBox="0 0 400 250" class="esc esc-impresion" aria-hidden="true">
      <defs><clipPath id="i-ranura"><rect x="0" y="0" width="400" height="179"/></clipPath></defs>
      <g clip-path="url(#i-ranura)"><g class="i-hoja">
        <rect x="130" y="40" width="140" height="150" fill="#f6f4ee"/>
        <rect class="i-l" x="146" y="58" width="70" height="12" fill="var(--acento)"/>
        ${[84, 98, 112, 126].map((y, i) => `<rect class="i-l" style="--i:${i + 1}" x="146" y="${y}" width="${[108, 96, 104, 60][i]}" height="5" fill="#333"/>`).join("")}
        <rect class="i-l" style="--i:5" x="146" y="144" width="108" height="34" fill="#111"/>
      </g></g>
      <rect x="90" y="176" width="220" height="50" rx="8" fill="#2f2f2f"/>
      <rect x="120" y="176" width="160" height="6" fill="#111"/>
      <circle cx="286" cy="204" r="5" fill="var(--acento)" class="i-luz"/>
      <text x="20" y="246" class="esc-nota">tarjetas · volantes · papelería</text>
    </svg>`,

  sandblast: () => `
    <svg viewBox="0 0 400 250" class="esc esc-sandblast" aria-hidden="true">
      <defs>
        <mask id="s-mascara"><rect x="0" y="0" width="400" height="250" fill="#fff"/><g transform="translate(200 122) scale(.26)" fill="#000">${simbolo({ trazo: 22 }).replace(/<\/?svg[^>]*>/g, "").replace(/currentColor/g, "#000")}</g></mask>
        <clipPath id="s-avance"><rect class="s-clip" x="70" y="78" width="260" height="90"/></clipPath>
        <filter id="s-ruido"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0"/></filter>
      </defs>
      <rect x="60" y="24" width="280" height="196" fill="#9fb7c3" opacity=".22"/>
      <path d="M90 40 L150 40 L80 200 L60 200Z" fill="#fff" opacity=".07"/>
      <g clip-path="url(#s-avance)">
        <g mask="url(#s-mascara)"><rect x="60" y="78" width="280" height="90" fill="#e8eef0" opacity=".78"/><rect x="60" y="78" width="280" height="90" filter="url(#s-ruido)" opacity=".5"/></g>
      </g>
      <rect class="s-espatula" x="0" y="70" width="8" height="106" rx="3" fill="var(--acento)"/>
      <rect x="60" y="24" width="280" height="196" fill="none" stroke="#c9c9c9" stroke-width="8"/>
      <text x="20" y="246" class="esc-nota">privacidad sin perder la luz</text>
    </svg>`
};
