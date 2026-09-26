# Locandine A4 "Raccolta differenziata rifiuti" — italiano e inglese.
# Rigenerate il 2026-09-26 col nuovo calendario (deposito, non raccolta).
# Da rilanciare ogni volta che cambia il calendario: python crea_locandine_rifiuti.py
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(BASE, "images")
W, H = A4

NAVY = (0.086, 0.212, 0.361)
ORO = (0.753, 0.588, 0.235)
CREMA = (0.933, 0.949, 0.969)
BIANCO = (1, 1, 1)
TESTO = (0.10, 0.10, 0.10)
BORDO = (0.80, 0.83, 0.87)
GIALLO_CHIARO = (0.996, 0.976, 0.898)

# pallini per tipo di rifiuto
MARRONE = (0.545, 0.353, 0.169)   # umido organico
GRIGIO = (0.478, 0.478, 0.478)    # indifferenziato
BLU = (0.122, 0.435, 0.710)       # carta
GIALLO = (0.941, 0.769, 0.098)    # plastica
VERDE = (0.180, 0.545, 0.341)     # vetro

# ---------- il calendario, unico punto da correggere ----------
GIORNI = [
    # (giorno IT, giorno EN, testo IT, testo EN, pallini)
    ("Domenica",  "Sunday",    "Umido organico",         "Organic waste",         [MARRONE]),
    ("Lunedì",    "Monday",    "Indifferenziato",        "Unsorted waste",        [GRIGIO]),
    ("Martedì",   "Tuesday",   "Carta e Cartone",        "Paper & Cardboard",     [BLU]),
    ("Mercoledì", "Wednesday", "Umido organico",         "Organic waste",         [MARRONE]),
    ("Giovedì",   "Thursday",  "Plastica",               "Plastic",               [GIALLO]),
    ("Venerdì",   "Friday",    "Umido organico e Vetro", "Organic waste & Glass", [MARRONE, VERDE]),
    ("Sabato",    "Saturday",  "Nessuna raccolta",       "No collection",         []),
]

TESTI = {
    "it": {
        "file": "Locandina Raccolta Differenziata IT.pdf",
        "titolo": "RACCOLTA DIFFERENZIATA RIFIUTI",
        "sottotitolo": "",
        "tabella": "CALENDARIO DEPOSITO RIFIUTI",
        "deposito": [
            ("Depositare i rifiuti a partire dalle ", 0), ("ore 20:00", 1), (",", 0)],
        "deposito2": [("nel cassonetto ", 0), ("a sinistra dell'ingresso del Garage", 1), (".", 0)],
        "importante_tit": "IMPORTANTE:",
        "importante": "Se al momento del check-out dovessero rimanere rifiuti destinati alla "
                      "raccolta dei giorni successivi, è possibile lasciarli all'interno dell'appartamento: "
                      "provvederemo noi al corretto conferimento. Vi chiediamo tuttavia di prestare la massima "
                      "attenzione nella differenziazione dei rifiuti, poiché la Polizia Municipale effettua "
                      "controlli periodici e può applicare sanzioni in caso di errato conferimento.",
        "dida1": "Le pattumiere nel balcone-veranda dell'appartamento",
        "dida2": "Il cassonetto all'ingresso del Garage",
        "giorno_idx": 0, "testo_idx": 2,
    },
    "en": {
        "file": "Locandina Raccolta Differenziata EN.pdf",
        "titolo": "WASTE SORTING & RECYCLING",
        "sottotitolo": "",
        "tabella": "WASTE DISPOSAL CALENDAR",
        "deposito": [
            ("Please deposit waste from ", 0), ("8:00 PM", 1), (" onwards, in the bin", 0)],
        "deposito2": [("located ", 0), ("to the left of the Garage entrance", 1), (".", 0)],
        "importante_tit": "IMPORTANT:",
        "importante": "If at the time of check-out there is waste scheduled for collection on "
                      "subsequent days, you may leave it inside the apartment — we will take care of proper "
                      "disposal. However, we kindly ask you to pay close attention to waste sorting, as the "
                      "Municipal Police conducts periodic checks and may impose fines for incorrect disposal.",
        "dida1": "The sorting bins on the balcony-veranda, inside the apartment",
        "dida2": "The bin at the Garage entrance",
        "giorno_idx": 1, "testo_idx": 3,
    },
}

def ritaglia(percorso, rapporto):
    """Ritaglia la foto al centro perché riempia il riquadro senza deformarsi."""
    from PIL import Image
    im = Image.open(percorso).convert("RGB")
    suo = im.width / im.height
    if suo > rapporto:                      # troppo larga: taglio ai lati
        nuova_l = int(im.height * rapporto)
        x = (im.width - nuova_l) // 2
        im = im.crop((x, 0, x + nuova_l, im.height))
    else:                                   # troppo alta: taglio sopra e sotto
        nuova_h = int(im.width / rapporto)
        y = (im.height - nuova_h) // 2
        im = im.crop((0, y, im.width, y + nuova_h))
    return im

def a_capo(c, testo, font, size, larghezza):
    c.setFont(font, size)
    righe, riga = [], ""
    for parola in testo.split():
        prova = (riga + " " + parola).strip()
        if c.stringWidth(prova, font, size) <= larghezza:
            riga = prova
        else:
            righe.append(riga); riga = parola
    if riga: righe.append(riga)
    return righe

def riga_mista(c, pezzi, x, y, size, colore=TESTO):
    """Scrive una riga con parti normali (0) e in grassetto (1)."""
    c.setFillColorRGB(*colore)
    for testo, grassetto in pezzi:
        f = "Helvetica-Bold" if grassetto else "Helvetica"
        c.setFont(f, size)
        c.drawString(x, y, testo)
        x += c.stringWidth(testo, f, size)

def locandina(lingua):
    t = TESTI[lingua]
    c = canvas.Canvas(os.path.join(BASE, t["file"]), pagesize=A4)
    c.setTitle(t["titolo"])
    M = 18 * mm
    LARG = W - 2 * M
    y = H - 16 * mm

    # ---- titolo ----
    c.setFillColorRGB(*NAVY)
    c.roundRect(M, y - 17 * mm, LARG, 17 * mm, 3, stroke=0, fill=1)
    c.setFillColorRGB(*ORO)
    c.setFont("Helvetica-Bold", 21)
    c.drawCentredString(W / 2, y - 11.6 * mm, t["titolo"])
    y -= 24 * mm

    # ---- sottotitolo (se c'è: tolto il 2026-09-26, la posizione dei bidoni
    #      è già scritta nel riquadro giallo più in basso) ----
    if t.get("sottotitolo"):
        c.setFillColorRGB(0.25, 0.28, 0.32)
        c.setFont("Helvetica-Oblique", 11.5)
        c.drawCentredString(W / 2, y, t["sottotitolo"])
        y -= 10 * mm
    else:
        y += 4 * mm

    # ---- tabella ----
    c.setFillColorRGB(*NAVY)
    c.rect(M, y - 9 * mm, LARG, 9 * mm, stroke=0, fill=1)
    c.setFillColorRGB(*ORO)
    c.setFont("Helvetica-Bold", 12.5)
    c.drawCentredString(W / 2, y - 6.3 * mm, t["tabella"])
    y -= 9 * mm

    ALT = 9.6 * mm
    for i, g in enumerate(GIORNI):
        giorno = g[t["giorno_idx"]]
        testo = g[t["testo_idx"]]
        pallini = g[4]
        c.setFillColorRGB(*(CREMA if i % 2 else BIANCO))
        c.rect(M, y - ALT, LARG, ALT, stroke=0, fill=1)
        c.setStrokeColorRGB(*BORDO); c.setLineWidth(0.5)
        c.line(M, y - ALT, M + LARG, y - ALT)

        c.setFillColorRGB(*NAVY)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(M + 6 * mm, y - 6.4 * mm, giorno)

        x = M + 62 * mm
        for col in pallini:
            c.setFillColorRGB(*col)
            c.circle(x + 1.6 * mm, y - 5.3 * mm, 1.7 * mm, stroke=0, fill=1)
            x += 5.4 * mm
        c.setFillColorRGB(*(TESTO if pallini else (0.35, 0.35, 0.35)))
        c.setFont("Helvetica" if pallini else "Helvetica-Oblique", 11)
        c.drawString(x + 1 * mm, y - 6.4 * mm, testo)
        y -= ALT

    c.setStrokeColorRGB(*BORDO); c.setLineWidth(0.8)
    c.rect(M, y, LARG, 9 * mm + ALT * len(GIORNI), stroke=1, fill=0)
    y -= 9 * mm

    # ---- riquadro "quando depositare" ----
    c.setFillColorRGB(*GIALLO_CHIARO); c.setStrokeColorRGB(*ORO); c.setLineWidth(0.9)
    c.roundRect(M, y - 16 * mm, LARG, 16 * mm, 2, stroke=1, fill=1)
    riga_mista(c, t["deposito"], M + 5 * mm, y - 6.5 * mm, 10.5)
    riga_mista(c, t["deposito2"], M + 5 * mm, y - 12 * mm, 10.5)
    y -= 22 * mm

    # ---- riquadro IMPORTANTE ----
    righe = a_capo(c, t["importante"], "Helvetica", 9.6, LARG - 10 * mm - 22 * mm)
    alt = (len(righe) + 1) * 4.6 * mm + 3 * mm
    c.setFillColorRGB(*NAVY)
    c.roundRect(M, y - alt, LARG, alt, 2, stroke=0, fill=1)
    c.setFillColorRGB(*ORO); c.setFont("Helvetica-Bold", 9.8)
    c.drawString(M + 5 * mm, y - 6 * mm, t["importante_tit"])
    dx = c.stringWidth(t["importante_tit"], "Helvetica-Bold", 9.8) + 2 * mm
    c.setFillColorRGB(1, 1, 1); c.setFont("Helvetica", 9.6)
    prima = a_capo(c, t["importante"], "Helvetica", 9.6, LARG - 10 * mm - dx)[0]
    c.drawString(M + 5 * mm + dx, y - 6 * mm, prima)
    resto = t["importante"][len(prima):].strip()
    for k, r in enumerate(a_capo(c, resto, "Helvetica", 9.6, LARG - 10 * mm)):
        c.drawString(M + 5 * mm, y - 6 * mm - (k + 1) * 4.6 * mm, r)
    y -= alt + 8 * mm

    # ---- due foto ----
    larg_f = (LARG - 6 * mm) / 2
    alt_f = 54 * mm
    for k, (nome, dida) in enumerate([("Cassonetti.jpg", t["dida1"]),
                                      ("Rifiuti Garage.jpg", t["dida2"])]):
        x = M + k * (larg_f + 6 * mm)
        p = os.path.join(IMG, nome)
        if os.path.exists(p):
            # ritaglio al centro per riempire il riquadro, senza bande bianche
            c.drawImage(ImageReader(ritaglia(p, larg_f / alt_f)), x, y - alt_f, larg_f, alt_f,
                        preserveAspectRatio=False, mask='auto')
            c.setStrokeColorRGB(*BORDO); c.setLineWidth(0.7)
            c.rect(x, y - alt_f, larg_f, alt_f, stroke=1, fill=0)
        c.setFillColorRGB(0.35, 0.38, 0.42); c.setFont("Helvetica-Oblique", 8.6)
        c.drawCentredString(x + larg_f / 2, y - alt_f - 5 * mm, dida)

    c.showPage(); c.save()
    print("Creata:", t["file"])

for lingua in ("it", "en"):
    locandina(lingua)
