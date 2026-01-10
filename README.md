# Spieleliste – Build V7_1k63a

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).

## Änderungen in V7_1k63a (gegenüber V7_1j62y)

- Fix: Trophy-Status-Badges zeigen im Phone-Landscape wieder Text (kurz) statt leer.
- Fix: „Suchen, Filtern & Sortieren“-Sheet: untere Ecken wieder abgerundet; auf Phone-Landscape scrollt das Sheet wieder sauber (Sheet = Scroll-Container, Head/Actions nicht sticky).
- CSS: Trophy-Label-Logik vereinheitlicht (Default kurz, ab breitem Landscape/Desk ausführlich), ohne widersprüchliche Überschreibungen.

- Neu: Kartenmodi im Schnellmenü (Mini / Kompakt / Detail) – schaltet die Detailtiefe der Karten um.
- Neu: In Mini/Kompakt ist immer nur eine Karte „aktiv“; Chevron-Buttons steuern Kompakt/Detail pro Karte.
- Neu: Mini zeigt Genre als kleine Textzeile, blendet Trophäen-Status im Header aus; Kompakt blendet Details standardmäßig ein/aus.

- Tote CSS-Regeln entfernt (nicht mehr verwendete Klassen/IDs), ohne Layout-Änderungen.
- FAB-Menü-Styles weiter konsolidiert: weniger Spezifitäts-/Override-Kollisionen, gleiche Optik.
- CSS-Datei aufgeräumt (Legacy-Kommentare/Altlasten reduziert), Kaskade bleibt stabil und deterministisch.

## Nicht geändert
- Optik/Spacing des UIs (Ziel: 1:1).
- Logik/Funktionen.
