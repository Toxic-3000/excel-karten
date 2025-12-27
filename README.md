# Build 7.0v-D1d

Dieses Repo ist eine **statische, mobile‑first Webansicht** für deine Excel‑Spieleliste.

## Was neu ist in 7.0v-D1d

- **Mobile (Android) Sortiermenü abgeschlossen:**
  - Sortieren nach **Plattform** (Primärplattform nach Priorität: PS5 > PS4 > PS3 > Vita).
  - Sortieren nach **Entwickler** (erster Entwickler-Eintrag, normalisiert; führendes „The “ wird nur fürs Sortieren ignoriert).
  - Stabile Tie‑Breaker: erst Titel, dann ID (damit Sortierung nicht „wackelt“).


- **Desktop Menü übersichtlicher (Dialog):**
  - **Sortieren** als kompaktes Dropdown statt Chip‑Wolke.
  - **Genre** als Dropdown‑Liste (Multi‑Select), **ohne Suchfeld** – scrollen reicht.
  - Hintergrund: keine nativen `<select>`‑Overlays im Desktop‑Dialog (verhindert Fokus/Scroll‑Probleme).

- **Genre‑Auswahl jetzt sauber synchronisiert:**
  - Wenn du Genres **über das Filterfeld (Chips mit X)** entfernst, wird das **sofort** im Genre‑Dropdown reflektiert (keine „hängenden“ Häkchen mehr).
  - Die Dropdown‑Beschriftung ist kompakt: `Genre: <erstes> +N`.

- **Desktop‑Dialog wirkt weniger „abgeschnitten“:**
  - Der Sheet‑Dialog hat auf Desktop jetzt einen kleinen Rahmen (oben/unten), statt nur unten zu kleben.
  - Kleinere Typo‑Tuning‑Anpassungen an den Desktop‑Dropdowns.

---

## Übernommen aus 7.0v-D
- **Desktop-Lesbarkeit (nur Desktop, Portrait/Mobile unverändert):**
  - Ruhigere Typografie (etwas mehr Zeilenhöhe) + größere Innenabstände.
  - Prosa bekommt eine angenehmere Zeilenlänge (kein „über die ganze Karte laufen“).
  - Dezentes Hover-Feedback auf Akkordeon-Headern (nur Desktop).


- **Suche V2 (präziser + robuster, ohne extra UI):**
  - Feldsuche unterstützt jetzt **Quotes** für Werte mit Leerzeichen: `genre:"Action Adventure"`.
  - `:` bedeutet **enthält** (Teiltreffer), `=` bedeutet **exakt**: z. B. `id=643` oder `genre="Action Adventure"`.
  - Negationen sind konsequent: `-genre:sport`, `-dev:ubisoft`.
  - Freitext ist „freundlicher“ bei Trennzeichen: **Bindestriche/Slashes** werden bei der Suche wie Leerzeichen behandelt (z. B. „Point-and-Click“).
  - Freitext nutzt AND-Semantik über Tokens (mehrere Worte müssen vorkommen, Reihenfolge egal).

- **README aktualisiert (gebündelt):**
  - vB/vB1/vB2 und die neue Suchsyntax sind jetzt konsistent dokumentiert.

- **Regressionsschutz bleibt aktiv (unsichtbar im Normalbetrieb):**
  - Wenn **XLSX** oder **app.js** fehlt/abbricht, erscheint eine klare Meldung (kein „Button tut nichts“).
  - Meldungen werden nur im Fehlerfall angezeigt (unter der Suche / im „Excel laden“-Kasten), und „Excel auswählen“ wird dann deaktiviert.

---

## Übernommen aus 7.0v-A

- **Suche: Freitext + Feldsuche (mit ⓘ‑Suchhilfe):**
  - Standard: Freitext sucht global über mehrere Felder.
  - Feldsuche per Präfix: `id:643` · `titel:metro`/`t:metro` · `genre:adventure`/`g:adventure` · `sg:horror` · `dev:remedy` · `quelle:psn` · `verfügbarkeit:delisted` · `p:ps5`.
  - Ausschließen: `-genre:sport`.
  - Such‑Hilfe ist standardmäßig verborgen und wird über das **ⓘ** neben der Suche geöffnet.

- **Genre‑Dropdown im Sortiermenü (Multi‑Select, sauber):**
  - Gewählte Genres werden im Picker **sichtbar markiert**.
  - **„Alle“ ist exklusiv**: Sobald 1+ Genres aktiv sind, wird „Alle“ zuverlässig abgewählt/deaktiviert.
  - Wenn keine Genres mehr gewählt sind, springt es automatisch zurück auf „Alle“.

- **Trophäen‑Badges im Sortiermenü (Status):**
  - Platin / 100% / In Arbeit / Ungespielt / … nutzen **inaktiv** die gleiche neutrale Optik wie z. B. Verfügbarkeit.
  - **Aktiv‑Einfärbung bleibt**, Fortschritts‑Presets (≤3, ≤5, ≥90%, ≥75%) bleiben unverändert.

---

## Was vorher schon drin war (7.0u-A1)

- **Pull-to-Refresh deaktiviert (Android/Chrome):**
  - Kein versehentliches Seiten-Reload mehr durch Runterziehen am Listenanfang.

- **Badge-Konsistenz (Trophäen):**
  - Trophäen-Badges sind jetzt in der Kartenansicht in der Breite näher an den übrigen Badges.
  - Hervorhebung läuft weiterhin über Stil/Färbung statt über „Sondergröße“.

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

- **Suche ist schlauer:**
  - Reine Zahl (z. B. `2064`) oder `ID:2064`/`#2064` matcht direkt auf die **ID (1–4 stellig)**.
  - Feldsuche per Präfix (z. B. `genre:adventure`, `dev:remedy`) + Ausschluss per `-…`.

- **Such‑Hilfe ist unaufdringlich:**
  - Standardmäßig verborgen; per Tap auf das **ⓘ** rechts neben der Suche werden Beispiele eingeblendet.

- **Dialogtext vereinfacht:** Im Startzustand steht jetzt „Wähle deine **Spieleliste.xlsx** aus.“

- **Eastereggs hinzugefügt:** Neues aufklappbares Feld **Eastereggs** (Textfeld wie Beschreibung).
  - **Hochformat:** Eastereggs steht **unter Humorstatistik**.
  - **Querformat:** Store & Humorstatistik bleiben nebeneinander; **Eastereggs nimmt die volle Breite darunter ein** und sitzt **über den Trophäen**.

- **Genre-Filter im Dialog:** Einfaches Dropdown (ohne Tipp‑Suche) mit **Mehrfachauswahl**. Optionen werden aus der XLSX aufgebaut.
  - Gewählte Genres sind sichtbar markiert.
  - **„Alle“ ist exklusiv** (siehe „Was neu“).

- **Bugfix (Multi-Select Genre):** Wenn mehrere Genres markiert sind, werden jetzt **alle** berücksichtigt (auf mobilen Browsern wird die Auswahl beim „Anwenden“ zuverlässig synchronisiert).

- **Bugfix:** XLSX‑Import stürzt nicht mehr ab (Genre‑Dropdown wird robust initialisiert).

- **„⭐ Nur Favoriten“ ist wieder da:** Der Favoriten‑Filter ist als eigener Abschnitt sichtbar.
- **Mehr Luft zwischen Chips:** Chip‑Abstände funktionieren jetzt stabil auch auf mobilen Browsern, in denen "flex-gap" zickt.
- **Sortierrichtung ist blau:** „Aufsteigend/Absteigend“ nutzt jetzt einen blauen Akzent (die Sortierfelder bleiben grün).
- **🏷️ nur in der Kartenansicht:** Das 🏷️‑Symbol bleibt oben auf den Karten erhalten, wird aber **im Filter/Sortier‑Dialog** nicht mehr angezeigt (ruhiger).


## Feature‑Überblick

- XLSX lokal auswählen und einlesen (Sheet: „Spieleliste Komplett“)
- Suche: global + Feldsuche (Präfixe wie `id:`/`genre:`/`dev:`)
- Sortieren (Dialog): **ID**, **Titel**, **Quelle**, **Verfügbarkeit**, **Genre**, **Main**, **100%**, **Metascore**, **Userwertung**, **Trophäen‑Fortschritt (%)**, **Offene Trophäen (Anzahl)**
- Filter: Favorit, Plattform, Quelle, Verfügbarkeit, Genre (Multi‑Select)
- Kartenlayout:
  - Kopf: **ID links**, **Favorit‑Icon rechts**, Titel darunter
  - Badge‑Zeilen: Plattform(en); Quelle+Verfügbarkeit; Trophäen‑Status
  - Info‑Block: Genre, Subgenre, Entwickler, Spielzeit, Metascore, Userwertung
  - Aufklappbar: Beschreibung, Store (zweispaltig), Trophäen, Humorstatistik, Eastereggs
- Store‑Link übernimmt **Linktext + URL** aus der Excel


## Ist‑Zustand (Build 7.0v-D1d)

- ✅ Kompaktansicht‑only (Variante A), stabiler Kartenheader + Akkordeon‑Reihenfolge: **Beschreibung → Store → Trophäen → Humorstatistik**
- ✅ Excel‑Import rein clientseitig (keine Server‑Abhängigkeit)
- ✅ Filter/Sortiermenü stabil in Portrait & Landscape; Landscape-Header nutzt mehr Breite (Actions rechts, Suche volle Zeile)
- ✅ Genre‑Multi‑Select inkl. „Alle“‑Exklusivität (deterministisch)
- ✅ Trophäen‑Statusbadges im Sortiermenü inaktiv neutral, aktiv farbig; Fortschritts‑Presets unverändert
- ✅ Suche: ID‑Shortcuts + Feldsuche (Quotes, '=' exakt, '-' Negation) + Such‑Hilfe über ⓘ
- ✅ Regressionschutz: Fehlermeldungen nur im Fehlerfall; „Excel auswählen“ wird bei fehlender XLSX/app.js automatisch deaktiviert
- ℹ️ Bekannte Eigenheit (Mobile‑Picker): Manche Browser aktualisieren Häkchen im nativen Multi‑Select visuell erst nach Schließen/Neuöffnen – der Filterzustand selbst ist korrekt.


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
- ✅ 7.0u-A1 → Pull-to-Refresh aus + Badge‑Konsistenz (Trophäen)
- ✅ 7.0u-A2 (Zwischenpfad) → Genre‑Picker markiert Auswahl + Statusbadges im Sortiermenü inaktiv neutral
- ✅ 7.0u-A2d → JS‑Fix: Buildlabel/Excel‑Buttons wieder funktionsfähig
- ✅ 7.0u-A2f → Genre „Alle“ exklusiv/deterministisch stabilisiert
- ✅ 7.0u-A2g → Feldsuche + ausklappbare Such‑Hilfe
- ✅ 7.0v-A → Konsolidierung & Dokumentation (Referenzstand)
- ✅ 7.0v-B → Regressionsschutz (Fehlermeldungen + Auto-Disable, ohne den Header zu "verplakatieren")
- ✅ 7.0v-B1 → Header/Controls beruhigt: Such‑Hilfe als **ⓘ** + Landscape stapelt Suche
- ✅ 7.0v-B2 → Landscape-Header: Actions rechtsbündig, Statuschips geordnet (Datei | Treffer | XLSX)
- ✅ 7.0v-C → Suche V2 (Quotes, '=' exakt, Negationen konsistent) + README konsolidiert

- ⏭️ Nächstes Thema (regulärer Patchplan): **Desktop‑Lesbarkeit** (Typo/Spacing)


## Zwischenbuilds 7.0u-A2 (Patchablauf im Detail)

- **A2b:** Paketstruktur für GitHub Pages „flach“ gemacht (alle Dateien im Root).
- **A2c:** Diagnose‑Overlay eingebaut (macht Script‑/Asset‑Fehler sichtbar).
- **A2d:** Parse-/Syntax‑Fehler in `app.js` beseitigt (war der Grund für „Build —“ und tote Buttons).
- **A2e/A2f:** „Alle“‑Exklusivität im Genre‑Multi‑Select schrittweise gehärtet.
- **A2g:** Feldsuche + Such‑Hilfe als aufklappbarer Hint unter dem Suchfeld.


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


## Geplante Funktionen/Änderungen (Roadmap)

- **Header/Controls beruhigen:** Spacing/Hierarchie weiter glätten, ggf. Gruppenbildung (ohne Funktionsverlust).
- **Suche erweitern:** zusätzliche Präfixe (z. B. Metascore/Userwertung/Spielzeit), ggf. einfache Operatoren/Ranges (>=, <=, ..) und optionale OR‑Gruppen.
- **Desktop‑Lesbarkeit:** Typo‑Feinschliff für große Viewports (Zeilenlänge, Tabellenrhythmus, Badge‑Breiten).
- **Performance (große XLSX):** schnelleres Rendern (z. B. Chunking/Virtualisierung), ohne die ruhige Optik zu verlieren.


## Änderungen seit 7.0v-A (Kurzüberblick)

### 7.0v-B
- Regressionsschutz: keine "toten" Excel-Buttons mehr ohne Hinweis. Fehlermeldungen nur im Fehlerfall.

### 7.0v-B1
- Such‑Hilfe ist jetzt ein dezentes **ⓘ** rechts neben der Suche (statt Button).
- In Landscape wird der Header gestapelt, damit die Suche genug Platz hat.

### 7.0v-B2
- Landscape: **Excel auswählen** + **Filter & Sortieren** rechtsbündig.
- Statuschips (Datei/Treffer/XLSX) ruhiger geordnet.

### 7.0v-C
- Suche V2: Quotes (`genre:"Action Adventure"`), exakt über `=`, Negationen stabil, Freitext robuster bei Trennzeichen.
- README konsolidiert (Patchpfad vB–vC + aktuelle Suchsyntax).