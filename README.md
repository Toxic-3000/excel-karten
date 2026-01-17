# Spieleliste – Build V7_1k64l

Patch: Suchsprache A–C (Filter + Markierungen + Suchhilfe).

Patch A–C: Suchsprache (Trefferlogik + Markierungen + Hilfe)

## Änderungen in V7_1k64l (gegenüber V7_1k64k)

### Patch A – Suchsprache erweitern (Filter)
- Neue Term-Typen in der freien Suche:
  - `=wort` → ganzes Wort
  - `="phrase"` → exakte Phrase
  - Negation funktioniert auch frei: `-wort`, `-="phrase"`
- Feldsuche erweitert:
  - `Feld:=wort` → ganzes Wort im Feld
  - `Feld:="phrase"` → exakte Phrase im Feld
  - Bestehendes bleibt: `Feld:wert` (enthält), `Feld=wert` (exakt)

### Patch B – Markierungen an Term-Typen gekoppelt
- Highlights spiegeln jetzt die Suchbedeutung wider:
  - `hof` markiert Teilstrings
  - `=hof` markiert nur ganze Wörter
  - `="red dead"` markiert nur die Phrase am Stück

### Patch C – Suchhilfe + Edgecases
- Suchhilfe (Topbar + Menü) aktualisiert.
- Unclosed Quotes werden wie normaler Text behandelt (keine „Suche tot“).

## Änderungen in V7_1k64k (gegenüber V7_1k64j)

- Suchzeile: Abstand zwischen Suchtext und (x) wieder etwas reduziert (mehr nutzbare Breite)
- Suchzeile: Textauswahl/Cursor-Setzen auf Mobile wieder zuverlässig möglich (user-select explizit auf Text gesetzt)

## Änderungen in V7_1k64j (gegenüber V7_1k64i)

- Suchzeile wieder im "Pill"-Look wie zuvor (statt eckigem Default-Input).
- Clear-Button (x) bleibt sicher bedienbar: weniger Abstand zum rechten Rand, mehr Abstand zum Text/Cursor.
- CSS-Duplikat-/Bruchstellen im Suchleisten-Block bereinigt (verhindert Style-Fallbacks).

- Suchfelder (Topbar + Filter/Sortieren): rechter Innenabstand **reduziert**, damit wieder mehr nutzbare Eingabebreite bleibt, aber der native Clear-Button (x) trotzdem nicht am Text „klebt“.

---

## Änderungen in V7_1k64g (gegenüber V7_1k64f)

- Suchfelder (Topbar + Filter/Sortieren): mehr rechter Innenabstand, damit der native Clear-Button (x) nicht direkt am Text „klebt“ und man am Ende der Eingabe leichter tippen kann.

---

## Änderungen in V7_1k64f (gegenüber V7_1k64e)

- **Fix: Markierungen greifen wieder** – Highlighting nutzt jetzt die echte Suchabfrage `state.q` (statt einer nie gesetzten Variable). Dadurch werden Treffer in allen sichtbaren Bereichen korrekt hervorgehoben, inkl. Akkordeons beim Öffnen.

## Änderungen in V7_1k64e (gegenüber V7_1k64d)

- **Fix: Markierungen funktionieren jetzt** – fehlende Funktion `syncOpenTextHighlights()` ergänzt und Highlighting wird nach jedem Render-DOM-Swap einmal angewendet, wenn Markierungen **An** sind.
- **Keine Änderung an Suche/Filter/Topbar** – rein visueller Layer.

## Änderungen in V7_1k64a (gegenüber V7_1k63y)

- **Scroll-progressive Topbar**: kein harter Schwellwert mehr. Die Topbar **gleitet proportional mit dem Scroll** nach oben aus dem Bild.
  - Progress wird aus `scrollY / collapseDistance` berechnet.
  - `collapseDistance` wird **aus der echten Topbar-Höhe** abgeleitet (≈ 1.6× Höhe), damit die Bewegung bewusst „langsamer“ wirkt.
- **Kein Layout-Sprung**: Höhe und Translate werden synchron über CSS-Variablen gesteuert (Content rückt weich nach, statt zu „snappen“).
- **Auto-Scroll-Lock bleibt aktiv**: während des Fokus-Scrolls wird die Topbar auf `progress=1` gehalten, damit es nicht flackert.

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