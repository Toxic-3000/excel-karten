window.__APP_LOADED = true;
if (window.__BOOT && typeof window.__BOOT.noticeTop === 'function') window.__BOOT.noticeTop('');
if (window.__BOOT && typeof window.__BOOT.noticeLoad === 'function') window.__BOOT.noticeLoad('');
console.log("Build loader ready");
/* Spieleliste Webansicht – Clean Rebuild – Build 7.1j47
   - Schnellmenü: Kontext-Info (nur bei aktiven Filtern, nur im geöffneten Schnellmenü)
   - Schnellmenü-FAB: ruhiger Status-Ring bei aktiven Filtern + kurze Ring-Pulse-Sequenz beim Rücksprung in die Kartenansicht
   - Kompaktansicht only
   - Badges mit möglichst fixer Länge
   - Alle Zustände für Quelle/Verfügbarkeit werden angezeigt
   - Store Link: Linktext + echte URL aus Excel (Hyperlink) */
(() => {
  "use strict";
  const BUILD = (document.querySelector('meta[name="app-build"]')?.getAttribute("content") || "V7_1k65c").trim();

  // Header behavior (scroll-progressive):
  // The topbar should *glide out with the content* instead of switching at a hard threshold.
  // We therefore map scrollY -> a progress value within the first N pixels.
  // - progress 0   => header fully visible
  // - progress 1   => header fully out (collapsed)
  // The collapse distance is derived from the real header height so it feels consistent
  // across devices. We intentionally make it a bit longer than the header itself so the
  // movement feels "slow" and not snappy.
  const hdrEl = document.querySelector(".hdr");
  let hdrFullH = 0;
  let hdrCollapseDist = 0;
  let hdrRAF = 0;
  let hdrCollapsed = false;

  // Header easing:
  // Begin the collapse a bit earlier (useful for focus-scroll to card 2), while
  // keeping the overall collapse distance unchanged. We do this by applying a
  // gentle ease-out curve to the raw scroll progress.
  const HDR_EASE_GAMMA = 1.7;

  // Start the collapse a tiny bit earlier (without changing the total collapse distance
  // and without any hard snap). This helps "focus scroll" to card 2 match the visual
  // alignment of deeper cards.
  const HDR_START_EARLY_PX = 10;

  // Auto-scroll lock: prevents the header controller from fighting with programmatic
  // focus scrolling (which would otherwise cause flicker). While locked, we keep the
  // header fully collapsed (progress=1).
  let _autoScrollLockUntil = 0;
  let _autoScrollUnlockTimer = 0;

  const HEADER_ANIM_MS = (() => {
    try{
      const v = getComputedStyle(document.documentElement).getPropertyValue("--hdrAnimMs") || "380ms";
      const n = parseFloat(String(v).trim());
      return Number.isFinite(n) ? n : 380;
    }catch(_){ return 380; }
  })();


  function beginAutoScrollLock(durationMs){
    const ms = Math.max(200, Number(durationMs || 0) || 0);
    _autoScrollLockUntil = Date.now() + ms;
    // Ensure the header stays fully collapsed during programmatic scroll.
    try{ applyHeaderProgress(1); }catch(_){/* ignore */}
    if (_autoScrollUnlockTimer) { try{ clearTimeout(_autoScrollUnlockTimer); }catch(_){/* ignore */} }
    _autoScrollUnlockTimer = setTimeout(() => {
      _autoScrollLockUntil = 0;
      _autoScrollUnlockTimer = 0;
      try{ queueHeaderVisibilityUpdate(); }catch(_){/* ignore */}
    }, ms + 120);
  }
  
  // Measure the real header height and derive a comfortable collapse distance.
  function updateHeaderMetrics(){
    if(!hdrEl) return;

    // Ensure we can measure the full height
    const wasCollapsed = hdrEl.classList.contains("isCollapsed");
    if(wasCollapsed) hdrEl.classList.remove("isCollapsed");

    const fullH = Math.max(hdrEl.scrollHeight, hdrEl.getBoundingClientRect().height);
    hdrFullH = Math.max(1, Math.round(fullH));
    hdrEl.style.setProperty("--hdrMaxH", `${hdrFullH}px`);

    // Make the glide slower than the header height ("slow, with the content").
    // 1.6x is a good starting point; feels natural on phones and tablets.
    hdrCollapseDist = Math.max(hdrFullH + 1, Math.round(hdrFullH * 1.6));
    hdrEl.style.setProperty("--hdrCollapseDist", `${hdrCollapseDist}px`);

    if(wasCollapsed) hdrEl.classList.add("isCollapsed");
  }

  function _getScrollY(){
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function clamp01(n){
    if(n <= 0) return 0;
    if(n >= 1) return 1;
    return n;
  }

  // Apply the header progress directly via CSS vars.
  // We collapse height and translate up in sync so it feels like the bar is
  // "pulled out" while the content moves into its place.
  function applyHeaderProgress(progress){
    if(!hdrEl) return;
    if(!hdrFullH) updateHeaderMetrics();
    const p = clamp01(Number(progress || 0));
    const shift = Math.round(-p * hdrFullH);
    const visH = Math.max(0, Math.round((1 - p) * hdrFullH));
        const op = 1;

    hdrEl.style.setProperty("--hdrShift", `${shift}px`);
    hdrEl.style.setProperty("--hdrVisH", `${visH}px`);
    hdrEl.style.setProperty("--hdrOpacity", `${op}`);

    const nowCollapsed = p >= 0.999;
    if(nowCollapsed !== hdrCollapsed){
      hdrCollapsed = nowCollapsed;
      hdrEl.classList.toggle("isCollapsed", hdrCollapsed);
    }
  }

  function syncHeaderVisibility(){
    if(!hdrEl) return;
    const y = _getScrollY();

    // During programmatic focus scroll we keep it fully collapsed.
    if (Date.now() < _autoScrollLockUntil) {
      applyHeaderProgress(1);
      return;
    }

    // Map scroll distance to progress (slow glide):
    // progress reaches 1 only after hdrCollapseDist pixels.
    // Apply a gentle ease-out so the bar starts collapsing a bit earlier,
    // which avoids the "card 2" focus-scroll state looking different than
    // deeper cards.
    if(!hdrCollapseDist) updateHeaderMetrics();
    const raw = clamp01((y + HDR_START_EARLY_PX) / Math.max(1, hdrCollapseDist));
    const p = 1 - Math.pow(1 - raw, HDR_EASE_GAMMA);
    applyHeaderProgress(p);
  }

  
// rAF/throttle wrapper: keeps header visibility updates cheap even on noisy scroll/resize.
let _headerVisQueued = false;
function queueHeaderVisibilityUpdate() {
  if (_headerVisQueued) return;
  _headerVisQueued = true;
  requestAnimationFrame(() => {
    _headerVisQueued = false;
    syncHeaderVisibility();
  });
}

// Queue a full header re-measurement (height + visibility) after layout-changing events.
// Needed for cases where toolbar content changes without a real resize/scroll (e.g. after Excel import).
let _headerMeasureT = 0;
let _headerMeasuring = false;
function queueHeaderRemeasure(){
  try{ window.clearTimeout(_headerMeasureT); }catch(_){/* ignore */}
  _headerMeasureT = window.setTimeout(() => {
    if (_headerMeasuring) return;
    _headerMeasuring = true;
    try{
      // Two rAF hops: gives the browser time to apply text reflow (wrap/no-wrap) before measuring.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try{ updateHeaderMetrics(); }catch(_){/* ignore */}
          try{ queueHeaderVisibilityUpdate(); }catch(_){/* ignore */}
          _headerMeasuring = false;
        });
      });
    }catch(_){ _headerMeasuring = false; }
  }, 0);
}

// Auto-remeasure when the header's box size changes (e.g. pills wrap after content updates).
try{
  if (window.ResizeObserver && hdrEl){
    const ro = new ResizeObserver(() => {
      if (_headerMeasuring) return;
      queueHeaderRemeasure();
    });
    ro.observe(hdrEl);
  }
}catch(_){/* ignore */}

function onScrollHeader(){
    if(hdrRAF) return;
    hdrRAF = requestAnimationFrame(()=>{
      hdrRAF = 0;
      syncHeaderVisibility();
    });
  }
  const IS_DESKTOP = !!(window.matchMedia && window.matchMedia("(hover:hover) && (pointer:fine)").matches);
  const isSheetDesktop = () => !!(window.matchMedia && window.matchMedia("(min-width: 701px) && (min-height: 521px)").matches);

  // --- Mobile viewport robustness (Android address bar / browser UI) ---
  // Some mobile browsers keep `vh` / even `dvh` a bit optimistic when the address bar is visible.
  // We use VisualViewport (when available) to drive a CSS var that represents the *actually visible* height.
  // This prevents the Schnellmenü from being cut off in portrait when the browser bar is shown.
  function updateVisualViewportVars(){
    const vv = window.visualViewport;
    const h = (vv && typeof vv.height === "number") ? vv.height : window.innerHeight;
    const ih = window.innerHeight;
    // Some browsers keep innerHeight stale-ish while the address bar animates.
    // The delta is still useful as a signal for "viewport chrome is visible".
    const chromeDelta = (typeof ih === "number" && ih > 0) ? (ih - h) : 0;
    // 1% of the visible viewport height
    document.documentElement.style.setProperty("--vvh", `${h * 0.01}px`);
    // Tight mode:
    // - when visible height is small OR
    // - when browser chrome is clearly eating into the viewport (address bar visible).
    // This catches cases where h is still "large" (e.g. tall phones) but the menu still gets clipped.
    const isTight = (h < 780) || (chromeDelta > 44);
    document.documentElement.classList.toggle("vhTight", isTight);
  }

  // --- Device class: Phone vs Tablet/Desktop (orientation-agnostic) ---
  // We treat *phones* as one coherent UI class (portrait && landscape behave the same),
  // because mobile browser chrome + limited height are the dominant constraints.
  // Detection is intentionally conservative:
  // - portrait phones: small width
  // - landscape phones: small height
  function updateDeviceClass(){
    const w = Math.max(0, window.innerWidth || 0);
    const h = Math.max(0, window.innerHeight || 0);
    const isLandscape = (w > 0 && h > 0) ? (w > h) : false;
    const phoneByWidth = (w > 0 && w <= 520);
    // Landscape-Phones haben typischerweise eine sehr geringe Höhe.
    // Tablets in Landscape (z.B. 800×480) sollen NICHT als Phone laufen.
    const phoneByHeight = (isLandscape && h > 0 && h <= 450 && w > 0 && w <= 900);
    const isPhone = phoneByWidth || phoneByHeight;
    document.documentElement.classList.toggle("isPhone", isPhone);
    document.documentElement.classList.toggle("isNonPhone", !isPhone);
  }

  // Initialize immediately + keep synced on bar show/hide.
  updateVisualViewportVars();
  updateDeviceClass();
  window.addEventListener("resize", updateVisualViewportVars, {passive:true});
  window.addEventListener("resize", updateDeviceClass, {passive:true});
  if (window.visualViewport){
    window.visualViewport.addEventListener("resize", updateVisualViewportVars, {passive:true});
    window.visualViewport.addEventListener("resize", updateDeviceClass, {passive:true});
    // Some browsers only update height on scroll of the viewport chrome.
    window.visualViewport.addEventListener("scroll", updateVisualViewportVars, {passive:true});
    window.visualViewport.addEventListener("scroll", updateDeviceClass, {passive:true});
  }

  // Performance instrumentation (disabled by default). Enable locally for profiling.
  const PERF = false;
  const PERF_DETAIL = false; // set true to log render breakdown (HTML build vs DOM apply)


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
    // 1) Textgröße
    fabText: $("fabText"),
    fabTextPanel: $("fabTextPanel"),
    fabTextClose: $("fabTextClose"),
    fabScaleRow: $("fabScaleRow"),
    fabTextDensityRow: $("fabTextDensityRow"),

    // 2) Schnellzugriff (Sortierung + Sprung ins Hauptmenü)
    fabQuick: $("fabQuick"),
    fabQuickPanel: $("fabQuickPanel"),
    fabQuickClose: $("fabQuickClose"),
    fabQuickInfo: $("fabQuickInfo"),
    fabQuickInfoA: $("fabQuickInfoA"),
    fabQuickInfoB: $("fabQuickInfoB"),
    fabQuickReset: $("fabQuickReset"),
    fabSortFieldRow: $("fabSortFieldRow"),
    fabSortDirRow: $("fabSortDirRow"),
    fabMarkRow: $("fabMarkRow"),
    fabDepthRow: $("fabDepthRow"),
    fabOpenMenu: $("fabOpenMenu"),
    search: $("search"),
    searchClearBtn: $("searchClearBtn"),
    menuSearch: $("menuSearch"),
    menuSearchClearBtn: $("menuSearchClearBtn"),
    searchHelpBtn: $("searchHelpBtn"),
    searchHelpBody: $("searchHelpBody"),
    menuSearchHelpBtn: $("menuSearchHelpBtn"),
    menuSearchHelpBody: $("menuSearchHelpBody"),

    // Excel/Import details (inline like the search help)
    fileMoreBtn: $("fileMoreBtn"),
    fileMoreBody: $("fileMoreBody"),
    fileMoreWrap: $("fileMore"),
    cards: $("cards"),
    viewToast: $("viewToast"),
    empty: $("empty"),
    pillFile: $("pillFile"),
    pillRows: $("pillRows"),
    hitCount: $("hitCount"),
    toolbarRow: $("toolbarRow"),
    pillXlsxPanel: $("pillXlsxPanel"),
    pillImport: $("pillImport"),
    dlg: $("dlg"),
    btnClose: $("btnClose"),
    btnApply: $("btnApply"),
    btnClear: $("btnClear"),
    sortFieldRow: $("sortFieldRow"),
    sortDirRow: $("sortDirRow"),
    activeFilters: $("activeFilters"),
    quickRow: $("quickRow"),
    platRow: $("platRow"),
    srcRow: $("srcRow"),
    availRow: $("availRow"),
    trophyAllRow: $("trophyAllRow"),
    trophyPresetRow: $("trophyPresetRow"),
    genreSelect: $("genreSelect"),
    genreRowDesktop: $("genreRowDesktop"),

    // Accordion summaries
    platSummary: $("platSummary"),
    srcSummary: $("srcSummary"),
    availSummary: $("availSummary"),
    trophySummary: $("trophySummary"),
  };

  // --- UI: Sortierung (Feld + Richtung) speichern ---
  const SORT_FIELD_KEY = "spieleliste_sortField";
  const SORT_DIR_KEY   = "spieleliste_sortDir";

  
  // Sortier-Reihenfolge strikt nach Erscheinung auf der Karte (oben → unten)
  // und zusätzlich in sinnvollen Gruppen für die native Select-UI.
  // Hinweis: "Plattform" und "Entwickler" sind echte Sortierfelder.
  // Plattform = Primärplattform nach Priorität (PS5 > PS4 > PS3 > Vita).
  // Entwickler = erster Entwickler-Eintrag, normalisiert ("The " nur fürs Sortieren ignoriert).
  const SORT_FIELDS = [
    // Identität
    {k:"ID", label:"ID", group:"Identität"},
    {k:"Spieletitel", label:"Titel", group:"Identität"},
    {k:"__platform", label:"Plattform", group:"Identität"},

    // Besitz
    {k:"Quelle", label:"Quelle", group:"Besitz"},
    {k:"Verfügbarkeit", label:"Verfügbarkeit", group:"Besitz"},

    // Einordnung
    {k:"Genre", label:"Genre", group:"Einordnung"},
    {k:"__developer", label:"Entwickler", group:"Einordnung"},

    // Spielzeit
    {k:"Spielzeit (Main)", label:"Main", group:"Spielzeit"},
    {k:"Spielzeit (100%)", label:"100%", group:"Spielzeit"},

    // Bewertungen
    {k:"Metascore", label:"Metascore", group:"Bewertungen"},
    {k:"Userwertung", label:"Userwertung", group:"Bewertungen"},

    // Trophäen
    {k:"__trophyPct", label:"Trophäen-Fortschritt (%)", group:"Trophäen"},
    {k:"__trophyOpen", label:"Offene Trophäen (Anzahl)", group:"Trophäen"},
  ];


  function loadSortPrefs(){
    const sf = (localStorage.getItem(SORT_FIELD_KEY) || "").trim();
    const sd = (localStorage.getItem(SORT_DIR_KEY) || "").trim();
    const validSf = SORT_FIELDS.some(x => x.k === sf && !x.disabled);
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
    document.documentElement.style.setProperty("--uiScaleRaw", String(preset.v));
    document.documentElement.style.setProperty("--uiScale", String(preset.v));
    localStorage.setItem(UI_SCALE_KEY, preset.id);
    updateFabScaleUI();
    // Layout-dependent (toolbar compaction)
    queueToolbarCompactness();

    // The scroll-progressive header caches its measured height.
    // When UI scale changes, re-measure so the topbar doesn't get clipped
    // on desktop/tablet (overflow:hidden + stale max-height).
    try{
      requestAnimationFrame(() => {
        try{ updateHeaderMetrics(); }catch(_){/* ignore */}
        try{ queueHeaderVisibilityUpdate(); }catch(_){/* ignore */}
        // Mobile browsers sometimes apply final viewport metrics (address bar/safe-area)
        // only after a resize pass. Trigger a synthetic resize so the topbar recomputes
        // immediately (no manual scroll nudge required).
        try{ window.dispatchEvent(new Event('resize')); }catch(_){/* ignore */}
      });
    }catch(_){/* ignore */}
  }

  function cycleScale(currentId){
    const idx = UI_SCALES.findIndex(x => x.id === currentId);
    return UI_SCALES[(idx + 1) % UI_SCALES.length].id;
  }

  // --- UI: Adaptive toolbar compaction timer ---
  // NOTE: Must be initialized BEFORE applyScale() runs during startup.
  // applyScale() calls queueToolbarCompactness(), which touches this timer.
  let _toolbarT = 0;

  let currentScalePreset = getScalePreset();
  applyScale(currentScalePreset);

  // Startup safety net:
  // On some mobile browsers, the sticky header's final size (fonts + visual viewport)
  // can settle a beat after initial JS runs. If we only measure once, the cached header
  // height can be slightly too small, causing subtle clipping until the first scroll.
  // We re-measure a few times during startup (cheap) without changing any visuals.
  (function ensureHeaderMetricsOnLoad(){
    const remeasure = () => {
      try{ updateHeaderMetrics(); }catch(_){/* ignore */}
      try{ queueHeaderVisibilityUpdate(); }catch(_){/* ignore */}
    };
    try{
      requestAnimationFrame(() => {
        remeasure();
        requestAnimationFrame(remeasure);
      });
    }catch(_){/* ignore */}
    try{ window.addEventListener('load', () => { try{ requestAnimationFrame(remeasure); }catch(_){ remeasure(); } }, {once:true, passive:true}); }catch(_){/* ignore */}
    try{ if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try{ requestAnimationFrame(remeasure); }catch(_){ remeasure(); } }); }catch(_){/* ignore */}
    try{ setTimeout(remeasure, 220); }catch(_){/* ignore */}
  })();


  // --- UI: Lesemodus (nur Akkordeon-Inhalte) ---
  // Ziel: Default AUS = exakt wie Build 64z.
  // Wenn AN: Lesestile nur auf geoeffnete <details.d> in/nahe Viewport (IntersectionObserver),
  // damit Scroll (Topbar) stabil bleibt.
  const READ_MODE_KEY = "spieleliste_readMode";
  const READ_MODE_MARGIN = 350; // px prefetch around viewport

  function getReadModeOn(){
    const v = (localStorage.getItem(READ_MODE_KEY) || "").trim().toLowerCase();
    return v === "on" || v === "1" || v === "true";
  }

  let _readModeOn = getReadModeOn();
  let _readObs = null;
  let _readObsWired = false;

  function _nearViewport(elm){
    try{
      const r = elm.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return (r.bottom >= -READ_MODE_MARGIN) && (r.top <= (vh + READ_MODE_MARGIN));
    }catch(_){
      return true;
    }
  }

  function ensureReadObserver(){
    if (_readObs) return;
    if (!('IntersectionObserver' in window)) return; // graceful fallback
    _readObs = new IntersectionObserver((entries) => {
      for (const e of entries){
        const det = e.target;
        if (!det || det.tagName !== 'DETAILS') continue;
        // Only card accordions (not menu/help details)
        if (!det.classList || !det.classList.contains('d')) continue;
        const active = !!_readModeOn && !!det.open && !!e.isIntersecting;
        det.classList.toggle('is-reading', active);
      }
    }, {
      root: null,
      rootMargin: `${READ_MODE_MARGIN}px 0px ${READ_MODE_MARGIN}px 0px`,
      threshold: 0.01,
    });
  }

  function teardownReadObserver(){
    try{ _readObs?.disconnect?.(); }catch(_){/* ignore */}
    _readObs = null;
    try{
      if (el.cards){
        for (const det of el.cards.querySelectorAll('details.d.is-reading')){
          det.classList.remove('is-reading');
        }
      }
    }catch(_){/* ignore */}
  }

  function observeDetails(det){
    if (!det || det.tagName !== 'DETAILS') return;
    if (!det.classList?.contains('d')) return;
    if (!_readModeOn) return;
    ensureReadObserver();
    if (_readObs){
      try{ _readObs.observe(det); }catch(_){/* ignore */}
    }
    // Immediate: avoid visible "pop" on open in the viewport
    try{ det.classList.toggle('is-reading', !!det.open && _nearViewport(det)); }catch(_){/* ignore */}
  }

  function unobserveDetails(det){
    if (!det || det.tagName !== 'DETAILS') return;
    if (!det.classList?.contains('d')) return;
    try{ _readObs?.unobserve?.(det); }catch(_){/* ignore */}
    try{ det.classList.remove('is-reading'); }catch(_){/* ignore */}
  }

  function refreshReadModeObserved(){
    if (!_readModeOn) {
      teardownReadObserver();
      return;
    }
    // Recreate observer after big DOM swaps (render replaces cards)
    teardownReadObserver();
    ensureReadObserver();
    if (!el.cards) return;
    try{
      for (const det of el.cards.querySelectorAll('details.d[open]')){
        observeDetails(det);
      }
    }catch(_){/* ignore */}
  }

  function updateFabReadModeUI(){
    if (!el.fabTextDensityRow) return;
    for (const b of el.fabTextDensityRow.querySelectorAll('.chip')){
      const k = (b.getAttribute('data-key') || '').trim();
      const on = (k === 'on');
      const pressed = (_readModeOn && on) || (!_readModeOn && k === 'off');
      b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    }
  }

  function setReadMode(on, {persist=true}={}){
    _readModeOn = !!on;
    try{
      if (persist) localStorage.setItem(READ_MODE_KEY, _readModeOn ? 'on' : 'off');
    }catch(_){/* ignore */}
    try{
      if (_readModeOn) document.documentElement.dataset.reading = '1';
      else delete document.documentElement.dataset.reading;
    }catch(_){/* ignore */}
    updateFabReadModeUI();
    refreshReadModeObserved();
  }

  function wireReadModeRow(){
    if (_readObsWired) return;
    if (!el.fabTextDensityRow) return;
    _readObsWired = true;
    el.fabTextDensityRow.addEventListener('click', (ev) => {
      const btn = ev.target?.closest?.('.chip');
      if (!btn) return;
      const k = (btn.getAttribute('data-key') || '').trim();
      if (k === 'on') setReadMode(true);
      else if (k === 'off') setReadMode(false);
    });
    updateFabReadModeUI();
  }

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
    const chips = el.fabSortFieldRow.querySelectorAll('.chip');
    if (chips && chips.length){
      for (const b of chips){
        b.setAttribute('aria-pressed', b.getAttribute('data-key') === state.sortField ? 'true' : 'false');
      }
      return;
    }
    const btn = el.fabSortFieldRow.querySelector('#fabSortFieldBtn');
    const panel = el.fabSortFieldRow.querySelector('#fabSortFieldPanel');
    if (btn){
      const map = {
        'ID':'ID',
        'Spieletitel':'Titel',
        'Metascore':'Meta',
        'Userwertung':'User',
        'Spielzeit (Main)':'Main',
        'Spielzeit (100%)':'100%',
      };
      const label = map[state.sortField] || state.sortField || 'ID';
      const labEl = btn.querySelector('.ddBtnLabel');
      if (labEl) labEl.textContent = label;
    }
    if (panel){
      for (const it of panel.querySelectorAll('.ddItem')){
        it.classList.toggle('is-active', (it.getAttribute('data-value') === state.sortField));
      }
    }
  }

  function updateFabMarkUI(){
    if (!el.fabMarkRow) return;
    const on = !!state.ui?.highlights;
    for (const b of el.fabMarkRow.querySelectorAll('.chip')){
      const k = b.getAttribute('data-key');
      b.setAttribute('aria-pressed', (on && k === 'on') || (!on && k === 'off') ? 'true' : 'false');
    }
  }

  function updateFabDepthUI(){
    if (!el.fabDepthRow) return;
    const cur = String(state.cardView || 'detail');
    for (const b of el.fabDepthRow.querySelectorAll('.chip')){
      const k = b.getAttribute('data-key');
      b.setAttribute('aria-pressed', (k === cur) ? 'true' : 'false');
    }
  }

  // --- UI: Adaptive toolbar compaction (keeps one line even on A+++) ---
  function updateToolbarCompactness(){
    const bar = el.toolbarRow;
    if (!bar) return;
    bar.classList.remove("compact2");
    // If things don't fit (e.g. A+++), show only the number && slightly reduce button padding.
    if (bar.scrollWidth > bar.clientWidth + 1) bar.classList.add("compact2");
    try{ queueHeaderRemeasure(); }catch(_){/* ignore */}
  }

  function queueToolbarCompactness(){
    window.clearTimeout(_toolbarT);
    _toolbarT = window.setTimeout(() => {
      // Use rAF to measure after layout settles.
      requestAnimationFrame(updateToolbarCompactness);
    }, 0);
  }

  window.addEventListener("resize", queueToolbarCompactness);

  
  // --- A11y: Fokus-Management für FAB-Menüs ---
  let _fabLastOpener = null;
  function _isFocusInside(elm){
    try{ const a = document.activeElement; return !!(a && elm && elm.contains(a)); }catch(_){ return false; }
  }
  function _restoreFabFocus(){
    try{
      if (_fabLastOpener && typeof _fabLastOpener.focus === "function") _fabLastOpener.focus({preventScroll:true});
    }catch(_){/* ignore */}
    _fabLastOpener = null;
  }
  function _focusFirstIn(panel, selectors){
    try{
      if (!panel) return;
      for (const sel of selectors){
        const el0 = panel.querySelector(sel);
        if (el0 && !el0.disabled && el0.offsetParent !== null){
          el0.focus({preventScroll:true});
          return;
        }
      }
    }catch(_){/* ignore */}
  }

  // --- A11y: Focus Trap für FAB-Panels (Tab bleibt im offenen Panel) ---
  function _getFocusableIn(root){
    try{
      const els = Array.from(root.querySelectorAll(
        "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])"
      ));
      return els.filter(e => {
        if (!e) return false;
        if (e.disabled) return false;
        if (e.getAttribute && e.getAttribute("aria-hidden") === "true") return false;
        // offsetParent==null filters display:none && some hidden states; keep focusable only when visible
        if (e.offsetParent === null) return false;
        return true;
      });
    }catch(_){
      return [];
    }
  }

  function _wireFabTrap(panel){
    try{
      if (!panel || panel.__fabTrapWired) return;
      panel.__fabTrapWired = true;
      panel.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        if (panel.hidden) return;
        const focusables = _getFocusableIn(panel);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey){
          if (active === first || !panel.contains(active)){
            e.preventDefault();
            last.focus({preventScroll:true});
          }
        }else{
          if (active === last){
            e.preventDefault();
            first.focus({preventScroll:true});
          }
        }
      });
    }catch(_){/* ignore */}
  }



  // --- Reset-Mikrofeedback: Statusbox kurz stehen lassen, ohne "0 Filter" zu zeigen ---
  let _quickResetHoldUntil = 0;
  let _quickResetHoldTimer = 0;
  function _holdQuickInfoAfterReset(ms){
    _quickResetHoldUntil = Date.now() + ms;
    try{ if (_quickResetHoldTimer) window.clearTimeout(_quickResetHoldTimer); }catch(_){/* ignore */}
    _quickResetHoldTimer = window.setTimeout(() => {
      _quickResetHoldTimer = 0;
      _quickResetHoldUntil = 0;
      try{ updateQuickMenuInfo(); }catch(_){/* ignore */}
    }, Math.max(0, ms + 20));
  }

function closeFabText(){
    if (!el.fabTextPanel) return;
    const wasOpen = !el.fabTextPanel.hidden;
    const hadFocus = _isFocusInside(el.fabTextPanel);
    el.fabTextPanel.hidden = true;
    try{ el.fabText?.setAttribute("aria-expanded","false"); }catch(_){/* ignore */}
    if (wasOpen && hadFocus) _restoreFabFocus();
  }

  function closeFabQuick(){
    if (!el.fabQuickPanel) return;
    const wasOpen = !el.fabQuickPanel.hidden;
    const hadFocus = _isFocusInside(el.fabQuickPanel);
    el.fabQuickPanel.hidden = true;
    try{ el.fabQuick?.setAttribute("aria-expanded","false"); }catch(_){/* ignore */}
    try{ if (el.fabQuickInfo) el.fabQuickInfo.hidden = true; }catch(_){/* ignore */}
    try{ el.fabQuickPanel.classList.remove("hasQuickInfo"); }catch(_){/* ignore */}
    if (wasOpen && hadFocus) _restoreFabFocus();
  }

  function closeFabs(){
    const focusInText = _isFocusInside(el.fabTextPanel);
    const focusInQuick = _isFocusInside(el.fabQuickPanel);
    closeFabText();
    closeFabQuick();
    if (focusInText || focusInQuick) _restoreFabFocus();
  }

  function toggleFabText(){
    if (!el.fabTextPanel) return;
    const willOpen = !!el.fabTextPanel.hidden;
    if (willOpen) _fabLastOpener = el.fabText;
    closeFabs();
    el.fabTextPanel.hidden = !willOpen;
    try{ el.fabText?.setAttribute("aria-expanded", willOpen ? "true" : "false"); }catch(_){/* ignore */}
    if (willOpen){
      window.setTimeout(() => _focusFirstIn(el.fabTextPanel, ["#fabTextClose", ".chip"]), 0);
    }else{
      _restoreFabFocus();
    }
  }

  function toggleFabQuick(){
    if (!el.fabQuickPanel) return;
    const willOpen = !!el.fabQuickPanel.hidden;
    if (willOpen) _fabLastOpener = el.fabQuick;
    closeFabs();
    el.fabQuickPanel.hidden = !willOpen;
    try{ el.fabQuick?.setAttribute("aria-expanded", willOpen ? "true" : "false"); }catch(_){/* ignore */}
    // Info appears only inside the open Schnellmenü.
    try{ updateQuickMenuInfo(); }catch(_){/* ignore */}
  }

  function buildFab(){
    // Zwei kleine Floating-Menüs: Textgröße und Schnellzugriff (Sortieren + Hauptmenü)
    if (!el.fabText || !el.fabTextPanel || !el.fabQuick || !el.fabQuickPanel) return;

    // A11y: keep Tab navigation inside open FAB panels
    _wireFabTrap(el.fabTextPanel);
    _wireFabTrap(el.fabQuickPanel);

    // Build scale chips (explicit choose, no multi-tap cycling)
    if (el.fabScaleRow){
      el.fabScaleRow.innerHTML = UI_SCALES.map(s => chipHtml("uiScale", s.id, s.label, s.id === currentScalePreset)).join("");
    }

    // Wire Lesemodus toggle row (static buttons in HTML)
    try{ wireReadModeRow(); }catch(_){/* ignore */}
    // Apply persisted Lesemodus state (default AUS)
    try{ setReadMode(_readModeOn, {persist:false}); }catch(_){/* ignore */}

    // Build quick sort direction chips
    if (el.fabSortDirRow){
      el.fabSortDirRow.innerHTML = [
        chipHtml("quickSortDir", "asc", "↑ Auf", state.sortDir === "asc"),
        chipHtml("quickSortDir", "desc", "↓ Ab", state.sortDir === "desc"),
      ].join("");
    }

    // Build mark/highlight toggle (visual only, not a filter)
    if (el.fabMarkRow){
      const on = !!state.ui?.highlights;
      el.fabMarkRow.innerHTML = [
        chipHtml("quickMarks", "on", "An", on),
        chipHtml("quickMarks", "off", "Aus", !on),
      ].join("");
    }

    // Build card view mode chips (Mini/Kompakt/Detail)
    if (el.fabDepthRow){
      const cur = String(state.cardView || "detail");
      el.fabDepthRow.innerHTML = [
        chipHtml("cardView", "mini", "Mini", cur === "mini"),
        chipHtml("cardView", "compact", "Kompakt", cur === "compact"),
        chipHtml("cardView", "detail", "Detail", cur === "detail"),
      ].join("");
    }

    // Build quick sort field (dropdown)
    if (el.fabSortFieldRow){
      const enabled = [
        {k:"ID", label:"ID"},
        {k:"Spieletitel", label:"Titel"},
        {k:"Metascore", label:"Meta"},
        {k:"Userwertung", label:"User"},
        {k:"Spielzeit (Main)", label:"Main"},
        {k:"Spielzeit (100%)", label:"100%"},
      ];
      const cur = enabled.find(sf => sf.k === state.sortField) || enabled[0];

      const items = enabled.map(sf => `
        <button type="button" class="ddItem ${state.sortField===sf.k ? 'is-active' : ''}" data-value="${esc(sf.k)}">
          <span class="ddMark">✓</span>
          <span class="ddText">${esc(sf.label)}</span>
        </button>
      `).join("");

      el.fabSortFieldRow.innerHTML = `
        <div class="dd" id="fabSortFieldDD">
          <button type="button" class="ddBtn" id="fabSortFieldBtn" aria-haspopup="listbox" aria-expanded="false" title="Sortieren nach">
            <span class="ddBtnLabel">${esc(cur?.label ?? 'ID')}</span>
            <span class="ddCaret">▾</span>
          </button>
          <div class="ddPanel" id="fabSortFieldPanel" role="listbox" hidden>
            ${items}
          </div>
        </div>
      `;

      const dd = el.fabSortFieldRow.querySelector('#fabSortFieldDD');
      const btn = el.fabSortFieldRow.querySelector('#fabSortFieldBtn');
      const panel = el.fabSortFieldRow.querySelector('#fabSortFieldPanel');
      if (dd) dd.addEventListener('click', (e) => e.stopPropagation());
      if (btn && panel){
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          __toggleDesktopPanel(panel);
        });
        for (const it of panel.querySelectorAll('.ddItem')){
          it.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = it.getAttribute('data-value') || 'ID';
            state.sortField = key;
            saveSortPrefs();

            const label = enabled.find(sf => sf.k === key)?.label || key;
            const labEl = btn.querySelector('.ddBtnLabel');
            if (labEl) labEl.textContent = label;
            for (const b of panel.querySelectorAll('.ddItem')){
              b.classList.toggle('is-active', (b.getAttribute('data-value') === key));
            }

            applyAndRender();
            __closeDesktopPanel();
          });
        }
      }
    }

    // Wire FAB open/close
    el.fabText.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFabText();
    });
    el.fabQuick.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFabQuick();
    });

    // Clicks inside the panels should not close them.
    el.fabTextPanel.addEventListener("click", (e) => e.stopPropagation());
    el.fabQuickPanel.addEventListener("click", (e) => e.stopPropagation());

    if (el.fabTextClose){
      el.fabTextClose.addEventListener("click", (e) => { e.stopPropagation(); closeFabText(); });
    }
    if (el.fabQuickClose){
      el.fabQuickClose.addEventListener("click", (e) => { e.stopPropagation(); closeFabQuick(); });
    }

    // Wire chips inside panels
    const chipButtons = [
      ...(el.fabTextPanel.querySelectorAll(".chip") || []),
      ...(el.fabQuickPanel.querySelectorAll(".chip") || []),
    ];
    for (const btn of chipButtons){
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
        if (group === "cardView"){
          const next = String(key || 'detail');
          setCardView(next);
          return;
        }
        if (group === "quickMarks"){
          const next = (key === "on");
          if (!state.ui) state.ui = { lastCount: 0, lastFilterSig: "", highlights: false };
          state.ui.highlights = next;
          updateFabMarkUI();
          // Apply/remove highlights only in visible (opened) text areas.
          try{ syncOpenTextHighlights(); }catch(_){/* ignore */}
          return;
        }
      });
    }

    // Open the full menu from the quick FAB (so you never have to scroll back up)
    if (el.fabOpenMenu){
      el.fabOpenMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        closeFabs();
        openMenuDialog();
      });
    }


    // Schnellmenü: Filter-Reset (nur sichtbar, wenn Filter aktiv sind)
    if (el.fabQuickReset){
      el.fabQuickReset.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!hasActiveFiltersOrSearch()) return;
        clearAllFiltersOnly();
        // Mini-Feedback: Statusbox bleibt kurz sichtbar, aber ohne Filter-Zeile/Reset-Button.
        _holdQuickInfoAfterReset(220);
        // Keep all UIs in sync (dialog chips, active-filter bar, FAB indicator).
        try{ buildFilterUI(); }catch(_){/* ignore */}
        try{ updateDialogMeta(true); }catch(_){/* ignore */}
        // Apply immediately when data is loaded (debounced).
        try{ scheduleLiveApply(); }catch(_){/* ignore */}
        try{ updateQuickFilterIndicator(); }catch(_){/* ignore */}
      });
    }

    // Close on outside click / Esc
    document.addEventListener("click", () => closeFabs());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape"){ if ((el.fabTextPanel && !el.fabTextPanel.hidden) || (el.fabQuickPanel && !el.fabQuickPanel.hidden)) { e.preventDefault(); closeFabs(); } } });

// Safety: Mobile-Browser ändern im Landscape gern den "sichtbaren" Viewport (Browserbar rein/raus).
// Damit Panels nicht in einem offenen/abgeschnittenen Zustand "kleben" bleiben, schließen wir sie
// bei Viewport-Änderungen automatisch.
let __fabResizeT = 0;
const __onFabViewportChange = () => {
  try{ window.clearTimeout(__fabResizeT); }catch(_){/* ignore */}
  __fabResizeT = window.setTimeout(() => closeFabs(), 120);
};
window.addEventListener("resize", __onFabViewportChange, { passive: true });
window.addEventListener("orientationchange", () => closeFabs(), { passive: true });
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

  // --- Kartenmodi (Mini/Kompakt/Detail) ---
  const CARDVIEW_KEY = 'spieleliste.cardview';
  const CARDVIEW_DEFAULT_BEFORE_IMPORT = 'detail';
  const CARDVIEW_DEFAULT_AFTER_IMPORT = 'mini';

  function loadCardView(){
    try{
      const v = String(localStorage.getItem(CARDVIEW_KEY) || '').trim().toLowerCase();
      if (v === 'mini' || v === 'compact' || v === 'detail') return v;
    }catch(_){/* ignore */}
    return CARDVIEW_DEFAULT_BEFORE_IMPORT;
  }

  function saveCardView(v){
    try{ localStorage.setItem(CARDVIEW_KEY, String(v)); }catch(_){/* ignore */}
  }

  function setCardView(mode){
    const m = String(mode || '').trim().toLowerCase();
    if (m !== 'mini' && m !== 'compact' && m !== 'detail') return;
    if (state.cardView === m) return;
    state.cardView = m;
    // Reset per-card openness when switching global mode
    state.activeCardId = null;
    state.detailOpenId = null;
    try{ document.documentElement.dataset.cardview = m; }catch(_){/* ignore */}
    saveCardView(m);
    try{ updateFabDepthUI(); }catch(_){/* ignore */}
    // Card view is purely presentational; rerender is fine (keeps DOM deterministic)
    try{ applyAndRender(); }catch(_){/* ignore */}
  }

  function _isCardInView(card){
    try{
      const r = card.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 0);
      // consider it in view if top is within 20%..90% of viewport
      return (r.top >= vh*0.20) && (r.top <= vh*0.90);
    }catch(_){ return true }
  }

  function _prefersReducedMotion(){
    try{ return !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(_){ return false }
  }

  function _stickyHeaderHeight(){
    try{
      const hdr = document.querySelector('.hdr');
      if (!hdr) return 0;
      const r = hdr.getBoundingClientRect();
      return Math.max(0, Math.round(r.height || 0));
    }catch(_){ return 0 }
  }

  function focusCardToReadingPosition(card){
    // Deterministic focus scroll (Desktop/Tablet friendly):
    // keep the card anchored at a consistent position below the sticky header.
    try{
      const r = card.getBoundingClientRect();
      const hdrH = _stickyHeaderHeight();
      // On smaller viewports, the sticky header height tends to be visually "taller" than
      // what we want to reserve for the focus scroll. We allow a tiny controlled overlap
      // so the active card sits a bit higher in the viewport.
      const vw = window.innerWidth || 800;
      // Phase 2.3: Make the focused card land *much* higher (user feedback).
      // We allow a large controlled "overlap" of the header reserve so the active
      // card ends up close to the top edge, especially on phones.
      // This remains deterministic and applies equally to Mini & Kompakt.
      // Phase 2.5: User wants ~30px deeper than 2.4; nudge target down a bit.
      // Reducing overlap means we reserve a bit more header space, so the card lands lower.
      const overlap = vw < 520 ? 200 : (vw < 900 ? 160 : 120); // px
      const effectiveHdr = Math.max(0, hdrH - overlap);
      const extra = 17; // Phase 2.5+: Fokusposition um 15px nach oben nachkorrigiert
      const target = Math.max(0, Math.round((window.scrollY || 0) + r.top - effectiveHdr - extra));
      const behavior = _prefersReducedMotion() ? 'auto' : 'smooth';

      // Prevent the Topbar from flickering while the focus scroll is running.
      // We lock header visibility updates for a short time and keep it hidden.
      // This avoids a fight between smooth scrolling + scroll listeners.
      try{ beginAutoScrollLock(HEADER_ANIM_MS + 520); }catch(_){/* ignore */}
      window.scrollTo({ top: target, behavior });

      // Some browsers (esp. mobile) finish smooth scrolling slightly off due to
      // Multi-pass correction: counter scroll anchoring, layout shifts and mobile browser chrome
      // (address bar) dynamics. Goal: constant visual top offset for the active card.
      if (behavior === 'smooth'){
        const desiredTop = Math.max(0, effectiveHdr + extra);
        let tries = 0;
        const adjust = () => {
          tries++;
          try{
            const r2 = card.getBoundingClientRect();
            const delta = r2.top - desiredTop;
            if (Math.abs(delta) > 2){
              window.scrollBy({ top: delta, behavior: 'auto' });
            }
          }catch(_){/* ignore */}
          if (tries < 6) setTimeout(adjust, 120);
        };
        setTimeout(adjust, 120);
      }
}catch(_){/* ignore */}
  }

  function scheduleFocusScrollById(id){
    // Wait for DOM + layout (after expanding/syncing) before scrolling.
    const sid = String(id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const card = el.cards?.querySelector?.(`.card[data-id="${CSS.escape(sid)}"]`);
        if (card) focusCardToReadingPosition(card);
      });
    });
  }

  function onCardTapById(id){
    const m = String(state.cardView || 'detail');
    if (m === 'detail') return;
    const cur = String(state.activeCardId || '');
    const sid = String(id);

    // Final rules:
    // - Tap zone is the whole card.
    // - No "back" via tapping the same card.
    // - Focus scroll when a card becomes active via FIRST tap in global Mini OR global Kompakt.
    // - No focus scroll when deepening the active card (Kompakt → Detail) or opening accordions.
    if (m === 'mini'){
      if (cur !== sid){
        // Enter card: Mini → Kompakt (+ focus scroll)
        state.activeCardId = sid;
        state.detailOpenId = null;
         syncCardStates();
    try{ syncAllCardHighlights(); }catch(_){/* ignore */}
        scheduleFocusScrollById(sid);
        return;
      }
      // Same card tapped again: Kompakt → Detail (no scroll)
      if (state.detailOpenId !== sid){
        state.detailOpenId = sid;
         syncCardStates();
    try{ syncAllCardHighlights(); }catch(_){/* ignore */}
      }
      return;
    }

    if (m === 'compact'){
      // In global Kompakt mode all cards show the compact zone.
      // FIRST tap on a non-active card focuses it (+ focus scroll). SECOND tap on the active card deepens to Detail.
      if (cur !== sid){
        state.activeCardId = sid;
        state.detailOpenId = null;
         syncCardStates();
    try{ syncAllCardHighlights(); }catch(_){/* ignore */}
        scheduleFocusScrollById(sid);
        return;
      }
      // Active card tapped again: Kompakt → Detail (no scroll)
      if (state.detailOpenId !== sid){
        state.detailOpenId = sid;
         syncCardStates();
    try{ syncAllCardHighlights(); }catch(_){/* ignore */}
      }
      return;
    }
  }

  function toggleDetailById(id){
    const m = String(state.cardView || 'detail');
    if (m === 'detail') return;
    if (String(state.activeCardId || '') !== String(id)) return;
    // No explicit "toggle" in the final interaction model.
    // Depth is advanced by card taps only; details stay open once entered.
    return;
  }

  function syncCardStates(){
    if (!el.cards) return;
    const m = String(state.cardView || 'detail');
    const active = String(state.activeCardId || '');
    const detail = String(state.detailOpenId || '');
    for (const card of el.cards.querySelectorAll('.card')){
      const id = String(card.getAttribute('data-id') || '');
      const isActive = (active && id === active);
      card.toggleAttribute('data-active', isActive);
      // compact-open
      const compactOpen = (m === 'compact') || (m === 'detail') || (m === 'mini' && isActive);
      if (compactOpen) card.setAttribute('data-compact-open','1');
      else card.removeAttribute('data-compact-open');
      const detailOpen = (m === 'detail') || (detail && id === detail);
      if (detailOpen) card.setAttribute('data-detail-open','1');
      else card.removeAttribute('data-detail-open');
      // a11y: make header toggles focusable in mini/compact
      const head = card.querySelector('.head');
      if (head){
        if (m === 'detail'){ head.removeAttribute('role'); head.removeAttribute('tabindex'); }
        else { head.setAttribute('role','button'); head.setAttribute('tabindex','0'); }
      }
    }
  }

  function wireCardModeInteractions(){
    if (!el.cards || el.cards.__cardModeWired) return;
    el.cards.__cardModeWired = true;
    el.cards.addEventListener('click', (e) => {
      const m = String(state.cardView || 'detail');
      if (m === 'detail') return;
      const t = e.target;
      const card = t.closest?.('.card');
      if (!card) return;
      const id = card.getAttribute('data-id');
      if (!id) return;

      // Ignore clicks on interactive elements inside open details (summaries/links/etc.)
      // to preserve normal reading interactions.
      if (t.closest?.('summary, a, button, input, textarea, select')) return;
      if (t.closest?.('.detailsWrap')) return;

      // Whole card is the tap-zone in Mini/Kompakt.
      onCardTapById(id);
    });
    // Keyboard support: Enter/Space on header
    el.cards.addEventListener('keydown', (e) => {
      const m = String(state.cardView || 'detail');
      if (m === 'detail') return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const head = e.target?.closest?.('.head');
      if (!head) return;
      const card = head.closest?.('.card');
      const id = card?.getAttribute?.('data-id');
      if (!id) return;
      e.preventDefault();
      onCardTapById(id);
    });
  }

  const state = {
    rows: [],
    q: "",
    filters: {
      fav: false,
      // Genre Filter: Multi-Select (Set). Leer = kein Genre-Filter (alle Genres)
      genres: new Set(),
      platforms: new Set(),
      sources: new Set(),
      availability: new Set(),
      trophies: new Set(),
      trophyPreset: "",
      shortMain5: false,
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
    importedAt: 0,
    cardView: "detail",
    activeCardId: null,
    detailOpenId: null,
    ui: { lastCount: 0, lastFilterSig: "", highlights: false },
  };

  // Initialize card view mode (persisted)
  state.cardView = loadCardView();
  try{ document.documentElement.dataset.cardview = state.cardView; }catch(_){/* ignore */}

  // Perf polish: avoid redundant apply+render when the effective query/filter/sort state hasn't changed.
  // (Data changes reset this automatically because `state.rows` reference changes.)
  let __lastApplyKey = "";
  let __lastRowsRef = null;

  function esc(s){
    return String(s ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }

  function fmtImport(ts){
    if (!ts) return "Importiert: —";
    try{
      const d = new Date(ts);
      const date = d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
      const time = d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      return `Importiert: ${date}, ${time}`;
    }catch(_){
      return "Importiert: —";
    }
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

  // Search-normalization: aims to make "Point-and-Click" ≈ "point && click"
  // while staying deterministic (no fuzzy magic).
  function normSearch(s){
    return String(s ?? "")
      .toLowerCase()
      .normalize("NFKD")
      // unify various dash/hyphen characters + separators
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
      .replace(/[\-_/|]+/g, " ")
      // soften punctuation
      .replace(/[.,;:()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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

  // --- Search: field-specific query helpers ---
  // Supports:
  // - id:643 (contains)
  // - id=643 (exact)
  // - genre:"Action Adventure" (quoted, with spaces)
  // - -genre:sport (exclude)
  // Unknown prefixes fall back to free-text search.

  const FIELD_MAP = {
    id: "id",
    titel: "title",
    title: "title",
    t: "title",
    genre: "genre",
    g: "genre",
    subgenre: "sub",
    sg: "sub",
    entwickler: "dev",
    developer: "dev",
    dev: "dev",
    beschreibung: "desc",
    kurzbeschreibung: "desc",
    beschr: "desc",
    beschrieb: "desc",
    description: "desc",
    desc: "desc",
    eastereggs: "easter",
    easteregg: "easter",
    easter: "easter",
    eggs: "easter",
    quelle: "source",
    source: "source",
    verfügbarkeit: "avail",
    verfuegbarkeit: "avail",
    avail: "avail",
    plattform: "platform",
    platform: "platform",
    p: "platform",
  };


function parseStructuredQuery(raw){
  const s = String(raw ?? "");
  const terms = [];
  const freeTerms = [];
  const freeParts = [];

  const isKeyChar = (ch) => /[A-Za-zÄÖÜäöüß]/.test(ch);

  const isWs = (ch) => /\s/.test(ch);
  const skipWs = (i) => {
    while (i < s.length && isWs(s[i])) i++;
    return i;
  };

  function readQuoted(startIdx){
    // reads "..." with basic escape support (\")
    let i = startIdx + 1;
    let out = "";
    while (i < s.length){
      const ch = s[i];
      if (ch === "\\" && i + 1 < s.length){
        const nxt = s[i + 1];
        if (nxt === '"' || nxt === "\\"){
          out += nxt;
          i += 2;
          continue;
        }
      }
      if (ch === '"') return { value: out, next: i + 1, closed: true };
      out += ch;
      i++;
    }
    // no closing quote → treat as normal text (do not brick the query)
    return { value: out, next: s.length, closed: false };
  }

  function addFree(kind, value, neg){
    const v = String(value ?? "").trim();
    if (!v) return;
    freeTerms.push({ kind, value: v, neg: !!neg });
    if (!neg) freeParts.push(v);
  }

  let i = 0;
  while (i < s.length){
    i = skipWs(i);
    if (i >= s.length) break;

    // negation prefix (works for free terms and field terms)
    let neg = false;
    if (s[i] === '-'){
      neg = true;
      i++;
    }
    i = skipWs(i);
    if (i >= s.length) break;

    const tokenStart = i;

    // Try field syntax: key:val | key:=val | key=val
    let j = i;
    while (j < s.length && isKeyChar(s[j])) j++;
    const keyRaw = s.slice(i, j);
    if (keyRaw){
      let opType = null;
      let opLen = 0;
      if (s[j] === ':'){
        if (s[j + 1] === '='){ opType = 'exact'; opLen = 2; }
        else { opType = 'contains'; opLen = 1; }
      } else if (s[j] === '='){
        opType = 'eq';
        opLen = 1;
      }

      if (opType){
        const key = norm(keyRaw);
        const field = FIELD_MAP[key];
        if (field){
          let k = j + opLen;
          k = skipWs(k);

          let quoted = false;
          let qclosed = true;
          let val = "";

          if (k < s.length && s[k] === '"'){
            const q = readQuoted(k);
            val = q.value;
            quoted = true;
            qclosed = q.closed;
            k = q.next;
          } else {
            const vStart = k;
            while (k < s.length && !isWs(s[k])) k++;
            val = s.slice(vStart, k);
          }

          val = String(val ?? "").trim();
          if (val){
            let op = 'contains';
            if (opType === 'eq') op = 'eq';
            else if (opType === 'contains') op = 'contains';
            else if (opType === 'exact'){
              const nv = normSearch(val);
              op = (quoted || nv.includes(' ')) ? 'phrase' : 'word';
            }
            terms.push({ field, value: val, neg: !!neg, op });
            i = k;
            continue;
          }
        }
      }
    }

    // Free term syntax:
    //  - foo          → contains
    //  - =foo         → whole word
    //  - ="foo bar"   → exact phrase
    //  - "foo bar"    → group words (AND; legacy quotes)
    //  - -...         → negation
    i = tokenStart;

    if (s[i] === '='){
      // exact-ish free token
      i++;
      i = skipWs(i);
      if (i >= s.length) break;

      if (s[i] === '"'){
        const q = readQuoted(i);
        if (q.closed){
          addFree('phrase', q.value, neg);
        } else {
          // unclosed quotes: treat as normal text (split to tokens)
          for (const w of String(q.value).split(/\s+/).filter(Boolean)) addFree('contains', w, neg);
        }
        i = q.next;
        continue;
      }

      const vStart = i;
      while (i < s.length && !isWs(s[i])) i++;
      const v = s.slice(vStart, i);
      addFree('word', v, neg);
      continue;
    }

    if (s[i] === '"'){
      const q = readQuoted(i);
      if (q.closed){
        addFree('group', q.value, neg);
      } else {
        for (const w of String(q.value).split(/\s+/).filter(Boolean)) addFree('contains', w, neg);
      }
      i = q.next;
      continue;
    }

    // bare token
    const vStart = i;
    while (i < s.length && !isWs(s[i])) i++;
    const v = s.slice(vStart, i);
    addFree('contains', v, neg);
  }

  // freeParts keeps quoted phrases/groups intact for UI helpers.
  return {
    terms,
    free: freeParts.join(" ").trim(),
    freeParts,
    freeTerms,
  };
}


// --- Search OR (|) ---
// Minimal, deterministic OR support without parentheses:
// - Split by | outside of *closed* quotes
// - Each segment is evaluated like the existing search (implicit AND + negation)

function splitOrSegments(raw){
  const s = String(raw ?? "");
  const parts = [];
  let buf = "";

  function findClosingQuote(start){
    let i = start + 1;
    while (i < s.length){
      const ch = s[i];
      if (ch === "\\" && i + 1 < s.length){
        i += 2;
        continue;
      }
      if (ch === '"') return i;
      i++;
    }
    return -1;
  }

  for (let i=0; i<s.length; i++){
    const ch = s[i];
    if (ch === '"'){
      const j = findClosingQuote(i);
      if (j >= 0){
        buf += s.slice(i, j+1);
        i = j;
        continue;
      }
      // unclosed quote → treat as normal char
      buf += ch;
      continue;
    }
    if (ch === '|'){
      const part = buf.trim();
      if (part) parts.push(part);
      buf = "";
      continue;
    }
    buf += ch;
  }

  const tail = buf.trim();
  if (tail) parts.push(tail);
  return parts;
}

function parseQueryOr(raw){
  const q = String(raw ?? "");
  const parts = splitOrSegments(q);
  const segs = [];

  // Only pipes/spaces → treat as empty search (no filtering)
  if (!parts.length){
    const parsed = parseStructuredQuery("");
    const compiledFree = compileFreeTerms(parsed.freeTerms || []);
    const freeRaw = String(parsed.free ?? "");
    const idQuery = parseIdQuery(freeRaw || "");
    const hlTerms = getHighlightTermsFromParsed(parsed);
    segs.push({ raw: "", parsed, compiledFree, idQuery, hlTerms });
    return { hasOr: false, segments: segs };
  }

  const hasOr = parts.length > 1;

  if (!hasOr){
    const parsed = parseStructuredQuery(q);
    const compiledFree = compileFreeTerms(parsed.freeTerms || []);
    const freeRaw = String(parsed.free ?? "");
    const idQuery = parseIdQuery(freeRaw || q);
    const hlTerms = getHighlightTermsFromParsed(parsed);
    segs.push({ raw: q, parsed, compiledFree, idQuery, hlTerms });
    return { hasOr: false, segments: segs };
  }

  for (const part of parts){
    const parsed = parseStructuredQuery(part);
    const compiledFree = compileFreeTerms(parsed.freeTerms || []);
    const freeRaw = String(parsed.free ?? "");
    const idQuery = parseIdQuery(freeRaw || part);
    const hlTerms = getHighlightTermsFromParsed(parsed);
    segs.push({ raw: part, parsed, compiledFree, idQuery, hlTerms });
  }

  return { hasOr: true, segments: segs };
}

function buildWordBoundaryRe(word){
  const w = String(word ?? "").trim();
  if (!w) return null;
  const escW = escapeRegExp(w);
  return new RegExp(`(^|\\s)${escW}(\\s|$)`);
}

function compileFreeTerms(freeTerms){
  const out = [];
  for (const t of (freeTerms || [])){
    if (!t || !t.value) continue;
    let nv = normSearch(t.value);
    if (!nv) continue;

    // If a "word" normalizes into multiple tokens (e.g. point-and-click), treat as phrase.
    let kind = t.kind || 'contains';
    if (kind === 'word' && nv.includes(' ')) kind = 'phrase';

    if (kind === 'group'){
      const toks = nv.split(/\s+/).filter(Boolean);
      if (!toks.length) continue;
      out.push({ kind: 'group', toks, neg: !!t.neg });
    }
    else if (kind === 'word'){
      const re = buildWordBoundaryRe(nv);
      if (!re) continue;
      out.push({ kind: 'word', v: nv, re, neg: !!t.neg });
    }
    else if (kind === 'phrase'){
      out.push({ kind: 'phrase', v: nv, neg: !!t.neg });
    }
    else {
      out.push({ kind: 'contains', v: nv, neg: !!t.neg });
    }
  }
  return out;
}

function matchesCompiledFree(hay, t){
  const h = String(hay ?? "");
  if (!t) return false;
  if (t.kind === 'group'){
    for (const w of (t.toks || [])){
      if (!w) continue;
      if (!h.includes(w)) return false;
    }
    return true;
  }
  if (t.kind === 'word'){
    try{ return !!(t.re && t.re.test(h)); }catch(_){ return false; }
  }
  // phrase + contains are both substring matches on the normalized haystack
  return !!(t.v && h.includes(t.v));
}

function rowMatchesFreeTerms(row, compiledFree){
  if (!compiledFree || !compiledFree.length) return true;
  const hay = row.__hay || "";
  for (const t of compiledFree){
    const hit = matchesCompiledFree(hay, t);
    if (t.neg){ if (hit) return false; }
    else { if (!hit) return false; }
  }
  return true;
}

function rowMatchesTerm(r, term){
  const v = normSearch(term.value);
  if (!v) return true;
  const mode = term.op || "contains";

  function matchField(raw){
    const h = normSearch(raw);
    if (mode === "eq") return h === v;
    if (mode === "word"){
      const re = buildWordBoundaryRe(v);
      return re ? re.test(h) : true;
    }
    // phrase + contains
    return h.includes(v);
  }

  switch (term.field){
    case "id": {
      const rid = String(r[COL.id] ?? "").trim();
      const ridNum = String(Number(rid));
      const want = String(term.value ?? "").replace(/^#/, "").trim();
      if (!want) return true;
      if (mode === "eq" || mode === "word" || mode === "phrase"){
        const wn = String(Number(want));
        if (wn && wn !== "NaN") return ridNum === wn || rid === wn;
        return rid === want;
      }
      return rid.includes(want) || ridNum.includes(want);
    }
    case "title":  return matchField(r[COL.title]);
    case "genre":  return matchField(r[COL.genre]);
    case "sub":    return matchField(r[COL.sub]);
    case "dev":    return matchField(r[COL.dev]);
    case "desc":   return matchField(r[COL.desc]);
    case "easter": return matchField(r[COL.easter]);
    case "source": return matchField(r[COL.source]);
    case "avail":  return matchField(r[COL.avail]);
    case "platform": {
      const sys = splitPipe(r[COL.system]).map(normSearch);
      if (mode === "eq" || mode === "word" || mode === "phrase"){
        return sys.some(s => s === v);
      }
      return sys.some(s => s.includes(v));
    }
    default:
      return false;
  }
}


function rowMatchesSearchSegment(r, seg){
  const sq = seg?.parsed;

  // field terms
  if (sq && sq.terms && sq.terms.length){
    for (const term of sq.terms){
      const hit = rowMatchesTerm(r, term);
      if (term.neg){
        if (hit) return false;
      } else {
        if (!hit) return false;
      }
    }
  }

  // free terms
  const compiledFree = seg?.compiledFree || [];
  if (compiledFree.length){
    const idQuery = seg?.idQuery || null;
    if (idQuery){
      const rid = (r.__id != null) ? r.__id : String(r[COL.id] ?? "").trim();
      const rn = (r.__idNum != null) ? String(r.__idNum) : String(Number(rid));
      if (rn != idQuery && rid != idQuery) return false;
    }
    if (!rowMatchesFreeTerms(r, compiledFree)) return false;
  }

  return true;
}

function rowMatchesQueryOr(r, queryOr){
  const segs = queryOr?.segments || [];
  if (!segs.length) return { ok: true, segIdx: 0 };
  for (let i=0; i<segs.length; i++){
    if (rowMatchesSearchSegment(r, segs[i])) return { ok: true, segIdx: i };
  }
  return { ok: false, segIdx: -1 };
}

function splitPipe(s){
    return String(s ?? "").split("|").map(x => x.trim()).filter(Boolean);
  }

  // --- Sort helpers (Mobile + Desktop) ---
  const PLATFORM_PRIORITY = ["PS5","PS4","PS3","Vita"]; // höchste Priorität zuerst

  function normalizePlatformToken(t){
    const s = String(t ?? "").trim();
    if (!s) return "";
    const lc = s.toLowerCase();
    if (lc.includes("ps5")) return "PS5";
    if (lc.includes("ps4")) return "PS4";
    if (lc.includes("ps3")) return "PS3";
    if (lc.includes("vita")) return "Vita";
    return s;
  }

  function primaryPlatform(row){
    const sys = splitPipe(row?.[COL.system]).map(normalizePlatformToken).filter(Boolean);
    if (!sys.length) return "";
    for (const p of PLATFORM_PRIORITY){
      if (sys.includes(p)) return p;
    }
    return sys[0];
  }

  function platformRank(p){
    const idx = PLATFORM_PRIORITY.indexOf(p);
    return idx >= 0 ? idx : 999;
  }

  function developerSortKey(row){
    let s = String(row?.[COL.dev] ?? "").trim();
    if (!s) return "";
    // erster Entwickler vor typischen Trennern
    s = s.split(/[\/;\,\|]/)[0].trim();
    s = s.replace(/\s+/g, " ");
    // "The " nur fürs Sortieren ignorieren
    s = s.replace(/^the\s+/i, "");
    return s;
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
    // XLSX status is shown in the toolbar when there is enough space,
    // && always inside the Excel/Import details panel.
    const targets = [el.pillXlsxPanel].filter(Boolean);
    for (const t of targets){
      t.textContent = "XLSX: " + text;
      t.classList.remove("pill-ok","pill-warn","pill-bad");
      t.classList.add(kind);
    }
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
    // We use sheet_to_json with header row 1, && also keep range info to map row index -> cell address.
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

      // Precomputed fields for fast filtering/search (Build 7.1b)
      // Note: we only cache normalized values && derived aggregates; we do NOT change the user-visible data.
      const _id = String(row[COL.id] ?? '').trim();
      row.__id = _id;
      const _idNum = Number(_id);
      row.__idNum = Number.isFinite(_idNum) ? _idNum : null;

      // Platforms: keep a parsed array for OR-matching
      const _sysRaw = String(row[COL.system] ?? '').trim();
      row.__sysArr = splitPipe(_sysRaw);

      // Normalized genre for exact matching
      row.__genreN = norm(String(row[COL.genre] ?? '').trim() || 'Unbekannt');

      // Cached developer sort key (first developer; case-insensitive; ignore leading "The ")
      row.__devKey = developerSortKey(row) || '';

      // Cached trophy tags + aggregate (used in filters/sorts)
      row.__tTags = trophyTags(row);
      row.__tAgg = trophyAggregate(row);

      // Trophy tags (for distinct filter UI)
      for (const t of row.__tTags) state.distinct.trophies.add(t);

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

      // Cached full-text search haystack (free text search)
      // "Ohne Feldnamen" soll wirklich ALLE Suchfelder abdecken (wie im Info-Popup):
      // ID, Titel, Entwickler, Genre, Subgenre, Plattform, Quelle, Verfügbarkeit,
      // Beschreibung, Eastereggs.
      row.__hay = [
        row.__id,
        row[COL.title],
        row[COL.dev],
        row[COL.genre],
        row[COL.sub],
        row[COL.system],
        row[COL.source],
        row[COL.avail],
        row[COL.desc],
        row[COL.easter],
      ].map(normSearch).filter(Boolean).join(' ');
    }

    state.rows = rows;
    state.fileName = fileName || "—";
    state.importedAt = Date.now();
    if (el.pillFile) el.pillFile.textContent = state.fileName;
    if (el.pillImport) el.pillImport.textContent = fmtImport(state.importedAt);

    // After a successful import: default to Mini unless the user has an explicit saved preference.
    try{
      const persisted = String(localStorage.getItem(CARDVIEW_KEY) || '').trim();
      if (!persisted){
        state.cardView = CARDVIEW_DEFAULT_AFTER_IMPORT;
        state.activeCardId = null;
        state.detailOpenId = null;
        try{ document.documentElement.dataset.cardview = state.cardView; }catch(_){/* ignore */}
        try{ saveCardView(state.cardView); }catch(_){/* ignore */}
        try{ updateFabDepthUI(); }catch(_){/* ignore */}
      }
    }catch(_){/* ignore */}
    el.empty.style.display = "none";

    buildFilterUI();
    applyAndRender();
  }

  // --- Desktop dropdown helpers (Build 7.0v-D1c) ---
  // We deliberately avoid native <select> elements inside the dialog overlay on desktop,
  // because some browsers can lose focus / crash on scroll while a native select is open.
  let __openDesktopPanel = null;

  function __getSheetFloatLayer(){
    const sheet = el.dlg?.querySelector?.(".sheet");
    if (!sheet) return null;
    let floats = sheet.querySelector(".sheetFloats");
    if (!floats){
      floats = document.createElement("div");
      floats.className = "sheetFloats";
      sheet.appendChild(floats);
    }
    return floats;
  }

  function __portalPanel(panel){
    if (!panel || panel.__portal) return;
    const floats = __getSheetFloatLayer();
    if (!floats) return;
    panel.__portal = { parent: panel.parentNode, next: panel.nextSibling };
    floats.appendChild(panel);
    panel.classList.add("isPortal");
    // make sure clicks inside the panel don't bubble up && auto-close it
    panel.addEventListener("click", (e) => e.stopPropagation());
  }

  function __unportalPanel(panel){
    const p = panel?.__portal;
    if (!panel || !p) return;
    panel.classList.remove("isPortal");
    // restore original DOM position
    try{
      if (p.next && p.next.parentNode === p.parent) p.parent.insertBefore(panel, p.next);
      else p.parent.appendChild(panel);
    } catch {
      // ignore
    }
    panel.__portal = null;
    // clear inline positioning from portal mode
    panel.style.top = "";
    panel.style.bottom = "";
    panel.style.left = "";
    panel.style.right = "";
    panel.style.width = "";
    panel.style.maxHeight = "";
  }

  function __positionPanelInSheet(panel, btn){
    const sheet = el.dlg?.querySelector?.(".sheet");
    if (!sheet || !panel || !btn) return;
    const sr = sheet.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const pad = 12;

    // width constrained to the sheet
    const maxW = Math.max(240, sr.width - pad * 2);
    const width = Math.min(560, maxW);
    panel.style.width = `${width}px`;

    // horizontal placement
    let left = br.left - sr.left;
    left = Math.max(pad, Math.min(left, sr.width - width - pad));
    panel.style.left = `${left}px`;
    panel.style.right = "auto";

    // choose open direction based on available space
    const spaceBelow = sr.bottom - br.bottom - pad;
    const spaceAbove = br.top - sr.top - pad;
    const preferUp = spaceBelow < 220 && spaceAbove > spaceBelow;

    if (preferUp){
      panel.style.bottom = `${(sr.bottom - br.top) + 8}px`;
      panel.style.top = "auto";
      panel.style.maxHeight = `${Math.max(160, Math.min(420, spaceAbove))}px`;
    } else {
      panel.style.top = `${(br.bottom - sr.top) + 8}px`;
      panel.style.bottom = "auto";
      panel.style.maxHeight = `${Math.max(160, Math.min(420, spaceBelow))}px`;
    }
  }

  function __closeDesktopPanel(){
    if (__openDesktopPanel){
      __openDesktopPanel.hidden = true;
      // also sync aria-expanded on its trigger if present
      const btn = __openDesktopPanel.__portal?.hostBtn || __openDesktopPanel.closest?.(".dd")?.querySelector?.(".ddBtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
      __unportalPanel(__openDesktopPanel);
      __openDesktopPanel = null;
    }
  }

  function __toggleDesktopPanel(panel){
    if (!panel) return;
    if (__openDesktopPanel && __openDesktopPanel !== panel){
      __openDesktopPanel.hidden = true;
      const btn = __openDesktopPanel.__portal?.hostBtn || __openDesktopPanel.closest?.(".dd")?.querySelector?.(".ddBtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
      __unportalPanel(__openDesktopPanel);
    }
    const willOpen = panel.hidden;
    panel.hidden = !willOpen ? true : false;
    const host = panel.closest?.(".dd");
    const btn = host?.querySelector?.(".ddBtn");
    if (btn) btn.setAttribute("aria-expanded", panel.hidden ? "false" : "true");

    if (!panel.hidden && isSheetDesktop()){
      __portalPanel(panel);
      __positionPanelInSheet(panel, btn || host);
      __wireDropdownKeynav(panel);
    }
    // Focus the current item when opening (keyboard accessibility)
    if (!panel.hidden){
      try{
        const cur = panel.querySelector('.ddItem.is-active') || panel.querySelector('.ddItem');
        cur?.focus?.({preventScroll:true});
      }catch(_){/* ignore */}
    }
    __openDesktopPanel = panel.hidden ? null : panel;
  }

  // Keyboard navigation for custom dropdown panels
  function __wireDropdownKeynav(panel){
    if (!panel || panel.__keynav) return;
    panel.__keynav = true;
    panel.addEventListener('keydown', (e) => {
      const items = Array.from(panel.querySelectorAll('.ddItem'));
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement);
      const focusAt = (i) => {
        const it = items[Math.max(0, Math.min(items.length - 1, i))];
        try{ it?.focus?.({preventScroll:true}); }catch(_){/* ignore */}
      };

      switch(e.key){
        case 'ArrowDown':
          e.preventDefault();
          focusAt((idx < 0 ? 0 : idx + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusAt((idx < 0 ? 0 : idx - 1));
          break;
        case 'Home':
          e.preventDefault();
          focusAt(0);
          break;
        case 'End':
          e.preventDefault();
          focusAt(items.length - 1);
          break;
        case 'Escape':
          e.preventDefault();
          __closeDesktopPanel();
          break;
        case 'Enter':
        case ' ':
          if (document.activeElement && document.activeElement.classList?.contains('ddItem')){
            e.preventDefault();
            document.activeElement.click();
          }
          break;
      }
    });
  }

  // Close dropdowns when clicking elsewhere.
  // On mobile/tablet we also use custom dropdowns for "Sortieren" to avoid native picker limitations.
  document.addEventListener("click", (e) => {
    if (e.target?.closest?.(".dd")) return;
    if (e.target?.closest?.(".ddPanel")) return;
    __closeDesktopPanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") __closeDesktopPanel();
  });

  // Close any open dropdown when the sheet body scrolls (Desktop/Tablet).
  // Prevents clipped panels / awkward positioning on touch-capable desktops.
  if (isSheetDesktop()){
    const sb = el.dlg?.querySelector?.(".sheetBody");
    if (sb && !sb.__ddCloseOnScroll){
      sb.addEventListener("scroll", __closeDesktopPanel, {passive:true});
      sb.__ddCloseOnScroll = true;
    }
    // Safe global: close open panels on resize.
    if (!window.__ddCloseOnResize){
      window.addEventListener("resize", __closeDesktopPanel, {passive:true});
      window.__ddCloseOnResize = true;
    }
  }


  function buildFilterUI(){
    // --- Sortieren (kompakt) ---
    if (el.sortFieldRow){
      if (isSheetDesktop()){
        // Desktop: custom dropdown (compact) instead of a large chip cloud.
        const enabled = SORT_FIELDS.filter(sf => !sf.disabled);
        const cur = enabled.find(sf => sf.k === state.sortField) || enabled.find(sf => sf.k === "ID") || enabled[0];

        // Render with subtle divider lines between logical groups (no headings).
        const items = [];
        let lastGroup = null;
        for (const sf of enabled){
          const g = sf.group || "";
          if (lastGroup !== null && g !== lastGroup){
            items.push(`<div class="ddDivider" role="separator" aria-hidden="true"></div>`);
          }
          lastGroup = g;
          items.push(`
            <button type="button" class="ddItem ${state.sortField===sf.k ? "is-active" : ""}" data-value="${esc(sf.k)}">
              <span class="ddMark">✓</span>
              <span class="ddText">${esc(sf.label)}</span>
            </button>
          `);
        }

        el.sortFieldRow.innerHTML = `
          <div class="dd" id="sortFieldDD">
            <button type="button" class="ddBtn" id="sortFieldBtn" aria-haspopup="listbox" aria-expanded="false" title="Sortieren nach">
              <span class="ddBtnLabel">Sortieren nach: ${esc(cur?.label ?? "ID")}</span>
              <span class="ddCaret">▾</span>
            </button>
            <div class="ddPanel" id="sortFieldPanel" role="listbox" hidden>
              ${items.join("")}
            </div>
          </div>
        `;

        const dd = el.sortFieldRow.querySelector("#sortFieldDD");
        const btn = el.sortFieldRow.querySelector("#sortFieldBtn");
        const panel = el.sortFieldRow.querySelector("#sortFieldPanel");

        if (dd) dd.addEventListener("click", (e) => e.stopPropagation());

        if (btn && panel){
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            __toggleDesktopPanel(panel);
          });

          for (const it of panel.querySelectorAll(".ddItem")){
            it.addEventListener("click", (e) => {
              e.stopPropagation();
              const key = it.getAttribute("data-value") || "ID";
              state.sortField = key;
              saveSortPrefs();

              // Update visuals
              const label = enabled.find(sf => sf.k === key)?.label || key;
              const labEl = btn.querySelector(".ddBtnLabel");
              if (labEl) labEl.textContent = "Sortieren nach: " + label;
              for (const b of panel.querySelectorAll(".ddItem")){
                b.classList.toggle("is-active", (b.getAttribute("data-value") === key));
              }

              updateFabSortFieldUI();
              updateDialogMeta();
              scheduleLiveApply();
              __closeDesktopPanel();
            });
          }
        }
      } else {
        // Mobile/Tablet: custom dropdown so we can show real divider lines (native pickers
        // render optgroups as headings && separators as selectable rows with radio circles).
        const enabled = SORT_FIELDS.filter(sf => !sf.disabled);
        const cur = enabled.find(sf => sf.k === state.sortField) || enabled.find(sf => sf.k === "ID") || enabled[0];

        const items = [];
        let lastGroup = null;
        for (const sf of enabled){
          const g = sf.group || "";
          if (lastGroup !== null && g !== lastGroup){
            items.push(`<div class="ddDivider" role="separator" aria-hidden="true"></div>`);
          }
          lastGroup = g;
          items.push(`
            <button type="button" class="ddItem ${state.sortField===sf.k ? "is-active" : ""}" data-value="${esc(sf.k)}">
              <span class="ddMark">✓</span>
              <span class="ddText">${esc(sf.label)}</span>
            </button>
          `);
        }

        el.sortFieldRow.innerHTML = `
          <div class="dd" id="sortFieldDD">
            <button type="button" class="ddBtn" id="sortFieldBtn" aria-haspopup="listbox" aria-expanded="false" title="Sortieren nach">
              <span class="ddBtnLabel">${esc(cur?.label ?? "ID")}</span>
              <span class="ddCaret">▾</span>
            </button>
            <div class="ddPanel" id="sortFieldPanel" role="listbox" hidden>
              ${items.join("")}
            </div>
          </div>
        `;

        const dd = el.sortFieldRow.querySelector("#sortFieldDD");
        const btn = el.sortFieldRow.querySelector("#sortFieldBtn");
        const panel = el.sortFieldRow.querySelector("#sortFieldPanel");
        if (dd) dd.addEventListener("click", (e) => e.stopPropagation());
        if (btn && panel){
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            __toggleDesktopPanel(panel);
          });
          for (const it of panel.querySelectorAll(".ddItem")){
            it.addEventListener("click", (e) => {
              e.stopPropagation();
              const key = it.getAttribute("data-value") || "ID";
              state.sortField = key;
              saveSortPrefs();

              const label = enabled.find(sf => sf.k === key)?.label || key;
              const labEl = btn.querySelector(".ddBtnLabel");
              if (labEl) labEl.textContent = label;
              for (const b of panel.querySelectorAll(".ddItem")){
                b.classList.toggle("is-active", (b.getAttribute("data-value") === key));
              }

              updateFabSortFieldUI();
              updateDialogMeta();
              scheduleLiveApply();
              __closeDesktopPanel();
            });
          }
        }
      }
    }
    if (el.sortDirRow){
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
          updateDialogMeta();
          scheduleLiveApply();
        };
      }
    }

    // --- Schnellfilter (80%-Fälle) ---
    // Icon-only, damit es nicht nach "Menü in einer Menü" aussieht.
    if (el.quickRow){
      const highlights = [];
      const progress = [];
      const row2 = [];

      // ⭐ Favoriten
      highlights.push(chipHtml("fav", "fav", "⭐️", state.filters.fav, "primary", { title: "Nur Favoriten", iconOnly: true }));

      // Trophäen-Quickfilter in fester Reihenfolge: ⏳ 💤 ✅ 💎
      const quickTrophies = [
        { key: "In Arbeit", icon: "⏳️", title: "In Arbeit" },
        { key: "Ungespielt", icon: "💤", title: "Ungespielt" },
        { key: "100%", icon: "✅️", title: "100%" },
        { key: "Platin", icon: "💎", title: "Platin" },
      ];
      for (const qt of quickTrophies){
        if (state.distinct.trophies.has(qt.key))
        {
          const target = (qt.key === "Platin" || qt.key === "100%") ? highlights : progress;
          target.push(chipHtml("trophy", qt.key, qt.icon, state.filters.trophies.has(qt.key), "primary", { title: qt.title, iconOnly: true }));
        }
      }

      // Ziel-/Zeit-Schnellfilter (zweite Zeile)
      row2.push(chipHtml("trophyPreset", "open3", "🎯", state.filters.trophyPreset === "open3", "primary", { title: "≤ 3 Trophäen fehlen", iconOnly: true }));
      // 🔥 = "nahe dran" (≥ 90 %), soll sich klar von ✅/💎 unterscheiden.
      row2.push(chipHtml("trophyPreset", "pct90", "🔥", state.filters.trophyPreset === "pct90", "primary", { title: "Fortschritt ≥ 90 %", iconOnly: true }));
      row2.push(chipHtml("shortMain", "le5", "⏱️", state.filters.shortMain5, "primary", { title: "Spielzeit ≤ 5 Std. (Main)", iconOnly: true }));

      el.quickRow.innerHTML = `
        <div class="quickGroups">
          <div class="quickGroup highlights">${highlights.join("")}</div>
          ${progress.length ? `<div class="quickGroup progress">${progress.join("")}</div>` : ``}
        </div>
        <div class="chipRow quickLine">${row2.join("")}</div>
      `;
    }

    // --- Genre (Multi-Select als Custom-Dropdown, überall gleich) ---
    // Grund: Native <select>-Picker (Android/Chrome) blenden eine "Zurück/Weiter"-Leiste ein
    // und verhalten sich anders als unsere Sortier-Auswahl. Wir entkoppeln das komplett.
    if (el.genreRowDesktop){
      const genres = Array.from(state.distinct.genres)
        .filter(Boolean)
        .sort((a,b) => a.localeCompare(b, "de", { sensitivity: "base" }));

      // Label: "0 ausgewählt" (wie bisher) oder "<Erstes> +N".
      const label = (() => {
        const n = state.filters.genres?.size || 0;
        if (n === 0) return "0 ausgewählt";
        const arr = Array.from(state.filters.genres).sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}));
        return `${arr[0]}${n>1 ? ` +${n-1}` : ""}`;
      })();

      el.genreRowDesktop.innerHTML = `
        <div class="dd" id="genreDD">
          <button type="button" class="ddBtn" id="genreBtn" aria-haspopup="listbox" aria-expanded="false" title="Genre wählen">
            <span class="ddBtnLabel">${esc(label)}</span>
            <span class="ddCaret">▾</span>
          </button>
          <div class="ddPanel" id="genrePanel" role="listbox" hidden>
            <button type="button" class="ddItem ${state.filters.genres.size===0 ? "is-active" : ""}" data-value="">
              <span class="ddMark">✓</span>
              <span class="ddText">Alle</span>
            </button>
            <div class="ddDivider"></div>
            <div class="ddList">
              ${genres.map(g => `
                <button type="button" class="ddItem ${state.filters.genres.has(g) ? "is-active" : ""}" data-value="${esc(g)}">
                  <span class="ddMark">✓</span>
                  <span class="ddText">${esc(g)}</span>
                </button>
              `).join("")}
            </div>
            <div class="ddFooter">
              <button type="button" class="ddDone">Fertig</button>
            </div>
          </div>
        </div>
      `;

      const dd = el.genreRowDesktop.querySelector("#genreDD");
      const btn = el.genreRowDesktop.querySelector("#genreBtn");
      const panel = el.genreRowDesktop.querySelector("#genrePanel");
      const done = el.genreRowDesktop.querySelector(".ddDone");
      if (dd) dd.addEventListener("click", (e) => e.stopPropagation());

      const refresh = () => {
        const labEl = btn?.querySelector?.(".ddBtnLabel");
        const n = state.filters.genres?.size || 0;
        let nextLabel = "0 ausgewählt";
        if (n > 0){
          const arr = Array.from(state.filters.genres).sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}));
          nextLabel = `${arr[0]}${n>1 ? ` +${n-1}` : ""}`;
        }
        if (labEl) labEl.textContent = nextLabel;
        for (const it of panel?.querySelectorAll?.(".ddItem") || []){
          const v = it.getAttribute("data-value") || "";
          const active = v ? state.filters.genres.has(v) : (state.filters.genres.size === 0);
          it.classList.toggle("is-active", active);
        }
      };

      if (btn && panel){
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          __toggleDesktopPanel(panel);
        });
        for (const it of panel.querySelectorAll(".ddItem")){
          it.addEventListener("click", (e) => {
            e.stopPropagation();
            const v = it.getAttribute("data-value") || "";
            if (!v){
              state.filters.genres.clear();
            } else {
              if (state.filters.genres.has(v)) state.filters.genres.delete(v);
              else state.filters.genres.add(v);
            }
            syncGenreSelectFromState();
            refresh();
            updateDialogMeta();
            scheduleLiveApply();
          });
        }
      }
      if (done){
        done.addEventListener("click", (e) => {
          e.stopPropagation();
          __closeDesktopPanel();
        });
      }
    }

    // --- Weitere Filter (Akkordeons) ---
    // Plattform
    if (el.platRow){
      const plats = Array.from(state.distinct.platforms);
      const order = ["PS3","PS4","PS5","Vita"];
      plats.sort((a,b) => (order.indexOf(a) - order.indexOf(b)));
      el.platRow.innerHTML = plats.map(p => chipHtml("plat", p, p, state.filters.platforms.has(p), "category")).join("");
    }
    // Quelle
    if (el.srcRow){
      const srcs = Array.from(state.distinct.sources).sort((a,b)=>a.localeCompare(b,"de"));
      el.srcRow.innerHTML = srcs.map(s => chipHtml("src", s, stripTagEmoji(s), state.filters.sources.has(s), "category")).join("");
    }
    // Verfügbarkeit
    if (el.availRow){
      const avs = Array.from(state.distinct.availability).sort((a,b)=>a.localeCompare(b,"de"));
      el.availRow.innerHTML = avs.map(a => chipHtml("avail", a, a, state.filters.availability.has(a), "category")).join("");
    }
    // Trophäen (Status + Fortschritt)
    if (el.trophyAllRow){
      const trophyOrder = ["Platin","100%","In Arbeit","Ungespielt","Kein Platin","Box-Teil","Unbekannt"];
      const tros = Array.from(state.distinct.trophies);
      tros.sort((a,b) => (trophyOrder.indexOf(a) - trophyOrder.indexOf(b)));
      // Inaktive Status-Chips sollen nicht "dunkler" wirken als andere Kategorien.
      el.trophyAllRow.innerHTML = tros.map(t => {
        return chipHtml("trophy", t, t, state.filters.trophies.has(t), "category");
      }).join("");
    }
    if (el.trophyPresetRow){
      const presets = [
        {k:"open3", label:"≤ 3 fehlen"},
        {k:"open5", label:"≤ 5 fehlen"},
        {k:"pct90", label:"≥ 90 %"},
        {k:"pct75", label:"≥ 75 %"},
      ];
      el.trophyPresetRow.innerHTML = presets.map(p => chipHtml("trophyPreset", p.k, p.label, state.filters.trophyPreset === p.k, "rule", { title: trophyPresetLabelLong(p.k) })).join("");
    }

    // Wire chip clicks
    for (const btn of el.dlg.querySelectorAll(".chip")){
      btn.addEventListener("click", () => onChip(btn));
    }

    // Active filter bar + summaries + apply count
    updateDialogMeta(true);
  }

  function chipHtml(group, key, label, pressed, variant=false, opts=null){
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
    else if (variant === "rule") cls += " rule";
    const o = opts && typeof opts === "object" ? opts : {};
    if (o.iconOnly) cls += " iconOnly";
    const title = (o.title != null) ? String(o.title) : "";
    const titleAttr = title ? ` title="${esc(title)}" aria-label="${esc(title)}"` : "";
    return `<button type="button" class="${cls}" data-group="${esc(group)}" data-key="${esc(key)}" aria-pressed="${p}"${titleAttr}>${esc(label)}</button>`;
  }

  function stripTagEmoji(label){
    // Only for the filter dialog: keep data/value intact, but remove the visual marker.
    return String(label ?? "").replace(/^\s*🏷\s*/u, "").trim();
  }

  function cssEscape(s){
    const v = String(s ?? "");
    try{ return (window.CSS && typeof CSS.escape === "function") ? CSS.escape(v) : v; }
    catch{ return v; }
  }

  function syncGenreSelectFromState(){
    // Mobile select
    if (el.genreSelect){
      const sel = el.genreSelect;
      const has = (state.filters.genres && state.filters.genres.size);
      for (const opt of sel.options){
        const v = String(opt.value ?? "");
        if (!v){
          opt.selected = !has;
        } else {
          opt.selected = !!has && state.filters.genres.has(v);
        }
      }
    }

    // Desktop chips (genrePick)
    if (el.dlg){
      const hasAny = state.filters.genres && state.filters.genres.size > 0;
      for (const b of el.dlg.querySelectorAll('.chip[data-group="genrePick"]')){
        const k = String(b.getAttribute("data-key") ?? "");
        const pressed = (!k) ? !hasAny : (state.filters.genres.has(k));
        b.setAttribute("aria-pressed", pressed ? "true" : "false");
      }
    }

    // Custom dropdown (Genre) – needs manual refresh when filters are changed
    // via the active filter bar or other UI elements.
    if (el.genreRowDesktop){
      const btn = el.genreRowDesktop.querySelector("#genreBtn");
      // Panel can be portaled into the sheet float layer.
      const panel = el.dlg?.querySelector?.("#genrePanel");
      if (btn && panel){
        const labEl = btn.querySelector(".ddBtnLabel");
        // Compact label: "0 ausgewählt" oder "<Erstes> +N".
        let nextLabel = "0 ausgewählt";
        const n = state.filters.genres?.size || 0;
        if (n > 0){
          const arr = Array.from(state.filters.genres).sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}));
          nextLabel = `${arr[0]}${n>1 ? ` +${n-1}` : ""}`;
        }
        if (labEl) labEl.textContent = nextLabel;

        for (const it of panel.querySelectorAll(".ddItem")){
          const v = it.getAttribute("data-value") || "";
          const active = v ? state.filters.genres.has(v) : (state.filters.genres.size === 0);
          it.classList.toggle("is-active", active);
        }
      }
    }
  }


  function setAllChipPressed(group, key, pressed){
    if (!el.dlg) return;
    const g = cssEscape(group);
    const k = cssEscape(key);
    const nodes = el.dlg.querySelectorAll(`.chip[data-group="${g}"][data-key="${k}"]`);
    for (const n of nodes){
      n.setAttribute("aria-pressed", pressed ? "true" : "false");
    }
  }

  
  function trophyPresetLabelLong(k){
    if (!k) return "";
    if (k === "open3") return "≤ 3 Trophäen fehlen";
    if (k === "open5") return "≤ 5 Trophäen fehlen";
    if (k === "pct90") return "Fortschritt ≥ 90 %";
    if (k === "pct75") return "Fortschritt ≥ 75 %";
    return String(k);
  }
  function trophyPresetLabelShort(k){
    if (!k) return "";
    if (k === "open3") return "≤3";
    if (k === "open5") return "≤5";
    if (k === "pct90") return "≥90%";
    if (k === "pct75") return "≥75%";
    return String(k);
  }
  function trophyPresetIcon(k){
    if (!k) return "";
    if (k === "open3" || k === "open5") return "🎯";
    if (k === "pct90") return "🔥";
    if (k === "pct75") return "🔢";
    return "";
  }
function summarizeMulti(set, maxItems=2, mapFn=null){
    if (!set || !set.size) return "Alle";
    let arr = Array.from(set);
    if (typeof mapFn === "function") arr = arr.map(mapFn);
    if (arr.length <= maxItems) return arr.join(", ");
    return `${arr.length} gewählt`;
  }

  function updateAccordionSummaries(){
    if (el.platSummary) el.platSummary.textContent = summarizeMulti(state.filters.platforms);
    if (el.srcSummary)  el.srcSummary.textContent  = summarizeMulti(state.filters.sources, 2, stripTagEmoji);
    if (el.availSummary) el.availSummary.textContent = summarizeMulti(state.filters.availability);

    if (el.trophySummary){
      const base = summarizeMulti(state.filters.trophies);
      const p = trophyPresetLabelShort(state.filters.trophyPreset);
      el.trophySummary.textContent = p ? (base === "Alle" ? p : `${base} · ${p}`) : base;
    }
  }

  function renderActiveFilterBar(){
    if (!el.activeFilters) return;
    const items = [];

    const q = String(state.q ?? "").trim();
    if (q){
      const short = q.length > 28 ? (q.slice(0,27) + "…") : q;
      items.push({group:"search", key:"q", label:`🔎 Suche: ${short}`});
    }
    if (state.filters.fav){
      items.push({group:"fav", key:"fav", label:"⭐ Favoriten"});
    }
    if (state.filters.genres && state.filters.genres.size){
      const gs = Array.from(state.filters.genres).sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}));
      for (const g of gs){
        items.push({group:"genre", key: g, label:`Genre: ${g}`});
      }
    }
    for (const p of state.filters.platforms){
      items.push({group:"plat", key:p, label:p});
    }
    for (const s of state.filters.sources){
      items.push({group:"src", key:s, label: stripTagEmoji(s)});
    }
    for (const a of state.filters.availability){
      items.push({group:"avail", key:a, label:a});
    }
    for (const t of state.filters.trophies){
      items.push({group:"trophy", key:t, label:t});
    }
    if (state.filters.trophyPreset){
      items.push({group:"trophyPreset", key: state.filters.trophyPreset, label: `${trophyPresetIcon(state.filters.trophyPreset)} ${trophyPresetLabelLong(state.filters.trophyPreset)}`});
    }
    if (state.filters.shortMain5){
      items.push({group:"shortMain", key: "le5", label: "⏱ ≤ 5h (Main)"});
    }

    if (!items.length){
      el.activeFilters.innerHTML = `<span class="afEmpty">Keine Filter aktiv</span>`;
      return;
    }

    el.activeFilters.innerHTML = items.map(it => {
      return `<button type="button" class="afChip" data-group="${esc(it.group)}" data-key="${esc(it.key)}">${esc(it.label)} <span class="afX">×</span></button>`;
    }).join("");

    for (const b of el.activeFilters.querySelectorAll(".afChip")){
      b.addEventListener("click", () => {
        const group = b.getAttribute("data-group");
        const key = b.getAttribute("data-key");
        if (group === "search") {
          setSearchQuery("", "chips");
        }

        else if (group === "fav") state.filters.fav = false;
        else if (group === "genre") { state.filters.genres.delete(key); syncGenreSelectFromState(); }
        else if (group === "plat") state.filters.platforms.delete(key);
        else if (group === "src") state.filters.sources.delete(key);
        else if (group === "avail") state.filters.availability.delete(key);
        else if (group === "trophy") state.filters.trophies.delete(key);
        else if (group === "trophyPreset") state.filters.trophyPreset = "";
        else if (group === "shortMain") state.filters.shortMain5 = false;

        // Sync UI elements without nuking the whole dialog
        // Genre: sync Select-State (Multi-Select).
        setAllChipPressed(group, key, false);
        // Also sync quick/duplicate chips
        if (group === "trophy") setAllChipPressed("trophy", key, false);
        if (group === "trophyPreset"){
          for (const k of ["open3","open5","pct90","pct75"]) setAllChipPressed("trophyPreset", k, false);
        }
        if (group === "shortMain") setAllChipPressed("shortMain", "le5", false);
        if (group === "fav") setAllChipPressed("fav", "fav", false);

        updateDialogMeta();
        try{ scheduleLiveApply(); }catch(_){/* ignore */}
      });
    }
  }

  let _applyCountTimer = null;
  function scheduleApplyCount(){
    if (_applyCountTimer) clearTimeout(_applyCountTimer);
    _applyCountTimer = setTimeout(updateApplyCount, 80);
  }

  function computeFilteredCount(){
    if (!state.rows || !state.rows.length) return 0;

    const qRaw = String(state.q ?? "");
    const qTrim = qRaw.trim();
    const queryOr = parseQueryOr(qRaw);

    const favOnly = state.filters.fav;
    const platF = state.filters.platforms;
    const srcF = state.filters.sources;
    const avF = state.filters.availability;
    const troF = state.filters.trophies;
    const trophyPreset = state.filters.trophyPreset || "";
    const shortMain5 = !!state.filters.shortMain5;

    const wantGenresN = (state.filters.genres && state.filters.genres.size)
      ? new Set(Array.from(state.filters.genres).map(norm))
      : null;

    let n = 0;
    for (const r of state.rows){
      // search (supports OR via |)
      if (qTrim){
        const m = rowMatchesQueryOr(r, queryOr);
        if (!m.ok) continue;
      }

// fav
      if (favOnly){
        const f = String(r[COL.fav] ?? "").trim().toLowerCase();
        if (f != "x" && f != "1" && f != "true") continue;
      }

      // genre (exact match)
      if (wantGenresN){
        const got = r.__genreN || norm(r[COL.genre]);
        if (!wantGenresN.has(got)) continue;
      }

      // platform (OR match)
      if (platF.size){
        const sys = r.__sysArr || splitPipe(r[COL.system]);
        let ok = false;
        for (const p of platF){ if (sys.includes(p)) { ok = true; break; } }
        if (!ok) continue;
      }

      // source
      if (srcF.size){
        const src = String(r[COL.source] ?? "").trim();
        if (!srcF.has(src)) continue;
      }

      // availability
      if (avF.size){
        const av = String(r[COL.avail] ?? "").trim();
        if (!avF.has(av)) continue;
      }

      // trophies OR
      if (troF.size){
        const tags = r.__tTags || trophyTags(r);
        let ok = false;
        for (const t of troF){ if (tags.has(t)) { ok = true; break; } }
        if (!ok) continue;
      }

      // trophy presets
      if (trophyPreset){
        const agg = r.__tAgg || trophyAggregate(r);
        if (!agg) continue;
        if (trophyPreset === "open3"){ if (!(agg.open != null && agg.open > 0 && agg.open <= 3)) continue; }
        else if (trophyPreset === "open5"){ if (!(agg.open != null && agg.open > 0 && agg.open <= 5)) continue; }
        else if (trophyPreset === "pct90"){ if (!(agg.pct != null && agg.open != null && agg.open > 0 && agg.pct >= 90)) continue; }
        else if (trophyPreset === "pct75"){ if (!(agg.pct != null && agg.open != null && agg.open > 0 && agg.pct >= 75)) continue; }
      }

      // short main
      if (shortMain5){
        const h = parseHours(r[COL.main]);
        if (h == null || h > 5) continue;
      }

      n++;
    }
    return n;
  }

  function updateApplyCount(){
    if (!el.btnApply) return;
    if (!state.rows || !state.rows.length){
      el.btnApply.textContent = "Fertig";
      return;
    }
    const n = computeFilteredCount();
    el.btnApply.textContent = `Fertig (${n})`;
  }

  function updateDialogMeta(forceNow=false){
    updateAccordionSummaries();
    renderActiveFilterBar();
    if (forceNow) updateApplyCount();
    else scheduleApplyCount();

    // Keep the Schnellmenü-FAB in sync: subtle indicator when any filter is active.
    updateQuickFilterIndicator();
  }

  function hasActiveFilters(){
    const q = String(state.q ?? "").trim();
    if (q) return true;
    const f = state.filters;
    if (f.fav) return true;
    if (f.shortMain5) return true;
    if (f.trophyPreset) return true;
    if (f.genres && f.genres.size) return true;
    if (f.platforms && f.platforms.size) return true;
    if (f.sources && f.sources.size) return true;
    if (f.availability && f.availability.size) return true;
    if (f.trophies && f.trophies.size) return true;
    return false;
  }

  function clearAllFiltersOnly(){
    // Clear filters && search without touching the current sort (Schnellmenü-Reset).
    setSearchQuery("", "fabReset");
const f = state.filters;
    f.fav = false;
    try{ f.genres && f.genres.clear && f.genres.clear(); }catch(_){/* ignore */}
    try{ f.platforms && f.platforms.clear && f.platforms.clear(); }catch(_){/* ignore */}
    try{ f.sources && f.sources.clear && f.sources.clear(); }catch(_){/* ignore */}
    try{ f.availability && f.availability.clear && f.availability.clear(); }catch(_){/* ignore */}
    try{ f.trophies && f.trophies.clear && f.trophies.clear(); }catch(_){/* ignore */}
    f.trophyPreset = "";
    f.shortMain5 = false;
  }

  function updateQuickFilterIndicator(){
    if (!el.fabQuick) return;
    const on = hasActiveFilters();
    el.fabQuick.classList.toggle("fabHasFilters", on);
    el.fabQuick.setAttribute("aria-label", on ? "Schnellmenü öffnen (Filter aktiv)" : "Schnellmenü öffnen");
    // Keep Schnellmenü-Info in sync (Info erscheint nur im geöffneten Schnellmenü)
    updateQuickMenuInfo();
  }

  function countActiveFiltersDetailed(){
    // Count like the "Aktive Filter"-Bar: each active chip counts as one filter.
    const q = String(state.q ?? "").trim();
    const f = state.filters;
    let n = 0;
    if (q) n++;
    if (f.fav) n++;
    if (f.genres && f.genres.size) n += f.genres.size;
    if (f.platforms && f.platforms.size) n += f.platforms.size;
    if (f.sources && f.sources.size) n += f.sources.size;
    if (f.availability && f.availability.size) n += f.availability.size;
    if (f.trophies && f.trophies.size) n += f.trophies.size;
    if (f.trophyPreset) n++;
    if (f.shortMain5) n++;
    return n;
  }

  function isPhone(){
    try{ return document.documentElement.classList.contains("isPhone"); }
    catch(_){ return false; }
  }

  function updateQuickMenuInfo(){
    if (!el.fabQuickInfo || !el.fabQuickPanel) return;
    const active = countActiveFiltersDetailed();
    const panelOpen = !el.fabQuickPanel.hidden;

    // Info is only visible inside the open Schnellmenü.
    // Normal case: only when filters are active. After Reset we keep the box briefly (without showing "0 Filter").
    if (!panelOpen){
      el.fabQuickInfo.hidden = true;
      el.fabQuickPanel.classList.remove("hasQuickInfo");
      return;
    }
    if (active <= 0){
      const hold = (_quickResetHoldUntil && Date.now() < _quickResetHoldUntil);
      if (!hold){
        el.fabQuickInfo.hidden = true;
        el.fabQuickPanel.classList.remove("hasQuickInfo");
        return;
      }
      try{ if (el.fabQuickReset) el.fabQuickReset.hidden = true; }catch(_){/* ignore */}
      try{ if (el.fabQuickReset) el.fabQuickReset.hidden = false; }catch(_){/* ignore */}
    const shown = Number(state.ui?.lastCount ?? 0);
      if (el.fabQuickInfoA) el.fabQuickInfoA.textContent = `${shown} Titel angezeigt`;
      if (el.fabQuickInfoB) el.fabQuickInfoB.textContent = "";
      el.fabQuickInfo.hidden = false;
      el.fabQuickPanel.classList.add("hasQuickInfo");
      return;
    }

    const shown = Number(state.ui?.lastCount ?? 0);
    const plural = (active === 1) ? "Filter aktiv" : "Filter aktiv";
    if (isPhone()){
      // Phone (Portrait + Landscape): einzeilige Info spart Höhe und hält das Menü stabil.
      if (el.fabQuickInfoA) el.fabQuickInfoA.textContent = `${shown} Titel angezeigt · Filter aktiv: ${active}`;
      if (el.fabQuickInfoB) el.fabQuickInfoB.textContent = "";
    }else{
      if (el.fabQuickInfoA) el.fabQuickInfoA.textContent = `${shown} Titel angezeigt`;
      if (el.fabQuickInfoB) el.fabQuickInfoB.textContent = `Filter aktiv: ${active}`;
    }
    el.fabQuickInfo.hidden = false;
    // Reserve the grid row only when the info is visible.
    el.fabQuickPanel.classList.add("hasQuickInfo");
  }

  // --- Schnellmenü-FAB: kurze Aufmerksamkeits-Pulse-Sequenz (nur Ring) ---
  let _fabPulseTimer = 0;

  // Also pulse when the filter state changes while the user is already in the
  // cards view (e.g. typing into the search box). We track a signature and
  // throttle to avoid pulsing on every keystroke.
  let _fabLastPulseSig = "";
  let _fabLastPulseAt = 0;

  // --- Build C: Centralized FAB pulse controller (event-driven, calm) ---
  // Pulse is an event, not a state. All triggers funnel through requestQuickFabPulse().
  const PULSE_COOLDOWN_MS = 15000;
  const SEARCH_PULSE_DELAY_MS = 5000; // a bit calmer (keyboard hide included)
  const ENTER_CARDS_PULSE_DELAY_MS = 2000;
  const REMINDER_INTERVAL_MS = 1 * 60 * 1000; // test: 1 minute
  const REMINDER_INACTIVITY_MS = 1 * 60 * 1000; // test: 1 minute

  let _lastUserIntentAt = Date.now();
  let _lastQuickFabPulseAt = 0;
  let _searchPulseTimer = 0;
  let _enterCardsPulseTimer = 0;
  let _reminderTimerId = 0;

  function prefersReducedMotion(){
    try{
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }catch(_){
      return false;
    }
  }

  // "User intent" is narrowly defined:
  // - interactions with the menu (open/close + any controls inside)
  // - typing in the header search field
  // (Scrolling/reading/clicking cards should NOT reset the reminder timer.)
  function markUserIntent(){
    _lastUserIntentAt = Date.now();
    // If the user is actively doing something, cancel any "enter cards" pulse that hasn't fired yet.
    if (_enterCardsPulseTimer){ try{ window.clearTimeout(_enterCardsPulseTimer); }catch(_){/*ignore*/} _enterCardsPulseTimer = 0; }
  }

  function hasActiveFiltersOrSearch(){
    try{ if (hasActiveFilters()) return true; }catch(_){/* ignore */}
    try{ return !!(String(state.q || "").trim()); }catch(_){ return false; }
  }

  function canQuickFabPulseNow(){
    if (prefersReducedMotion()) return false;
    if (!el.fabQuick) return false;
    if (!hasActiveFiltersOrSearch()) return false;
    if (!inCardsView()) return false;
    // No pulse while the dialog/menu is open.
    if (el?.dlg?.open) return false;

    const now = Date.now();
    if (now - _lastQuickFabPulseAt < PULSE_COOLDOWN_MS) return false;
    return true;
  }

  // THE one gate for actually pulsing the FAB.
  function requestQuickFabPulse(reason){
    // Central gate for actually pulsing the FAB.
    if (!canQuickFabPulseNow()) return false;
    _lastQuickFabPulseAt = Date.now();
    triggerQuickFabAttentionPulse();
    return true;
  }


  function scheduleSearchPulse(){
    if (_searchPulseTimer){ try{ window.clearTimeout(_searchPulseTimer); }catch(_){/*ignore*/} }
    _searchPulseTimer = window.setTimeout(() => {
      _searchPulseTimer = 0;
      requestQuickFabPulse("search");
    }, SEARCH_PULSE_DELAY_MS);
  }

  function scheduleEnterCardsPulse(){
    if (_enterCardsPulseTimer){ try{ window.clearTimeout(_enterCardsPulseTimer); }catch(_){/*ignore*/} }
    _enterCardsPulseTimer = window.setTimeout(() => {
      _enterCardsPulseTimer = 0;
      requestQuickFabPulse("enterCards");
    }, ENTER_CARDS_PULSE_DELAY_MS);
  }

  function startReminderLoop(){
    if (_reminderTimerId){ try{ window.clearInterval(_reminderTimerId); }catch(_){/*ignore*/} _reminderTimerId = 0; }
    _reminderTimerId = window.setInterval(() => {
      // Reminder: only when filters are active, the menu is closed, && there was no "user intent" recently.
      if (!hasActiveFiltersOrSearch()) return;
      if (!inCardsView()) return;
      if (el?.dlg?.open) return;
      if (prefersReducedMotion()) return;

      const now = Date.now();
      if (now - _lastUserIntentAt < REMINDER_INACTIVITY_MS) return;
      requestQuickFabPulse("reminder");
    }, REMINDER_INTERVAL_MS);
  }
  function maybeTriggerQuickFabPulseOnFilterChange(sigNow){
    // Deprecated in Build C: pulses are scheduled explicitly (search/enter/reminder).
    _fabLastPulseSig = sigNow;
  }

  function triggerQuickFabAttentionPulse(){
    if (!el.fabQuick) return;
    if (!hasActiveFiltersOrSearch()) return;
    // Only when (re-)entering the cards view.
    if (!inCardsView()) return;
    try{ if (_fabPulseTimer) window.clearTimeout(_fabPulseTimer); }catch(_){/* ignore */}
    _fabPulseTimer = window.setTimeout(() => {
      _fabPulseTimer = 0;
      if (!el.fabQuick) return;
      if (!inCardsView() || !hasActiveFiltersOrSearch()) return;

      // Restart animation deterministically.
      el.fabQuick.classList.remove("fabPulse");
      void el.fabQuick.offsetWidth; // reflow
      el.fabQuick.classList.add("fabPulse");

      const onEnd = (e) => {
        // Only react to our own animation.
        try{
          if (e && e.animationName && e.animationName !== "fabRingPulse" && e.animationName !== "fabBtnPulse") return;
        }catch(_){/* ignore */}
        try{ el.fabQuick.classList.remove("fabPulse"); }catch(_){/* ignore */}
        try{ el.fabQuick.removeEventListener("animationend", onEnd); }catch(_){/* ignore */}
      };
      el.fabQuick.addEventListener("animationend", onEnd);
    }, 0);
  }

  // --- Cards-view hint (Filter aktiv) ---
  // In diesem Build bewusst deaktiviert: Kein Text-Feedback außerhalb des Schnellmenüs.
  const ENABLE_VIEW_TOAST = false;

  // (Code bleibt als Schalter für spätere Builds vorhanden.)
  let _viewHintDismissed = false;
  let _viewHintHandlersOn = false;
  let _viewHintDismissHandler = null;

  function inCardsView(){
    // Cards view is visible whenever the filter dialog is not open.
    try{ return !(el.dlg && el.dlg.open); }catch(_){ return true; }
  }

  function removeViewHintHandlers(){
    if (!_viewHintHandlersOn || !_viewHintDismissHandler) return;
    try{ window.removeEventListener("scroll", _viewHintDismissHandler, true); }catch(_){/* ignore */}
    try{ window.removeEventListener("pointerdown", _viewHintDismissHandler, true); }catch(_){/* ignore */}
    // Fallback for older touch stacks
    try{ window.removeEventListener("touchstart", _viewHintDismissHandler, true); }catch(_){/* ignore */}
    _viewHintHandlersOn = false;
    _viewHintDismissHandler = null;
  }

  function hideViewToast(){
    if (!el.viewToast) return;
    el.viewToast.hidden = true;
    removeViewHintHandlers();
  }

  function showViewToast(msg){
    if (!ENABLE_VIEW_TOAST) return;
    if (!el.viewToast) return;
    if (!msg) return;
    el.viewToast.textContent = String(msg);
    el.viewToast.hidden = false;

    if (_viewHintHandlersOn) return;
    _viewHintDismissHandler = () => {
      _viewHintDismissed = true;
      hideViewToast();
    };
    _viewHintHandlersOn = true;
    // Capture phase ensures we dismiss even if the click is handled elsewhere.
    window.addEventListener("scroll", _viewHintDismissHandler, {passive:true, capture:true});
    window.addEventListener("pointerdown", _viewHintDismissHandler, {passive:true, capture:true});
    window.addEventListener("touchstart", _viewHintDismissHandler, {passive:true, capture:true});
  }

  function resetViewHint(){
    if (!ENABLE_VIEW_TOAST) return;
    _viewHintDismissed = false;
  }

  function desiredViewHintMsg(){
    const n = Number(state.ui?.lastCount ?? 0);
    const base = Number.isFinite(n) && n > 0 ? `${n} Treffer` : "Filter aktiv";
    return base === "Filter aktiv" ? base : `${base} · Filter aktiv`;
  }

  function syncViewHint(){
    if (!ENABLE_VIEW_TOAST) { hideViewToast(); return; }
    if (!el.viewToast) return;
    if (!inCardsView()) { hideViewToast(); return; }
    if (!hasActiveFilters()) { _viewHintDismissed = false; hideViewToast(); return; }
    if (_viewHintDismissed) { hideViewToast(); return; }
    showViewToast(desiredViewHintMsg());
  }

  function filterSignature(){
    const f = state.filters;
    const arr = (s) => Array.from(s || []).map(String).sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}));
    return JSON.stringify({
      fav: !!f.fav,
      shortMain5: !!f.shortMain5,
      trophyPreset: String(f.trophyPreset || ""),
      genres: arr(f.genres),
      platforms: arr(f.platforms),
      sources: arr(f.sources),
      availability: arr(f.availability),
      trophies: arr(f.trophies),
    });
  }

  function applySignature(){
    // Keep this cheap: include values that affect the filtered/sorted result *and*
    // values that require a DOM re-render even if the result set is unchanged.
    // NOTE: UI scale / viewport are CSS-only && don't require re-rendering.
    return [
      String(state.q ?? ""),
      filterSignature(),
      String(state.sortField || ""),
      String(state.sortDir || ""),
      // Card view mode changes the DOM structure / visibility rules, so it must
      // invalidate the render cache even if filters/sort are unchanged.
      String(state.cardView || ""),
    ].join("\n");
  }

  // Live-Apply: Filters/Sortierung wirken sofort (mit kleinem Debounce),
  // damit man beim Schließen des Menüs nichts "vergisst".
  let _liveApplyTimer = 0;
  let _menuDirty = false;
  let _menuSigOnOpen = "";
  let _menuHadFiltersOnOpen = false;
  function scheduleLiveApply(){
    _menuDirty = true;
    if (_liveApplyTimer) window.clearTimeout(_liveApplyTimer);
    _liveApplyTimer = window.setTimeout(() => {
      _liveApplyTimer = 0;
      // Only apply when data is loaded.
      if (state.rows && state.rows.length) applyAndRender();
    }, 70);
  }

  function onChip(btn){
    const group = btn.getAttribute("data-group");
    const key = btn.getAttribute("data-key");
    const pressed = btn.getAttribute("aria-pressed") === "true";

    if (group === "sortField"){
      // Exclusive selection
      state.sortField = key || "ID";
      // reset all
      for (const b of el.dlg.querySelectorAll('.chip[data-group="sortField"]')){ b.setAttribute("aria-pressed","false"); }
      // Mark selected
      for (const b of el.dlg.querySelectorAll('.chip[data-group="sortField"]')){
        b.setAttribute("aria-pressed", (b.getAttribute("data-key") === state.sortField) ? "true" : "false");
      }
      saveSortPrefs();
      updateFabSortFieldUI();
      updateDialogMeta();
      scheduleLiveApply();
      return;
    }

    if (group === "genrePick"){
      // "Alle" (key="") clears the genre filter.
      if (!key){
        state.filters.genres.clear();
      } else {
        if (state.filters.genres.has(key)) state.filters.genres.delete(key);
        else state.filters.genres.add(key);
      }
      // Enforce exclusivity for "Alle"
      if (state.filters.genres.size > 0){
        setAllChipPressed("genrePick", "", false);
      } else {
        setAllChipPressed("genrePick", "", true);
      }
      // Sync select (mobile) + desktop chips
      syncGenreSelectFromState();
      updateDialogMeta();
      scheduleLiveApply();
      return;
    }

    if (group === "fav"){
      // simple toggle
      state.filters.fav = !pressed;
      setAllChipPressed("fav", "fav", !pressed);
      updateDialogMeta();
      scheduleLiveApply();
      return;
    }

    if (group === "trophyPreset"){
      // Exclusive preset: toggle off when tapped again
      const next = (state.filters.trophyPreset === key) ? "" : key;
      state.filters.trophyPreset = next;
      for (const k of ["open3","open5","pct90","pct75"]){
        setAllChipPressed("trophyPreset", k, next === k);
      }
      updateDialogMeta();
      scheduleLiveApply();
      return;
    }

    if (group === "shortMain"){
      state.filters.shortMain5 = !pressed;
      setAllChipPressed("shortMain", "le5", state.filters.shortMain5);
      updateDialogMeta();
      scheduleLiveApply();
      return;
    }

    // toggle sets

    // toggle sets
    const set = group === "plat" ? state.filters.platforms
              : group === "src" ? state.filters.sources
              : group === "avail" ? state.filters.availability
              : group === "trophy" ? state.filters.trophies
              : null;
    if (!set) return;
    if (pressed) set.delete(key);
    else set.add(key);

    // Sync duplicates (v.a. Trophäen: Schnellfilter + Akkordeon)
    setAllChipPressed(group, key, !pressed);
    updateDialogMeta();
    scheduleLiveApply();
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

  // Apply pipeline: most UI actions should apply immediately, but typing in the search box
  // should not re-render on every keystroke (especially with big lists).
  let __applyTimer = 0;
  
  function setSearchQuery(q, src){
    state.q = q || "";
    // Mirror the query into both inputs (global + menu) without causing churn.
    try{
      if (el.search && src !== "global" && el.search.value !== state.q) el.search.value = state.q;
    }catch(_){/* ignore */}
    try{
      if (el.menuSearch && src !== "menu" && el.menuSearch.value !== state.q) el.menuSearch.value = state.q;
    }catch(_){/* ignore */}
  }

function scheduleApplyAndRender(delayMs){
    const d = (delayMs == null) ? 0 : Math.max(0, Number(delayMs) || 0);
    if (__applyTimer) window.clearTimeout(__applyTimer);
    if (!d) { applyAndRender(); return; }
    __applyTimer = window.setTimeout(() => {
      __applyTimer = 0;
      applyAndRender();
      // Keep the dialog's "Fertig (N)" count in sync when open.
      if (el.dlg?.open) updateApplyCount();
    }, d);
  }

  function applyAndRender(){

    // Perf polish: bail out early if nothing relevant has changed.
    // This prevents redundant full-list filtering/sorting/renders triggered by UI actions
    // that don't affect the result.
    const __sig = applySignature();
    if (__lastRowsRef === state.rows && __lastApplyKey === __sig){
      return;
    }
    __lastRowsRef = state.rows;
    __lastApplyKey = __sig;

    const __t0 = PERF ? performance.now() : 0;
    const qRaw = String(state.q ?? "");
    const qTrim = qRaw.trim();
    const queryOr = parseQueryOr(qRaw);
    const favOnly = state.filters.fav;
    const platF = state.filters.platforms;
    const srcF = state.filters.sources;
    const avF = state.filters.availability;
    const trophyPreset = state.filters.trophyPreset || "";
    const shortMain5 = !!state.filters.shortMain5;

    const wantGenresN = (state.filters.genres && state.filters.genres.size) ? new Set(Array.from(state.filters.genres).map(norm)) : null;

    let out = state.rows.filter(r => {      // search
      if (qTrim){
        const m = rowMatchesQueryOr(r, queryOr);
        if (!m.ok) return false;
        // Store per-row highlight terms (used by Markierungen)
        r.__qSeg = m.segIdx;
        r.__hlTerms = (queryOr.segments && queryOr.segments[m.segIdx] && queryOr.segments[m.segIdx].hlTerms) ? queryOr.segments[m.segIdx].hlTerms : [];
      } else {
        r.__qSeg = -1;
        r.__hlTerms = [];
      }
      // fav
      if (favOnly){
        const f = String(r[COL.fav] ?? "").trim().toLowerCase();
        if (f !== "x" && f !== "1" && f !== "true") return false;
      }
      // Genre filter (multi-select; exact match, normalized)
      if (wantGenresN){
        const got = r.__genreN || norm(r[COL.genre]);
        if (!wantGenresN.has(got)) return false;
      }

      // platform filter: system contains at least one selected
      if (platF.size){
        const sys = r.__sysArr || splitPipe(r[COL.system]);
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
        const tags = r.__tTags || trophyTags(r);
        let ok = false;
        for (const t of troF){ if (tags.has(t)) { ok = true; break; } }
        if (!ok) return false;
      }

      // Trophäen-Fortschritt Presets (exklusiv)
      if (trophyPreset){
        const agg = r.__tAgg || trophyAggregate(r);
        if (!agg) return false;
        // Presets should not include already completed titles (open trophies == 0).
        // Aggregation covers mixed platform states (e.g. PS4 complete, PS5 still open).
        if (trophyPreset === "open3"){ if (!(agg.open != null && agg.open > 0 && agg.open <= 3)) return false; }
        else if (trophyPreset === "open5"){ if (!(agg.open != null && agg.open > 0 && agg.open <= 5)) return false; }
        else if (trophyPreset === "pct90"){ if (!(agg.pct != null && agg.open != null && agg.open > 0 && agg.pct >= 90)) return false; }
        else if (trophyPreset === "pct75"){ if (!(agg.pct != null && agg.open != null && agg.open > 0 && agg.pct >= 75)) return false; }
      }

      // Spielzeit-Preset
      if (shortMain5){
        const h = parseHours(r[COL.main]);
        if (h == null || !(h <= 5)) return false;
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
      if (sf === "__trophyPct"){
        const pa = (a.__tAgg || trophyAggregate(a))?.pct;
        const pb = (b.__tAgg || trophyAggregate(b))?.pct;
        const na = (pa == null) ? null : Number(pa);
        const nb = (pb == null) ? null : Number(pb);
        if (na == null && nb == null) {/* fallthrough */}
        else if (na == null) return 1;
        else if (nb == null) return -1;
        else return (na - nb) * dir;
      }
      if (sf === "__trophyOpen"){
        const oa = (a.__tAgg || trophyAggregate(a))?.open;
        const ob = (b.__tAgg || trophyAggregate(b))?.open;
        const na = (oa == null) ? null : Number(oa);
        const nb = (ob == null) ? null : Number(ob);
        if (na == null && nb == null) {/* fallthrough */}
        else if (na == null) return 1;
        else if (nb == null) return -1;
        else return (na - nb) * dir;
      }

      if (sf === "__platform"){
        const pa = primaryPlatform(a);
        const pb = primaryPlatform(b);
        const ra = pa ? platformRank(pa) : 999;
        const rb = pb ? platformRank(pb) : 999;
        if (ra !== rb) return (ra - rb) * dir;
        // tie-breaker within same primary platform: Title then ID (handled below)
        const ta = String(a[COL.title] ?? "");
        const tb = String(b[COL.title] ?? "");
        const c = ta.localeCompare(tb, "de");
        if (c !== 0) return c * dir;
      }

      if (sf === "__developer"){
        const da = a.__devKey || developerSortKey(a);
        const db = b.__devKey || developerSortKey(b);
        if (!da && !db) {/* fallthrough */}
        else if (!da) return 1;
        else if (!db) return -1;
        else {
          const c = da.localeCompare(db, "de");
          if (c !== 0) return c * dir;
        }
        // same dev: fall back to title/id
        const ta = String(a[COL.title] ?? "");
        const tb = String(b[COL.title] ?? "");
        const c2 = ta.localeCompare(tb, "de");
        if (c2 !== 0) return c2 * dir;
      }
      let cmp = String(A).localeCompare(String(B), "de") * dir;
      // Stabiler Tie-Breaker: immer nach ID (aufsteigend), damit Sortierung ruhig bleibt.
      if (cmp === 0 && sf !== "ID"){
        const ia = Number(a[COL.id] ?? ""), ib = Number(b[COL.id] ?? "");
        if (Number.isFinite(ia) && Number.isFinite(ib)) return ia - ib;
      }
      return cmp;
    });

    state.ui.lastCount = out.length;
    if (el.hitCount) el.hitCount.textContent = String(out.length);
    else if (el.pillRows) el.pillRows.textContent = `Treffer: ${out.length}`;
    queueToolbarCompactness();
    try{ queueHeaderRemeasure(); }catch(_){/* ignore */}

    // Compute once: used for hint-reset + Schnellmenü attention pulse.
    let sigNow = "";
    try{ sigNow = filterSignature(); }catch(_){ sigNow = ""; }

    // Keep FAB quick controls in sync (in case sortDir changed via dialog).
    updateFabSortUI();
    updateFabSortFieldUI();
    updateQuickFilterIndicator();
    // Cards-view hint: whenever the active filter state changes, allow the hint to show again.
    // (The user dismisses it via interaction: scroll/tap.)
    try{
      if (sigNow !== String(state.ui?.lastFilterSig ?? "")){
        state.ui.lastFilterSig = sigNow;
        resetViewHint();
      }
    }catch(_){/* ignore */}
    syncViewHint();
    const __t1 = PERF ? performance.now() : 0;
    render(out);
    if (PERF) {
      const __t2 = performance.now();
      const applyMs = (__t1 - __t0);
      const renderMs = (__t2 - __t1);
      const totalMs = (__t2 - __t0);
      console.debug(`[PERF] apply+derive ${applyMs.toFixed(1)}ms | render ${renderMs.toFixed(1)}ms | total ${totalMs.toFixed(1)}ms | rows ${out.length}`);
    }
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

  function trophyAggregate(row){
    const prog = String(row[COL.trophProg] ?? "").trim();
    const p100 = String(row[COL.troph100] ?? "").trim();
    const plat = String(row[COL.platin] ?? "").trim();

    // Box-Teil / keine Daten
    if (prog.startsWith("BOX_TEIL:") || p100.startsWith("BOX_TEIL:") || plat.startsWith("BOX_TEIL:")) return null;

    const dprog = parseKeyVals(prog);
    const fracs = Object.values(dprog).map(v => parseFrac(v)).filter(Boolean);

    if (fracs.length){
      const earned = fracs.reduce((s,f)=>s+f.a,0);
      const total  = fracs.reduce((s,f)=>s+f.b,0);
      if (!total) return null;
      const pct = (earned/total)*100;
      const open = Math.max(0, total-earned);
      return {earned, total, pct, open};
    }

    // Fallbacks: infer pct for completed/unplayed, but open count may be unknown.
    const tags = trophyTags(row);
    if (tags.has("Platin") || tags.has("100%")) return {earned:0,total:0,pct:100,open:0};
    if (tags.has("Ungespielt")) return {earned:0,total:0,pct:0,open:null};
    return null;
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
    const __rt0 = PERF_DETAIL ? performance.now() : 0;
    const viewMode = String(state.cardView || 'detail');
    const showHeaderTrophy = (viewMode === 'detail');

    // Map rendered rows for per-card highlighting (OR: only first matching segment is marked)
    try{
      const __m = new Map();
      for (const r of (rows || [])){
        const id = String(r?.[COL.id] ?? "").trim();
        if (id) __m.set(id, r);
      }
      state.ui._rowById = __m;
    }catch(_){
      state.ui._rowById = null;
    }

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

      // Trophy header badges (Progress/Status) are only shown in the global Detail view.
      // In Kartenmodus Mini/Kompakt they are intentionally hidden (shown nowhere in header).
      const tBadges = showHeaderTrophy ? trophyHeaderBadges(row) : [];
      const trophyBadge = tBadges.map(ts => badge("trophyHeader"+(ts.cls?(" "+ts.cls):""), `${ts.icon} ${ts.text}`)).join("");
      const trophyHeaderHtml = (showHeaderTrophy && trophyBadge)
        ? `
              <div class="headDivider" aria-hidden="true"></div>

              <div class="badgeRow badgeRow-trophy">
                ${trophyBadge}
              </div>`
        : ``;
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
        <article class="card" data-id="${esc(id || "")}">
          <div class="topGrid">
            <div class="head">
              <div class="rowMeta">
                <div class="idBadge">ID ${esc(id || "—")}</div>
                ${isFav ? `<div class="favIcon" title="Favorit">⭐</div>` : `<div class="favSpacer" aria-hidden="true"></div>`}
              </div>

              <div class="title">${esc(title)}</div>

              <div class="miniGenre" title="${esc(genre)}">${esc(genre)}</div>

              <div class="badgeRow badgeRow-platforms">
                ${platBadges.join("")}
              </div>

              <div class="badgeRow badgeRow-meta">
                ${srcBadge}
                ${avBadge}
                ${reminder ? remBadge : ""}
              </div>

              ${trophyHeaderHtml}

              <div class="cardChevron chev1" aria-hidden="true">▾</div>
            </div>

            <div class="compactWrap">
              ${info}
              <div class="chev2Wrap">
                <div class="cardChevron chev2" aria-hidden="true">▾</div>
              </div>
            </div>
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

    const __rt1 = PERF_DETAIL ? performance.now() : 0;

    // Perf polish: build DOM off-screen, then swap in one operation.
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    el.cards.replaceChildren();
    el.cards.append(tpl.content);
    // Sync summary labels once after render; subsequent updates are handled via a single delegated listener.
    syncDetailsSummaryLabels(el.cards);

    // Lesemodus: nach DOM-Swap offene Akkordeons erneut anbinden
    try{ if (_readModeOn) refreshReadModeObserved(); }catch(_){/* ignore */}


    // Apply card-mode openness to newly rendered cards
    try{ syncCardStates(); }catch(_){/* ignore */}

    // If highlights are enabled, apply them once after the DOM swap.
    // (Subsequent accordion opens are handled by the delegated toggle listener.)
    try{ if (state?.ui?.highlights) syncAllCardHighlights(); }catch(_){/* ignore */}

    if (PERF_DETAIL) {
      const __rt2 = performance.now();
      const htmlMs = (__rt1 - __rt0);
      const domMs = (__rt2 - __rt1);
      const totalMs = (__rt2 - __rt0);
      console.debug(`[PERF] render html ${htmlMs.toFixed(1)}ms | dom ${domMs.toFixed(1)}ms | total ${totalMs.toFixed(1)}ms | rows ${rows.length}`);
    }

  }

  // Perf polish: avoid attaching toggle listeners to every <details> on every render.
  // We wire a single delegated listener once && just sync initial labels after each render.
  let __detailsToggleWired = false;
  function wireDetailsToggle(){
    if (__detailsToggleWired) return;
    if (!el.cards) return;
    __detailsToggleWired = true;
    el.cards.addEventListener("toggle", (ev) => {
      const det = ev.target;
      if (!det || det.tagName !== "DETAILS") return;
      const sum = det.querySelector("summary");
      const label = sum?.querySelector("[data-label]");
      if (!label) return;
      const base = label.getAttribute("data-label") || "";
      label.textContent = det.open ? (base + " verbergen") : (base + " anzeigen");

      // Lesemodus: nur offene Details im (nahe) Viewport beobachten
      try{
        if (det.classList && det.classList.contains('d')){
          if (_readModeOn){
            if (det.open) observeDetails(det);
            else unobserveDetails(det);
          }else{
            det.classList.remove('is-reading');
          }
        }
      }catch(_){/* ignore */}

      // Optional: apply/remove search term highlights in large text blocks (lazy, on open).
      try{ syncHighlightsForDetails(det); }catch(_){/* ignore */}
    }, true);
  }
  function syncDetailsSummaryLabels(root){
    try{
      for (const det of root.querySelectorAll("details")){
        const sum = det.querySelector("summary");
        const label = sum?.querySelector("[data-label]");
        if (!label) continue;
        const base = label.getAttribute("data-label") || "";
        label.textContent = det.open ? (base + " verbergen") : (base + " anzeigen");
      }
    }catch(_){/* ignore */}
  }

  // --- Markierungen (Highlighting)
  // Zielbild:
  // - Markierungen sind rein visuell (kein Auto-Oeffnen) und folgen der aktuellen Suche.
  // - Begriffe aus globaler Suche UND Feldsuche werden gesammelt und auf alle sichtbaren Texte angewendet.
  // - In eingeklappten Akkordeons ist nichts sichtbar; beim Aufklappen sind Markierungen bereits vorhanden.

  function escapeRegExp(str){
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\$&");
  }


function getHighlightTermsFromParsed(parsed) {
  if (!parsed) return [];
  const out = [];

  function add(kind, value, explicit=false){
    const v = String(value || "").trim();
    if (!v) return;
    // Default noise guard: contains-tokens under 2 chars are typically useless.
    if (!explicit && kind === "contains" && v.length < 2) return;
    out.push({ kind, value: v, explicit: !!explicit });
  }

  // Feld-Paare (z. B. Entwickler: Naughty Dog)
  for (const t of (parsed.terms || [])) {
    if (!t || t.neg || !t.value) continue;
    const op = t.op || "contains";
    if (op === "word") add("word", t.value, true);
    else if (op === "phrase") add("phrase", t.value, true);
    else if (op === "eq") {
      const nv = normSearch(t.value);
      add(nv.includes(" ") ? "phrase" : "word", t.value, true);
    }
    else add("contains", t.value, false);
  }

  // Freie Begriffe
  for (const t of (parsed.freeTerms || [])) {
    if (!t || t.neg || !t.value) continue;
    const k = t.kind || "contains";
    if (k === "phrase") add("phrase", t.value, true);
    else if (k === "word") add("word", t.value, true);
    else if (k === "group") {
      // legacy quotes mean AND over tokens – highlight those tokens, not the whole phrase
      const toks = normSearch(t.value).split(/\s+/).filter(Boolean);
      for (const w of toks) add("contains", w, false);
    }
    else add("contains", t.value, false);
  }

  // Normalisieren: Duplikate (case-insensitive + kind) entfernen.
  const uniq = new Map();
  for (const t of out) {
    const cleaned = String(t.value).replace(/^[-+]+/, "").trim();
    if (!cleaned) continue;
    const key = t.kind + "::" + cleaned.toLowerCase();
    if (!uniq.has(key)) uniq.set(key, { kind: t.kind, value: cleaned, explicit: t.explicit });
  }

  // Laengere zuerst (besseres Overlap-Verhalten)
  return Array.from(uniq.values()).sort((a, b) => b.value.length - a.value.length);
}

function getHighlightTermsFromQuery(rawQuery) {
  const q = (rawQuery || "").trim();
  if (!q) return [];

  // For OR queries, we return the union. (Per-card highlighting is handled separately.)
  const qo = parseQueryOr(q);
  const uniq = new Map();
  for (const seg of (qo.segments || [])){
    for (const t of (seg.hlTerms || [])){
      const cleaned = String(t.value || "").replace(/^[-+]+/, "").trim();
      if (!cleaned) continue;
      const key = (t.kind || "contains") + "::" + cleaned.toLowerCase();
      if (!uniq.has(key)) uniq.set(key, { kind: (t.kind || "contains"), value: cleaned, explicit: !!t.explicit });
    }
  }
  return Array.from(uniq.values()).sort((a, b) => b.value.length - a.value.length);
}

function getHighlightTermsForCard(cardEl){
  try{
    const id = String(cardEl?.getAttribute?.('data-id') || '').trim();
    const row = (id && state?.ui?._rowById) ? state.ui._rowById.get(id) : null;
    const terms = row && Array.isArray(row.__hlTerms) ? row.__hlTerms : [];
    return (terms && terms.length) ? terms : getHighlightTermsFromQuery(state.q);
  }catch(_){
    return getHighlightTermsFromQuery(state.q);
  }
}

function unwrapHighlights(root) {
  if (!root) return;
  root.querySelectorAll('span.hl').forEach((span) => {
    span.replaceWith(document.createTextNode(span.textContent || ""));
  });
}

function applyHighlights(root, terms) {
  if (!root || !terms || !terms.length) return;

  const compiled = [];
  for (const t of terms){
    const val = String(t?.value || "").trim();
    if (!val) continue;
    const escV = escapeRegExp(val);
    if (!escV) continue;
    if (t.kind === "word"){
      // Highlight only whole words/tokens in the ORIGINAL text (best-effort):
      // Boundaries = non letter/number using Unicode property escapes.
      // We keep the boundary char in group 1 and highlight group 2.
      try{
        compiled.push({
          kind: "word",
          re: new RegExp(`(^|[^\\p{L}\\p{N}])(${escV})(?=$|[^\\p{L}\\p{N}])`, "giu")
        });
      }catch(_){
        // Fallback: whitespace boundaries
        compiled.push({
          kind: "word",
          re: new RegExp(`(^|\\s)(${escV})(?=$|\\s)`, "gi")
        });
      }
    } else {
      compiled.push({ kind: t.kind || "contains", re: new RegExp(escV, "giu") });
    }
  }
  if (!compiled.length) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script,style,textarea,input')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('span.hl')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const txt = node.nodeValue;
    if (!txt) continue;

    const ranges = [];
    for (const c of compiled){
      const re = c.re;
      if (!re) continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(txt))){
        let a, b;
        if (c.kind === "word"){
          const pre = m[1] || "";
          const body = m[2] || "";
          a = m.index + pre.length;
          b = a + body.length;
        } else {
          a = m.index;
          b = a + String(m[0] || "").length;
        }
        if (b > a) ranges.push([a, b]);
        if (m[0] === "") re.lastIndex++; // safety
      }
    }
    if (!ranges.length) continue;

    ranges.sort((x, y) => (x[0] - y[0]) || (x[1] - y[1]));
    const merged = [];
    for (const r of ranges){
      if (!merged.length) merged.push(r);
      else {
        const last = merged[merged.length - 1];
        if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
        else merged.push(r);
      }
    }

    const frag = document.createDocumentFragment();
    let last = 0;
    for (const [a, b] of merged){
      if (a > last) frag.appendChild(document.createTextNode(txt.slice(last, a)));
      const span = document.createElement('span');
      span.className = 'hl';
      span.textContent = txt.slice(a, b);
      frag.appendChild(span);
      last = b;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));

    node.parentNode.replaceChild(frag, node);
  }
}
  function syncHighlightsForDetails(detailsEl) {
    if (!detailsEl) return;
    unwrapHighlights(detailsEl);
    if (!state.ui.highlights) return;
    const card = detailsEl.closest?.('.card');
    const terms = getHighlightTermsForCard(card);
    if (!terms.length) return;
    applyHighlights(detailsEl, terms);
  }

  // Apply/remove highlights in the currently rendered card DOM.
  // We keep this intentionally simple: highlight markup can exist in closed
  // <details> blocks (they are not visible anyway). When the user opens an
  // accordion, the highlights are already there.
  function syncOpenTextHighlights(){
    try{ syncAllCardHighlights(); }catch(_){/* ignore */}
  }

  function syncAllCardHighlights() {
    if (!el.cards) return;
    const cards = el.cards.querySelectorAll('.card');

    for (const card of cards) {
      unwrapHighlights(card);
      if (!state.ui.highlights) continue;
      const terms = getHighlightTermsForCard(card);
      if (!terms.length) continue;
      applyHighlights(card, terms);
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
        <div class="detailsBody"><div class="detailsInner">${bodyHtml}</div></div>
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
    if (!window.XLSX){
      try{
        window.__BOOT && window.__BOOT.disableLoad && window.__BOOT.disableLoad(true);
        window.__BOOT && window.__BOOT.noticeLoad && window.__BOOT.noticeLoad('Excel-Import nicht verfügbar: XLSX-Bibliothek fehlt (xlsx.full.min.js).');
        window.__BOOT && window.__BOOT.noticeTop && window.__BOOT.noticeTop('Hinweis: XLSX wurde nicht geladen – prüfe, ob xlsx.full.min.js im selben Ordner liegt.');
      }catch(_){/* ignore */}
      return;
    }
    el.file.value = "";
    el.file.click();
  }

  el.btnLoad.addEventListener("click", openFilePicker);
  el.btnLoad2.addEventListener("click", openFilePicker);

  // ---------------------------------------------------------------------------
  // Popovers (schwebend, ohne Layout-Shift)
  // - Header-Suchhilfe (ⓘ): als Popover
  // - Excel/Import (⋯): als Popover
  // - Menü-Suchhilfe (ⓘ im Dialog): bleibt inline wie bisher
  // ---------------------------------------------------------------------------
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const isShown = (node) => !!(node && !node.hidden);

  // Mobile browsers can report a layout viewport (100vh) that differs from the
  // actually visible viewport due to dynamic browser bars. Expose the visible
  // height as a CSS var for robust popover sizing.
  function updateVisibleVh(){
    try{
      const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 0;
      if (h) document.documentElement.style.setProperty('--vvh', `${Math.round(h)}px`);
    }catch(_){/* ignore */}
  }
  updateVisibleVh();
  try{
    if (window.visualViewport){
      window.visualViewport.addEventListener('resize', updateVisibleVh);
      window.visualViewport.addEventListener('scroll', updateVisibleVh);
    }
  }catch(_){/* ignore */}

  function positionPopover(pop, anchor){
    if (!pop || !anchor) return;
    const pad = 12;
    const gap = 8;
    // Reset to allow correct measuring
    pop.style.left = "0px";
    pop.style.top = "0px";
    const a = anchor.getBoundingClientRect();
    const r = pop.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;

    let left = clamp(a.left, pad, Math.max(pad, vw - r.width - pad));
    let top = a.bottom + gap;
    // Flip above if we would overflow below.
    if (top + r.height + pad > vh){
      const above = a.top - gap - r.height;
      top = clamp(above, pad, Math.max(pad, vh - r.height - pad));
    }

    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
  }

  function closeHeaderPopovers(){
    try{ setSearchHelpOpen(false); }catch(_){/* ignore */}
    try{ setFileMoreOpen(false); }catch(_){/* ignore */}
  }

  function ensurePopoverCloseBtn(pop){
    try{
      if (!pop || pop.querySelector('.popoverCloseBtn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'popoverCloseBtn';
      btn.setAttribute('aria-label','Schließen');
      btn.innerHTML = '✕';
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        closeHeaderPopovers();
      });
      pop.insertBefore(btn, pop.firstChild);
    }catch(_){/* ignore */}
  }

  const overlayRoot = (() => {
    let r = document.getElementById("overlayRoot");
    if (!r){
      r = document.createElement("div");
      r.id = "overlayRoot";
      r.setAttribute("aria-hidden","true");
      document.body.appendChild(r);
    }
    return r;
  })();

  const _popoverHome = new WeakMap();

  function syncHeaderPopoverState(){
    try{
      const open = isShown(el.searchHelpBody) || isShown(el.fileMoreBody);
      document.documentElement.classList.toggle('headerPopoverOpen', !!open);
    }catch(_){/* ignore */}
  }

  function movePopoverToOverlay(pop){
    if (!pop) return;
    if (!_popoverHome.has(pop)){
      _popoverHome.set(pop, { parent: pop.parentElement, next: pop.nextSibling });
    }
    if (pop.parentElement !== overlayRoot){
      overlayRoot.appendChild(pop);
    }
  }

  function restorePopoverFromOverlay(pop){
    if (!pop) return;
    const info = _popoverHome.get(pop);
    if (!info || !info.parent) return;
    if (pop.parentElement === info.parent) return;
    try{
      if (info.next && info.next.parentNode === info.parent){
        info.parent.insertBefore(pop, info.next);
      } else {
        info.parent.appendChild(pop);
      }
    }catch(_){
      try{ info.parent.appendChild(pop); }catch(__){}
    }
  }

  // Search help: header = popover, menu = inline
  function setSearchHelpOpen(isOpen){
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    const headerWrap = document.getElementById("searchHelp");
    const menuWrap = document.getElementById("menuSearchHelp");

    if (modalOpen){
      // Dialog context: show inline help in the sheet.
      if (el.menuSearchHelpBody) el.menuSearchHelpBody.hidden = !isOpen;
      if (el.menuSearchHelpBtn) el.menuSearchHelpBtn.setAttribute("aria-expanded", String(isOpen));
      if (menuWrap) menuWrap.classList.toggle("open", isOpen);

      // Always hide header popover while the modal is open.
      if (el.searchHelpBody){ el.searchHelpBody.hidden = true; restorePopoverFromOverlay(el.searchHelpBody); }
      if (el.searchHelpBtn) el.searchHelpBtn.setAttribute("aria-expanded", "false");
      if (headerWrap) headerWrap.classList.remove("open");
      syncHeaderPopoverState();
      return;
    }

    // Header context: show popover.
    if (el.searchHelpBody){
      if (isOpen){
        movePopoverToOverlay(el.searchHelpBody);
        ensurePopoverCloseBtn(el.searchHelpBody);
        el.searchHelpBody.hidden = false;
      }else{
        el.searchHelpBody.hidden = true;
        restorePopoverFromOverlay(el.searchHelpBody);
      }
    }
    if (el.searchHelpBtn) el.searchHelpBtn.setAttribute("aria-expanded", String(isOpen));
    if (headerWrap) headerWrap.classList.toggle("open", isOpen);

    // While any header popover is open, keep floating buttons out of the way.
    syncHeaderPopoverState();

    // Ensure the dialog help is closed when not in modal context.
    if (el.menuSearchHelpBody) el.menuSearchHelpBody.hidden = true;
    if (el.menuSearchHelpBtn) el.menuSearchHelpBtn.setAttribute("aria-expanded", "false");
    if (menuWrap) menuWrap.classList.remove("open");

    if (isOpen){
      // Only one popover at a time.
      setFileMoreOpen(false);
      updateVisibleVh();
      window.requestAnimationFrame(() => positionPopover(el.searchHelpBody, el.searchHelpBtn));
    }
  }

  function toggleSearchHelp(){
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    const body = modalOpen ? el.menuSearchHelpBody : el.searchHelpBody;
    const isOpen = body ? !body.hidden : false;
    setSearchHelpOpen(!isOpen);
  }

  if ((el.searchHelpBtn && el.searchHelpBody) || (el.menuSearchHelpBtn && el.menuSearchHelpBody)){
    if (el.searchHelpBtn) el.searchHelpBtn.addEventListener("click", toggleSearchHelp);
    if (el.menuSearchHelpBtn) el.menuSearchHelpBtn.addEventListener("click", toggleSearchHelp);
    setSearchHelpOpen(false);
  }

  // Excel/Import details: popover anchored to ⋯
  function setFileMoreOpen(isOpen){
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    if (el.fileMoreBody){
      if (modalOpen){
        el.fileMoreBody.hidden = true;
        restorePopoverFromOverlay(el.fileMoreBody);
      } else if (isOpen){
        movePopoverToOverlay(el.fileMoreBody);
        ensurePopoverCloseBtn(el.fileMoreBody);
        el.fileMoreBody.hidden = false;
      } else {
        el.fileMoreBody.hidden = true;
        restorePopoverFromOverlay(el.fileMoreBody);
      }
    }
    if (el.fileMoreBtn) el.fileMoreBtn.setAttribute("aria-expanded", String(!modalOpen && isOpen));
    if (el.fileMoreWrap) el.fileMoreWrap.classList.toggle("open", (!modalOpen && isOpen));

    // While any header popover is open, keep floating buttons out of the way.
    syncHeaderPopoverState();

    if (!modalOpen && isOpen){
      // Only one popover at a time.
      setSearchHelpOpen(false);
      updateVisibleVh();
      window.requestAnimationFrame(() => positionPopover(el.fileMoreBody, el.fileMoreBtn));
    }
  }
  function toggleFileMore(){
    const isOpen = el.fileMoreBody ? !el.fileMoreBody.hidden : false;
    setFileMoreOpen(!isOpen);
  }
  if (el.fileMoreBtn && el.fileMoreBody){
    el.fileMoreBtn.addEventListener("click", toggleFileMore);
    setFileMoreOpen(false);
  }

  // Close popovers on outside click / ESC / scroll.
  document.addEventListener("pointerdown", (ev) => {
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    if (modalOpen) return; // menu keeps its inline behavior
    const t = ev.target;
    const shOpen = isShown(el.searchHelpBody);
    const fmOpen = isShown(el.fileMoreBody);
    if (!shOpen && !fmOpen) return;

    if (shOpen && (el.searchHelpBody.contains(t) || (el.searchHelpBtn && el.searchHelpBtn.contains(t)))) return;
    if (fmOpen && (el.fileMoreBody.contains(t) || (el.fileMoreBtn && el.fileMoreBtn.contains(t)))) return;
    closeHeaderPopovers();
  }, {capture:true});

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    if (modalOpen) return; // dialog handles its own Escape
    if (isShown(el.searchHelpBody) || isShown(el.fileMoreBody)) closeHeaderPopovers();
  });

  window.addEventListener("scroll", () => {
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    if (modalOpen) return;
    if (isShown(el.searchHelpBody) || isShown(el.fileMoreBody)) closeHeaderPopovers();
  }, {passive:true});

  // Header hide/show (all devices): thresholds depend on header height.
  updateHeaderMetrics();
  window.addEventListener("scroll", queueHeaderVisibilityUpdate, {passive:true});
  window.addEventListener("resize", () => { updateHeaderMetrics(); queueHeaderVisibilityUpdate(); }, {passive:true});
  queueHeaderVisibilityUpdate();

  const repositionIfOpen = () => {
    const modalOpen = document.documentElement.classList.contains("modalOpen");
    if (modalOpen) return;
    if (isShown(el.searchHelpBody)) positionPopover(el.searchHelpBody, el.searchHelpBtn);
    if (isShown(el.fileMoreBody)) positionPopover(el.fileMoreBody, el.fileMoreBtn);
  };
  window.addEventListener("resize", repositionIfOpen, {passive:true});

  el.file.addEventListener("change", async () => {
    const f = el.file.files?.[0];
    if (!f) return;
    try{
      if (el.pillFile) el.pillFile.textContent = f.name;
      if (el.pillImport) el.pillImport.textContent = "Importiert: —";
      const buf = await f.arrayBuffer();
      readXlsx(buf, f.name);
    }catch(e){
      console.error(e);
      pill("Fehler", "pill-bad");
      alert("Fehler beim Einlesen der Excel: " + (e?.message || e));
    }
  });

  // Custom clear buttons for search inputs (avoid native cancel-button quirks)
  function setupClearButton(inputEl, btnEl){
    if(!inputEl || !btnEl) return;
    const sync = () => {
      const hasValue = (inputEl.value || "").length > 0;
      btnEl.classList.toggle("isVisible", hasValue);
    };
    sync();
    inputEl.addEventListener("input", sync);
    inputEl.addEventListener("change", sync);
    inputEl.addEventListener("focus", sync);
    btnEl.addEventListener("click", (e) => {
      e.preventDefault();
      inputEl.value = "";
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.focus();
    });
  }
  setupClearButton(el.search, el.searchClearBtn);
  setupClearButton(el.menuSearch, el.menuSearchClearBtn);

  el.search.addEventListener("input", () => {
    // Header search counts as "user intent".
    markUserIntent();
    setSearchQuery(el.search.value || "", "global");
    scheduleApplyAndRender(150);
    // Attention pulse: 2s after the last input (debounced), only when filters are active.
    scheduleSearchPulse();
  });

  if (el.menuSearch){
    el.menuSearch.addEventListener("input", () => {
      // Any interaction inside the menu counts as "user intent".
      markUserIntent();
      setSearchQuery(el.menuSearch.value || "", "menu");
      scheduleApplyAndRender(150);
      // Same pulse rule as header search (mirrored field).
      scheduleSearchPulse();
    });
  }

el.btnTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

  // Prevent background scroll while the bottom-sheet dialog is open.
  // On mobile (especially Android/Chrome), only using overflow:hidden can cause
  // "short" initial sheet layouts after the user scrolled the page (visual viewport
  // vs layout viewport mismatch). A body-position freeze is more reliable.
  let _savedScrollY = 0;
  let _lastFocusedBeforeMenu = null;

  // --- Visual viewport anchoring (Android address bar / dynamic viewport quirks) ---
  // Some mobile browsers (notably Android/Chrome) can report a layout viewport that
  // doesn't match the visual viewport after the page has been scrolled. When a modal
  // opens, this can cause the sheet to render "too small" with a top gap until the
  // user drags/scrolls (which triggers a reflow). We anchor the dialog to the visual
  // viewport using CSS variables fed by `window.visualViewport`.
  function updateVisualViewportVars(){
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (vv){
      root.style.setProperty('--vvTop', `${Math.round(vv.offsetTop)}px`);
      root.style.setProperty('--vvLeft', `${Math.round(vv.offsetLeft)}px`);
      root.style.setProperty('--vvWidth', `${Math.round(vv.width)}px`);
      root.style.setProperty('--vvHeight', `${Math.round(vv.height)}px`);
    }else{
      // Fallback for older browsers
      root.style.setProperty('--vvTop', `0px`);
      root.style.setProperty('--vvLeft', `0px`);
      root.style.setProperty('--vvWidth', `100%`);
      root.style.setProperty('--vvHeight', `${window.innerHeight}px`);
    }
  }

  // Keep vars warm (also helps with address bar show/hide while scrolling).
  updateVisualViewportVars();
  try{
    if (window.visualViewport){
      window.visualViewport.addEventListener('resize', updateVisualViewportVars);
      window.visualViewport.addEventListener('scroll', updateVisualViewportVars);
    }
  }catch(_){/* ignore */}
  window.addEventListener('resize', updateVisualViewportVars, {passive:true});
  function setModalOpen(isOpen){
    const html = document.documentElement;
    if (isOpen){
      // Close inline helper panels in the header when the modal opens.
      try{ if (typeof setSearchHelpOpen === "function") setSearchHelpOpen(false); }catch(_){/* ignore */}
      try{ if (typeof setFileMoreOpen === "function") setFileMoreOpen(false); }catch(_){/* ignore */}
      _savedScrollY = window.scrollY || html.scrollTop || 0;
      html.classList.add("modalOpen");
      // Freeze the page
      document.body.style.position = "fixed";
      document.body.style.top = `-${_savedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }else{
      html.classList.remove("modalOpen");
      // Unfreeze && restore
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      const y = _savedScrollY || 0;
      _savedScrollY = 0;
      window.scrollTo(0, y);
      // Re-check toolbar compaction after layout changes.
      queueToolbarCompactness();
    }
  }

  function openMenuDialog(){
    // Opening the menu is explicit user intent.
    markUserIntent();
    // Hide any previous cards-view hint when entering the menu.
    hideViewToast();
    // Remember focus to restore after closing the dialog (accessibility)
    try{ _lastFocusedBeforeMenu = document.activeElement; }catch(_){ _lastFocusedBeforeMenu = null; }
    // Rebuild dialog UI so it always reflects the latest quick controls (FAB) + current filter state.
    buildFilterUI();
    // Snapshot current filter state so we can show a calm hint after closing.
    _menuSigOnOpen = filterSignature();
    _menuHadFiltersOnOpen = hasActiveFilters();
    // Live-Apply bookkeeping: fresh session.
    _menuDirty = false;
    if (_liveApplyTimer) { window.clearTimeout(_liveApplyTimer); _liveApplyTimer = 0; }

    // Snapshot current filter state to decide whether we should show a temporary hint after closing.
    _menuSigOnOpen = filterSignature();
    _menuHadFiltersOnOpen = hasActiveFilters();
    // Update viewport vars BEFORE opening so the first paint anchors correctly.
    updateVisualViewportVars();
    setModalOpen(true);
    if (!el.dlg.open) el.dlg.showModal();

    // Move focus into the dialog (close button is a safe, predictable target)
    try{ if (el.menuSearch) el.menuSearch.value = state.q || ""; }catch(_){/* ignore */}


    // Keep search-help panel calm when entering the menu.
    try{ if (typeof setSearchHelpOpen === "function") setSearchHelpOpen(false); }catch(_){/* ignore */}
    // Move focus into the dialog.
    // Mobile/touch: avoid popping the on-screen keyboard by focusing Sortieren.
    // Desktop: focus the mirrored search field for quick typing.
    try{
      const isCoarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      const sortBtn = el.sortFieldRow?.querySelector?.('#sortFieldBtn') || el.sortDirRow?.querySelector?.('#sortDirToggle');
      const target = (isCoarse ? (sortBtn || el.btnClose) : (el.menuSearch || el.btnClose));
      target?.focus?.({preventScroll:true});
    }catch(_){/* ignore */}

    // Force a stable layout pass so the sheet doesn't start "short" on mobile
    // when the browser UI changes the visual viewport.
    const body = el.dlg.querySelector('.sheetBody');
    if (body) body.scrollTop = 0;
    // Double-rAF: allow the browser to settle the visual viewport, then force a reflow.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateVisualViewportVars();
        void el.dlg.offsetHeight;
      });
    });
  }

  // Build the floating quick access UI (FAB) once.
  buildFab();
  // Wire delegated <details> toggle handling once (perf polish).
  wireDetailsToggle();
  // Wire card-mode interactions (Mini/Kompakt/Detail) once.
  wireCardModeInteractions();

  el.btnMenu.addEventListener("click", () => {
    openMenuDialog();
  });
  el.btnClose.addEventListener("click", () => el.dlg.close());

  // Ensure the background lock always resets (button, ESC, backdrop click, etc.).
  el.dlg.addEventListener("close", () => {
    // Ensure the latest changes are applied even when the user closes via ✕ / backdrop / ESC.
    if (_liveApplyTimer) { window.clearTimeout(_liveApplyTimer); _liveApplyTimer = 0; }
    if (_menuDirty && state.rows && state.rows.length){
      try{ applyAndRender(); }catch(_){/* ignore */}
    }
    _menuDirty = false;
    setModalOpen(false);
    // Closing the menu is explicit user intent.
    markUserIntent();
    // Ensure search-help panel closes when leaving the menu.
    try{ if (typeof setSearchHelpOpen === "function") setSearchHelpOpen(false); }catch(_){/* ignore */}
    updateQuickFilterIndicator();
    // Returning to the cards view: short attention pulse on the Schnellmenü-FAB (only when filters are active).
    // Returning to the cards view: schedule a calm attention pulse (2s after entry).
    scheduleEnterCardsPulse();
    // Restore focus to the element that opened the dialog (usually the menu button)
    const prev = _lastFocusedBeforeMenu;
    _lastFocusedBeforeMenu = null;
    try{ prev?.focus?.({preventScroll:true}); }catch(_){/* ignore */}
  });

  // Build C: Menu interactions count as "awareness" (for the reminder logic).
  // We intentionally DO NOT treat scrolling/reading the cards as interaction.
  el.dlg.addEventListener("click", (e) => {
    // Clicks inside an open dialog are intent by definition.
    if (!el.dlg.open) return;
    markUserIntent();
  }, {capture:true});

  el.dlg.addEventListener("input", (e) => {
    if (!el.dlg.open) return;
    markUserIntent();
  }, {capture:true});

  // Start the reminder loop once. It self-gates (active filters/search + cards view + menu closed).
  startReminderLoop();
  // On ESC: close an open desktop dropdown first; only then allow the dialog to close.
  el.dlg.addEventListener("cancel", (e) => {
    try{
      if (typeof __closeDesktopPanel === 'function' && typeof __openDesktopPanel !== 'undefined' && __openDesktopPanel){
        e.preventDefault();
        __closeDesktopPanel();
        return;
      }
    }catch(_){/* ignore */}
    setModalOpen(false);
  });

  // Simple focus trap inside the dialog (desktop/tablet). Keeps TAB navigation inside the sheet.
  el.dlg.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const sheet = el.dlg.querySelector(".sheet");
    if (!sheet) return;
    const focusables = Array.from(sheet.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(n => !n.disabled && n.getAttribute('aria-hidden') !== 'true' && n.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey){
      if (active === first || !sheet.contains(active)){
        e.preventDefault();
        try{ last.focus(); }catch(_){/* ignore */}
      }
    }else{
      if (active === last){
        e.preventDefault();
        try{ first.focus(); }catch(_){/* ignore */}
      }
    }
  });

  el.btnApply.addEventListener("click", () => {
    el.dlg.close();
  });

  el.btnClear.addEventListener("click", () => {
    state.filters.fav = false;
    state.filters.genres.clear();
    state.filters.platforms.clear();
    state.filters.sources.clear();
    state.filters.availability.clear();
    state.filters.trophies.clear();
    state.filters.trophyPreset = "";
    state.filters.shortMain5 = false;

    setSearchQuery("", "clear");
    state.sortField = "ID";
    state.sortDir = "asc";
    saveSortPrefs();

    buildFilterUI();
    updateFabSortFieldUI();
    updateFabSortUI();
    scheduleLiveApply();
  });

  // Chips/Dropdowns wirken live; buildFilterUI() verdrahtet die onChip-Handler.

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

  // Init XLSX status
  pill("bereit", "pill-ok");

  // Guard: show warning if xlsx lib missing after load
  window.addEventListener("load", () => {
    if (typeof XLSX === "undefined"){
      pill("xlsx.full.min.js fehlt", "pill-bad");
    }
    document.title = `Spieleliste – Build ${BUILD}`;
  });
})();