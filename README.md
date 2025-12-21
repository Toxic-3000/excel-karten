# Build 7.0i

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0i

- **Mehr „Luft“ + klarer Karten‑Schatten:** Kartenabstand verdoppelt und Schatten sichtbar dunkler (ruhigeres Scrollen).
- **Badge‑Kopf jetzt in 4 Zeilen (immer einheitlich):**
  1) Plattform(en)  
  2) Quelle + Verfügbarkeit  
  3) Genre (kleiner & dunkler)  
  4) Trophäenstatus (neutral, Status nur über kleinen Punkt)
- **Trophäen‑Block beruhigt:** Pro Plattform eine Zeile mit **3 Badges nebeneinander** (Plattform | Platin‑Status | 100%‑Status) und **darunter** Text + Progressbar.
- **Keine knalligen Trophäenfarben mehr:** Badges sind neutral, ohne grün/gelb als Flächenfarbe.

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
- ✅ 7.0i → **Header‑Badges in 4 Zeilen** + **Trophäen‑Block ruhig & neutral**
- ⏭️ Nächstes Thema: **Schrift/Lesbarkeit** (Desktop‑Typo schöner + konsistenter)
