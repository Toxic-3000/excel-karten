console.log("Build 7.0n-A loaded");
/* Spieleliste Webansicht – Clean Rebuild – Build 7.0n-A
   - Kompaktansicht only
   - Badges mit möglichst fixer Länge
   - Alle Zustände für Quelle/Verfügbarkeit werden angezeigt
   - Store Link: Linktext + echte URL aus Excel (Hyperlink) */
(() => {
  "use strict";
  const BUILD = (document.querySelector('meta[name="app-build"]')?.getAttribute("content") || "7.0n-A").trim();

  // Keep build string consistent in UI + browser title.
  document.title = `Spieleliste – Build ${BUILD}`;
  const buildLabel = document.getElementById("buildLabel");
  if (buildLabel) buildLabel.textContent = `Build ${BUILD}`;

  const $ = (id) => document.getElementById(id);

  const el = {
    file: $("file"),
    btnLoad: $("btnLoad"),
    btnLoad2: $("btnLoad2"),
    btnMenu: $("btnMenu"),
    btnTop: $("btnTop"),

    // Floating quick access (FAB)
    fabView: $("fabView"),
    fabPanel: $("fabPanel"),
    fabClose: $("fabClose"),
    fabScaleRow: $("fabScaleRow"),
    fabSortFieldRow: $("fabSortFieldRow"),
    fabSortDirRow: $("fabSortDirRow"),
    fabOpenMenu: $("fabOpenMenu"),
    search: $("search"),
    cards: $("cards"),
    empty: $("empty"),
    pillFile: $("pillFile"),
    pillRows: $("pillRows"),
    pillXlsx: $("pillXlsx"),
    dlg: $("dlg"),
    btnClose: $("btnClose"),
    btnApply: $("btnApply"),
    btnClear: $("btnClear"),
    sortFieldRow: $("sortFieldRow"),
    sortDirRow: $("sortDirRow"),
    favRow: $("favRow"),
    platRow: $("platRow"),
    srcRow: $("srcRow"),
    availRow: $("availRow"),
    trophyRow: $("trophyRow"),
    genreSelect: $("genreSelect"),
  };

  // --- UI: Sortierung (Feld + Richtung) speichern ---
  const SORT_FIELD_KEY = "spieleliste_sortField";
  const SORT_DIR_KEY   = "spieleliste_sortDir";

  const SORT_FIELDS = [
    {k:"ID", label:"ID"},
    {k:"Spieletitel", label:"Titel"},
    {k:"Metascore", label:"Metascore"},
    {k:"Userwertung", label:"Userwertung"},
    {k:"Spielzeit (Main)", label:"Main"},
    {k:"Spielzeit (100%)", label:"100%"},
    {k:"Genre", label:"Genre"},
    {k:"Quelle", label:"Quelle"},
    {k:"Verfügbarkeit", label:"Verfügbarkeit"},
  ];

  function loadSortPrefs(){
    const sf = (localStorage.getItem(SORT_FIELD_KEY) || "").trim();
    const sd = (localStorage.getItem(SORT_DIR_KEY) || "").trim();
    const validSf = SORT_FIELDS.some(x => x.k === sf);
    const validSd = (sd === "asc" || sd === "desc");
    return {
      sortField: validSf ? sf : "ID",
      sortDir: validSd ? sd : "asc",
    };
  }
  function saveSortPrefs(){
    try{
      localStorage.setItem(SORT_FIELD_KEY, String(state.sortField));
      localStorage.setItem(SORT_DIR_KEY, String(state.sortDir));
    }catch(_){/* ignore */}
  }

  const SORT_PREFS = loadSortPrefs();


  // --- UI: Textgröße (A / A+ / A++ / A+++) ---
  const UI_SCALE_KEY = "spieleliste_uiScalePreset";
  // Feiner abgestufte Skalierung + etwas größere Basisschrift (CSS): lesbarer, ohne Sprung-Gefühl.
  const UI_SCALES = [
    { id: "normal",    v: 1.00, label: "A" },
    { id: "gross",     v: 1.05, label: "A+" },
    { id: "grossplus", v: 1.10, label: "A++" },
    { id: "sehrgross", v: 1.15, label: "A+++" },
  ];

  function getScalePreset(){
    const saved = localStorage.getItem(UI_SCALE_KEY);
    if (saved && UI_SCALES.some(x => x.id === saved)) return saved;
    // Default: leicht größer (bessere Lesbarkeit)
    return "gross";
  }

  function applyScale(presetId){
    const preset = UI_SCALES.find(x => x.id === presetId) || UI_SCALES[1];
    document.documentElement.style.setProperty("--uiScale", String(preset.v));
    localStorage.setItem(UI_SCALE_KEY, preset.id);
    updateFabScaleUI();
  }

  function cycleScale(currentId){
    const idx = UI_SCALES.findIndex(x => x.id === currentId);
    return UI_SCALES[(idx + 1) % UI_SCALES.length].id;
  }

  let currentScalePreset = getScalePreset();
  applyScale(currentScalePreset);

  // No more header button: quick access lives in the FAB panel.

  function updateFabScaleUI(){
    if (!el.fabScaleRow) return;
    for (const b of el.fabScaleRow.querySelectorAll(".chip")){
      b.setAttribute("aria-pressed", b.getAttribute("data-key") === currentScalePreset ? "true" : "false");
    }
  }

  function updateFabSortUI(){
    if (!el.fabSortDirRow) return;
    for (const b of el.fabSortDirRow.querySelectorAll(".chip")){
      b.setAttribute("aria-pressed", b.getAttribute("data-key") === state.sortDir ? "true" : "false");
    }
  }

  function updateFabSortFieldUI(){
    if (!el.fabSortFieldRow) return;
    for (const b of el.fabSortFieldRow.querySelectorAll(".chip")){
      b.setAttribute("aria-pressed", b.getAttribute("data-key") === state.sortField ? "true" : "false");
    }
  }

  function closeFab(){
    if (!el.fabPanel) return;
    el.fabPanel.hidden = true;
  }

  function toggleFab(){
    if (!el.fabPanel) return;
    el.fabPanel.hidden = !el.fabPanel.hidden;
  }

  function buildFab(){
    if (!el.fabView || !el.fabPanel) return;

    // Build scale chips (explicit choose, no multi-tap cycling)
    if (el.fabScaleRow){
      el.fabScaleRow.innerHTML = UI_SCALES.map(s => chipHtml("uiScale", s.id, s.label, s.id === currentScalePreset)).join("");
    }

    // Build quick sort direction chips
    if (el.fabSortDirRow){
      el.fabSortDirRow.innerHTML = [
        chipHtml("quickSortDir", "asc", "↑ Auf", state.sortDir === "asc"),
        chipHtml("quickSortDir", "desc", "↓ Ab", state.sortDir === "desc"),
      ].join("");
    }

    // Build quick sort field chips (compact subset)
    if (el.fabSortFieldRow){
      const quick = [
        {k:"ID", label:"ID"},
        {k:"Spieletitel", label:"Titel"},
        {k:"Metascore", label:"Meta"},
        {k:"Userwertung", label:"User"},
        {k:"Spielzeit (Main)", label:"Main"},
        {k:"Spielzeit (100%)", label:"100%"},
      ];
      el.fabSortFieldRow.innerHTML = quick.map(sf => chipHtml("quickSortField", sf.k, sf.label, state.sortField === sf.k)).join("");
    }

    // Wire FAB open/close
    el.fabView.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFab();
    });
    // Clicks inside the panel should not close it.
    el.fabPanel.addEventListener("click", (e) => e.stopPropagation());
    if (el.fabClose){
      el.fabClose.addEventListener("click", (e) => { e.stopPropagation(); closeFab(); });
    }

    // Wire chips inside panel
    for (const btn of el.fabPanel.querySelectorAll(".chip")){
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const group = btn.getAttribute("data-group");
        const key = btn.getAttribute("data-key");
        if (group === "uiScale"){
          currentScalePreset = key;
          applyScale(currentScalePreset);
          return;
        }
        if (group === "quickSortField"){
          state.sortField = key;
          saveSortPrefs();
          updateFabSortFieldUI();
          applyAndRender();
          return;
        }
        if (group === "quickSortDir"){
          state.sortDir = key;
          saveSortPrefs();
          updateFabSortUI();
          applyAndRender();
          return;
        }
      });
    }

    // Open the full menu from the FAB (so you never have to scroll back up)
    if (el.fabOpenMenu){
      el.fabOpenMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        closeFab();
        openMenuDialog();
      });
    }

    // Close on outside click / Esc
    document.addEventListener("click", () => closeFab());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeFab(); });
  }


  // Column contract (Excel headers)
  const COL = {
    id: "ID",
    title: "Spieletitel",
    fav: "Favorit",
    system: "System",
    source: "Quelle",
    avail: "Verfügbarkeit",
    genre: "Genre",
    sub: "Subgenre",
    dev: "Entwickler",
    main: "Spielzeit (Main)",
    hundred: "Spielzeit (100%)",
    meta: "Metascore",
    user: "Userwertung",
    desc: "Kurzbeschreibung",
    store: "Store Link",
    trophProg: "Trophäen Fortschritt",
    troph100: "100%",
    platin: "Platin",
    humorTotal: "Gesamtstunden (Humorstatistik)",
    humorPct: "% Lebenszeit (Humorstatistik)",
    humorYears: "Jahre (Humorstatistik)",
    easter: "Eastereggs",
  };

  const REMINDER_CANDIDATES = ["Erinnerung", "Reminder", "Notiz", "Hinweis", "Memo"];

  const state = {
    rows: [],
    q: "",
    filters: {
      fav: false,
      // Genre Filter (Dropdown): leer = kein Genre-Filter (alle Genres)
      genre: "",
      platforms: new Set(),
      sources: new Set(),
      availability: new Set(),
      trophies: new Set(),
    },
    sortField: SORT_PREFS.sortField,
    sortDir: SORT_PREFS.sortDir,
    distinct: {
      platforms: new Set(),
      sources: new Set(),
      availability: new Set(),
      trophies: new Set(),
      genres: new Set(),
    },
    reminderCol: null,
    fileName: null,
    ui: {
      trophyExpanded: false,
    },
  };

  function esc(s){
    return String(s ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }

  function isNumericToken(t){
    return /^[0-9]+(?:[.,][0-9]+)?$/.test(String(t ?? "").trim());
  }
  function renderRatioParts(a, b){
    const A = String(a ?? "").trim() || "—";
    const B = String(b ?? "").trim() || "—";
    if (isNumericToken(A) && isNumericToken(B)){
      return `<span class="ratio"><span class="num">${esc(A)}</span> <span class="slash">/</span> <span class="num">${esc(B)}</span></span>`;
    }
    return esc(`${A} / ${B}`);
  }
  function renderRatioString(v){
    const t = String(v ?? "").trim();
    if (!t) return esc("—");
    const parts = t.split("/");
    if (parts.length === 2){
      const A = parts[0].trim();
      const B = parts[1].trim();
      if (isNumericToken(A) && isNumericToken(B)){
        return `<span class="ratio"><span class="num">${esc(A)}</span> <span class="slash">/</span> <span class="num">${esc(B)}</span></span>`;
      }
    }
    return esc(t);
  }
  function norm(s){
    return String(s ?? "").toLowerCase().normalize("NFKD").trim();
  }


  function normalizeSourceValue(s){
    // Some sheets may already contain the 🏷 emoji (legacy). We normalize to the plain value
    // so the filter dialog stays calm, while the card view can still show the icon.
    return String(s ?? "")
      .replace(/^🏷️?\s*/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseIdQuery(raw){
    // Accept: "2064", "#2064", "id 2064", "ID:2064" (1–4 digits)
    const t = String(raw ?? "").trim();
    if (!t) return null;
    let m = t.match(/^#?(\d{1,4})$/);
    if (!m) m = t.match(/^id\s*[:\s]\s*#?(\d{1,4})$/i);
    if (!m) return null;
    const n = String(Number(m[1]));
    return n && n !== "NaN" ? n : null;
  }
  function splitPipe(s){
    return String(s ?? "").split("|").map(x => x.trim()).filter(Boolean);
  }
  function parseKeyVals(s){
    // "PS4:12/18|PS5:7/18" -> {PS4:"12/18", PS5:"7/18"}
    const out = {};
    const t = String(s ?? "").trim();
    if (!t) return out;
    if (!t.includes(":")) return out; // global token like "Ungespielt" or "BOX_TEIL:ID45" (handled separately)
    for (const part of splitPipe(t)){
      const idx = part.indexOf(":");
      if (idx <= 0) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx+1).trim();
      out[k] = v;
    }
    return out;
  }
  function parseFrac(v){
    const m = String(v ?? "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return null;
    const a = Number(m[1]), b = Number(m[2]);
    if (!b) return null;
    const pct = Math.max(0, Math.min(100, Math.round((a/b)*100)));
    return {a,b,pct};
  }

  function badge(cls, txt, kind=""){
    const k = kind ? " " + kind : "";
    return `<span class="badge ${cls}${k}">${esc(txt)}</span>`;
  }


  function badgeRaw(cls, innerHtml, kind=""){
    const k = kind ? " " + kind : "";
    return `<span class="badge ${cls}${k}">${innerHtml}</span>`;
  }

  function trophyText(shortTxt, longTxt){
    const s = esc(shortTxt);
    const l = esc(longTxt);
    return `<span class="tShort">${s}</span><span class="tLong">${l}</span>`;
  }

  function pill(text, kind){
    el.pillXlsx.textContent = "XLSX: " + text;
    el.pillXlsx.classList.remove("pill-ok","pill-warn","pill-bad");
    el.pillXlsx.classList.add(kind);
  }

  function findReminderColumn(headers){
    const set = new Set(headers.map(h => String(h).trim()));
    for (const cand of REMINDER_CANDIDATES){
      if (set.has(cand)) return cand;
    }
    // fuzzy
    const lc = headers.map(h => String(h));
    for (const cand of REMINDER_CANDIDATES){
      const c = cand.toLowerCase();
      for (const h of lc){
        if (h.toLowerCase().includes(c)) return h;
      }
    }
    return null;
  }

  function getCellHyperlink(ws, addr){
    // SheetJS stores hyperlinks in cell.l.Target
    const cell = ws[addr];
    if (!cell) return null;
    if (cell.l && cell.l.Target) return String(cell.l.Target);
    return null;
  }

  function readXlsx(arrayBuf, fileName){
    if (typeof XLSX === "undefined"){
      pill("fehlendes Script", "pill-bad");
      throw new Error("XLSX library not loaded");
    }
    pill("ok", "pill-ok");

    const wb = XLSX.read(arrayBuf, {
      type: "array",
      cellText: true,
      cellDates: true,
      cellNF: true,
      cellStyles: false,
      cellHTML: false,
      cellFormula: true,
      cellHyperlinks: true,
    });

    // Prefer "Spieleliste Komplett"
    const targetSheet = wb.Sheets["Spieleliste Komplett"] ? "Spieleliste Komplett" : wb.SheetNames[0];
    const ws = wb.Sheets[targetSheet];

    // Reset distinct value caches (in case the user loads another file)
    state.distinct.genres.clear();
    state.distinct.platforms.clear();
    state.distinct.sources.clear();
    state.distinct.availability.clear();
    state.distinct.trophies.clear();

    // Build rows as objects, while capturing Store hyperlink URLs
    // We use sheet_to_json with header row 1, and also keep range info to map row index -> cell address.
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const headerRow = range.s.r; // 0
    // Get headers from first row
    const headers = [];
    for (let C=range.s.c; C<=range.e.c; C++){
      const addr = XLSX.utils.encode_cell({r: headerRow, c: C});
      const v = ws[addr]?.v;
      headers.push(v ? String(v).trim() : "");
    }

    state.reminderCol = findReminderColumn(headers);

    const rows = XLSX.utils.sheet_to_json(ws, {defval:"", raw:false});
    // Attach storeUrl when possible using hyperlink target
    // Need column index for Store Link
    const storeColIdx = headers.findIndex(h => h === COL.store);
    if (storeColIdx >= 0){
      for (let i=0; i<rows.length; i++){
        const r = headerRow + 1 + i; // data row
        const addr = XLSX.utils.encode_cell({r, c: storeColIdx});
        const url = getCellHyperlink(ws, addr);
        if (url) rows[i].__storeUrl = url.trim();
      }
    }

    // Normalize core fields (trim only; do not rewrite tokens)
    for (const row of rows){
      for (const k of Object.keys(row)){
        if (typeof row[k] === "string") row[k] = row[k].trim();
      }
      // also trim store URL if present; fallback if value itself is a URL
      if (row.__storeUrl){
        row.__storeUrl = String(row.__storeUrl).trim();
      } else {
        const v = String(row[COL.store] ?? "").trim();
        if (v && /^https?:\/\//i.test(v)) row.__storeUrl = v;
      }

      // Trophy tags (for filter)
      for (const t of trophyTags(row)) state.distinct.trophies.add(t);

      // Platforms distinct from System (pipe-separated)
      const sys = String(row[COL.system] ?? "").trim();
      splitPipe(sys).forEach(p => state.distinct.platforms.add(p));

      // Genre distinct (for dropdown)
      const genre = String(row[COL.genre] ?? "").trim() || "Unbekannt";
      state.distinct.genres.add(genre);

      // Source / availability
      const src = normalizeSourceValue(row[COL.source]);
      if (src){
        row[COL.source] = src;
        state.distinct.sources.add(src);
      }
      const av = String(row[COL.avail] ?? "").trim();
      if (av) state.distinct.availability.add(av);
    }

    state.rows = rows;
    state.fileName = fileName || "Excel";
    el.pillFile.textContent = "Datei: " + state.fileName;
    el.empty.style.display = "none";

    buildFilterUI();
    applyAndRender();
  }

  function buildFilterUI(){
    // Sort field (dropdown) – ruhiger als Chip-Wolke, besonders auf Mobile.
    if (el.sortFieldRow){
      el.sortFieldRow.innerHTML = `<select id="sortFieldSelect" class="filterDropdown" aria-label="Sortieren nach"></select>`;
      const sel = el.sortFieldRow.querySelector("#sortFieldSelect");
      if (sel){
        sel.innerHTML = SORT_FIELDS.map(sf => `<option value="${esc(sf.k)}">${esc(sf.label)}</option>`).join("");
        sel.value = state.sortField;
        sel.onchange = () => {
          state.sortField = sel.value;
          saveSortPrefs();
          updateFabSortFieldUI();
        };
      }
    }
    // Sortierrichtung: ein einziger Toggle (↑/↓)
    el.sortDirRow.innerHTML = `<button type="button" id="sortDirToggle" class="dirToggle" aria-label="Sortierrichtung umschalten"></button>`;
    const sdBtn = el.sortDirRow.querySelector("#sortDirToggle");
    if (sdBtn){
      const paint = () => {
        const asc = state.sortDir === "asc";
        sdBtn.textContent = asc ? "↑" : "↓";
        sdBtn.title = asc ? "Aufsteigend" : "Absteigend";
        sdBtn.setAttribute("aria-pressed", asc ? "false" : "true");
      };
      paint();
      sdBtn.onclick = () => {
        state.sortDir = (state.sortDir === "asc") ? "desc" : "asc";
        saveSortPrefs();
        paint();
        updateFabSortUI();
      };
    }

    // Favorites toggle as chip (instead of checkbox)
    el.favRow.innerHTML = chipHtml("fav", "fav", "⭐ Nur Favoriten", state.filters.fav, "primary");

    // Platforms: show canonical order when possible
    const plats = Array.from(state.distinct.platforms);
    const order = ["PS3","PS4","PS5","Vita"];
    plats.sort((a,b) => (order.indexOf(a) - order.indexOf(b)));
    el.platRow.innerHTML = plats.map(p => chipHtml("plat", p, p, state.filters.platforms.has(p), "category")).join("");

    // Sources and availability: show *all* states present
    const srcs = Array.from(state.distinct.sources).sort((a,b)=>a.localeCompare(b,"de"));
    // In der Kartenansicht darf das 🏷️-Symbol bleiben; im Filter-Dialog wirkt es aber unruhig.
    el.srcRow.innerHTML = srcs.map(s => chipHtml("src", s, stripTagEmoji(s), state.filters.sources.has(s), "category")).join("");

    const avs = Array.from(state.distinct.availability).sort((a,b)=>a.localeCompare(b,"de"));
    el.availRow.innerHTML = avs.map(a => chipHtml("avail", a, a, state.filters.availability.has(a), "category")).join("");

    // Trophäenstatus: standardmäßig kompakt (wichtigste + „Weitere…“)
    buildTrophyRow();

    // Genre dropdown (Single-Select)
    if (el.genreSelect){
      el.genreSelect.multiple = false;
      el.genreSelect.size = 1;

      const genres = Array.from(state.distinct.genres)
        .filter(Boolean)
        .sort((a,b) => a.localeCompare(b, "de", { sensitivity: "base" }));

      // Populate (inkl. "Alle")
      el.genreSelect.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Alle";
      el.genreSelect.appendChild(optAll);

      for (const g of genres){
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        el.genreSelect.appendChild(opt);
      }

      // Restore selection
      el.genreSelect.value = state.filters.genre || "";
      el.genreSelect.onchange = () => {
        state.filters.genre = el.genreSelect.value || "";
      };
    }

    // Wire chip clicks
    for (const btn of el.dlg.querySelectorAll(".chip")){
      btn.addEventListener("click", () => onChip(btn));
    }
  }


  function buildTrophyRow(wire=false){
    if (!el.trophyRow) return;

    const trophyOrder = ["Platin","100%","In Arbeit","Ungespielt","Kein Platin","Box-Teil","Unbekannt"];
    const tros = Array.from(state.distinct.trophies);
    tros.sort((a,b) => (trophyOrder.indexOf(a) - trophyOrder.indexOf(b)));

    const important = ["In Arbeit","Ungespielt","Platin"];
    const showAll = !!state.ui.trophyExpanded;

    const visible = showAll ? tros : tros.filter(t => important.includes(t));
    const hasMore = tros.some(t => !important.includes(t));

    const chips = [];
    for (const t of visible){
      const kind = important.includes(t) ? "primary" : "status";
      chips.push(chipHtml("trophy", t, t, state.filters.trophies.has(t), kind));
    }

    if (hasMore){
      chips.push(chipHtml("trophyMore", "toggle", showAll ? "Weniger…" : "Weitere…", showAll, "category"));
    }

    el.trophyRow.innerHTML = chips.join("");

    if (wire){
      for (const btn of el.trophyRow.querySelectorAll(".chip")){
        btn.addEventListener("click", () => onChip(btn));
      }
    }
  }

  function chipHtml(group, key, label, pressed, variant=false){
    // variant can be:
    // - false / undefined: normal
    // - true or "primary": primary/status-like
    // - "category": lighter (Plattform/Quelle/Verfügbarkeit)
    // - "status": normal-but-slightly-stronger (z.B. Trophäen)
    const p = pressed ? "true" : "false";
    let cls = "chip";
    if (variant === true || variant === "primary") cls += " primary";
    else if (variant === "category") cls += " category";
    else if (variant === "status") cls += " status";
    return `<button type="button" class="${cls}" data-group="${esc(group)}" data-key="${esc(key)}" aria-pressed="${p}">${esc(label)}</button>`;
  }

  function stripTagEmoji(label){
    // Only for the filter dialog: keep data/value intact, but remove the visual marker.
    return String(label ?? "").replace(/^\s*🏷\s*/u, "").trim();
  }

  function onChip(btn){
    const group = btn.getAttribute("data-group");
    const key = btn.getAttribute("data-key");
    const pressed = btn.getAttribute("aria-pressed") === "true";

    if (group === "fav"){
      // simple toggle
      state.filters.fav = !pressed;
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      return;
    }

    if (group === "trophyMore"){
      state.ui.trophyExpanded = !state.ui.trophyExpanded;
      buildTrophyRow(true);
      return;
    }

    if (group === "sortField"){
      // exclusive
      state.sortField = key;
      for (const b of el.sortFieldRow.querySelectorAll(".chip")){
        b.setAttribute("aria-pressed", b.getAttribute("data-key") === key ? "true" : "false");
      }
      return;
    }

    // toggle sets
    btn.setAttribute("aria-pressed", pressed ? "false" : "true");
    const set = group === "plat" ? state.filters.platforms
              : group === "src" ? state.filters.sources
              : group === "avail" ? state.filters.availability
              : group === "trophy" ? state.filters.trophies
              : null;
    if (!set) return;
    if (pressed) set.delete(key);
    else set.add(key);
  }

  function parseScore(s){
    // "82 / 100" -> 82
    const m = String(s ?? "").match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return null;
    return Number(m[1].replace(",", "."));
  }
  function parseHours(s){
    const n = parseFloat(String(s ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  function applyAndRender(){
    const qRaw = String(state.q ?? "");
    const q = norm(qRaw);
    const idQuery = parseIdQuery(qRaw);
    const favOnly = state.filters.fav;
    const platF = state.filters.platforms;
    const srcF = state.filters.sources;
    const avF = state.filters.availability;

    let out = state.rows.filter(r => {
      // search
      if (q){
        // Smarter search: if the query looks like an ID (1–4 digits), match by ID.
        if (idQuery){
          const rid = String(r[COL.id] ?? "").trim();
          const rn = String(Number(rid));
          if (rn !== idQuery) return false;
        } else {
          const hay = [
            r[COL.title], r[COL.genre], r[COL.sub], r[COL.dev],
            r[COL.source], r[COL.avail]
          ].map(norm).join(" | ");
          if (!hay.includes(q)) return false;
        }
      }
      // fav
      if (favOnly){
        const f = String(r[COL.fav] ?? "").trim().toLowerCase();
        if (f !== "x" && f !== "1" && f !== "true") return false;
      }
      // Genre filter (Dropdown; exact match, normalized)
      if (state.filters.genre){
        const want = norm(state.filters.genre);
        const got  = norm(r[COL.genre]);
        if (want && got !== want) return false;
      }

      // platform filter: system contains at least one selected
      if (platF.size){
        const sys = splitPipe(r[COL.system]);
        let ok = false;
        for (const p of platF){ if (sys.includes(p)) { ok = true; break; } }
        if (!ok) return false;
      }
      // source
      if (srcF.size){
        const src = normalizeSourceValue(r[COL.source]);
        if (!srcF.has(src)) return false;
      }
      // availability
      if (avF.size){
        const av = String(r[COL.avail] ?? "").trim();
        if (!avF.has(av)) return false;
      }
      // trophies filter (multi-select OR)
      const troF = state.filters.trophies;
      if (troF.size){
        const tags = trophyTags(r);
        let ok = false;
        for (const t of troF){ if (tags.has(t)) { ok = true; break; } }
        if (!ok) return false;
      }
      return true;
    });

    // sort
    const sf = state.sortField;
    const dir = state.sortDir === "desc" ? -1 : 1;
    out.sort((a,b) => {
      const A = a[sf] ?? a[COL.id] ?? "";
      const B = b[sf] ?? b[COL.id] ?? "";
      if (sf === "ID"){
        const na = Number(A), nb = Number(B);
        if (Number.isFinite(na) && Number.isFinite(nb)) return (na - nb) * dir;
      }
      if (sf === "Metascore" || sf === "Userwertung"){
        const sa = parseScore(A), sb = parseScore(B);
        if (sa != null && sb != null) return (sa - sb) * dir;
      }
      if (sf === "Spielzeit (Main)" || sf === "Spielzeit (100%)"){
        const ha = parseHours(A), hb = parseHours(B);
        if (ha != null && hb != null) return (ha - hb) * dir;
      }
      let cmp = String(A).localeCompare(String(B), "de") * dir;
      // Stabiler Tie-Breaker: immer nach ID (aufsteigend), damit Sortierung ruhig bleibt.
      if (cmp === 0 && sf !== "ID"){
        const ia = Number(a[COL.id] ?? ""), ib = Number(b[COL.id] ?? "");
        if (Number.isFinite(ia) && Number.isFinite(ib)) return ia - ib;
      }
      return cmp;
    });

    el.pillRows.textContent = `Treffer: ${out.length}`;
    // Keep FAB quick controls in sync (in case sortDir changed via dialog).
    updateFabSortUI();
    updateFabSortFieldUI();
    render(out);
  }


  function trophyTags(row){
    // Tags for filtering (multi-select OR)
    // "Platin", "100%", "In Arbeit", "Ungespielt", "Kein Platin", "Box-Teil", "Unbekannt"
    const tags = new Set();
    const p100 = String(row[COL.troph100] ?? "").trim();
    const plat = String(row[COL.platin] ?? "").trim();
    const prog = String(row[COL.trophProg] ?? "").trim();

    if (p100.startsWith("BOX_TEIL:") || plat.startsWith("BOX_TEIL:") || prog.startsWith("BOX_TEIL:")){
      tags.add("Box-Teil");
      return tags;
    }

    const g100 = (!p100.includes(":") ? p100 : "");
    const gpl  = (!plat.includes(":") ? plat : "");

    const d100  = parseKeyVals(p100);
    const dpl   = parseKeyVals(plat);
    const dprog = parseKeyVals(prog);

    const any = (obj, token) => Object.values(obj).some(v => v === token);

    // --- Base tags (independent of progress) ---
    if (gpl === "Platin-Erlangt" || any(dpl, "Platin-Erlangt")) tags.add("Platin");
    if (gpl === "Nicht-Verfügbar" || any(dpl, "Nicht-Verfügbar")) tags.add("Kein Platin");

    // "Ungespielt" may be explicitly set as a global token.
    if (gpl === "Ungespielt" || g100 === "Ungespielt" || prog === "Ungespielt") tags.add("Ungespielt");

    // --- Progress-derived status ---
    // "Trophäen Fortschritt" stores earned/total (e.g. "PS3:50/50|PS4:12/18").
    // Rule: 100% means no trophies open (all earned == total). In Arbeit means some open (0 < earned < total).
    const fracs = Object.values(dprog)
      .map(v => parseFrac(v))
      .filter(Boolean);

    if (fracs.length){
      const allComplete = fracs.every(f => f.a >= f.b);
      const anyPartial  = fracs.some(f => f.a > 0 && f.a < f.b);
      const allZero     = fracs.every(f => f.a <= 0);

      if (allComplete){
        tags.add("100%");
        // do NOT add "In Arbeit" if nothing is open
      } else if (anyPartial){
        tags.add("In Arbeit");
      } else if (allZero){
        tags.add("Ungespielt");
      }
    } else {
      // Fallback: keep legacy token support for the 100%-column if no progress fractions exist.
      if (g100 === "Abgeschlossen" || any(d100, "Abgeschlossen")) tags.add("100%");
      if ((gpl === "Wird-Bearbeitet" || any(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || any(d100, "Wird-Bearbeitet"))){
        tags.add("In Arbeit");
      }
    }

    // If the sheet explicitly marks "Wird-Bearbeitet", allow it to coexist (e.g., manual override).
    if (gpl === "Wird-Bearbeitet" || any(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || any(d100, "Wird-Bearbeitet")){
      tags.add("In Arbeit");
    }

    if (!tags.size) tags.add("Unbekannt");
    return tags;
  }

  function trophySummary(row){
    const p100 = String(row[COL.troph100] ?? "").trim();
    const plat = String(row[COL.platin] ?? "").trim();
    const prog = String(row[COL.trophProg] ?? "").trim();

    // BOX?
    if (p100.startsWith("BOX_TEIL:") || plat.startsWith("BOX_TEIL:") || prog.startsWith("BOX_TEIL:")){
      return {icon:"📦", text:"Box-Teil", cls:"warn"};
    }



// Explizites "Ungespielt" in den Feldern (klassischer Datensatz: Fortschritt/100%/Platin = Ungespielt)
const isUngespielt = (s) => String(s || "").trim() === "Ungespielt";
if (isUngespielt(p100) || isUngespielt(plat) || isUngespielt(prog)) {
  return {icon:"💤", text:"Ungespielt", cls:""};
}

    // Leer => Ungespielt (wie in früheren Builds)
    if (!p100 && !plat && !prog) return {icon:"💤", text:"Ungespielt", cls:""};

    // global tokens
    const g100 = (!p100.includes(":") ? p100 : "");
    const gpl = (!plat.includes(":") ? plat : "");

    const d100 = parseKeyVals(p100);
    const dpl = parseKeyVals(plat);
    const dprog = parseKeyVals(prog);

    const has = (obj, token) => Object.values(obj).some(v => v === token);

    // Progress-derived overall status (preferred): show "In Arbeit" if anything is still open,
    // even if the base game is already platinum (DLC open is still "in progress").
    const fracs = Object.values(dprog).map(v => parseFrac(v)).filter(Boolean);
    if (fracs.length){
      const allComplete = fracs.every(f => f.a >= f.b);
      const anyPartial  = fracs.some(f => f.a > 0 && f.a < f.b);
      const allZero     = fracs.every(f => f.a <= 0);

      if (allComplete){
        if (gpl === "Platin-Erlangt" || has(dpl, "Platin-Erlangt")) return {icon:"💎", text:"Platin", cls:"ok"};
        return {icon:"✅️", text:"100%", cls:"ok"};
      }
      if (anyPartial || (gpl === "Wird-Bearbeitet" || has(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || has(d100, "Wird-Bearbeitet")))
        return {icon:"⏳️", text:"In Arbeit", cls:"warn"};
      if (allZero) return {icon:"💤", text:"Ungespielt", cls:""};
    }

    // Fallbacks if no fractions exist
    if (gpl === "Platin-Erlangt" || has(dpl, "Platin-Erlangt")) return {icon:"💎", text:"Platin", cls:"ok"};
    if (g100 === "Abgeschlossen" || has(d100, "Abgeschlossen")) return {icon:"✅️", text:"100%", cls:"ok"};
    if (gpl === "Wird-Bearbeitet" || has(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || has(d100, "Wird-Bearbeitet"))
      return {icon:"⏳️", text:"In Arbeit", cls:"warn"};
    if (gpl === "Ungespielt" || g100 === "Ungespielt" || prog === "Ungespielt") return {icon:"💤", text:"Ungespielt", cls:""};
    // fallback: if empty or unknown
    return {icon:"—", text:"Trophäen", cls:""};
  }

  

// Kartenkopf: Trophy-Badges (Build 7.0l-A)
// Standard: 1 Badge
// Ausnahme: Platin + offene Trophäen -> 2 Badges: [Platin] [In Arbeit]
// Platin + 100% -> im Header nur [Platin]
// "Kein Platin" wird im Header nicht angezeigt.
function trophyHeaderBadges(row){
  const p100 = String(row[COL.troph100] ?? "").trim();
  const plat = String(row[COL.platin] ?? "").trim();
  const prog = String(row[COL.trophProg] ?? "").trim();

  // Box-Teil: im Header nichts (Details im Akkordeon)
  if (p100.startsWith("BOX_TEIL:") || plat.startsWith("BOX_TEIL:") || prog.startsWith("BOX_TEIL:")){
    return [];
  }


// Ungespielt: expliziter Status in den Feldern (klassischer Datensatz)
const isUngespielt = (s) => String(s || "").trim() === "Ungespielt";
if (isUngespielt(p100) || isUngespielt(plat) || isUngespielt(prog) || (!p100 && !plat && !prog)){
  return [{icon:"💤", text:"Ungespielt", cls:""}];
}

  const g100 = (!p100.includes(":") ? p100 : "");
  const gpl  = (!plat.includes(":") ? plat : "");

  const d100  = parseKeyVals(p100);
  const dpl   = parseKeyVals(plat);
  const dprog = parseKeyVals(prog);

  const hasToken = (obj, token) => Object.values(obj).some(v => v === token);
  const hasPlatinum = (gpl === "Platin-Erlangt" || hasToken(dpl, "Platin-Erlangt") || /platin/i.test(gpl) || Object.values(dpl).some(v => /platin/i.test(String(v))));

  // Preferred: derive open/complete from "Trophäen Fortschritt" fractions (earned/total)
  const fracs = Object.values(dprog).map(v => parseFrac(v)).filter(Boolean);
  let allComplete = false;
  let anyPartial  = false;
  if (fracs.length){
    allComplete = fracs.every(f => f.a >= f.b);
    anyPartial  = fracs.some(f => f.a > 0 && f.a < f.b);
  } else {
    // Fallback: legacy tokens
    const anyWB = (gpl === "Wird-Bearbeitet" || hasToken(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || hasToken(d100, "Wird-Bearbeitet"));
    if (anyWB) anyPartial = true;
    const anyDone = (g100 === "Abgeschlossen" || hasToken(d100, "Abgeschlossen"));
    if (anyDone) allComplete = true;
  }

  if (hasPlatinum){
    return anyPartial
      ? [{icon:"💎", text:"Platin", cls:"ok"}, {icon:"⏳️", text:"In Arbeit", cls:"warn"}]
      : [{icon:"💎", text:"Platin", cls:"ok"}];
  }
  if (anyPartial)  return [{icon:"⏳️", text:"In Arbeit", cls:"warn"}];
  if (allComplete) return [{icon:"✅️", text:"100%", cls:"ok"}];
  return [];
}
function classifyAvailability(av){
    const t = String(av ?? "").trim();
    if (t === "Delisted") return "bad";
    if (t === "Eingeschränkt") return "warn";
    if (t === "Verfügbar") return "ok";
    if (t === "Unbekannt") return "";
    return ""; // Verfügbar or others
  }
  function classifySource(src){
    const t = String(src ?? "").trim();
    if (t === "Unbekannt") return "";
    if (t === "PS-Plus") return "";
    return "";
  }

  function storeLink(row){
    const text = String(row[COL.store] ?? "").trim();
    const url = String(row.__storeUrl ?? "").trim();
    if (!text && !url) return `<div class="small">Kein Store-Link vorhanden.</div>`;
    const linkText = text || "Store Link";
    if (url && /^https?:\/\//i.test(url)){
      return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(linkText)}</a>`;
    }
    // Sometimes text itself is URL
    if (text && /^https?:\/\//i.test(text)){
      return `<a href="${esc(text)}" target="_blank" rel="noopener noreferrer">Store Link</a>`;
    }
    return `<div class="small">Store-Link gefunden, aber keine URL (Hyperlink) erkannt.</div>`;
  }

  function renderStore(row, src, av){
  const text = String(row[COL.store] ?? "").trim();
  const url = String(row.__storeUrl ?? "").trim();

  let storeValue = "";
  if (url && /^https?:\/\//i.test(url)){
    const linkText = text || "Store Link";
    storeValue = `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(linkText)}</a>`;
  } else if (text && /^https?:\/\//i.test(text)){
    storeValue = `<a href="${esc(text)}" target="_blank" rel="noopener noreferrer">Store Link</a>`;
  } else if (text){
    storeValue = `<span class="small">Linktext vorhanden, aber keine URL (Hyperlink) erkannt.</span>`;
  } else {
    storeValue = `<span class="small">Kein Store-Link vorhanden.</span>`;
  }

  const srcVal = src || "Unbekannt";
  const avVal  = av  || "Unbekannt";

  return `
    <div class="kvTable kvStore">
      <div class="kvRow"><div class="k">Quelle</div><div class="v">${esc(srcVal)}</div></div>
      <div class="kvRow"><div class="k">Store</div><div class="v">${storeValue}</div></div>
      <div class="kvRow"><div class="k">Verfügbarkeit</div><div class="v">${esc(avVal)}</div></div>
    </div>`;
}



  function render(rows){
    const html = rows.map(row => {
      const id = String(row[COL.id] ?? "").trim();
      const title = String(row[COL.title] ?? "").trim() || "—";
      const fav = String(row[COL.fav] ?? "").trim().toLowerCase();
      const isFav = (fav === "x" || fav === "1" || fav === "true");

      const sys = splitPipe(row[COL.system]);
      const src = String(row[COL.source] ?? "").trim() || "Unbekannt";
      const av = String(row[COL.avail] ?? "").trim() || "Unbekannt";
      const genre = String(row[COL.genre] ?? "").trim() || "Unbekannt";

      const sub = String(row[COL.sub] ?? "").trim() || "—";
      const dev = String(row[COL.dev] ?? "").trim() || "—";
      const main = String(row[COL.main] ?? "").trim() || "—";
      const hundred = String(row[COL.hundred] ?? "").trim() || "—";
      const meta = String(row[COL.meta] ?? "").trim() || "—";
      const user = String(row[COL.user] ?? "").trim() || "—";

      const reminder = state.reminderCol ? String(row[state.reminderCol] ?? "").trim() : "";

      // Trophy short
      const tBadges = trophyHeaderBadges(row);
      const trophyBadge = tBadges.map(ts => badge("trophyHeader"+(ts.cls?(" "+ts.cls):""), `${ts.icon} ${ts.text}`)).join("");
// badge rows
      const platBadges = sys.map(p => badge("platform", p));
      const srcLabel = (src === "Unbekannt" ? "🏷️ Unbekannt" : src);
  const srcBadge = badge("source " + classifySource(src), srcLabel);

      const avBadge = badge("avail "+classifyAvailability(av), av);
      const remBadge = reminder ? badge("note warn", "🔔 Erinnerung") : "";

      // info block
      const info = `
        <div class="info">
          <div class="infoStack">
            <div class="infoItem">
              <div class="k">Genre</div>
              <div class="v vText">${esc(genre)}</div>
            </div>

            <div class="softSep" aria-hidden="true"></div>

            <div class="infoItem">
              <div class="k">Subgenre</div>
              <div class="v vText">${esc(sub)}</div>
            </div>

            <div class="softSep" aria-hidden="true"></div>

            <div class="infoItem">
              <div class="k">Entwickler</div>
              <div class="v vText">${esc(dev)}</div>
            </div>
          </div>

          <div class="infoTable" role="table" aria-label="Kennzahlen">
            <div class="infoRow infoRowPrimary" role="row">
              <div class="k" role="cell">Spielzeit</div>
              <div class="v vNum" role="cell">${renderRatioParts(main, hundred)}</div>
            </div>

            <div class="infoRow infoRowScore" role="row">
              <div class="k" role="cell">Metascore</div>
              <div class="v vNum" role="cell">${renderRatioString(meta)}</div>
            </div>

            <div class="infoRow infoRowScore" role="row">
              <div class="k" role="cell">Userwertung</div>
              <div class="v vNum" role="cell">${renderRatioString(user)}</div>
            </div>
          </div>
        </div>`;

      // Collapsibles (local)
      const desc = String(row[COL.desc] ?? "").trim();
      const descBody = desc ? `<div class="pre">${esc(desc)}</div>` : `<div class="small">Keine Beschreibung vorhanden.</div>`;

      const storeBody = renderStore(row, src, av);

      const trophyBody = renderTrophyDetails(row);
      const humorBody = renderHumor(row);

      const easter = String(row[COL.easter] ?? "").trim();
      const easterBody = easter
        ? `<div class="pre">${esc(easter)}</div>`
        : `<div class="small">Keine Eastereggs vorhanden.</div>`;

      return `
        <article class="card">
          <div class="topGrid">
            <div class="head">
              <div class="rowMeta">
                <div class="idBadge">ID ${esc(id || "—")}</div>
                ${isFav ? `<div class="favIcon" title="Favorit">⭐</div>` : `<div style="width:34px;height:34px"></div>`}
              </div>

              <div class="title">${esc(title)}</div>

              <div class="badgeRow badgeRow-platforms">
                ${platBadges.join("")}
              </div>

              <div class="badgeRow badgeRow-meta">
                ${srcBadge}
                ${avBadge}
                ${reminder ? remBadge : ""}
              </div>

              <div class="headDivider" aria-hidden="true"></div>

              <div class="badgeRow badgeRow-trophy">
                ${trophyBadge}
              </div>
            </div>

            ${info}
          </div>

          <div class="detailsWrap">
            ${detailsBlock("desc", "Beschreibung", descBody)}
            ${detailsBlock("store", "Store", storeBody)}
            ${detailsBlock("trophy", "Trophäen", trophyBody)}
            ${detailsBlock("humor", "Humorstatistik", humorBody)}
            ${detailsBlock("easter", "Eastereggs", easterBody)}
          </div>
        </article>`;
    }).join("");

    el.cards.innerHTML = html;
    // Attach stateful summary labels (anzeigen / verbergen)
    for (const det of el.cards.querySelectorAll("details")){
      const sum = det.querySelector("summary");
      const label = sum?.querySelector("[data-label]");
      if (!label) continue;
      const base = label.getAttribute("data-label");
      const upd = () => label.textContent = det.open ? (base + " verbergen") : (base + " anzeigen");
      upd();
      det.addEventListener("toggle", upd);
    }
  }

  function detailsBlock(key, label, bodyHtml){
    const safeLabel = esc(label);
    const safeKey = String(key || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return `
      <details class="d d-${safeKey}">
        <summary>
          <span data-label="${safeLabel}">${safeLabel} anzeigen</span>
          <span class="chev">▾</span>
        </summary>
        <div class="detailsBody">${bodyHtml}</div>
      </details>`;
  }

function renderTrophyDetails(row){
  const p100 = String(row[COL.troph100] ?? "").trim();
  const plat = String(row[COL.platin] ?? "").trim();
  const prog = String(row[COL.trophProg] ?? "").trim();

  if (!p100 && !plat && !prog) return `<div class="small">Keine Trophäenwerte vorhanden.</div>`;

  // BOX-Teile (Sammel-Entry)
  if (p100.startsWith("BOX_TEIL:") || plat.startsWith("BOX_TEIL:") || prog.startsWith("BOX_TEIL:")){
    const raw = (p100 || plat || prog).replace(/^BOX_TEIL:/, "");
    return `<div class="small"><b>📦 Box-Teil</b>: ${esc(raw.trim())}</div>`;
  }

  const d100 = parseKeyVals(p100);
  const dpl = parseKeyVals(plat);
  const dprog = parseKeyVals(prog);

  const platforms = ["PS3","PS4","PS5","Vita"];
  function labelPlatin(token){
    if (token === "Platin-Erlangt") return {short:"💎 Platin", long:"💎 Platin erlangt"};
    if (token === "Wird-Bearbeitet") return {short:"⏳ Platin", long:"⏳ Platin in Arbeit"};
    if (token === "Nicht-Verfügbar") return {short:"◇ Kein Platin", long:"◇ Kein Platin vorhanden"};
    if (token === "Ungespielt") return {short:"💤 Ungespielt", long:"💤 Ungespielt"};
    if (!token) return {short:"—", long:"—"};
    const t = token.replaceAll("-", " " );
    return {short:t, long:t};
  }
  function label100(token){
    if (token === "Abgeschlossen") return {short:"✅ 100%", long:"✅ 100% erlangt"};
    if (token === "Wird-Bearbeitet") return {short:"⏳ 100%", long:"⏳ 100% in Arbeit"};
    if (token === "Nicht-Verfügbar") return {short:"🚫 100%", long:"🚫 100% nicht verfügbar"};
    if (token === "Ungespielt") return {short:"💤 Ungespielt", long:"💤 Ungespielt"};
    if (!token) return {short:"—", long:"—"};
    const t = token.replaceAll("-", " " );
    return {short:t, long:t};
  }

  const blocks = [];

  for (const p of platforms){
    const s100 = (d100[p] || "").trim();
    const spl  = (dpl[p] || "").trim();
    const pv   = (dprog[p] || "").trim();

    if (!pv && !s100 && !spl) continue;

    const frac = parseFrac(pv);
    const line = frac?.pct != null
      ? `${frac.a}/${frac.b} (${Math.round(frac.pct)}%)`
      : (pv ? pv : "");

    // Bei "Abgeschlossen" kann die Bar ohne Bruch trotzdem sinnvoll sein
    const pct = frac?.pct ?? (s100 === "Abgeschlossen" ? 100 : null);

    blocks.push(`
      <div class="platBlock">
        <div class="tRow">
          ${badge("platform", p)}
          ${(() => { const pl = labelPlatin(spl); return badgeRaw("tSlot", trophyText(pl.short, pl.long)); })()}
          ${(() => { const h = label100(s100); return badgeRaw("tSlot", trophyText(h.short, h.long)); })()}
        </div>
        ${line ? `<div class="small">${esc(line)}</div>` : ``}
        ${pct != null ? `<div class="bar"><div class="barFill" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>` : ``}
      </div>
    `);
  }

  return blocks.length ? blocks.join("") : `<div class="small">Keine plattformbezogenen Trophäenwerte erkannt.</div>`;
}

  function renderHumor(row){
  const total = String(row[COL.humorTotal] ?? "").trim();
  const pct = String(row[COL.humorPct] ?? "").trim();
  const yrs = String(row[COL.humorYears] ?? "").trim();
  if (!total && !pct && !yrs) return `<div class="small">Keine Humorstatistik vorhanden.</div>`;
  return `
    <div class="kvTable kvHumor">
      <div class="kvRow kvRowPrimary"><div class="k">Gesamtstunden</div><div class="v">${esc(total || "—")}</div></div>
      <div class="kvRow"><div class="k">% Lebenszeit</div><div class="v">${esc(pct || "—")}</div></div>
      <div class="kvRow"><div class="k">Jahre</div><div class="v">${esc(yrs || "—")}</div></div>
    </div>`;
}


  // Events
  function openFilePicker(){
    el.file.value = "";
    el.file.click();
  }

  el.btnLoad.addEventListener("click", openFilePicker);
  el.btnLoad2.addEventListener("click", openFilePicker);

  el.file.addEventListener("change", async () => {
    const f = el.file.files?.[0];
    if (!f) return;
    try{
      el.pillFile.textContent = "Datei: " + f.name;
      const buf = await f.arrayBuffer();
      readXlsx(buf, f.name);
    }catch(e){
      console.error(e);
      pill("Fehler", "pill-bad");
      alert("Fehler beim Einlesen der Excel: " + (e?.message || e));
    }
  });

  el.search.addEventListener("input", () => {
    state.q = el.search.value || "";
    applyAndRender();
  });

  el.btnTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

  function openMenuDialog(){
    // Keep dialog chips in sync with quick controls.
    const sfSel = el.sortFieldRow?.querySelector?.("#sortFieldSelect");
    if (sfSel) sfSel.value = state.sortField;
    if (el.sortDirRow){
      for (const b of el.sortDirRow.querySelectorAll(".chip")){
        b.setAttribute("aria-pressed", b.getAttribute("data-key") === state.sortDir ? "true" : "false");
      }
    }
    if (!el.dlg.open) el.dlg.showModal();
  }

  // Build the floating quick access UI (FAB) once.
  buildFab();

  el.btnMenu.addEventListener("click", () => {
    openMenuDialog();
  });
  el.btnClose.addEventListener("click", () => el.dlg.close());

  el.btnApply.addEventListener("click", () => {
    // Sync genre dropdown (single select)
    if (el.genreSelect){
      state.filters.genre = el.genreSelect.value || "";
    }
    el.dlg.close();
    applyAndRender();
  });

  el.btnClear.addEventListener("click", () => {
    state.filters.fav = false;
    state.filters.genre = "";
    state.filters.platforms.clear();
    state.filters.sources.clear();
    state.filters.availability.clear();
    state.filters.trophies.clear();
    state.ui.trophyExpanded = false;

    state.sortField = "ID";
    state.sortDir = "asc";
    saveSortPrefs();

    buildFilterUI();
    updateFabSortFieldUI();
    updateFabSortUI();
  });

  // Sort chip handlers are live; apply takes effect when dialog applied
  // So we update state on click via onChip wiring in buildFilterUI()

  // Keep dialog close on backdrop click (optional nice)
  el.dlg.addEventListener("click", (e) => {
    const rect = el.dlg.getBoundingClientRect();
    // If click is outside the sheet, close
    const sheet = el.dlg.querySelector(".sheet");
    if (!sheet) return;
    const r = sheet.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom){
      el.dlg.close();
    }
  });

  // Init pill
  el.pillXlsx.textContent = "XLSX: bereit";
  el.pillXlsx.classList.add("pill-ok");

  // Guard: show warning if xlsx lib missing after load
  window.addEventListener("load", () => {
    if (typeof XLSX === "undefined"){
      pill("xlsx.full.min.js fehlt", "pill-bad");
    }
    document.title = `Spieleliste – Build ${BUILD}`;
  });
})();