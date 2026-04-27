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
  #apex-tile-overlay { padding: 18px 16px 30px; position: relative; z-index: 4; }
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
        <button class="at-btn primary ${isLoggedToday ? 'done' : ''}" data-action="log">${isLoggedToday ? '✓ Logged Today' : 'Log Today\\'s Dose'}</button>
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
    if (host) return host;

    host = document.createElement('div');
    host.id = 'apex-tile-overlay';
    host.innerHTML = '<div class="apex-tile-grid"></div>';

    const grid = document.getElementById('active-grid');
    const checklist = document.getElementById('apex-today-checklist');
    // Tiles go ABOVE the daily checklist if it exists, else above the grid
    const anchor = checklist || grid;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(host, anchor);
    } else {
      const main = document.querySelector('main, .main, body');
      (main || document.body).appendChild(host);
    }
    return host;
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

    // Update header counter to match reality
    const dailyLog = getDailyLog();
    const todayDoses = dailyLog[todayKey()] || {};
    const dueToday = protocols.filter(p => !todayDoses[p.id]).length;
    updateCounter(protocols.length, dueToday);
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
    render();
    setTimeout(render, 300);
    setTimeout(render, 1200);
    window.addEventListener('storage', e => { if (e.key === 'apex_state' || e.key === 'apex_daily_log') render(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
