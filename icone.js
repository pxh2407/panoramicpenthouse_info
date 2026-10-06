/* =====================================================================
   ATTICO PANORAMICO — Icone disegnate (al posto delle emoji)
   Ogni icona è un disegno a linee 24×24; si usa bianca dentro un riquadro
   colorato (classe .it) oppure da sola (classe .ico).
   Per aggiungerne una: nuova voce qui sotto, poi il nome in testi.js.
   ===================================================================== */
const ICONE = {
  // --- casa e guida ---
  casa: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  divano: '<path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M3 12.5a2 2 0 0 1 4 0V14h10v-1.5a2 2 0 0 1 4 0V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M6 18v2M18 18v2"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none"/>',
  chiave: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8 20 3M16.5 6.5l3 3M14 9l2.2 2.2"/>',
  ricevuta: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  parcheggio: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  presa: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>',
  termometro: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 10v6.5"/>',
  fiocco: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9.5 4.5 2.5 2.5 2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
  finestra: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  doccia: '<path d="M5 21V6a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1"/><path d="M10 8h7"/><path d="M11.5 12v1M14.5 12v1M17.5 12v1M13 15.5v1M16 15.5v1"/>',
  fulmine: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  fiamma: '<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.3 2.3-5.3 3.5-8.3.6 1.7 1.8 2.8 3 3.3.2-2.6 1.3-5 3-6.8.3 3.2 3.5 5.5 3.5 10.3 0 4.4-2.5 7.7-6.5 7.7z"/>',
  lavastoviglie: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16"/><circle cx="12" cy="14.5" r="3.5"/><path d="M7.5 5.5h.01M10.5 5.5h.01"/>',
  lampadina: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  batteria: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10.5v3"/><path d="m11.5 9.5-2 2.5h3l-2 2.5"/>',
  proiettore: '<rect x="3" y="8" width="18" height="9" rx="2"/><circle cx="15.5" cy="12.5" r="2.5"/><path d="M6.5 11h4M6 20l1.5-3M18 20l-1.5-3"/>',
  bidone: '<path d="M4 7h16M10 7V4h4v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  letto: '<path d="M3 18V7M21 18v-4a3 3 0 0 0-3-3h-7v4"/><path d="M3 14h18"/><circle cx="7" cy="11" r="1.8"/>',
  maglietta: '<path d="M8.5 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4.5-3a3.5 3.5 0 0 1-7 0z"/>',
  pioggia: '<path d="M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a3.5 3.5 0 0 1 0 7z"/><path d="m8 18-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
  pianta: '<path d="M7 14h10l-1.5 7h-7z"/><path d="M12 14V8"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 11.5c0-2.5-1.7-4-4.5-4 0 2.5 1.7 4 4.5 4z"/>',
  estintore: '<path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M12 8V5M10 5h4.5L18 3M9 12h6"/>',
  soccorso: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M12 10.5v6M9 13.5h6"/>',
  allarme: '<circle cx="12" cy="13" r="6"/><circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M4.5 6.5a11 11 0 0 1 3-3M19.5 6.5a11 11 0 0 0-3-3"/>',
  telecomando: '<rect x="8" y="2" width="8" height="20" rx="3"/><circle cx="12" cy="7" r="1.6"/><path d="M10.5 12h3M10.5 15h3M10.5 18h3"/>',
  // --- rifiuti ---
  foglia: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="m5 19 8-8"/>',
  scatola: '<path d="m3 8 9-4 9 4v9l-9 4-9-4z"/><path d="m3 8 9 4 9-4M12 12v9"/>',
  bottiglia: '<path d="M10 2h4v3l1.5 2.5V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V7.5L10 5z"/><path d="M8.5 11h7"/>',
  // --- dintorni ---
  posate: '<path d="M6 3v6a3 3 0 0 0 6 0V3M9 3v18"/><path d="M17 21V3c-2 1.5-3 4-3 8h3"/>',
  pizza: '<path d="M12 21 3.5 6a14 14 0 0 1 17 0z"/><path d="M5.5 9.5a11 11 0 0 1 13 0"/><circle cx="10.5" cy="12" r=".9"/><circle cx="13.5" cy="15.5" r=".9"/>',
  pesce: '<path d="M2 12c2.5-4 7-6 11-4.5 2 .8 3.5 2.3 4.5 4.5-1 2.2-2.5 3.7-4.5 4.5C9 18 4.5 16 2 12z"/><path d="M17.5 12 22 8v8z"/><circle cx="7" cy="11" r="1" fill="currentColor" stroke="none"/>',
  dolce: '<path d="M4 20h16v-7H4z"/><path d="M4 15.5c2 1.5 4 1.5 6 0s4-1.5 6 0 2.6 1 4 0"/><path d="M12 13V9M12 6.2v.01"/>',
  tazza: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3"/>',
  carrello: '<path d="M3 4h2.5l2.2 11h10.5l2-8H6.3"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
  farmacia: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  medico: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  borsa: '<path d="M5 8h14l-1 13H6z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
  ombrellone: '<path d="M12 4a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 13v8M8 21h8"/>',
  onde: '<path d="M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
  nave: '<path d="M3 15h18l-2.5 5h-13z"/><path d="M6 15V9h12v6M10 9V5h4v4"/><path d="M9 12h.01M12 12h.01M15 12h.01"/>',
  castello: '<path d="M3 21V9h3v2h3V9h6v2h3V9h3v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4M12 9V3l4 1.5L12 6"/>',
  maresole: '<circle cx="12" cy="9" r="3.5"/><path d="M12 2.5V4M5.8 4.8l1 1M18.2 4.8l-1 1M3.5 10H5M19 10h1.5"/><path d="M3 16c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5 2 .8 3 1.2M3 20.5c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5 2 .8 3 1.2"/>',
  // --- comandi ---
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  cerca: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  altoparlante: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  navigazione: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  piedi: '<circle cx="13" cy="4" r="1.8"/><path d="m9.5 21 2-6 2.5 2.5V21M10.5 11.5l1.3-4.2 3 2.2 2.7 1M11.8 7.3 9 9.3l-1.2 3"/>',
  auto: '<path d="M4 16v-4l2.5-5h11l2.5 5v4z"/><path d="M4 16v3h3v-3M17 16v3h3v-3M7.5 12.5h.01M16.5 12.5h.01"/>',
  esterno: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  salvagente: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.8"/><path d="m6 6 3.3 3.3M18 6l-3.3 3.3M6 18l3.3-3.3M18 18l-3.3-3.3"/>',
  segnaposto: '<path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
  // --- meteo ---
  sole: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  solenuvola: '<path d="M8 3v1.5M3.5 8H2M4.5 4.5l1 1M12 6.2A4 4 0 0 0 5 9"/><path d="M8 20a3.5 3.5 0 0 1-.4-7A5 5 0 0 1 17 12.5a3.3 3.3 0 0 1-.3 7.5z"/>',
  nuvola: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.2 4.2 0 0 1-.5 8.5z"/>',
  nebbia: '<path d="M4 8h16M3 12h18M5 16h14M8 20h8"/>',
  neve: '<path d="M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a3.5 3.5 0 0 1 0 7z"/><path d="M8 19h.01M12 18h.01M16 19h.01M10 21.5h.01M14 21.5h.01"/>',
  temporale: '<path d="M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a3.5 3.5 0 0 1 0 7"/><path d="m13 12-3 5h4l-2 4"/>'
};

/* Logo ufficiale di WhatsApp (pieno) */
const ICONA_WHATSAPP = '<svg class="ico ico--pieno" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

/* Disegno da solo (colore del testo) */
function ico(nome, classe) {
  if (nome === "whatsapp") return ICONA_WHATSAPP;
  return '<svg class="ico' + (classe ? " " + classe : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONE[nome] || ICONE.segnaposto) + "</svg>";
}
/* Disegno bianco dentro un riquadro colorato */
function tessera(nome, colore, classe) {
  return '<span class="it' + (classe ? " " + classe : "") + '" style="--c:' + colore + '">' + ico(nome) + "</span>";
}
