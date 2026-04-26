/* ═════════════════════════════════════════════════════════════
   APEX EXPERIENCE LAYER — the rest of the persona-aware UX:
   - Recent peptides chips on Today
   - Confidence rating overlays on encyclopedia entries
   - "Copy last cycle" affordance
   - "What if I miss a dose?" inline help
   - Keyboard shortcuts overlay (`?` to open)
   - 3-day dormancy gentle nudge
   - Milestone celebration (Day 7 / 30 / 90)
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexExperienceLoaded) return;
  window._apexExperienceLoaded = true;

  const path = (location.pathname || '').toLowerCase();
  const isTracker = /protocol-tracker\.html/.test(path);
  const isPeptidePage = path.match(/\/[a-z0-9-]+\.html$/) && !/(protocol-tracker|index|browse|wizard|compare|basics|wiki|research|nutrition|privacy|terms|reset|affiliate)\.html$/.test(path);

  // ── 1. RECENT PEPTIDES CHIPS — top of Today tab ──
  function renderRecentChips() {
    if (!isTracker) return;
    try {
      const state = JSON.parse(localStorage.getItem('apex_tracker') || '{}');
      const protos = (state.protocols || []).filter(p => !p.isDemoSeed && (p.status||'active')==='active');
      if (protos.length < 2) return; // not worth showing for 1 protocol
      const recent = protos.slice(-5).reverse();
      const target = document.getElementById('tour-stats') || document.querySelector('.stat-row');
      if (!target) return setTimeout(renderRecentChips, 200);
      let bar = document.getElementById('apex-recent-chips');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'apex-recent-chips';
        bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:0;align-items:center;';
        target.parentNode.insertBefore(bar, target);
      }
      bar.innerHTML = '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:.18em;color:#94a3b8;text-transform:uppercase;margin-right:4px;">Quick log:</div>' +
        recent.map(p => `<button onclick="(function(){if(window.toggleDoseDone){window.toggleDoseDone('${p.id}');}else if(window.openCardModal){window.openCardModal();}})()" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(0,255,157,.08);border:1px solid rgba(0,255,157,.35);border-radius:14px;color:#00ff9d;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;cursor:pointer;text-transform:uppercase;min-height:32px;">✓ ${(p.name||'').replace(/[^A-Za-z0-9-+\s]/g,'').slice(0,18)}</button>`).join('');
    } catch(e) {}
  }

  // ── 2. CONFIDENCE RATINGS on encyclopedia editorial box ──
  const CONFIDENCE = {
    'retatrutide':'strong','tirzepatide':'strong','semaglutide':'strong','bpc157':'moderate',
    'tb500':'moderate','ipamorelin':'moderate','cjc-no-dac':'moderate','ghkcu':'moderate',
    'motsc':'moderate','aod9604':'moderate','pt141':'strong','epitalon':'limited','selank':'moderate',
    'semax':'moderate','dsip':'limited','nad-plus':'moderate','kpv':'limited','klow':'anecdotal',
    'glow':'anecdotal','wolverine-stack':'anecdotal','cardiac-stack':'anecdotal','longevity-stack':'limited',
    '5amino1mq':'limited','tesamorelin':'strong','sermorelin':'strong','cjc1295-dac':'moderate',
    'cjc-ipa-blend':'moderate','igf1-lr3':'limited','cartalax':'limited','ara290':'limited',
    'dihexa':'limited','pe2228':'limited','fox04-dri':'limited','ss31':'moderate',
    'thymosin-a1':'strong','thymosin-alpha1':'strong','ll37':'limited','glutathione':'moderate',
    'glutamine':'moderate','l-carnitine':'strong','mito-reset':'anecdotal','melanotan1':'limited',
    'melanotan2':'limited','slu-pp-322':'limited',
  };
  const CONF_META = {
    strong:    { color:'#00ff9d', icon:'🟢', label:'Strong evidence', desc:'NEJM trials, FDA-approved studies, replicated clinical research.' },
    moderate:  { color:'#fbbf24', icon:'🟡', label:'Moderate evidence', desc:'Peer-reviewed research, smaller human trials, established mechanism.' },
    limited:   { color:'#f97316', icon:'🟠', label:'Limited evidence', desc:'Early research, observational studies, animal data with promising signal.' },
    anecdotal: { color:'#94a3b8', icon:'⚪', label:'Anecdotal',         desc:'Forum reports + practitioner experience. Limited clinical research.' },
  };
  function injectConfidenceBadge() {
    if (!isPeptidePage) return;
    const slug = (path.split('/').pop() || '').replace(/\.html$/,'');
    const conf = CONFIDENCE[slug];
    if (!conf) return;
    const meta = CONF_META[conf];
    function attach() {
      const box = document.getElementById('apex-editorial-box');
      if (!box) return setTimeout(attach, 250);
      if (box.querySelector('.apex-conf-badge')) return;
      const wrap = box.querySelector('.apex-ed-wrap');
      if (!wrap) return;
      const badge = document.createElement('div');
      badge.className = 'apex-conf-badge';
      badge.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:'+meta.color+'15;border:1px solid '+meta.color+'66;border-radius:14px;font-family:\'Share Tech Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:.12em;color:'+meta.color+';margin-bottom:12px;text-transform:uppercase;cursor:help;';
      badge.title = meta.desc;
      badge.innerHTML = meta.icon + ' ' + meta.label;
      wrap.insertBefore(badge, wrap.firstChild);
    }
    attach();
  }

  // ── 3. "MISSED A DOSE?" inline help ──
  function attachMissedDoseHelp() {
    if (!isTracker) return;
    function inject() {
      const grid = document.getElementById('active-grid');
      if (!grid) return setTimeout(inject, 300);
      // Add a single help link at the bottom of the grid
      if (document.getElementById('apex-missed-dose-link')) return;
      const link = document.createElement('a');
      link.id = 'apex-missed-dose-link';
      link.href = '#';
      link.onclick = (e) => { e.preventDefault(); openMissedDoseHelp(); };
      link.textContent = '? Missed a dose? — what to do';
      link.style.cssText = 'display:block;margin:14px auto 0;text-align:center;color:#cbd5e1;font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;text-decoration:underline;text-decoration-color:rgba(0,255,157,.4);text-underline-offset:3px;padding:10px;cursor:pointer;';
      grid.parentNode.insertBefore(link, grid.nextSibling);
    }
    inject();
  }
  function openMissedDoseHelp() {
    if (document.getElementById('apex-missed-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-missed-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.92);z-index:99994;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Barlow",sans-serif;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = '<div style="background:#0d1318;border:1px solid rgba(0,255,157,.3);border-radius:12px;max-width:520px;width:100%;padding:28px;">'+
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.22em;color:#00ff9d;margin-bottom:8px;text-transform:uppercase;">📅 IF YOU MISSED A DOSE</div>'+
      '<div style="font-family:\'Rajdhani\',sans-serif;font-size:24px;font-weight:700;color:#fff;margin-bottom:18px;">It happens. Here\'s the rule of thumb.</div>'+
      '<div style="display:flex;flex-direction:column;gap:14px;font-size:14px;color:#cbd5e1;line-height:1.55;">'+
        '<div style="padding:14px 16px;background:rgba(0,255,157,.06);border:1px solid rgba(0,255,157,.3);border-left:3px solid #00ff9d;border-radius:6px;"><b style="color:#fff;">Daily peptide (BPC, TB-500, etc):</b><br>Just take today\'s dose at the normal time. Don\'t double up.</div>'+
        '<div style="padding:14px 16px;background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.3);border-left:3px solid #fbbf24;border-radius:6px;"><b style="color:#fff;">Weekly peptide (GLP-1: Sema/Tirz/Reta):</b><br>If &lt;48 hr late, inject now and resume normal day next week.<br>If &gt;48 hr late, skip this dose. Resume your scheduled day next week.</div>'+
        '<div style="padding:14px 16px;background:rgba(56,189,248,.06);border:1px solid rgba(56,189,248,.3);border-left:3px solid #38bdf8;border-radius:6px;"><b style="color:#fff;">Multiple missed in a row?</b><br>Don\'t panic. Resume at your current ramp step (don\'t restart from week 1). If it\'s been &gt;14 days for a GLP-1, drop one ramp step to ease back in.</div>'+
        '<div style="padding:12px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.3);border-left:3px solid #ef4444;border-radius:6px;font-size:13px;"><b style="color:#fff;">Always:</b> Don\'t double-dose to "catch up." More side effects, no extra benefit. Talk to your provider for medical guidance.</div>'+
      '</div>'+
      '<button onclick="document.getElementById(\'apex-missed-overlay\').remove()" style="margin-top:20px;width:100%;background:#00ff9d;color:#080c10;border:0;padding:13px;border-radius:6px;font-family:\'Share Tech Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;cursor:pointer;text-transform:uppercase;min-height:44px;">Got it</button>'+
      '</div>';
    document.body.appendChild(overlay);
  }

  // ── 4. KEYBOARD SHORTCUTS OVERLAY ── (?)
  document.addEventListener('keydown', (e) => {
    if (e.key !== '?' && !(e.shiftKey && e.key === '/')) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) return;
    if (document.getElementById('apex-shortcuts-overlay')) return;
    e.preventDefault();
    const overlay = document.createElement('div');
    overlay.id = 'apex-shortcuts-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.92);z-index:99993;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Barlow",sans-serif;';
    overlay.onclick = (ev) => { if (ev.target === overlay) overlay.remove(); };
    const rows = [
      ['Cmd / Ctrl + K', 'Quick add peptide'],
      ['/', 'Quick add (alt)'],
      ['?', 'Show this overlay'],
      ['Esc', 'Close any modal'],
      ['Space', 'Pause / resume tour'],
      ['Tab', 'Cycle focus inside modal'],
    ];
    overlay.innerHTML = '<div style="background:#0d1318;border:1px solid rgba(0,255,157,.3);border-radius:12px;max-width:420px;width:100%;padding:28px;">'+
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.22em;color:#00ff9d;margin-bottom:8px;text-transform:uppercase;">⌨ KEYBOARD SHORTCUTS</div>'+
      '<div style="font-family:\'Rajdhani\',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:16px;">Move faster.</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px;">'+
        rows.map(([k,v]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(15,20,28,.5);border-radius:6px;"><kbd style="background:#080c10;border:1px solid rgba(0,255,157,.3);color:#00ff9d;padding:4px 10px;border-radius:4px;font-family:'Share Tech Mono',monospace;font-size:11px;">${k}</kbd><span style="font-size:13px;color:#cbd5e1;">${v}</span></div>`).join('')+
      '</div>'+
      '<button onclick="document.getElementById(\'apex-shortcuts-overlay\').remove()" style="margin-top:18px;width:100%;background:transparent;color:#00ff9d;border:1px solid rgba(0,255,157,.4);padding:12px;border-radius:6px;font-family:\'Share Tech Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;cursor:pointer;text-transform:uppercase;min-height:44px;">Got it</button>'+
      '</div>';
    document.body.appendChild(overlay);
  });

  // ── 5. 3-DAY DORMANCY NUDGE ──
  function maybeShowDormancyNudge() {
    if (!isTracker) return;
    try {
      const lastSeen = parseInt(localStorage.getItem('apex_last_log_ts') || '0', 10);
      const now = Date.now();
      const daysSince = (now - lastSeen) / 86400000;
      if (lastSeen && daysSince >= 3 && daysSince < 90) {
        // Don't repeat within 24h
        const lastNudge = parseInt(localStorage.getItem('apex_dormancy_nudge_ts') || '0', 10);
        if (now - lastNudge < 24 * 3600000) return;
        localStorage.setItem('apex_dormancy_nudge_ts', String(now));
        setTimeout(() => {
          if (window.showToast) {
            window.showToast('info', '👋 Welcome back', 'Haven\'t logged in ' + Math.floor(daysSince) + ' days. Skip a few? Happens. Pick up where you left off.', 7000);
          }
        }, 2500);
      }
      // Update last-seen
      localStorage.setItem('apex_last_log_ts', String(now));
    } catch(e) {}
  }

  // ── 6. MILESTONE CELEBRATION (Day 7 / 30 / 90) ──
  function maybeCelebrateMilestone() {
    if (!isTracker) return;
    try {
      const state = JSON.parse(localStorage.getItem('apex_tracker') || '{}');
      const protos = (state.protocols || []).filter(p => !p.isDemoSeed && (p.status||'active')==='active');
      const fired = JSON.parse(localStorage.getItem('apex_milestone_celebrated') || '{}');
      const now = new Date();
      protos.forEach(p => {
        if (!p.startDate) return;
        const days = Math.floor((now - new Date(p.startDate)) / 86400000);
        [7, 30, 60, 90, 180].forEach(m => {
          const key = p.id + '_d' + m;
          if (days === m && !fired[key]) {
            fired[key] = Date.now();
            localStorage.setItem('apex_milestone_celebrated', JSON.stringify(fired));
            setTimeout(() => showCelebration(m, p.name), 1200);
          }
        });
      });
    } catch(e) {}
  }
  function showCelebration(days, peptide) {
    if (document.getElementById('apex-milestone-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-milestone-overlay';
    const messages = {
      7:   { emoji:'🔥', title:'7 days locked in', sub:'First week is the hardest. You\'re past it.' },
      30:  { emoji:'⭐', title:'30 days strong', sub:'A full month. Real consistency. Photo + weight check?' },
      60:  { emoji:'💎', title:'60 days deep', sub:'Halfway through a typical cycle. The work is compounding.' },
      90:  { emoji:'🏆', title:'90 days · cycle complete', sub:'Real change at this milestone. Compare your photos.' },
      180: { emoji:'👑', title:'180 days', sub:'Six months. Most people quit by now. You didn\'t.' },
    };
    const m = messages[days] || { emoji:'🎯', title:'Milestone hit', sub:days + ' days running.' };
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.94);z-index:99992;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Barlow",sans-serif;animation:apexLevelIn .4s cubic-bezier(.2,.8,.2,1);';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = '<div style="background:linear-gradient(135deg,#0d1318,#102a1f);border:1.5px solid #00ff9d;border-radius:14px;max-width:480px;width:100%;padding:36px 28px 28px;text-align:center;box-shadow:0 24px 60px rgba(0,255,157,.25);">'+
      '<div style="font-size:64px;line-height:1;margin-bottom:14px;animation:apexLevelIn .8s cubic-bezier(.34,1.56,.64,1) both;animation-delay:.2s;">'+m.emoji+'</div>'+
      '<div style="font-family:\'Rajdhani\',sans-serif;font-size:32px;font-weight:700;color:#fff;line-height:1.1;margin-bottom:8px;letter-spacing:-.4px;">'+m.title+'</div>'+
      '<div style="font-size:14px;color:#cbd5e1;line-height:1.55;margin-bottom:8px;">'+m.sub+'</div>'+
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.18em;color:#00ff9d;margin-bottom:24px;text-transform:uppercase;">'+peptide+' · '+days+' DAYS</div>'+
      '<button onclick="(function(){document.getElementById(\'apex-milestone-overlay\').remove();if(window.openProgressModal)window.openProgressModal();})()" style="background:#00ff9d;color:#080c10;border:0;padding:14px 28px;border-radius:8px;font-family:\'Rajdhani\',sans-serif;font-size:14px;font-weight:800;letter-spacing:.12em;cursor:pointer;text-transform:uppercase;min-height:44px;width:100%;">📸 Log a check-in to mark this</button>'+
      '<button onclick="document.getElementById(\'apex-milestone-overlay\').remove()" style="margin-top:10px;background:transparent;color:#94a3b8;border:0;padding:10px;font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.15em;cursor:pointer;text-transform:uppercase;min-height:40px;">Skip · keep going</button>'+
      '</div>';
    document.body.appendChild(overlay);
    if (window.apexHaptic) window.apexHaptic('success');
  }

  // ── 7. "COPY LAST CYCLE" — added to ended cycle cards ──
  // (Hooks into render — adds a button when state has completed protocols)
  function addCopyLastButton() {
    if (!isTracker) return;
    function inject() {
      try {
        const state = JSON.parse(localStorage.getItem('apex_tracker') || '{}');
        const completed = (state.protocols || []).filter(p => p.status === 'completed');
        if (completed.length === 0) return;
        if (document.getElementById('apex-copy-last-row')) return;
        // Show "Run it again" pills near the top of Today
        const target = document.getElementById('goals-entry-row');
        if (!target) return setTimeout(inject, 400);
        const row = document.createElement('div');
        row.id = 'apex-copy-last-row';
        row.style.cssText = 'margin-top:12px;padding:14px 18px;background:rgba(15,20,28,.55);border:1px solid rgba(148,163,184,.18);border-radius:6px;';
        const recent3 = completed.slice(-3).reverse();
        row.innerHTML = '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.18em;color:#cbd5e1;margin-bottom:8px;text-transform:uppercase;">↻ Run it again</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          recent3.map(p => `<button onclick="(function(){var s=JSON.parse(localStorage.getItem('apex_tracker')||'{}');s.protocols=s.protocols||[];var copy=Object.assign({},${JSON.stringify(p)},{id:'copy_'+Date.now(),status:'active',startDate:new Date().toISOString().split('T')[0],isDemoSeed:false});s.protocols.push(copy);localStorage.setItem('apex_tracker',JSON.stringify(s));try{render()}catch(e){}window.showToast&&window.showToast('success','${(p.name||'').replace(/'/g,"\\\\'")} restarted','Same dose, same schedule. Day 1 begins today.');})()" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(0,255,157,.1);border:1px solid rgba(0,255,157,.4);border-radius:14px;color:#00ff9d;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.12em;cursor:pointer;text-transform:uppercase;min-height:36px;">↻ ${(p.name||'').replace(/[^A-Za-z0-9-+\s]/g,'').slice(0,18)}</button>`).join('') +
          '</div>';
        target.parentNode.insertBefore(row, target.nextSibling);
      } catch(e) {}
    }
    inject();
  }

  // ── BOOT ──
  function boot() {
    renderRecentChips();
    injectConfidenceBadge();
    attachMissedDoseHelp();
    maybeShowDormancyNudge();
    maybeCelebrateMilestone();
    addCopyLastButton();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  // Re-run on render
  window.addEventListener('apex:rendered', boot);
})();
