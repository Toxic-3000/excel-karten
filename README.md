# Spieleliste – Build V7_1k63u

CSS-Entschlackung Phase J+K (Optik weiterhin wie V7_1j62e).

## Änderungen in V7_1k63u (gegenüber V7_1k63t)

This build further refines the desktop and tablet layouts following user feedback.  The most visible change is that the header now disappears as soon as you begin scrolling, rather than only after a long scroll — providing more reading space.  The side gutters have been reduced a little more and balanced with extra top and bottom breathing room so cards no longer feel glued to the screen edges.  All accordion sections (Beschreibung, Store, Humorstatistik, Trophäen, Eastereggs) now share consistent internal padding and the Store and Humorstatistik panels always take up equal widths when displayed side‑by‑side.  Mini cards on portrait tablets open across both columns again (Kompaktbreite), and their titles are slightly smaller to reduce line wrapping.  See `styles.css` for the new padding rules and `app.js` for the early header hide logic.

## Nicht geändert
The primary visual language and functionality of the UI remain unchanged. Phone layouts are unaffected by these desktop/tablet adjustments.
