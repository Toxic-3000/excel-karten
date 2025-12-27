# Spieleliste – Webansicht (Build 7.1b)

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

## Technische Hinweise

- Verarbeitung der Excel-Datei erfolgt lokal im Browser.
- Keine Daten werden hochgeladen oder gespeichert (Stand 7.1b).

- In 7.1b: Suche ist leicht **debounced** und Filter nutzen vorberechnete Normalisierungen für flüssigeres Tippen.

## Bekannte Einschränkungen

- Excel kann aktuell **nur gelesen**, nicht bearbeitet werden.
- Sehr große Listen können auf schwächeren Geräten langsamer reagieren.

## Roadmap (kurz)

- Performance-Optimierung der Filter-/Suchpipeline (✓ in 7.1b)
- Desktop-Lesbarkeit weiter polieren
- Optional: Zustand (Filter/Suche/Sortierung) lokal merken
