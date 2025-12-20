# Spieleliste Webansicht – Clean Rebuild (Build 7.0g)

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

## Änderungen in Build 7.0g (nur dieses Thema)
- **Quellen-Badges auf den Karten (minimalistisch):**
  - Nur bei **Unbekannt** wird das Symbol auf der Karte angezeigt: **🏷️ Unbekannt**
  - **Digital / Retail-Disc / PS-Plus** bleiben **ohne Symbol** (ruhig wie zuvor)
  - Filter-/Sortiermenü bleibt unverändert (🏷️-Symbolik dort bleibt wie in 7.0f)

## Nächster Build (Fixplan)
- 7.0h → Trophäen-UI ruhig & final
