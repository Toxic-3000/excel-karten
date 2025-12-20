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
- Aufklappbar: Beschreibung, **Store**, Trophäen (inkl. Progress-Bar), Humorstatistik
- Filter & Sortieren (mobilfreundliches Bottom-Sheet)
  - Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main-Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
  - Filter: Favoriten, Plattform, Quelle, Verfügbarkeit, Trophäenstatus (Multi-Select OR)

## Änderungen in Build 7.0d (nur dieses Thema)
- **Store-Sektion zweispaltig** (Key/Value wie Infoblock):
  - Quelle
  - Store Link (Linktext + echte URL aus Excel/Hyperlink)
  - Verfügbarkeit

## Nächste Builds (Fixplan, aktualisiert)
- 7.0e → Badge-Farben & Ruhe
- 7.0f → Trophäen-UI ruhig & final
