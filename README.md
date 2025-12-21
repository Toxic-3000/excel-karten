# Build 7.0i-A

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0i-A

- **Store wieder vor Trophäen:** Reihenfolge der Aufklappbereiche ist wieder **Beschreibung → Store → Trophäen → Humorstatistik**.
- **Trophäen-Texte je Ansicht:** Hochformat nutzt kompakte Labels (z. B. **⏳ Platin**, **⏳ 100%**), Querformat/Desktop nutzt ausführlichere Texte (z. B. **⏳ Platin in Arbeit**, **✅ 100% erlangt**).
- **Noch ruhigeres Badge-Layout:** Badges minimal kleiner, Genre etwas dunkler, mehr Abstand zwischen Genre und Trophäenstatus.
- **Schatten stärker:** Karten heben sich deutlicher vom Hintergrund ab.


## Feature‑Überblick

- XLSX lokal auswählen und einlesen (Sheet: „Spieleliste Komplett“)
- Suche über Titel/Genre/Subgenre/Entwickler
- Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main‑Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
- Filter: Favorit, Plattform, Quelle, Verfügbarkeit
- Kartenlayout:
  - Kopf: **ID links**, **Favorit‑Icon rechts**, Titel darunter
  - Badge‑Zeilen: Plattform(en); Quelle+Verfügbarkeit; Genre; Trophäen‑Status
  - Info‑Block: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
  - Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen, Humorstatistik
- Store‑Link übernimmt **Linktext + URL** aus der Excel

## Fix‑/Build‑Plan

- ✅ 7.0d → Filterbegriffe: **🕒 Main‑Story** / **🕒 Komplett**
- ✅ 7.0e → Store‑Sektion zweispaltig
- ✅ 7.0f → Badge‑Farben & ruhiger (neutralere Standard‑Badges, Quelle etwas dunkler)
- ✅ 7.0g2 → **Unbekannte Quelle eindeutig** + **Quelle‑Icons im Filter entschlackt**
- ✅ 7.0h3 → **Global responsive Grundlayout** + **Querformat/Meta‑Blöcke kompakter**
- ✅ 7.0h5 → **Statischer Hintergrund** + **mehr Kartenabstand (ruhigeres Scrollen)**
- ✅ 7.0i-A → **Variante A final** + **Store vor Trophäen** + **Trophäen‑Labels je Ansicht**
- ⏭️ Nächstes Thema: **Schrift/Lesbarkeit** (Desktop‑Typo schöner + konsistenter)
