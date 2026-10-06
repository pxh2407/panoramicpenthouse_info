/* ===== Attico Panoramico — Guida ospiti: logica =====
   I testi sono tutti in testi.js. Qui c'è solo il funzionamento. */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Lingua ---------- */
  const CODICI = LINGUE.map(l => l.cod);
  function linguaIniziale() {
    try { const s = localStorage.getItem("attico_lingua"); if (CODICI.includes(s)) return s; } catch (e) {}
    const nav = (navigator.languages || [navigator.language || "it"]).map(x => x.slice(0, 2).toLowerCase());
    return nav.find(c => CODICI.includes(c)) || "en";
  }
  let L = linguaIniziale();
  const u = k => (UI[L] && UI[L][k]) || UI.it[k] || "";
  const tr = o => (o == null ? "" : typeof o === "string" ? o : (o[L] || o.it || ""));
  const infoLingua = () => LINGUE.find(l => l.cod === L);

  /* ---------- Indice delle voci della guida ---------- */
  const VOCI = {};
  GUIDA.forEach(c => c.voci.forEach(v => { v._cat = c; VOCI[v.id] = v; }));
  const LUOGHI = {};
  DINTORNI.forEach(c => c.luoghi.forEach((l, i) => { l._id = l.id || (c.id + i); l._cat = c; LUOGHI[l._id] = l; }));

  /* ---------- Testi fissi dell'interfaccia ---------- */
  function applicaUI() {
    document.documentElement.lang = L;
    $$("[data-t]").forEach(el => { el.textContent = u(el.dataset.t); });
    $("#cerca").placeholder = u("cerca");
    $("#langCode").textContent = L.toUpperCase();
    $("#schedaAscolta").setAttribute("aria-label", u("ascolta"));
    $("#schedaChiudi").setAttribute("aria-label", u("chiudi"));
  }

  // Riempie i segnaposto <span data-ico> di index.html con i disegni di icone.js
  function riempiIcone() { $$("[data-ico]").forEach(el => { el.innerHTML = ico(el.dataset.ico); }); }

  /* ---------- Contatti ---------- */
  function contatti() {
    ["#hostWa", "#hostWa2"].forEach(s => { $(s).href = CONTATTI.whatsapp; });
    $("#codici").textContent = "CIR " + CONTATTI.cir + " · CIN " + CONTATTI.cin;
  }

  /* ---------- Oggi: rifiuti e silenzio ---------- */
  function fmtOra(h) {
    const d = new Date(2000, 0, 1, h, 0);
    return d.toLocaleTimeString(infoLingua().voce, { hour: "2-digit", minute: "2-digit" });
  }
  function statoSilenzio(now = new Date()) {
    const h = now.getHours() + now.getMinutes() / 60;
    for (const f of SILENZIO) {
      const dentro = f.da < f.a ? (h >= f.da && h < f.a) : (h >= f.da || h < f.a);
      if (dentro) return { ora: true, fascia: f };
    }
    // prossima fascia
    let migliore = null, dist = 99;
    SILENZIO.forEach(f => { const d = (f.da - h + 24) % 24; if (d < dist) { dist = d; migliore = f; } });
    return { ora: false, fascia: migliore };
  }
  function aggiornaOggi() {
    const now = new Date();
    $("#oggiData").textContent = u("oggi") + " · " + now.toLocaleDateString(infoLingua().voce, { weekday: "long", day: "numeric", month: "long" });
    const tipo = RIFIUTI_CALENDARIO[now.getDay()];
    if (tipo) {
      $("#rifEtichetta").textContent = u("rifiuti_stasera");
      $("#rifTipo").textContent = tr(RIFIUTI_TIPI[tipo]);
      $("#rifIcona").innerHTML = tessera(RIFIUTI_TIPI[tipo].icona, RIFIUTI_TIPI[tipo].colore);
    } else {
      $("#rifEtichetta").textContent = u("q_rifiuti");
      $("#rifTipo").textContent = u("nessuna_raccolta");
      $("#rifIcona").innerHTML = tessera("bidone", "#9aa1ab");
    }
    const s = statoSilenzio(now);
    $("#silEtichetta").textContent = s.ora ? u("silenzio_ora") : u("silenzio_prossimo");
    $("#silOra").textContent = (s.ora ? fmtOra(s.fascia.a) : fmtOra(s.fascia.da)) + " · " + tr(s.fascia);
  }

  /* ---------- Meteo (Open-Meteo, senza chiave) ---------- */
  const METEO_ICONE = [[0, "sole"], [2, "solenuvola"], [3, "nuvola"], [48, "nebbia"], [67, "pioggia"], [77, "neve"], [82, "pioggia"], [86, "neve"], [99, "temporale"]];
  let meteoDati = null;
  function mostraMeteo() {
    if (!meteoDati) return;
    const c = meteoDati.weather_code;
    const ic = (METEO_ICONE.find(([max]) => c <= max) || [0, "nuvola"])[1];
    const el = $("#meteo");
    el.innerHTML = ico(ic, "ico--meteo") + "<span>" + Math.round(meteoDati.temperature_2m) + "°C · " + esc(u("meteo")) + "</span>";
    el.hidden = false;
  }
  function caricaMeteo() {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + CONTATTI.casa.lat + "&longitude=" + CONTATTI.casa.lng + "&current=temperature_2m,weather_code&timezone=Europe%2FRome")
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && j.current) { meteoDati = j.current; mostraMeteo(); } })
      .catch(() => {});
  }

  /* ---------- Guida ---------- */
  function guida() {
    $("#chips").innerHTML = GUIDA.map(c => '<button class="chip" data-cat="' + c.id + '">' + esc(tr(c.titolo)) + "</button>").join("");
    $("#guida").innerHTML = GUIDA.map(c =>
      '<section class="categoria" id="cat-' + c.id + '"><h2>' + esc(tr(c.titolo)) + '</h2><div class="lista-voci">' +
      c.voci.map(v => '<button class="voce" data-apri="' + v.id + '" data-cerca="' + esc(testoRicerca(v, c)) + '">' + tessera(v.icona, c.colore, "it--voce") +
        '<span class="voce__titolo">' + esc(tr(v.titolo)) + "</span>" + (v.importante ? '<span class="voce__pin">★</span>' : "") +
        '<span class="freccia" aria-hidden="true">›</span></button>').join("") +
      "</div></section>").join("");
    filtra();
  }
  function testoRicerca(v, c) {
    const pezzi = [v.titolo, c.titolo, v.corpo].map(o => o ? Object.values(o).join(" ") : "");
    return pezzi.join(" ").replace(/<[^>]+>/g, " ").toLowerCase();
  }
  function filtra() {
    const q = $("#cerca").value.trim().toLowerCase();
    let visibili = 0;
    $$("#guida .categoria").forEach(sec => {
      let n = 0;
      $$(".voce", sec).forEach(b => { const ok = !q || b.dataset.cerca.includes(q); b.hidden = !ok; if (ok) n++; });
      sec.hidden = n === 0; visibili += n;
    });
    $("#vuoto").hidden = visibili > 0;
    $("#chips").hidden = !!q;
  }

  /* ---------- Dintorni e mappe (Leaflet + OpenStreetMap/CARTO) ---------- */
  const LF = window.L;                      // Leaflet (qui la variabile L è la lingua)
  const CASA = [CONTATTI.casa.lat, CONTATTI.casa.lng];
  function metri(a, b) {
    const R = 6371000, r = x => x * Math.PI / 180;
    const dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Distanza stimata sul percorso reale (linea d'aria × 1,3) e tempo a piedi (~4,5 km/h)
  function distanza(l) {
    const m = metri(CASA, l.pos) * 1.3;
    const loc = infoLingua().voce;
    if (l.auto) return u("circa") + " " + Math.round(m / 1000) + " km";
    const min = Math.max(2, Math.round(m / 75));
    const dist = m < 1000 ? Math.round(m / 10) * 10 + " m" : (m / 1000).toLocaleString(loc, { maximumFractionDigits: 1 }) + " km";
    return min + " min · " + dist;
  }
  function distHTML(l) { return ico(l.auto ? "auto" : "piedi", "ico--mini") + esc(distanza(l)); }
  function tesseraLuogo(l) {
    return l.foto
      ? '<span class="luogo__foto" style="background-image:url(\'images/' + encodeURI(l.foto) + '\')"></span>'
      : '<span class="luogo__foto luogo__foto--icona" style="--c:' + l._cat.colore + '">' + ico(l.icona || l._cat.icona) + "</span>";
  }
  function schedeLuoghi(c) {
    return '<div class="luoghi">' +
      c.luoghi.map(l => '<button class="luogo" data-luogo="' + esc(l._id) + '">' + tesseraLuogo(l) +
        '<span class="luogo__info"><span class="luogo__nome">' + esc(tr(l.nome)) + '</span><span class="luogo__desc">' + esc(tr(l.desc)) +
        '</span><span class="luogo__azione">' + distHTML(l) + "</span></span></button>").join("") +
      "</div>";
  }
  function iconaPin(nome, colore, casa) {
    return LF.divIcon({ className: "", iconSize: [38, 46], iconAnchor: [19, 44],
      html: '<span class="pin' + (casa ? " pin--casa" : "") + '" style="--c:' + colore + '"><span>' + ico(nome) + "</span></span>" });
  }
  // Sul telefono la mappa grande non "cattura" il dito: si sposta con due dita, così la pagina scorre normalmente
  function nuovaMappa(el, trascinabile) {
    const touch = "ontouchstart" in window;
    const m = LF.map(el, { zoomControl: true, dragging: !touch || trascinabile, scrollWheelZoom: false, tap: false });
    LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, className: "tessere-mappa",
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(m);
    LF.marker(CASA, { icon: iconaPin("casa", "#14233c", true), zIndexOffset: 1000, title: u("appartamento") }).addTo(m);
    return m;
  }
  // Mappa generale della pagina Dintorni, con i filtri per categoria
  let mappaG = null, strato = null, filtro = "tutti";
  function disegnaMappaGrande() {
    if (!LF) { $("#mappaGrande").hidden = true; $("#filtriMappa").hidden = true; return; }
    if (!mappaG) { mappaG = nuovaMappa($("#mappaGrande"), false); strato = LF.layerGroup().addTo(mappaG); }
    strato.clearLayers();
    const punti = [CASA];
    DINTORNI.filter(c => filtro === "tutti" || c.id === filtro).forEach(c => c.luoghi.forEach(l => {
      LF.marker(l.pos, { icon: iconaPin(l.icona || c.icona, c.colore), title: tr(l.nome) })
        .on("click", () => apriLuogo(l._id)).addTo(strato);
      if (!l.auto || filtro !== "tutti") punti.push(l.pos);   // la Piscina di Venere (lontana) non allarga la vista generale
    }));
    mappaG.invalidateSize();
    mappaG.fitBounds(punti, { padding: [30, 30], maxZoom: 17 });
  }
  function filtriMappa() {
    $("#filtriMappa").innerHTML = '<button class="chip' + (filtro === "tutti" ? " chip--on" : "") + '" data-filtro="tutti">' + esc(u("tutti")) + "</button>" +
      DINTORNI.map(c => '<button class="chip' + (filtro === c.id ? " chip--on" : "") + '" data-filtro="' + c.id + '" style="--c:' + c.colore + '"><i></i>' + esc(tr(c.cat)) + "</button>").join("");
  }
  // Mappa piccola dentro la scheda di un luogo: casa + destinazione
  let mappaP = null;
  function chiudiMappaPiccola() { if (mappaP) { mappaP.remove(); mappaP = null; } }
  function mappaPiccola(l) {
    const el = $("#miniMappa");
    if (!LF || !el) return;
    mappaP = nuovaMappa(el, true);
    LF.marker(l.pos, { icon: iconaPin(l.icona || l._cat.icona, l._cat.colore) }).addTo(mappaP);
    const adatta = () => { if (mappaP) { mappaP.invalidateSize(); mappaP.fitBounds([CASA, l.pos], { padding: [44, 44], maxZoom: 17 }); } };
    adatta(); setTimeout(adatta, 380);
  }
  function bloccoLuogo(l) {
    return '<div class="mini-mappa" id="miniMappa"></div><p class="mini-mappa__nota"><span>' + ico("casa", "ico--mini") + esc(u("appartamento")) + "</span><b>" + distHTML(l) + "</b></p>" +
      '<div class="bottoni"><a class="btn btn--oro" href="' + urlPercorso(l) + '" target="_blank" rel="noopener">' + ico("navigazione") + '<b>' + esc(u("indicazioni")) + " · " + esc(l.auto ? u("in_auto") : u("a_piedi")) + "</b></a></div>";
  }
  /* Cartina illustrata delle Isole Eolie (stessa del sito www.atticopanoramico.it, posizioni reali).
     Scritte più grandi perché sul telefono la cartina è larga circa la metà. */
  function cartinaEolie() {
    const P = (lat, lon) => [20 + (lon - 14.30) * 600, 20 + (38.84 - lat) * 766.7];
    const PX_KM = 766.7 / 111.2, f = n => n.toFixed(1);
    const liscia = p => {
      let d = "M" + f(p[0][0]) + "," + f(p[0][1]);
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + "," + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + "," + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + "," + f(p2[1]);
      }
      return d;
    };
    // costa tirrenica della Sicilia, da Capo d'Orlando a Spadafora, con la penisola di Milazzo
    const costa = [[38.080, 14.560], [38.125, 14.700], [38.163, 14.745], [38.150, 14.800], [38.152, 14.835], [38.170, 14.900], [38.177, 14.925],
      [38.163, 14.948], [38.148, 14.975], [38.145, 15.020], [38.150, 15.048], [38.135, 15.065], [38.140, 15.110], [38.160, 15.180], [38.192, 15.222],
      [38.212, 15.236], [38.240, 15.226], [38.258, 15.228], [38.271, 15.233], [38.262, 15.244], [38.243, 15.249], [38.222, 15.247], [38.214, 15.270],
      [38.220, 15.330], [38.226, 15.380], [38.236, 15.430]].map(p => P(p[0], p[1]));
    const porto = P(38.221, 15.246);
    let rotte = "", isole = "", bottoni = "";
    ISOLE.forEach(is => {
      const c = P(is.lat, is.lon), r = Math.sqrt(is.kmq / Math.PI) * PX_KM;
      const dx = c[0] - porto[0], dy = c[1] - porto[1], len = Math.hypot(dx, dy);
      const mx = (porto[0] + c[0]) / 2 + dy * 0.16, my = (porto[1] + c[1]) / 2 - dx * 0.16;
      rotte += '<path class="rotta" data-n="' + is.nome + '" d="M' + f(porto[0]) + "," + f(porto[1]) + " Q" + f(mx) + "," + f(my) + " " + f(c[0]) + "," + f(c[1]) + '"/>';
      const sx = is.nome === "Stromboli";   // Stromboli è sul bordo destro: nome a sinistra
      isole += '<g class="isola" data-n="' + is.nome + '"><circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(r) + '"/>' +
        (sx ? '<path class="pennacchio" d="M' + f(c[0]) + "," + f(c[1] - r - 3) + ' c-6,-8 6,-12 0,-20 c-5,-7 5,-11 1,-18"/>' : "") +
        '<text x="' + f(sx ? c[0] - r - 10 : c[0] + r + 10) + '" y="' + f(c[1] + 9) + '" text-anchor="' + (sx ? "end" : "start") + '">' + is.nome + "</text></g>";
      bottoni += '<button type="button" data-n="' + is.nome + '">' + is.nome + "</button>";
    });
    const casa = P(CONTATTI.casa.lat, CONTATTI.casa.lng);
    const svg = '<svg viewBox="0 0 680 590" role="img" aria-label="' + esc(tr(EOLIE.didascalia)) + '"><defs>' +
      '<radialGradient id="eoMare" cx="70%" cy="85%" r="95%"><stop offset="0" stop-color="#25506a"/><stop offset="1" stop-color="#0f2030"/></radialGradient>' +
      '<pattern id="eoGriglia" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(216,183,122,.07)" stroke-width="1"/></pattern></defs>' +
      '<rect width="680" height="590" fill="url(#eoMare)"/><rect width="680" height="590" fill="url(#eoGriglia)"/>' +
      '<text x="40" y="96" class="eo-mare">' + esc(tr(EOLIE.mare)) + "</text>" + rotte +
      '<path class="eo-terra" d="' + liscia(costa) + " L700,620 L0,620 L0," + f(costa[0][1]) + ' Z"/>' +
      '<text x="380" y="578" class="eo-sicilia">' + esc(tr(EOLIE.sicilia)) + "</text>" + isole +
      '<circle class="eo-pulsa" cx="' + f(casa[0]) + '" cy="' + f(casa[1]) + '" r="8"/><circle class="eo-casa" cx="' + f(casa[0]) + '" cy="' + f(casa[1]) + '" r="8"/>' +
      '<text class="eo-milazzo" x="' + f(casa[0] - 20) + '" y="' + f(casa[1] + 4) + '" text-anchor="end">Milazzo</text>' +
      '<g class="eo-bussola" transform="translate(70 455)"><circle r="26"/><path d="M0-20 L6 0 L0 20 L-6 0 Z"/><path d="M0-20 L6 0 L-6 0 Z" class="eo-nord"/><text y="-33" text-anchor="middle">N</text></g></svg>';
    return '<div class="eolie"><figure class="eolie__map">' + svg + "</figure>" +
      '<div class="eolie__testo"><h3>' + esc(tr(EOLIE.titolo)) + "</h3><p>" + tr(EOLIE.testo) + '</p><div class="eolie__isole">' + bottoni + "</div></div></div>";
  }
  // Toccando un'isola (sulla cartina o nel pulsante) si accende lei e la sua rotta
  function attivaEolie() {
    const box = $("#schedaCorpo .eolie"); if (!box) return;
    let fissa = null;
    const accendi = n => $$("[data-n]", box).forEach(x => x.classList.toggle("acceso", !!n && x.getAttribute("data-n") === n));
    $$(".isola, .eolie__isole button", box).forEach(x => x.addEventListener("click", () => {
      const n = x.getAttribute("data-n"); fissa = fissa === n ? null : n; accendi(fissa);
    }));
  }

  // Pulsante "Mangiare": solo la prima categoria (ristoranti e bar)
  function apriMangiare() {
    const c = DINTORNI[0];
    apriScheda(tessera(c.icona, c.colore), tr(c.cat), schedeLuoghi(c));
  }
  function dintorni() {
    $("#dintorni").innerHTML = DINTORNI.map(c =>
      '<section class="categoria"><h2><i class="pallino" style="--c:' + c.colore + '"></i>' + esc(tr(c.cat)) + "</h2>" + schedeLuoghi(c) + "</section>").join("");
    $("#esperienze").innerHTML = ESPERIENZE.map(e => '<a class="esperienza" href="' + e.url + '" target="_blank" rel="noopener"><span>' + esc(tr(e)) + "</span>" + ico("esterno", "ico--mini") + "</a>").join("");
    filtriMappa();
  }

  /* ---------- Numeri ---------- */
  const fmtNum = n => n.length <= 6 ? n : n.replace(/^(\d{3})(\d{3})(\d+)$/, "$1 $2 $3");
  function numeri() {
    $("#numeri").innerHTML = NUMERI.map(g =>
      '<section class="gruppo' + (g.urgente ? " gruppo--urgente" : "") + '"><h2>' + esc(tr(g.gruppo)) + '</h2><div class="lista-voci">' +
      g.voci.map(v => '<a class="numero" href="tel:' + v.n + '"><span class="numero__nome">' + esc(tr(v)) +
        (v.alt ? '<span class="numero__alt">' + fmtNum(v.alt) + "</span>" : "") + '</span><span class="numero__num"><span class="numero__tel">' + ico("telefono") + '</span>' + fmtNum(v.n) + "</span></a>").join("") +
      "</div></section>").join("");
  }

  /* ---------- Contenuti speciali delle schede ---------- */
  function fotoHTML(lista) {
    if (!lista || !lista.length) return "";
    // solo telefono: foto a tutta larghezza, una sotto l'altra (niente strisce da scorrere di lato)
    return lista.map(f => '<img class="foto-in" src="images/' + encodeURI(f) + '" alt="" loading="lazy">').join("");
  }
  function speciale(v) {
    if (v.tipo === "wifi") {
      return campo(u("rete"), CONTATTI.wifiReti) + campo(u("password"), CONTATTI.wifiPassword, true) + campo(u("notebook"), CONTATTI.notebook) +
        '<div class="bottoni"><a class="btn btn--wa" href="' + CONTATTI.whatsapp + '" target="_blank" rel="noopener">' + ico("whatsapp") + '<b>' + esc(u("scrivici")) + "</b></a></div>";
    }
    if (v.tipo === "chiavi") {
      return CHIAVI.map((k, i) => '<div class="chiave"><em>' + (i + 1) + "</em>" + (k.colore ? '<i style="background:' + k.colore + '"></i>' : '<i class="tele">' + ico("telecomando") + '</i>') + "<span>" + esc(tr(k)) + "</span></div>").join("");
    }
    if (v.tipo === "rifiuti") {
      const oggi = new Date();
      let h = '<div class="settimana">';
      for (let i = 0; i < 7; i++) {
        const d = new Date(oggi); d.setDate(oggi.getDate() + i);
        const t = RIFIUTI_CALENDARIO[d.getDay()];
        const nome = d.toLocaleDateString(infoLingua().voce, { weekday: "long" });
        h += '<div class="giorno' + (i === 0 ? " oggi-g" : "") + (t ? "" : " vuoto-g") + '"><b>' + esc(i === 0 ? u("oggi") : nome) + "</b><span>" +
          (t ? esc(tr(RIFIUTI_TIPI[t])) : esc(u("nessuna"))) + "</span>" +
          (t ? '<i style="background:' + RIFIUTI_TIPI[t].colore + '"></i>' : "") + "</div>";
      }
      return h + "</div>";
    }
    if (v.tipo === "silenzio") {
      return orologio() + '<div class="tab">' + SILENZIO.map(f => "<div><span>" + esc(tr(f)) + "</span><strong>" + fmtOra(f.da) + " – " + fmtOra(f.a) + "</strong></div>").join("") + "</div>";
    }
    return "";
  }
  function campo(etichetta, valore, copia) {
    return '<div class="campo"><div><small>' + esc(etichetta) + "</small><code>" + esc(valore) + "</code></div>" +
      (copia ? '<button data-copia="' + esc(valore) + '">' + esc(u("copia")) + "</button>" : "") + "</div>";
  }
  /* Quadrante 24 ore con le fasce di silenzio e l'ora attuale */
  function orologio() {
    const cx = 110, cy = 110, r = 84;
    const pt = (h, rr) => { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    const arco = (da, a) => {
      const durata = (a - da + 24) % 24; const [x1, y1] = pt(da, r), [x2, y2] = pt(a, r);
      return '<path d="M' + x1 + " " + y1 + " A" + r + " " + r + " 0 " + (durata > 12 ? 1 : 0) + " 1 " + x2 + " " + y2 + '" stroke="#b3382c" stroke-width="18" fill="none" stroke-linecap="butt" opacity=".85"/>';
    };
    let s = '<svg class="orologio" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="84" stroke="#e6ddcc" stroke-width="18" fill="none"/>';
    SILENZIO.forEach(f => { s += arco(f.da, f.a); });
    for (let h = 0; h < 24; h++) {
      const [x1, y1] = pt(h, 64), [x2, y2] = pt(h, h % 6 ? 60 : 56);
      s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#5d6675" stroke-width="' + (h % 6 ? 1 : 2) + '"/>';
    }
    [0, 6, 12, 18].forEach(h => { const [x, y] = pt(h, 44); s += '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#14233c" font-family="Inter,sans-serif">' + h + "</text>"; });
    const now = new Date(), hh = now.getHours() + now.getMinutes() / 60, [nx, ny] = pt(hh, 92);
    s += '<line x1="110" y1="110" x2="' + nx + '" y2="' + ny + '" stroke="#b8893a" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="110" r="6" fill="#b8893a"/><circle cx="' + nx + '" cy="' + ny + '" r="6" fill="#b8893a" stroke="#fff" stroke-width="2"/>';
    s += "</svg>";
    return s;
  }

  /* ---------- Scheda di dettaglio ---------- */
  const scheda = $("#scheda"), velo = $("#velo");
  let schedaAperta = false;
  function apriScheda(icona, titolo, html) {
    fermaVoce(); chiudiMappaPiccola();
    $("#schedaIcona").innerHTML = icona;
    $("#schedaTitolo").textContent = titolo;
    const corpo = $("#schedaCorpo");
    corpo.innerHTML = html; corpo.scrollTop = 0;
    scheda.hidden = false; velo.hidden = false;
    requestAnimationFrame(() => { scheda.classList.add("on"); velo.classList.add("on"); });
    document.body.style.overflow = "hidden";
    if (!schedaAperta) { history.pushState({ scheda: 1 }, ""); schedaAperta = true; }
    setTimeout(() => $("#schedaChiudi").focus({ preventScroll: true }), 50);
  }
  function chiudiScheda(daStoria) {
    if (!schedaAperta) return;
    fermaVoce();
    schedaAperta = false;
    scheda.classList.remove("on"); velo.classList.remove("on");
    document.body.style.overflow = "";
    setTimeout(() => { if (!schedaAperta) { chiudiMappaPiccola(); scheda.hidden = true; velo.hidden = true; $("#schedaCorpo").innerHTML = ""; } }, 320);
    if (!daStoria) history.back();
  }
  function apriVoce(id) {
    const v = VOCI[id]; if (!v) return;
    let h;
    if (v.tipo === "rifiuti") h = speciale(v) + fotoHTML(v.foto) + tr(v.corpo);
    else if (v.tipo === "silenzio") h = tr(v.corpo) + speciale(v);
    else h = fotoHTML(v.foto) + speciale(v) + tr(v.corpo);
    if (v.video) h += '<div class="video"><iframe src="' + v.video + '" title="' + esc(tr(v.titolo)) + '" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>';
    // il simulatore esiste in italiano e in inglese
    if (v.simulatore) h += '<div class="bottoni"><a class="btn btn--oro" href="termostato.html' + (L === "it" ? "" : "?lang=en") + '">' + ico("termometro") + '<b>' + esc(u("apri_simulatore")) + "</b></a></div>";
    const lv = v.luogo && LUOGHI[v.luogo];
    if (lv) h += bloccoLuogo(lv);
    apriScheda(tessera(v.icona, v._cat.colore), tr(v.titolo), h);
    if (lv) mappaPiccola(lv);
  }
  function urlPercorso(l) {
    return "https://www.google.com/maps/dir/?api=1&origin=" + CONTATTI.casa.lat + "," + CONTATTI.casa.lng +
      "&destination=" + encodeURIComponent(l.dest) + "&travelmode=" + (l.auto ? "driving" : "walking");
  }
  function apriLuogo(id) {
    const l = LUOGHI[id]; if (!l) return;
    let h = l.foto ? fotoHTML([l.foto]) : "";
    if (l.eolie) h += cartinaEolie();
    h += "<p>" + esc(tr(l.desc)) + "</p>" + bloccoLuogo(l);
    if (l.tel) h += '<div class="bottoni">' + l.tel.map((t, i) => '<a class="btn btn--chiaro" href="tel:' + t + '">' + ico("telefono") + '<b>' + (l.telNomi ? esc(l.telNomi[i]) + " · " : "") + fmtNum(t.replace(/^\+39/, "")) + "</b></a>").join("") + "</div>";
    if (l.turni) h += '<div class="bottoni"><a class="btn btn--chiaro" href="https://milazzo.comune.digital/farmacie-di-turno/c/0" target="_blank" rel="noopener">' + ico("farmacia") + '<b>' + esc(u("farmacie_turno")) + "</b></a></div>";
    if (l.tour) h += '<div class="bottoni"><a class="btn btn--chiaro" href="https://www.innovame.it/castellomilazzo/" target="_blank" rel="noopener">' + ico("castello") + '<b>' + esc(u("tour_virtuale")) + "</b></a></div>";
    apriScheda(tessera(l.icona || l._cat.icona, l._cat.colore), tr(l.nome), h);
    mappaPiccola(l);
    if (l.eolie) attivaEolie();
  }
  function apriLingue() {
    apriScheda(tessera("globo", "#14233c"), u("lingua"), '<div class="lingue">' + LINGUE.map(l =>
      '<button class="lingua' + (l.cod === L ? " attiva" : "") + '" data-lingua="' + l.cod + '"><span>' + l.bandiera + "</span>" + l.nome + "</button>").join("") +
      '</div><p class="piccolo" style="margin-top:16px">' + esc(u("installa")) + "</p>");
  }
  function cambiaLingua(c) {
    L = c;
    try { localStorage.setItem("attico_lingua", c); } catch (e) {}
    disegnaTutto();
    chiudiScheda();
  }

  /* ---------- Lettura ad alta voce ---------- */
  function fermaVoce() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $("#schedaAscolta").classList.remove("on");
    $("#schedaAscolta").innerHTML = ico("altoparlante");
  }
  function leggi() {
    if (!("speechSynthesis" in window)) return;
    if (speechSynthesis.speaking) { fermaVoce(); return; }
    const testo = $("#schedaTitolo").textContent + ". " + $("#schedaCorpo").innerText;
    const ut = new SpeechSynthesisUtterance(testo);
    ut.lang = infoLingua().voce; ut.rate = 0.95;
    ut.onend = fermaVoce;
    $("#schedaAscolta").classList.add("on");
    $("#schedaAscolta").innerHTML = ico("stop");
    speechSynthesis.speak(ut);
  }

  /* ---------- Navigazione tra le viste ---------- */
  const VISTE = ["home", "guida", "dintorni", "aiuto"];
  function vai(nome, scorri = true) {
    if (!VISTE.includes(nome)) nome = "home";
    $$(".vista").forEach(v => { v.hidden = v.dataset.vista !== nome; });
    $$(".tabbar button").forEach(b => b.classList.toggle("attiva", b.dataset.vai === nome));
    if (location.hash.slice(1) !== nome) history.replaceState(history.state, "", "#" + nome);
    if (scorri) window.scrollTo(0, 0);
    aggiornaBarra();
    if (nome === "dintorni") disegnaMappaGrande();   // la mappa va disegnata quando la pagina è visibile
  }
  function aggiornaBarra() {
    const home = !$("#v-home").hidden;
    $("#topbar").classList.toggle("solida", !home || window.scrollY > 260);
  }

  function disegnaTutto() {
    applicaUI(); aggiornaOggi(); guida(); dintorni(); numeri(); mostraMeteo();
    if (mappaG && !$("#v-dintorni").hidden) disegnaMappaGrande();
  }

  /* ---------- Eventi ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-apri],[data-vai],[data-luogo],[data-cat],[data-copia],[data-lingua],[data-filtro]");
    if (!t) return;
    if (t.dataset.filtro) { filtro = t.dataset.filtro; filtriMappa(); disegnaMappaGrande(); return; }
    if (t.dataset.vai) { e.preventDefault(); vai(t.dataset.vai); }
    else if (t.dataset.apri) apriVoce(t.dataset.apri);
    else if (t.dataset.luogo) apriLuogo(t.dataset.luogo);
    else if (t.dataset.lingua) cambiaLingua(t.dataset.lingua);
    else if (t.dataset.cat) { const s = $("#cat-" + t.dataset.cat); if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" }); }
    else if (t.dataset.copia) {
      const ok = () => { const x = $("#toast"); x.textContent = "✓ " + u("copiato"); x.hidden = false; clearTimeout(ok.t); ok.t = setTimeout(() => { x.hidden = true; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t.dataset.copia).then(ok, ok); else ok();
    }
  });
  $("#langBtn").addEventListener("click", apriLingue);
  $("#btnMangiare").addEventListener("click", apriMangiare);
  $("#schedaChiudi").addEventListener("click", () => chiudiScheda());
  $("#schedaAscolta").addEventListener("click", leggi);
  velo.addEventListener("click", () => chiudiScheda());
  document.addEventListener("keydown", e => { if (e.key === "Escape") chiudiScheda(); });
  window.addEventListener("popstate", () => { if (schedaAperta) chiudiScheda(true); });
  window.addEventListener("scroll", aggiornaBarra, { passive: true });
  $("#cerca").addEventListener("input", filtra);

  // trascinare giù la scheda per chiuderla (telefono)
  let y0 = null;
  $(".scheda__testa").addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
  $(".scheda__testa").addEventListener("touchend", e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) chiudiScheda(); y0 = null; });

  /* ---------- Avvio ---------- */
  riempiIcone();
  $("#schedaAscolta").innerHTML = ico("altoparlante");
  contatti();
  disegnaTutto();
  vai(location.hash.slice(1) || "home", false);
  caricaMeteo();
  setInterval(aggiornaOggi, 60000);
})();
