/* ═════════════════════════════════════════════════════════════
   APEX UNIFIED NAV — persistent top bar + floating back-to-tracker pill
   Injects on every encyclopedia/research page so the system feels
   like ONE surface instead of adjacent zones. Non-destructive.
   v2 — adds stack badge showing active protocol count + "running" status
   ═════════════════════════════════════════════════════════════ */
(function(){
  try {
    if (document.getElementById('apex-nav-top')) return;
    var path = (location.pathname || '').toLowerCase();
    var isTracker = /protocol-tracker\.html/.test(path);
    var isLanding = /\/index\.html$|\/$/.test(path) || path === '';
    if (isTracker || isLanding) return; // tracker has its own chrome

    // ── Read stack snapshot from localStorage so nav can show live state ─────
    var stackCount = 0, activeStackCount = 0, streakDays = 0;
    try {
      var raw = localStorage.getItem('apex_tracker');
      if (raw) {
        var st = JSON.parse(raw);
        var protos = (st && st.protocols) || [];
        stackCount = protos.length;
        activeStackCount = protos.filter(function(p){return (p.status||'active')==='active';}).length;
      }
    } catch(_) {}

    // ── Breadcrumb label from file name ─────────────────────────────────────
    var fileSlug = (path.split('/').pop() || '').replace(/\.html$/,'');
    var pretty = fileSlug.replace(/-/g,' ').replace(/\b\w/g, function(c){return c.toUpperCase();});

    // Classify current page into a section
    var section = 'Research';
    if (/^(browse|research|wiki|basics|compare)$/i.test(fileSlug)) section = 'Research';
    else if (/stack$|stack\./i.test(fileSlug)) section = 'Stacks';
    else if (/nutrition|privacy|terms|reset/i.test(fileSlug)) section = 'Info';

    // ── Smart back: figure out the best "back" target ────────────────────────
    var backHref = '';
    var backLabel = '';
    var canHistoryBack = false;
    try {
      var ref = document.referrer || '';
      var refHost = '';
      try { refHost = new URL(ref).hostname; } catch(e) {}
      var sameOrigin = refHost && refHost === location.hostname;
      if (sameOrigin && ref) {
        canHistoryBack = true;
        if (ref.indexOf('protocol-tracker') > -1) backLabel = '← Tracker';
        else if (ref.indexOf('browse') > -1) backLabel = '← Encyclopedia';
        else if (ref.indexOf('compare') > -1) backLabel = '← Compare';
        else if (ref.indexOf('wizard') > -1) backLabel = '← Setup';
        else if (ref.indexOf('basics') > -1) backLabel = '← Basics';
        else if (ref.indexOf('index.html') > -1 || ref.match(/\/$/)) backLabel = '← Home';
        else backLabel = '← Back';
      } else {
        // Fallback: pick the most likely parent based on current page section
        if (section === 'Research') { backHref = 'browse.html'; backLabel = '← Encyclopedia'; }
        else if (section === 'Stacks') { backHref = 'browse.html'; backLabel = '← Encyclopedia'; }
        else { backHref = 'index.html'; backLabel = '← Home'; }
      }
    } catch(e) {
      backHref = 'index.html'; backLabel = '← Home';
    }

    // ── Inject unified top bar ──────────────────────────────────────────────
    var top = document.createElement('div');
    top.id = 'apex-nav-top';
    top.innerHTML = ''+
      '<style>'+
        '#apex-nav-top{position:sticky;top:0;z-index:9996;width:100%;background:rgba(8,12,16,.94);backdrop-filter:blur(10px);border-bottom:1px solid rgba(20,184,166,.22);font-family:"Share Tech Mono",monospace;}'+
        '#apex-nav-top .apex-nav-inner{max-width:1160px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:14px;}'+
        '#apex-nav-top .apex-back-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:transparent;color:#cbd5e1;border:1px solid rgba(0,255,157,.35);border-radius:18px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;cursor:pointer;transition:all .15s;flex-shrink:0;min-height:36px;font-family:inherit;}'+
        '#apex-nav-top .apex-back-btn:hover{background:rgba(0,255,157,.1);color:#00ff9d;border-color:#00ff9d;}'+
        '#apex-nav-top .apex-brand{font-family:"Rajdhani",sans-serif;font-size:19px;font-weight:700;color:#14b8a6;letter-spacing:.18em;text-decoration:none;flex-shrink:0;}'+
        '#apex-nav-top .apex-nav-sep{color:rgba(148,163,184,.3);font-size:10px;}'+
        '#apex-nav-top .apex-nav-links{display:flex;align-items:center;gap:18px;flex:1;}'+
        '#apex-nav-top .apex-nav-links a{color:#94a3b8;text-decoration:none;font-size:10px;letter-spacing:.18em;text-transform:uppercase;transition:color .15s;padding:4px 0;border-bottom:2px solid transparent;}'+
        '#apex-nav-top .apex-nav-links a:hover{color:#fff;}'+
        '#apex-nav-top .apex-nav-links a.active{color:#14b8a6;border-bottom-color:#14b8a6;}'+
        '#apex-nav-top .apex-stack-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.04));color:#10b981;text-decoration:none;border:1px solid rgba(16,185,129,.4);border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;transition:all .15s;flex-shrink:0;}'+
        '#apex-nav-top .apex-stack-pill:hover{background:rgba(16,185,129,.22);transform:translateY(-1px);}'+
        '#apex-nav-top .apex-stack-pill .dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;animation:apexPulseDot 2s infinite;}'+
        '#apex-nav-top .apex-stack-pill-empty{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(20,184,166,.1);color:#14b8a6;text-decoration:none;border:1px solid rgba(20,184,166,.35);border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;transition:all .15s;flex-shrink:0;}'+
        '#apex-nav-top .apex-stack-pill-empty:hover{background:rgba(20,184,166,.2);}'+
        '@keyframes apexPulseDot{0%,100%{opacity:1}50%{opacity:.45}}'+
        '#apex-nav-top .apex-crumb-inline{font-size:10px;letter-spacing:.12em;color:#64748b;}'+
        '#apex-nav-top .apex-crumb-inline b{color:#cbd5e1;font-weight:600;}'+
        '@media (max-width:760px){'+
          '#apex-nav-top .apex-nav-inner{gap:8px;padding:8px 12px;}'+
          '#apex-nav-top .apex-back-btn{padding:8px 10px;font-size:10px;letter-spacing:.1em;}'+
          '#apex-nav-top .apex-brand{font-size:14px;letter-spacing:.14em;}'+
          '#apex-nav-top .apex-nav-links{gap:10px;}'+
          '#apex-nav-top .apex-nav-links a{font-size:9px;letter-spacing:.1em;}'+
          '#apex-nav-top .apex-crumb-inline{display:none;}'+
          '#apex-nav-top .apex-stack-pill,#apex-nav-top .apex-stack-pill-empty{padding:5px 10px;font-size:9px;}'+
        '}'+
        '@media (max-width:480px){'+
          '#apex-nav-top .apex-brand{display:none;}'+ // back button replaces brand on tiny screens
          '#apex-nav-top .apex-nav-links a:not(.active){display:none;}'+ // hide non-active links
        '}'+
      '</style>'+
      '<div class="apex-nav-inner">'+
        (canHistoryBack
          ? '<button class="apex-back-btn" onclick="if(history.length>1){history.back()}else{location.href=\''+(backHref||'index.html')+'\'}">'+backLabel+'</button>'
          : '<a class="apex-back-btn" href="'+backHref+'">'+backLabel+'</a>')+
        '<a href="index.html" class="apex-brand">APEX</a>'+
        '<div class="apex-nav-links">'+
          '<a href="browse.html"'+(section==='Research'?' class="active"':'')+'>Research</a>'+
          '<a href="compare.html">Compare</a>'+
          '<a href="basics.html">Basics</a>'+
          (pretty ? '<span class="apex-crumb-inline">›&nbsp;<b>'+pretty+'</b></span>' : '')+
        '</div>'+
        (activeStackCount > 0 ?
          '<a href="protocol-tracker.html" class="apex-stack-pill"><span class="dot"></span>'+activeStackCount+' running · Open Tracker →</a>' :
          '<a href="protocol-tracker.html" class="apex-stack-pill-empty">🧪 Open Tracker</a>')+
      '</div>';
    // Insert at the very top of body
    document.body.insertBefore(top, document.body.firstChild);

    // ── "Add to my stack" persistent action bar (on peptide pages) ──────────
    // Turns research pages from read-only into decision points.
    // Skips non-peptide pages (browse/compare/basics/etc.)
    var isPeptidePage = fileSlug && !/^(browse|research|wiki|basics|compare|privacy|terms|reset|nutrition)$/i.test(fileSlug);
    if (isPeptidePage) {
      var peptideName = pretty; // same title-cased name used in breadcrumb
      // Normalize a few known mismatches between file slug and catalog name
      var slugToName = {
        'bpc157': 'BPC-157', 'tb500': 'TB-500', 'pt141': 'PT-141',
        'cjc-no-dac': 'CJC-1295 No DAC', 'cjc1295-dac': 'CJC-1295 DAC',
        'cjc-ipa-blend': 'CJC + Ipa Blend', 'igf1-lr3': 'IGF-1 LR3',
        'ghkcu': 'GHK-Cu', '5amino1mq': '5-Amino-1MQ', 'motsc': 'MOTS-c',
        'aod9604': 'AOD-9604', 'ss31': 'SS-31', 'll37': 'LL-37',
        'fox04-dri': 'FOXO4-DRI', 'nad-plus': 'NAD+',
        'thymosin-a1': 'Thymosin Alpha-1', 'thymosin-alpha1': 'Thymosin Alpha-1',
        'pe2228': 'PE-22-28', 'melanotan1': 'Melanotan I', 'melanotan2': 'Melanotan II',
        'slu-pp-322': 'SLU-PP-332', 'l-carnitine': 'L-Carnitine',
      };
      if (slugToName[fileSlug]) peptideName = slugToName[fileSlug];

      var ctaBar = document.createElement('div');
      ctaBar.id = 'apex-cta-bar';
      ctaBar.innerHTML = ''+
        '<style>'+
          '#apex-cta-bar{position:sticky;top:46px;z-index:9995;background:linear-gradient(90deg,rgba(20,184,166,.14),rgba(20,184,166,.03));border-bottom:1px solid rgba(20,184,166,.28);backdrop-filter:blur(6px);font-family:"Barlow",sans-serif;}'+
          '#apex-cta-bar .apex-cta-inner{max-width:1160px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;}'+
          '#apex-cta-bar .apex-cta-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}'+
          '#apex-cta-bar .apex-cta-icon{font-size:20px;line-height:1;flex-shrink:0;}'+
          '#apex-cta-bar .apex-cta-txt{color:#cbd5e1;font-size:13px;line-height:1.4;min-width:0;}'+
          '#apex-cta-bar .apex-cta-txt b{color:#fff;font-weight:700;}'+
          '#apex-cta-bar a.apex-cta-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:24px;font-family:"Rajdhani",sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 4px 14px rgba(20,184,166,.4);transition:transform .15s,box-shadow .15s;flex-shrink:0;}'+
          '#apex-cta-bar a.apex-cta-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(20,184,166,.55);}'+
          '#apex-cta-bar a.apex-cta-ghost{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;background:transparent;color:#94a3b8;text-decoration:none;border:1px solid rgba(148,163,184,.3);border-radius:20px;font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;transition:color .15s,border-color .15s;flex-shrink:0;}'+
          '#apex-cta-bar a.apex-cta-ghost:hover{color:#fff;border-color:#94a3b8;}'+
          '@media(max-width:640px){'+
            '#apex-cta-bar{top:42px;}'+
            '#apex-cta-bar .apex-cta-inner{padding:8px 14px;gap:10px;}'+
            '#apex-cta-bar .apex-cta-txt{font-size:12px;}'+
            '#apex-cta-bar a.apex-cta-btn{padding:9px 14px;font-size:12px;}'+
            '#apex-cta-bar a.apex-cta-ghost{display:none;}'+
          '}'+
        '</style>'+
        '<div class="apex-cta-inner">'+
          '<div class="apex-cta-left">'+
            '<div class="apex-cta-icon">🧪</div>'+
            '<div class="apex-cta-txt">Ready to run <b>'+peptideName+'</b>? The tracker calculates your dose, supply, and cycle timeline in one click.</div>'+
          '</div>'+
          '<a href="protocol-tracker.html?add='+encodeURIComponent(peptideName)+'" class="apex-cta-btn">+ Add to My Stack</a>'+
          '<a href="compare.html?focus='+encodeURIComponent(peptideName)+'" class="apex-cta-ghost">Compare ↔</a>'+
        '</div>';
      document.body.insertBefore(ctaBar, top.nextSibling);
    }

    // ── Floating back-pill (bottom right) — kept for mobile thumb reach ─────
    if (!document.getElementById('apex-nav-pill-root')) {
      var pill = document.createElement('div');
      pill.id = 'apex-nav-pill-root';
      pill.innerHTML = ''+
        '<style>'+
          '#apex-nav-pill-root{position:fixed;right:16px;bottom:16px;z-index:9998;font-family:"Share Tech Mono",monospace;pointer-events:none;}'+
          '#apex-nav-pill-root a{pointer-events:auto;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;background:rgba(13,19,24,.94);color:#14b8a6;border:1px solid rgba(20,184,166,.55);border-radius:24px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;box-shadow:0 6px 18px rgba(0,0,0,.45);backdrop-filter:blur(6px);transition:transform .15s,border-color .15s,color .15s;}'+
          '#apex-nav-pill-root a:hover{transform:translateY(-2px);border-color:#14b8a6;color:#fff;background:rgba(20,184,166,.2);}'+
          '@media(max-width:640px){#apex-nav-pill-root{right:10px;bottom:10px;}#apex-nav-pill-root a{padding:9px 13px;font-size:10px;}}'+
          '@media(min-width:761px){#apex-nav-pill-root{display:none;}}'+  // top bar covers desktop
        '</style>'+
        '<a href="protocol-tracker.html" title="Open your tracker">🧪 Back to Tracker →</a>';
      document.body.appendChild(pill);
    }
  } catch(e) {}
})();
