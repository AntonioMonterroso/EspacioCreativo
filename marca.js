/* Marca de la agencia: lo único que cambia entre la demo genérica y la versión de cada prospecto. */
window.MARCA = {
  clave: "espacio.creativo",
  nombre: "Espacio Creativo",
  corto: "Espacio",
  lema: "Agencia de diseño gráfico, centro de impresión y publicidad",
  ciudad: "Retalhuleu",
  direccion: "Retalhuleu, Guatemala",
  mapa: "https://maps.google.com/?q=Espacio+Creativo+Retalhuleu",
  whatsapp: "50257376789",
  telefonos: ["5737-6789", "5748-4591"],
  correo: "dg.espaciocreativo@gmail.com",
  facebook: "https://www.facebook.com/EspacioCreativoRetalhuleu",
  instagram: "https://www.instagram.com/espaciocreativoretalhuleu",
  redes: "EspacioCreativoRetalhuleu",
  colores: {
    fondo: "#070707",
    fondo2: "#111111",
    tarjeta: "#161616",
    linea: "#2A2A2A",
    tinta: "#F6F4EE",
    tinta2: "#B9B5AB",
    tenue: "#8A867D",
    acento: "#F5C205",
    acentoSuave: "#3A2F06",
    acentoSobre: "#0B0B0B",
    claro: "#F6F4EE",
    claroTinta: "#141414"
  },
  fuentes: {
    titulo: "Barlow Condensed",
    texto: "Sora",
    url: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,500;0,700;0,800;0,900;1,800&family=Sora:wght@300..800&family=Great+Vibes&family=Cinzel:wght@600;700&display=swap"
  },
  /* Logo: imágenes recortadas del logo original (fondo transparente) + símbolo redibujado en SVG (js/logo.js). */
  letras: "img/letras.png",
  logoImg: "img/logo.png",
  trabajos: [
    { img: "img/trabajos/banner.jpg", titulo: "Portada para redes", texto: "Diseño de la casa: tipografía con textura y formas tornasol.", planeta: "diseno", ancha: true },
    { img: "img/trabajos/agendas.jpg", titulo: "Agendas grabadas con láser", texto: "Con el nombre o el logo de cada empresa. Precio especial a mayoristas.", planeta: "grabado" },
    { img: "img/trabajos/sandblast.jpg", titulo: "Sandblast con vinil de corte", texto: "Privacidad para oficinas sin perder la luz, con el logo calado en el vidrio.", planeta: "sandblast" }
  ]
};

(function () {
  const m = window.MARCA, r = document.documentElement.style, c = m.colores;
  Object.entries(c).forEach(([k, v]) => r.setProperty("--" + k.replace(/[A-Z]/g, x => "-" + x.toLowerCase()), v));
  r.setProperty("--f-titulo", `"${m.fuentes.titulo}", "Arial Narrow", sans-serif`);
  r.setProperty("--f-texto", `"${m.fuentes.texto}", "Helvetica Neue", sans-serif`);
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = m.fuentes.url; document.head.appendChild(l);
  document.title = m.nombre;
})();
