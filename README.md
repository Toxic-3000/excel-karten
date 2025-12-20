# Build 7.0g.1

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0g.1

- **Quellen‑Badge auf der Karte:** Wenn die Quelle **Unbekannt** ist, wird sie jetzt eindeutig als **„❓ Unbekannt“** dargestellt.
- **Filter & Sortieren → Quelle:** Die **Icons/Symbole wurden bei Digital / PS‑Plus / Retail‑Disc entfernt** (um Verwirrung zu vermeiden). **Nur „Unbekannt“** bekommt weiterhin ein klares Symbol (**❓**).

## Feature‑Überblick

- XLSX lokal auswählen und einlesen (Sheet: „Spieleliste Komplett“)
- Suche über Titel/Genre/Subgenre/Entwickler
- Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main‑Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
- Filter: Favorit, Plattform, Quelle, Verfügbarkeit
- Kartenlayout:
  - Kopf: **ID links**, **Favorit‑Icon rechts**, Titel darunter
  - Badge‑Zeilen: Plattform(en) + Quelle + Verfügbarkeit; Genre; Trophäen‑Status
  - Info‑Block: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
  - Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen, Humorstatistik
- Store‑Link übernimmt **Linktext + URL** aus der Excel

## Fix‑/Build‑Plan

- ✅ 7.0d → Filterbegriffe: **🕒 Main‑Story** / **🕒 Komplett**
- ✅ 7.0e → Store‑Sektion zweispaltig
- ✅ 7.0f → Badge‑Farben & ruhiger (neutralere Standard‑Badges, Quelle etwas dunkler)
- ✅ 7.0g.1 → **Unbekannte Quelle eindeutig** + **Quelle‑Icons im Filter entschlackt**
- ⏭️ 7.0h → Trophäen‑UI ruhig & final (Redesign)

