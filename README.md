# Spieleliste – Build V7_1j63b

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).

## Änderungen in V7_1j63b (gegenüber V7_1j62u)

### Karten-Feature (Mini / Kompakt / Detail)
- Neuer Darstellungsmodus im Schnellmenü (≡) unter **Karten**: **Mini**, **Kompakt**, **Detail**.
- Zustand wird im Browser gespeichert (LocalStorage) und beim Neustart wiederhergestellt.
- **Mini:** zeigt Header + Genre-Zeile. Tap auf Header (oder ▾) klappt die Karte auf und zeigt den Info-Block.
- **Kompakt:** zeigt Header + Info-Block, ohne Akkordeons. Tap auf Header (oder ▾) kann den Info-Block ein-/ausblenden.
- **Detail:** unverändert – Akkordeons wie bisher, kein globales Tap-Toggle.

### Layout
- **Landscape (Phone):** Im **Mini-Modus** werden zwei Karten nebeneinander dargestellt; aufgeklappte Karte spannt volle Breite.
- **Landscape (ab 640px):** Im **Kompakt-Modus** ebenfalls zwei Karten nebeneinander.

---

## Änderungen in V7_1j62u (gegenüber V7_1j62t)

- Fix: Trophy-Status-Badges zeigen im Phone-Landscape wieder Text (kurz) statt leer.
- CSS: Trophy-Label-Logik vereinheitlicht (Default kurz, ab breitem Landscape/Desk ausführlich), ohne widersprüchliche Überschreibungen.

- Tote CSS-Regeln entfernt (nicht mehr verwendete Klassen/IDs), ohne Layout-Änderungen.
- FAB-Menü-Styles weiter konsolidiert: weniger Spezifitäts-/Override-Kollisionen, gleiche Optik.
- CSS-Datei aufgeräumt (Legacy-Kommentare/Altlasten reduziert), Kaskade bleibt stabil und deterministisch.

## Nicht geändert
- Optik/Spacing des UIs (Ziel: 1:1).
- Logik/Funktionen.
