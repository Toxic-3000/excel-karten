# Build 7.0j-B

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0j-B

- **Suche ist schlauer:** Reine Zahl (z. B. `2064`) oder `ID:2064`/`#2064` matcht direkt auf die **ID (1–4 stellig)**.
- **Dialogtext vereinfacht:** Im Startzustand steht jetzt „Wähle deine **Spieleliste.xlsx** aus.“
- **Eastereggs hinzugefügt:** Neues aufklappbares Feld **Eastereggs** (Textfeld wie Beschreibung).
  - **Hochformat:** Eastereggs steht **unter Humorstatistik**.
  - **Querformat:** Store & Humorstatistik bleiben nebeneinander; **Eastereggs nimmt die volle Breite darunter ein** und sitzt **über den Trophäen**.

- **Sortier/Filter‑Menü aufgeräumt:** Abstände zwischen Überschriften und Chip‑Reihen sind konsistenter.
- **„Nur Favoriten“ ist jetzt ein Chip‑Toggle** (kein Checkbox‑Look mehr), damit es visuell zu den übrigen Filtern passt.


## Feature‑Überblick

- XLSX lokal auswählen und einlesen (Sheet: „Spieleliste Komplett“)
- Suche über **ID**, Titel/Genre/Subgenre/Entwickler
- Sortieren: ID, Titel, Metascore, Userwertung, 🕒 Main‑Story, 🕒 Komplett, Genre, Quelle, Verfügbarkeit
- Filter: Favorit, Plattform, Quelle, Verfügbarkeit
- Kartenlayout:
  - Kopf: **ID links**, **Favorit‑Icon rechts**, Titel darunter
  - Badge‑Zeilen: Plattform(en); Quelle+Verfügbarkeit; Genre; Trophäen‑Status
  - Info‑Block: Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
  - Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen, Humorstatistik, Eastereggs
- Store‑Link übernimmt **Linktext + URL** aus der Excel

## Fix‑/Build‑Plan

- ✅ 7.0d → Filterbegriffe: **🕒 Main‑Story** / **🕒 Komplett**
- ✅ 7.0e → Store‑Sektion zweispaltig
- ✅ 7.0f → Badge‑Farben & ruhiger (neutralere Standard‑Badges, Quelle etwas dunkler)
- ✅ 7.0g2 → **Unbekannte Quelle eindeutig** + **Quelle‑Icons im Filter entschlackt**
- ✅ 7.0h3 → **Global responsive Grundlayout** + **Querformat/Meta‑Blöcke kompakter**
- ✅ 7.0h5 → **Statischer Hintergrund** + **mehr Kartenabstand (ruhigeres Scrollen)**
- ✅ 7.0i-A → **Variante A final** + **Store vor Trophäen** + **Trophäen‑Labels je Ansicht**
- ✅ 7.0j-A → **Smartere ID‑Suche** + **Dialogtext kürzer** + **Eastereggs‑Sektion**
- ⏭️ Nächstes Thema: **Schrift/Lesbarkeit** (Desktop‑Typo schöner + konsistenter)
