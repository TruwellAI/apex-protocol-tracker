#!/usr/bin/env node
/**
 * Apex Dose Audit Bot
 * Compares dosing in reconstitute.html against research-backed reference ranges.
 * Run: node scripts/audit-doses.js
 * Exits 1 if any dose is out of range (for CI/pre-commit).
 */
const fs = require('fs');
const path = require('path');

// Research-backed per-injection ranges (mg). Sources: Apex Peptide Encyclopedia + literature.
// Format: slug → { min, max, route, freq, note }
const REFERENCE = {
  'bpc157.html':       { min: 0.20, max: 0.50, route: 'sc',   freq: 'daily',     note: 'Sikiric et al; 250-500 mcg/day typical' },
  'tb500.html':        { min: 2.0,  max: 5.0,  route: 'sc',   freq: '2x/wk',     note: 'Loading 5mg 2x/wk × 4-6wk, then maintenance' },
  'ghkcu.html':        { min: 1.0,  max: 3.0,  route: 'sc',   freq: 'daily',     note: 'Pickart; 1-3mg/day skin/recovery' },
  'kpv.html':          { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily',     note: '250-1000 mcg/day' },
  'll37.html':         { min: 0.05, max: 0.20, route: 'sc',   freq: 'daily',     note: 'Microdose 50-200 mcg' },
  'thymosin-alpha1.html': { min: 1.6, max: 3.2, route: 'sc',  freq: '2x/wk',     note: '1.6mg 2x/wk standard' },
  'ara290.html':       { min: 1.0,  max: 8.0,  route: 'sc',   freq: 'daily',     note: 'Brines et al; 4mg typical' },
  'epitalon.html':     { min: 5.0,  max: 10.0, route: 'sc',   freq: 'daily',     note: 'Khavinson; 5-10mg × 10-20d, 2x/yr' },
  'ss31.html':         { min: 3.0,  max: 7.0,  route: 'sc',   freq: 'daily',     note: 'Mitochondrial; 5mg typical' },
  'motsc.html':        { min: 2.0,  max: 5.0,  route: 'sc',   freq: '2-3x/wk',   note: 'Total weekly 5-10mg; 3mg per inj' },
  'cartalax.html':     { min: 0.10, max: 0.30, route: 'sc',   freq: 'daily',     note: '100-300 mcg × 10-20d' },
  'fox04-dri.html':    { min: 1.0,  max: 5.0,  route: 'sc',   freq: 'pulse',     note: 'Senolytic; 3-day pulse 1-2x/yr' },
  'aod9604.html':      { min: 0.25, max: 0.50, route: 'sc',   freq: 'daily',     note: '300 mcg fasted AM' },
  'retatrutide.html':  { min: 2.0,  max: 12.0, route: 'sc',   freq: 'weekly',    note: 'Titrate 2→4→8→12mg weekly' },
  'semaglutide.html':  { min: 0.25, max: 2.4,  route: 'sc',   freq: 'weekly',    note: 'Titrate 0.25→2.4mg weekly' },
  'tirzepatide.html':  { min: 2.5,  max: 15.0, route: 'sc',   freq: 'weekly',    note: 'Titrate 2.5→15mg weekly' },
  'cjc-no-dac.html':   { min: 0.10, max: 0.30, route: 'sc',   freq: '1-3x/day',  note: '100mcg per dose pre-bed' },
  'cjc1295-dac.html':  { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'weekly',    note: '1-2mg/wk' },
  'ipamorelin.html':   { min: 0.10, max: 0.30, route: 'sc',   freq: '1-3x/day',  note: '100-300 mcg pre-bed' },
  'tesamorelin.html':  { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'daily',     note: '1-2mg/day FDA' },
  'cjc-ipa-blend.html':{ min: 0.20, max: 0.40, route: 'sc',   freq: 'daily',     note: 'Blend, 200-400 mcg pre-bed' },
  'igf1-lr3.html':     { min: 0.02, max: 0.08, route: 'sc',   freq: 'daily',     note: '20-80 mcg post-workout' },
  '5amino1mq.html':    { min: 1,    max: 5,    route: 'sc',   freq: 'daily',     note: 'NNMT inhibitor; SubQ injection 1-5mg/day' },
  'nad-plus.html':     { min: 50,   max: 200,  route: 'sc',   freq: 'weekly',    note: 'Loading 100mg 2x/wk × 4wk' },
  // Round 2 — fill remaining warning items with research-backed ranges
  'melanotan1.html':   { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily/2x wk',note: 'Loading 1mg/d × 10d, maint 0.5mg 2x/wk' },
  'melanotan2.html':   { min: 0.25, max: 1.0,  route: 'sc',   freq: 'daily/2x wk',note: 'Loading 0.5-1mg/d, maint 0.5mg 2x/wk' },
  'pt141.html':        { min: 1.0,  max: 2.0,  route: 'sc',   freq: 'as-needed', note: 'Bremelanotide; 45 min before activity' },
  'sermorelin.html':   { min: 0.2,  max: 0.5,  route: 'sc',   freq: 'daily PM', note: 'GHRH analog; 200-500 mcg pre-bed' },
  'dsip.html':         { min: 0.1,  max: 0.3,  route: 'sc',   freq: 'pre-bed',  note: 'Delta sleep-inducing; 100-300 mcg' },
  'dihexa.html':       { min: 8,    max: 25,   route: 'sc',   freq: 'daily',    note: 'Hepatocyte-GF mimetic; 8-25 mg/day SubQ' },
  'pe2228.html':       { min: 0.25, max: 0.5,  route: 'sc',   freq: 'daily',    note: 'BDNF-like neuropep; 250-500 mcg' },
  'l-carnitine.html':  { min: 200,  max: 500,  route: 'sc',   freq: 'pre-cardio',note: 'Fat-oxidation cofactor; 200-500 mg pre-cardio' },
  'glutamine.html':    { min: 200,  max: 500,  route: 'sc',   freq: 'daily',    note: 'Gut/recovery support; 200-500 mg/day' },
  'glutathione.html':  { min: 200,  max: 600,  route: 'sc',   freq: '2-3x/wk',  note: 'Master antioxidant; 200-600 mg 2-3x/wk' },
  // Testosterone TYPICAL_DOSE_MG = WEEKLY TOTAL (not per-injection) — split across doses on tracker
  'testosterone-cyp.html':  { min: 100, max: 200, route: 'sc/im', freq: '2x weekly', note: 'Rx · Cyp 200mg/mL pre-mixed · 100-200 mg/wk total (split 2x)' },
  'testosterone-enth.html': { min: 100, max: 200, route: 'sc/im', freq: '2x weekly', note: 'Rx · Enth 200mg/mL pre-mixed · 100-200 mg/wk total (split 2x)' },
  'testosterone-prop.html': { min: 75,  max: 175, route: 'sc/im', freq: 'EOD',       note: 'Rx · Prop 100mg/mL pre-mixed · 75-175 mg/wk total (split 3-4x)' },
};

const ROOT = path.resolve(__dirname, '..');
const reconPath = path.join(ROOT, 'reconstitute.html');
const html = fs.readFileSync(reconPath, 'utf8');

// Pull TYPICAL_DOSE_MG block
const m = html.match(/const TYPICAL_DOSE_MG\s*=\s*\{([\s\S]*?)\};/);
if (!m) { console.error('FATAL: TYPICAL_DOSE_MG not found in reconstitute.html'); process.exit(2); }
const block = m[1];

// Parse 'slug':number entries
const doses = {};
for (const match of block.matchAll(/'([^']+)'\s*:\s*([\d.]+)/g)) {
  doses[match[1]] = parseFloat(match[2]);
}

// Audit
const issues = [];
const warnings = [];
const ok = [];

for (const [slug, mg] of Object.entries(doses)) {
  const ref = REFERENCE[slug];
  if (!ref) { warnings.push(`⚠️  ${slug}: ${mg}mg — no reference range (add to REFERENCE)`); continue; }
  if (ref.route === 'oral') {
    issues.push(`❌ ${slug}: ${mg}mg as injection BUT route=oral — ${ref.note}`);
    continue;
  }
  if (mg < ref.min) issues.push(`❌ ${slug}: ${mg}mg LOW (range ${ref.min}-${ref.max}) — ${ref.note}`);
  else if (mg > ref.max) issues.push(`❌ ${slug}: ${mg}mg HIGH (range ${ref.min}-${ref.max}) — ${ref.note}`);
  else ok.push(`✅ ${slug}: ${mg}mg in range ${ref.min}-${ref.max}`);
}

// Missing from doses but in reference
for (const slug of Object.keys(REFERENCE)) {
  if (!(slug in doses)) warnings.push(`⚠️  ${slug}: in REFERENCE but not in TYPICAL_DOSE_MG`);
}

// Report
const stamp = new Date().toISOString();
const report = [
  `# Apex Dose Audit — ${stamp}`,
  ``,
  `**Checked:** ${Object.keys(doses).length} peptides · **Reference:** ${Object.keys(REFERENCE).length}`,
  `**Status:** ${issues.length === 0 ? '🟢 PASS' : '🔴 FAIL'} · ${issues.length} issues · ${warnings.length} warnings · ${ok.length} ok`,
  ``,
  `## Issues`,
  issues.length ? issues.join('\n') : '_(none)_',
  ``,
  `## Warnings`,
  warnings.length ? warnings.join('\n') : '_(none)_',
  ``,
  `## In Range`,
  ok.join('\n'),
  ``,
].join('\n');

const outPath = path.join(ROOT, 'audit-report.md');
fs.writeFileSync(outPath, report);
console.log(report);
console.log(`\nReport written: ${outPath}`);
process.exit(issues.length === 0 ? 0 : 1);
