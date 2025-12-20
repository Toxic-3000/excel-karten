/* Spieleliste Webansicht – Clean Rebuild – Build 7.0f
   - Kompaktansicht only
   - Badges mit möglichst fixer Länge
   - Alle Zustände für Quelle/Verfügbarkeit werden angezeigt
   - Store Link: Linktext + echte URL aus Excel (Hyperlink) */
(() => {
  "use strict";
  const BUILD = "7.0f";

  const $ = (id) => document.getElementById(id);

  const el = {
    file: $("file"),
    btnLoad: $("btnLoad"),
    btnLoad2: $("btnLoad2"),
    btnMenu: $("btnMenu"),
    btnTop: $("btnTop"),
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
    platRow: $("platRow"),
    srcRow: $("srcRow"),
    availRow: $("availRow"),
    trophyRow: $("trophyRow"),
    fFav: $("fFav"),
  };

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
  };

  const REMINDER_CANDIDATES = ["Erinnerung", "Reminder", "Notiz", "Hinweis", "Memo"];

  const state = {
    rows: [],
    q: "",
    filters: {
      fav: false,
      platforms: new Set(),
      sources: new Set(),
      availability: new Set(),
      trophies: new Set(),
    },
    sortField: "ID",
    sortDir: "asc",
    distinct: {
      platforms: new Set(),
      sources: new Set(),
      availability: new Set(),
      trophies: new Set(),
    },
    reminderCol: null,
    fileName: null,
  };

  function esc(s){
    return String(s ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }
  function norm(s){
    return String(s ?? "").toLowerCase().normalize("NFKD").trim();
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
      // Source / availability
      const src = String(row[COL.source] ?? "").trim();
      if (src) state.distinct.sources.add(src);
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
    // Sort fields (chips)
    const sortFields = [
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
    el.sortFieldRow.innerHTML = sortFields.map(sf => chipHtml("sortField", sf.k, sf.label, state.sortField === sf.k, true)).join("");
    el.sortDirRow.innerHTML = [
      chipHtml("sortDir", "asc", "Aufsteigend", state.sortDir === "asc", true),
      chipHtml("sortDir", "desc", "Absteigend", state.sortDir === "desc", true),
    ].join("");

    // Platforms: show canonical order when possible
    const plats = Array.from(state.distinct.platforms);
    const order = ["PS3","PS4","PS5","Vita"];
    plats.sort((a,b) => (order.indexOf(a) - order.indexOf(b)));
    el.platRow.innerHTML = plats.map(p => chipHtml("plat", p, p, state.filters.platforms.has(p))).join("");

    // Sources and availability: show *all* states present
    const srcs = Array.from(state.distinct.sources).sort((a,b)=>a.localeCompare(b,"de"));
    el.srcRow.innerHTML = srcs.map(s => chipHtml("src", s, "🏷️ " + s, state.filters.sources.has(s))).join("");

    const avs = Array.from(state.distinct.availability).sort((a,b)=>a.localeCompare(b,"de"));
    el.availRow.innerHTML = avs.map(a => chipHtml("avail", a, a, state.filters.availability.has(a))).join("");

    // Trophy status chips (show all tags that appear)
    const trophyOrder = ["Platin","100%","In Arbeit","Ungespielt","Kein Platin","Box-Teil","Unbekannt"];
    const tros = Array.from(state.distinct.trophies);
    tros.sort((a,b) => (trophyOrder.indexOf(a) - trophyOrder.indexOf(b)));
    el.trophyRow.innerHTML = tros.map(t => chipHtml("trophy", t, t, state.filters.trophies.has(t))).join("");

    // Wire chip clicks
    for (const btn of el.dlg.querySelectorAll(".chip")){
      btn.addEventListener("click", () => onChip(btn));
    }
  }

  function chipHtml(group, key, label, pressed, primary=false){
    const p = pressed ? "true" : "false";
    const cls = primary ? "chip primary" : "chip";
    return `<button type="button" class="${cls}" data-group="${esc(group)}" data-key="${esc(key)}" aria-pressed="${p}">${esc(label)}</button>`;
  }

  function onChip(btn){
    const group = btn.getAttribute("data-group");
    const key = btn.getAttribute("data-key");
    const pressed = btn.getAttribute("aria-pressed") === "true";

    if (group === "sortField"){
      // exclusive
      state.sortField = key;
      for (const b of el.sortFieldRow.querySelectorAll(".chip")){
        b.setAttribute("aria-pressed", b.getAttribute("data-key") === key ? "true" : "false");
      }
      return;
    }
    if (group === "sortDir"){
      state.sortDir = key;
      for (const b of el.sortDirRow.querySelectorAll(".chip")){
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
    const q = norm(state.q);
    const favOnly = state.filters.fav;
    const platF = state.filters.platforms;
    const srcF = state.filters.sources;
    const avF = state.filters.availability;

    let out = state.rows.filter(r => {
      // search
      if (q){
        const hay = [
          r[COL.title], r[COL.genre], r[COL.sub], r[COL.dev],
          r[COL.source], r[COL.avail]
        ].map(norm).join(" | ");
        if (!hay.includes(q)) return false;
      }
      // fav
      if (favOnly){
        const f = String(r[COL.fav] ?? "").trim().toLowerCase();
        if (f !== "x" && f !== "1" && f !== "true") return false;
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
        const src = String(r[COL.source] ?? "").trim();
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
      return String(A).localeCompare(String(B), "de") * dir;
    });

    el.pillRows.textContent = `Treffer: ${out.length}`;
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
    const anyFrac = Object.values(dprog).some(v => parseFrac(v)?.pct != null);

    if (gpl === "Platin-Erlangt" || any(dpl, "Platin-Erlangt")) tags.add("Platin");
    if (g100 === "Abgeschlossen" || any(d100, "Abgeschlossen")) tags.add("100%");
    if (gpl === "Nicht-Verfügbar" || any(dpl, "Nicht-Verfügbar")) tags.add("Kein Platin");

    if (gpl === "Wird-Bearbeitet" || any(dpl, "Wird-Bearbeitet") ||
        g100 === "Wird-Bearbeitet" || any(d100, "Wird-Bearbeitet") || anyFrac){
      tags.add("In Arbeit");
    }

    if (gpl === "Ungespielt" || g100 === "Ungespielt" || prog === "Ungespielt") tags.add("Ungespielt");

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

    // global tokens
    const g100 = (!p100.includes(":") ? p100 : "");
    const gpl = (!plat.includes(":") ? plat : "");

    const d100 = parseKeyVals(p100);
    const dpl = parseKeyVals(plat);
    const dprog = parseKeyVals(prog);

    const has = (obj, token) => Object.values(obj).some(v => v === token);
    const anyProg = Object.values(dprog).some(v => parseFrac(v)?.pct != null);

    if (gpl === "Platin-Erlangt" || has(dpl, "Platin-Erlangt")) return {icon:"💎", text:"Platin", cls:"ok"};
    if (g100 === "Abgeschlossen" || has(d100, "Abgeschlossen")) return {icon:"✅️", text:"100%", cls:"ok"};
    if (gpl === "Wird-Bearbeitet" || has(dpl, "Wird-Bearbeitet") || g100 === "Wird-Bearbeitet" || has(d100, "Wird-Bearbeitet") || anyProg)
      return {icon:"⏳️", text:"In Arbeit", cls:"warn"};
    if (gpl === "Ungespielt" || g100 === "Ungespielt" || prog === "Ungespielt") return {icon:"💤", text:"Ungespielt", cls:""};
    // fallback: if empty or unknown
    return {icon:"—", text:"Trophäen", cls:""};
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
    // Two-column layout like the info block: Quelle / Store-Link / Verfügbarkeit
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
      <div class="grid storeGrid">
        <div class="k">Quelle</div><div class="v">${esc(srcVal)}</div>
        <div class="k">Store</div><div class="v">${storeValue}</div>
        <div class="k">Verfügbarkeit</div><div class="v">${esc(avVal)}</div>
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
      const ts = trophySummary(row);
      const trophyBadge = badge("trophy"+(ts.cls?(" "+ts.cls):""), `${ts.icon} ${ts.text}`);

      // badge rows
      const platBadges = sys.map(p => badge("platform", p));
      const srcBadge = badge("source "+classifySource(src), src);
      const avBadge = badge("avail "+classifyAvailability(av), av);
      const genreBadge = badge("genre", genre);
      const remBadge = reminder ? badge("note warn", "🔔 Erinnerung") : "";

      // info block
      const info = `
        <div class="info">
          <div class="grid">
            <div class="k">Subgenre</div><div class="v">${esc(sub)}</div>
            <div class="k">Entwickler</div><div class="v">${esc(dev)}</div>
            <div class="k">Spielzeit</div><div class="v">${esc(main)} / ${esc(hundred)}</div>
            <div class="k">Metascore</div><div class="v">${esc(meta)}</div>
            <div class="k">Userwertung</div><div class="v">${esc(user)}</div>
          </div>
        </div>`;

      // Collapsibles (local)
      const desc = String(row[COL.desc] ?? "").trim();
      const descBody = desc ? `<div class="pre">${esc(desc)}</div>` : `<div class="small">Keine Beschreibung vorhanden.</div>`;

      const storeBody = renderStore(row, src, av);

      const trophyBody = renderTrophyDetails(row);
      const humorBody = renderHumor(row);

      return `
        <article class="card">
          <div class="rowMeta">
            <div class="idBadge">ID ${esc(id || "—")}</div>
            ${isFav ? `<div class="favIcon" title="Favorit">⭐</div>` : `<div style="width:34px;height:34px"></div>`}
          </div>

          <div class="title">${esc(title)}</div>

          <div class="badgeRow">
            ${platBadges.join("")}
            ${srcBadge}
            ${avBadge}
            ${reminder ? remBadge : ""}
          </div>

          <div class="badgeRow">
            ${genreBadge}
          </div>

          <div class="badgeRow">
            ${trophyBadge}
          </div>

          ${info}

          <div class="detailsWrap">
            ${detailsBlock("Beschreibung", descBody)}
            ${detailsBlock("Store", storeBody)}
            ${detailsBlock("Trophäen", trophyBody)}
            ${detailsBlock("Humorstatistik", humorBody)}
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

  function detailsBlock(name, bodyHtml){
    const safe = esc(name);
    return `
      <details>
        <summary>
          <span data-label="${safe}">${safe} anzeigen</span>
          <span class="chev">▾</span>
        </summary>
        <div class="detailsBody">${bodyHtml}</div>
      </details>`;
  }

  function renderTrophyDetails(row){
    const prog = String(row[COL.trophProg] ?? "").trim();
    const p100 = String(row[COL.troph100] ?? "").trim();
    const plat = String(row[COL.platin] ?? "").trim();

    if (!prog && !p100 && !plat) return `<div class="small">Keine Trophäen-Daten vorhanden.</div>`;

    // BOX case
    const box = [prog,p100,plat].find(v => String(v).startsWith("BOX_TEIL:"));
    if (box){
      const ref = box.split(":",2)[1] || "";
      return `<div class="small">📦 Teil einer Box ${ref ? `(Referenz: ${esc(ref)})` : ""}</div>`;
    }

    const dprog = parseKeyVals(prog);
    const d100 = parseKeyVals(p100);
    const dpl = parseKeyVals(plat);

    const platforms = ["PS3","PS4","PS5","Vita"];
    const blocks = [];
    for (const p of platforms){
      const pv = dprog[p] ?? "";
      const frac = parseFrac(pv);
      const s100 = d100[p] ?? (p100 && !p100.includes(":") ? p100 : "");
      const spl = dpl[p] ?? (plat && !plat.includes(":") ? plat : "");

      if (!pv && !s100 && !spl) continue;

      const badges = [];
      if (spl === "Platin-Erlangt") badges.push(badge("trophy ok", "💎 Platin"));
      else if (spl === "Wird-Bearbeitet") badges.push(badge("trophy warn", "⏳️ Platin: In Arbeit"));
      else if (spl === "Nicht-Verfügbar") badges.push(badge("trophy bad", "◇ Kein Platin"));
      else if (spl === "Ungespielt") badges.push(badge("trophy", "💤 Ungespielt"));

      if (s100 === "Abgeschlossen") badges.push(badge("trophy ok", "✅️ 100%"));
      else if (s100 === "Wird-Bearbeitet") badges.push(badge("trophy warn", "⏳️ 100%: In Arbeit"));
      else if (s100 === "Nicht-Verfügbar") badges.push(badge("trophy bad", "🚫 100%: N/A"));
      else if (s100 === "Ungespielt") badges.push(badge("trophy", "💤 Ungespielt"));

      let bar = "";
      let line = "";
      if (frac){
        bar = `<div class="bar"><div style="width:${frac.pct}%"></div></div>`;
        line = `<div class="small">${esc(pv)} (${frac.pct}%)</div>`;
      } else if (pv) {
        line = `<div class="small">${esc(pv)}</div>`;
      }

      blocks.push(`
        <div class="platBlock">
          <div class="platHead">
            ${badge("platform", p)}
            ${badges.join("")}
          </div>
          ${line}
          ${bar}
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
      <div class="grid">
        <div class="k">Gesamtstunden</div><div class="v">${esc(total || "—")}</div>
        <div class="k">% Lebenszeit</div><div class="v">${esc(pct || "—")}</div>
        <div class="k">Jahre</div><div class="v">${esc(yrs || "—")}</div>
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

  el.btnMenu.addEventListener("click", () => {
    if (!el.dlg.open) el.dlg.showModal();
  });
  el.btnClose.addEventListener("click", () => el.dlg.close());

  el.btnApply.addEventListener("click", () => {
    state.filters.fav = !!el.fFav.checked;
    el.dlg.close();
    applyAndRender();
  });

  el.btnClear.addEventListener("click", () => {
    state.filters.fav = false;
    state.filters.platforms.clear();
    state.filters.sources.clear();
    state.filters.availability.clear();
    state.filters.trophies.clear();
    el.fFav.checked = false;
    // Reset chip pressed states
    for (const b of el.dlg.querySelectorAll(".chip")){
      const group = b.getAttribute("data-group");
      if (group === "sortField"){
        b.setAttribute("aria-pressed", b.getAttribute("data-key") === "ID" ? "true" : "false");
      } else if (group === "sortDir"){
        b.setAttribute("aria-pressed", b.getAttribute("data-key") === "asc" ? "true" : "false");
      } else {
        b.setAttribute("aria-pressed", "false");
      }
    }
    state.sortField = "ID";
    state.sortDir = "asc";
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