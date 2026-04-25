/* ═════════════════════════════════════════════════════════════
   APEX MOBILE — single-file mobile UX upgrade pack.
   Drops onto every page. Idempotent. Detects iOS/Android.

   Includes:
   1. PWA install prompt (iOS + Android with proper instructions)
   2. Safe-area handling (notch + home indicator)
   3. iOS modal scroll lock (no body bleed-through)
   4. Haptic feedback on key interactions
   5. Swipe-down-to-dismiss for modals
   6. Native camera capture preference
   7. Pull-to-refresh on Today tab
   8. iOS-specific polish (text-size-adjust, tap highlights, etc.)
   9. Tap-target audit (auto-bumps anything <44px)
  10. Pinch-zoom for progress photos
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexMobileLoaded) return;
  window._apexMobileLoaded = true;

  const UA = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(UA) && !window.MSStream;
  const isAndroid = /Android/.test(UA);
  const isMobile = isIOS || isAndroid || window.innerWidth <= 768;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // ── 8. iOS-specific polish (CSS injected globally) ──────────────────
  const style = document.createElement('style');
  style.id = 'apex-mobile-style';
  style.textContent = `
    /* iOS text-size-adjust off so portrait/landscape doesn't resize */
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    /* Better momentum scrolling */
    body { -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
    /* Kill phone-number auto-detection on dose numbers */
    body { -webkit-touch-callout: default; }
    /* Universal tap highlight off (we use our own visual feedback) */
    a, button, [role="button"] { -webkit-tap-highlight-color: transparent; }

    /* SAFE AREAS for iPhone notch / Dynamic Island / home indicator */
    @supports (padding: env(safe-area-inset-top)) {
      body { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
      #mobile-bottom-nav { padding-bottom: max(env(safe-area-inset-bottom), 6px) !important; }
      #apex-nav-top { padding-top: env(safe-area-inset-top); }
      .modal-header { padding-top: max(env(safe-area-inset-top), 20px) !important; }
      #apex-toast { top: max(env(safe-area-inset-top), 20px) !important; }
      #apex-support-btn { bottom: calc(60px + env(safe-area-inset-bottom)) !important; }
      #apex-sp-ticker { bottom: calc(16px + env(safe-area-inset-bottom)) !important; }
      #apex-nav-pill-root { bottom: calc(16px + env(safe-area-inset-bottom)) !important; }
    }

    /* TAP TARGETS — bump anything that looks too small.
       Apple HIG = 44pt, Material = 48dp. We aim for 44px minimum. */
    @media (max-width: 768px) {
      button, a.btn-add, .cc-actions button, .btn-sm, .modal-close, .day-btn, .pdot,
      .tab-btn, .stat-card, [role="button"]:not([disabled]) {
        min-height: 44px;
        min-width: 44px;
      }
      .modal-close { min-height: 36px; min-width: 36px; padding: 6px 10px; }
      /* Cycle card edit/delete pills were 32px — now 40px with 8px around */
      .cc-actions a[title="Edit"], .cc-actions a[title="Delete"] {
        width: 40px !important; height: 40px !important;
      }
    }

    /* PINCH-ZOOM ON PROGRESS PHOTOS */
    .apex-photo-zoomable {
      touch-action: pinch-zoom;
      max-width: 100%;
      cursor: zoom-in;
    }
    .apex-photo-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.95);
      z-index: 100000; display: flex; align-items: center; justify-content: center;
      padding: 20px; cursor: zoom-out;
      animation: apexPhotoFadeIn .2s;
    }
    @keyframes apexPhotoFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .apex-photo-overlay img {
      max-width: 100%; max-height: 100%; object-fit: contain;
      touch-action: pinch-zoom;
    }

    /* PWA INSTALL PROMPT */
    #apex-pwa-prompt {
      position: fixed; left: 16px; right: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      z-index: 99998;
      background: linear-gradient(135deg, #0d1318, #12222c);
      border: 1.5px solid rgba(20,184,166,.5);
      border-radius: 14px;
      padding: 16px 18px;
      box-shadow: 0 12px 40px rgba(0,0,0,.65);
      display: flex; gap: 14px; align-items: center;
      font-family: 'Barlow', sans-serif;
      transform: translateY(calc(100% + 40px));
      transition: transform .35s cubic-bezier(.2,.8,.2,1);
    }
    #apex-pwa-prompt.show { transform: translateY(0); }
    #apex-pwa-prompt .pwa-icon { font-size: 28px; flex-shrink: 0; }
    #apex-pwa-prompt .pwa-text { flex: 1; min-width: 0; }
    #apex-pwa-prompt .pwa-title { font-family: 'Rajdhani',sans-serif; font-size: 15px; font-weight: 700; color: #fff; line-height: 1.2; }
    #apex-pwa-prompt .pwa-sub { font-size: 12px; color: #94a3b8; line-height: 1.4; margin-top: 2px; }
    #apex-pwa-prompt .pwa-close {
      background: transparent; border: 0; color: #64748b; font-size: 22px;
      padding: 4px 10px; cursor: pointer; line-height: 1; min-width: 36px; min-height: 36px;
    }
    #apex-pwa-prompt .pwa-cta {
      background: #14b8a6; color: #fff; border: 0; padding: 10px 14px;
      font-family: 'Share Tech Mono',monospace; font-size: 11px; font-weight: 700; letter-spacing: .12em;
      border-radius: 6px; cursor: pointer; text-transform: uppercase;
      min-height: 44px; white-space: nowrap;
    }

    /* PULL TO REFRESH */
    #apex-ptr-indicator {
      position: fixed; top: env(safe-area-inset-top, 0); left: 50%;
      transform: translateX(-50%) translateY(-50px);
      z-index: 99997; padding: 8px 16px;
      background: rgba(13,19,24,.95); border: 1px solid rgba(20,184,166,.4);
      color: #14b8a6; border-radius: 24px;
      font-family: 'Share Tech Mono',monospace; font-size: 11px; letter-spacing: .12em;
      transition: transform .2s;
      pointer-events: none;
    }

    /* SKELETON LOADERS */
    .apex-skeleton {
      background: linear-gradient(90deg, rgba(148,163,184,.06) 25%, rgba(148,163,184,.14) 50%, rgba(148,163,184,.06) 75%);
      background-size: 200% 100%;
      animation: apexShimmer 1.4s infinite;
      border-radius: 4px;
    }
    @keyframes apexShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* SPRING ANIMATIONS — tap feedback */
    @media (max-width: 768px) {
      button:active, a:active, [role="button"]:active { transform: scale(.97); }
    }
  `;
  document.head.appendChild(style);

  // ── 1. PWA install prompt ──────────────────────────────────────────
  let deferredInstallEvent = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallEvent = e;
  });

  function showInstallPrompt() {
    // Skip if already installed, dismissed recently, or not mobile
    if (isStandalone) return;
    if (!isMobile) return;
    try {
      const dismissed = localStorage.getItem('apex_pwa_dismissed_at');
      if (dismissed && (Date.now() - parseInt(dismissed,10)) < 14*86400000) return;
    } catch(e) {}
    if (document.getElementById('apex-pwa-prompt')) return;

    const prompt = document.createElement('div');
    prompt.id = 'apex-pwa-prompt';
    let cta, sub;
    if (isAndroid && deferredInstallEvent) {
      cta = '<button class="pwa-cta" id="pwa-install-btn">Install</button>';
      sub = 'Tap install to add Apex to your home screen';
    } else if (isIOS) {
      cta = '<button class="pwa-cta" id="pwa-show-ios-help">How?</button>';
      sub = 'Tap Share → Add to Home Screen';
    } else {
      cta = '<button class="pwa-cta" id="pwa-install-btn">Install</button>';
      sub = 'Get the Apex app on your home screen';
    }
    prompt.innerHTML =
      '<div class="pwa-icon">📱</div>' +
      '<div class="pwa-text">' +
        '<div class="pwa-title">Get Apex on your home screen</div>' +
        '<div class="pwa-sub">' + sub + '</div>' +
      '</div>' +
      cta +
      '<button class="pwa-close" id="pwa-close-btn">✕</button>';
    document.body.appendChild(prompt);
    requestAnimationFrame(() => prompt.classList.add('show'));

    document.getElementById('pwa-close-btn').onclick = () => {
      try { localStorage.setItem('apex_pwa_dismissed_at', String(Date.now())); } catch(e) {}
      prompt.classList.remove('show');
      setTimeout(() => prompt.remove(), 350);
    };
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.onclick = async () => {
      if (deferredInstallEvent) {
        deferredInstallEvent.prompt();
        const { outcome } = await deferredInstallEvent.userChoice;
        if (outcome === 'accepted') {
          try { localStorage.setItem('apex_pwa_installed', '1'); } catch(e) {}
        }
        deferredInstallEvent = null;
        prompt.remove();
      } else {
        showIOSInstructions();
      }
    };
    const iosHelp = document.getElementById('pwa-show-ios-help');
    if (iosHelp) iosHelp.onclick = showIOSInstructions;
  }

  function showIOSInstructions() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.94);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Barlow",sans-serif;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML =
      '<div style="background:#0d1318;border:1px solid rgba(20,184,166,.3);border-radius:14px;padding:28px;max-width:340px;text-align:center;">' +
        '<div style="font-size:48px;margin-bottom:14px;">📱</div>' +
        '<div style="font-family:\'Rajdhani\',sans-serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:14px;">Install Apex on iPhone</div>' +
        '<div style="text-align:left;font-size:14px;color:#cbd5e1;line-height:1.6;margin-bottom:22px;">' +
          '<div style="margin-bottom:12px;display:flex;gap:10px;align-items:flex-start;"><span style="background:#14b8a6;color:#080c10;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">1</span><span>Tap the <b>Share</b> button at the bottom of Safari (the box with arrow ↑)</span></div>' +
          '<div style="margin-bottom:12px;display:flex;gap:10px;align-items:flex-start;"><span style="background:#14b8a6;color:#080c10;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">2</span><span>Scroll and tap <b>Add to Home Screen</b></span></div>' +
          '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="background:#14b8a6;color:#080c10;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">3</span><span>Tap <b>Add</b> in the top right. Apex now lives on your home screen.</span></div>' +
        '</div>' +
        '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:#14b8a6;color:#fff;border:0;padding:12px 24px;border-radius:6px;font-family:\'Share Tech Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;cursor:pointer;text-transform:uppercase;min-height:44px;">Got it</button>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  // Show prompt after 30s of engagement OR 2 page views
  function maybePromptInstall() {
    const pv = parseInt(sessionStorage.getItem('apex_pv_count') || '0', 10);
    if (pv >= 2 || isIOS) {
      setTimeout(showInstallPrompt, 4000);
    } else {
      setTimeout(showInstallPrompt, 30000);
    }
  }

  // ── 3. iOS modal scroll lock fix ──────────────────────────────────
  let _scrollY = 0;
  function lockBodyScroll() {
    if (document.body.dataset.locked === '1') return;
    _scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + _scrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.dataset.locked = '1';
  }
  function unlockBodyScroll() {
    if (document.body.dataset.locked !== '1') return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.dataset.locked = '';
    window.scrollTo(0, _scrollY);
  }
  // Wrap original modal open/close to use the lock
  const _origOpenModal = window.openModal;
  if (_origOpenModal) {
    window.openModal = function(){ lockBodyScroll(); return _origOpenModal.apply(this, arguments); };
  }
  const _origCloseModal = window.closeModal;
  if (_origCloseModal) {
    window.closeModal = function(){ unlockBodyScroll(); return _origCloseModal.apply(this, arguments); };
  }
  // Watch for any modal overlay to appear and lock scroll
  const observer = new MutationObserver(() => {
    const overlays = document.querySelectorAll('[id$="-overlay"]:not([style*="display:none"]),[id$="-overlay"]:not([style*="display: none"])');
    let anyVisible = false;
    overlays.forEach(o => {
      const display = window.getComputedStyle(o).display;
      if (display !== 'none') anyVisible = true;
    });
    if (anyVisible) lockBodyScroll();
    else unlockBodyScroll();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // ── 4. Haptic feedback ────────────────────────────────────────────
  function haptic(intensity) {
    intensity = intensity || 'light';
    if (!navigator.vibrate) return;
    const patterns = { light: 8, medium: 14, heavy: 25, success: [10, 50, 12], error: [30, 100, 30] };
    try { navigator.vibrate(patterns[intensity] || 8); } catch(e) {}
  }
  window.apexHaptic = haptic;

  // Auto-haptic on selected interactions
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a.btn-primary, a.btn-hero, [data-haptic]');
    if (!target) return;
    if (target.dataset.haptic === 'heavy') haptic('heavy');
    else if (target.dataset.haptic === 'success') haptic('success');
    else haptic('light');
  }, { capture: true });

  // ── 5. Swipe-down-to-dismiss for modals ────────────────────────────
  function attachSwipeDownDismiss(modalEl, onDismiss) {
    let startY = 0, currentY = 0, dragging = false;
    const transition = 'transform .25s ease, opacity .25s ease';
    modalEl.style.transition = transition;
    const handle = modalEl.querySelector('.modal-header') || modalEl;
    handle.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      dragging = true;
      modalEl.style.transition = '';
    });
    handle.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const dy = Math.max(0, currentY - startY);
      modalEl.style.transform = `translateY(${dy}px)`;
      modalEl.style.opacity = String(Math.max(.5, 1 - dy/400));
    });
    handle.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      modalEl.style.transition = transition;
      const dy = currentY - startY;
      if (dy > 100) {
        modalEl.style.transform = 'translateY(100%)';
        modalEl.style.opacity = '0';
        setTimeout(() => onDismiss && onDismiss(), 250);
      } else {
        modalEl.style.transform = '';
        modalEl.style.opacity = '';
      }
    });
  }
  // Attach to any modal overlay that appears
  const swipeObserver = new MutationObserver(() => {
    document.querySelectorAll('[id$="-overlay"] .modal:not([data-swipe-attached])').forEach(m => {
      m.dataset.swipeAttached = '1';
      attachSwipeDownDismiss(m, () => {
        const overlay = m.closest('[id$="-overlay"]');
        if (overlay) {
          if (overlay.id === 'modal-overlay') { try { window.closeModal(); } catch(e) {} }
          else overlay.remove();
        }
      });
    });
  });
  swipeObserver.observe(document.body, { childList: true, subtree: true });

  // ── 6. Native camera capture preference for image inputs ──────────
  function bumpCameraCapture() {
    document.querySelectorAll('input[type="file"][accept*="image"]:not([data-capture-applied])').forEach(inp => {
      inp.dataset.captureApplied = '1';
      // capture="environment" hints to use the rear camera; iOS/Android open camera by default
      inp.setAttribute('capture', 'environment');
    });
  }
  bumpCameraCapture();
  setInterval(bumpCameraCapture, 1500); // catch dynamically-added inputs

  // ── 7. Pull-to-refresh on Today tab ────────────────────────────────
  if (isMobile && /protocol-tracker\.html|\/$/i.test(location.pathname)) {
    let ptrStartY = 0, ptrPulling = false, ptrIndicator = null;
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY > 0) return;
      if (e.touches.length !== 1) return;
      ptrStartY = e.touches[0].clientY;
      ptrPulling = true;
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!ptrPulling) return;
      const dy = e.touches[0].clientY - ptrStartY;
      if (dy <= 0) return;
      if (!ptrIndicator) {
        ptrIndicator = document.createElement('div');
        ptrIndicator.id = 'apex-ptr-indicator';
        ptrIndicator.textContent = 'PULL TO REFRESH';
        document.body.appendChild(ptrIndicator);
      }
      const distance = Math.min(dy * .5, 80);
      ptrIndicator.style.transform = 'translateX(-50%) translateY(' + (distance - 50) + 'px)';
      if (dy > 100) ptrIndicator.textContent = 'RELEASE TO REFRESH';
      else ptrIndicator.textContent = 'PULL TO REFRESH';
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (!ptrPulling) return;
      ptrPulling = false;
      const dy = parseFloat((ptrIndicator && ptrIndicator.style.transform.match(/translateY\(([^p]+)px/)||[])[1] || '0') + 50;
      if (ptrIndicator && dy > 100) {
        haptic('medium');
        ptrIndicator.textContent = 'REFRESHING…';
        try { if (typeof render === 'function') render(); } catch(e) {}
        setTimeout(() => { if (ptrIndicator) { ptrIndicator.remove(); ptrIndicator = null; } }, 400);
      } else if (ptrIndicator) {
        ptrIndicator.remove();
        ptrIndicator = null;
      }
    });
  }

  // ── 10. Pinch-zoom on progress photos ──────────────────────────────
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img.apex-photo-zoomable, #progress-timeline img, #progress-photo-preview img');
    if (!img) return;
    if (img.closest('.apex-photo-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'apex-photo-overlay';
    overlay.innerHTML = '<img src="' + img.src + '" alt="">';
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
    haptic('light');
  }, { capture: true });

  // ── Boot ──────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybePromptInstall);
  } else {
    maybePromptInstall();
  }
})();
