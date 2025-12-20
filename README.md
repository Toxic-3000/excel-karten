# Spieleliste Webansicht – Clean Rebuild (Build 7.0f)

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
- Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen (inkl. Progress-Bar), Humorstatistik
  - Store-Link nutzt **Linktext + echte URL** aus Excel (Hyperlink), falls vorhanden
- Filter & Sortieren (mobilfreundliches Bottom-Sheet)
  - Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main-Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
  - Filter: Favoriten, Plattform, Quelle, Verfügbarkeit, Trophäenstatus (Multi-Select OR)

## Änderungen in Build 7.0f (nur dieses Thema)
- **Badge-System (Variante A: Status-Dot)**
  - Quelle-Badges: **🏷️ Digital / 🏷️ Retail-Disc / 🏷️ PS-Plus / 🏷️ Unbekannt**
  - Quelle bleibt **dunkler neutral** als Plattform (bessere Trennung)
  - Verfügbarkeit bleibt **ruhig neutral**, Status über **farbigen Punkt links**:
    - Verfügbar → grün
    - Eingeschränkt → gelb
    - Delisted → rot
    - Unbekannt → neutral/grau
  - Trophäenstatus bleibt **neutral** (Emoji trägt die Bedeutung)

## Nächster Build (Fixplan)
- 7.0g → Trophäen-UI ruhig & final
