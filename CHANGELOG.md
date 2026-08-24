# Changelog — bingo-2.0

Alle noemenswaardige aanpassingen aan dit project staan hieronder, meest recente versie bovenaan.

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
