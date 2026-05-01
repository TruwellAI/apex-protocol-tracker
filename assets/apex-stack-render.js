/* ═══════════════════════════════════════════════════════════════
 * APEX STACK RENDER — central UI logic for every analysis page
 *
 * Single source of truth for:
 *   - Pharmacological interaction card rendering
 *   - Goal-aware grade takeaway copy ("drop Sema + Tirz, keep Reta")
 *   - Conflict + mechanism detection
 *
 * Loaded by: compare.html · protocol-sequencer.html · tracker-v2.html
 *            (any page that shows stack analysis)
 *
 * Depends on: window.APEX_PEPTIDES + window.APEX_INTERACTIONS (loaded via
 *             /data/peptide-data.js BEFORE this script)
 *
 * To ADD a new interaction or change a takeaway message:
 *   - Edit /data/interactions.json (data)
 *   - Edit this file (logic / copy)
 *   - Run: node scripts/build-peptide-data.js
 *   - Every page that uses these helpers updates automatically
 * ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── PHARMACOLOGY INTERACTION RENDERING ────────────────────────
  // One source for the orange/cyan/green card markup used in
  // compare.html, protocol-sequencer.html, and any future page.
  const SEV_COLORS = {
    high:    { bg:'rgba(255,107,53,.08)', border:'#FF6B35', label:'Heads up' },
    medium:  { bg:'rgba(0,212,255,.08)',  border:'#00D4FF', label:'Heads up' },
    synergy: { bg:'rgba(0,255,157,.08)',  border:'#00FF9D', label:'Synergy' }
  };

  function buildInteractionCard(ix, expanded) {
    const c = SEV_COLORS[ix.severity] || SEV_COLORS.medium;
    const cites = (ix.citations || []).map(s => `<li style="margin-bottom:3px;">${s}</li>`).join('');
    return `<details ${expanded ? 'open' : ''} style="background:${c.bg};border-left:3px solid ${c.border};border-radius:8px;margin-top:8px;overflow:hidden;">
      <summary style="padding:10px 14px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;font-weight:600;color:${c.border};font-size:13px;-webkit-tap-highlight-color:transparent;user-select:none;">
        ${ix.icon || '⚡'} <span style="flex:1;">${ix.title}</span>
        <span style="font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.12em;color:${c.border};text-transform:uppercase;opacity:.7;">${c.label} ▾</span>
      </summary>
      <div style="padding:0 14px 12px;line-height:1.55;color:#cbd5e1;font-size:13px;">
        <div style="margin-bottom:10px;">${ix.summary}</div>
        <div style="background:rgba(255,255,255,.04);border-left:2px solid #00ff9d;padding:8px 12px;border-radius:6px;margin-bottom:10px;">
          <strong style="color:#00ff9d;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">▸ The fix</strong><br>
          <span style="font-size:13px;">${ix.fix}</span>
        </div>
        ${cites ? `<details><summary style="cursor:pointer;color:#7a8d99;font-size:10px;font-family:'Share Tech Mono',monospace;letter-spacing:.1em;text-transform:uppercase;list-style:none;">▾ Citations</summary><ul style="margin:6px 0 0 18px;font-size:11px;color:#7a8d99;line-height:1.5;">${cites}</ul></details>` : ''}
      </div>
    </details>`;
  }

  /**
   * Render a complete top-level interaction alert into a container element.
   *  - When at least one HIGH severity interaction is present, the banner is
   *    orange and high-severity cards open by default.
   *  - When all interactions are medium/synergy, the banner is cyan and all
   *    cards stay closed.
   *  - When no interactions fire, container is hidden.
   *
   * @param {string[]} slugs   peptide slugs from the user's stack (with .html)
   * @param {Element}  el      DOM element to render into
   * @param {Object}   opts    { expandHighSeverity: bool, mode: 'top'|'inline' }
   * @returns {Object} { count, hasHigh, fired }
   */
  function renderInteractionsAlert(slugs, el, opts) {
    opts = opts || {};
    const mode = opts.mode || 'top';
    const expandHigh = opts.expandHighSeverity !== false;
    if (!el) return { count:0, hasHigh:false, fired:[] };
    if (!window.apexInteractionsForStack) {
      el.innerHTML = '';
      el.style.display = 'none';
      return { count:0, hasHigh:false, fired:[] };
    }
    const fired = window.apexInteractionsForStack(slugs);
    if (!fired.length) {
      el.innerHTML = '';
      el.style.display = 'none';
      return { count:0, hasHigh:false, fired:[] };
    }
    const hasHigh = fired.some(ix => ix.severity === 'high');
    el.style.display = '';

    if (mode === 'top') {
      const cards = fired.map(ix => buildInteractionCard(ix, expandHigh && ix.severity === 'high')).join('');
      el.innerHTML = `
        <div style="background:${hasHigh ? 'linear-gradient(135deg,rgba(255,107,53,.18),rgba(255,107,53,.06))' : 'linear-gradient(135deg,rgba(0,212,255,.14),rgba(0,212,255,.04))'};border:1px solid ${hasHigh ? 'rgba(255,107,53,.5)' : 'rgba(0,212,255,.4)'};border-radius:12px;padding:14px 16px;${hasHigh ? 'box-shadow:0 4px 18px rgba(255,107,53,.18);' : ''}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="font-size:22px;">${hasHigh ? '⚠️' : '⚡'}</div>
            <div style="flex:1;">
              <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:15px;color:${hasHigh ? '#FF6B35' : '#00D4FF'};letter-spacing:-.1px;line-height:1.2;">${fired.length} pharmacological interaction${fired.length>1?'s':''} in your stack</div>
              <div style="font-size:11px;color:#7a8d99;margin-top:2px;font-family:'Share Tech Mono',monospace;letter-spacing:.06em;">${hasHigh ? 'Action required — read before you ship' : 'Tap a card to see the mechanism + the fix'}</div>
            </div>
          </div>
          ${cards}
        </div>`;
    } else {
      // inline mode — used inside the verdict card or insights collapsible
      const cards = fired.map(ix => buildInteractionCard(ix, false)).join('');
      el.innerHTML = `
        <div style="font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${hasHigh?'#FF6B35':'#00D4FF'};margin-bottom:6px;">
          ${hasHigh ? '⚠️ ' : '⚡ '}${fired.length} pharmacological interaction${fired.length>1?'s':''} in this stack
        </div>
        ${cards}`;
    }
    return { count: fired.length, hasHigh, fired };
  }

  // ── GOAL-AWARE GRADE TAKEAWAY ─────────────────────────────────
  // One source for the "drop Sema + Tirz, keep Reta" smart copy.
  // Returns the inner HTML to drop into a takeaway element.
  function gradeTakeaway(ctx) {
    const { grade, primaryGoal, selectedSlugs, totalConflicts, uniqueMechCount, overallPct, goalsTouched } = ctx;
    const sel = new Set((selectedSlugs || []).map(s => String(s).replace(/\.html$/, '')));
    const has = (k) => sel.has(k);
    const hasAny = (arr) => arr.some(k => sel.has(k));
    const countIn = (arr) => arr.filter(k => sel.has(k)).length;

    let takeaway = '';

    if (primaryGoal === 'fatloss') {
      const glp1s = ['retatrutide','semaglutide','tirzepatide'];
      const glp1Count = countIn(glp1s);
      const hasReta = has('retatrutide');
      const hasTesa = has('tesamorelin');
      const hasAOD  = has('aod9604');
      const hasMOTS = has('motsc');
      const has5amino = has('5amino1mq');
      const hasCarn = has('l-carnitine');

      if (grade === 'A') {
        takeaway = `<strong>Elite fat-loss stack.</strong> GLP-1 lever + ${[hasAOD&&'AOD-9604',hasTesa&&'Tesamorelin',hasMOTS&&'MOTS-c',has5amino&&'5-Amino-1MQ'].filter(Boolean).slice(0,2).join(' + ') || 'metabolic boost'} layered on top, no redundancy. Don't add more — let this run 12-16 weeks before reassessing.`;
      } else if (grade === 'B') {
        const missing = [];
        if (glp1Count === 0) missing.push("a GLP-1 (Reta covers all 3 G's most efficiently)");
        if (!hasAOD && !hasTesa) missing.push('AOD-9604 or Tesamorelin for direct lipolysis');
        if (!hasCarn) missing.push('L-Carnitine pre-cardio (cheap foundation, big delta)');
        takeaway = `<strong>Solid fat-loss stack.</strong> ${missing.length ? 'One add unlocks A: ' + missing[0] + '.' : 'Zero conflicts, full mechanism coverage. Stick with it.'}`;
      } else if (grade === 'C') {
        if (glp1Count > 1) {
          const keepKey = hasReta ? 'retatrutide' : (has('tirzepatide') ? 'tirzepatide' : 'semaglutide');
          const keepName = hasReta ? 'Retatrutide' : (has('tirzepatide') ? 'Tirzepatide' : 'Semaglutide');
          const drops = glp1s.filter(g => sel.has(g) && g !== keepKey).map(d => d === 'semaglutide' ? 'Semaglutide' : (d === 'tirzepatide' ? 'Tirzepatide' : 'Retatrutide'));
          takeaway = `<strong>You'd be A-grade if you dropped duplicates.</strong> Pick ONE GLP-1 — recommend <strong>${keepName}</strong> ${hasReta ? '(triple agonist — covers GLP-1 + GIP + glucagon all in one shot)' : ''}. Drop ${drops.join(' and ')}. Same biology, half the cost.`;
        } else if (totalConflicts > 0) {
          takeaway = `<strong>Workable, but you're double-paying.</strong> ${totalConflicts} receptor conflict${totalConflicts===1?'':'s'} flagged above. Cut the redundancy and your stack jumps to a B.`;
        } else {
          const adds = [];
          if (glp1Count === 0) adds.push('a GLP-1 (Retatrutide if available, else Tirz or Sema)');
          if (!hasAOD) adds.push('AOD-9604 fasted-AM for direct lipolysis');
          if (!hasCarn) adds.push('L-Carnitine pre-cardio');
          takeaway = `<strong>Coverage is thin.</strong> Add ${adds.slice(0,2).join(' + ')} to unlock B.`;
        }
      } else {
        if (glp1Count === 0 && sel.size <= 2) {
          takeaway = `<strong>Start with the big lever.</strong> Pick a GLP-1 first — Retatrutide is the most efficient (covers GLP-1 + GIP + glucagon receptors all in one). Once that's titrated and dialed in (week 4-5), add AOD-9604 fasted-AM for direct lipolysis.`;
        } else if (totalConflicts > 0) {
          takeaway = `<strong>Reconsider.</strong> ${totalConflicts} conflict${totalConflicts===1?'':'s'} + low coverage. You're paying multiple times to hit the same receptor and missing most of fat-loss's pathways.`;
        } else {
          takeaway = `<strong>Sparse stack.</strong> Pick a GLP-1 (Reta is the workhorse) as your foundation. Add 1-2 layer peptides from there.`;
        }
      }
    }
    else if (primaryGoal === 'gh-axis') {
      const ghrh = ['cjc1295-dac','cjc-no-dac','sermorelin','tesamorelin'];
      const ghrp = ['ipamorelin','cjc-ipa-blend'];
      const hasGhrh = hasAny(ghrh);
      const hasGhrp = hasAny(ghrp);
      const hasIgf = has('igf1-lr3');
      const ghrhCount = countIn(ghrh);

      if (grade === 'A') {
        takeaway = `<strong>Elite GH-axis stack.</strong> GHRH + GHRP synergy ${hasIgf ? '+ IGF-1 LR3 amplification' : ''}, zero redundancy. Inject pre-bed empty-stomach for the strongest natural GH pulse.`;
      } else if (grade === 'C' && ghrhCount > 1) {
        takeaway = `<strong>You'd be A-grade if you dropped duplicates.</strong> CJC-1295, Sermorelin, and Tesamorelin all hit the GHRH receptor — pick one. CJC-1295 DAC is the most cost-efficient (1-2 mg/wk vs daily). Keep Ipamorelin separately — it pulls from a different mechanism (ghrelin/GHRP).`;
      } else if (!hasGhrh && hasGhrp) {
        takeaway = `<strong>You're missing half the synergy.</strong> Ipamorelin (GHRP) alone gives a moderate pulse. Pair it with a GHRH analog (CJC-1295 most popular) and the combined pulse is bigger than the sum — amp + speaker for the pituitary.`;
      } else if (hasGhrh && !hasGhrp) {
        takeaway = `<strong>Add Ipamorelin to amplify.</strong> GHRH alone pushes GH from one direction. Stack Ipa (GHRP — pulls from another) and the synergistic pulse is significantly larger than either alone.`;
      } else if (grade === 'D') {
        takeaway = `<strong>Start with CJC-1295 + Ipamorelin.</strong> The classic GH-axis pair — GHRH + GHRP synergy. Run pre-bed empty-stomach for 12 weeks on / 4 off. Add IGF-1 LR3 post-workout once dialed in.`;
      } else {
        takeaway = `<strong>${grade === 'B' ? 'Solid' : 'Workable'} GH-axis stack.</strong> ${overallPct}% coverage. Inject pre-bed empty-stomach for the strongest pulse.`;
      }
    }
    else if (primaryGoal === 'recovery') {
      const hasBPC = has('bpc157');
      const hasTB  = has('tb500');
      const hasGHK = has('ghkcu');
      const hasKLOW = has('klow');
      const hasGLOW = has('glow');
      const hasKpv = has('kpv');
      const hasThy = has('thymosin-alpha1');

      if ((hasGHK && hasTB) || hasKLOW || hasGLOW) {
        takeaway = `<strong>⚠ Chemistry warning.</strong> GHK-Cu's copper degrades TB-500 in the same vial. Run them in SEPARATE bottles, or alternate 4-week pulses (TB weeks 1-4, GHK weeks 5-8). KLOW/GLOW combo bottles are convenient but lose potency in 7 days.`;
      } else if (hasBPC && hasTB && grade !== 'A') {
        takeaway = `<strong>Solid pair.</strong> BPC-157 (local protection) + TB-500 (systemic migration) is the gold-standard healing duo. Run as a 4-6 week pulse together, then 4 weeks OFF — continuous use loses effectiveness.`;
      } else if (grade === 'A') {
        takeaway = `<strong>Elite recovery stack.</strong> Multiple healing mechanisms covered — BPC + TB synergy${hasKpv ? ' + KPV gut/dermal' : ''}${hasThy ? ' + thymic immune support' : ''}. Run as a 4-6 week pulse, off-period mandatory.`;
      } else if (grade === 'D') {
        takeaway = `<strong>Start with BPC-157 + TB-500.</strong> The base healing pair. BPC for local tissue protection, TB-500 for systemic angiogenesis + cell migration. 4-6 week pulse, then 4 weeks off.`;
      } else {
        takeaway = `<strong>${grade === 'B' ? 'Solid' : 'Workable'} recovery stack.</strong> ${overallPct}% coverage. Pulse 4-6 weeks on, 4 off — never continuous.`;
      }
    }
    else if (primaryGoal === 'longevity') {
      const hasFox = has('fox04-dri');
      const hasEpi = has('epitalon');
      const hasMOTS = has('motsc');
      const hasNAD = has('nad-plus');
      const hasSS31 = has('ss31');
      const pulseConflicts = ['fox04-dri','epitalon','cartalax'].filter(p => sel.has(p)).length;

      if (hasMOTS && !hasNAD) {
        takeaway = `<strong>You're running MOTS-c half-loaded.</strong> NAD+ is the substrate biogenesis runs on. Load NAD+ 2-4 weeks BEFORE MOTS-c (100mg 2x/wk), then maintain 1x/wk during the cycle. Without NAD+, MOTS-c is 50% effective.`;
      } else if (hasSS31 && hasMOTS && grade !== 'A') {
        takeaway = `<strong>Sequence matters: MOTS-c FIRST, SS-31 second.</strong> MOTS-c builds new mitochondria. SS-31 repairs them. Running them simultaneously (or SS-31 first) wastes the SS-31 on old mitos that are about to be replaced.`;
      } else if (hasFox && hasEpi) {
        takeaway = `<strong>FOX04 → Epitalon — order is critical.</strong> Senolytic must clear damaged cells BEFORE telomerase extends the survivors. Schedule: FOX04 5-day pulse → 4-week wash → Epitalon 10-20 day pulse. Sequencer auto-orders this.`;
      } else if (pulseConflicts >= 2) {
        takeaway = `<strong>Multiple pulse peptides selected.</strong> FOX04, Epitalon, Cartalax are all 1-2x per year protocols. Spread them across the calendar — see the 52-week sequencer for the optimal year-order.`;
      } else if (grade === 'A') {
        takeaway = `<strong>Elite longevity stack.</strong> Senolytic + telomerase + biogenesis + repair sequenced correctly. The full hallmarks-of-aging coverage.`;
      } else if (grade === 'D') {
        takeaway = `<strong>Start with the foundation: NAD+ + Glutathione.</strong> Daily metabolic support. Add MOTS-c for mitochondrial biogenesis once NAD+ is loaded. Pulse peptides (FOX04, Epitalon) come 1-2x per year as targeted resets.`;
      } else {
        takeaway = `<strong>${grade === 'B' ? 'Solid' : 'Workable'} longevity stack.</strong> ${overallPct}% mechanism coverage. Sequence matters — see the 52-week view for optimal ordering.`;
      }
    }
    else if (primaryGoal === 'trt') {
      const tCount = ['testosterone-cyp','testosterone-enth','testosterone-prop'].filter(t => sel.has(t)).length;
      if (tCount > 1) {
        takeaway = `<strong>Pick ONE testosterone ester.</strong> Stacking Cyp + Enth + Prop is just the same hormone delivered with different release curves — running them simultaneously creates unpredictable serum levels. Cyp is the standard (8-day half-life, 2x/wk Mon+Thu).`;
      } else if (tCount === 1) {
        takeaway = `<strong>TRT covered.</strong> Aromatase in adipose tissue converts testosterone to estradiol — the more body fat you have, the more T → E2 spillover. Drop body fat alongside if possible. Get baseline labs + 6-week labs (sensitive E2, hematocrit, lipids, PSA).`;
      } else {
        takeaway = `<strong>TRT requires Rx.</strong> Testosterone is prescription-only. This goal is for tracking purposes — actual prescribing happens through a licensed provider.`;
      }
    }
    else if (primaryGoal === 'cognitive') {
      const hasSelank = has('selank');
      const hasSemax = has('semax');
      if (hasSelank && hasSemax) {
        takeaway = `<strong>Alternate Selank ↔ Semax.</strong> Both build tolerance fast. Pulse Selank weeks 1-4, switch to Semax weeks 5-8, back to Selank weeks 9-12. Daily continuous use of either flattens the response within a month.`;
      } else if (grade === 'A') {
        takeaway = `<strong>Elite cognitive stack.</strong> Multiple mechanisms covered (anxiolytic + nootropic + sleep). Pulse — never continuous.`;
      } else {
        takeaway = `<strong>${grade === 'D' ? 'Start with' : 'Add'} Selank + Semax + DSIP.</strong> Anxiolytic + nootropic + sleep — the cognitive trifecta. Pulse 4 weeks on, 2 off.`;
      }
    }
    else if (primaryGoal === 'libido') {
      takeaway = `<strong>PT-141 is on-demand.</strong> Inject 45 min before activity. No daily cycling needed. Melanotan II adds tan + libido lift for daily users — 2x weekly maintenance after a 10-day loading phase.`;
    }

    // Fallback for any goal we haven't customized yet
    if (!takeaway) {
      if (grade === 'A') takeaway = `<strong>Elite stack.</strong> ${uniqueMechCount} mechanisms hit, zero conflicts.`;
      else if (grade === 'B') takeaway = `<strong>Solid stack.</strong> ${uniqueMechCount} unique mechanisms, no doorbell-ringing-twice.`;
      else if (grade === 'C') takeaway = totalConflicts > 0 ? `<strong>Workable, but double-paying.</strong> ${totalConflicts} conflict${totalConflicts===1?'':'s'} flagged.` : `<strong>Coverage is thin.</strong> Only ${uniqueMechCount} mechanism${uniqueMechCount===1?'':'s'} hit.`;
      else takeaway = totalConflicts > 0 ? `<strong>Reconsider.</strong> ${totalConflicts} conflict${totalConflicts===1?'':'s'} + low coverage.` : `<strong>Sparse stack.</strong> Only ${uniqueMechCount} mechanism${uniqueMechCount===1?'':'s'} covered.`;
    }
    return takeaway;
  }

  // ── UNITS-ON-THE-PEN MATH ────────────────────────────────────
  // Single source for the unit calculation used by reconstitute,
  // tracker, sequencer, and SHRED.
  function unitsForDose(doseMg, vialMg, bacMl) {
    if (!doseMg || !vialMg || !bacMl) return null;
    return Math.round((doseMg / (vialMg / bacMl)) * 100);
  }

  // ── EXPORT ────────────────────────────────────────────────────
  window.ApexStackRender = {
    renderInteractionsAlert,
    buildInteractionCard,
    gradeTakeaway,
    unitsForDose,
    SEV_COLORS
  };
})();
