# Build 7.0k-H

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0k-H

- **Info‑Block: Lesbarkeit & Rhythmus finalisiert**
  - **Lebenszeit** ist **nicht mehr** im Info‑Block (bleibt ausschließlich in der **Humorstatistik**).
  - **Genre → Subgenre → Entwickler** bleiben **stacked** (volle Breite).
  - **Neue Trennlinien:**
    - Feine Linie zwischen **Subgenre ↔ Entwickler**
    - Deutlichere Linie zwischen **Entwickler ↔ Kennzahlen**
  - **Werteblock neu ausbalanciert (auch bei A+ stabil):**
    - **Spielzeit** als Primärwert (mit ruhigem Separator darunter)
    - **Metascore + Userwertung** als Paar (ohne Linie dazwischen)
    - Werte **rechtsbündig**, Zahlen als **tabellarische Ziffern**, Slash optisch ruhiger

- **Store & Humorstatistik typografisch vereinheitlicht**
  - Beide Bereiche nutzen jetzt das gleiche **Label/Wert‑Schema** wie der Werteblock (ruhiger, weniger „Badge‑/Formular‑Gefühl“).
  - In der **Humorstatistik** ist **Gesamtstunden** der Primärwert; **% Lebenszeit** und **Jahre** sind Sekundärwerte (ohne harte Linien zwischen ihnen).

- **Querformat (Landscape): Info‑Block nutzt den Platz**
  - Der rechte Kartenbereich (Info‑Block) ist im Landscape **breiter**, damit Subgenre/Entwickler weniger gequetscht werden.

## Enthaltene Features (aus den vorherigen Builds)


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
  - Badge‑Zeilen: Plattform(en); Quelle+Verfügbarkeit; Trophäen‑Status
  - Info‑Block: Genre, Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
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
- ✅ 7.0k-A → **Typografie‑Pass** (weniger Fettschrift, ruhigere Zeilenhöhe, stabilere Zahlen)
- ✅ 7.0k-B → **Textgröße-Schalter** (A/A+/A++, Badges & UI skalieren mit)
- ✅ 7.0k-C → **Skalierung-Fixes** (Spacing + Grid‑Overflow bei A++)
- ✅ 7.0k-D → **Form‑Controls erben Font** + **Info‑Grid flexibler** (verhindert „Rauswandern“ bei A++)
- ✅ 7.0k-E → **Skalierung feiner** + **Header Mobile aufgeräumt** + **Info‑Umbruch angenehmer**
- ✅ 7.0k-G → **Info‑Block Hybrid** (Genre als Text, Subgenre/Entwickler stacked, Kennzahlen als Tabelle)
- ✅ 7.0k-H → **Typo-Schema auf Store & Humorstatistik** + **Werteblock-Rhythmus** + **Landscape Info breiter**
- ⏭️ Nächstes Thema: **Desktop‑Lesbarkeit** feinjustieren (Font‑Stack, Zeilenlänge, Kontrast)
