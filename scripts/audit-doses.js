#!/usr/bin/env node
/**
 * Apex Dose Audit Bot — v3 (single source of truth)
 *
 *   /data/peptides.json is the SINGLE SOURCE OF TRUTH.
 *
 * The audit:
 *   1) Validates every peptide in peptides.json against the research-backed
 *      reference ranges below.
 *   2) Reads the legacy hand-edited dose data from each HTML file
 *      (reconstitute, protocol-summary, tracker-v2) and flags anything
 *      that DRIFTS from peptides.json.
 *   3) Checks units sanity — flags any peptide whose default dose+vial+BAC
 *      combo produces >200u (suggests a math error).
 *   4) Verifies combined-bottle stacks declare components and a warning
 *      when applicable.
 *
 * Run:  node scripts/audit-doses.js
 * Exits 1 on any failure (CI / pre-commit ready).
 *
 * To update a dose / vial / BAC for any peptide: edit /data/peptides.json
 * and ONLY peptides.json. The HTML files will be migrated to read from
 * this JSON in Phase B. Until then, keep the HTML files in sync — the
 * audit will tell you when they drift.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(ROOT, 'data', 'peptides.json');

// ─────────────────────────────────────────────────────────────
// Research reference ranges (per-injection mg)
// peptides.json dose_range_mg must fall within these.
// ─────────────────────────────────────────────────────────────
const RESEARCH = {
  'bpc157.html':       [0.20, 0.50],
  'tb500.html':        [2.0,  5.0],
  'ghkcu.html':        [1.0,  3.0],
  'kpv.html':          [0.25, 1.0],
  'll37.html':         [0.05, 0.20],
  'thymosin-alpha1.html': [1.6, 3.2],
  'ara290.html':       [1.0,  8.0],
  'epitalon.html':     [5.0,  10.0],
  'ss31.html':         [3.0,  7.0],
  'motsc.html':        [2.0,  5.0],
  'cartalax.html':     [0.10, 0.30],
  'fox04-dri.html':    [1.0,  5.0],
  'aod9604.html':      [0.25, 0.50],
  'retatrutide.html':  [2.0,  12.0],
  'semaglutide.html':  [0.25, 2.4],
  'tirzepatide.html':  [2.5,  15.0],
  'cjc-no-dac.html':   [0.10, 0.30],
  'cjc1295-dac.html':  [1.0,  2.0],
  'ipamorelin.html':   [0.10, 0.30],
  'tesamorelin.html':  [1.0,  2.0],
  'cjc-ipa-blend.html':[0.20, 0.40],
  'igf1-lr3.html':     [0.02, 0.08],
  '5amino1mq.html':    [1,    5],
  'nad-plus.html':     [50,   200],
  'melanotan1.html':   [0.25, 1.0],
  'melanotan2.html':   [0.25, 1.0],
  'pt141.html':        [1.0,  2.0],
  'sermorelin.html':   [0.2,  0.5],
  'dsip.html':         [0.1,  0.3],
  'dihexa.html':       [8,    25],
  'pe2228.html':       [0.25, 0.5],
  'l-carnitine.html':  [200,  500],
  'glutamine.html':    [200,  500],
  'glutathione.html':  [200,  600],
  // Testosterone: per-injection ranges (weekly_total_mg in peptides.json tracks the wk math)
  'testosterone-cyp.html':  [50, 100],
  'testosterone-enth.html': [50, 100],
  'testosterone-prop.html': [25, 75],
};

const issues = [];
const driftIssues = [];
const warnings = [];
const ok = [];

// ─────────────────────────────────────────────────────────────
// Load source of truth
// ─────────────────────────────────────────────────────────────
let peptides;
try {
  peptides = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  delete peptides._meta;
} catch (e) {
  console.error(`FATAL: cannot read ${JSON_PATH} — ${e.message}`);
  process.exit(2);
}

// ─────────────────────────────────────────────────────────────
// CHECK 1 — peptides.json sanity vs research ranges
// ─────────────────────────────────────────────────────────────
for (const [slug, p] of Object.entries(peptides)) {
  // Stacks: skip dose-range checks; require components
  if (p.combined_bottle === true) {
    if (!Array.isArray(p.components) || p.components.length === 0) {
      issues.push(`❌ ${slug}: combined_bottle:true but no components[]`);
    }
    if (!p.vial_mg || !p.bac_ml) {
      issues.push(`❌ ${slug}: combined-bottle stack missing vial_mg or bac_ml`);
    }
    if (p.warning) ok.push(`✅ ${slug}: stack with warning declared`);
    else ok.push(`✅ ${slug}: stack`);
    continue;
  }
  if (p.category === 'stack' && p.combined_bottle === false) {
    if (!Array.isArray(p.components)) {
      issues.push(`❌ ${slug}: multi-bottle stack missing components[]`);
    } else {
      ok.push(`✅ ${slug}: multi-bottle stack`);
    }
    continue;
  }

  // Sprays / orals — no per-injection dose validation
  if (p.route === 'spray' || p.route === 'oral') {
    ok.push(`✅ ${slug}: ${p.route} (no injection units to validate)`);
    continue;
  }

  const ref = RESEARCH[slug];
  if (!ref) { warnings.push(`⚠️  ${slug}: no RESEARCH entry — add to scripts/audit-doses.js`); continue; }

  // dose_range_mg must intersect with research range
  if (Array.isArray(p.dose_range_mg)) {
    const [pMin, pMax] = p.dose_range_mg;
    if (pMin < ref[0] * 0.5) issues.push(`❌ ${slug}: dose_range_mg min ${pMin} below research ${ref[0]}`);
    if (pMax > ref[1] * 1.05) issues.push(`❌ ${slug}: dose_range_mg max ${pMax} above research ${ref[1]}`);
  } else if (p.dose_mg_per_inj != null) {
    if (p.dose_mg_per_inj < ref[0]) issues.push(`❌ ${slug}: dose_mg_per_inj ${p.dose_mg_per_inj} below research ${ref[0]}`);
    if (p.dose_mg_per_inj > ref[1]) issues.push(`❌ ${slug}: dose_mg_per_inj ${p.dose_mg_per_inj} above research ${ref[1]}`);
  }

  // dose_mg_per_inj must be inside dose_range_mg
  if (p.dose_mg_per_inj != null && Array.isArray(p.dose_range_mg)) {
    const [lo, hi] = p.dose_range_mg;
    if (p.dose_mg_per_inj < lo || p.dose_mg_per_inj > hi) {
      issues.push(`❌ ${slug}: dose_mg_per_inj ${p.dose_mg_per_inj} outside dose_range_mg [${lo},${hi}]`);
    }
  }

  // ── UNITS SANITY (hard-fail thresholds) ──
  // Standard 1mL insulin pen / U-100 syringe holds 100 units. Anything
  // >100 is more than one full draw — bad UX. <5 is hard to draw accurately.
  // <100 mcg dose exempted from low-units check (truly microdose peptides).
  if (p.dose_mg_per_inj && p.vial_mg && p.bac_ml && !p.premixed) {
    const units = Math.round((p.dose_mg_per_inj / (p.vial_mg / p.bac_ml)) * 100);
    if (units > 200) {
      issues.push(`❌ ${slug}: ${units} units (vial ${p.vial_mg}mg + ${p.bac_ml}mL + ${p.dose_mg_per_inj}mg dose) — math/default ERROR (>200u)`);
    } else if (units > 100) {
      issues.push(`❌ ${slug}: ${units} units (vial ${p.vial_mg}mg + ${p.bac_ml}mL + ${p.dose_mg_per_inj}mg dose) — exceeds 1mL pen capacity (>100u). Lower BAC or use larger vial.`);
    } else if (units < 5 && p.dose_mg_per_inj >= 0.05) {
      issues.push(`❌ ${slug}: ${units} units (vial ${p.vial_mg}mg + ${p.bac_ml}mL + ${p.dose_mg_per_inj}mg dose) — too small to draw accurately (<5u). Increase BAC or use smaller vial.`);
    } else {
      ok.push(`✅ ${slug}: ${units} units on the pen`);
    }
  } else if (p.premixed) {
    ok.push(`✅ ${slug}: premixed ${p.premixed}`);
  } else {
    ok.push(`✅ ${slug}`);
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK 2 — DRIFT detection between peptides.json and HTML files
// ─────────────────────────────────────────────────────────────
function readHtmlMap(file, regex) {
  try {
    return fs.readFileSync(path.join(ROOT, file), 'utf8').match(regex)?.[1] || '';
  } catch (e) { return ''; }
}

// reconstitute.html: PEP map (vial+bac) + TYPICAL_DOSE_MG
const reconHtml = fs.readFileSync(path.join(ROOT, 'reconstitute.html'), 'utf8');
const reconRecon = {};
const reconPepBlock = reconHtml.match(/const PEP\s*=\s*\{([\s\S]*?)\n  \};/)?.[1] || '';
for (const m of reconPepBlock.matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
  reconRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
}
const reconDoses = {};
const reconDoseBlock = reconHtml.match(/const TYPICAL_DOSE_MG\s*=\s*\{([\s\S]*?)\};/)?.[1] || '';
for (const m of reconDoseBlock.matchAll(/'([^']+)'\s*:\s*([\d.]+)/g)) {
  reconDoses[m[1]] = parseFloat(m[2]);
}

// protocol-summary.html: RECON_DEFAULTS
const psumHtml = fs.readFileSync(path.join(ROOT, 'protocol-summary.html'), 'utf8');
const psumRecon = {};
const psumReconBlock = psumHtml.match(/const RECON_DEFAULTS\s*=\s*\{([\s\S]*?)\n  \};/)?.[1] || '';
for (const m of psumReconBlock.matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
  psumRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
}

// tracker-v2.html: RECON_DEFAULTS
const trkHtml = fs.readFileSync(path.join(ROOT, 'tracker-v2.html'), 'utf8');
const trkRecon = {};
const trkReconBlock = trkHtml.match(/const RECON_DEFAULTS\s*=\s*\{([\s\S]*?)\n  \};/)?.[1] || '';
for (const m of trkReconBlock.matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
  trkRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
}

// Check each peptide in JSON against the HTML mirrors
for (const [slug, p] of Object.entries(peptides)) {
  if (p.vial_mg == null || p.bac_ml == null) continue; // sprays/orals/multi-bottle stacks

  const sources = [{ file: 'peptides.json (SOURCE OF TRUTH)', vial: p.vial_mg, bac: p.bac_ml }];
  if (reconRecon[slug])  sources.push({ file: 'reconstitute.html',     vial: reconRecon[slug].vial,  bac: reconRecon[slug].bac });
  if (psumRecon[slug])   sources.push({ file: 'protocol-summary.html', vial: psumRecon[slug].vial,   bac: psumRecon[slug].bac });
  if (trkRecon[slug])    sources.push({ file: 'tracker-v2.html',       vial: trkRecon[slug].vial,    bac: trkRecon[slug].bac });

  if (sources.length < 2) continue;
  const bacs = new Set(sources.map(s => s.bac));
  const vials = new Set(sources.map(s => s.vial));
  if (bacs.size > 1) {
    driftIssues.push(`🔀 ${slug}: BAC drift — ${sources.map(s=>`${s.file}=${s.bac}mL`).join(' · ')}`);
  }
  if (vials.size > 1) {
    driftIssues.push(`🔀 ${slug}: vial drift — ${sources.map(s=>`${s.file}=${s.vial}mg`).join(' · ')}`);
  }

  // Dose check (reconstitute TYPICAL_DOSE_MG vs JSON dose_mg_per_inj)
  if (reconDoses[slug] != null && p.dose_mg_per_inj != null && reconDoses[slug] !== p.dose_mg_per_inj) {
    driftIssues.push(`🔀 ${slug}: dose drift — peptides.json=${p.dose_mg_per_inj}mg vs reconstitute.html=${reconDoses[slug]}mg`);
  }
}

// ─────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────
const stamp = new Date().toISOString();
const total = issues.length + driftIssues.length;
const report = [
  `# Apex Dose Audit (v3 — single source of truth) — ${stamp}`,
  ``,
  `**Source of truth:** \`/data/peptides.json\` (${Object.keys(peptides).length} peptides)`,
  `**Files cross-checked:** reconstitute.html · protocol-summary.html · tracker-v2.html`,
  `**Status:** ${total === 0 ? '🟢 PASS' : '🔴 FAIL'} · ${issues.length} dose issues · ${driftIssues.length} drift issues · ${warnings.length} warnings · ${ok.length} ok`,
  ``,
  `## Dose Issues`,
  issues.length ? issues.join('\n') : '_(none — peptides.json is internally consistent)_',
  ``,
  `## Drift (HTML files diverge from peptides.json)`,
  driftIssues.length ? driftIssues.join('\n') : '_(none — all HTML files match the source of truth)_',
  ``,
  `## Warnings`,
  warnings.length ? warnings.join('\n') : '_(none)_',
  ``,
  `## Pass`,
  ok.join('\n'),
  ``,
].join('\n');

fs.writeFileSync(path.join(ROOT, 'audit-report.md'), report);
console.log(report);
console.log(`\nReport: ${path.join(ROOT, 'audit-report.md')}`);
process.exit(total === 0 ? 0 : 1);
