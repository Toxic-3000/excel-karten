# Spieleliste – Build V7_1j62k

Dieser Build ist eine **CSS-Entschlackungsrunde (Phase A)** auf Basis von **V7_1j62e** – mit dem Ziel, die Styles wieder wartbarer zu machen, **ohne** die Optik zu verändern.

## Änderungen in V7_1j62k (gegenüber V7_1j62e)

- **Neue CSS-Tokens (uiScale-aware):** Spacing-Skala (`--sp-*`) und Control-Metriken (`--ctl-*`) als zentrale „Single Source of Truth“.
- **Gezielte Umstellung ohne Look-Drift:** Erste, klar begrenzte Stellen (Header/Toolbar-Rhythmus + FAB-Panel-Chips) nutzen nun die Tokens statt duplizierter `calc(...)`-Werte.
- **Keine neue Logik, keine neuen Zustände, kein Redesign.** Ziel ist ausschließlich weniger Redundanz und weniger Override-Wildwuchs für kommende Patches.

## Stand der Webansicht in diesem Build

- Stabiler UI-Stand wie V7_1j62e (Optik beibehalten).
- Hosting/Struktur unverändert.

