// ══════════════════════════════════════════════════════════
// PEPTIDE PAGE FOOTER — shared nav for all encyclopedia pages
// Injects a fixed bottom bar + an inline footer CTA block
// so users never hit a dead-end at the bottom of a peptide page.
// ══════════════════════════════════════════════════════════
(function(){
  if (typeof document === 'undefined') return;

  // ── WIKI PREVIEW MODE DETECTION ────────────────────────
  // If the URL has ?wiki=1, the user is in encyclopedia-only preview mode.
  // We skip all tracker CTAs and inject a sticky "preview" ribbon instead.
  var _wikiMode = false;
  try {
    var p = new URLSearchParams(location.search);
    if (p.get('wiki') === '1' || sessionStorage.getItem('apex_wiki_mode') === '1') {
      _wikiMode = true;
      sessionStorage.setItem('apex_wiki_mode', '1');
    }
  } catch(e) {}

  // Derive a display name from the page title or filename.
  function getPeptideName() {
    // Try h1 first
    const h1 = document.querySelector('h1');
    if (h1) {
      const t = h1.textContent.trim();
      if (t) return t;
    }
    // Fallback: <title>
    const title = document.title || '';
    // Strip " — Apex Protocol" or similar suffixes
    return title.split(/[—–|•]/)[0].trim() || 'This Peptide';
  }

  // Native app uses encyclopedia.html (because index.html is the splash/redirect).
  // Web uses index.html. Detect by protocol — file:// or capacitor:// = native.
  function encyclopediaUrl() {
    const isNative = location.protocol === 'file:' || location.protocol === 'capacitor:' || location.protocol === 'ionic:';
    return isNative ? 'encyclopedia.html' : 'index.html';
  }

  function buildFooter() {
    const name = getPeptideName();
    const addUrl = 'protocol-tracker.html?add=' + encodeURIComponent(name) + '&from=encyclopedia';
    const encUrl = encyclopediaUrl() + (_wikiMode ? '?wiki=1' : '');

    // ── WIKI MODE: inject a preview ribbon + skip tracker CTAs ──
    if (_wikiMode) {
      var ribbon = document.createElement('div');
      ribbon.id = 'apex-wiki-ribbon';
      ribbon.style.cssText = 'position:sticky;top:0;z-index:9999;background:linear-gradient(90deg,#14b8a6,#0d9488);color:#fff;text-align:center;padding:10px 16px;font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;box-shadow:0 2px 12px rgba(20,184,166,.35);';
      ribbon.innerHTML = '📖 ENCYCLOPEDIA PREVIEW MODE · <a href="' + encUrl + '" style="color:#fff;text-decoration:underline;">← Back to Index</a>';
      document.body.prepend(ribbon);
      // Rewrite all internal links to preserve the wiki flag
      document.querySelectorAll('a[href]').forEach(function(a){
        var href = a.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;
        if (href.includes('wiki=1')) return;
        if (href.indexOf('protocol-tracker.html') === 0 || href.indexOf('nutrition.html') === 0) {
          a.style.display = 'none';
          return;
        }
        a.setAttribute('href', href.indexOf('?') > -1 ? href + '&wiki=1' : href + '?wiki=1');
      });
      // Don't inject the tracker footer CTA or sticky nav — bail here
      return;
    }

    // ── INLINE FOOTER CTA BLOCK (appended at end of page content) ──
    const inlineFooter = document.createElement('div');
    inlineFooter.id = 'peptide-page-footer';
    inlineFooter.style.cssText = [
      'margin:48px auto 120px',
      'max-width:900px',
      'padding:32px 24px',
      'background:linear-gradient(180deg,rgba(20,184,166,.08),rgba(20,184,166,.02))',
      'border:1px solid rgba(20,184,166,.3)',
      'border-radius:8px',
      'text-align:center'
    ].join(';');

    inlineFooter.innerHTML = `
      <div style="font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.2em;color:#14b8a6;margin-bottom:10px;">READY TO START?</div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1.3;">Add ${name} to your stack</div>
      <div style="font-family:'Barlow',sans-serif;font-size:13px;color:#94a3b8;margin-bottom:22px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.5;">
        Research-backed dosing, live cycle tracking, and a daily injection card right on your phone.
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <a href="${addUrl}" style="display:inline-flex;align-items:center;gap:8px;background:#14b8a6;color:#fff;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;padding:14px 26px;text-decoration:none;text-transform:uppercase;border-radius:4px;box-shadow:0 4px 14px rgba(20,184,166,.4);">＋ Add to My Stack</a>
        <a href="protocol-tracker.html" style="display:inline-flex;align-items:center;gap:8px;background:rgba(20,184,166,.1);color:#14b8a6;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;padding:14px 26px;text-decoration:none;text-transform:uppercase;border-radius:4px;border:1px solid rgba(20,184,166,.4);">📋 Open Tracker</a>
        <a href="${encUrl}" style="display:inline-flex;align-items:center;gap:8px;background:transparent;color:#94a3b8;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;padding:14px 26px;text-decoration:none;text-transform:uppercase;border-radius:4px;border:1px solid #334155;">← Back to Encyclopedia</a>
      </div>
    `;

    document.body.appendChild(inlineFooter);

    // ── STICKY BOTTOM NAV BAR (always visible while scrolling) ──
    const stickyBar = document.createElement('div');
    stickyBar.id = 'peptide-sticky-nav';
    stickyBar.style.cssText = [
      'position:fixed',
      'bottom:0',
      'left:0',
      'right:0',
      'z-index:10000',
      'background:rgba(8,12,16,.96)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'border-top:1px solid rgba(20,184,166,.3)',
      'padding:10px 14px calc(10px + env(safe-area-inset-bottom))',
      'display:grid',
      'grid-template-columns:1fr 1fr 1fr',
      'gap:8px',
      'box-shadow:0 -4px 20px rgba(0,0,0,.4)'
    ].join(';');

    stickyBar.innerHTML = `
      <a href="${encUrl}" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(148,163,184,.08);color:#94a3b8;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;padding:10px 6px;text-decoration:none;text-transform:uppercase;border-radius:6px;-webkit-tap-highlight-color:transparent;min-height:48px;justify-content:center;">
        <span style="font-size:18px;line-height:1;">📖</span>
        <span>Encyclopedia</span>
      </a>
      <a href="${addUrl}" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:#14b8a6;color:#fff;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;padding:10px 6px;text-decoration:none;text-transform:uppercase;border-radius:6px;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 10px rgba(20,184,166,.4);min-height:48px;justify-content:center;">
        <span style="font-size:20px;line-height:1;font-weight:900;">＋</span>
        <span>Add to Stack</span>
      </a>
      <a href="protocol-tracker.html" style="display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(20,184,166,.08);color:#14b8a6;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;padding:10px 6px;text-decoration:none;text-transform:uppercase;border-radius:6px;border:1px solid rgba(20,184,166,.3);-webkit-tap-highlight-color:transparent;min-height:48px;justify-content:center;">
        <span style="font-size:18px;line-height:1;">📋</span>
        <span>Tracker</span>
      </a>
    `;

    document.body.appendChild(stickyBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else {
    buildFooter();
  }
})();
