# Spieleliste – Webansicht (Build 7.1j61e0)

Statische, **clientseitige** Webansicht für deine persönliche Spieleliste.
Die Seite liest eine lokal ausgewählte **Excel-Datei (.xlsx)** ein und rendert daraus Karten.
**Kein Backend, kein Upload**: Alles passiert im Browser.

## Änderungen in diesem Build (7.1j61e0)

- Phase-0 Reset: Schnellmenü wieder auf den letzten stabilen Stand zurückgesetzt (Basis: 7.1j61e3).

- Mini-Patch 1 (Geräteklassen): **Phone (Portrait + Landscape) ist jetzt eine UI-Klasse**.
  - `html.isPhone` wird per JS gesetzt (kleine Breite **oder** kleine Höhe in Landscape).
  - Schnellmenü-Info ist auf Phones einzeilig (spart Höhe, stabiler).
  - Desktop/Tablet bleiben unverändert.

## Änderungen in früheren Builds

- Header / Kartenansicht oben kompakter (basierend auf 7.1j59)
  - Titel + Build-Label in **einer Zeile** (+ dünne Trennlinie)
  - **Suche unverändert (Stand 7.1j59)**, nur neu platziert
  - "Suchen, Filtern & Sortieren" als kompakter Einstieg
  - Excel + Datei als **immer sichtbare, kompakte Statuszeile** (ohne Ausklappen)
    - Excel laden + XLSX-Status
    - Dateiname + Importzeit

## Änderungen in vorherigem Build (7.1j59)

- Fokus-UX beim Öffnen von "Suchen, Filtern & Sortieren":
  - **Mobile/Touch**: Fokus startet auf **Sortieren** (keine sofortige Bildschirmtastatur)
  - **Desktop**: Fokus startet weiterhin auf **Suche** (schnelles Tippen)

## Änderungen in vorherigem Build (7.1j58)

- Fix: Reminder-Loop startet wieder zuverlässig ohne „erst einmal Menü öffnen“
  - Reminder läuft sofort nach App-Init und gated sich weiterhin selbst (nur Kartenansicht + Menü zu + Filter/Suche aktiv)
  - „Awareness“-Interaktionen im Menü (click/input + close) resetten den Reminder-Timer wie geplant
- Puls-Visual: Ring bleibt wie bisher, zusätzlich pulsiert der Button selbst (kurz größer + etwas heller)


## Zielbild (Design & UX)

- **Mobile-first**: Android Phone (Portrait + Landscape) bleibt Referenzstandard.
- **Kompaktansicht-only**: ruhige Karten, klare Hierarchie, wenig Schnickschnack.
- **Header-Standard Variante A**
  - Zeile 1: Plattform
  - Zeile 2: Quelle/Verfügbarkeit
  - Zeile 3: Genre (kleiner/dunkler)
  - Zeile 4: Trophäenstatus (neutral, 1 Badge)
- **Akkordeon-Reihenfolge**: Beschreibung → Store → Trophäen → Humorstatistik (Eastereggs als weiteres Akkordeon)

## Neu in 7.1j57

- **Beschriftungen konsistent gemacht**: "Filter & Sortieren" heißt jetzt überall **"Suchen, Filtern & Sortieren"** (Topbar-Button, Schnellmenü-Button, Sheet-Titel).

## Bereits zuvor

- **Suche zählt als aktiver Filter**: Ein nicht-leeres Suchfeld wird in Filter-Zähler/Status (Schnellmenü-FAB + Statusbox) einbezogen.
- **Reset im Schnellmenü setzt auch die Suche zurück** (inkl. Leeren des Suchfelds).
- **Aktive-Filter-Leiste** zeigt eine **„🔎 Suche: …“**-Chip an und kann die Suche dort ebenfalls entfernen.
- **DOM-Swap per `template` + `replaceChildren()`**: Karten werden off-screen geparst und anschließend in einem Schritt in den DOM eingesetzt.
  Das reduziert Layout-Arbeit bei großen Listen und hält das Scroll-/Filter-Feeling ruhiger.

## Neu in 7.1j44 (Performance-Polish)

- **Apply/Render-Bailout**: Wenn sich Query/Filter/Sortierung nicht geändert haben, wird die Apply+Render-Pipeline übersprungen.
- **<details>-Toggle Delegation**: Ein delegierter Toggle-Listener statt vieler Einzel-Listener; Labels werden nach jedem Render einmal synchronisiert.

## Neu in 7.1j43 (Performance-Polish)

- **PERF-Messpunkte (optional)**: `PERF`/`PERF_DETAIL` in `app.js` liefern Timing für Apply+Render.
- **Debounce für Suche**: Such-Eingabe wird leicht verzögert angewendet (Standard: 150 ms), um Render-Stürme beim Tippen zu vermeiden.

## Neu in 7.1j42 (A11y-Feinschliff)

- ARIA: FABs & Panels bekommen `aria-controls`/`aria-expanded` und `role="dialog"` + `aria-label`.
- Focus Trap: Tab/Shift+Tab bleiben in geöffneten FAB-Panels (Schnellmenü/Textgröße).
- Reduced Motion: Bei `prefers-reduced-motion: reduce` wird der Puls am Schnellmenü-FAB deaktiviert (Status-Ring bleibt).

## Neu in 7.1j40
- Reset-Mikrofeedback: Nach Klick auf 🧹 bleibt die Statusbox ca. 220 ms sichtbar (ohne Filter-Zeile), danach verschwindet sie.
- Tastatur/A11y: `Esc` schließt FAB-Menüs; Fokus wird beim Öffnen sinnvoll gesetzt und beim Schließen zum auslösenden Button zurückgegeben.
- Reset-Button 🧹 ist per Tastatur erreichbar und nutzbar (Enter/Space) und hat `aria-label`/`title`.


### Hotfix (7.1j57)
- Header-Suche: Puls jetzt 5s nach letzter Eingabe (ruhiger, inkl. Tastatur-Ausblenden)
- Puls-Gating: gilt bei aktiven Filtern **oder** aktiver Suche (Search zählt als Filterzustand für die Pulslogik)


## Reparatur-Build (7.1j57)
- Stabilitäts-Fix: basiert auf 7.1j54 (funktionierender JS-Stand)
- Puls-Engine minimal: requestQuickFabPulse triggert wieder direkt die bestehende 3x-Puls-Animation
- Reminder im Testmodus: 1 Minute (Intervall + Inaktivität)
