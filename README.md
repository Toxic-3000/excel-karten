# Spieleliste – Webansicht (Build 7.1j11)

Statische, **clientseitige** Webansicht für deine persönliche Spieleliste.
Die Seite liest eine lokal ausgewählte **Excel-Datei (.xlsx)** ein und rendert daraus Karten.
**Kein Backend, kein Upload**: Alles passiert im Browser.

## Zielbild (Design & UX)

- **Mobile-first**: Android Phone (Portrait + Landscape) ist der Referenzstandard und darf nicht verschlechtert werden.
- **Kompaktansicht-only**: ruhige Karten, klare Hierarchie, wenig Schnickschnack.
- **Header-Standard Variante A**
  - Zeile 1: Plattform
  - Zeile 2: Quelle/Verfügbarkeit
  - Zeile 3: Genre (kleiner/dunkler)
  - Zeile 4: Trophäenstatus (neutral, 1 Badge)
- **Akkordeon-Reihenfolge**: Beschreibung → Store → Trophäen → Humorstatistik (Eastereggs als weiteres Akkordeon)
- **Werte-Ausrichtung**: In Info-Tabellen (Infoblock / Store / Humorstatistik) laufen Label/Wert sauber und stabil.

## Getestet (Stand 7.1j11)

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

> Hinweis: `?v=...` Query-Parameter in `index.html` dienen nur dem Cache-Busting.

## Bedienung

### Excel laden
- Button **„Excel auswählen“** → `.xlsx` auswählen.
- Es wird bevorzugt das Tabellenblatt **„Spieleliste Komplett“** verwendet; falls nicht vorhanden, wird das erste Blatt genommen.

### Textgröße (Aa)
- **Aa-Floating Button** → Menü „Textgröße“ mit Presets (A / A+ / A++ / A+++).
- Ziel: Presets verhalten sich konsistent über Portrait/Landscape und bleiben lesbar.

### Schnellmenü (≡)
- **≡-Floating Button** → Quick-Controls für Sortierfeld + Sortierrichtung.
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

Die Webansicht ist tolerant, aber am stabilsten läuft sie mit einer konsistenten Struktur.
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

## Was ist neu / was wurde im 7.1i‑Zweig poliert?

Patch-Fokus 7.1i: **Layout-Dichte & Ausrichtung Desktop/Tablet, ohne Phone zu ändern.**

- Desktop/Tablet: rechter Infoblock (Header) wirkt wie eine echte Sidebar statt „halbe Karte“.
- Label↔Wert-Abstände harmonisiert (Infoblock + Store + Humorstatistik).
- Windows Tablet Portrait: Karte etwas kompakter (mehr Außenrand) und **Store + Humorstatistik nebeneinander**.
- Tablet Landscape + Desktop: Infoblock oben rechts auf **exakte Humorstatistik-Breite** gebracht (saubere Fluchten).
- Phone (Portrait/Landscape): bewusst stabil gehalten; nur gezielte Fixes für A+++ (u. a. Link-Umbruch/Alignment) – ohne Layoutsprünge.


## Patchplan – nächster Schritt: 7.1j (Typografie Desktop/Tablet)

Patch-Fokus 7.1j: **Typografie-Feinschliff** für Desktop & Windows-Tablet (Portrait/Landscape),
ohne Android-Phone (Portrait/Landscape) anzutasten.

### Was ist in 7.1j11 bereits umgesetzt?
- Floating Buttons (↑, Aa, ≡) insgesamt deutlich kleiner, konsistent in Portrait + Landscape.
- Floating Buttons neu angeordnet (Stack): **↑ (Top)** oben, **Aa** in der Mitte, **≡ (Schnellmenü)** unten.
- FAB-Menü aufgeteilt: **Aa = nur Textgröße**, **≡ = Schnellmenü (Sortierung + Sprung ins Hauptmenü)**.
- Tablet Portrait: größerer Außenrand vor der Karte (mehr Hintergrund sichtbar), horizontal per `clamp()` geregelt, damit A+++ nicht unnötig „zuschnürt“.
- Phone Landscape: Schnellmenü ist jetzt ein **stabiles Dock unten links** (Button ≡ ist nur Trigger). Keine Kollision mehr mit Header/Browserbar; Breite wird maximal genutzt, Höhe bleibt klein.
- Safety: FAB-Panels schließen bei **Resize/Orientationchange** automatisch (verhindert „hängende“ offene Panels nach Browser-UI‑Sprüngen).

Zusätzlich in **7.1j11** (Polish „Filter & Sortieren“):
- Sortieren-Select (Phone/Tablet): **ohne Überschriften**, stattdessen visuelle Trenner.
- Filtermenü: Hinweiszeile entfernt → etwas mehr „Luft“ vor den Action-Buttons.
- Phone Landscape: Filtermenü ist **nicht mehr Vollbild** (dünner Rand) und **ohne Sticky-Elemente** (alles scrollt, nichts wird verdeckt).
- Reihenfolge im Filterbereich: **Schnellfilter → Weitere Filter → Genre → Trophäen**.
- Dropdowns (Select + Desktop-DD) etwas „ruhiger“ (zartes Grau statt Weiß).
- **Sticky Action-Bar** unten (Zurücksetzen/Fertig), kein Runterscrollen mehr.
- **Live-Apply**: Sortierung/Filter wirken sofort; **„Fertig“** schließt einfach.

## Bekannte Einschränkungen

- Excel wird nur gelesen, nicht bearbeitet.
- Sehr große Listen können auf schwächeren Geräten spürbar langsamer werden.
- Browser-UI (Mobile Adressleiste etc.) kann Layout-Metriken beeinflussen; kritische Bereiche werden daher bevorzugt über stabile Layoutregeln (Grid/Flex) statt `vw`-Tricks gelöst.

## Struktur / Dateien

- `index.html` – Layout-Shell & UI-Gerüst
- `styles.css` – gesamtes Styling inkl. Breakpoints
- `app.js` – Logik: Excel-Import, Normalisierung, Filter/Suche/Sortierung, Rendering
- `xlsx.full.min.js` – XLSX-Parser (SheetJS)

