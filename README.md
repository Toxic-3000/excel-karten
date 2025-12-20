# Spieleliste Webansicht – Clean Rebuild (Build 7.0d)

**Einzige Datenquelle (Source of Truth):** `Spieleliste_paired_machinefriendly_trimmed_corrected.xlsx`

## Deployment (GitHub Pages)
Lege diese Dateien ins Repo-Root (gleiches Verzeichnis):
- `index.html`
- `styles.css`
- `app.js`
- `xlsx.full.min.js`

Dann GitHub Pages aktivieren und die Excel in der Webansicht auswählen.

## Features (aktueller Stand)
- Kompaktansicht-only (keine Detailansicht)
- Kartenkopf: ID + Favorit (Zeile 1), Titel (Zeile 2)
- Badge-Zeilen:
  - Plattform / Quelle / Verfügbarkeit (alle Zustände werden angezeigt)
  - Genre
  - Trophäenstatus (Kurzform)
- Fester Infoblock: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
- Aufklappbar: Beschreibung, Store (Linktext + echte URL aus Excel/Hyperlink), Trophäen (inkl. Progress-Bar), Humorstatistik
- Filter & Sortieren (mobilfreundliches Bottom-Sheet)
  - Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main-Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
  - Filter: Favoriten, **Spielzeit (min/max)**, Plattform, Quelle, Verfügbarkeit, Trophäenstatus (Multi-Select OR)

## Änderungen in Build 7.0d
- **Spielzeit-Filter ergänzt** (min/max als Stunden):
  - 🕒 Main-Story (Std.) – min/max
  - 🕒 Komplett (Std.) – min/max
- Labels konsolidiert: 🕒 Main-Story / 🕒 Komplett (keine Verwechslung mehr mit „100% abgeschlossen“)

## Nächste Builds (Fixplan)
- 7.0e → Store-Sektion zweispaltig
- 7.0f → Badge-Farben & Ruhe
- 7.0g → Trophäen-UI ruhig & final
