# Changelog — bingo-2.0

Alle noemenswaardige aanpassingen aan dit project staan hieronder, meest recente versie bovenaan.

## v2.0 — 2026-08-25
### Nieuw: 4 officiële bingo-varianten
De kaartgenerator vraagt niet langer om een handmatig getallenbereik, maar laat kiezen uit 4 officiële bingo-varianten (default: 90-bal Klassiek Europees). De trekker en checker bewegen automatisch mee met de gekozen variant.

- **90-bal — Klassiek Europees** (default, ongewijzigd): 3x9 kaart, 15 nummers, kolommen = tientallen. 1 A4-vel = 6 kaarten die samen exact 1-90 dekken. Winnen met 1 lijn, 2 lijnen of volle kaart.
- **75-bal — Amerikaans (BINGO)**: 5x5 kaart, 24 nummers + gratis middenvakje, kolommen B-I-N-G-O (1-15/16-30/31-45/46-60/61-75). Winnen met een lijn (rij, kolom of diagonaal) of volle kaart (blackout). 4 kaarten per A4.
- **80-bal — Shutter**: 4x4 kaart, 16 nummers, kolommen 1-20/21-40/41-60/61-80 in eigen kleur. Winnen met een lijn of volle kaart. 6 kaarten per A4.
- **30-bal — Speed**: 3x3 kaart, 9 nummers (1-10/11-20/21-30), geen lege vakjes. Alleen te winnen met een volle kaart. 9 kaarten per A4.

### Wat er onder de motorkap veranderde
- `bingo-common.js`: nieuwe `BINGO_VARIANTS`-tabel met alle regels per variant; generieke kaartgeneratie (`generateRandomCard`/`generateCardsForVariant`) naast de bestaande 90-bal-strip-logica (ongewijzigd, blijft de enige variant waarbij kaarten op 1 vel samen het hele bereik dekken); generieke winst-check (`checkCardAgainstDrawn`) met rijen/kolommen/diagonalen afhankelijk van de variant; gedeelde `renderCheckResultHTML` zodat `index.html` en `scan.html` niet langer eigen (verouderde, 90-bal-only) kopieën van die logica hadden.
- QR-codes en intypbare codes zijn nu variant-bewust (`CARD2:<variant>:...` resp. `US75-...`/`UK80-...`/`SPEED30-...`), maar blijven volledig achterwaarts compatibel: kaarten die vóór deze versie zijn afgedrukt (oude `CARD:`-QR en code zonder prefix) worden nog steeds correct herkend als 90-bal.
- `cards.html`: variantkeuze bovenaan; bij 90-bal blijft "aantal A4-vellen" de invoer, bij de andere 3 varianten wordt dat "aantal kaarten" (altijd volle A4-vellen per pagina).
- `index.html`: het handmatige "hoogste nummer"-veld is vervangen door dezelfde 4 variantknoppen; de trekker trekt nu automatisch uit het juiste bereik (30/75/80/90) en de check-modal toont per variant het juiste kaartformaat (incl. BINGO-letters en gratis vakje voor 75-bal).

### Fix (kwam boven drijven tijdens dit werk)
- Op `cards.html` verscheen bij printen/PDF-export ongewenst een stuk van de pagina (topbalk, titel, invoerpaneel) boven de eerste kaart, en de pagina-einde per A4-vel werkte niet betrouwbaar. Opgelost: alleen de daadwerkelijke afdrukpagina's zijn nu zichtbaar bij printen (`@media print` verbergt nu ook de topbalk/titel/paneel, niet alleen de knoppenbalk), en `break-after: page` is toegevoegd naast `page-break-after` voor betrouwbaardere paginering.

---

## v1.5 — 2026-08-25
### Fix
- Zelfde probleem als v1.4, maar dan in `index.html` en `scan.html`: de Trekking-QR (in de "Kaart checken"-modal) bleef een leeg wit vlak tonen, en het scannen via de camera kon stuk gaan, omdat `qrcode` en `jsQR` daar nog via externe CDN's (`cdn.jsdelivr.net`, `cdnjs.cloudflare.com`) werden geladen.
- **Oplossing:** `jsQR` is nu ook self-hosted als `vendor-jsqr.min.js`. Alle drie de pagina's (`index.html`, `cards.html`, `scan.html`) gebruiken nu uitsluitend lokale, self-hosted QR-bibliotheken — geen enkele externe netwerkafhankelijkheid meer voor QR-functionaliteit.

### Gewijzigde bestanden
- `index.html` — CDN-`<script>`-tags voor `jsQR` en `qrcode` vervangen door lokale `vendor-jsqr.min.js` en `vendor-qrcode.min.js`.
- `scan.html` — CDN-`<script>`-tag voor `jsQR` vervangen door lokale `vendor-jsqr.min.js`.
- `vendor-jsqr.min.js` — nieuw, self-hosted `jsQR@1.4.0` (kant-en-klare UMD-build van npm).

---

## v1.4 — 2026-08-24
### Fix
- **Kaartgeneratie werkte niet meer.** De vorige versie laadde de QR-codebibliotheek (`qrcode@1.5.4`) via het externe CDN `cdn.jsdelivr.net`. Zodra die laadopdracht faalde (netwerkblokkade, adblocker, offline gebruik, trage verbinding), gaf de browser de fout `QRCode is not defined`. Omdat deze fout niet werd opgevangen, brak het hele generatieproces af — er verschenen geen kaarten en er kwam geen foutmelding op het scherm.
- **Oplossing:** de QR-bibliotheek wordt niet langer extern geladen, maar is gebundeld en lokaal opgeslagen in `vendor-qrcode.min.js`. Kaartgeneratie werkt hierdoor altijd, ook zonder internetverbinding of bij netwerken die externe CDN's blokkeren.
- Extra vangnet toegevoegd: als het genereren van kaarten om een andere reden zou mislukken, verschijnt er nu een duidelijke foutmelding in plaats van een stille, lege pagina.

### Gewijzigde bestanden
- `cards.html` — CDN-`<script>`-tag vervangen door lokale `vendor-qrcode.min.js`; try/catch toegevoegd rond `generateBtn.onclick`.
- `vendor-qrcode.min.js` — nieuw, self-hosted gebundelde versie van `qrcode@1.5.4` (via esbuild), zodat er geen externe afhankelijkheid meer is.

---

## v1.3 — 2026-08-24
### Aanpassing
- Betrouwbare QR-lib + groen/rood hit-visualisatie na check (introduceerde per ongeluk de bug die in v1.4 is opgelost).

## v1.2 — 2026-08-24
### Aanpassing
- Echte 90-bal strip: 6 kaarten dekken samen 1-90, echte kolommen, QR op leeg vakje, intypbare code.

## v1.1 — 2026-08-23
### Fix
- Bingokaart-raster overflowde op sommige Android-toestellen.
### Toegevoegd
- Nummers markeren op digitale kaart (stempel), onthouden via `localStorage`.

## v1.0 — 2026-08-23
### Initieel
- Eerste versie: trekker + kaarten + check.
