# Crea images/copertina.jpg (1200x630): l'immagine che appare quando si condivide il link dell'app
# (WhatsApp, Messenger, e-mail...). Per rifarla: python crea_copertina.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
CARTELLA = r"C:\Users\Filippo\Desktop\CLAUDE\ATTICO PER INTERNO\images"
F = r"C:\Windows\Fonts"
BLU = (20, 35, 60)
ORO = (192, 150, 60)
CREMA = (240, 215, 156)

# Sfondo: foto del Castello, riempie tutto
foto = Image.open(CARTELLA + r"\Castello.webp").convert("RGB")
s = max(W / foto.width, H / foto.height)
foto = foto.resize((round(foto.width * s), round(foto.height * s)), Image.LANCZOS)
x0 = foto.width - W                      # tiene la parte destra (castello e sole)
y0 = (foto.height - H) // 2
img = foto.crop((x0, y0, x0 + W, y0 + H))

# Velatura blu: piena a sinistra, sfuma verso destra
velo = Image.new("RGBA", (W, H))
pv = velo.load()
for x in range(W):
    a = 238 if x < 560 else max(0, int(238 - (x - 560) * 0.42))
    for y in range(H):
        pv[x, y] = (*BLU, a)
img = Image.alpha_composite(img.convert("RGBA"), velo)
d = ImageDraw.Draw(img)

# Logo rotondo con cornice oro
logo = Image.open(CARTELLA + r"\Attico.jpg").convert("RGB")
l = logo.width
logo = logo.crop((int(l * .12), int(l * .12), int(l * .88), int(l * .88))).resize((150, 150), Image.LANCZOS)
maschera = Image.new("L", (150, 150), 0)
ImageDraw.Draw(maschera).ellipse((0, 0, 149, 149), fill=255)
LX, LY = 70, 62
ombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(ombra).ellipse((LX - 4, LY + 4, LX + 164, LY + 172), fill=(0, 0, 0, 110))
img = Image.alpha_composite(img, ombra.filter(ImageFilter.GaussianBlur(8)))
d = ImageDraw.Draw(img)
d.ellipse((LX - 7, LY - 7, LX + 157, LY + 157), fill=ORO)
img.paste(logo, (LX, LY), maschera)

# Testi
f_luogo = ImageFont.truetype(F + r"\segoeuib.ttf", 22)
f_titolo = ImageFont.truetype(F + r"\georgiab.ttf", 70)
f_it = ImageFont.truetype(F + r"\georgiai.ttf", 33)
f_en = ImageFont.truetype(F + r"\segoeuil.ttf", 28)

def spaziato(x, y, testo, font, colore, passo):
    for c in testo:
        d.text((x, y), c, font=font, fill=colore)
        x += d.textlength(c, font=font) + passo

spaziato(72, 262, "MILAZZO · SICILIA", f_luogo, CREMA, 5)
d.text((68, 296), "Panoramic", font=f_titolo, fill="white")
d.text((68, 372), "Penthouse", font=f_titolo, fill="white")
d.rectangle((72, 470, 172, 473), fill=ORO)
d.text((72, 492), "Regole della casa e informazioni utili per gli ospiti", font=f_it, fill=CREMA)
d.text((72, 542), "House rules & useful information for guests", font=f_en, fill=(255, 255, 255))

img.convert("RGB").save(CARTELLA + r"\copertina.jpg", quality=88, optimize=True, progressive=True)
print("creata images/copertina.jpg")
