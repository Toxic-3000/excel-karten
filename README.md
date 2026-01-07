# Spieleliste – Build V7_1j62g

Dieses ZIP basiert auf dem Build **V7_1j62f** und koppelt die **FAB-Menüs** (Schnellmenü & Textgröße) auf **allen Geräten/Ansichten** an das globale **Aa-Scaling**.

## Änderungen in V7_1j62g (gegenüber V7_1j62f)

- **Globale Aa-Kopplung:** Schriftgrößen, Chip-/Button-Maße und relevante Abstände in **beiden** FAB-Menüs folgen nun konsistent `var(--uiScale)`.
- **Phone-Landscape bereinigt:** zuvor harte Pixelwerte im FAB-Menü wurden auf skalierende `calc(... * var(--uiScale))` umgestellt.

## Stand der Webansicht in diesem Build

- **Schnellmenü:** Sortierung (↑ Auf / ↓ Ab), Markierungen (An/Aus), Karten (Kompakt/Detail – Platzhalter), Sprung in „Suchen, Filtern & Sortieren“.
- **Textgröße:** A / A+ / A++ / A+++ + „Textdarstellung“ (Normal/Kompakt – Platzhalter).
- **Trennlinie:** pro Menü genau **eine** Linie im Header-Stil.

## Inhalt

- `index.html`
- `styles.css`
- `app.js`
- `xlsx.full.min.js`

## Lokal starten

Öffne `index.html` direkt im Browser oder lade alle Dateien gemeinsam auf GitHub Pages.
