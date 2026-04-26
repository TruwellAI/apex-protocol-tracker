/* ═════════════════════════════════════════════════════════════
   APEX PERSONA — adaptive UX based on user experience level.
   Stored in localStorage as 'apex_level': 'beginner' | 'intermediate' | 'advanced'

   First-visit modal asks once. Profile lets users change anytime.
   The level adjusts:
   - Tooltip density (beginner = more, advanced = none)
   - Default verbosity (beginner = friendlier copy, advanced = compact)
   - Quick-add availability (advanced gets it instantly)
   - Wizard skip (advanced bypasses)
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (window._apexPersonaLoaded) return;
  window._apexPersonaLoaded = true;

  const KEY = 'apex_level';

  function getLevel() {
    return localStorage.getItem(KEY) || '';
  }
  window.apexLevel = getLevel;

  function setLevel(level, opts) {
    opts = opts || {};
    localStorage.setItem(KEY, level);
    document.documentElement.dataset.apexLevel = level;
    try { window.dispatchEvent(new CustomEvent('apex:levelchange', { detail: level })); } catch(e) {}
    if (window.apexHaptic) window.apexHaptic('success');
    // Fire to GHL for segmentation
    try {
      if (window.apexTrack) window.apexTrack('persona_level_set', { level });
    } catch(e) {}
    if (opts.toast !== false) {
      try { window.showToast && window.showToast('success', 'Got it', 'Apex is now tuned for ' + label(level) + '.'); } catch(e) {}
    }
  }
  window.apexSetLevel = setLevel;

  function label(level) {
    return { beginner: 'beginner-friendly', intermediate: 'standard', advanced: 'power-user' }[level] || 'standard';
  }

  // Apply current level to documentElement so CSS can react
  document.documentElement.dataset.apexLevel = getLevel() || 'intermediate';

  // ── First-visit modal ─────────────────────────────────────────
  function showLevelPicker(opts) {
    opts = opts || {};
    if (document.getElementById('apex-level-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-level-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.94);z-index:99996;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Barlow",sans-serif;animation:apexLevelIn .3s cubic-bezier(.2,.8,.2,1);';
    overlay.innerHTML = ''+
      '<style>'+
        '@keyframes apexLevelIn{from{opacity:0;}to{opacity:1;}}'+
        '@keyframes apexLevelTileIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}'+
        '.apex-level-tile{animation:apexLevelTileIn .35s cubic-bezier(.2,.8,.2,1) both;}'+
        '.apex-level-tile:nth-child(1){animation-delay:50ms;}'+
        '.apex-level-tile:nth-child(2){animation-delay:120ms;}'+
        '.apex-level-tile:nth-child(3){animation-delay:190ms;}'+
      '</style>'+
      '<div style="background:#0d1318;border:1px solid rgba(0,255,157,.25);border-radius:12px;max-width:560px;width:100%;padding:32px 28px 24px;">'+
        '<div style="text-align:center;margin-bottom:24px;">'+
          '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.28em;color:#00ff9d;text-transform:uppercase;margin-bottom:10px;">⚙ TUNE YOUR APEX</div>'+
          '<div style="font-family:\'Rajdhani\',sans-serif;font-size:26px;font-weight:700;color:#fff;line-height:1.15;margin-bottom:6px;letter-spacing:-.3px;">Have you used peptides before?</div>'+
          '<div style="font-size:13px;color:#cbd5e1;line-height:1.5;">We\'ll adapt the interface so you see the right level of detail. Change anytime in Profile.</div>'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;gap:10px;">'+
          tile('beginner', '🌱', 'I\'m brand new', 'Walk me through it. Plain English. Show me what each thing means.') +
          tile('intermediate', '⚡', 'A few cycles in', 'Smart defaults. Show me the engine. Let me dial in details.') +
          tile('advanced', '🚀', 'I run protocols regularly', 'Skip the basics. Maximum density, keyboard shortcuts, fast.') +
        '</div>'+
        (opts.dismissible !== false
          ? '<div style="text-align:center;margin-top:20px;"><button onclick="document.getElementById(\'apex-level-overlay\').remove();window.apexSetLevel(\'intermediate\',{toast:false});" style="background:transparent;border:0;color:#94a3b8;font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.15em;padding:8px 14px;cursor:pointer;text-transform:uppercase;">Skip · use defaults</button></div>'
          : '')+
      '</div>';
    document.body.appendChild(overlay);
  }

  function tile(level, icon, name, desc) {
    return '<button class="apex-level-tile" onclick="window.apexSetLevel(\''+level+'\');document.getElementById(\'apex-level-overlay\').remove();" style="text-align:left;background:#0f1820;border:1.5px solid rgba(148,163,184,.18);border-radius:10px;padding:18px 20px;cursor:pointer;font-family:inherit;display:flex;gap:14px;align-items:center;transition:transform .15s,border-color .15s,background .15s;-webkit-tap-highlight-color:transparent;min-height:72px;" onmouseover="this.style.borderColor=\'#00ff9d\';this.style.background=\'#12222c\';this.style.transform=\'translateY(-1px)\';" onmouseout="this.style.borderColor=\'rgba(148,163,184,.18)\';this.style.background=\'#0f1820\';this.style.transform=\'\';">'+
      '<span style="font-size:32px;line-height:1;flex-shrink:0;">'+icon+'</span>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-family:\'Rajdhani\',sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:-.2px;">'+name+'</div>'+
        '<div style="font-size:13px;color:#cbd5e1;line-height:1.45;margin-top:3px;">'+desc+'</div>'+
      '</div>'+
    '</button>';
  }
  window.openLevelPicker = showLevelPicker;

  // Show on first visit if no level is set yet — but ONLY on tracker or landing,
  // not on encyclopedia pages where it would interrupt research
  function maybeShowFirstVisit() {
    if (getLevel()) return;
    const path = (location.pathname || '').toLowerCase();
    const isTracker = /protocol-tracker\.html/.test(path);
    const isLanding = /\/index\.html$|\/$/.test(path) || path === '';
    if (!isTracker && !isLanding) return;
    // Wait 2s after first paint so the page settles first
    setTimeout(() => { if (!getLevel()) showLevelPicker(); }, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeShowFirstVisit);
  } else {
    maybeShowFirstVisit();
  }
})();
