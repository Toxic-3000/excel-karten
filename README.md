# Build 7.0t-A4

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0t-A4

- **Sortiermenü neu sortiert (wie die Karte):**
  - Reihenfolge folgt jetzt strikt der Karte: **ID → Titel → Quelle → Verfügbarkeit → Genre → (Entwickler folgt) → Main → 100% → Metascore → Userwertung → Trophäen**.
  - Zusätzlich in **native Select‑Gruppen** (Identität / Besitz / Einordnung / Spielzeit / Bewertungen / Trophäen), damit Android/iOS weniger „zufällig“ wirkt.
  - **Plattform** und **Entwickler** sind als **disabled Platzhalter** vorbereitet (erscheinen als „… folgt“).

- **Modal-/Scroll-Fix (persistenter Top‑Gap behoben):**
  - Das Dialog‑Overlay spannt jetzt **immer 100dvh** (statt VisualViewport‑Offsets), damit es **nicht dauerhaft „zu klein“** startet.
  - Die Bottom‑Sheet‑Höhe wird ebenfalls gegen **100dvh** berechnet (stabil, unabhängig vom vorherigen Scroll‑Zustand).
  - Hintergrund wird weiterhin per **body-position lock** eingefroren.

- **Header-Fix im Dialog:**
  - Das **X** sitzt jetzt sauber rechts mit Abstand (kein „an der Überschrift kleben“).

---

## Was vorher schon drin war (7.0s-A)

- **Trophäen-Sektion aufgeräumt:**
  - „Trophäenstatus“ heißt jetzt **„Trophäen“**.
  - In „Trophäen“ gibt es zusätzlich **Fortschritts‑Presets**: `≤3`, `≤5`, `≥90%`, `≥75%`.

- **Schnellfilter als reine Icons (2 Zeilen):**
  - Zeile 1: ⭐ ⏳ 💤 ✅ 💎
  - Zeile 2: 🎯 (≤3 fehlen), 🔥 (≥90%), ⏱️ (Main ≤5h)

- **Neue Sortieroptionen:**
  - **Trophäen‑Fortschritt (%)**
  - **Offene Trophäen (Anzahl)**

- **Bugfix (Trophäen‑Fortschritt, konsistent):**
  - **Alle** Fortschritts‑Presets (`≤3`, `≤5`, `≥90%`, `≥75%`) berücksichtigen jetzt **nur Spiele mit tatsächlich offenen Trophäen** (`open > 0`).
  - Mixed‑Plattform‑Fälle funktionieren weiterhin: z. B. **PS4 Platin**, aber **PS5 noch offen** → zählt korrekt.

- **Mini‑UI‑Feinschliff:**
  - Schnellfilter‑Icon für **≥90%** ist jetzt **🔥** (statt „🔢“), damit es sich klar von ✅/💎 unterscheidet.

- **UI-Fix:**
  - Die Summary‑Texte (z. B. „Alle“) in den Akkordeon‑Köpfen haben jetzt eine **fixe Breite** und stehen dadurch in der Gesamtansicht **sauber untereinander**.

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
- Sortieren (Dialog): **ID**, **Titel**, **Quelle**, **Verfügbarkeit**, **Genre**, **Main**, **100%**, **Metascore**, **Userwertung**, **Trophäen‑Fortschritt (%)**, **Offene Trophäen (Anzahl)**
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

