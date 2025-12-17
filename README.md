# Spieleliste Webansicht v6.8
Änderungen:
- Kompaktansicht: Genre wird direkt angezeigt (als Chip).
- Detail/Mehr Details: zeigt Subgenre (falls vorhanden) statt Genre.
- ID-Badge farblich hervorgehoben.
- Mobile-Layout aufgeräumt: Card-Header stapelt sich, Badges/Plattformen wirken weniger „versetzt“.
- Store-Link: echter Excel-Hyperlink wird gelesen (cell.l.Target).
- Toggle-Text: Mehr/Weniger Details abhängig vom Zustand.
- v6.8: ID-Badge dunkler blau; Humorstatistik separat ausklappbar; Summary-Texte anzeigen/verbergen zustandsabhängig (Beschreibung/Store/Trophäen/Humor).
- v6.8: Startet nach dem XLSX-Laden immer in Kompaktansicht; Badge-Zeile fest unter dem Titel (kein Verrutschen durch lange Titel).
- v6.8: Genre-Chip in Kompaktansicht wieder sichtbar (unter ID/Plattform).
- v6.8: Detailansicht: Beschreibung/Store/Trophäen/Humorstatistik sind jetzt dem Haupt-Details-Block untergeordnet (wie „komplett ausgeklappt“ in Kompakt).
- v6.8: Toggle-Texte (anzeigen/verbergen) rein per CSS (zwei Spans), kein JS-Toggle-Handler mehr → weniger Lag, kein Sofort-Zuklappen.
- v6.8: Alle toggleDetails-Summaries nutzen data-more/data-less.

