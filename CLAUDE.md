# Attico Panoramico — Guida ospiti (app per il telefono)

App web statica per gli ospiti dell'Attico Panoramico di Milazzo, consultata **solo da cellulare** durante il soggiorno.
**Online:** https://pxh2407.github.io/panoramicpenthouse_info/ — questo indirizzo è stampato sui **QR code nella casa: NON cambiarlo mai**.

## Storia
- Dal **2026-10-06** a questo indirizzo c'è la **nuova app** (rifatta il 2026-10-05, prima provata a parte in `CLAUDE\ATTICO OSPITI NUOVA APP`, cartella ora superata).
- La **vecchia app** è salvata: cartella `CLAUDE\ATTICO PER INTERNO - BACKUP vecchia app 2026-10-06` + segnalibro git `vecchia-app-2026-10-06` (per ripristinarla: `git checkout vecchia-app-2026-10-06 -- index.html app.js style.css termostato.html`).

## File
- `testi.js` — **TUTTI i contenuti**, in 5 lingue (it/en/de/fr/es): etichette (UI), calendario rifiuti, guida della casa, chiavi, dintorni, cose da fare, numeri. Per correggere un testo si tocca solo qui, in tutte e 5 le lingue.
- `app.js` — solo il funzionamento (disegna le pagine da testi.js).
- `index.html`, `style.css`, `manifest.json`, `termostato.html` (simulatore, it/en con `?lang=en`, pulsante dorato "←"), `images/`.
- Cache busting `?v=N` in index.html: incrementarlo a ogni modifica.
- `fete-saint-etienne.html` — pagina a sé (in francese) sulla Festa di Saint-Étienne 2026, non collegata all'app; si condivide direttamente: https://pxh2407.github.io/panoramicpenthouse_info/fete-saint-etienne.html
- `Locandina Raccolta Differenziata IT/EN.pdf` — si rigenerano con `python crea_locandine_rifiuti.py` (lista `GIORNI` in cima allo script).
- In `images/` ci sono anche foto della vecchia app non più usate: lasciate apposta (non danno fastidio).

## Funzioni
- 4 schede in basso: Home · La casa · Dintorni · Aiuto; i dettagli si aprono in una "scheda" che sale dal basso.
- Home: meteo dal vivo (Open-Meteo, senza chiave), riquadro "Oggi" (rifiuti di stasera + fascia di silenzio calcolati dall'ora), pulsanti rapidi, regole della casa, contatti.
- Lingua automatica dal telefono, ricordata; ricerca nella guida; lettura ad alta voce; copia password WiFi.
- Aiuto: accanto a ogni numero utile c'è la cornetta 📞 (`.numero__tel`, 2026-10-06).
- Pulsante rapido "Mangiare" (`#btnMangiare`): scheda con SOLO ristoranti e bar (prima categoria di DINTORNI).

## Dati aggiornati
- Pulizia professionale **€ 70 a intervento** (2026-07-18).
- Calendario rifiuti (2026-09-26): Dom umido · Lun indifferenziato · Mar carta · Mer umido · Gio plastica · Ven umido e vetro · Sab nessuna raccolta. Sta in `RIFIUTI_CALENDARIO` in testi.js (indice 0 = domenica). ⚠️ Se cambia, aggiornare SIA testi.js SIA le locandine PDF.

## Contatti con l'host: SOLO messaggi
- Nessun pulsante "Chiama" verso l'host (ospiti quasi tutti stranieri, l'utente preferisce scrivere): solo WhatsApp. Restano chiamabili i numeri dei ristoranti, della Guardia medica e delle emergenze.

## Mappe
- Leaflet 1.9.4 da cdnjs + tessere **OpenStreetMap standard**. ⚠️ CARTO ora chiede una API key: non usarlo.
- Aprendo index.html con doppio clic dal PC le mappe NON si vedono (OSM vuole un sito di provenienza): normale, online funzionano.
- In `app.js` la variabile `L` è la LINGUA: Leaflet si usa come `LF = window.L`.
- Ogni luogo ha `pos: [lat, lng]`; distanza/tempo a piedi stimati (linea d'aria × 1,3, ~4,5 km/h). Dintorni: mappa generale con filtri; scheda di ogni luogo: mappa piccola casa→luogo + pulsante Google Maps.
- Foto dei luoghi solo se vere (Conad, colonnina EV, Castello, Piscina di Venere): le vecchie schermate di percorsi Google non si usano.

## Solo telefono
- Foto sempre a tutta larghezza, una sotto l'altra, mai tagliate (`.foto-in`, `object-fit: contain`); niente gallerie a scorrimento laterale.
- Dove una scheda ha più foto, ognuna sta DENTRO il testo (in `corpo`, 5 lingue) sopra la frase che descrive: rifiuti, luce veranda, videoproiettore.
- Luce veranda: `Luce-Veranda1.jpg` = cucina ("VERANDA LIGHT SWITCH"), `Luci-Veranda2.jpg` = bagno (accanto a "ACQUA CALDA").
- Chiavi: `images/Chiavi.jpg` con numeri 1-6 in tondi blu grandi; nell'elenco numeri in tondi blu.

## Tolto su richiesta (non rimettere)
- Recensioni, lettera di benvenuto, sezione "Tornate a trovarci / Disponibilità" (2026-10-05).
- Numeri utili: gruppo "Uffici pubblici" (Comune, URP, INPS, ecc.) tolto il 2026-10-06. Restano Emergenze, Salute, Sicurezza e strada. Anteprima link senza immagine (niente og:image).

## Anteprima e pubblicazione
- Anteprima locale: configurazione `attico-per-interno` in `CLAUDE\.claude\launch.json`.
- Repo https://github.com/pxh2407/panoramicpenthouse_info — branch locale `master` → remoto `main`: `git push origin master:main`.
- Dopo ogni modifica: aggiornare questo file, incrementare `?v=N` e fare push senza attendere richiesta.
- GitHub Pages a volte resta in coda o fallisce (guasti di GitHub Actions): controllare con l'API `actions/runs` e, se fallito, `POST pages/builds` (token da `git credential fill`; `gh` non è installato).
