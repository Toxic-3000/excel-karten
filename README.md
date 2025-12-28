# Spieleliste – Webansicht (Build 7.1i3)

Kompakte, schnelle Webansicht für deine persönliche Spieleliste auf Basis einer **lokal ausgewählten Excel-Datei (.xlsx)**.
Alles läuft **clientseitig im Browser** (kein Backend) und ist für GitHub Pages gedacht.

## Ist-Zustand

Getestet und funktionsfähig in:

- ✅ Android Phone: Portrait
- ✅ Android Phone: Landscape
- ✅ Desktop (Windows)
- ✅ Windows Tablet: Portrait
- ✅ Windows Tablet: Landscape (z. B. 1280×800)

## Schnellstart (GitHub Pages)

1. Lege diese Dateien gemeinsam in **denselben Ordner** (z. B. Repository-Root):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `xlsx.full.min.js`
2. Aktiviere GitHub Pages (Branch/Folder auswählen).
3. Öffne die Pages-URL und klicke **„Excel auswählen“**.

## Bedienung

### Excel laden
- Button **„Excel auswählen“** → `.xlsx` auswählen.
- Es wird bevorzugt das Tabellenblatt **„Spieleliste Komplett“** genutzt; falls nicht vorhanden, wird das **erste** Blatt genommen.

### Suche
- Ein Suchfeld für schnelle Treffer (ID, Titel, Genre, Subgenre, Entwickler …).
- Das ⓘ-Symbol neben der Suche zeigt/verbirgt die Such-Hilfe.

### Filter & Sortieren
- Öffnet ein Sheet/Modal (mobile/desktop-optimiert).
- Sortierung: Feld + Richtung.
- Schnellfilter: Icon-Buttons für häufige Zustände.
- Genre: Multi-Select per Dropdown; Auswahl wird als Chips im Filterfeld angezeigt.
- **„Anwenden“** setzt die Auswahl aktiv, **„Zurücksetzen“** leert alles.

Tastatur (Desktop/Tablet):
- **Tab** bleibt im Dialog (Focus-Loop)
- **Esc** schließt zuerst ein geöffnetes Dropdown, dann den Dialog

## Technische Hinweise

- Verarbeitung der Excel-Datei erfolgt lokal im Browser.

- Keine Daten werden hochgeladen oder gespeichert (Stand 7.1i3).

- In 7.1b/7.1c: Suche ist leicht **debounced** und Filter nutzen vorberechnete Normalisierungen für flüssigeres Tippen.

- Desktop/Windows-Tablet: Typografie skaliert konsistent mit den A/A+/A++/A+++ Presets und ist für längeres Lesen optimiert (Lesebreite, Hierarchie, Rhythmus).
- Desktop/Windows-Tablet: Kartenkopf/Kartenabstände sind etwas kompakter, damit der Header nicht „leer“ wirkt.

## Bekannte Einschränkungen

- Excel kann aktuell **nur gelesen**, nicht bearbeitet werden.
- Sehr große Listen können auf schwächeren Geräten langsamer reagieren.

## Roadmap (kurz)

- Performance-Optimierung der Filter-/Suchpipeline (✓ in 7.1b)
- Desktop-Lesbarkeit weiter polieren
- Optional: Zustand (Filter/Suche/Sortierung) lokal merken
