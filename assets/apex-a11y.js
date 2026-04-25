/* ═════════════════════════════════════════════════════════════
   APEX A11Y — accessibility upgrades:
   - ARIA labels on icon-only buttons
   - Focus traps in modal overlays
   - Keyboard navigation (Tab + Esc)
   - Screen reader announcements for toasts
   - Reduced motion respect
   - Skip-to-content link
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexA11yLoaded) return;
  window._apexA11yLoaded = true;

  // ── Reduced motion respect ───────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── ARIA labels on common icon-only buttons ──────────────────────
  function addAriaLabels() {
    document.querySelectorAll('button, a').forEach((el) => {
      if (el.hasAttribute('aria-label') || el.dataset.a11yDone === '1') return;
      const text = (el.textContent || '').trim();
      const titleAttr = el.getAttribute('title');
      // If text is just an icon/emoji or single character, infer label
      if (text.length <= 2 && titleAttr) {
        el.setAttribute('aria-label', titleAttr);
      } else if (text.length <= 2 && !titleAttr) {
        // Common icons
        const map = { '✕': 'Close', '×': 'Close', '←': 'Back', '→': 'Next', '?': 'Help', '✎': 'Edit', '🗑': 'Delete', '＋': 'Add', '+': 'Add', '⏸': 'Pause', '▶': 'Play' };
        if (map[text]) el.setAttribute('aria-label', map[text]);
      }
      el.dataset.a11yDone = '1';
    });
  }
  addAriaLabels();
  new MutationObserver(addAriaLabels).observe(document.body, { childList: true, subtree: true });

  // ── Live region for screen reader announcements ─────────────────
  let liveRegion = document.getElementById('apex-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'apex-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(liveRegion);
  }
  window.apexAnnounce = function(msg) {
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => { liveRegion.textContent = msg; }, 50);
    }
  };
  // Auto-announce toasts
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.id === 'apex-toast') {
          const text = n.textContent.trim();
          if (text) window.apexAnnounce(text);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  // ── Focus trap inside open modals ────────────────────────────────
  let trappedModal = null;
  let lastFocusedBeforeModal = null;
  function trapFocus(modalEl) {
    if (!modalEl) return;
    lastFocusedBeforeModal = document.activeElement;
    trappedModal = modalEl;
    const focusables = modalEl.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    setTimeout(() => first.focus(), 100);
    modalEl._a11yKeydown = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    modalEl.addEventListener('keydown', modalEl._a11yKeydown);
  }
  function releaseFocus() {
    if (trappedModal && trappedModal._a11yKeydown) {
      trappedModal.removeEventListener('keydown', trappedModal._a11yKeydown);
    }
    trappedModal = null;
    if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) {
      try { lastFocusedBeforeModal.focus(); } catch(e) {}
    }
  }
  // Watch for modals appearing
  new MutationObserver(() => {
    const overlays = document.querySelectorAll('[id$="-overlay"]');
    let visible = null;
    overlays.forEach((o) => {
      if (o.style.display === 'flex' || (o.id !== 'modal-overlay' && o.parentElement)) {
        visible = o;
      }
    });
    if (visible && trappedModal !== visible) {
      releaseFocus();
      trapFocus(visible);
      visible.setAttribute('role', 'dialog');
      visible.setAttribute('aria-modal', 'true');
    } else if (!visible && trappedModal) {
      releaseFocus();
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // ── Skip-to-content link (visible on Tab focus) ──────────────────
  if (!document.getElementById('apex-skip-link')) {
    const main = document.querySelector('main, [role="main"], .main, #tab-today, .wrap');
    if (main) {
      if (!main.id) main.id = 'apex-main';
      const skip = document.createElement('a');
      skip.id = 'apex-skip-link';
      skip.href = '#' + main.id;
      skip.textContent = 'Skip to content';
      skip.style.cssText = 'position:absolute;left:-9999px;top:0;background:#14b8a6;color:#fff;padding:10px 16px;z-index:99999;border-radius:0 0 8px 0;font-family:"Share Tech Mono",monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;';
      skip.addEventListener('focus', () => { skip.style.left = '0'; });
      skip.addEventListener('blur', () => { skip.style.left = '-9999px'; });
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }

  // ── Keyboard escape closes any open modal ────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const overlays = document.querySelectorAll('[id$="-overlay"]');
    overlays.forEach((o) => {
      if (o.style.display === 'flex') {
        if (o.id === 'modal-overlay') {
          try { window.closeModal(); } catch(err) {}
        } else {
          o.remove();
        }
      }
    });
  });
})();
