/* apex-tracker-tiles.js
   Clean tile renderer for the Tracker. Replaces the built-in cycle-card
   render with mobile-first tiles that show:
   - Cycle progress (Day X of Y, % bar)
   - Days remaining in cycle
   - Vial freshness countdown (reconstitution shelf life)
   - Next reconstitution date
   - Concentration (mg/mL from recon data)
   - Quick "Log today's dose" tap
*/
(function () {
  'use strict';

  const SHELF_LIFE_DAYS = 30; // Standard fridge shelf life after reconstitution
  const CSS = `
  #apex-tile-overlay { padding: 18px 16px 30px; position: relative; z-index: 4; display: block !important; visibility: visible !important; max-width: 1160px; margin: 0 auto; }
  .apex-tile-grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { .apex-tile-grid { grid-template-columns: 1fr; gap: 12px; } }
  .apex-tile {
    background: #0d1318;
    border: 1px solid #1a2d3a;
    border-radius: 14px;
    padding: 18px;
    position: relative;
    transition: border-color .15s, box-shadow .15s;
  }
  .apex-tile:hover { border-color: rgba(0,255,157,.4); box-shadow: 0 8px 28px rgba(0,255,157,.1); }
  .at-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
  .at-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; color: #fff; line-height: 1.05; letter-spacing: -.3px; }
  .at-mech { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: .18em; color: #7a8d99; text-transform: uppercase; margin-top: 3px; }
  .at-status {
    font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: .18em; font-weight: 700;
    padding: 4px 10px; border-radius: 4px; text-transform: uppercase; flex-shrink: 0;
  }
  .at-status.active { background: rgba(0,255,157,.12); color: #00ff9d; border: 1px solid rgba(0,255,157,.4); }
  .at-status.fresh { background: rgba(0,212,255,.12); color: #00d4ff; border: 1px solid rgba(0,212,255,.4); }
  .at-status.warn  { background: rgba(251,191,36,.12); color: #fbbf24; border: 1px solid rgba(251,191,36,.4); }
  .at-status.bad   { background: rgba(239,68,68,.12);  color: #ef4444; border: 1px solid rgba(239,68,68,.4); }

  .at-progress { margin-bottom: 14px; }
  .at-progress-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .at-progress-day {
    font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 22px; color: #fff;
    line-height: 1; letter-spacing: -.3px;
  }
  .at-progress-day .pd-of { font-size: 14px; color: #7a8d99; font-weight: 500; margin-left: 4px; }
  .at-progress-pct { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #00ff9d; font-weight: 700; letter-spacing: .1em; }
  .at-bar { height: 8px; background: rgba(148,163,184,.15); border-radius: 4px; overflow: hidden; }
  .at-bar-fill { height: 100%; background: linear-gradient(90deg, #00ff9d, #00d4ff); border-radius: 4px; transition: width .4s cubic-bezier(.2,.8,.2,1); }
  .at-progress-meta { font-size: 12px; color: #cbd5e1; margin-top: 6px; }
  .at-progress-meta strong { color: #fff; font-weight: 700; }

  .at-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .at-stat {
    background: rgba(8,12,16,.5); border: 1px solid #1a2d3a; border-radius: 8px; padding: 10px 12px;
  }
  .at-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: .18em; color: #7a8d99; text-transform: uppercase; margin-bottom: 4px; }
  .at-stat-value { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; color: #fff; line-height: 1.1; }
  .at-stat-value .vu { font-size: 11px; color: #7a8d99; font-weight: 500; margin-left: 3px; }
  .at-stat-value.warn { color: #fbbf24; }
  .at-stat-value.bad  { color: #ef4444; }

  .at-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .at-btn {
    flex: 1; min-width: 110px;
    font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .08em;
    text-transform: uppercase; padding: 10px 14px; border-radius: 8px; cursor: pointer;
    border: 1px solid #1a2d3a; background: transparent; color: #cbd5e1;
    transition: all .15s; -webkit-tap-highlight-color: transparent;
  }
  .at-btn:hover, .at-btn:active { border-color: #00ff9d; color: #00ff9d; }
  .at-btn.primary {
    background: linear-gradient(135deg, #00ff9d, #10b981); color: #080c10; border: 0;
    box-shadow: 0 4px 14px rgba(0,255,157,.35);
  }
  .at-btn.primary.done { background: rgba(0,255,157,.15); color: #00ff9d; box-shadow: none; border: 1px solid rgba(0,255,157,.5); }

  .apex-tiles-empty {
    text-align: center; padding: 60px 24px; margin: 20px 16px;
    background: linear-gradient(180deg, rgba(0,255,157,.04), rgba(0,212,255,.02));
    border: 1px dashed rgba(0,255,157,.3); border-radius: 16px;
  }
  .apex-tiles-empty .ate-icon { font-size: 64px; margin-bottom: 16px; filter: drop-shadow(0 4px 14px rgba(0,255,157,.3)); }
  .apex-tiles-empty .ate-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 26px; color: #fff; margin-bottom: 10px; letter-spacing: -.3px; }
  .apex-tiles-empty .ate-sub { font-size: 14px; color: #cbd5e1; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.5; }
  .apex-tiles-empty .ate-btn {
    display: inline-flex; align-items: center; gap: 12px; padding: 18px 38px;
    background: linear-gradient(135deg, #00ff9d, #10b981); color: #080c10;
    font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 800; letter-spacing: .1em;
    text-transform: uppercase; text-decoration: none; border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0,255,157,.4);
    animation: atePulse 2.4s ease-in-out infinite;
  }
  @keyframes atePulse { 0%,100%{transform:translateY(0);box-shadow:0 8px 28px rgba(0,255,157,.4);} 50%{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,255,157,.6);} }

  /* Hide the tracker's built-in cycle-grid + counter when overlay is active */
  body[data-apex-tiles-active="1"] #active-grid,
  body[data-apex-tiles-active="1"] .sec-header,
  body[data-apex-tiles-active="1"] #apex-empty-cta { display: none !important; }

  /* 52-WEEK TIMELINE */
  .apex-timeline {
    margin-top: 28px; padding: 22px 20px 24px;
    background: linear-gradient(180deg, rgba(167,139,250,.06), rgba(0,212,255,.03));
    border: 1px solid rgba(167,139,250,.3); border-radius: 14px;
  }
  .atl-head { margin-bottom: 18px; }
  .atl-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: .25em; color: #a78bfa; text-transform: uppercase; margin-bottom: 5px; font-weight: 700; }
  .atl-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 22px; color: #fff; letter-spacing: -.3px; line-height: 1.1; margin-bottom: 4px; }
  .atl-sub { font-size: 13px; color: #cbd5e1; line-height: 1.45; }

  .atl-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .atl-grid { min-width: 760px; }
  .atl-row { display: grid; grid-template-columns: 130px 1fr; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid rgba(148,163,184,.08); }
  .atl-row:last-child { border-bottom: 0; }
  .atl-row.atl-month-row { padding: 4px 0 8px; border-bottom: 1px solid rgba(167,139,250,.25); }
  .atl-name-cell { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: #fff; line-height: 1.1; padding-right: 6px; }
  .atl-bars { position: relative; height: 26px; background: rgba(8,12,16,.4); border-radius: 4px; overflow: hidden; }
  .atl-month-row .atl-bars { background: transparent; height: 18px; }
  .atl-month {
    position: absolute; top: 0; transform: translateX(-50%);
    font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: .12em;
    color: #7a8d99; text-transform: uppercase;
  }

  .atl-seg {
    position: absolute; top: 3px; bottom: 3px;
    background: linear-gradient(135deg, #00ff9d, #10b981);
    border-radius: 3px;
    display: flex; align-items: center; padding: 0 6px;
    overflow: hidden; cursor: default;
    transition: filter .15s;
  }
  .atl-seg:hover { filter: brightness(1.15); }
  .atl-seg-label {
    font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: .08em;
    color: #080c10; font-weight: 700; white-space: nowrap; text-transform: uppercase;
  }

  /* Titration phase colors — cycle through 6 shades */
  .atl-seg.titration.phase-0 { background: linear-gradient(135deg, #00ff9d, #10b981); }
  .atl-seg.titration.phase-1 { background: linear-gradient(135deg, #5eead4, #14b8a6); }
  .atl-seg.titration.phase-2 { background: linear-gradient(135deg, #67e8f9, #06b6d4); }
  .atl-seg.titration.phase-3 { background: linear-gradient(135deg, #93c5fd, #3b82f6); }
  .atl-seg.titration.phase-4 { background: linear-gradient(135deg, #c4b5fd, #8b5cf6); }
  .atl-seg.titration.phase-5 { background: linear-gradient(135deg, #f0abfc, #c026d3); }

  .atl-seg.atl-off {
    background: repeating-linear-gradient(45deg, rgba(148,163,184,.12), rgba(148,163,184,.12) 4px, rgba(148,163,184,.04) 4px, rgba(148,163,184,.04) 8px);
    border: 1px solid rgba(148,163,184,.2);
  }
  .atl-seg.atl-off .atl-seg-label { color: #7a8d99; }

  .atl-today {
    position: absolute; top: -2px; bottom: -22px;
    width: 2px; background: #fbbf24;
    box-shadow: 0 0 8px rgba(251,191,36,.6);
    z-index: 5;
  }
  .atl-today::before {
    content: 'NOW'; position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
    font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: .14em;
    color: #fbbf24; font-weight: 700;
  }

  @media (max-width: 640px) {
    .apex-timeline { margin-top: 20px; padding: 18px 14px 20px; }
    .atl-title { font-size: 18px; }
    .atl-row { grid-template-columns: 90px 1fr; gap: 8px; }
    .atl-name-cell { font-size: 11px; }
    .atl-grid { min-width: 600px; }
    .atl-seg-label { font-size: 8px; }
  }
  `;

  function injectCSS() {
    if (document.getElementById('apex-tile-css')) return;
    const s = document.createElement('style');
    s.id = 'apex-tile-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function daysBetween(a, b) {
    return Math.floor((b.getTime() - a.getTime()) / 86400000);
  }
  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function getRecon() {
    try { return JSON.parse(localStorage.getItem('apex_recon')) || {}; } catch (e) { return {}; }
  }
  function getDailyLog() {
    try { return JSON.parse(localStorage.getItem('apex_daily_log')) || {}; } catch (e) { return {}; }
  }
  function setDailyLog(log) {
    try { localStorage.setItem('apex_daily_log', JSON.stringify(log)); } catch (e) {}
  }

  function renderTile(p, recon) {
    const today = new Date();
    const start = p.startDate ? new Date(p.startDate) : today;
    const cycleWks = typeof p.cycleWeeks === 'number' ? p.cycleWeeks : (typeof p.cycleWks === 'number' ? p.cycleWks : 8);
    const cycleDays = cycleWks * 7;
    const dayNum = Math.max(1, Math.min(cycleDays, daysBetween(start, today) + 1));
    const daysLeft = Math.max(0, cycleDays - dayNum);
    const pct = Math.round((dayNum / cycleDays) * 100);

    // Vial freshness — assume reconstitution happened on cycle start unless tracked separately
    const reconDate = start;
    const daysSinceMix = daysBetween(reconDate, today);
    const vialDaysLeft = Math.max(0, SHELF_LIFE_DAYS - daysSinceMix);
    const nextMixDate = new Date(reconDate);
    nextMixDate.setDate(nextMixDate.getDate() + SHELF_LIFE_DAYS);

    let vialClass = '';
    let vialStatus = 'fresh';
    if (vialDaysLeft <= 3) { vialClass = 'bad'; vialStatus = 'bad'; }
    else if (vialDaysLeft <= 7) { vialClass = 'warn'; vialStatus = 'warn'; }

    const reconKey = (p.slug || '').replace(/^\.\//, '');
    const reconInfo = recon[reconKey] || {};
    const total = (reconInfo.bac || 3) + (reconInfo.acetic || 0);
    const concentration = (reconInfo.vial && total > 0) ? (reconInfo.vial / total).toFixed(2) : null;

    // Today's log status
    const dailyLog = getDailyLog();
    const todayDoses = dailyLog[todayKey()] || {};
    const isLoggedToday = !!todayDoses[p.id];

    const statusLabel = daysLeft === 0 ? 'Cycle Done' : 'Active';
    const statusClass = daysLeft === 0 ? 'warn' : 'active';

    const tile = document.createElement('div');
    tile.className = 'apex-tile';
    tile.dataset.id = p.id;
    tile.innerHTML = `
      <div class="at-head">
        <div>
          <div class="at-name">${p.name || 'Peptide'}</div>
          <div class="at-mech">${p.mech || ''}</div>
        </div>
        <div class="at-status ${statusClass}">● ${statusLabel}</div>
      </div>

      <div class="at-progress">
        <div class="at-progress-row">
          <div class="at-progress-day">Day ${dayNum}<span class="pd-of">/ ${cycleDays}</span></div>
          <div class="at-progress-pct">${pct}%</div>
        </div>
        <div class="at-bar"><div class="at-bar-fill" style="width:${pct}%"></div></div>
        <div class="at-progress-meta"><strong>${daysLeft}</strong> day${daysLeft===1?'':'s'} left in cycle · ends ${fmtDate(new Date(start.getTime() + cycleDays*86400000))}</div>
      </div>

      <div class="at-grid">
        <div class="at-stat">
          <div class="at-stat-label">Vial good for</div>
          <div class="at-stat-value ${vialClass}">${vialDaysLeft} <span class="vu">days</span></div>
        </div>
        <div class="at-stat">
          <div class="at-stat-label">Next mix</div>
          <div class="at-stat-value ${vialClass}">${fmtDate(nextMixDate)}</div>
        </div>
        <div class="at-stat">
          <div class="at-stat-label">Dose</div>
          <div class="at-stat-value">${p.dose || '—'}</div>
        </div>
        <div class="at-stat">
          <div class="at-stat-label">${concentration ? 'Concentration' : 'Frequency'}</div>
          <div class="at-stat-value">${concentration ? concentration + ' <span class="vu">mg/mL</span>' : (p.freq || 'daily')}</div>
        </div>
      </div>

      <div class="at-actions">
        <button class="at-btn primary ${isLoggedToday ? 'done' : ''}" data-action="log">${isLoggedToday ? '✓ Logged Today' : "Log Today's Dose"}</button>
        <button class="at-btn" data-action="end">End Cycle</button>
      </div>
    `;

    // Wire actions
    tile.querySelector('[data-action="log"]').addEventListener('click', function () {
      const log = getDailyLog();
      const key = todayKey();
      log[key] = log[key] || {};
      if (log[key][p.id]) {
        delete log[key][p.id];
      } else {
        log[key][p.id] = new Date().toISOString();
        try { if (navigator.vibrate) navigator.vibrate(20); } catch (_) {}
      }
      setDailyLog(log);
      render();
    });
    tile.querySelector('[data-action="end"]').addEventListener('click', function () {
      if (!confirm('End the cycle for ' + p.name + '?')) return;
      try {
        const state = JSON.parse(localStorage.getItem('apex_state') || '{}');
        const idx = (state.protocols || []).findIndex(x => x.id === p.id);
        if (idx >= 0) {
          state.protocols[idx].status = 'completed';
          state.protocols[idx].endedAt = new Date().toISOString();
          localStorage.setItem('apex_state', JSON.stringify(state));
        }
      } catch (e) {}
      render();
    });

    return tile;
  }

  function ensureContainer() {
    let host = document.getElementById('apex-tile-overlay');
    if (host && host.isConnected) return host;
    // If host got detached by a re-render, recreate it
    if (host) try { host.remove(); } catch(_){}

    host = document.createElement('div');
    host.id = 'apex-tile-overlay';
    host.innerHTML = '<div class="apex-tile-grid"></div>';

    // Try anchors in order of preference. If all fail → append to body directly.
    const tryAnchors = [
      () => document.getElementById('apex-today-checklist'),
      () => document.getElementById('active-grid'),
      () => document.querySelector('.main'),
      () => document.querySelector('main'),
      () => document.querySelector('.wrap'),
      () => document.querySelector('body > div')
    ];
    for (let i = 0; i < tryAnchors.length; i++) {
      const anchor = tryAnchors[i]();
      if (anchor && anchor.parentNode) {
        try {
          anchor.parentNode.insertBefore(host, anchor);
          console.log('[apex-tiles] inserted before', anchor.id || anchor.className || anchor.tagName);
          return host;
        } catch(e){ console.warn('[apex-tiles] insert failed at anchor', i, e); }
      }
    }
    // Last resort: append to body
    try {
      document.body.appendChild(host);
      console.log('[apex-tiles] appended to body (fallback)');
    } catch(e){ console.error('[apex-tiles] body append failed', e); }
    return host;
  }

  function processPendingImport(){
    // Defensive: if user landed via ?import=pending and the inline tracker
    // import script didn't fire (cache, race, whatever), do it ourselves.
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('import') !== 'pending') return;
      const raw = localStorage.getItem('apex_pending_protocols');
      if (!raw) return;
      const incoming = JSON.parse(raw);
      if (!Array.isArray(incoming) || !incoming.length) return;

      const stateRaw = localStorage.getItem('apex_state') || '{}';
      const state = JSON.parse(stateRaw);
      state.protocols = state.protocols || [];

      const today = new Date().toISOString().slice(0,10);
      let added = 0;
      incoming.forEach(p => {
        const dup = state.protocols.find(x => x.slug === p.slug && (x.status||'active')==='active' && !x.isDemoSeed);
        if (dup) return;
        state.protocols.push({
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
          slug: p.slug,
          name: p.name,
          mech: p.mech,
          dose: p.dose,
          freq: p.freq,
          cycleWeeks: typeof p.cycleWks === 'number' ? p.cycleWks : 8,
          cycleWks: p.cycleWks,
          titration: p.titration || null,
          status: 'active',
          startDate: p.startDate || today,
          createdAt: new Date().toISOString(),
          isDemoSeed: false,
          dailyLog: []
        });
        added++;
      });

      if (added > 0) {
        localStorage.setItem('apex_state', JSON.stringify(state));
      }
      localStorage.removeItem('apex_pending_protocols');
      const url = new URL(location.href);
      url.searchParams.delete('import');
      history.replaceState({}, '', url.toString());
    } catch(e){ console.warn('[apex-tiles] import fallback failed:', e); }
  }

  function purgeDemoSeeds(){
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('demo') === '1') return;
      const raw = localStorage.getItem('apex_state');
      if (!raw) return;
      const state = JSON.parse(raw);
      if (!state.protocols) return;
      const real = state.protocols.filter(p => !p.isDemoSeed);
      if (real.length !== state.protocols.length) {
        state.protocols = real;
        localStorage.setItem('apex_state', JSON.stringify(state));
      }
    } catch(e){}
  }

  function render() {
    injectCSS();
    let state = {};
    try { state = JSON.parse(localStorage.getItem('apex_state') || '{}'); } catch (e) {}
    const protocols = (state.protocols || []).filter(p => (p.status || 'active') === 'active' && !p.isDemoSeed);

    const host = ensureContainer();
    const grid = host.querySelector('.apex-tile-grid');
    grid.innerHTML = '';

    if (protocols.length === 0) {
      // Replace grid with empty CTA
      host.innerHTML = `
        <div class="apex-tiles-empty">
          <div class="ate-icon">🧪</div>
          <div class="ate-title">Build your first protocol</div>
          <div class="ate-sub">Pick your peptides, mix them, set your titration. We'll handle the math. Takes about 90 seconds.</div>
          <a href="research-hub.html" class="ate-btn">＋ Add Protocol →</a>
        </div>`;
      document.body.setAttribute('data-apex-tiles-active', '1');
      updateCounter(0, 0);
      return;
    }

    document.body.setAttribute('data-apex-tiles-active', '1');
    const recon = getRecon();
    protocols.forEach(p => grid.appendChild(renderTile(p, recon)));

    // 52-WEEK TIMELINE
    renderTimeline(host, protocols);

    // Update header counter to match reality
    const dailyLog = getDailyLog();
    const todayDoses = dailyLog[todayKey()] || {};
    const dueToday = protocols.filter(p => !todayDoses[p.id]).length;
    updateCounter(protocols.length, dueToday);
  }

  function renderTimeline(host, protocols){
    let tl = host.querySelector('.apex-timeline');
    if (tl) tl.remove();
    if (!protocols.length) return;

    tl = document.createElement('div');
    tl.className = 'apex-timeline';

    // Find earliest start so we can anchor week 1 to the earliest cycle
    const today = new Date();
    const allStarts = protocols.map(p => p.startDate ? new Date(p.startDate) : today);
    const earliest = allStarts.reduce((a,b) => a < b ? a : b, today);
    // Show 52 weeks from the earliest start
    const totalWeeks = 52;

    // Build header row of week labels
    const monthsRow = [];
    for (let w = 0; w < totalWeeks; w += 4) {
      const d = new Date(earliest);
      d.setDate(d.getDate() + w*7);
      monthsRow.push({ week: w, label: d.toLocaleDateString(undefined, { month:'short' }) });
    }

    let html = `
      <div class="atl-head">
        <div class="atl-eyebrow">📅 52-Week View</div>
        <div class="atl-title">Your stack across the next year</div>
        <div class="atl-sub">Cycles, off-periods, and titration phases for every peptide.</div>
      </div>
      <div class="atl-scroll">
        <div class="atl-grid">
          <div class="atl-row atl-month-row">
            <div class="atl-name-cell"></div>
            <div class="atl-bars">
              ${monthsRow.map(m => `<div class="atl-month" style="left:${(m.week/totalWeeks)*100}%">${m.label}</div>`).join('')}
              <div class="atl-today" style="left:${Math.max(0, Math.min(100, (daysBetween(earliest, today)/(totalWeeks*7))*100))}%"></div>
            </div>
          </div>
          ${protocols.map(p => renderTimelineRow(p, earliest, totalWeeks)).join('')}
        </div>
      </div>
    `;
    tl.innerHTML = html;
    host.appendChild(tl);
  }

  function renderTimelineRow(p, anchor, totalWeeks){
    const start = p.startDate ? new Date(p.startDate) : new Date();
    const cycleWks = typeof p.cycleWeeks === 'number' ? p.cycleWeeks : (typeof p.cycleWks === 'number' ? p.cycleWks : 8);
    const startWeek = daysBetween(anchor, start) / 7;
    const endWeek = startWeek + cycleWks;

    // Build segments. If titration exists, color-code phases.
    let segments = [];
    if (p.titration && Array.isArray(p.titration) && p.titration.length > 1) {
      // Spread cycle evenly across titration phases
      const phaseLen = cycleWks / p.titration.length;
      p.titration.forEach((t, i) => {
        const segStart = startWeek + (i * phaseLen);
        const segEnd = segStart + phaseLen;
        segments.push({
          start: segStart,
          end: segEnd,
          label: t.d,
          phase: i+1,
          phaseTotal: p.titration.length
        });
      });
    } else {
      segments.push({ start: startWeek, end: endWeek, label: p.dose || 'active', phase: 1, phaseTotal: 1 });
    }

    // Off-period after the cycle ends (8 weeks) for visual continuity
    const offEnd = Math.min(totalWeeks, endWeek + 8);
    const showOff = endWeek < totalWeeks;

    const segHtml = segments.map(s => {
      const left = Math.max(0, (s.start / totalWeeks) * 100);
      const width = Math.max(0.5, ((Math.min(s.end, totalWeeks) - Math.max(s.start, 0)) / totalWeeks) * 100);
      if (s.start >= totalWeeks || s.end <= 0) return '';
      const cls = s.phaseTotal > 1 ? 'atl-seg titration phase-' + ((s.phase-1) % 6) : 'atl-seg';
      return `<div class="${cls}" style="left:${left}%;width:${width}%" title="${s.label}">
        <span class="atl-seg-label">${s.label}</span>
      </div>`;
    }).join('');

    const offHtml = showOff ? `
      <div class="atl-seg atl-off" style="left:${(endWeek/totalWeeks)*100}%;width:${((offEnd-endWeek)/totalWeeks)*100}%">
        <span class="atl-seg-label">off</span>
      </div>
    ` : '';

    return `
      <div class="atl-row">
        <div class="atl-name-cell">${p.name || 'Peptide'}</div>
        <div class="atl-bars">
          ${segHtml}
          ${offHtml}
        </div>
      </div>
    `;
  }

  function updateCounter(active, due) {
    const candidates = document.querySelectorAll('*');
    candidates.forEach(el => {
      const t = (el.childNodes && el.childNodes.length === 1 && el.firstChild.nodeType === 3) ? el.textContent.trim() : '';
      if (/^\d+\s+ACTIVE\s+PROTOCOLS?\s+[—\-·]\s+\d+\s+DUE\s+TODAY$/i.test(t)) {
        el.textContent = active + ' active protocol' + (active===1?'':'s') + ' — ' + due + ' due today';
      }
    });
  }

  function init() {
    console.log('[apex-tiles] init at', new Date().toISOString());
    purgeDemoSeeds();
    processPendingImport();
    let state = {};
    try { state = JSON.parse(localStorage.getItem('apex_state') || '{}'); } catch(e){}
    console.log('[apex-tiles] state.protocols:', (state.protocols||[]).length, 'entries');
    console.log('[apex-tiles] active non-demo:', (state.protocols||[]).filter(p => (p.status||'active')==='active' && !p.isDemoSeed).length);
    render();
    // Aggressive re-render in case the tracker's existing JS clobbers our overlay
    [50, 200, 600, 1500, 3000, 6000].forEach(d => setTimeout(render, d));
    window.addEventListener('storage', e => { if (e.key === 'apex_state' || e.key === 'apex_daily_log') render(); });

    // Also re-render whenever the document body mutates significantly
    try {
      const bodyObs = new MutationObserver(() => {
        const host = document.getElementById('apex-tile-overlay');
        if (!host || !host.isConnected) render();
      });
      bodyObs.observe(document.body, { childList: true, subtree: false });
    } catch(_){}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
