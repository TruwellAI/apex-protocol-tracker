/* ═════════════════════════════════════════════════════════════
   APEX TRACKING — per-user, per-page activity log to GHL.
   Captures email on first deep visit, then fires every page_view
   and peptide_click to your GHL webhook for remarketing.

   Data model in GHL:
   - Contact: email, first_name, last_name
   - Custom fields: peptides_viewed (csv), session_count, last_active
   - Tags: viewed-{slug}, category-{cat}, intent-{level}
   ═════════════════════════════════════════════════════════════ */
(function(){
  // Set this in production. Until then, events log to console + localStorage queue.
  // To configure later: add window.GHL_WEBHOOK_URL = '...' to the page <head>.
  const WEBHOOK_URL = window.GHL_WEBHOOK_URL || '';

  const STORAGE_KEY = 'apex_event_queue';
  const EMAIL_KEY = 'apex_email';
  const NAME_KEY = 'apex_name';
  const SESSION_KEY = 'apex_session_id';
  const SESSION_COUNT_KEY = 'apex_session_count';

  // Slug → display name map (mirrors the editorial layer)
  const SLUG_TO_NAME = {
    'bpc157':'BPC-157','tb500':'TB-500','pt141':'PT-141','cjc-no-dac':'CJC-1295 No DAC',
    'cjc1295-dac':'CJC-1295 DAC','cjc-ipa-blend':'CJC + Ipa Blend','igf1-lr3':'IGF-1 LR3',
    'ghkcu':'GHK-Cu','5amino1mq':'5-Amino-1MQ','motsc':'MOTS-c','aod9604':'AOD-9604',
    'ss31':'SS-31','ll37':'LL-37','fox04-dri':'FOXO4-DRI','nad-plus':'NAD+',
    'thymosin-a1':'Thymosin Alpha-1','thymosin-alpha1':'Thymosin Alpha-1','pe2228':'PE-22-28',
    'melanotan1':'Melanotan I','melanotan2':'Melanotan II','slu-pp-322':'SLU-PP-332',
    'l-carnitine':'L-Carnitine','retatrutide':'Retatrutide','tirzepatide':'Tirzepatide',
    'semaglutide':'Semaglutide','ipamorelin':'Ipamorelin','epitalon':'Epitalon',
    'cartalax':'Cartalax','selank':'Selank','semax':'Semax','dsip':'DSIP','kpv':'KPV',
    'glutathione':'Glutathione','glutamine':'L-Glutamine','dihexa':'Dihexa','ara290':'ARA-290',
    'sermorelin':'Sermorelin','tesamorelin':'Tesamorelin','mito-reset':'Mito Reset Protocol',
    'glow':'GLOW Stack','klow':'KLOW Stack','wolverine-stack':'Wolverine Stack',
    'cardiac-stack':'Cardiac Stack','longevity-stack':'Longevity Stack',
  };

  // Category map for tagging (drives "viewed weight loss content" type segments)
  const CATEGORY_MAP = {
    'retatrutide':'glp1','tirzepatide':'glp1','semaglutide':'glp1','aod9604':'fat-loss',
    'l-carnitine':'fat-loss','5amino1mq':'fat-loss','motsc':'mitochondrial',
    'nad-plus':'mitochondrial','ss31':'mitochondrial','epitalon':'longevity',
    'cartalax':'longevity','glutathione':'antioxidant','bpc157':'repair','tb500':'repair',
    'ghkcu':'skin','klow':'repair','glow':'skin','wolverine-stack':'repair',
    'cardiac-stack':'cardiac','longevity-stack':'longevity','ipamorelin':'gh-axis',
    'cjc-no-dac':'gh-axis','cjc1295-dac':'gh-axis','cjc-ipa-blend':'gh-axis',
    'sermorelin':'gh-axis','tesamorelin':'gh-axis','igf1-lr3':'gh-axis','dihexa':'cognitive',
    'selank':'cognitive','semax':'cognitive','pe2228':'cognitive','dsip':'sleep',
    'pt141':'libido','melanotan1':'aesthetic','melanotan2':'aesthetic',
    'thymosin-a1':'immune','thymosin-alpha1':'immune','kpv':'gut','ll37':'immune',
    'glutamine':'gut','ara290':'neuroprotection','fox04-dri':'longevity',
    'slu-pp-322':'metabolic','mito-reset':'mitochondrial',
  };

  // ── Session bootstrapping ─────────────────────────────────────────────
  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7);
      sessionStorage.setItem(SESSION_KEY, id);
      // Increment lifetime session counter
      const c = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10) + 1;
      localStorage.setItem(SESSION_COUNT_KEY, String(c));
    }
    return id;
  }

  // ── Event firing ──────────────────────────────────────────────────────
  function fireEvent(name, props) {
    const email = (localStorage.getItem(EMAIL_KEY) || '').toLowerCase();
    const isPlaceholder = email === 'open@apexprotocol' || !email;
    const refCode = localStorage.getItem('apex_ref_code') || null;
    const refBy = localStorage.getItem('apex_referred_by') || null;
    const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
    const payload = {
      event: name,
      email: isPlaceholder ? null : email,
      name: localStorage.getItem(NAME_KEY) || null,
      session_id: getSessionId(),
      session_count: sessionCount,
      ref_code: refCode,
      referred_by: refBy,
      page: location.pathname,
      url: location.href,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
      ...(props || {}),
    };

    // Always log locally for debugging + offline queue
    console.log('[apex.track]', name, payload);
    queueEvent(payload);

    // Fire to webhook if configured
    if (WEBHOOK_URL) {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(()=>{});
      } catch(e) {}
    }
  }

  function queueEvent(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      queue.push(payload);
      // Cap at 200 events to prevent localStorage bloat
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-200)));
    } catch(e) {}
  }

  // ── Page-level auto-tracking ──────────────────────────────────────────
  function trackPageView() {
    const path = location.pathname.toLowerCase();
    const slug = (path.split('/').pop() || '').replace(/\.html$/,'');
    const peptideName = SLUG_TO_NAME[slug] || null;
    const category = CATEGORY_MAP[slug] || null;

    fireEvent('page_view', {
      page_slug: slug,
      peptide_name: peptideName,
      peptide_category: category,
    });

    // If this is a peptide page, also log a peptide_view event (heatmap-friendly)
    if (peptideName) {
      fireEvent('peptide_view', {
        peptide_name: peptideName,
        peptide_slug: slug,
        peptide_category: category,
      });
      // Maintain a comma-separated list of viewed peptides on the user
      try {
        const seen = JSON.parse(localStorage.getItem('apex_peptides_viewed') || '[]');
        if (!seen.includes(peptideName)) {
          seen.push(peptideName);
          localStorage.setItem('apex_peptides_viewed', JSON.stringify(seen));
        }
      } catch(e) {}
    }
  }

  // ── Click tracking on key elements (called by event delegation) ──────
  function trackClickByDelegation() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-apex-track]');
      if (!el) return;
      const name = el.dataset.apexTrack;
      const props = {};
      Object.entries(el.dataset).forEach(([k,v]) => {
        if (k.startsWith('apex') && k !== 'apexTrack') props[k.replace(/^apex/,'').toLowerCase()] = v;
      });
      fireEvent(name, props);
    }, { capture: true });
  }

  // ── Soft email gate — appears after 60 seconds of engagement OR after 3 page views ──────
  function maybeShowEmailGate() {
    const email = localStorage.getItem(EMAIL_KEY) || '';
    if (email && email !== 'open@apexprotocol' && email.includes('@')) return; // already captured
    if (sessionStorage.getItem('apex_email_gate_dismissed') === '1') return;
    if (localStorage.getItem('apex_email_gate_seen_recently') === '1') return;

    const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
    const triggerByPageViews = (parseInt(sessionStorage.getItem('apex_pv_count') || '0', 10) >= 3);
    const triggerByTime = (sessionCount >= 2); // 2nd+ session
    if (!triggerByPageViews && !triggerByTime) return;

    showEmailGate();
  }

  function showEmailGate() {
    if (document.getElementById('apex-email-gate')) return;
    const gate = document.createElement('div');
    gate.id = 'apex-email-gate';
    gate.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:10009;background:linear-gradient(180deg,#0d1318,#080c10);border-top:1px solid rgba(20,184,166,.4);box-shadow:0 -6px 24px rgba(0,0,0,.5);padding:16px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Barlow",sans-serif;animation:apexGateUp .35s cubic-bezier(.2,.8,.2,1);';
    gate.innerHTML = `
      <style>@keyframes apexGateUp{from{transform:translateY(100%);}to{transform:translateY(0);}}</style>
      <div style="flex:1;min-width:240px;">
        <div style="font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;color:#14b8a6;margin-bottom:2px;">📥 SAVE YOUR PROGRESS</div>
        <div style="font-size:13px;color:#cbd5e1;line-height:1.4;">Drop your email so your stack syncs across devices and we can email you when new peptide research drops.</div>
      </div>
      <input id="apex-gate-email" type="email" placeholder="you@email.com" style="background:#080c10;border:1px solid rgba(20,184,166,.35);border-radius:6px;color:#fff;font-size:14px;padding:10px 14px;outline:none;flex:1;min-width:200px;">
      <button onclick="window._apexGateSubmit()" style="background:#14b8a6;color:#fff;border:0;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;padding:11px 20px;cursor:pointer;text-transform:uppercase;border-radius:6px;white-space:nowrap;">Save</button>
      <button onclick="window._apexGateDismiss()" style="background:transparent;color:#64748b;border:0;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;padding:11px;cursor:pointer;">No thanks</button>
    `;
    document.body.appendChild(gate);
    setTimeout(() => { try { document.getElementById('apex-gate-email').focus(); } catch(e) {} }, 200);
  }

  window._apexGateSubmit = function() {
    const inp = document.getElementById('apex-gate-email');
    const em = (inp && inp.value || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      if (inp) { inp.style.borderColor = '#dc2626'; inp.style.boxShadow = '0 0 0 3px rgba(220,38,38,.25)'; }
      return;
    }
    localStorage.setItem(EMAIL_KEY, em);
    localStorage.setItem('apex_email_gate_seen_recently', '1');
    setTimeout(() => { localStorage.removeItem('apex_email_gate_seen_recently'); }, 7 * 86400000);
    fireEvent('email_captured_softgate', { email: em });
    const gate = document.getElementById('apex-email-gate');
    if (gate) gate.remove();
  };

  window._apexGateDismiss = function() {
    sessionStorage.setItem('apex_email_gate_dismissed', '1');
    const gate = document.getElementById('apex-email-gate');
    if (gate) gate.remove();
  };

  // ── Page-view counter for the gate trigger ────────────────────────────
  function bumpPageViewCount() {
    const c = parseInt(sessionStorage.getItem('apex_pv_count') || '0', 10) + 1;
    sessionStorage.setItem('apex_pv_count', String(c));
  }

  // ── Time-on-page (fires on unload for accuracy) ──────────────────────
  let pageStartTs = Date.now();
  function trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
      const seconds = Math.round((Date.now() - pageStartTs) / 1000);
      if (seconds < 2 || seconds > 600) return; // ignore noise
      fireEvent('page_dwell', { seconds });
    });
  }

  // ── Boot ──────────────────────────────────────────────────────────────
  function init() {
    bumpPageViewCount();
    trackPageView();
    trackClickByDelegation();
    trackTimeOnPage();
    // Delay email gate so it doesn't pop on landing
    setTimeout(maybeShowEmailGate, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Expose API
  window.apexTrack = fireEvent;
})();
