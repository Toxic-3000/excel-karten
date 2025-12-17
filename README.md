# Spieleliste Webansicht v6.10
Änderungen:
- Kompaktansicht: Genre wird direkt angezeigt (als Chip).
- Detail/Mehr Details: zeigt Subgenre (falls vorhanden) statt Genre.
- ID-Badge farblich hervorgehoben.
- Mobile-Layout aufgeräumt: Card-Header stapelt sich, Badges/Plattformen wirken weniger „versetzt“.
- Store-Link: echter Excel-Hyperlink wird gelesen (cell.l.Target).
- Toggle-Text: Mehr/Weniger Details abhängig vom Zustand.
- v6.10: ID-Badge dunkler blau; Humorstatistik separat ausklappbar; Summary-Texte anzeigen/verbergen zustandsabhängig (Beschreibung/Store/Trophäen/Humor).
- v6.10: Startet nach dem XLSX-Laden immer in Kompaktansicht; Badge-Zeile fest unter dem Titel (kein Verrutschen durch lange Titel).
- v6.10: Genre-Chip in Kompaktansicht wieder sichtbar (unter ID/Plattform).
- v6.10: XLSX-Laden robuster (lokal + CDN-Fallback) + sichtbare Fehlbox bei JS/XLSX-Problemen.
- v6.10: Sichtbarer Build-Stamp + XLSX per CDN-Script-Tag (Deployment-/Cache-Check).

