# Build 7.0p-A

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0p-A

- **Filter-Badges: Auswahl leuchtet jetzt überall blau auf**
  - Plattform / Quelle / Verfügbarkeit / Trophäenstatus zeigen den **Pressed‑State** wie die Primärfilter.
  - Dadurch sind gesetzte Filter im jeweiligen Bereich sofort sichtbar und direkt wieder abwählbar.

- **Schnellfilter als Icons (statt Text)**
  - ⭐ Favoriten
  - ⏳ In Arbeit
  - 💤 Ungespielt
  - ✅ 100%
  - 💎 Platin

- **Sortiermenü umgebaut (ruhiger & schneller):**
  - Im Dialog ist „Sortieren nach“ jetzt ein **Dropdown** statt vieler Chips (weniger Umbruch‑Chaos auf Mobile).
  - Im FAB „Ansicht“ gibt es zusätzlich **Quick‑Sort‑Chips** für die wichtigsten Felder (ID, Titel, Meta, User, Main, 100%).
  - Sortierfeld + Richtung werden **persistiert** (LocalStorage), damit deine bevorzugte Reihenfolge bleibt.
  - Tie‑Breaker: Bei gleichen Werten wird stabil nach **ID** sortiert (weniger „Zittern“ bei ähnlichen Daten).

- **Bugfix: Trophäen-Filter „In Arbeit“**
  - „Trophäen Fortschritt“ wird als **erhalten/gesamt** ausgewertet (z. B. `PS3:50/50`).
  - **100%** bedeutet jetzt: **keine offenen Trophäen mehr** (alle Einträge `a==b`).
  - **In Arbeit** bedeutet: **mindestens ein Eintrag** mit `0 < a < b`.
  - Dadurch erscheinen **abgeschlossene Spiele nicht mehr** im Filter „In Arbeit“.
  - **Platin** / **Kein Platin** bleiben unabhängig und können mit „In Arbeit“ koexistieren (z. B. DLC offen).

## Enthaltene Features (aus 7.0k-K und vorher)

- **FAB „Ansicht“ (unaufdringlich, kein Sticky‑Menü):**
  - Unten rechts ein kleiner Button **„Aa“**.
  - Öffnet ein kompaktes Panel für **Textgröße (A–A+++)** und **Sortierrichtung (↑/↓)**.
  - Enthält auch **„Filter & Sortieren“** → du kommst überall in der Liste schnell an die Optionen, ohne hochzuscrollen.

- **Typografie: klarere Rollen (Label vs. Inhalt) ohne kleinere Schrift:**
  - Labels wirken „UI‑mäßiger“ (leichter, minimal mehr Letter‑Spacing), Inhalte lesen sich stärker.
  - Zahlen nutzen tabellarische Ziffern; Slash/Trennzeichen sind bewusst leiser.
  - Infoblock ist minimal größer skaliert (Leseblock‑Priorität).

- **Skalierung fein & lesbar:**
  - Schritte sind bewusst klein (A / A+ / A++ / A+++) und die Basisschrift ist leicht größer.

- **Desktop‑Lesbarkeit:**
  - Font‑Stack für Desktop angepasst (bevorzugt Segoe UI Variable, wenn vorhanden) + bessere Text‑Rendereinstellung.

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
- ✅ 7.0k-I → **Typografie‑Feinschliff** (Label/Value‑Hierarchie, Zahlenbild) + **Scores no‑wrap** + **Skalierung feinere Schritte**
- ✅ 7.0k-K → **FAB „Ansicht“** (Textgröße + Sort‑Richtung immer erreichbar) + **Typo‑Rollen klarer** + **Desktop‑Font‑Stack**
- ✅ 7.0l-A → **Trophäen-Logik-Fix**: „In Arbeit“ basiert auf offenen Trophäen (earned/total) statt „irgendein Fortschritt“
- ✅ 7.0n-A → **Sortiermenü-Rework** (Dropdown im Dialog + Quick-Sort im FAB + Sort-Persistenz)
- ⏭️ Nächstes Thema: **Header/Controls** weiter beruhigen (Spacing, evtl. Optionen gruppieren)


## Kartenkopf – Trophäenbadges (Header)

Im Kartenkopf wird der Trophäenstatus bewusst **kompakt** gehalten.

- Standard: **1 Badge**
- Ausnahme: **Platin + offene Trophäen** → **2 Badges**: `[Platin] [In Arbeit]`

Regeln:
- **Platin + 100%** → im Header **nur** `[Platin]` (wie bisher)
- **Kein Platin** erscheint **nicht** im Header (nur im Trophäen-Akkordeon)
- **100% ohne Platin** → `[100%]`
- **In Arbeit ohne Platin** → `[In Arbeit]`

Die Regeln betreffen ausschließlich die **Header-Anzeige**. Die Detailanzeige im Akkordeon bleibt unverändert.

