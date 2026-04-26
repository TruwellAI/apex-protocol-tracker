/* apex-quickadd.js — DEPRECATED
   The Cmd+K quick-add pill was redundant with the new flow
   (Landing → Research Hub → Browse → Reconstitute → Protocol).
   Disabled 2026-04-26.

   Removes any orphan pill DOM from previous sessions and exits.
*/
(function () {
  'use strict';
  function purge() {
    document.querySelectorAll('#apex-quickadd-pill, #apex-quickadd-modal, #apex-quickadd-overlay').forEach(el => el.remove());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purge);
  } else {
    purge();
  }
})();
