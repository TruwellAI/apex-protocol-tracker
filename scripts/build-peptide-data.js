#!/usr/bin/env node
/**
 * Build /data/peptide-data.js from /data/peptides.json
 *
 * Why: HTML pages can't `fetch()` synchronously, but they need the peptide
 * data available before render. This script generates a tiny JS file that
 * exposes the JSON as `window.APEX_PEPTIDES`, which every HTML page loads
 * via a synchronous <script> tag BEFORE its own logic runs.
 *
 * Run:  node scripts/build-peptide-data.js
 * Auto-runs from the audit too.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'data', 'peptides.json');
const INX  = path.join(ROOT, 'data', 'interactions.json');
const OUT  = path.join(ROOT, 'data', 'peptide-data.js');

const json = JSON.parse(fs.readFileSync(SRC, 'utf8'));
let interactions = { interactions: [] };
try { interactions = JSON.parse(fs.readFileSync(INX, 'utf8')); } catch(e) { console.warn('interactions.json not found, skipping'); }

const stamp = new Date().toISOString();
const banner = `/* AUTO-GENERATED — DO NOT EDIT.
 * Source: /data/peptides.json
 * Regenerate: node scripts/build-peptide-data.js
 * Built: ${stamp}
 */`;

const body = `window.APEX_PEPTIDES = ${JSON.stringify(json, null, 2)};
window.APEX_INTERACTIONS = ${JSON.stringify(interactions.interactions || [], null, 2)};

// Helper accessors derived from APEX_PEPTIDES — every HTML page uses these.
window.apexPeptide = function(slug) { return window.APEX_PEPTIDES[slug] || null; };

// CORE: get all interactions that fire for a given stack of slugs.
// An interaction fires when the user has at least one peptide from EACH group.
window.apexInteractionsForStack = function(slugs) {
  const set = new Set((slugs || []).map(s => String(s).toLowerCase()));
  const matches = [];
  for (const ix of (window.APEX_INTERACTIONS || [])) {
    const allGroupsMatched = ix.groups.every(group =>
      group.some(slug => set.has(slug.toLowerCase()))
    );
    if (allGroupsMatched) matches.push(ix);
  }
  // Sort: high severity first, then synergy, then medium
  const order = { high: 0, medium: 1, synergy: 2 };
  matches.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return matches;
};

// Build the legacy maps the existing HTML pages expect, in one place.
window.apexBuildLegacyMaps = function() {
  const all = window.APEX_PEPTIDES;
  const PEP = {};                 // reconstitute.html (name, mech, vial, bac, special flags)
  const TYPICAL_DOSE_MG = {};     // reconstitute.html (per-injection dose in mg)
  const RECON_DEFAULTS = {};      // protocol-summary.html + tracker-v2.html (vial + bac)
  const PROTO = {};               // protocol-summary.html (full peptide config)
  const STACK_COMPONENTS = {};    // protocol-summary.html (stack peptide breakdowns)
  const DOSE_INFO = {};           // protocol-sequencer.html (per-row tap-to-show units)
  for (const [slug, p] of Object.entries(all)) {
    if (slug === '_meta') continue;
    if (p.vial_mg != null && p.bac_ml != null) {
      RECON_DEFAULTS[slug] = { vial: p.vial_mg, bac: p.bac_ml };
      PEP[slug] = {
        name: p.name, mech: p.mech, vial: p.vial_mg, bac: p.bac_ml,
        rx: !!p.rx, premixed: p.premixed || false,
        titration: !!p.titration, combinedBottle: !!p.combined_bottle,
        copperWarning: !!(p.warning && /copper.*tb-?500/i.test(p.warning))
      };
    } else {
      PEP[slug] = {
        name: p.name, mech: p.mech,
        oral: p.route === 'oral', spray: p.route === 'spray',
        rx: !!p.rx, premixed: !!p.premixed
      };
    }
    if (p.dose_mg_per_inj != null) TYPICAL_DOSE_MG[slug] = p.dose_mg_per_inj;
    PROTO[slug] = {
      name: p.name, mech: p.mech, cycleWks: p.cycle_weeks,
      dose: p.dose_label, freq: p.freq,
      rx: !!p.rx, premixed: !!p.premixed,
      combinedBottle: !!p.combined_bottle,
      copperWarning: !!(p.warning && /copper.*tb-?500/i.test(p.warning))
    };
    if (Array.isArray(p.components) && p.components.length > 0) {
      STACK_COMPONENTS[slug] = p.components.map(c => ({
        name: c.name, dose_mg: c.dose_mg, dose: (c.dose_mg < 1 ? (c.dose_mg*1000)+' mcg' : c.dose_mg+' mg')
      }));
    }
    DOSE_INFO[slug] = {
      dose: p.dose_mg_per_inj,
      vial: p.vial_mg, bac: p.bac_ml,
      freq: p.freq, oral: p.route === 'oral', spray: p.route === 'spray',
      premixed: p.premixed || null,
      combined: !!p.combined_bottle,
      components: p.components || null,
      warning: p.warning || null,
      note: p.research_note || null
    };
  }
  return { PEP, TYPICAL_DOSE_MG, RECON_DEFAULTS, PROTO, STACK_COMPONENTS, DOSE_INFO };
};
`;

fs.writeFileSync(OUT, banner + '\n' + body);
console.log(`✅ Built ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
