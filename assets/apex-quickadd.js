/* apex-quickadd.js — REPURPOSED 2026-04-27
   The original Cmd+K quick-add was retired.
   This file now serves as the "every-page" hook to:
   1. Purge any stale quickadd / persona modal DOM
   2. Lazy-load apex-back-button.js — gives every page a ← Back chip
*/
(function () {
  'use strict';

  function purge() {
    document.querySelectorAll('#apex-quickadd-pill, #apex-quickadd-modal, #apex-quickadd-overlay, #apex-persona-overlay').forEach(el => el.remove());
  }

  function loadBackButton() {
    if (document.querySelector('script[data-apex-back]')) return;
    const s = document.createElement('script');
    s.src = 'assets/apex-back-button.js';
    s.defer = true;
    s.setAttribute('data-apex-back', '1');
    document.head.appendChild(s);
  }

  function init(){
    purge();
    loadBackButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
