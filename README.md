# Spieleliste Webansicht – Clean Rebuild (Build 7.0a)

**Einzige Datenquelle:** `Spieleliste_paired_machinefriendly_trimmed_corrected.xlsx`

## Deployment (GitHub Pages)
Lege diese Dateien ins Repo-Root (gleiches Verzeichnis):
- `index.html`
- `styles.css`
- `app.js`
- `xlsx.full.min.js`

Dann GitHub Pages aktivieren und die Excel in der Webansicht auswählen.

## Features (aktueller Stand)
- Kompaktansicht-only (keine Detailansicht)
- Kartenkopf: ID+Favorit (Zeile 1), Titel (Zeile 2)
- Badges: Plattform/Quelle/Verfügbarkeit (+ Erinnerung, falls Spalte vorhanden), Genre, Trophäenstatus
- Fester Infoblock: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
- Aufklappbar: Beschreibung, Store (URL+Text), Trophäen (mit Progress-Bar), Humorstatistik
- Filter & Sortieren: Bottom-Sheet, alle Zustände sichtbar (inkl. Unbekannt/Eingeschränkt)

