# Spieleliste – Build V7_1j62n

Dieser Build ist eine **CSS-Entschlackungsrunde (Phase B)** auf Basis von **V7_1j62e** – Ziel: **wartbarer CSS‑Unterbau ohne Optik‑Änderung**.

## Änderungen in V7_1j62n (gegenüber V7_1j62k)

- **Duplikate entfernt / zusammengeführt:** doppelte Grid-Regeln im Schnellmenü bereinigt.
- **Gemeinsame „Pill“-Oberfläche zentralisiert:** `:is(.pill, .btn, .badge)` bündelt die wiederkehrenden Basiswerte (Border/Background/Radius/Color) – die Einzelregeln enthalten nur noch das, was wirklich unterscheidet.
- **Schnellmenü-Info vereinheitlicht:** `.quickInfo` und `.fabQuickInfo` teilen sich jetzt eine einzige Style-Definition (`:is(...)`), statt zweimal derselben CSS-Blockkopie.

## Was explizit **nicht** geändert wurde

- Keine Farb-/Typo-Änderungen, keine Layout-Änderungen, keine Logik-/JS-Änderungen.
- Ziel bleibt: **Optik wie V7_1j62e**, aber weniger „Override-Jenga“.
