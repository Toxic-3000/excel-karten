/* Spieleliste Webansicht – Vanilla JS
   - lokale XLSX-Lib (vendored) + CDN-Fallback
   - stabiler Bottom-Sheet (Backdrop + ESC + Swipe/Drag optional)
   - Suche + Sort + Filter + Infinite Scroll
   - Trophy-Parsing: "No-Platinum-Title" strikt getrennt von "Platinum"
   - fehlende Plattformblöcke => "Ungespielt" für diese Plattform (Filter berücksichtigt)
*/

(() => {
  'use strict';

  // -----------------------------
  // Config
  // -----------------------------
  const XLSX_LOCAL = 'lib/xlsx.full.min.js?v=20251217-1';
  const XLSX_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

  const PAGE_SIZE = 40;

  // Expected-ish columns (we keep flexible)
  const COL = {
    id: ['ID', 'Id', 'id'],
    title: ['Spieletitel', 'Spiel', 'Titel', 'Title', 'Game'],
    developer: ['Entwickler', 'Developer', 'Dev'],
    subgenre: ['Subgenre', 'Subgenre / Stimmung', 'Genre', 'Mood'],
    scorePress: ['Metascore', 'Pressemeinung (Ø)', 'Press', 'Metacritic'],
    scoreUser: ['Userwertung', 'Userwertung (Ø)', 'User', 'Userscore'],
    mainHours: ['Spielzeit (Main)', 'Main Story (Std.)', 'Main', 'Main Story'],
    hundredHours: ['Spielzeit (100%)', '100 % (Std.)', '100%', 'Completionist'],
    systems: ['Systeme', 'System', 'Platforms', 'Platform'],
    trophies: ['Trophies', 'Trophäen', 'Trophy', 'Trophies (Text)'],
    availability: ['Verfügbarkeit', 'Availability', 'Store', 'Status'],
    // optional additional fields; we display if present in detail view
    desc: ['Kurzbeschreibung', 'Beschreibung', 'Description'],
    sub: ['Subgenre / Stimmung', 'Subgenre', 'Genre'],
  };

  const $ = (sel) => document.querySelector(sel);

  const el = {
    fileInput: $('#fileInput'),
    fileName: $('#fileName'),
    sheetSelect: $('#sheetSelect'),
    searchInput: $('#searchInput'),
    btnMenu: $('#btnMenu'),
    btnReset: $('#btnReset'),
    libStatus: $('#libStatus'),
    dataStatus: $('#dataStatus'),
    summary: $('#summary'),
    list: $('#list'),
    sentinel: $('#sentinel'),

    // sheet
    sheetBackdrop: $('#sheetBackdrop'),
    sheetMenu: $('#sheetMenu'),
    btnCloseSheet: $('#btnCloseSheet'),
    sortSelect: $('#sortSelect'),
    viewSelect: $('#viewSelect'),
    platformSelect: $('#platformSelect'),
    trophySelect: $('#trophySelect'),
    availSelect: $('#availSelect'),
    btnClearFilters: $('#btnClearFilters'),
  };

  // State
  let workbook = null;
  let currentSheetName = null;
  let allRows = [];      // normalized rows
  let filteredRows = []; // after filters+search+sort
  let renderCursor = 0;
  let observer = null;

  const state = {
    search: '',
    sort: 'id_asc',
    view: 'compact',
    platform: 'ALL',
    trophy: 'ALL',
    avail: 'ALL',
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  function normStr(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/\u00A0/g, ' ').trim();
  }
  function normLower(v) {
    return normStr(v).toLowerCase();
  }

  function pick(obj, keys) {
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
    }
    // try case-insensitive
    const map = Object.keys(obj).reduce((acc, kk) => (acc[kk.toLowerCase()] = kk, acc), {});
    for (const k of keys) {
      const hit = map[String(k).toLowerCase()];
      if (hit) return obj[hit];
    }
    return undefined;
  }

  function parseScore(v) {
    const s = normStr(v);
    if (!s) return null;
    // supports "87 / 100" or "87"
    const m = s.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return null;
    return parseFloat(m[1].replace(',', '.'));
  }

  function parseFloatLoose(v) {
    const s = normStr(v);
    if (!s) return null;
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  function parseIntLoose(v) {
    const s = normStr(v);
    if (!s) return null;
    const n = parseInt(s.replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
  }

  function parseSystems(systemField) {
    const s = normStr(systemField);
    if (!s) return [];
    return s
      .split(',').map(x => normStr(x))
      .filter(Boolean)
      .map(x => x.toUpperCase() === 'VITA' ? 'Vita' : x.toUpperCase());
  }

  function isDelisted(availField) {
    const s = normLower(availField);
    if (!s) return false;
    return s.includes('delisted') || s.includes('nicht mehr') || s.includes('nichtmehr') || s.includes('nicht mehr zum kauf');
  }

  function parsePlatformBlocks(text) {
    // splits blocks like "PS4\n06 of 21\n\nPS5\n17 of 18"
    const s = normStr(text);
    if (!s) return new Map();
    const chunks = s.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);

    const map = new Map();
    for (const chunk of chunks) {
      const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      const platform = lines[0].toUpperCase();
      const rest = lines.slice(1).join(' ').trim();

      // e.g. "06 of 21" or "Platinum" or "In Progress" or "No-Platinum-Title"
      // optionally something like "06 of 21 Platinum" etc
      let started = null, total = null, completion = null, platinum = null;

      // count pattern
      const m = rest.match(/(\d+)\s*of\s*(\d+)/i);
      if (m) {
        started = parseInt(m[1], 10);
        total = parseInt(m[2], 10);
        if (Number.isFinite(started) && Number.isFinite(total) && total > 0) {
          completion = started >= total ? 'Completed' : 'Started';
        }
      } else {
        completion = null; // might be purely status like Platinum or In Progress
      }

      // status tokens
      // IMPORTANT: No-Platinum-Title must not be mis-read as Platinum
      const platToken = parsePlatinum(rest);
      if (platToken) platinum = platToken;

      // also accept explicit "In Progress" even with counts
      if (normLower(rest).includes('in progress')) platinum = 'In Progress';

      map.set(platform, { platform, started, total, completion, platinum, raw: chunk });
    }
    return map;
  }

  function parsePlatinum(rest) {
    const r = normStr(rest);
    if (!r) return null;
    // IMPORTANT: strict check; "No-Platinum-Title" must NOT match "Platinum"
    if (r === 'No-Platinum-Title') return 'No-Platinum-Title';
    if (r === 'Platinum') return 'Platinum';
    if (r === 'In Progress') return 'In Progress';
    return null;
  }

  function buildTrophySummary(trophyText, systems) {
    // trophyText may include multiple platform blocks.
    // systems is list from Systeme column e.g. ["PS4","PS5"]
    const blocks = parsePlatformBlocks(trophyText);

    // Build per platform status that exists in systems.
    const per = [];
    const wanted = (systems && systems.length) ? systems : Array.from(blocks.keys());

    for (const plat of wanted) {
      const key = plat.toUpperCase();
      const info = blocks.get(key);
      if (!info) {
        // platform exists in systems but no block => treat as Unplayed on that platform
        per.push({ platform: key, status: 'Unplayed', started: 0, total: null, platinum: null, missing: true });
        continue;
      }

      // Determine status:
      // - Platinum beats everything
      // - No-Platinum-Title explicit
      // - In Progress explicit
      // - Completed if counts complete
      // - Started if counts started
      // - else Unplayed
      let status = 'Unplayed';
      if (info.platinum === 'Platinum') status = 'Platinum';
      else if (info.platinum === 'No-Platinum-Title') status = 'No-Platinum-Title';
      else if (info.platinum === 'In Progress') status = 'In Progress';
      else if (info.completion === 'Completed') status = 'Completed';
      else if (info.completion === 'Started') status = 'Started';

      per.push({ platform: key, status, started: info.started ?? 0, total: info.total ?? null, platinum: info.platinum ?? null, missing: false });
    }

    // overall status used for filtering:
    // trophy filter rules:
    // - Platinum => any platform has Platinum
    // - No-Platinum-Title => any platform is No-Platinum-Title OR overall indicates it
    // - In Progress => any platform In Progress
    // - Completed => any Completed
    // - Started => any Started
    // - Unplayed => if all relevant platforms are Unplayed
    const overall = {
      anyPlatinum: per.some(p => p.status === 'Platinum'),
      anyNoPlat: per.some(p => p.status === 'No-Platinum-Title'),
      anyProgress: per.some(p => p.status === 'In Progress'),
      anyCompleted: per.some(p => p.status === 'Completed'),
      anyStarted: per.some(p => p.status === 'Started'),
      allUnplayed: per.every(p => p.status === 'Unplayed'),
      per,
      raw: normStr(trophyText),
    };

    return overall;
  }

  function safeText(s) {
    return normStr(s).replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function badgeClass(kind) {
    switch (kind) {
      case 'Platinum': return 'badge badge--ok';
      case 'Completed': return 'badge badge--ok';
      case 'No-Platinum-Title': return 'badge badge--warn';
      case 'In Progress': return 'badge badge--progress';
      case 'Started': return 'badge badge--progress';
      case 'Unplayed': return 'badge';
      case 'Delisted': return 'badge badge--danger';
      default: return 'badge';
    }
  }

  function formatScore(v) {
    const n = parseScore(v);
    if (n === null) return '';
    // keep integer if integer
    const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
    return `${s} / 100`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error(`Script failed: ${src}`));
      document.head.appendChild(s);
    });
  }

  function setLibStatus(t) {
    el.libStatus.textContent = t;
  }
  function setDataStatus(t) {
    el.dataStatus.textContent = t;
  }

  async function ensureXLSX() {
    if (window.XLSX) return { ok: true, src: 'already' };

    setLibStatus('Lade XLSX-Library (lokal) …');
    try {
      const src = await loadScript(XLSX_LOCAL);
      setLibStatus('XLSX geladen (lokal).');
      return { ok: true, src };
    } catch (e1) {
      console.warn(e1);
      setLibStatus('Lokal fehlgeschlagen – versuche CDN …');
      try {
        const src = await loadScript(XLSX_CDN);
        setLibStatus('XLSX geladen (CDN).');
        return { ok: true, src };
      } catch (e2) {
        console.error(e2);
        alert(
          `XLSX-Library konnte nicht geladen werden.\n\n` +
          `Mögliche Ursachen:\n` +
          `• Datei lib/xlsx.full.min.js fehlt\n` +
          `• CDN wird blockiert (Adblock/Netzwerk)\n` +
          `• GitHub-Pages liefert eine alte gecachte Version\n\n` +
          `Lösungen:\n` +
          `• Seite hart neu laden (Android: Menü → „Neu laden“ + Cache leeren)\n` +
          `• Adblock/Tracking-Schutz testweise deaktivieren\n` +
          `• Versionsstring in index.html/styles/app erhöhen (Cache-Bust)\n`
        );
        setLibStatus('XLSX NICHT verfügbar.');
        return { ok: false, error: e2 };
      }
    }
  }

  function enableControls(enabled) {
    for (const x of [el.sheetSelect, el.searchInput, el.btnReset, el.sortSelect, el.viewSelect, el.platformSelect, el.trophySelect, el.availSelect, el.btnClearFilters]) {
      x.disabled = !enabled;
    }
  }

  function resetState() {
    workbook = null;
    currentSheetName = null;
    allRows = [];
    filteredRows = [];
    renderCursor = 0;

    state.search = '';
    state.sort = 'id_asc';
    state.view = 'compact';
    state.platform = 'ALL';
    state.trophy = 'ALL';
    state.avail = 'ALL';

    el.sheetSelect.innerHTML = '';
    el.searchInput.value = '';
    el.sortSelect.value = 'id_asc';
    el.viewSelect.value = 'compact';
    el.platformSelect.value = 'ALL';
    el.trophySelect.value = 'ALL';
    el.availSelect.value = 'ALL';

    el.summary.classList.add('hidden');
    el.summary.innerHTML = '';
    el.list.innerHTML = '';
    setDataStatus('Noch keine Daten.');
    enableControls(false);
  }

  // -----------------------------
  // Reading XLSX
  // -----------------------------
  async function readWorkbook(file) {
    const ok = await ensureXLSX();
    if (!ok.ok) throw ok.error;

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    return wb;
  }

  function populateSheetSelect(wb) {
    el.sheetSelect.innerHTML = '';
    for (const name of wb.SheetNames) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      el.sheetSelect.appendChild(opt);
    }
    el.sheetSelect.disabled = false;
  }

  function sheetToJson(wb, name) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }); // array of objects
    return rows;
  }

  function normalizeRows(rows) {
    return rows.map((r, idx) => {
      const id = parseIntLoose(pick(r, COL.id)) ?? (idx + 1);
      const title = normStr(pick(r, COL.title));
      const developer = normStr(pick(r, COL.developer));
      const subgenre = normStr(pick(r, COL.subgenre)) || normStr(pick(r, COL.sub));
      const scorePress = pick(r, COL.scorePress);
      const scoreUser = pick(r, COL.scoreUser);
      const main = parseFloatLoose(pick(r, COL.mainHours));
      const hund = parseFloatLoose(pick(r, COL.hundredHours));
      const systemsRaw = pick(r, COL.systems);
      const systems = parseSystems(systemsRaw);
      const trophiesRaw = pick(r, COL.trophies);
      const availRaw = pick(r, COL.availability);
      const delisted = isDelisted(availRaw);

      const trophySummary = buildTrophySummary(trophiesRaw, systems);

      return {
        _i: idx,
        id,
        title,
        developer,
        subgenre,
        scorePress: formatScore(scorePress),
        scoreUser: formatScore(scoreUser),
        main,
        hund,
        systems,
        trophiesRaw: normStr(trophiesRaw),
        trophySummary,
        availabilityRaw: normStr(availRaw),
        delisted,
        // extras
        desc: normStr(pick(r, COL.desc)),
        raw: r,
      };
    }).filter(x => x.title || x.developer || x.subgenre); // skip empty rows
  }

  // -----------------------------
  // Filter + Sort + Search
  // -----------------------------
  function matchesSearch(row, q) {
    if (!q) return true;
    const hay = `${row.id} ${row.title} ${row.developer} ${row.subgenre} ${row.desc} ${row.systems.join(' ')} ${row.trophiesRaw}`.toLowerCase();
    return hay.includes(q);
  }

  function matchesPlatform(row, p) {
    if (p === 'ALL') return true;
    // platform filter: include if game has that platform in Systeme
    return row.systems.map(x => x.toUpperCase()).includes(p.toUpperCase());
  }

  function matchesAvail(row, a) {
    if (a === 'ALL') return true;
    if (a === 'DELISTED') return row.delisted;
    if (a === 'AVAILABLE') return !row.delisted;
    return true;
  }

  function matchesTrophy(row, t) {
    if (t === 'ALL') return true;
    const s = row.trophySummary;

    if (t === 'Platinum') return s.anyPlatinum;
    if (t === 'No-Platinum-Title') return s.anyNoPlat;
    if (t === 'In Progress') return s.anyProgress;
    if (t === 'Completed') return s.anyCompleted;
    if (t === 'Started') return s.anyStarted;
    if (t === 'Unplayed') return s.allUnplayed;

    return true;
  }

  function sortRows(rows, sortKey) {
    const arr = [...rows];

    const cmp = (a, b) => {
      switch (sortKey) {
        case 'id_asc': return (a.id ?? 0) - (b.id ?? 0);
        case 'id_desc': return (b.id ?? 0) - (a.id ?? 0);
        case 'title_asc': return a.title.localeCompare(b.title, 'de', { sensitivity: 'base' });
        case 'title_desc': return b.title.localeCompare(a.title, 'de', { sensitivity: 'base' });
        case 'score_desc': {
          const sa = parseScore(a.scorePress) ?? -1;
          const sb = parseScore(b.scorePress) ?? -1;
          return sb - sa;
        }
        case 'score_asc': {
          const sa = parseScore(a.scorePress) ?? 999;
          const sb = parseScore(b.scorePress) ?? 999;
          return sa - sb;
        }
        case 'hours_desc': {
          const ha = a.hund ?? a.main ?? -1;
          const hb = b.hund ?? b.main ?? -1;
          return hb - ha;
        }
        case 'hours_asc': {
          const ha = a.hund ?? a.main ?? 99999;
          const hb = b.hund ?? b.main ?? 99999;
          return ha - hb;
        }
        default: return 0;
      }
    };

    arr.sort((a, b) => {
      const d = cmp(a, b);
      if (d !== 0) return d;
      return a._i - b._i;
    });
    return arr;
  }

  function applyAll() {
    const q = normLower(state.search);
    let out = allRows
      .filter(r => matchesSearch(r, q))
      .filter(r => matchesPlatform(r, state.platform))
      .filter(r => matchesTrophy(r, state.trophy))
      .filter(r => matchesAvail(r, state.avail));

    out = sortRows(out, state.sort);

    filteredRows = out;
    renderCursor = 0;
    el.list.innerHTML = '';
    updateSummary();
    renderNextPage(true);
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  function updateSummary() {
    el.summary.classList.remove('hidden');

    const total = allRows.length;
    const shown = filteredRows.length;

    const plat = filteredRows.filter(r => r.trophySummary.anyPlatinum).length;
    const nopl = filteredRows.filter(r => r.trophySummary.anyNoPlat).length;
    const prog = filteredRows.filter(r => r.trophySummary.anyProgress || r.trophySummary.anyStarted).length;
    const unpl = filteredRows.filter(r => r.trophySummary.allUnplayed).length;
    const del = filteredRows.filter(r => r.delisted).length;

    el.summary.innerHTML = `
      <div class="pill">Einträge: <b>${shown}</b> / ${total}</div>
      <div class="pill">Platinum: <b>${plat}</b></div>
      <div class="pill">No-Platinum: <b>${nopl}</b></div>
      <div class="pill">In Arbeit: <b>${prog}</b></div>
      <div class="pill">Ungespielt: <b>${unpl}</b></div>
      <div class="pill">Delisted: <b>${del}</b></div>
    `;

    setDataStatus(`Zeige ${shown} Einträge.`);
  }

  function renderNextPage(clear) {
    const slice = filteredRows.slice(renderCursor, renderCursor + PAGE_SIZE);
    renderCursor += slice.length;

    const frag = document.createDocumentFragment();
    for (const row of slice) frag.appendChild(renderCard(row));

    el.list.appendChild(frag);

    // Stop observing if done
    if (renderCursor >= filteredRows.length) {
      if (observer) observer.disconnect();
      observer = null;
      return;
    }
    ensureObserver();
  }

  function ensureObserver() {
    if (observer) return;
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          renderNextPage(false);
        }
      }
    }, { root: null, rootMargin: '400px', threshold: 0.01 });

    observer.observe(el.sentinel);
  }

  function renderCard(row) {
    const card = document.createElement('article');
    card.className = 'card';

    const sys = row.systems.length ? row.systems.join(', ') : '';
    const press = row.scorePress ? `Presse: ${row.scorePress}` : '';
    const user = row.scoreUser ? `User: ${row.scoreUser}` : '';
    const hours = (row.main || row.hund) ? `Zeit: ${row.main ?? ''}${row.hund ? ` / ${row.hund}` : ''} Std.` : '';

    const topRightBadges = [];
    if (row.delisted) topRightBadges.push({ label: 'Delisted', kind: 'Delisted' });

    // choose "primary" trophy status
    const primary = pickPrimaryTrophy(row.trophySummary);
    if (primary) topRightBadges.push(primary);

    // badges: platform + maybe others
    const tags = [];
    if (sys) tags.push({ label: sys, kind: 'Unplayed' });

    if (press) tags.push({ label: press, kind: 'Unplayed' });
    if (user) tags.push({ label: user, kind: 'Unplayed' });
    if (hours) tags.push({ label: hours, kind: 'Unplayed' });

    const title = safeText(row.title || '(ohne Titel)');
    const sub = safeText([row.subgenre, row.developer].filter(Boolean).join(' • '));

    card.innerHTML = `
      <div class="card__top">
        <div>
          <div class="title">${title}</div>
          <div class="sub">#${row.id}${sub ? ` • ${sub}` : ''}</div>
        </div>
        <div class="tags" style="margin-top:0; justify-content:flex-end;">
          ${topRightBadges.map(b => `<span class="${badgeClass(b.kind)}">${safeText(b.label)}</span>`).join('')}
        </div>
      </div>

      <div class="tags">
        ${tags.map(t => `<span class="badge">${safeText(t.label)}</span>`).join('')}
      </div>

      ${state.view === 'detail' ? renderDetail(row) : ''}
    `;

    return card;
  }

  function pickPrimaryTrophy(summary) {
    // priority: Platinum > No-Platinum > In Progress > Completed > Started > Unplayed
    if (!summary) return null;
    if (summary.anyPlatinum) return { label: 'Platinum', kind: 'Platinum' };
    if (summary.anyNoPlat) return { label: 'No-Platinum-Title', kind: 'No-Platinum-Title' };
    if (summary.anyProgress) return { label: 'In Progress', kind: 'In Progress' };
    if (summary.anyCompleted) return { label: 'Completed', kind: 'Completed' };
    if (summary.anyStarted) return { label: 'Started', kind: 'Started' };
    if (summary.allUnplayed) return { label: 'Ungespielt', kind: 'Unplayed' };
    return null;
  }

  function renderDetail(row) {
    const per = row.trophySummary?.per ?? [];
    const lines = [];
    for (const p of per) {
      const plat = p.platform.toUpperCase() === 'VITA' ? 'Vita' : p.platform.toUpperCase();
      let extra = '';
      if (p.status === 'Started' || p.status === 'Completed') {
        if (p.total != null) extra = ` <span class="muted">(${p.started} of ${p.total})</span>`;
      }
      if (p.missing) extra = ` <span class="muted">(kein Block → ungespielt)</span>`;
      lines.push(`<div class="meta__row"><div class="meta__k">${safeText(plat)}</div><div class="meta__v">${safeText(p.status)}${extra}</div></div>`);
    }

    const d = row.desc ? `<div style="margin-top:10px;" class="muted">${safeText(row.desc)}</div>` : '';
    return `
      <div class="meta">
        ${lines.join('')}
      </div>
      ${d}
    `;
  }

  // -----------------------------
  // Bottom Sheet behavior
  // -----------------------------
  function openSheet() {
    el.sheetBackdrop.classList.remove('hidden');
    el.sheetMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    el.sheetBackdrop.setAttribute('aria-hidden', 'false');
    el.sheetMenu.focus?.();
  }

  function closeSheet() {
    el.sheetBackdrop.classList.add('hidden');
    el.sheetMenu.classList.add('hidden');
    document.body.style.overflow = '';
    el.sheetBackdrop.setAttribute('aria-hidden', 'true');
  }

  // -----------------------------
  // Events
  // -----------------------------
  el.btnMenu.addEventListener('click', () => {
    if (el.btnMenu.disabled) return;
    openSheet();
  });

  el.btnCloseSheet.addEventListener('click', closeSheet);
  el.sheetBackdrop.addEventListener('click', closeSheet);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.sheetMenu.classList.contains('hidden')) closeSheet();
  });

  el.btnReset.addEventListener('click', () => {
    resetState();
    el.fileInput.value = '';
    el.fileName.textContent = 'Keine Datei';
  });

  el.btnClearFilters.addEventListener('click', () => {
    state.search = '';
    state.sort = 'id_asc';
    state.view = 'compact';
    state.platform = 'ALL';
    state.trophy = 'ALL';
    state.avail = 'ALL';

    el.searchInput.value = '';
    el.sortSelect.value = 'id_asc';
    el.viewSelect.value = 'compact';
    el.platformSelect.value = 'ALL';
    el.trophySelect.value = 'ALL';
    el.availSelect.value = 'ALL';

    applyAll();
  });

  el.searchInput.addEventListener('input', () => {
    state.search = el.searchInput.value;
    applyAll();
  });

  el.sortSelect.addEventListener('change', () => {
    state.sort = el.sortSelect.value;
    applyAll();
  });

  el.viewSelect.addEventListener('change', () => {
    state.view = el.viewSelect.value;
    applyAll();
  });

  el.platformSelect.addEventListener('change', () => {
    state.platform = el.platformSelect.value;
    applyAll();
  });

  el.trophySelect.addEventListener('change', () => {
    state.trophy = el.trophySelect.value;
    applyAll();
  });

  el.availSelect.addEventListener('change', () => {
    state.avail = el.availSelect.value;
    applyAll();
  });

  el.sheetSelect.addEventListener('change', () => {
    currentSheetName = el.sheetSelect.value;
    loadSheet();
  });

  el.fileInput.addEventListener('change', async () => {
    const file = el.fileInput.files?.[0];
    if (!file) return;

    el.fileName.textContent = file.name;
    setDataStatus('Lese Datei …');
    enableControls(false);

    try {
      workbook = await readWorkbook(file);
      populateSheetSelect(workbook);
      currentSheetName = workbook.SheetNames[0];
      el.sheetSelect.value = currentSheetName;
      await loadSheet();
      enableControls(true);
      el.searchInput.disabled = false;
      el.btnMenu.disabled = false;
    } catch (err) {
      console.error(err);
      alert('Fehler beim Einlesen der XLSX.\n\nDetails in der Konsole.');
      resetState();
    }
  });

  async function loadSheet() {
    if (!workbook || !currentSheetName) return;

    setDataStatus(`Lade Sheet: ${currentSheetName} …`);
    closeSheet();

    const rawRows = sheetToJson(workbook, currentSheetName);
    allRows = normalizeRows(rawRows);

    setDataStatus(`Geladen: ${allRows.length} Einträge.`);
    enableControls(true);
    el.searchInput.disabled = false;
    el.btnReset.disabled = false;
    el.btnMenu.disabled = false;

    applyAll();
  }

  // init
  resetState();
})();