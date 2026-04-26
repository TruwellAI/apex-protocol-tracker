/* ═════════════════════════════════════════════════════════════
   APEX SELECTION PANEL — multi-select + sticky analysis bar
   Loads on browse.html. Lets users tick peptides, see live
   conflict/synergy/efficiency analysis, and continue to
   reconstitution + protocol setup.
   ═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── PEPTIDE METADATA (mechanism, conflict groups, cross-category tags) ──
  // Conflict groups: peptides in the same group fight each other (e.g., 2 GLP-1s = waste)
  // Cross-tags: peptides that show up in MULTIPLE category views (e.g., MOTS-c = longevity AND fat loss)
  const META = {
    // file slug → { name, conflict, synergies, crosstags, mechanism }
    'aod9604.html':      { name:'AOD-9604',      conflict:null,         crosstags:['fatloss'],            mech:'GH fragment lipolysis' },
    '5amino1mq.html':    { name:'5-Amino-1MQ',   conflict:null,         crosstags:['fatloss'],            mech:'NNMT inhibitor' },
    'slu-pp-322.html':   { name:'SLU-PP-332',    conflict:null,         crosstags:['fatloss'],            mech:'ERRα agonist' },
    'retatrutide.html':  { name:'Retatrutide',   conflict:'glp1',       crosstags:['fatloss'],            mech:'Triple G agonist' },
    'semaglutide.html':  { name:'Semaglutide',   conflict:'glp1',       crosstags:['fatloss'],            mech:'GLP-1 agonist' },
    'tirzepatide.html':  { name:'Tirzepatide',   conflict:'glp1',       crosstags:['fatloss'],            mech:'GLP-1 + GIP' },
    'melanotan1.html':   { name:'Melanotan I',   conflict:'melanocortin', crosstags:['libido'],           mech:'MC1R agonist' },
    'melanotan2.html':   { name:'Melanotan II',  conflict:'melanocortin', crosstags:['fatloss','libido'], mech:'MC1-4R agonist' },
    'pt141.html':        { name:'PT-141',        conflict:'melanocortin', crosstags:['libido'],           mech:'MC4R agonist' },
    'ipamorelin.html':   { name:'Ipamorelin',    conflict:'ghrelin',    crosstags:['gh'],                 mech:'Ghrelin / GHS-R' },
    'cjc1295-dac.html':  { name:'CJC-1295 DAC',  conflict:'ghrh',       crosstags:['gh'],                 mech:'GHRH analog (DAC)' },
    'cjc-no-dac.html':   { name:'CJC-1295',      conflict:'ghrh',       crosstags:['gh'],                 mech:'GHRH analog' },
    'sermorelin.html':   { name:'Sermorelin',    conflict:'ghrh',       crosstags:['gh'],                 mech:'GHRH analog' },
    'tesamorelin.html':  { name:'Tesamorelin',   conflict:'ghrh',       crosstags:['gh','fatloss'],       mech:'GHRH (visceral fat)' },
    'cjc-ipa-blend.html':{ name:'CJC + Ipa',     conflict:'ghrh',       crosstags:['gh'],                 mech:'GHRH + Ghrelin blend' },
    'igf1-lr3.html':     { name:'IGF-1 LR3',     conflict:'igf',        crosstags:['gh'],                 mech:'IGF-1 analog' },
    'bpc157.html':       { name:'BPC-157',       conflict:null,         crosstags:['repair'],             mech:'Body protective compound' },
    'tb500.html':        { name:'TB-500',        conflict:null,         crosstags:['repair'],             mech:'Thymosin Beta-4' },
    'ghkcu.html':        { name:'GHK-Cu',        conflict:null,         crosstags:['repair','longevity'], mech:'Copper tripeptide' },
    'kpv.html':          { name:'KPV',           conflict:null,         crosstags:['repair'],             mech:'Anti-inflammatory tripeptide' },
    'll37.html':         { name:'LL-37',         conflict:null,         crosstags:['repair'],             mech:'Cathelicidin AMP' },
    'thymosin-alpha1.html':{ name:'Thymosin α1', conflict:null,         crosstags:['repair'],             mech:'Immune modulator' },
    'ara290.html':       { name:'ARA-290',       conflict:null,         crosstags:['repair','neuro'],     mech:'EPO derivative' },
    'epitalon.html':     { name:'Epitalon',      conflict:null,         crosstags:['longevity'],          mech:'Telomerase activator' },
    'ss31.html':         { name:'SS-31',         conflict:null,         crosstags:['longevity'],          mech:'Mitochondrial peptide' },
    'motsc.html':        { name:'MOTS-c',        conflict:null,         crosstags:['longevity','fatloss'],mech:'Mitokine / AMPK' },
    'cartalax.html':     { name:'Cartalax',      conflict:null,         crosstags:['longevity','repair'], mech:'Bioregulator (cartilage)' },
    'fox04-dri.html':    { name:'FOX04-DRI',     conflict:null,         crosstags:['longevity'],          mech:'Senolytic' },
    'glutathione.html':  { name:'Glutathione',   conflict:null,         crosstags:['longevity','supplements'], mech:'Master antioxidant' },
    'nad-plus.html':     { name:'NAD+',          conflict:null,         crosstags:['longevity','supplements'], mech:'Mitochondrial cofactor' },
    'selank.html':       { name:'Selank',        conflict:null,         crosstags:['neuro'],              mech:'Anxiolytic neuropeptide' },
    'semax.html':        { name:'Semax',         conflict:null,         crosstags:['neuro'],              mech:'BDNF upregulator' },
    'dsip.html':         { name:'DSIP',          conflict:null,         crosstags:['neuro'],              mech:'Delta sleep peptide' },
    'dihexa.html':       { name:'Dihexa',        conflict:null,         crosstags:['neuro'],              mech:'HGF mimetic / synaptogenesis' },
    'pe2228.html':       { name:'PE-22-28',      conflict:null,         crosstags:['neuro'],              mech:'TREK-1 modulator' },
    'l-carnitine.html':  { name:'L-Carnitine',   conflict:null,         crosstags:['supplements','fatloss'], mech:'Fat oxidation cofactor' },
    'glutamine.html':    { name:'Glutamine',     conflict:null,         crosstags:['supplements','repair'], mech:'Gut + immune amino' },
    'wolverine.html':    { name:'Wolverine Stack', conflict:null,       crosstags:['repair'],             mech:'BPC + TB-500 + GHK' },
    'klow.html':         { name:'KLOW Stack',    conflict:null,         crosstags:['repair'],             mech:'KPV + TB + BPC + GHK' },
    'glow.html':         { name:'GLOW Stack',    conflict:null,         crosstags:['repair'],             mech:'GHK + TB + BPC' },
    'cardiac-stack.html':{ name:'Cardiac Stack', conflict:null,         crosstags:['longevity','repair'], mech:'Heart-focused stack' },
    'longevity-stack.html':{ name:'Longevity Stack', conflict:null,     crosstags:['longevity'],          mech:'Multi-peptide longevity' },
    'mito-reset.html':   { name:'Mito Reset',    conflict:null,         crosstags:['longevity'],          mech:'Mitochondrial protocol' }
  };

  // Conflict-group human-readable labels
  const CONFLICT_LABELS = {
    glp1:        'GLP-1 receptor (incretin)',
    ghrh:        'GHRH receptor',
    ghrelin:     'Ghrelin / GHS-R',
    melanocortin:'Melanocortin receptor',
    igf:         'IGF-1 receptor'
  };

  // ── STATE ──
  const STORAGE_KEY = 'apex_selection';
  let selection = loadSelection();
  let selectMode = false; // toggled by sticky bar

  function loadSelection() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) { return []; }
  }
  function saveSelection() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selection)); } catch (e) {}
  }

  // ── CROSS-TAG VISIBILITY ──
  // When a category view is active (body.cat-open + visible block has data-cat="fatloss"),
  // also reveal peptides from OTHER categories that are cross-tagged with that lane.
  function applyCrossTags() {
    document.querySelectorAll('.peptide-card[data-cross-tagged]').forEach(c => {
      c.removeAttribute('data-cross-tagged');
      c.style.display = '';
    });

    const activeBlock = document.querySelector('.category-block.cat-visible');
    if (!activeBlock) return; // no category filter active — show all
    const activeCat = activeBlock.dataset.cat;
    if (!activeCat) return;

    // Find every peptide-card whose href is cross-tagged with activeCat
    document.querySelectorAll('.peptide-card[href]').forEach(card => {
      const slug = card.getAttribute('href').replace(/^.\//, '').split('?')[0].split('#')[0];
      const meta = META[slug];
      if (!meta) return;
      if (!meta.crosstags || !meta.crosstags.includes(activeCat)) return;

      // Check if this card is already inside the active block — if not, clone-show it
      const parentBlock = card.closest('.category-block');
      if (parentBlock === activeBlock) return; // already visible
      // This card is in a hidden block. Show it under the active block as a cross-tag.
      // Easiest: clone and append to activeBlock's grid.
      const grid = activeBlock.querySelector('.peptide-grid');
      if (!grid) return;
      // Avoid duplicates if already cloned
      if (grid.querySelector('[data-clone-of="' + slug + '"]')) return;

      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone-of', slug);
      clone.setAttribute('data-cross-tagged', '1');
      // small "cross-tag" badge
      const badge = document.createElement('div');
      badge.textContent = '+ also in ' + activeCat;
      badge.style.cssText = 'position:absolute;top:6px;right:6px;font:700 8px/1 "Share Tech Mono",monospace;letter-spacing:.15em;color:#fbbf24;background:rgba(251,191,36,.12);padding:3px 6px;border-radius:3px;text-transform:uppercase;';
      clone.style.position = 'relative';
      clone.appendChild(badge);
      grid.appendChild(clone);

      // Re-inject checkbox on the clone
      injectCheckbox(clone);
    });
  }

  // ── CHECKBOX INJECTION ──
  function injectCheckbox(card) {
    if (card.querySelector('.apex-sel-check')) return;
    const slug = (card.getAttribute('href') || '').replace(/^.\//, '').split('?')[0].split('#')[0];
    if (!slug || !META[slug]) return;

    const cb = document.createElement('div');
    cb.className = 'apex-sel-check';
    cb.setAttribute('role', 'checkbox');
    cb.setAttribute('aria-checked', selection.includes(slug) ? 'true' : 'false');
    cb.setAttribute('data-slug', slug);
    cb.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (selection.includes(slug)) cb.classList.add('checked');
    card.appendChild(cb);

    // Click on checkbox → toggle, prevent navigation
    cb.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSelect(slug, cb, card);
    });

    // If select mode is on, clicking ANYWHERE on the card toggles instead of navigating
    card.addEventListener('click', function (e) {
      if (!selectMode) return;
      e.preventDefault();
      toggleSelect(slug, cb, card);
    }, true);
  }

  function toggleSelect(slug, cb, card) {
    const i = selection.indexOf(slug);
    if (i >= 0) {
      selection.splice(i, 1);
      cb.classList.remove('checked');
      cb.setAttribute('aria-checked', 'false');
      card.classList.remove('apex-selected');
    } else {
      selection.push(slug);
      cb.classList.add('checked');
      cb.setAttribute('aria-checked', 'true');
      card.classList.add('apex-selected');
    }
    saveSelection();
    renderStickyBar();
  }

  // ── ANALYSIS ENGINE ──
  function analyze() {
    const sel = selection.map(s => Object.assign({ slug: s }, META[s])).filter(p => p.name);
    const conflicts = {};
    sel.forEach(p => {
      if (!p.conflict) return;
      conflicts[p.conflict] = conflicts[p.conflict] || [];
      conflicts[p.conflict].push(p);
    });
    const conflictPairs = [];
    Object.keys(conflicts).forEach(k => {
      if (conflicts[k].length > 1) {
        conflictPairs.push({
          group: k,
          label: CONFLICT_LABELS[k] || k,
          peptides: conflicts[k]
        });
      }
    });
    return { count: sel.length, sel: sel, conflicts: conflictPairs };
  }

  // ── STICKY BAR (TOP) ──
  function ensureStickyBar() {
    let bar = document.getElementById('apex-sticky-sel');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'apex-sticky-sel';
    bar.innerHTML = `
      <div class="ss-inner">
        <div class="ss-left">
          <div class="ss-count" id="ss-count">0 selected</div>
          <div class="ss-mode">
            <button id="ss-toggle" type="button">⚡ Select Mode</button>
          </div>
        </div>
        <div class="ss-mid" id="ss-callouts"></div>
        <div class="ss-right">
          <button id="ss-clear" type="button" class="ss-btn-ghost">Clear</button>
          <button id="ss-continue" type="button" class="ss-btn-primary">Continue →</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#ss-toggle').addEventListener('click', () => {
      selectMode = !selectMode;
      document.body.classList.toggle('apex-select-mode', selectMode);
      bar.querySelector('#ss-toggle').textContent = selectMode ? '👆 Tap to Open Pages' : '⚡ Select Mode';
    });
    bar.querySelector('#ss-clear').addEventListener('click', () => {
      selection = []; saveSelection();
      document.querySelectorAll('.apex-sel-check.checked').forEach(c => { c.classList.remove('checked'); c.setAttribute('aria-checked','false'); });
      document.querySelectorAll('.peptide-card.apex-selected').forEach(c => c.classList.remove('apex-selected'));
      renderStickyBar();
    });
    bar.querySelector('#ss-continue').addEventListener('click', () => {
      if (selection.length === 0) {
        alert('Pick at least one peptide first.');
        return;
      }
      // Save & route to reconstitution screen (built next phase)
      saveSelection();
      location.href = 'reconstitute.html';
    });
    return bar;
  }

  function renderStickyBar() {
    const bar = ensureStickyBar();
    const a = analyze();
    bar.querySelector('#ss-count').textContent = a.count + (a.count === 1 ? ' selected' : ' selected');
    bar.classList.toggle('has-selection', a.count > 0);

    const callouts = bar.querySelector('#ss-callouts');
    callouts.innerHTML = '';
    if (a.count === 0) {
      callouts.innerHTML = '<div class="ss-hint">Tap ⚡ Select Mode, then tap peptides to add them</div>';
      return;
    }

    // Conflicts (red)
    a.conflicts.forEach(c => {
      const names = c.peptides.map(p => p.name).join(' + ');
      const el = document.createElement('div');
      el.className = 'ss-callout ss-bad';
      el.innerHTML = '<span class="ss-dot"></span><strong>Conflict:</strong> ' + names + ' both hit ' + c.label + ' — pick one or you\'re wasting product';
      callouts.appendChild(el);
    });

    // If 4+ selected with no conflicts, show efficiency note
    if (a.count >= 4 && a.conflicts.length === 0) {
      const el = document.createElement('div');
      el.className = 'ss-callout ss-ok';
      el.innerHTML = '<span class="ss-dot"></span><strong>Clean stack.</strong> ' + a.count + ' peptides, no receptor conflicts. You\'re hitting unique mechanisms.';
      callouts.appendChild(el);
    }

    // If 1-3 selected with no conflicts, just confirm
    if (a.count > 0 && a.count < 4 && a.conflicts.length === 0) {
      const el = document.createElement('div');
      el.className = 'ss-callout ss-ok';
      el.innerHTML = '<span class="ss-dot"></span>No conflicts detected. Continue to set up your protocol.';
      callouts.appendChild(el);
    }
  }

  // ── INIT ──
  function init() {
    // Inject checkboxes on every peptide card
    document.querySelectorAll('.peptide-card').forEach(injectCheckbox);
    // Mark already-selected cards
    document.querySelectorAll('.peptide-card[href]').forEach(card => {
      const slug = card.getAttribute('href').replace(/^.\//, '').split('?')[0].split('#')[0];
      if (selection.includes(slug)) card.classList.add('apex-selected');
    });
    ensureStickyBar();
    renderStickyBar();

    // Re-apply cross-tags whenever a category opens
    const observer = new MutationObserver(() => {
      applyCrossTags();
      // Newly-cloned cards need checkboxes
      document.querySelectorAll('.peptide-card[data-cross-tagged]').forEach(injectCheckbox);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.querySelectorAll('.category-block').forEach(b => {
      observer.observe(b, { attributes: true, attributeFilter: ['class'] });
    });
    applyCrossTags();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
