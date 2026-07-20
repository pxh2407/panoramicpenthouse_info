# Attico Panoramico — App informazioni per gli ospiti

App web statica con le informazioni per gli ospiti dell'Attico Panoramico di Milazzo (uso interno, consultata dagli ospiti durante il soggiorno).

## Struttura

- `index.html` — pagina unica con tutti i contenuti in italiano; le FAQ sono card a comparsa organizzate per categorie (menu "Domande frequenti")
- `app.js` — traduzioni complete in 4 lingue tramite attributi `data-i18n`: inglese (~riga 350), tedesco (~riga 620), francese (~riga 890), spagnolo (~riga 1160)
- `images/` — foto dell'appartamento, dintorni, servizi
- Non usa cache busting (`?v=`): le modifiche sono visibili al semplice ricaricamento

## Regole per le modifiche

- Ogni modifica ai testi va replicata in **5 lingue**: italiano in `index.html` + EN/DE/FR/ES in `app.js` (chiavi `data-i18n` uguali)
- In `app.js` i caratteri speciali sono in escape `\uXXXX` (es. `€` per €)
- Stile: elegante blu/oro, testo grande, alta leggibilità

## Icone e condivisione link

- Favicon: `images/icon-192.png` + `images/apple-touch-icon.png` (generate dal logo `images/Attico.jpg` il 2026-07-20)
- Meta tag Open Graph nell'head di `index.html`: l'anteprima del link (WhatsApp ecc.) mostra il logo ATTICO
- Sito online: https://pxh2407.github.io/panoramicpenthouse_info/

## Dati aggiornati

- Servizio pulizia professionale: **€ 70 a intervento** (aggiornato il 2026-07-18)
- Raccolta differenziata: calendario in FAQ "Raccolta Differenziata Rifiuti"; locandine A4 stampabili `Locandina Raccolta Differenziata IT.pdf` / `EN.pdf` (generate il 2026-07-18)

## Git / GitHub

- Repo: https://github.com/pxh2407/panoramicpenthouse_info
- Branch locale `master` → remoto `main`: push con `git push origin master:main`
- Dopo ogni modifica: aggiornare questo CLAUDE.md e fare push senza attendere richiesta
