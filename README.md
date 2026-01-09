# Spieleliste – Build V7_1j63f

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).


## Änderungen in V7_1j63f (gegenüber V7_1j63d)

### Anchor & Restore: Karte bleibt im Fokus bei Layout-Änderungen
- Wenn sich das Layout stark ändert (z.B. **Textgröße (Aa)** oder **Kartenmodus Mini/Kompakt/Detail**), wird die **aktuelle/zuletzt aktive Karte** automatisch wieder in den sichtbaren Bereich geholt.
- Priorität für den Anker: **geöffnete Karte** → sonst **zuletzt aktive Karte**.
- Re-Fokus passiert nach dem Reflow (debounced), ohne “CSS-Flickenteppich” (rein über eine zentrale Scroll-Logik).

---

## Änderungen in V7_1j63d (gegenüber V7_1j63c)

### Mini: Direkter Wechsel zu Detail (ohne "Scroll-Willkür")
- In einer **aufgeklappten Mini-Karte** erscheint jetzt **"Detail öffnen"**.
- Klick darauf wechselt sofort in die **Detail-Ansicht** und bringt **dieselbe Karte** wieder vollständig in den Fokus (stabiler Übergang ohne Sprung zu anderen Titeln).

---

## Änderungen in V7_1j63c (gegenüber V7_1j63b)

### Mini: Fokus nach dem Aufklappen
- Wenn du im **Mini-Modus** eine Karte aufklappst (Header/▾), scrollt die Ansicht automatisch so, dass die aufgeklappte Karte vollständig im sichtbaren Bereich liegt ("100% im Fokus").

---

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
