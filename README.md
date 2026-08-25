# Bingo 2.0

Digitale bingotrekker met kaartgenerator en QR-check. Ondersteunt 4 officiële bingo-varianten:

| Variant | Kaart | Nummers | Winnen met |
|---|---|---|---|
| **90-bal — Klassiek Europees** (default) | 3x9 | 15 (+ 12 leeg) | 1 lijn, 2 lijnen, volle kaart |
| 75-bal — Amerikaans (BINGO) | 5x5 | 24 + gratis vakje | lijn (rij/kolom/diagonaal), volle kaart |
| 80-bal — Shutter | 4x4 | 16 | lijn, volle kaart |
| 30-bal — Speed | 3x3 | 9 | alleen volle kaart |

Bij 90-bal dekken de 6 kaarten op 1 A4-vel samen precies 1-90 (klassieke Britse/Europese "strip"). Bij de andere 3 varianten is elke kaart onafhankelijk willekeurig, zoals in een echte bingohal.

- `index.html` — de trekker (nummers trekken/tonen, variant kiezen)
- `cards.html` — bingokaarten genereren en printen (variant kiezen, 1 vel = volledig gevuld met kaarten)
- `scan.html` — kaart scannen/checken via QR-code, los van de trekker
- `bingo-common.js` — gedeelde logica (variant-definities, kaartgeneratie, codes, winst-check)
- `vendor-qrcode.min.js`, `vendor-jsqr.min.js` — self-hosted QR-bibliotheken (geen externe CDN-afhankelijkheid)

## Versiebeheer

Aanpassingen en versiegeschiedenis staan in [`CHANGELOG.md`](./CHANGELOG.md). Wil je iets aanpassen aan een specifieke versie, verwijs dan gewoon naar het versienummer (bv. "pas versie 1.4 aan zodat...") — dan is geen verdere uitleg nodig over wat die versie doet.
