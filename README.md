# Spieleliste – Webansicht (GitHub Pages)

Enthalten:
- index.html
- styles.css
- app.js
- lib/xlsx.full.min.js  (lokal, mit CDN-Fallback in app.js)

## Start lokal (ohne GitHub)
1) Ordner in VS Code öffnen
2) Einen lokalen Webserver starten (wichtig: nicht per file://)
   - z.B. in VS Code: „Live Server“
   - oder im Terminal: `python -m http.server 8000`
3) Browser öffnen: http://localhost:8000
4) XLSX über „XLSX auswählen“ laden, Sheet wählen.

## GitHub Pages
- Repo erstellen, Dateien ins Root legen (index.html im Root)
- GitHub Pages aktivieren (Branch/Root)
- Wenn GH-Pages „alte Version“ cached: Versionsstring in index.html/styles/app erhöhen:
  - index.html: ?v=20251217-1
  - app.js: VERSION-Konstante anpassen
