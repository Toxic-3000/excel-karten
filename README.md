# Spieleliste – Build V7_1k63b

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).

## Änderungen in V7_1k63b (gegenüber V7_1k63a)

- Fix: Trophy-Status-Badges zeigen im Phone-Landscape wieder Text (kurz) statt leer.
- Fix: „Suchen, Filtern & Sortieren“-Sheet: untere Ecken wieder abgerundet; auf Phone-Landscape scrollt das Sheet wieder sauber (Sheet = Scroll-Container, Head/Actions nicht sticky).
- CSS: Trophy-Label-Logik vereinheitlicht (Default kurz, ab breitem Landscape/Desk ausführlich), ohne widersprüchliche Überschreibungen.

- Kartenfeature finalisiert (nach Spezifikation):
  - Tap-Zone = komplette Karte (keine separaten Chevron-Buttons).
  - Ablauf ohne „Zurück“ per Tap: Mini → Kompakt → Detail. Tap auf andere Karte schließt die vorherige und startet neu.
  - Fokus-Scroll nur beim Einstieg (Mini → Kompakt, wie in 63a). Kompakt → Detail scrollt nicht (Lesefluss bleibt stabil).
  - Detailansicht bleibt die Referenz: Kompakt zeigt exakt den Aufbau bis inkl. Userwertung; danach beginnt der Detailbereich mit den Akkordeons.
  - Mini: Genre direkt unter dem Titel (zusätzlich), Fortschritts-/Trophäen-Headerbadges ausgeblendet.
  - Subtile eingelassene Chevron-Marker am Ende der sichtbaren Zonen (Mini & Kompakt), rein indikativ.

- Tote CSS-Regeln entfernt (nicht mehr verwendete Klassen/IDs), ohne Layout-Änderungen.
- FAB-Menü-Styles weiter konsolidiert: weniger Spezifitäts-/Override-Kollisionen, gleiche Optik.
- CSS-Datei aufgeräumt (Legacy-Kommentare/Altlasten reduziert), Kaskade bleibt stabil und deterministisch.

## Nicht geändert
- Detailansicht-Design (Layout/Spacing/Reihenfolge der Akkordeons).
- Excel-Import, Filter/Sortierung, Markierungen, FAB/Schnellmenü (außer Kartenfeature-Verhalten in Mini/Kompakt).
