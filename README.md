# Spieleliste – Webansicht (Build 7.1j56)

Statische, **clientseitige** Webansicht für deine persönliche Spieleliste.
Die Seite liest eine lokal ausgewählte **Excel-Datei (.xlsx)** ein und rendert daraus Karten.
**Kein Backend, kein Upload**: Alles passiert im Browser.

## Änderungen in diesem Build (7.1j56)

- Build C: FAB-Puls-Trigger neu geregelt (zentraler Controller)
  - Suche: Puls 2s nach letzter Eingabe (debounced)
  - Eintritt Kartenansicht: Puls 2s nach Schließen des Menüs
  - Reminder: alle 3 Minuten, nur bei aktiven Filtern und ohne Menü-/Header-Such-Interaktion
- Keine Daueranimation, kein Puls bei offenem Menü, globaler Cooldown (~15s)


## Zielbild (Design & UX)

- **Mobile-first**: Android Phone (Portrait + Landscape) bleibt Referenzstandard.
- **Kompaktansicht-only**: ruhige Karten, klare Hierarchie, wenig Schnickschnack.
- **Header-Standard Variante A**
  - Zeile 1: Plattform
  - Zeile 2: Quelle/Verfügbarkeit
  - Zeile 3: Genre (kleiner/dunkler)
  - Zeile 4: Trophäenstatus (neutral, 1 Badge)
- **Akkordeon-Reihenfolge**: Beschreibung → Store → Trophäen → Humorstatistik (Eastereggs als weiteres Akkordeon)

## Neu in 7.1j56

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


### Hotfix (7.1j56)
- Header-Suche: Puls jetzt 5s nach letzter Eingabe (ruhiger, inkl. Tastatur-Ausblenden)
- Puls-Gating: gilt bei aktiven Filtern **oder** aktiver Suche (Search zählt als Filterzustand für die Pulslogik)


### Hotfix (7.1j56)
- Header-Suche: Puls-Auslösung robuster (queued nach Cooldown, zusätzlich nach Blur/Keyboard-Hide)


### Hotfix (7.1j56)
- Puls-Engine repariert (requestQuickFabPulse triggert wieder echte Animation)
- Reminder-Intervall/Inaktivität: 1 Minute (Testmodus)
- Reminder-Puls: 1x „flächiger“ (soft ring)
