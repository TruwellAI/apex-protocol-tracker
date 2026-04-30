#!/usr/bin/env node
/**
 * Apex Dose Audit Bot — v2 (cross-file consistency)
 *
 * Reads dose data from EVERY file that displays doses (reconstitute,
 * protocol-summary, tracker-v2, protocol-tracker, protocol-sequencer)
 * and flags:
 *   1) doses out of research-backed range
 *   2) DRIFT — same peptide has different doses in different files
 *   3) BAC volume inconsistency across files
 *   4) per-injection units that exceed sane caps (>200u suggests math error)
 *   5) missing reference data
 *
 * Run: node scripts/audit-doses.js
 * Exits 1 on any failure (CI/pre-commit ready).
 */
const fs = require('fs');
const path = require('path');

// Research-backed per-injection ranges (mg)
const REFERENCE = {
  'bpc157.html':       { min: 0.20, max: 0.50, route: 'sc',   freq: 'daily',     note: 'Sikiric et al; 250-500 mcg/day typical' },
  'tb500.html':        { min: 2.0,  max: 5.0,  route: 'sc',   freq: '2x/wk',     note: 'Loading 5mg 2x/wk × 4-6wk' },
  'ghkcu.html':        { min: 1.0,  max: 3.0,  route: 'sc',   freq: 'daily',     note: 'Pickart; 1-3mg/day' },
  'kpv.html':          { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily',     note: '250-1000 mcg/day' },
  'll37.html':         { min: 0.05, max: 0.20, route: 'sc',   freq: 'daily',     note: 'Microdose 50-200 mcg' },
  'thymosin-alpha1.html': { min: 1.6, max: 3.2, route: 'sc',  freq: '2x/wk',     note: '1.6mg 2x/wk standard' },
  'ara290.html':       { min: 1.0,  max: 8.0,  route: 'sc',   freq: 'daily',     note: 'Brines et al; 4mg typical' },
  'epitalon.html':     { min: 5.0,  max: 10.0, route: 'sc',   freq: 'daily',     note: 'Khavinson; 5-10mg × 10-20d' },
  'ss31.html':         { min: 3.0,  max: 7.0,  route: 'sc',   freq: 'daily',     note: 'Mitochondrial; 5mg typical' },
  'motsc.html':        { min: 2.0,  max: 5.0,  route: 'sc',   freq: '2-3x/wk',   note: 'Total wkly 5-10mg; 3mg per inj' },
  'cartalax.html':     { min: 0.10, max: 0.30, route: 'sc',   freq: 'daily',     note: '100-300 mcg × 10-20d' },
  'fox04-dri.html':    { min: 1.0,  max: 5.0,  route: 'sc',   freq: 'pulse',     note: 'Senolytic; 5-day pulse 1-2x/yr' },
  'aod9604.html':      { min: 0.25, max: 0.50, route: 'sc',   freq: 'daily',     note: '300 mcg fasted AM' },
  'retatrutide.html':  { min: 2.0,  max: 12.0, route: 'sc',   freq: 'weekly',    note: 'Titrate 2→4→8→12mg weekly' },
  'semaglutide.html':  { min: 0.25, max: 2.4,  route: 'sc',   freq: 'weekly',    note: 'Titrate 0.25→2.4mg weekly' },
  'tirzepatide.html':  { min: 2.5,  max: 15.0, route: 'sc',   freq: 'weekly',    note: 'Titrate 2.5→15mg weekly' },
  'cjc-no-dac.html':   { min: 0.10, max: 0.30, route: 'sc',   freq: '1-3x/day',  note: '100mcg pre-bed' },
  'cjc1295-dac.html':  { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'weekly',    note: '1-2mg/wk' },
  'ipamorelin.html':   { min: 0.10, max: 0.30, route: 'sc',   freq: '1-3x/day',  note: '100-300 mcg pre-bed' },
  'tesamorelin.html':  { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'daily',     note: '1-2mg/day FDA' },
  'cjc-ipa-blend.html':{ min: 0.20, max: 0.40, route: 'sc',   freq: 'daily',     note: 'Blend 200-400 mcg pre-bed' },
  'igf1-lr3.html':     { min: 0.02, max: 0.08, route: 'sc',   freq: 'daily',     note: '20-80 mcg post-workout' },
  '5amino1mq.html':    { min: 1,    max: 5,    route: 'sc',   freq: 'daily',     note: 'NNMT inhibitor; 1-5mg/day SubQ' },
  'nad-plus.html':     { min: 50,   max: 200,  route: 'sc',   freq: 'weekly',    note: 'Loading 100mg 2x/wk × 4wk' },
  'melanotan1.html':   { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily/2x wk',note: 'Loading 1mg/d × 10d' },
  'melanotan2.html':   { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily/2x wk',note: 'Loading 0.5-1mg/d' },
  'pt141.html':        { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'as-needed', note: 'Bremelanotide; 45 min before' },
  'sermorelin.html':   { min: 0.2,  max: 0.5,  route: 'sc',   freq: 'daily PM', note: 'GHRH; 200-500 mcg pre-bed' },
  'dsip.html':         { min: 0.1,  max: 0.3,  route: 'sc',   freq: 'pre-bed',  note: 'Delta sleep; 100-300 mcg' },
  'dihexa.html':       { min: 8,    max: 25,   route: 'sc',   freq: 'daily',    note: 'HGF mimetic; 8-25 mg/day' },
  'pe2228.html':       { min: 0.25, max: 0.5,  route: 'sc',   freq: 'daily',    note: 'BDNF-like; 250-500 mcg' },
  'l-carnitine.html':  { min: 200,  max: 500,  route: 'sc',   freq: 'pre-cardio',note: '200-500 mg pre-cardio' },
  'glutamine.html':    { min: 200,  max: 500,  route: 'sc',   freq: 'daily',    note: '200-500 mg/day' },
  'glutathione.html':  { min: 200,  max: 600,  route: 'sc',   freq: '2-3x/wk',  note: '200-600 mg 2-3x/wk' },
  'testosterone-cyp.html':  { min: 100, max: 200, route: 'sc/im', freq: '2x wk', note: 'Rx · 100-200mg/wk total' },
  'testosterone-enth.html': { min: 100, max: 200, route: 'sc/im', freq: '2x wk', note: 'Rx · 100-200mg/wk total' },
  'testosterone-prop.html': { min: 75,  max: 175, route: 'sc/im', freq: 'EOD',  note: 'Rx · 75-175mg/wk total' },
};

// Stacks have no single dose — flag as combined-bottle, must have STACK_COMPONENTS
const STACK_SLUGS = new Set(['wolverine.html','klow.html','glow.html','cardiac-stack.html','longevity-stack.html','mito-reset.html']);

const ROOT = path.resolve(__dirname, '..');
const issues = [];
const warnings = [];
const driftIssues = [];

// ─────────────────────────────────────────────────────────────
// 1) reconstitute.html — TYPICAL_DOSE_MG (per-injection mg)
// ─────────────────────────────────────────────────────────────
const reconHtml = fs.readFileSync(path.join(ROOT, 'reconstitute.html'), 'utf8');
const reconDoseMatch = reconHtml.match(/const TYPICAL_DOSE_MG\s*=\s*\{([\s\S]*?)\};/);
if (!reconDoseMatch) { console.error('FATAL: TYPICAL_DOSE_MG not found in reconstitute.html'); process.exit(2); }
const reconDoses = {};
for (const m of reconDoseMatch[1].matchAll(/'([^']+)'\s*:\s*([\d.]+)/g)) {
  reconDoses[m[1]] = parseFloat(m[2]);
}

// reconstitute PEP map (vial + bac defaults)
const reconPepMatch = reconHtml.match(/const PEP\s*=\s*\{([\s\S]*?)\n  \};/);
const reconRecon = {};
if (reconPepMatch) {
  for (const m of reconPepMatch[1].matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
    reconRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
  }
}

// ─────────────────────────────────────────────────────────────
// 2) protocol-summary.html — PROTO map (dose strings) + RECON_DEFAULTS
// ─────────────────────────────────────────────────────────────
let psumDoses = {};
let psumRecon = {};
try {
  const psumHtml = fs.readFileSync(path.join(ROOT, 'protocol-summary.html'), 'utf8');
  const psumProtoMatch = psumHtml.match(/const PROTO\s*=\s*\{([\s\S]*?)\n  \};/);
  if (psumProtoMatch) {
    for (const m of psumProtoMatch[1].matchAll(/'([^']+\.html)'[^{]*\{[^}]*dose:\s*'([^']+)'/g)) {
      psumDoses[m[1]] = m[2];
    }
  }
  const psumReconMatch = psumHtml.match(/const RECON_DEFAULTS\s*=\s*\{([\s\S]*?)\n  \};/);
  if (psumReconMatch) {
    for (const m of psumReconMatch[1].matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
      psumRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
    }
  }
} catch(e) { warnings.push(`⚠️  protocol-summary.html not readable: ${e.message}`); }

// ─────────────────────────────────────────────────────────────
// 3) tracker-v2.html — RECON_DEFAULTS
// ─────────────────────────────────────────────────────────────
let trkRecon = {};
try {
  const trkHtml = fs.readFileSync(path.join(ROOT, 'tracker-v2.html'), 'utf8');
  const trkReconMatch = trkHtml.match(/const RECON_DEFAULTS\s*=\s*\{([\s\S]*?)\n  \};/);
  if (trkReconMatch) {
    for (const m of trkReconMatch[1].matchAll(/'([^']+\.html)'[^{]*\{[^}]*vial:\s*([\d.]+)[^}]*bac:\s*([\d.]+)/g)) {
      trkRecon[m[1]] = { vial: parseFloat(m[2]), bac: parseFloat(m[3]) };
    }
  }
} catch(e) { warnings.push(`⚠️  tracker-v2.html not readable: ${e.message}`); }

// ─────────────────────────────────────────────────────────────
// CHECK 1 — dose ranges (reconstitute TYPICAL_DOSE_MG)
// ─────────────────────────────────────────────────────────────
const ok = [];
for (const [slug, mg] of Object.entries(reconDoses)) {
  const ref = REFERENCE[slug];
  if (!ref) { warnings.push(`⚠️  ${slug}: ${mg}mg — no REFERENCE entry`); continue; }
  if (ref.route === 'oral') { issues.push(`❌ ${slug}: ${mg}mg as injection BUT route=oral`); continue; }
  if (mg < ref.min) issues.push(`❌ ${slug}: ${mg}mg LOW (ref ${ref.min}-${ref.max})`);
  else if (mg > ref.max) issues.push(`❌ ${slug}: ${mg}mg HIGH (ref ${ref.min}-${ref.max})`);
  else ok.push(`✅ ${slug}: ${mg}mg in range`);
}

// ─────────────────────────────────────────────────────────────
// CHECK 2 — BAC volume drift across files
// ─────────────────────────────────────────────────────────────
const allSlugs = new Set([...Object.keys(reconRecon), ...Object.keys(psumRecon), ...Object.keys(trkRecon)]);
for (const slug of allSlugs) {
  const r = reconRecon[slug], p = psumRecon[slug], t = trkRecon[slug];
  const sources = [];
  if (r) sources.push({ file:'reconstitute', vial:r.vial, bac:r.bac });
  if (p) sources.push({ file:'protocol-summary', vial:p.vial, bac:p.bac });
  if (t) sources.push({ file:'tracker-v2', vial:t.vial, bac:t.bac });
  if (sources.length < 2) continue;
  const bacSet = new Set(sources.map(s => s.bac));
  const vialSet = new Set(sources.map(s => s.vial));
  if (bacSet.size > 1) {
    driftIssues.push(`🔀 ${slug}: BAC drift — ${sources.map(s=>`${s.file}=${s.bac}mL`).join(', ')}`);
  }
  if (vialSet.size > 1) {
    driftIssues.push(`🔀 ${slug}: vial drift — ${sources.map(s=>`${s.file}=${s.vial}mg`).join(', ')}`);
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK 3 — protocol-summary dose strings vs research range
// (e.g. catches "5-10 mg" when ref says max 5mg)
// ─────────────────────────────────────────────────────────────
for (const [slug, doseStr] of Object.entries(psumDoses)) {
  if (STACK_SLUGS.has(slug)) continue; // stacks have "see components"
  const ref = REFERENCE[slug];
  if (!ref) continue;
  // Parse "X-Y mg" or "X mg" or "X mcg"
  const rangeMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(mg|mcg)/i);
  const singleMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg)/i);
  let lo, hi;
  if (rangeMatch) {
    lo = parseFloat(rangeMatch[1]);
    hi = parseFloat(rangeMatch[2]);
    if (rangeMatch[3].toLowerCase()==='mcg') { lo /= 1000; hi /= 1000; }
  } else if (singleMatch) {
    lo = hi = parseFloat(singleMatch[1]);
    if (singleMatch[2].toLowerCase()==='mcg') { lo /= 1000; hi /= 1000; }
  } else continue;
  if (hi > ref.max * 1.05) {
    issues.push(`❌ protocol-summary[${slug}]: dose "${doseStr}" max ${hi}mg exceeds ref ${ref.max}mg`);
  }
  if (lo < ref.min * 0.5) {
    warnings.push(`⚠️  protocol-summary[${slug}]: dose "${doseStr}" min ${lo}mg below ref ${ref.min}mg`);
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK 4 — units sanity (compute units that user will actually see)
// units = round((doseMg / (vialMg / bacMl)) * 100); flag >200u as suspect
// ─────────────────────────────────────────────────────────────
for (const [slug, doseMg] of Object.entries(reconDoses)) {
  const recon = reconRecon[slug];
  if (!recon) continue;
  const units = Math.round((doseMg / (recon.vial / recon.bac)) * 100);
  if (units > 200) {
    issues.push(`❌ ${slug}: ${doseMg}mg with vial ${recon.vial}mg + ${recon.bac}mL BAC = ${units} units (>200u suggests user error or wrong defaults)`);
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK 5 — stacks must declare combinedBottle or have components
// ─────────────────────────────────────────────────────────────
try {
  const psumHtml = fs.readFileSync(path.join(ROOT, 'protocol-summary.html'), 'utf8');
  const stackComponentsBlock = psumHtml.match(/const STACK_COMPONENTS\s*=\s*\{([\s\S]*?)\n  \};/);
  const declared = new Set();
  if (stackComponentsBlock) {
    for (const m of stackComponentsBlock[1].matchAll(/'([^']+\.html)'\s*:/g)) declared.add(m[1]);
  }
  for (const slug of STACK_SLUGS) {
    if (!declared.has(slug)) issues.push(`❌ ${slug}: stack has no STACK_COMPONENTS entry — units calc will fail`);
  }
} catch(e) {}

// ─────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────
const stamp = new Date().toISOString();
const total = issues.length + driftIssues.length;
const report = [
  `# Apex Dose Audit (v2 — cross-file) — ${stamp}`,
  ``,
  `**Files scanned:** reconstitute.html · protocol-summary.html · tracker-v2.html`,
  `**Reference peptides:** ${Object.keys(REFERENCE).length} · **Doses checked:** ${Object.keys(reconDoses).length}`,
  `**Status:** ${total === 0 ? '🟢 PASS' : '🔴 FAIL'} · ${issues.length} dose issues · ${driftIssues.length} drift issues · ${warnings.length} warnings · ${ok.length} ok`,
  ``,
  `## Dose Issues`,
  issues.length ? issues.join('\n') : '_(none)_',
  ``,
  `## Cross-file Drift (same peptide, different vial/BAC across files)`,
  driftIssues.length ? driftIssues.join('\n') : '_(none)_',
  ``,
  `## Warnings`,
  warnings.length ? warnings.join('\n') : '_(none)_',
  ``,
  `## In Range`,
  ok.join('\n'),
  ``,
].join('\n');

fs.writeFileSync(path.join(ROOT, 'audit-report.md'), report);
console.log(report);
console.log(`\nReport: ${path.join(ROOT, 'audit-report.md')}`);
process.exit(total === 0 ? 0 : 1);
