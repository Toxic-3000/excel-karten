# Spieleliste – Build V7_1j62v

Basis: V7_1j62u.

## Änderungen in V7_1j62v (gegenüber V7_1j62u)

- Feature fertig umgesetzt: **Textdarstellung (Normal / Kompakt)** über die Buttons im **Schriftgrößenmenü (Aa)**.
  - Zustand wird gespeichert (localStorage) und ist entkoppelt von A/A+/A++/A+++.
  - Gilt bewusst **nur** für die Langtext-Blöcke **Beschreibung** und **Eastereggs** (gleiche Regeln für beide).
- Regeln wie besprochen:
  - **Phone:** nur minimal straffer (damit das Feature nicht redundant wirkt).
  - **Tablet/Desktop:** **Normal** leicht luftiger/ruhiger, **Kompakt** deutlich dichter **und** nutzt mehr horizontale Fläche.

## Nicht geändert
- Datenmodell/Excel-Import.
- Filter-/Suchlogik, Sortierung, Markierungen.
- Auto-Open-Verhalten der Akkordeons (weiterhin: keines).
