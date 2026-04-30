/* apex-research-flow.js
 * Wires every peptide encyclopedia page into the new research-hub flow:
 *
 * 1. Hijacks "Add to My Stack" links (currently → protocol-tracker.html?add=X).
 *    Instead: writes the page's own slug to localStorage.apex_selection
 *    and shows a modal asking "Add another peptide?" vs "Build my protocol now."
 *
 * 2. Hijacks "Back to Encyclopedia" links (currently → index.html).
 *    Reroutes to research-hub.html so users stay in the research flow.
 *
 * Idempotent — safe to load on every peptide page. Does nothing on pages
 * that don't have the legacy buttons.
 */
(function(){
  'use strict';

  // The peptide's own slug = current HTML filename
  function currentSlug(){
    const path = location.pathname.split('/').pop() || '';
    if (!path || !path.endsWith('.html')) return null;
    return path;
  }

  // Add slug to apex_selection (dedup, preserve order)
  function addToSelection(slug){
    let sel = [];
    try { sel = JSON.parse(localStorage.getItem('apex_selection') || '[]'); } catch(_) {}
    if (!Array.isArray(sel)) sel = [];
    if (!sel.includes(slug)) sel.push(slug);
    try { localStorage.setItem('apex_selection', JSON.stringify(sel)); } catch(_) {}
    return sel.length;
  }

  // Build & show the post-add modal
  function showPostAddModal(slug, count){
    if (document.getElementById('apex-post-add-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-post-add-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(8,12,16,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;animation:apexFadeIn .2s ease;';
    overlay.innerHTML = '\
      <style>@keyframes apexFadeIn{from{opacity:0}to{opacity:1}}@keyframes apexSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style>\
      <div style="background:#0d1318;border:1px solid #1a2d3a;border-radius:14px;padding:28px 26px;max-width:440px;width:100%;animation:apexSlideUp .25s ease;box-shadow:0 20px 60px rgba(0,0,0,.6);">\
        <div style="font-size:48px;text-align:center;margin-bottom:14px;">✓</div>\
        <div style="font-family:Rajdhani,sans-serif;font-weight:700;font-size:22px;color:#00ff9d;text-align:center;letter-spacing:-.3px;margin-bottom:8px;">Added to your stack</div>\
        <div style="font-size:13px;color:#cbd5e1;text-align:center;line-height:1.5;margin-bottom:22px;">' +
          '<strong style="color:#fff;">' + count + '</strong> peptide' + (count === 1 ? '' : 's') + ' in your stack so far. Want to keep researching, or build your protocol?\
        </div>\
        <div style="display:flex;flex-direction:column;gap:10px;">\
          <a href="research-hub.html" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;background:transparent;border:1px solid #1a2d3a;color:#cbd5e1;font-family:Rajdhani,sans-serif;font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-radius:8px;-webkit-tap-highlight-color:transparent;">📚 Add another peptide</a>\
          <a href="compare.html" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;background:linear-gradient(135deg,#00ff9d,#10b981);color:#080c10;font-family:Rajdhani,sans-serif;font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-radius:8px;box-shadow:0 4px 16px rgba(0,255,157,.3);-webkit-tap-highlight-color:transparent;">⚡ Build my protocol →</a>\
          <button type="button" id="apex-post-add-close" style="background:transparent;border:0;color:#7a8d99;font-family:Share Tech Mono,monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;padding:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Close · keep reading</button>\
        </div>\
      </div>';
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('#apex-post-add-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e){
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    try { if (navigator.vibrate) navigator.vibrate([20, 30, 20]); } catch(_) {}
  }

  // Hijack any link whose href matches the legacy add-to-stack pattern
  function wireAddToStack(){
    const slug = currentSlug();
    if (!slug) return;
    document.querySelectorAll('a[href*="protocol-tracker.html?add="]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const count = addToSelection(slug);
        showPostAddModal(slug, count);
      });
    });
  }

  // Reroute "Back to Encyclopedia" links to research-hub.html
  function wireBackButton(){
    document.querySelectorAll('a[href="index.html"]').forEach(a => {
      const txt = (a.textContent || '').toLowerCase();
      // Only retarget links that look like a back-to-encyclopedia button.
      // Keep brand/home links pointing to index.html.
      if (txt.includes('back to encyclopedia') || txt.includes('encyclopedia')) {
        a.setAttribute('href', 'research-hub.html');
      }
    });
  }

  function init(){
    wireAddToStack();
    wireBackButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
