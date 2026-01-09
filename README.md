# Spieleliste – Build V7_1j63a

Dieses Build ergänzt das **Kartenmodus-Feature** (Mini / Kompakt / Detail) als **reinen Darstellungsmodus**.

## Änderungen in V7_1j63a (gegenüber V7_1j62u)

### Kartenmodi (globaler Zustand)
- Neuer globaler Darstellungszustand: `data-cardview="mini|compact|detail"` (am `<body>`).
- **Default: Detail**.
- Persistenz via `localStorage` (`spieleliste_cardView`).

### Sichtbarkeit gemäß Spezifikation
- **Immer sichtbar (alle Modi):** ID, Titel, Favoritenstern (nur Anzeige), Plattform-Badges, Quelle/Verfügbarkeit.
- **Kompakt & Detail:** Spielstatus-Badges + kompletter Info-Block (Genre, Subgenre, Entwickler, Spielzeit, Metascore, Userwertung).
- **Nur Detail:** Akkordeons (Beschreibung, Store, Trophäen, Humorstatistik, Eastereggs).
- **Mini:** Genre als 1-zeilige Zeile unter dem Titel (Ellipsis), keine Spielstatus-Badges, keine Akkordeons.

### Interaktion (Mini & Kompakt)
- **Best of both:** Tap/Klick auf den **Headerbereich** toggelt offen/zu.
- Subtiles **Chevron (▾/▴)** als Hinweis (ebenfalls klickbar).
- Kartenkörper bleibt inert (keine globale Tap-Zone außerhalb des Headers).
- Detail bleibt unverändert (keine globale Tap-Interaktion; Akkordeons wie bisher).

### Layout / Spalten
- Mini/Kompakt nutzen ein Grid-Layout:
  - **Mini:** ab breiterem Viewport 2 Spalten.
  - **Kompakt:** ab Desktop/Tablet 2 Spalten.

## Nicht geändert
- Datenmodell / Excel-Import (Excel bleibt Source of Truth).
- Filter/Suche/Sortierung/Markierungen/Textgröße – Zustände bleiben entkoppelt.
- Detail-Optik (Ist-Zustand) bleibt das Default-Verhalten.
