# Spieleliste – Webansicht (Build 7.1j43)

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

## Neu in 7.1j43 (A11y-Feinschliff)

- ARIA: FABs & Panels bekommen `aria-controls`/`aria-expanded` und `role="dialog"` + `aria-label`.
- Focus Trap: Tab/Shift+Tab bleiben in geöffneten FAB-Panels (Schnellmenü/Textgröße).
- Reduced Motion: Bei `prefers-reduced-motion: reduce` wird der Puls am Schnellmenü-FAB deaktiviert (Status-Ring bleibt).

## Neu in 7.1j40
- Reset-Mikrofeedback: Nach Klick auf 🧹 bleibt die Statusbox ca. 220 ms sichtbar (ohne Filter-Zeile), danach verschwindet sie.
- Tastatur/A11y: `Esc` schließt FAB-Menüs; Fokus wird beim Öffnen sinnvoll gesetzt und beim Schließen zum auslösenden Button zurückgegeben.
- Reset-Button 🧹 ist per Tastatur erreichbar und nutzbar (Enter/Space) und hat `aria-label`/`title`.
