/* ═════════════════════════════════════════════════════════════
   APEX QUICK ADD — Cmd+K command bar + floating "⚡ Quick" pill
   Advanced users skip the goal/category tile flow entirely.
   Type-to-search peptide picker → Enter → dose dial pre-filled.
   Only renders on the tracker page.
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexQuickAddLoaded) return;
  window._apexQuickAddLoaded = true;

  const path = (location.pathname || '').toLowerCase();
  if (!/protocol-tracker\.html/.test(path)) return;

  // ── Peptide search index — flat list with keywords ──
  const PEPTIDES = [
    { v: 'Retatrutide',       k: 'reta retatrutide glp glp-1 glp-3 fat loss weight' },
    { v: 'Tirzepatide',       k: 'tirz tirzepatide mounjaro zepbound glp gip fat loss' },
    { v: 'Semaglutide',       k: 'sema semaglutide ozempic wegovy glp fat loss' },
    { v: 'BPC-157',           k: 'bpc bpc-157 healing repair gut tissue' },
    { v: 'TB-500',            k: 'tb tb500 thymosin beta-4 systemic recovery' },
    { v: 'Ipamorelin',        k: 'ipa ipamorelin gh growth hormone ghrelin' },
    { v: 'CJC-1295 No DAC',   k: 'cjc cjc-1295 no dac ghrh growth hormone' },
    { v: 'CJC-1295 DAC',      k: 'cjc cjc-1295 dac long acting weekly gh' },
    { v: 'CJC + Ipa Blend',   k: 'blend cjc ipa combined gh growth hormone' },
    { v: 'Sermorelin',        k: 'sermorelin ghrh gh older user starter' },
    { v: 'Tesamorelin',       k: 'tesamorelin tese visceral fat ghrh' },
    { v: 'IGF-1 LR3',         k: 'igf igf-1 lr3 igf1 hypertrophy growth' },
    { v: 'GHK-Cu',            k: 'ghk ghk-cu copper peptide collagen skin hair' },
    { v: 'KPV',               k: 'kpv anti inflammatory gut alpha-msh' },
    { v: 'AOD-9604',          k: 'aod aod9604 fat loss gh fragment lipolysis' },
    { v: '5-Amino-1MQ',       k: '5amino1mq nnmt oral fat loss capsule' },
    { v: 'L-Carnitine',       k: 'carnitine l-carnitine fat transport metabolism' },
    { v: 'SLU-PP-332',        k: 'slu slu-pp-332 err exercise mimetic oral' },
    { v: 'Epitalon',          k: 'epitalon epithalon telomere pineal longevity' },
    { v: 'Cartalax',          k: 'cartalax cartilage bioregulator joint' },
    { v: 'NAD+',              k: 'nad nad+ nicotinamide energy sirtuins longevity' },
    { v: 'MOTS-c',            k: 'mots motsc mitokine ampk metabolic mitochondrial' },
    { v: 'SS-31',             k: 'ss-31 ss31 mitochondrial cardiolipin elamipretide' },
    { v: 'FOX04-DRI',         k: 'fox04 fox04-dri foxo4 senolytic senescent' },
    { v: 'Glutathione',       k: 'glutathione gsh antioxidant detox liver' },
    { v: 'Selank',            k: 'selank anxiolytic anxiety nasal nootropic' },
    { v: 'Semax',             k: 'semax bdnf focus cognitive nasal nootropic' },
    { v: 'Dihexa',            k: 'dihexa angiotensin neuroplasticity research' },
    { v: 'PE-22-28',          k: 'pe-22-28 pe2228 trek-1 mood depression research' },
    { v: 'DSIP',              k: 'dsip delta sleep inducing peptide deep sleep' },
    { v: 'PT-141',            k: 'pt-141 pt141 bremelanotide libido melanocortin' },
    { v: 'Melanotan I',       k: 'melanotan i melanotan-i tan tanning pigmentation' },
    { v: 'Melanotan II',      k: 'melanotan ii melanotan-ii mt2 tan libido' },
    { v: 'Thymosin Alpha-1',  k: 'thymosin alpha-1 immune t-cell foundational' },
    { v: 'LL-37',             k: 'll-37 ll37 cathelicidin antimicrobial biofilm' },
    { v: 'ARA-290',           k: 'ara-290 ara290 epo nerve repair neuropathy' },
    { v: 'L-Glutamine',       k: 'glutamine l-glutamine gut barrier amino oral' },
    { v: 'Test Cypionate 200',k: 'test testosterone cypionate trt 200' },
    { v: 'Test Cypionate 250',k: 'test testosterone cypionate trt 250 compounded' },
    { v: 'Test Cypionate 100',k: 'test testosterone cypionate trt 100 microdose' },
    { v: 'Test Enanthate 250',k: 'test testosterone enanthate trt 250 long acting' },
    { v: 'Test Cream 200',    k: 'test testosterone cream topical trt' },
    { v: 'Wolverine Stack',   k: 'wolverine stack bpc tb500 recovery' },
    { v: 'GLOW Stack',        k: 'glow stack ghk-cu skin hair beauty' },
    { v: 'KLOW Stack',        k: 'klow stack kpv tb500 bpc ghk-cu max heal' },
  ];

  // ── Floating pill (mobile + desktop) ──
  function injectPill() {
    if (document.getElementById('apex-quickadd-pill')) return;
    // Only show pill for advanced users — beginners + intermediate use the tile picker
    const level = (typeof window.apexLevel === 'function') ? window.apexLevel() : '';
    if (level && level !== 'advanced') return;

    const pill = document.createElement('button');
    pill.id = 'apex-quickadd-pill';
    pill.title = 'Quick add (Cmd+K)';
    pill.setAttribute('aria-label', 'Quick add peptide — keyboard shortcut Cmd K');
    pill.innerHTML = '⚡ <span style="margin-left:4px;">Quick</span> <kbd style="margin-left:8px;background:rgba(0,0,0,.3);border-radius:3px;padding:2px 6px;font-size:9px;font-family:monospace;">⌘K</kbd>';
    pill.style.cssText = 'position:fixed;top:max(env(safe-area-inset-top,0),12px);right:14px;z-index:9994;display:inline-flex;align-items:center;gap:0;padding:8px 12px;background:rgba(13,19,24,.92);color:#00ff9d;border:1px solid rgba(0,255,157,.4);border-radius:20px;font-family:"Share Tech Mono",monospace;font-size:11px;font-weight:700;letter-spacing:.1em;cursor:pointer;backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.4);text-transform:uppercase;-webkit-tap-highlight-color:transparent;min-height:36px;';
    pill.onclick = openQuickAdd;
    document.body.appendChild(pill);
    // Show kbd hint only on desktop
    if (window.innerWidth < 640) {
      const k = pill.querySelector('kbd');
      if (k) k.style.display = 'none';
    }
  }

  // ── Modal ──
  function openQuickAdd() {
    if (document.getElementById('apex-quickadd-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-quickadd-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.88);z-index:99995;display:flex;align-items:flex-start;justify-content:center;padding:80px 16px 20px;font-family:"Barlow",sans-serif;animation:apexQuickFade .18s ease-out;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = ''+
      '<style>@keyframes apexQuickFade{from{opacity:0;}to{opacity:1;}}</style>'+
      '<div style="background:#0d1318;border:1px solid rgba(0,255,157,.3);border-radius:12px;max-width:560px;width:100%;max-height:70vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.55);">'+
        '<div style="padding:14px 18px;border-bottom:1px solid rgba(148,163,184,.15);display:flex;align-items:center;gap:10px;">'+
          '<span style="font-size:18px;">⚡</span>'+
          '<input id="apex-quickadd-input" type="text" placeholder="Type a peptide name…" autocomplete="off" autocorrect="off" spellcheck="false" style="flex:1;background:transparent;border:0;color:#fff;font-family:inherit;font-size:16px;outline:none;padding:6px 0;">'+
          '<button onclick="document.getElementById(\'apex-quickadd-overlay\').remove()" aria-label="Close" style="background:transparent;border:0;color:#94a3b8;font-size:18px;cursor:pointer;padding:4px 10px;min-height:36px;min-width:36px;">✕</button>'+
        '</div>'+
        '<div id="apex-quickadd-results" style="flex:1;overflow-y:auto;padding:8px 0;"></div>'+
        '<div style="padding:8px 18px;border-top:1px solid rgba(148,163,184,.12);font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:.12em;color:#94a3b8;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;">'+
          '<span>↑↓ navigate · enter to add · esc to close</span>'+
          '<span style="color:#cbd5e1;">Quick add</span>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);

    const input = document.getElementById('apex-quickadd-input');
    const results = document.getElementById('apex-quickadd-results');
    let selected = 0;
    let filtered = PEPTIDES.slice(0, 8); // initial top 8

    function render() {
      results.innerHTML = filtered.length
        ? filtered.map((p, i) => `<button data-idx="${i}" data-value="${p.v.replace(/"/g,'&quot;')}" onclick="window._apexQAPick('${p.v.replace(/'/g,"\\'")}')" onmouseover="this._apexHover();" style="display:block;width:100%;text-align:left;background:${i===selected?'rgba(0,255,157,.08)':'transparent'};border:0;border-left:3px solid ${i===selected?'#00ff9d':'transparent'};color:#fff;font-family:inherit;font-size:14px;padding:10px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;">${p.v}</button>`).join('')
        : '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">No matches. Try a different name.</div>';
      // Hover sets selected
      results.querySelectorAll('button').forEach((b) => {
        b._apexHover = function(){ selected = parseInt(b.dataset.idx, 10) || 0; render(); };
      });
    }
    window._apexQAPick = (value) => {
      const overlay = document.getElementById('apex-quickadd-overlay');
      if (overlay) overlay.remove();
      // Open dose dial with peptide pre-selected
      try { window.openModal && window.openModal(); } catch(e) {}
      setTimeout(() => {
        const sel = document.getElementById('f-peptide');
        if (sel) {
          sel.value = value;
          try { sel.dispatchEvent(new Event('change')); } catch(e) {}
          try { window.autofill && window.autofill(); } catch(e) {}
        }
      }, 50);
    };

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (!q) { filtered = PEPTIDES.slice(0, 8); selected = 0; render(); return; }
      filtered = PEPTIDES.filter(p => (p.v + ' ' + p.k).toLowerCase().includes(q)).slice(0, 12);
      selected = 0;
      render();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { selected = Math.min(filtered.length - 1, selected + 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { selected = Math.max(0, selected - 1); render(); e.preventDefault(); }
      else if (e.key === 'Enter' && filtered[selected]) { window._apexQAPick(filtered[selected].v); }
      else if (e.key === 'Escape') { document.getElementById('apex-quickadd-overlay').remove(); }
    });

    setTimeout(() => input.focus(), 50);
    render();
  }

  // ── Cmd+K / Ctrl+K to open ──
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openQuickAdd();
    }
    // Also `/` to focus search (when not in an input)
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) {
      e.preventDefault();
      openQuickAdd();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPill);
  } else {
    injectPill();
  }

  // Re-inject pill if level changes to advanced
  window.addEventListener('apex:levelchange', (e) => {
    const pill = document.getElementById('apex-quickadd-pill');
    if (e.detail === 'advanced' && !pill) injectPill();
    else if (e.detail !== 'advanced' && pill) pill.remove();
  });

  // Expose for manual trigger
  window.openQuickAdd = openQuickAdd;
})();
