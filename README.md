# Build 7.0j-GA3

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0j-GA3

- **Suche ist schlauer:** Reine Zahl (z. B. `2064`) oder `ID:2064`/`#2064` matcht direkt auf die **ID (1–4 stellig)**.
- **Dialogtext vereinfacht:** Im Startzustand steht jetzt „Wähle deine **Spieleliste.xlsx** aus.“
- **Eastereggs hinzugefügt:** Neues aufklappbares Feld **Eastereggs** (Textfeld wie Beschreibung).
  - **Hochformat:** Eastereggs steht **unter Humorstatistik**.
  - **Querformat:** Store & Humorstatistik bleiben nebeneinander; **Eastereggs nimmt die volle Breite darunter ein** und sitzt **über den Trophäen**.

- **Genre-Filter im Dialog:** Einfaches Dropdown (ohne Tipp‑Suche) mit **Mehrfachauswahl**. Optionen werden aus der XLSX aufgebaut.

- **Bugfix (Multi-Select Genre):** Wenn mehrere Genres markiert sind, werden jetzt **alle** berücksichtigt (auf mobilen Browsern wird die Auswahl beim „Anwenden“ zuverlässig synchronisiert).

- **Bugfix:** XLSX‑Import stürzt nicht mehr ab (Genre‑Dropdown wird robust initialisiert).

- **„⭐ Nur Favoriten“ ist wieder da:** Der Favoriten‑Filter ist als eigener Abschnitt sichtbar.
- **Mehr Luft zwischen Chips:** Chip‑Abstände funktionieren jetzt stabil auch auf mobilen Browsern, in denen "flex-gap" zickt.
- **Sortierrichtung ist blau:** „Aufsteigend/Absteigend“ nutzt jetzt einen blauen Akzent (die Sortierfelder bleiben grün).
- **🏷️ nur in der Kartenansicht:** Das 🏷️‑Symbol bleibt oben auf den Karten erhalten, wird aber **im Filter/Sortier‑Dialog** nicht mehr angezeigt (ruhiger).


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
