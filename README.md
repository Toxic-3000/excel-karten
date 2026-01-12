# Spieleliste – Build V7_1k63n

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).

## Änderungen in V7_1k63n (gegenüber V7_1k63l)

- Fokus-Scroll: **konstanter Abstand** zum oberen Viewport-Rand (unabhängig davon, wo die Karte vorher lag). Dafür: Scroll-Anchoring deaktiviert + mehrstufige Nachkorrektur nach Smooth-Scroll.

- Phase 2.5: Fokus-Scroll-Position nochmal ca. **30px tiefer** gesetzt (Feintuning; Mini & Kompakt, alle Geräte).
- Phase 2.4: Fokus-Scroll-Position **leicht tiefer** gesetzt (Feintuning nach 2.3; Mini & Kompakt, alle Geräte).

## Änderungen in V7_1k63j (gegenüber V7_1k63i)

- Phase 2.3: Fokus-Scroll-Position *nochmals deutlich* höher gesetzt (Mini & Kompakt, alle Geräte).

## Änderungen in V7_1k63i (gegenüber V7_1k63h)

- Phase 2.2: Fokus-Scroll-Position deutlich höher gesetzt (Mini & Kompakt, alle Geräte).

## Änderungen in V7_1k63h (gegenüber V7_1k63g)

- Fokus-Scroll: aktive Karte wird in Mini & Kompakt höher im Viewport positioniert (gerade auf Phones weniger „tief“).
- Fokus-Scroll: zusätzlicher Korrekturlauf nach Smooth-Scroll, um leichte Abweichungen durch mobile Viewport-Dynamik zu glätten.

## Änderungen in V7_1k63g (gegenüber V7_1k63f)

### Phase 2 – Fokus-Scroll (deterministisch)
- Fokus-Scroll wird jetzt bei **Erstaktivierung** einer Karte ausgelöst (First-Tap) in **Kartenmodus Mini und Kompakt**.
- Kein Fokus-Scroll beim Vertiefen der aktiven Karte (Kompakt → Detail) und **nie** beim Öffnen/Schließen von Akkordeons.
- Scroll ist jetzt deterministisch unter Berücksichtigung der Sticky-Header-Höhe (Desktop/Tablet stabiler).

### Phase 1 – Kartenmodus-State stabilisiert

- **Kartenmodus-Wechsel ist jetzt deterministisch**: Ein Wechsel über das Schnellmenü (z. B. Kompakt → Mini) löst immer eine echte Re-Render-Invalidierung aus, auch wenn Filter/Sortierung unverändert sind.
  Dadurch verschwindet das „UI zeigt Mini, aber Kompakt bleibt sichtbar“-Problem nach Karteninteraktionen.

### Chevron-Feinschliff (Mini & Kompakt)

- Chevron 1 (Mini) ist jetzt sauber mittig ausgerichtet.
- Beide Chevron-Marker wirken „eingelassen“ (subtiler Well-/Inset-Look), ohne Button-Anmutung.
- Mehr Luft um die Marker (oben + unten), damit sie im Portrait & Landscape ruhiger wirken.

### Layout-Fixes: Mini-Kacheln in Landscape/Tablet/Desktop

- **Zweispaltige Minikacheln** ab Tablet/Desktop-Breite (>= 900px) – auch in Portrait, wenn genug Platz vorhanden ist.
- **Mini (geschlossen) nutzt die volle Kachelbreite**: keine „unsichtbare“ zweite Spalte mehr im Landscape-Desktop/Tablet.
  Dadurch bricht der Titel/Content in Mini nicht unnötig früh um.

### Detailbereich: Akkordeons wie in Detailansicht

- Detail-Akkordeons haben wieder **sichtbare Abstände** zueinander (wie im Detailansichts-Modus).

## Nicht geändert
- Detailansicht-Design (Layout/Spacing/Reihenfolge der Akkordeons).
- Excel-Import, Filter/Sortierung, Markierungen, FAB/Schnellmenü (außer Kartenfeature-Verhalten in Mini/Kompakt).