# Spieleliste – Build V7_1j62o

Dieser Build ist **CSS-Entschlackung Phase E** auf Basis von **V7_1j62e** – Ziel: **weniger Overrides, gleiche Optik**.

## Änderungen in V7_1j62o (gegenüber V7_1j62n)

- **Buttons tokenisiert:** `.btn` liest jetzt Padding/Font/Shadow/Weight über `--btn-*` Tokens (Defaults = bisheriger Look).
- **Badges tokenisiert:** `.badge` liest Padding/Font/Height/Gap/Weight über `--badge-*` Tokens (Defaults = bisheriger Look).
- **Responsive Tweaks als Token-Overrides:** mehrere Stellen, die vorher direkt `padding/font-size/height` überschrieben, setzen nun nur noch `--badge-*` bzw. `--btn-*`.
- **Keine Optik-Änderungen beabsichtigt:** das ist ein Umbau „unter der Haube“, damit Phase F/G deutlich mehr Duplikate entfernen können.

---

## Änderungen in V7_1j62n (historisch)

- **Duplikate entfernt / zusammengeführt:** doppelte Grid-Regeln im Schnellmenü bereinigt.
- **Gemeinsame „Pill“-Oberfläche zentralisiert:** `:is(.pill, .btn, .badge)` bündelt die wiederkehrenden Basiswerte (Border/Background/Radius/Color) – die Einzelregeln enthalten nur noch das, was wirklich unterscheidet.
- **Schnellmenü-Info vereinheitlicht:** `.quickInfo` und `.fabQuickInfo` teilen sich jetzt eine einzige Style-Definition (`:is(...)`), statt zweimal derselben CSS-Blockkopie.

## Was explizit **nicht** geändert wurde

- Keine Farb-/Typo-Änderungen, keine Layout-Änderungen, keine Logik-/JS-Änderungen.
- Ziel bleibt: **Optik wie V7_1j62e**, aber weniger „Override-Jenga“.
