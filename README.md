# Spieleliste – Build V7_1j62p

Dieser Build ist **CSS-Entschlackung Phase F** auf Basis von **V7_1j62e** – Ziel: **weniger Overrides, gleiche Optik**.

## Änderungen in V7_1j62p (gegenüber V7_1j62o)

- **Dropdown-Styles tokenisiert:** `.dd`/`.ddBtn`/`.ddPanel` nutzen jetzt `--dd-*` Tokens (Defaults = bisherige Optik).
- **Schnellmenü-Dropdown ohne `!important`:** `.fabPanelQuick .dd` setzt nur noch Tokens (Padding/Shadow/Panel-Breite), statt Breite/Max-Breite mit `!important` zu erzwingen.
- **Duplikate entfernt:** frühere Schnellmenü-spezifische `.dd*`-Overrides wurden zusammengeführt bzw. entfallen.
- **Keine Optik-Änderungen beabsichtigt:** Ziel ist weniger Spezifitätskrieg, gleiche Darstellung.

---

## Änderungen in V7_1j62n (historisch)

- **Duplikate entfernt / zusammengeführt:** doppelte Grid-Regeln im Schnellmenü bereinigt.
- **Gemeinsame „Pill“-Oberfläche zentralisiert:** `:is(.pill, .btn, .badge)` bündelt die wiederkehrenden Basiswerte (Border/Background/Radius/Color) – die Einzelregeln enthalten nur noch das, was wirklich unterscheidet.
- **Schnellmenü-Info vereinheitlicht:** `.quickInfo` und `.fabQuickInfo` teilen sich jetzt eine einzige Style-Definition (`:is(...)`), statt zweimal derselben CSS-Blockkopie.

## Was explizit **nicht** geändert wurde

- Keine Farb-/Typo-Änderungen, keine Layout-Änderungen, keine Logik-/JS-Änderungen.
- Ziel bleibt: **Optik wie V7_1j62e**, aber weniger „Override-Jenga“.