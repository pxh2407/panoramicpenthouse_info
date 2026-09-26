# Ripulisce le due foto dei contenitori usate nella FAQ rifiuti e nelle locandine.
# Gli originali vengono conservati con il suffisso "-originale".
import os
from PIL import Image, ImageEnhance, ImageFilter

IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")

def conserva(nome):
    """Tiene da parte l'originale, una volta sola."""
    base, est = os.path.splitext(nome)
    orig = os.path.join(IMG, base + "-originale" + est)
    if not os.path.exists(orig):
        Image.open(os.path.join(IMG, nome)).save(orig, quality=95)
        print("  originale conservato:", os.path.basename(orig))
    return orig

def lavora(nome, ritaglio, luce, contrasto, colore, nitidezza, sfocatura=0):
    """ritaglio = (sinistra, alto, destra, basso) in frazione dell'immagine."""
    orig = conserva(nome)
    im = Image.open(orig).convert("RGB")
    l, a, d, b = ritaglio
    im = im.crop((int(im.width * l), int(im.height * a),
                  int(im.width * (1 - d)), int(im.height * (1 - b))))
    if sfocatura:                       # attenua il rumore delle foto notturne
        im = im.filter(ImageFilter.GaussianBlur(sfocatura))
    im = ImageEnhance.Brightness(im).enhance(luce)
    im = ImageEnhance.Contrast(im).enhance(contrasto)
    im = ImageEnhance.Color(im).enhance(colore)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=int(nitidezza * 100), threshold=3))
    im.save(os.path.join(IMG, nome), quality=92, optimize=True)
    print(f"  {nome}: {im.width}x{im.height}")

print("Foto dei contenitori:")
# 1) i bidoni in casa: via il mobile bianco a destra e un po' di pavimento
lavora("Cassonetti.jpg", ritaglio=(0.01, 0.02, 0.045, 0.13),
       luce=1.10, contrasto=1.16, colore=1.10, nitidezza=0.55)

# 2) il cassonetto al garage: foto notturna, scura e mossa
lavora("Rifiuti Garage.jpg", ritaglio=(0.02, 0.03, 0.06, 0.06),
       luce=1.38, contrasto=1.26, colore=0.72, nitidezza=0.70, sfocatura=0.6)

print("Fatto.")
