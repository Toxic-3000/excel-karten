# Spieleliste – Webansicht (Build 7.1j17)

Statische, **clientseitige** Webansicht für deine persönliche Spieleliste.
Die Seite liest eine lokal ausgewählte **Excel-Datei (.xlsx)** ein und rendert daraus Karten.
**Kein Backend, kein Upload**: Alles passiert im Browser.

## Zielbild (Design & UX)

- **Mobile-first**: Android Phone (Portrait + Landscape) bleibt Referenzstandard.
- **Kompaktansicht-only**: ruhige Karten, klare Hierarchie, wenig Schnickschnack.
- **Header-Standard Variante A**
  - Zeile 1: Plattform
  - Zeile 2: Quelle/Verfügbarkeit
  - Zeile 3: Genre (kleiner/dunkler)
  - Zeile 4: Trophäenstatus (neutral, 1 Badge)
- **Akkordeon-Reihenfolge**: Beschreibung → Store → Trophäen → Humorstatistik (Eastereggs als weiteres Akkordeon)

## Neu in 7.1j17

### 1) Informationsanzeige im Schnellmenü (≡)
- Erscheint **ausschließlich** im geöffneten Schnellmenü.
- Erscheint **nur**, wenn mindestens ein Filter aktiv ist.
- Inhalt (direkt aus globalem State):
  - **„X Titel angezeigt“**
  - **„Filter aktiv: Y“**
- **Phone Landscape**: kompakte **einzeilige** Darstellung (z. B. `283 Titel · 1 Filter aktiv`), ohne Card-/Rahmenoptik.

### 2) Schnellmenü-FAB als alleiniger Statusindikator
- **Keine Filter aktiv**: neutral (grau), kein Ring.
- **Filter aktiv**: ruhige Einfärbung + **dezenter Dauer-Ring**.

### 3) Kurze Aufmerksamkeits-Animation (Ring-Pulse)
- Trigger: **Beim Zurückkehren in die Kartenansicht** (Dialog schließt) **und** es sind Filter aktiv.
- Timing: ca. **760 ms** Verzögerung (damit kein Overlay die Animation verdeckt).
- Animation: **nur der Ring**, **3 Pulse** (keine Endlosschleife), danach sofort zurück in den ruhigen Dauerzustand.

> Hinweis: In diesem Build gibt es **keine** Text-Hinweise zu Filtern/Trefferzahlen außerhalb des Schnellmenüs.

## Getestet (Stand 7.1j17)

- ✅ Android Phone Portrait
- ✅ Android Phone Landscape
- ✅ Desktop (Windows)
- ✅ Windows Tablet Portrait
- ✅ Windows Tablet Landscape (z. B. 1280×800)

## Schnellstart

### GitHub Pages
1. Lege diese Dateien gemeinsam in denselben Ordner (z. B. Repo-Root):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `xlsx.full.min.js`
2. GitHub Pages aktivieren (Branch/Folder auswählen).
3. Seite öffnen → **„Excel auswählen“**.

### Lokal
- Ordner in einem lokalen Webserver starten (z. B. VS Code „Live Server“).
- Dann im Browser öffnen und Excel auswählen.

> Cache-Busting: `?v=...` Query-Parameter in `index.html` dienen nur dazu, alte Dateien aus dem Browsercache zu umgehen.

## Bedienung

### Excel laden
- Button **„Excel auswählen“** → `.xlsx` auswählen.
- Es wird bevorzugt das Tabellenblatt **„Spieleliste Komplett“** verwendet; falls nicht vorhanden, wird das erste Blatt genommen.

### Textgröße (Aa)
- **Aa-FAB** → Menü „Textgröße“ mit Presets (A / A+ / A++ / A+++).

### Schnellmenü (≡)
- **≡-FAB** → Quick-Controls für Sortierfeld + Sortierrichtung.
- Enthält außerdem den Sprung in das Hauptmenü **„Filter & Sortieren“**.

### Suche
- Freitextsuche über ID, Titel, Genre/Subgenre, Entwickler usw.
- Suchhilfe (ⓘ) zeigt Beispiele.
- Praktische Kurzsyntax (Beispiele):
  - `id=643`
  - `titel:metro`
  - `genre:"Action Adventure"`
  - `sg:horror`
  - `dev:remedy`
  - `p:ps5`
  - `quelle:psn`
  - `verfügbarkeit:delisted`
  - Ausschluss: `-genre:sport`

### Filter & Sortieren
- Sheet/Modal ist mobile/desktop-optimiert.
- Sortierung: Feld + Richtung.
- Genre: Multi-Select (Chips).
- Desktop/Tablet: Fokus bleibt im Dialog (Tab-Loop); Esc schließt zuerst Dropdown, dann den Dialog.

## Excel-Erwartungen (Datenmodell – pragmatisch)

Wichtige Felder, die in der UI angezeigt werden:

- ID / Titel
- Plattform
- Quelle / Verfügbarkeit
- Genre / Subgenre
- Entwickler
- Spielzeit (Main / 100%)
- Metascore / Userwertung
- Store-Link (URL + Linktext aus Excel)
- Trophäenstatus
- Humorstatistik (Gesamtstunden, % Lebenszeit, Jahre)
- Beschreibung / Eastereggs (falls vorhanden)

## Struktur / Dateien

- `index.html` – Layout-Shell & UI-Gerüst
- `styles.css` – gesamtes Styling inkl. Breakpoints
- `app.js` – Logik: Excel-Import, Normalisierung, Filter/Suche/Sortierung, Rendering
- `xlsx.full.min.js` – XLSX-Parser (SheetJS)
