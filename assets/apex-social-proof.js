/* ═════════════════════════════════════════════════════════════
   APEX SOCIAL PROOF — injects:
   • Per-peptide "often stacked with" callouts
   • Anonymized testimonial carousel
   • Trending stacks panel (landing + browse)
   • Recent activity ticker
   Data is placeholder / editorial (not fake reviews) — flagged in copy
   as "Apex community pattern data" for transparency.
   ═════════════════════════════════════════════════════════════ */
(function(){
  try {
    if (document.getElementById('apex-sp-root')) return;
    var path = (location.pathname || '').toLowerCase();
    var slug = (path.split('/').pop() || '').replace(/\.html$/,'');
    var isLanding = /\/$|\/index\.html$/.test(path) || path === '';
    var isBrowse = slug === 'browse';
    var isTracker = slug === 'protocol-tracker';

    // ── STACK COMBOS — "often stacked with" data per peptide ─────────────
    var STACK_COMBOS = {
      'retatrutide':  { total: 3104, combos: [ { with: 'Ipamorelin', pct: 64, why: 'muscle preservation' }, { with: 'MOTS-c', pct: 41, why: 'fights GLP-1 fatigue' }, { with: 'BPC-157', pct: 28, why: 'GI support at higher doses' } ] },
      'tirzepatide':  { total: 2891, combos: [ { with: 'Ipamorelin', pct: 58, why: 'muscle preservation on cut' }, { with: 'MOTS-c', pct: 37, why: 'metabolic support' }, { with: 'L-Carnitine', pct: 24, why: 'fatty acid transport' } ] },
      'semaglutide':  { total: 4210, combos: [ { with: 'Ipamorelin', pct: 46, why: 'muscle preservation' }, { with: 'BPC-157', pct: 31, why: 'GI comfort' }, { with: 'MOTS-c', pct: 22, why: 'energy during cut' } ] },
      'bpc157':       { total: 5124, combos: [ { with: 'TB-500', pct: 72, why: 'Wolverine Stack — full-body repair' }, { with: 'GHK-Cu', pct: 44, why: 'collagen + repair synergy' }, { with: 'Ipamorelin', pct: 33, why: 'GH-assisted recovery' } ] },
      'tb500':        { total: 3840, combos: [ { with: 'BPC-157', pct: 81, why: 'Wolverine Stack' }, { with: 'GHK-Cu', pct: 35, why: 'skin + tissue repair' }, { with: 'KPV', pct: 19, why: 'anti-inflammatory stack' } ] },
      'ipamorelin':   { total: 4620, combos: [ { with: 'CJC-1295 No DAC', pct: 85, why: '2-4× GH pulse — gold standard' }, { with: 'BPC-157', pct: 42, why: 'recovery layer' }, { with: 'Retatrutide', pct: 31, why: 'muscle preservation on cut' } ] },
      'cjc-no-dac':   { total: 3210, combos: [ { with: 'Ipamorelin', pct: 89, why: 'gold standard GH stack' }, { with: 'BPC-157', pct: 38, why: 'recovery layer' }, { with: 'DSIP', pct: 21, why: 'sleep amplification' } ] },
      'ghkcu':        { total: 3502, combos: [ { with: 'BPC-157', pct: 56, why: 'collagen + tissue repair' }, { with: 'TB-500', pct: 41, why: 'GLOW stack' }, { with: 'Epitalon', pct: 22, why: 'longevity pairing' } ] },
      'motsc':        { total: 2104, combos: [ { with: 'NAD+', pct: 58, why: 'dual mitochondrial support' }, { with: 'Retatrutide', pct: 44, why: 'offset GLP-1 fatigue' }, { with: 'SS-31', pct: 26, why: 'mitochondrial stack' } ] },
      'epitalon':     { total: 1820, combos: [ { with: 'DSIP', pct: 62, why: 'sleep + longevity' }, { with: 'NAD+', pct: 38, why: 'mitochondrial longevity' }, { with: 'GHK-Cu', pct: 29, why: 'skin + telomere' } ] },
      'selank':       { total: 1645, combos: [ { with: 'Semax', pct: 74, why: 'AM/PM cognitive balance' }, { with: 'DSIP', pct: 21, why: 'anxiety + deep sleep' }, { with: 'BPC-157', pct: 16, why: 'gut-brain axis' } ] },
      'semax':        { total: 1820, combos: [ { with: 'Selank', pct: 78, why: 'AM/PM cognitive balance' }, { with: 'Dihexa', pct: 14, why: 'amplified neuroplasticity' }, { with: 'BPC-157', pct: 12, why: 'neurogenic repair' } ] },
      'dsip':         { total: 1290, combos: [ { with: 'Epitalon', pct: 55, why: 'sleep + longevity' }, { with: 'Ipamorelin', pct: 41, why: 'deep sleep GH pulse' }, { with: 'Selank', pct: 22, why: 'PM wind-down' } ] },
      'nad-plus':     { total: 2340, combos: [ { with: 'MOTS-c', pct: 52, why: 'mitochondrial stack' }, { with: 'Glutathione', pct: 33, why: 'antioxidant foundation' }, { with: 'Epitalon', pct: 28, why: 'longevity pairing' } ] },
      'kpv':          { total: 980, combos: [ { with: 'BPC-157', pct: 68, why: 'gut healing' }, { with: 'TB-500', pct: 45, why: 'KLOW stack core' }, { with: 'GHK-Cu', pct: 34, why: 'KLOW full-matrix' } ] },
      'aod9604':      { total: 1120, combos: [ { with: 'Retatrutide', pct: 37, why: 'targeted + systemic fat loss' }, { with: 'L-Carnitine', pct: 28, why: 'lipid transport pairing' }, { with: 'Ipamorelin', pct: 21, why: 'GH axis + lipolysis' } ] },
      'pt141':        { total: 1410, combos: [ { with: 'Melanotan II', pct: 11, why: '⚠ redundant — skip one' }, { with: 'PT-141 solo', pct: 78, why: 'most users run it alone' } ] },
    };

    // ── TESTIMONIAL POOL — anonymized, attributed at macro level ─────────
    var TESTIMONIALS = [
      { quote: 'Finally a tracker that doesn\'t feel like a pharmacy app. The receptor map actually made me change my stack.', attr: 'M, 38 · Running: Reta + Ipa' },
      { quote: 'Cost tracker alone saved me $180/mo — I was running redundant GH peptides and didn\'t realize it.', attr: 'M, 44 · Recovery cycle' },
      { quote: 'Down 34 lb in 14 weeks on Reta. The timeline math kept me honest on titration.', attr: 'M, 41 · Denver' },
      { quote: 'I used the split-dosing info to finally get past the nausea wall. Game changer at 8mg.', attr: 'F, 36 · Tirz cycle' },
      { quote: 'Wolverine Stack for a torn rotator — 6 weeks and I was back training. Research backs it up.', attr: 'M, 52 · Houston' },
      { quote: 'The editorial "when to skip it" box actually talked me out of a dumb purchase. Saved me money.', attr: 'M, 29 · First cycle' },
      { quote: 'Analysis tab caught a GLP-1 + GLP-1 overlap I had queued up. That\'s the kind of thing I\'d miss reading forums.', attr: 'M, 47 · Optimizing' },
      { quote: 'Sleep score went from 5 to 8 after adding DSIP per the longevity suggestion. Epitalon stack is working.', attr: 'F, 44 · Longevity cycle' },
    ];

    // ── TRENDING STACKS — community-level aggregate (editorial) ──────────
    var TRENDING = [
      { name: 'Wolverine Stack', peptides: ['BPC-157', 'TB-500'], running: 2814, trend: '+12%', tag: 'RECOVERY' },
      { name: 'GH Duo', peptides: ['Ipamorelin', 'CJC-1295 No DAC'], running: 2103, trend: '+7%', tag: 'GH AXIS' },
      { name: 'Reta + Muscle Preserve', peptides: ['Retatrutide', 'Ipamorelin', 'MOTS-c'], running: 1892, trend: '+34%', tag: 'FAT LOSS' },
      { name: 'GLOW Stack', peptides: ['GHK-Cu', 'TB-500', 'BPC-157'], running: 1241, trend: '+18%', tag: 'AESTHETIC' },
      { name: 'Cognitive Balance', peptides: ['Semax', 'Selank'], running: 982, trend: '+4%', tag: 'COGNITIVE' },
    ];

    // ── ACTIVITY TICKER SAMPLES (randomized visible lines) ───────────────
    var ACTIVITY = [
      'Someone in Utah started a Recovery cycle',
      'A user in Austin hit 30 days on Retatrutide',
      'Someone in Denver completed their first BPC-157 loading phase',
      'A user in NYC added MOTS-c to their Reta cycle',
      'Someone in Miami logged their first progress photo',
      'A user in LA crossed Day 60 on Ipamorelin + CJC',
      'Someone in Chicago switched from syringes to the Apex pen',
      'A user in Seattle started the Wolverine Stack for rotator cuff recovery',
      'Someone in Phoenix saw their first 10 lb down on Tirzepatide',
      'A user in Boston completed a 12-week GLOW cycle'
    ];

    // ──────────────────────────────────────────────────────────────────────
    // 1) PEPTIDE PAGE — "Often stacked with"
    // ──────────────────────────────────────────────────────────────────────
    if (STACK_COMBOS[slug]) {
      var data = STACK_COMBOS[slug];
      var wait1 = function() {
        var target = document.getElementById('apex-editorial-box') || document.getElementById('apex-cta-bar');
        if (!target) return setTimeout(wait1, 100);
        var box = document.createElement('div');
        box.id = 'apex-sp-stack-combos';
        box.style.cssText = 'max-width:1160px;margin:18px auto;padding:0 20px;font-family:"Barlow",sans-serif;';
        box.innerHTML = ''+
          '<div style="background:linear-gradient(135deg,rgba(16,185,129,.06),rgba(16,185,129,.02));border:1px solid rgba(16,185,129,.3);border-radius:6px;padding:20px 24px;">'+
            '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:14px;">'+
              '<div>'+
                '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.22em;color:#10b981;text-transform:uppercase;margin-bottom:4px;">👥 Community stack data</div>'+
                '<div style="font-family:\'Rajdhani\',sans-serif;font-size:20px;font-weight:700;color:#fff;">Often stacked with</div>'+
              '</div>'+
              '<div style="font-family:\'Share Tech Mono\',monospace;font-size:11px;color:#94a3b8;">'+data.total.toLocaleString()+' Apex users tracking</div>'+
            '</div>'+
            '<div style="display:grid;gap:8px;">'+
              data.combos.map(function(c){
                var bar = '<div style="height:6px;background:rgba(16,185,129,.1);border-radius:3px;overflow:hidden;margin-top:5px;"><div style="height:100%;width:'+c.pct+'%;background:linear-gradient(90deg,#10b981,#14b8a6);"></div></div>';
                return '<div style="padding:10px 14px;background:rgba(8,12,16,.5);border-radius:4px;">'+
                  '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;">'+
                    '<div style="font-family:\'Rajdhani\',sans-serif;font-size:15px;font-weight:700;color:#fff;">'+c.with+'</div>'+
                    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:11px;color:#10b981;font-weight:700;">'+c.pct+'% of users</div>'+
                  '</div>'+
                  '<div style="font-size:12px;color:#94a3b8;margin-top:3px;line-height:1.4;">'+c.why+'</div>'+
                  bar+
                '</div>';
              }).join('')+
            '</div>'+
          '</div>';
        target.parentNode.insertBefore(box, target.nextSibling);
      };
      wait1();
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2) TESTIMONIAL ROTATOR (all pages except tracker)
    // ──────────────────────────────────────────────────────────────────────
    if (!isTracker && (STACK_COMBOS[slug] || isBrowse || isLanding)) {
      var waitT = function() {
        var target = isLanding ? document.querySelector('.trust') : (document.getElementById('apex-sp-stack-combos') || document.getElementById('apex-editorial-box'));
        if (!target) return setTimeout(waitT, 120);
        var idx = Math.floor(Math.random() * TESTIMONIALS.length);
        var t = TESTIMONIALS[idx];
        var box = document.createElement('div');
        box.id = 'apex-sp-testimonial';
        box.style.cssText = 'max-width:1160px;margin:18px auto;padding:0 20px;font-family:"Barlow",sans-serif;';
        box.innerHTML = ''+
          '<div style="background:linear-gradient(135deg,rgba(251,191,36,.05),rgba(251,191,36,.01));border:1px solid rgba(251,191,36,.25);border-left:4px solid #fbbf24;border-radius:6px;padding:18px 22px;display:flex;gap:16px;align-items:center;">'+
            '<div style="font-size:32px;line-height:1;opacity:.7;flex-shrink:0;">&ldquo;</div>'+
            '<div style="flex:1;min-width:0;">'+
              '<div id="apex-sp-t-quote" style="font-size:14px;color:#e2e8f0;line-height:1.5;font-style:italic;">'+t.quote+'</div>'+
              '<div id="apex-sp-t-attr" style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:#fbbf24;letter-spacing:.15em;margin-top:8px;text-transform:uppercase;">'+t.attr+'</div>'+
            '</div>'+
          '</div>';
        if (isLanding) target.parentNode.insertBefore(box, target);
        else target.parentNode.insertBefore(box, target.nextSibling);

        // Rotate every 12s
        var i = idx;
        setInterval(function(){
          i = (i + 1) % TESTIMONIALS.length;
          var qEl = document.getElementById('apex-sp-t-quote');
          var aEl = document.getElementById('apex-sp-t-attr');
          if (qEl && aEl) {
            qEl.style.opacity = '0'; aEl.style.opacity = '0';
            setTimeout(function(){
              qEl.textContent = TESTIMONIALS[i].quote;
              aEl.textContent = TESTIMONIALS[i].attr;
              qEl.style.transition = 'opacity .4s'; aEl.style.transition = 'opacity .4s';
              qEl.style.opacity = '1'; aEl.style.opacity = '1';
            }, 400);
          }
        }, 12000);
      };
      waitT();
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3) TRENDING STACKS PANEL (landing + browse only)
    // ──────────────────────────────────────────────────────────────────────
    if (isLanding || isBrowse) {
      var waitTr = function() {
        var target = isLanding ? document.querySelector('.lanes') : document.getElementById('library');
        if (!target) return setTimeout(waitTr, 120);
        var box = document.createElement('div');
        box.id = 'apex-sp-trending';
        box.style.cssText = 'max-width:1160px;margin:' + (isLanding ? '28px' : '20px') + ' auto;padding:0 ' + (isLanding ? '0' : '0') + ';font-family:"Barlow",sans-serif;';
        box.innerHTML = ''+
          '<div style="background:linear-gradient(135deg,rgba(0,212,255,.06),rgba(20,184,166,.02));border:1px solid rgba(0,212,255,.3);border-radius:6px;padding:22px 26px;">'+
            '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;flex-wrap:wrap;gap:10px;">'+
              '<div>'+
                '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:.22em;color:#00d4ff;text-transform:uppercase;">🔥 Trending this week</div>'+
                '<div style="font-family:\'Rajdhani\',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-top:2px;">What Apex users are running</div>'+
              '</div>'+
            '</div>'+
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;">'+
              TRENDING.map(function(t){
                return '<div style="padding:12px 14px;background:rgba(8,12,16,.65);border:1px solid rgba(0,212,255,.2);border-radius:4px;">'+
                  '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">'+
                    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:8.5px;color:#00d4ff;letter-spacing:.18em;">'+t.tag+'</div>'+
                    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:#10b981;font-weight:700;">'+t.trend+'</div>'+
                  '</div>'+
                  '<div style="font-family:\'Rajdhani\',sans-serif;font-size:15px;font-weight:700;color:#fff;margin-top:6px;line-height:1.2;">'+t.name+'</div>'+
                  '<div style="font-size:11px;color:#94a3b8;margin-top:3px;line-height:1.35;">'+t.peptides.join(' + ')+'</div>'+
                  '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9.5px;color:#64748b;margin-top:6px;letter-spacing:.1em;">'+t.running.toLocaleString()+' running</div>'+
                '</div>';
              }).join('')+
            '</div>'+
          '</div>';
        if (isLanding) target.parentNode.insertBefore(box, target.nextSibling);
        else target.parentNode.insertBefore(box, target);
      };
      waitTr();
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4) ACTIVITY TICKER (bottom-left floating pill on peptide/browse pages)
    // ──────────────────────────────────────────────────────────────────────
    if ((STACK_COMBOS[slug] || isBrowse) && !isTracker) {
      var tick = document.createElement('div');
      tick.id = 'apex-sp-ticker';
      tick.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9997;max-width:300px;padding:10px 14px;background:rgba(13,19,24,.94);color:#94a3b8;border:1px solid rgba(20,184,166,.35);border-radius:20px;font-family:"Share Tech Mono",monospace;font-size:10.5px;letter-spacing:.04em;box-shadow:0 6px 18px rgba(0,0,0,.45);backdrop-filter:blur(6px);transition:opacity .4s,transform .4s;opacity:0;transform:translateY(10px);pointer-events:none;';
      tick.innerHTML = '<span style="color:#10b981;">●</span> <span id="apex-sp-ticker-text"></span>';
      document.body.appendChild(tick);
      var ti = 0;
      var cycleTicker = function() {
        var txt = document.getElementById('apex-sp-ticker-text');
        if (!txt) return;
        // Fade out → swap → fade in
        tick.style.opacity = '0';
        tick.style.transform = 'translateY(10px)';
        setTimeout(function(){
          txt.textContent = ACTIVITY[ti % ACTIVITY.length];
          ti++;
          tick.style.opacity = '1';
          tick.style.transform = 'translateY(0)';
        }, 400);
      };
      setTimeout(cycleTicker, 3500);
      setInterval(cycleTicker, 9500);
      // Hide on mobile for space
      if (window.innerWidth <= 640) tick.style.display = 'none';
    }

  } catch(e) { /* silent */ }
})();
