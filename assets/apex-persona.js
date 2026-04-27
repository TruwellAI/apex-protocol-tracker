/* apex-persona.js — DEPRECATED 2026-04-27
   Persona modal removed from app. Experience level is now picked
   in the research-hub flow via the 4-tile Hub (New / Builder / etc).
   Detail pages no longer pop a modal.
   This stub purges any stale modal DOM and exits.
*/
(function () {
  'use strict';
  function purge() {
    document.querySelectorAll('#apex-persona-overlay, #apex-persona-modal, [data-apex-persona]').forEach(el => el.remove());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purge);
  } else {
    purge();
  }
})();
