/* ═════════════════════════════════════════════════════════════
   APEX CAPACITOR BRIDGE
   When wrapped in Capacitor (iOS/Android native app), this lights
   up rich haptics, native share, secure storage, push notifications,
   status bar control, splash screen, and lifecycle events.

   On the web, all calls fall back to web standards or no-op.
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexCapLoaded) return;
  window._apexCapLoaded = true;

  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.apexIsNative = isNative;

  // ── Haptics — escalates apexHaptic() to native rich patterns when available ──
  if (isNative) {
    const Haptics = window.Capacitor.Plugins.Haptics;
    if (Haptics) {
      const map = {
        light:   { style: 'LIGHT' },
        medium:  { style: 'MEDIUM' },
        heavy:   { style: 'HEAVY' },
        success: { type: 'SUCCESS' },
        error:   { type: 'ERROR' },
        warn:    { type: 'WARNING' },
      };
      const original = window.apexHaptic;
      window.apexHaptic = function(intensity) {
        const cfg = map[intensity || 'light'];
        if (!cfg) return original && original(intensity);
        if (cfg.type) Haptics.notification({ type: cfg.type }).catch(()=>{});
        else Haptics.impact({ style: cfg.style }).catch(()=>{});
      };
    }
  }

  // ── Native share via Capacitor (better than navigator.share on iOS) ──
  if (isNative && window.Capacitor.Plugins.Share) {
    const Share = window.Capacitor.Plugins.Share;
    window.apexShare = (opts) => Share.share({
      title: opts.title || 'Apex',
      text: opts.text || '',
      url: opts.url || location.href,
      dialogTitle: opts.dialogTitle || 'Share Apex',
    }).catch(() => {});
  } else if (navigator.share) {
    window.apexShare = (opts) => navigator.share(opts).catch(() => {});
  } else {
    window.apexShare = (opts) => {
      try { navigator.clipboard.writeText(opts.url || opts.text || ''); } catch(e) {}
      try { window.apexAnnounce && window.apexAnnounce('Link copied'); } catch(e) {}
    };
  }

  // ── Secure storage (Capacitor Preferences plugin = encrypted on device) ──
  // Falls back to localStorage on web
  window.apexStore = (() => {
    if (isNative && window.Capacitor.Plugins.Preferences) {
      const P = window.Capacitor.Plugins.Preferences;
      return {
        get: (key) => P.get({ key }).then(r => r && r.value).catch(() => null),
        set: (key, value) => P.set({ key, value: String(value) }).catch(() => {}),
        remove: (key) => P.remove({ key }).catch(() => {}),
      };
    }
    return {
      get: (key) => Promise.resolve(localStorage.getItem(key)),
      set: (key, value) => Promise.resolve(localStorage.setItem(key, String(value))),
      remove: (key) => Promise.resolve(localStorage.removeItem(key)),
    };
  })();

  // ── Status bar (style hide/show on native) ──
  if (isNative && window.Capacitor.Plugins.StatusBar) {
    const SB = window.Capacitor.Plugins.StatusBar;
    SB.setStyle({ style: 'DARK' }).catch(() => {});
    SB.setBackgroundColor({ color: '#080c10' }).catch(() => {});
    window.apexStatusBar = SB;
  }

  // ── Splash screen (native control) ──
  if (isNative && window.Capacitor.Plugins.SplashScreen) {
    setTimeout(() => {
      window.Capacitor.Plugins.SplashScreen.hide().catch(() => {});
    }, 500);
  }

  // ── App lifecycle events ──
  if (isNative && window.Capacitor.Plugins.App) {
    const App = window.Capacitor.Plugins.App;
    App.addListener('appStateChange', (state) => {
      try { window.dispatchEvent(new CustomEvent('apex:appstate', { detail: state })); } catch(e) {}
      // Refresh data when app comes back to foreground
      if (state.isActive && typeof window.render === 'function') {
        setTimeout(() => { try { window.render(); } catch(e) {} }, 200);
      }
    });
    // Hardware back button on Android — close modals first
    App.addListener('backButton', () => {
      const overlays = document.querySelectorAll('[id$="-overlay"]');
      let handled = false;
      overlays.forEach((o) => {
        if (o.style.display === 'flex' || (o.id !== 'modal-overlay' && o.parentElement)) {
          if (o.id === 'modal-overlay') { try { window.closeModal(); } catch(e) {} }
          else o.remove();
          handled = true;
        }
      });
      if (!handled) {
        // Let app exit
        App.exitApp().catch(() => {});
      }
    });
  }

  // ── Push notifications (request permission + register) ──
  if (isNative && window.Capacitor.Plugins.PushNotifications) {
    const PN = window.Capacitor.Plugins.PushNotifications;
    window.apexEnablePush = async () => {
      try {
        const perm = await PN.requestPermissions();
        if (perm.receive === 'granted') {
          await PN.register();
        }
      } catch(e) {}
    };
    PN.addListener('registration', (token) => {
      try { localStorage.setItem('apex_push_token', token.value); } catch(e) {}
      // Forward to your backend / GHL when wired
      try {
        if (window.GHL_WEBHOOK_URL) {
          fetch(window.GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'push_token_registered',
              push_token: token.value,
              platform: window.Capacitor.getPlatform(),
              email: localStorage.getItem('apex_email') || null,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      } catch(e) {}
    });
    PN.addListener('pushNotificationReceived', (notif) => {
      try { window.dispatchEvent(new CustomEvent('apex:push', { detail: notif })); } catch(e) {}
    });
  } else {
    // Web push (when implemented later) — stub
    window.apexEnablePush = () => Promise.resolve();
  }

  // ── Offline detection ──
  function setOnlineStatus(online) {
    document.documentElement.dataset.online = online ? '1' : '0';
    if (!online) {
      // Show subtle offline banner
      if (document.getElementById('apex-offline-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'apex-offline-banner';
      banner.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0);left:0;right:0;z-index:99996;background:#dc2626;color:#fff;font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:.18em;padding:6px 14px;text-align:center;text-transform:uppercase;';
      banner.textContent = '⚡ OFFLINE — your data is saved locally';
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      const banner = document.getElementById('apex-offline-banner');
      if (banner) banner.remove();
    }
  }
  window.addEventListener('online', () => setOnlineStatus(true));
  window.addEventListener('offline', () => setOnlineStatus(false));
  if (!navigator.onLine) setOnlineStatus(false);

  // ── App shortcut / share target handling ──
  try {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const shared = params.get('shared');
    if (action === 'add' && /protocol-tracker\.html/i.test(location.pathname)) {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { try { window.openCategoryPicker(); } catch(e) {} }, 600);
      });
    } else if (action === 'goals' && /protocol-tracker\.html/i.test(location.pathname)) {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { try { window.openGoalsBuilder(); } catch(e) {} }, 600);
      });
    }
    if (shared === '1') {
      const sharedText = params.get('text') || '';
      const sharedUrl = params.get('url') || '';
      // If they shared a stack URL, attempt to import it
      if (sharedUrl && sharedUrl.includes('?stack=')) {
        try { history.replaceState({}, '', sharedUrl); window.location.reload(); } catch(e) {}
      }
    }
  } catch(e) {}
})();
