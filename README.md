# Spieleliste – Webansicht (Vanilla / GitHub Pages)

## Features
- XLSX wird lokal im Browser geladen (kein Upload, keine Server).
- XLSX-Library: zuerst lokal `lib/xlsx.full.min.js`, sonst CDN-Fallback.
- Kartenansicht: Suche, Sortierung, Filter, Infinite Scroll.
- Bottom-Sheet Menü (mobil stabil: Backdrop, Schließen, ESC).
- Trophy-Parsing korrekt inkl. **No-Platinum-Title** (kein Platinum-False-Positive).

## Ordnerstruktur
- index.html
- styles.css
- app.js
- lib/xlsx.full.min.js

## XLSX Library besorgen (falls du sie nicht im Repo hast)
Lege die Datei hier ab: `lib/xlsx.full.min.js`

Download-Quelle (als Code, falls dein Chat URLs nicht klickbar macht):
`https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`

## GitHub Pages
Repo erstellen → Dateien ins Root → Settings → Pages → Deploy from branch → main / root.