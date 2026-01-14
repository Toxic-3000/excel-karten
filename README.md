# Spieleliste – Build V7_1k63x

Phase 4.2: Topbar-Verhalten (eleganter + ohne Layout-Sprung).

## Änderungen in V7_1k63x (gegenüber V7_1k63w)

- Fix: Topbar-Flackern beim ersten Tap auf eine Karte (Fokus-Scroll) behoben.
  - Während des programmgesteuerten Fokus-Scrolls wird die Header-Visibility kurz gesperrt (Auto-Scroll-Lock).
  - Header bleibt in dieser Phase verborgen; danach synchronisiert er sich einmal sauber.

## Änderungen in V7_1k63w (gegenüber V7_1k63v)

- **Topbar blendet später, aber gefühlt „richtig“ aus** (alle Geräte): Schwelle wird jetzt **aus der tatsächlichen Header-Höhe abgeleitet**.
  Ziel: Die Topbar ist weg, sobald die erste Karte „fast“ am oberen Rand anliegt.
- **Kein harter Layout-Sprung mehr**: statt `display:none` wird der Header **sanft zusammengeklappt** (Height/Max-Height + Fade/Slide).
- **Hysterese gegen Flackern**: kleines Fenster zwischen Ausblenden und Wiedereinblenden, damit es am Schwellenwert stabil bleibt.

## Änderungen in V7_1k63q (gegenüber V7_1k63p)

- **Kartenmodus Kompakt ist jetzt immer einspaltig** (Desktop/Tablet/Portrait/Landscape), damit der Modus konsistent wirkt.
- **Fluchtlinien/Lesebreite vereinheitlicht**: auf Tablet/Desktop bekommen **Kopfbereich (TopGrid) und Akkordeon-Detailbereich** die gleiche zentrierte Maxbreite.
  Dadurch passt die Breite der Akkordeons wieder sauber zum oberen Info-Block (keine „auseinandergerissene“ Flucht mehr).
- Phones bleiben unverändert.

## Änderungen in V7_1k63p (gegenüber V7_1k63o)

### Phase 3 – Desktop/Tablet Layout + Detail-Konsistenz
- **Fortschritts-/Trophäen-Headerbadges** werden nur noch im globalen **Detailmodus** gerendert.
  In Kartenmodus **Mini** und **Kompakt** sind sie damit zuverlässig **immer aus** (auch auf Desktop/Tablet).
- **Store + Humorstatistik** folgen jetzt auch im Kartenmodus (wenn eine Karte bis „Detail“ geöffnet ist) wieder den gleichen Grid-Regeln wie im Detailmodus
  → auf Landscape/Tablet‑Portrait wieder nebeneinander, statt untereinander.
- **Mini** wird ab ca. **760px Breite** zweispaltig (Tablet‑Portrait 800×1280). Phones bleiben unverändert.
- **Mini‑Genre** unter dem Titel: Schriftgröße leicht erhöht.
- **Akkordeon-Lesebreite**: auf Tablet/Desktop wird der Detailbereich auf eine angenehmere Maxbreite zentriert, sodass Beschreibung/Store/Humor/Trophäen/Eastereggs optisch sauberer fluchten.

## Änderungen in V7_1k63o (gegenüber V7_1k63n)

- Fokus-Scroll: Zielposition um **15px höher** nachkorrigiert (Mini & Kompakt, alle Geräte). Konstanter Abstand bleibt.

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