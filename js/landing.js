"use strict";
/* ============================================================
   Landing «el viaje del cohete»: despegue con el scroll,
   servicios como planetas, «Grábalo tú», bitácora, cuenta
   regresiva del proceso, mayoristas y contacto.
   ============================================================ */

const M = MARCA;
const waAgencia = (texto = "Hola " + M.nombre + ", quiero cotizar un trabajo.") => waLink(M.whatsapp, texto);
const desdePrecio = pl => {
  const ps = DB.productos().filter(p => p.planeta === pl && p.activo);
  const p = ps.sort((a, b) => a.precio - b.precio)[0];
  return p ? `Desde ${Q(p.precio)} / ${medidaTxt(p.medida, 1)}` : "";
};

function navHTML(simple) {
  return `
  <header class="nav ${simple ? "nav-simple" : ""}" id="nav">
    <a href="#/" class="nav-marca" aria-label="${esc(M.nombre)}, inicio">${logotipo("logotipo-nav")}</a>
    ${simple ? `<a href="#/" class="btn btn-fantasma">${ico("arrow-l")} Volver</a>` : `
    <nav class="nav-links" aria-label="Secciones">
      <a href="#/?ancla=orbita" data-a="ancla" data-id="orbita">Servicios</a>
      <a href="#/?ancla=grabalo" data-a="ancla" data-id="grabalo">Grábalo tú</a>
      <a href="#/?ancla=bitacora" data-a="ancla" data-id="bitacora">Trabajos</a>
      <a href="#/?ancla=mayoristas" data-a="ancla" data-id="mayoristas">Mayoristas</a>
      <a href="#/?ancla=contacto" data-a="ancla" data-id="contacto">Contacto</a>
    </nav>
    <div class="nav-acciones">
      <a href="#/cotizar" class="btn btn-acento">Cotizar</a>
      <button class="btn btn-icono nav-menu" data-a="menu" aria-label="Abrir menú" aria-expanded="false">${ico("menu")}</button>
    </div>`}
  </header>`;
}

VISTAS[""] = () => `
  ${navHTML()}
  <main id="principal">
    <section class="despegue" id="despegue" aria-labelledby="t-hero">
      <div class="despegue-fijo">
        <canvas class="estrellas" id="estrellas" aria-hidden="true"></canvas>
        ${personaje("marciano", { x: "3vw", y: "72vh", tam: "clamp(120px, 12vw, 175px)", vel: 60, rot: -25, clase: "tornasol-hero" })}
        ${tornasol("gota", { x: "88vw", y: "70vh", tam: "clamp(90px, 11vw, 170px)", vel: 160, rot: -120, giro: "24deg", clase: "tornasol-hero" })}
        <div class="despegue-texto">
          <p class="eyebrow">${esc(M.ciudad)} · diseño · impresión · publicidad</p>
          <h1 id="t-hero" class="hero-titulo"><span class="textura">Despegamos</span><span class="hero-linea2"><span class="textura">tu marca</span><span class="punto">.</span></span></h1>
          <p class="hero-sub">Diseñamos, imprimimos, cortamos y grabamos con láser. Una tarjeta, una manta de diez metros o cien agendas con tu logo: todo sale de la misma nave.</p>
          <div class="fila-btns">
            <a href="#/cotizar" class="btn btn-acento btn-grande">Cotiza en línea ${ico("arrow-r")}</a>
            <a href="${waAgencia()}" target="_blank" rel="noopener" class="btn btn-linea btn-grande">${ico("wa")} WhatsApp</a>
          </div>
        </div>
        <div class="cohete" aria-hidden="true">
          <div class="cohete-estela"></div>
          ${simbolo({ clase: "cohete-sim", cohete: true, fuego: true })}
        </div>
      </div>
    </section>

    <section class="orbita-sec material material-vinil" id="orbita" aria-labelledby="t-orbita">
      ${doblez("Vinil negro · corte digital")}
      ${personaje("satelite", { x: "76%", y: "70px", tam: "clamp(150px, 17vw, 240px)", vel: 140, rot: 14, clase: "tornasol-flota" })}
      <header class="sec-cabeza revela">
        <p class="eyebrow">Nuestro sistema solar</p>
        <h2 id="t-orbita" class="titulo-xl">Toca un planeta.<br>Mira cómo lo hacemos.</h2>
      </header>
      <div class="orbita-grid">
        <div class="orbita" id="orbita-mapa">
          <div class="orbita-sol">${simbolo({ clase: "sol-sim", trazo: 20 })}</div>
          <div class="anillo anillo-1"></div><div class="anillo anillo-2"></div>
          <div class="giro giro-1">${PLANETAS.slice(0, 3).map((p, i) => planetaHTML(p, i * 120 + 75, "r1")).join("")}</div>
          <div class="giro giro-2">${PLANETAS.slice(3).map((p, i) => planetaHTML(p, i * 90 + 30, "r2")).join("")}</div>
        </div>
        <div class="orbita-lista" role="tablist" aria-label="Servicios">${PLANETAS.map((p, i) => `
          <button role="tab" class="orbita-tab" id="tab-${p.id}" aria-selected="${i === 4}" aria-controls="ficha" data-a="planeta" data-id="${p.id}">${ico(p.icono)}<span>${esc(p.corto)}</span></button>`).join("")}
        </div>
        <article class="ficha" id="ficha" role="tabpanel" aria-live="polite"></article>
      </div>
    </section>

    ${grabaloHTML()}

    <section class="bitacora material material-lona" id="bitacora" aria-labelledby="t-bitacora">
      ${doblez("Lona 13 oz · gran formato")}
      ${personaje("platillo", { x: "74%", y: "40px", tam: "clamp(160px, 18vw, 250px)", vel: 120, rot: 8, clase: "tornasol-flota" })}
      <header class="sec-cabeza revela">
        <p class="eyebrow">Bitácora de misiones</p>
        <h2 id="t-bitacora" class="titulo-xl">Trabajos que ya despegaron.</h2>
      </header>
      ${filtrosBitacoraHTML()}
      <div class="bitacora-grid">${bitacoraGridHTML()}</div>
    </section>

    ${resenasHTML()}

    <section class="probador-cta material material-espacio" aria-labelledby="t-prob">
      ${doblez("Fachada · vitrina · carro")}
      <div class="probador-cta-texto revela">
        <p class="eyebrow">Probador</p>
        <h2 id="t-prob" class="titulo-xl">¿Cómo se vería<br><span class="acento">en tu local?</span></h2>
        <p class="grabalo-lead">Sube una foto de tu fachada y coloca la manta, el rótulo o el sandblast. Muévelo, cámbiale el tamaño y mira el precio.</p>
        <a href="#/probador" class="btn btn-acento btn-grande">${ico("image")} Probar en mi fachada</a>
      </div>
      <div class="probador-cta-demo revela" style="--i:1" aria-hidden="true">
        <img src="${fachadaEjemplo()}" alt="">
        <div class="pcd-manta">${piezaSVG({ tipo: "manta", texto: "GRAN APERTURA", sub: "Tel. 5555-5555", color: "Amarillo", ancho: 3, alto: 1 })}</div>
        <span class="pcd-mano">${ico("arrow-ur")}</span>
      </div>
    </section>

    <section class="cuenta material material-vidrio" id="proceso" aria-labelledby="t-cuenta">
      ${doblez("Vidrio 6 mm · sandblast")}
      <header class="sec-cabeza revela">
        <p class="eyebrow">Cuenta regresiva</p>
        <h2 id="t-cuenta" class="titulo-xl">Del pedido a tus manos.</h2>
      </header>
      <ol class="cuenta-pasos">
        ${[
          ["3", "Cotizas", "Escoges el producto, subes tu logo y ves el precio en el momento. Te damos un código para seguir tu pedido."],
          ["2", "Apruebas tu prueba", "Te mandamos el diseño por WhatsApp. Lo apruebas o pides cambios con un botón, sin llamadas."],
          ["1", "Producimos", "Imprimimos, cortamos o grabamos. Desde tu código ves en qué paso va."],
          ["0", "¡Despegue!", "Te avisamos que está listo. Pasas por él o lo coordinamos."]
        ].map(([n, t, x], i) => `<li class="paso revela" style="--i:${i}"><span class="paso-num">${n === "0" ? simbolo({ clase: "paso-sim", trazo: 22 }) : n}</span><h3>${t}</h3><p>${x}</p></li>`).join("")}
      </ol>
      <form class="rastreo revela" data-f="rastrear">
        <label for="r-codigo">¿Ya tienes un pedido?</label>
        <div class="rastreo-fila"><input id="r-codigo" name="codigo" placeholder="EC-1046" autocomplete="off" required><button class="btn btn-acento">${ico("search")} Rastrear</button></div>
      </form>
    </section>

    <section class="mayoristas material material-papel" id="mayoristas" aria-labelledby="t-mayor">
      ${doblez("Couché 300 g · impresión láser")}
      ${personaje("astronauta", { x: "82%", y: "5%", tam: "clamp(90px, 9vw, 130px)", vel: 50, rot: 30, clase: "tornasol-flota" })}
      <div class="mayor-texto revela">
        <p class="eyebrow eyebrow-oscuro">¡A mayoristas, precios especiales!</p>
        <h2 id="t-mayor" class="titulo-xl">¿Cien agendas?<br>¿Mil calcomanías?</h2>
        <p>Entre más pides, menos pagas por pieza. El descuento se aplica solo en el cotizador.</p>
        <a href="#/cotizar?producto=agenda" class="btn btn-negro btn-grande">Cotizar por mayor ${ico("arrow-r")}</a>
      </div>
      <div class="mayor-tabla revela" style="--i:1">
        <p class="mayor-prod">Agendas, termos y llaveros grabados</p>
        ${DB.producto("agenda").tramos.map(t => `<div class="tramo"><span>${t.desde}+ piezas</span><b>−${t.pct}%</b></div>`).join("")}
      </div>
    </section>

    <section class="contacto material material-espacio" id="contacto" aria-labelledby="t-contacto">
      ${doblez("Regreso a órbita")}
      ${tornasol("gota", { x: "82%", y: "8%", tam: "clamp(100px, 12vw, 190px)", vel: 180, rot: -140, giro: "-30deg", clase: "tornasol-flota" })}
      <h2 id="t-contacto" class="contacto-titulo plotter" aria-label="¿Listos para el despegue?">
        <svg viewBox="0 0 1000 300" aria-hidden="true">
          <text x="4" y="128" class="pl-linea pl-1">¿LISTOS PARA</text>
          <text x="4" y="276" class="pl-linea pl-2">EL DESPEGUE?</text>
        </svg>
      </h2>
      <div class="contacto-grid revela">
        <a href="${waAgencia()}" target="_blank" rel="noopener" class="contacto-wa">${ico("wa")}<span><b>Escríbenos por WhatsApp</b>${M.telefonos.join(" · ")}</span>${ico("arrow-ur")}</a>
        <ul class="contacto-datos">
          <li>${ico("mail")}<a href="mailto:${M.correo}">${M.correo}</a></li>
          <li>${ico("phone")}${M.telefonos.map(t => `<a href="tel:+502${t.replace(/\D/g, "")}">${t}</a>`).join(" · ")}</li>
          <li>${ico("pin")}<a href="${M.mapa}" target="_blank" rel="noopener">${esc(M.direccion)}</a></li>
          <li>${ico("clock")}<span>${esc(DB.config().horario)}</span></li>
          <li class="redes"><a href="${M.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ico("fb")}</a><a href="${M.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ico("ig")}</a><span>${esc(M.redes)}</span></li>
        </ul>
      </div>
    </section>
  </main>
  <div class="humo-pantalla" id="humo" aria-hidden="true">${bocanadas(18, 5)}</div>
  <footer class="pie">
    ${logotipo("logotipo-pie")}
    <p>${esc(M.lema)} · ${esc(M.ciudad)}</p>
    <a href="#/panel" class="pie-equipo">${ico("lock")} Entrada del equipo</a>
  </footer>`;

/* Esquina que se despega como calcomanía + etiqueta del material de la sección */
function doblez(material) {
  return `<span class="doblez" aria-hidden="true"></span><span class="material-tag" aria-hidden="true">${esc(material)}</span>`;
}

function planetaHTML(p, angulo, radio) {
  return `<button class="planeta planeta-${p.id}" style="--a:${angulo}deg" data-r="${radio}" data-a="planeta" data-id="${p.id}" aria-label="${esc(p.nombre)}">
    <span class="planeta-cuerpo"><span class="planeta-bola">${ico(p.icono)}</span><span class="planeta-nombre">${esc(p.corto)}</span></span>
  </button>`;
}

function fichaHTML(id) {
  const p = PLANETAS.find(x => x.id === id) || PLANETAS[0];
  const prods = DB.productos().filter(x => x.planeta === p.id && x.activo);
  return `
    <div class="ficha-escena corre" id="escena">${ESCENAS[p.id]()}</div>
    <div class="ficha-cuerpo">
      <p class="eyebrow">${ico(p.icono)} ${esc(desdePrecio(p.id))}</p>
      <h3>${esc(p.nombre)}</h3>
      <p>${esc(p.desc)}</p>
      <ul class="ficha-prods">${prods.map(x => `<li><span>${esc(x.nombre)}</span><b>${Q(x.precio)}<small>/${medidaTxt(x.medida, 1)}</small></b></li>`).join("")}</ul>
      <div class="fila-btns">
        <a href="#/cotizar?planeta=${p.id}" class="btn btn-acento">Cotizar ${esc(p.corto.toLowerCase())} ${ico("arrow-r")}</a>
        ${["mantas", "corte", "sandblast"].includes(p.id) ? `<a href="#/probador" class="btn btn-linea">${ico("image")} Probar en mi fachada</a>` : ""}
        <button class="btn btn-fantasma" data-a="repetir">${ico("refresh")} Ver otra vez</button>
      </div>
    </div>`;
}

let planetaActual = "grabado";
A.planeta = el => {
  planetaActual = el.dataset.id;
  $$(".planeta").forEach(b => b.classList.toggle("activo", b.dataset.id === planetaActual));
  $$(".orbita-tab").forEach(b => b.setAttribute("aria-selected", b.dataset.id === planetaActual));
  $("#orbita-mapa").classList.add("detenida");
  const abrirFicha = () => { const f = $("#ficha"); f.innerHTML = fichaHTML(planetaActual); f.classList.remove("entra"); void f.offsetWidth; f.classList.add("entra"); };
  const boton = el.classList.contains("planeta") ? el : $(`.planeta[data-id="${planetaActual}"]`);
  if (window.viajeAPlaneta && boton) viajeAPlaneta(boton, abrirFicha); else abrirFicha();
  if (el.classList.contains("planeta") && innerWidth < 1000) $("#ficha").scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" });
};
A.repetir = () => { const e = $("#escena"); e.classList.remove("corre"); void e.offsetWidth; e.classList.add("corre"); };
A.ancla = el => {
  cerrarMenu();
  const s = document.getElementById(el.dataset.id);
  if (ruta().nombre !== "") { location.hash = "#/?ancla=" + el.dataset.id; return; }
  if (s) s.scrollIntoView({ behavior: reducido() ? "auto" : "smooth" });
};
A.menu = el => {
  const nav = $("#nav"), abierto = nav.classList.toggle("menu-abierto");
  el.setAttribute("aria-expanded", abierto);
  el.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  el.innerHTML = ico(abierto ? "x" : "menu");
};
function cerrarMenu() { const n = $("#nav"); if (n && n.classList.contains("menu-abierto")) A.menu($(".nav-menu")); }
F.rastrear = (f, d) => {
  const p = DB.pedido(d.codigo);
  if (p) ir("#/pedido/" + p.codigo); else aviso("No encontramos ese código. Revisa que diga EC- y el número.", "malo");
};

/* ---------- vida de la landing: estrellas, despegue, revelados ---------- */
DESPUES[""] = (p, q) => {
  $("#ficha").innerHTML = fichaHTML(planetaActual);
  $$(".planeta").forEach(b => b.classList.toggle("activo", b.dataset.id === planetaActual));

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
  $$(".revela").forEach(el => io.observe(el));

  const sec = $("#despegue"), nav = $("#nav"), cv = $("#estrellas"), cx = cv.getContext("2d"), humo = $("#humo");
  let W = 0, H = 0, dpr = 1, prog = 0, vivo = true;
  const N = innerWidth < 700 ? 110 : 220;
  const estrellas = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, b: Math.random() * Math.PI * 2 }));
  function medir() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function progreso() {
    const total = sec.offsetHeight - innerHeight;
    prog = clamp(-sec.getBoundingClientRect().top / Math.max(1, total), 0, 1);
    sec.style.setProperty("--p", prog.toFixed(4));
    /* humo: se espesa mientras el cohete sube, cubre todo al terminar la portada y se limpia sobre los servicios */
    const despues = (scrollY - (sec.offsetTop + total)) / innerHeight;
    const h = reducido() ? 0 : clamp((prog - 0.3) / 0.6, 0, 1), l = prog < 1 ? 0 : clamp(despues / 0.75, 0, 1);
    humo.style.setProperty("--h", h.toFixed(3)); humo.style.setProperty("--l", l.toFixed(3));
    humo.classList.toggle("activo", h > 0.001 && l < 0.999);
    nav.classList.toggle("nav-solida", scrollY > innerHeight * 0.6);
  }
  let t0 = performance.now();
  function cuadro(t) {
    if (!vivo) return;
    const dt = Math.min(50, t - t0); t0 = t;
    cx.clearRect(0, 0, W, H);
    const vel = reducido() ? 0 : 0.012 + prog * prog * 0.9;
    const estela = clamp((prog - 0.15) * 1.6, 0, 1);
    /* La nave sube: las estrellas se abren desde un punto de fuga arriba, como al entrar en hiperespacio. */
    const fx = 0.5, fy = -0.25;
    for (const s of estrellas) {
      let dx = s.x - fx, dy = s.y - fy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const v = vel * s.z * dt / 1000 * 2.4;
      s.x += dx * v; s.y += dy * v;
      if (s.y > 1.05 || s.x < -0.05 || s.x > 1.05) { s.x = fx + (Math.random() - 0.5) * 1.6; s.y = -0.05 + Math.random() * 0.3; }
      const x = s.x * W, y = s.y * H, br = 0.45 + 0.55 * Math.abs(Math.sin(t / 900 + s.b));
      cx.strokeStyle = cx.fillStyle = `rgba(255,255,255,${(0.2 + s.z * 0.55) * br})`;
      if (estela > 0.02) { const l = estela * 90 * s.z * s.z; cx.lineWidth = s.z; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - dx * l, y - dy * l); cx.stroke(); }
      else { cx.beginPath(); cx.arc(x, y, s.z * 1.3, 0, 7); cx.fill(); }
    }
    if (estela < 0.3) constelacion(cx, estrellas, W, H, cv.getBoundingClientRect());
    requestAnimationFrame(cuadro);
  }
  medir(); progreso(); requestAnimationFrame(cuadro);
  addEventListener("resize", medir); addEventListener("scroll", progreso, { passive: true });
  const sinEstela = estela(), sinMateriales = materiales(), sinPersonajes = vidaPersonajes();
  cuentaRegresiva(() => laserTitulo());
  window.limpiarVista = () => {
    vivo = false; io.disconnect(); removeEventListener("resize", medir); removeEventListener("scroll", progreso);
    sinEstela(); sinMateriales(); sinPersonajes(); $$(".intro").forEach(x => x.remove()); document.body.classList.remove("con-intro");
  };

  const ancla = q && q.get("ancla");
  if (ancla && document.getElementById(ancla)) setTimeout(() => document.getElementById(ancla).scrollIntoView(), 40);
};
