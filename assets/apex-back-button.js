/* apex-back-button.js — Universal back-button enforcer.
   Ensures every page has a "← Back" affordance for mobile users
   in PWA / standalone mode where the browser back is hidden.
   Skips the landing page (index.html) — there's nowhere to go back to.
*/
(function () {
  'use strict';

  function getCurrentPage() {
    const path = location.pathname.split('/').pop() || 'index.html';
    return path.toLowerCase();
  }

  function isLanding() {
    const p = getCurrentPage();
    return p === '' || p === 'index.html' || p === 'index.htm' || p === '/';
  }

  function alreadyHasBack() {
    // Look for any element with text "← Back" / class back-btn / id apex-back
    if (document.querySelector('#apex-back, .back-btn, .apex-back-btn')) return true;
    const candidates = document.querySelectorAll('a, button');
    for (let i = 0; i < candidates.length; i++) {
      const t = (candidates[i].textContent || '').trim();
      if (/^\s*[←‹<]\s*(back|home|encyclopedia|tracker)/i.test(t)) return true;
    }
    return false;
  }

  function chooseBackHref() {
    // Smart back: peptide detail pages → encyclopedia, encyclopedia → hub, others → home
    const p = getCurrentPage();
    const detailPages = /^(bpc157|tb500|aod9604|5amino1mq|retatrutide|semaglutide|tirzepatide|cjc|ipamorelin|sermorelin|tesamorelin|igf1|ghkcu|kpv|ll37|thymosin-alpha1|ara290|epitalon|ss31|motsc|cartalax|fox04-dri|glutathione|nad-plus|selank|semax|dsip|dihexa|pe2228|melanotan|pt141|slu-pp-322|l-carnitine|glutamine|wolverine|klow|glow|cardiac-stack|longevity-stack|mito-reset|nutrition|reset)\.html$/i;
    if (detailPages.test(p)) return 'browse.html?from=hub';
    if (p === 'browse.html') return 'research-hub.html';
    if (p === 'wizard.html' || p === 'basics.html' || p === 'compare.html' || p === 'research.html') return 'research-hub.html';
    if (p === 'protocol-tracker.html' || p === 'reconstitute.html' || p === 'protocol-summary.html') return 'index.html';
    if (p === 'research-hub.html') return 'index.html';
    return 'index.html';
  }

  function inject() {
    if (isLanding()) return;
    if (alreadyHasBack()) return;

    // Build floating ← Back chip
    const btn = document.createElement('a');
    btn.id = 'apex-back';
    btn.href = chooseBackHref();
    btn.setAttribute('aria-label', 'Back');
    btn.textContent = '← Back';
    btn.style.cssText = [
      'position:fixed',
      'top:max(10px, env(safe-area-inset-top))',
      'left:10px',
      'z-index:300',
      'font-family:"Share Tech Mono", monospace',
      'font-size:10px',
      'letter-spacing:.22em',
      'text-transform:uppercase',
      'color:#cbd5e1',
      'text-decoration:none',
      'padding:8px 12px',
      'background:rgba(8,12,16,.8)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'border:1px solid rgba(0,255,157,.35)',
      'border-radius:6px',
      'transition:all .15s',
      'cursor:pointer',
      '-webkit-tap-highlight-color:transparent'
    ].join(';');

    btn.addEventListener('mouseenter', () => {
      btn.style.color = '#00ff9d';
      btn.style.borderColor = '#00ff9d';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = '#cbd5e1';
      btn.style.borderColor = 'rgba(0,255,157,.35)';
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
