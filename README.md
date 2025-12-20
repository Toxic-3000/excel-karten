# Spieleliste Webansicht – Clean Rebuild (Build 7.0h)

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
  - Plattform / Quelle / Verfügbarkeit (alle Zustände werden angezeigt; Quelle zeigt 🏷️ nur bei Unbekannt)
  - Genre
  - Trophäenstatus (Kurzform)
- Fester Infoblock: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
- Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen, Humorstatistik
  - Store-Link nutzt **Linktext + echte URL** aus Excel (Hyperlink), falls vorhanden
- Filter & Sortieren (mobilfreundliches Bottom-Sheet)
  - Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main-Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
  - Filter: Favoriten, Plattform, Quelle, Verfügbarkeit, Trophäenstatus (Multi-Select OR)

## Änderungen in Build 7.0h (nur dieses Thema)
- **Trophäen-UI ruhig & final**
  - Ruhiges, einheitliches Layout pro Plattform (untereinander)
  - **Prozentbar immer vorhanden** (auch bei **Ungespielt = 0 %**)
  - Status-Badges bleiben neutral (Emoji trägt Bedeutung)
  - **„Kein Platin“ nur wenn explizit in Excel vorhanden** (kein Fallback)
  - Bei Mischzuständen (z. B. PS4 gespielt, PS5 ungespielt) bleibt das Layout konsistent
