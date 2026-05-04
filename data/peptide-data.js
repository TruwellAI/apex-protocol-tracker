/* AUTO-GENERATED — DO NOT EDIT.
 * Source: /data/peptides.json
 * Regenerate: node scripts/build-peptide-data.js
 * Built: 2026-05-04T13:48:33.674Z
 */
window.APEX_PEPTIDES = {
  "_meta": {
    "version": "1.0.0",
    "lastUpdated": "2026-04-30",
    "description": "SINGLE SOURCE OF TRUTH for every peptide in Apex. Every HTML page + the audit bot reads from here. Update this file ONLY — never duplicate data into individual HTML files.",
    "schema": {
      "slug": "filename .html (matches the page slug)",
      "name": "display name",
      "category": "fatloss | gh-axis | recovery | longevity | cognitive | libido | trt | stack",
      "tier": "foundation | layer | pulse",
      "mech": "1-line mechanism description",
      "route": "sc | im | sc/im | oral | spray | premixed",
      "vial_mg": "default vial size in mg (or null if oral/spray/premixed)",
      "bac_ml": "default bac water volume in mL (or null)",
      "dose_mg_per_inj": "default per-injection dose in mg (TYPICAL_DOSE_MG)",
      "dose_label": "human-readable dose string (e.g. '300 mcg' or '1-2 mg')",
      "dose_range_mg": "[min, max] research-backed per-injection range in mg",
      "freq": "human-readable frequency",
      "cycle_weeks": "default on-cycle length",
      "off_weeks": "default off-period length",
      "research_note": "1-line study citation summary",
      "rx": "true if prescription required (testosterone, etc.)",
      "premixed": "true if pre-mixed (testosterone vials)",
      "combined_bottle": "true if multi-peptide single vial (Wolverine/KLOW/GLOW)",
      "components": "[{name, dose_mg}] for combined-bottle stacks",
      "warning": "any compliance/chemistry warning (e.g. copper degrades TB-500)"
    }
  },
  "bpc157.html": {
    "name": "BPC-157",
    "category": "recovery",
    "tier": "layer",
    "mech": "Body protective compound — gut-derived peptide for tissue repair",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.25,
    "dose_label": "250 mcg",
    "dose_range_mg": [
      0.2,
      0.5
    ],
    "freq": "1-2x daily",
    "cycle_weeks": 6,
    "off_weeks": 4,
    "research_note": "Sikiric et al; tendon/ligament/gut healing 250-500 mcg/day",
    "recon_tip": "Inject <strong>fasted, 30+ min before food</strong> for systemic effect (oral BPC works locally for gut, but SubQ near the injury site beats both for tendons/joints).",
    "timing_note": "⏰ Best <strong>30+ min before food</strong> for systemic effect. SubQ near injury site beats both oral + far-from-site for tendons/joints.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "1x daily",
          "per_dose_mg": 0.25,
          "weekly_total_mg": 1.75
        },
        {
          "pattern": "2x daily",
          "per_dose_mg": 0.25,
          "weekly_total_mg": 3.5
        }
      ],
      "rule": "2x daily (AM + PM) doubles the area-under-curve and is preferred for acute injuries. 1x daily is fine for chronic/maintenance. Both well-tolerated."
    }
  },
  "tb500.html": {
    "name": "TB-500",
    "category": "recovery",
    "tier": "layer",
    "mech": "Thymosin Beta-4 — angiogenesis + cell migration",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 2.5,
    "dose_label": "2.5 mg",
    "dose_range_mg": [
      2,
      5
    ],
    "freq": "2x weekly",
    "cycle_weeks": 6,
    "off_weeks": 4,
    "research_note": "Loading 5mg 2x/wk × 4-6wk, then maintenance",
    "recon_tip": "TB-500 takes <strong>2-3 weeks</strong> to show effect — do NOT abandon it after week 1. Front-load with 5mg 2x/wk for the first 4 weeks (loading), then drop to 2.5mg 1-2x/wk maintenance.",
    "timing_note": "⏰ <strong>Time of day flexible.</strong> No fasting requirement.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "2x weekly (loading wks 1-4)",
          "per_dose_mg": 5,
          "weekly_total_mg": 10
        },
        {
          "pattern": "1x weekly (maintenance)",
          "per_dose_mg": 2.5,
          "weekly_total_mg": 2.5
        }
      ],
      "rule": "TB-500 has a long half-life (~7 days) — daily is biologically redundant and wasteful. Standard: load 2x/wk for 4-6 weeks, then maintenance 1x/wk. Don't go daily."
    }
  },
  "ghkcu.html": {
    "name": "GHK-Cu",
    "category": "longevity",
    "tier": "layer",
    "mech": "Copper-binding peptide — collagen + skin remodeling",
    "route": "sc",
    "vial_mg": 50,
    "bac_ml": 3,
    "dose_mg_per_inj": 2,
    "dose_label": "1-3 mg",
    "dose_range_mg": [
      1,
      3
    ],
    "freq": "daily SubQ",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "Pickart 1973; 1-3mg/day skin/recovery/wound healing",
    "recon_tip": "GHK-Cu turns the solution <strong>blue</strong> — that is the copper, totally normal. Do NOT mix in the same vial as TB-500: copper oxidizes TB-500 methionine and degrades it within ~7 days. Run them in separate bottles.",
    "timing_note": "⏰ <strong>Time of day flexible.</strong> SubQ near target tissue (face/scalp for skin, near joint for repair). NOT in same vial as TB-500 (copper degrades it).",
    "cadence_flex": {
      "options": [
        {
          "pattern": "1x daily",
          "per_dose_mg": 2,
          "weekly_total_mg": 14
        },
        {
          "pattern": "3x weekly",
          "per_dose_mg": 3,
          "weekly_total_mg": 9
        }
      ],
      "rule": "Daily preferred for skin/collagen results (steady copper-bound peptide signaling). 3x/wk works for systemic recovery. Either way: do NOT co-vial with TB-500 — copper degrades it."
    }
  },
  "kpv.html": {
    "name": "KPV",
    "category": "recovery",
    "tier": "layer",
    "mech": "α-MSH C-terminus — anti-inflammatory + gut",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.5,
    "dose_label": "500 mcg",
    "dose_range_mg": [
      0.25,
      1
    ],
    "freq": "daily",
    "cycle_weeks": 6,
    "off_weeks": 4,
    "research_note": "250-1000 mcg/day; gut + dermal inflammation",
    "timing_note": "⏰ <strong>Time flexible.</strong> Anti-inflammatory + gut-supportive — split AM/PM helps if you have GI symptoms.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "1x daily",
          "per_dose_mg": 0.5,
          "weekly_total_mg": 3.5
        },
        {
          "pattern": "2x daily (gut focus)",
          "per_dose_mg": 0.25,
          "weekly_total_mg": 3.5
        }
      ],
      "rule": "For systemic anti-inflammatory: 1x daily. For active gut/IBD focus: split 2x daily (AM/PM) at half the dose for steadier mucosal exposure. Same weekly total."
    }
  },
  "ll37.html": {
    "name": "LL-37",
    "category": "recovery",
    "tier": "layer",
    "mech": "Cathelicidin antimicrobial peptide",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.1,
    "dose_label": "50-200 mcg",
    "dose_range_mg": [
      0.05,
      0.2
    ],
    "freq": "daily",
    "cycle_weeks": 4,
    "off_weeks": 4,
    "research_note": "Microdose 50-200 mcg; antimicrobial + immune modulator"
  },
  "thymosin-alpha1.html": {
    "name": "Thymosin α1",
    "category": "recovery",
    "tier": "layer",
    "mech": "Immune modulator (thymic origin)",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "cadence_flex": {
      "options": [
        {
          "pattern": "2x weekly (Mon + Thu)",
          "per_dose_mg": 1.6,
          "weekly_total_mg": 3.2
        },
        {
          "pattern": "Daily low-dose (smooth)",
          "per_dose_mg": 0.5,
          "weekly_total_mg": 3.5
        },
        {
          "pattern": "Daily acute (cold/flu, 7-14 days)",
          "per_dose_mg": 1.6,
          "weekly_total_mg": 11.2
        },
        {
          "pattern": "3x weekly (Mon · Wed · Fri)",
          "per_dose_mg": 1.1,
          "weekly_total_mg": 3.3
        }
      ],
      "rule": "Standard immune-maintenance: 2x weekly @ 1.6mg = 3.2mg/wk. Daily low-dose (0.5mg) gives smoother coverage at the same weekly total. Daily acute (1.6mg/day × 7-14 days) is the clinical short-course used during active cold/flu/viral exposure — drop back to maintenance after."
    },
    "dose_mg_per_inj": 1.6,
    "dose_label": "1.6 mg",
    "dose_range_mg": [
      1.6,
      3.2
    ],
    "freq": "2x weekly",
    "cycle_weeks": 8,
    "off_weeks": 8,
    "research_note": "1.6mg 2x/wk standard immune protocol",
    "timing_note": "⏰ <strong>Time of day flexible.</strong> Immune-modulating — best run Q1/Q4 during cold/flu season."
  },
  "ara290.html": {
    "name": "ARA-290",
    "category": "recovery",
    "tier": "layer",
    "mech": "EPO-derived 11-mer; tissue protection + neuropathy",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 1,
    "dose_mg_per_inj": 4,
    "dose_label": "4 mg",
    "dose_range_mg": [
      1,
      8
    ],
    "freq": "daily",
    "cycle_weeks": 4,
    "off_weeks": 8,
    "research_note": "Brines et al; 4mg typical for neuropathy"
  },
  "epitalon.html": {
    "name": "Epitalon",
    "category": "longevity",
    "tier": "pulse",
    "mech": "Pineal bioregulator — telomerase activator",
    "route": "sc",
    "vial_mg": 50,
    "bac_ml": 3,
    "dose_mg_per_inj": 7.5,
    "dose_label": "5-10 mg",
    "dose_range_mg": [
      5,
      10
    ],
    "freq": "daily PM × 10-20 days",
    "cycle_weeks": 2,
    "off_weeks": 24,
    "research_note": "Khavinson; 5-10mg × 10-20d pulse, 1-2x/yr",
    "recon_tip": "Best taken <strong>at night</strong> — Epitalon works through the pineal axis and pairs with melatonin. 5-10mg/night × 10-20 day pulse, 1-2x per year.",
    "timing_note": "⏰ <strong>Pre-bed, every night × 10-20 days.</strong> Works through the pineal/melatonin axis — nighttime dosing is critical. 1-2x per year pulse."
  },
  "ss31.html": {
    "name": "SS-31",
    "category": "longevity",
    "tier": "layer",
    "mech": "Cardiolipin-targeted mitochondrial peptide",
    "route": "sc",
    "vial_mg": 50,
    "bac_ml": 2,
    "dose_mg_per_inj": 5,
    "dose_label": "3-7 mg",
    "dose_range_mg": [
      3,
      7
    ],
    "freq": "daily",
    "cycle_weeks": 6,
    "off_weeks": 6,
    "research_note": "Mitochondrial repair; 5mg typical, post-MOTS-c sequencing",
    "timing_note": "⏰ <strong>Morning, with food OK.</strong> Run AFTER MOTS-c (build new mitos first, then repair them). Order matters."
  },
  "motsc.html": {
    "name": "MOTS-c",
    "category": "longevity",
    "tier": "layer",
    "mech": "Mitokine — AMPK activator + biogenesis",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 3,
    "dose_label": "2-5 mg",
    "dose_range_mg": [
      2,
      5
    ],
    "freq": "2-3x weekly",
    "cycle_weeks": 8,
    "off_weeks": 8,
    "research_note": "Total weekly 5-10mg; substrate for biogenesis (run with NAD+)",
    "recon_tip": "MOTS-c needs NAD+ as a substrate. Load NAD+ for 2-4 weeks BEFORE starting MOTS-c, then run MOTS-c with NAD+ maintenance 1x/wk.",
    "timing_note": "⏰ <strong>Morning, with light meal OK.</strong> Pairs well with cardio (potentiates exercise-induced AMPK signaling). Pairs with cardio + load NAD+ for 2-4 wks BEFORE starting MOTS-c.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "2x weekly (loading)",
          "per_dose_mg": 3,
          "weekly_total_mg": 6
        },
        {
          "pattern": "3x weekly Mon · Wed · Fri",
          "per_dose_mg": 2,
          "weekly_total_mg": 6
        },
        {
          "pattern": "Daily (smooth)",
          "per_dose_mg": 0.86,
          "weekly_total_mg": 6
        }
      ],
      "rule": "MOTS-c is WEEKLY-TOTAL driven (6 mg/wk research-backed). Pick a frequency — per-dose flexes to keep weekly total constant. 2x = 3mg each, 3x = 2mg each, daily = ~0.86mg each. Same effect, different smoothness."
    }
  },
  "cartalax.html": {
    "name": "Cartalax",
    "category": "longevity",
    "tier": "pulse",
    "mech": "Bioregulator — cartilage focus",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.2,
    "dose_label": "100-300 mcg",
    "dose_range_mg": [
      0.1,
      0.3
    ],
    "freq": "daily × 10 days",
    "cycle_weeks": 2,
    "off_weeks": 24,
    "research_note": "100-300 mcg × 10-20d pulse, 1-2x/yr"
  },
  "fox04-dri.html": {
    "name": "FOX04-DRI",
    "category": "longevity",
    "tier": "pulse",
    "mech": "Senolytic — clears p53/FOXO4 senescent cells",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 5,
    "dose_label": "1-5 mg",
    "dose_range_mg": [
      1,
      5
    ],
    "freq": "5-day pulse, 1-2x/yr",
    "cycle_weeks": 1,
    "off_weeks": 24,
    "research_note": "5-day pulse; clears senescent cells before rebuilding",
    "recon_tip": "Senolytic — clears senescent cells. <strong>Run BEFORE Epitalon</strong> if you are stacking both. Order: FOX04 5-day pulse → 4-week wash → Epitalon. Otherwise you extend the lifespan of cells you should be clearing.",
    "timing_note": "⏰ <strong>Time flexible · 5-day pulse only.</strong> Senolytic clears senescent cells. Run BEFORE Epitalon if stacking. 1-2x per year max."
  },
  "aod9604.html": {
    "name": "AOD-9604",
    "category": "fatloss",
    "tier": "layer",
    "mech": "GH fragment 176-191 — lipolysis without GH effects",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 0.3,
    "dose_label": "300 mcg",
    "dose_range_mg": [
      0.25,
      0.5
    ],
    "freq": "daily fasted AM",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "300 mcg fasted morning; lipolysis-selective",
    "recon_tip": "AOD-9604 reconstitutes with 1 mL of <strong>0.6% ACETIC ACID</strong>, NOT plain bacteriostatic water. The peptide is acid-stabilized — using BAC water alone causes faster degradation. Add the BAC water on top after the acetic acid for the rest of your volume.",
    "timing_note": "⏰ <strong>Fasted AM</strong> (within 30 min of waking, before workout). Insulin blocks lipolysis — keep fasted at least 1 hr after injection."
  },
  "retatrutide.html": {
    "name": "Retatrutide",
    "category": "fatloss",
    "tier": "layer",
    "mech": "Triple G (GLP-1 + GIP + glucagon) agonist",
    "route": "sc",
    "vial_mg": 30,
    "bac_ml": 3,
    "dose_mg_per_inj": 4,
    "dose_label": "titrated 2→12 mg",
    "dose_range_mg": [
      2,
      12
    ],
    "freq": "weekly",
    "cycle_weeks": 24,
    "off_weeks": 0,
    "titration": true,
    "research_note": "Titrate 2→4→8→12mg weekly; Phase 2 trials weekly only",
    "recon_tip": "<strong>Titrate slowly</strong> to avoid GI hammer. Reta is the most aggressive of the GLP-1s — start at 2mg/wk, hold each step 4 weeks before bumping. Skip a week if nausea is severe.",
    "timing_note": "⏰ <strong>Same day each week, time flexible.</strong> Most users do Sunday PM with dinner. Skip a dose if GI symptoms severe — restart at lower step."
  },
  "semaglutide.html": {
    "name": "Semaglutide",
    "category": "fatloss",
    "tier": "layer",
    "mech": "GLP-1 receptor agonist",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_mg_per_inj": 1,
    "dose_label": "titrated 0.25→2.4 mg",
    "dose_range_mg": [
      0.25,
      2.4
    ],
    "freq": "weekly",
    "cycle_weeks": 24,
    "off_weeks": 0,
    "titration": true,
    "research_note": "STEP trials; titrate 0.25→2.4mg weekly",
    "recon_tip": "Refrigerate after mixing. Reusing the same syringe across multiple injections from the same vial is fine — just keep the vial cold and the seal intact.",
    "timing_note": "⏰ <strong>Same day each week, time flexible.</strong> Refrigerate after mixing."
  },
  "tirzepatide.html": {
    "name": "Tirzepatide",
    "category": "fatloss",
    "tier": "layer",
    "mech": "Dual GLP-1 + GIP agonist",
    "route": "sc",
    "vial_mg": 30,
    "bac_ml": 1.5,
    "dose_mg_per_inj": 5,
    "dose_label": "titrated 2.5→15 mg",
    "dose_range_mg": [
      2.5,
      15
    ],
    "freq": "weekly",
    "cycle_weeks": 24,
    "off_weeks": 0,
    "titration": true,
    "research_note": "SURMOUNT trials; titrate 2.5→15mg weekly",
    "recon_tip": "Tirz titration: 2.5 → 5 → 7.5 → 10 → 12.5 → 15 mg, hold each step 4 weeks. The GIP component reduces appetite faster than Sema — most users plateau at 10 mg.",
    "timing_note": "⏰ <strong>Same day each week, time flexible.</strong> The GIP component reduces appetite faster than Sema."
  },
  "5amino1mq.html": {
    "name": "5-Amino-1MQ",
    "category": "fatloss",
    "tier": "layer",
    "mech": "NNMT inhibitor — restores NAD+ + reduces methyl trap",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 2,
    "dose_label": "1-2 mg",
    "dose_range_mg": [
      1,
      5
    ],
    "freq": "daily SubQ",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "NNMT inhibitor; SubQ injection 1-5mg/day",
    "timing_note": "⏰ <strong>With or without food.</strong> NNMT inhibitor — works best paired with caloric deficit + resistance training."
  },
  "tesamorelin.html": {
    "name": "Tesamorelin",
    "category": "fatloss",
    "tier": "layer",
    "mech": "Stabilized GHRH analog — visceral fat reduction (FDA-approved HIV-LD)",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 1.5,
    "dose_label": "1-2 mg",
    "dose_range_mg": [
      1,
      2
    ],
    "freq": "daily PM",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "1-2mg/day FDA-approved for visceral fat (lipodystrophy)",
    "timing_note": "⏰ <strong>Pre-bed, fasted 2+ hrs after dinner.</strong> Insulin blocks the GH pulse Tesa is trying to trigger. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> Switch to AM, fully fasted overnight, eat 30-60 min AFTER injection."
  },
  "cjc-no-dac.html": {
    "name": "CJC-1295 (no DAC)",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "GHRH analog — short half-life pulse",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.1,
    "dose_label": "100 mcg",
    "dose_range_mg": [
      0.1,
      0.3
    ],
    "freq": "1-3x daily",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "100mcg pre-bed; pairs with ipamorelin",
    "timing_note": "⏰ <strong>Pre-bed, empty stomach.</strong> Most users add a 2nd shot pre-workout. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> AM only, fully fasted overnight."
  },
  "cjc1295-dac.html": {
    "name": "CJC-1295 (DAC)",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "GHRH analog with DAC — extended half-life",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 2,
    "dose_mg_per_inj": 1.5,
    "dose_label": "1-2 mg",
    "dose_range_mg": [
      1,
      2
    ],
    "freq": "weekly",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "1-2mg/wk; extended GHRH stimulation",
    "timing_note": "⏰ <strong>Pre-bed, empty stomach.</strong> Last meal 2+ hrs before. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> AM only, fully fasted, food 30-60 min after."
  },
  "ipamorelin.html": {
    "name": "Ipamorelin",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "Ghrelin mimetic — selective GH release",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.3,
    "dose_label": "100-300 mcg",
    "dose_range_mg": [
      0.1,
      0.3
    ],
    "freq": "1-3x daily",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "100-300 mcg pre-bed; selective ghrelin agonist",
    "timing_note": "⏰ <strong>Pre-bed, empty stomach.</strong> Pairs with CJC for synergy. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> AM only, fully fasted, food 30-60 min after.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "1x daily (pre-bed)",
          "per_dose_mg": 0.3,
          "weekly_total_mg": 2.1
        },
        {
          "pattern": "2x daily (AM+PM)",
          "per_dose_mg": 0.3,
          "weekly_total_mg": 4.2
        },
        {
          "pattern": "3x daily",
          "per_dose_mg": 0.2,
          "weekly_total_mg": 4.2
        }
      ],
      "rule": "Pulses GH each injection. More frequent = more pulses but higher tolerance build. 1x pre-bed is the cleanest signal. Add 2nd dose post-workout for hypertrophy phase. 3x is borderline overtraining the ghrelin receptor."
    }
  },
  "sermorelin.html": {
    "name": "Sermorelin",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "GHRH 1-29 analog",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 2,
    "dose_mg_per_inj": 0.3,
    "dose_label": "200-500 mcg",
    "dose_range_mg": [
      0.2,
      0.5
    ],
    "freq": "daily PM",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "GHRH; 200-500 mcg pre-bed",
    "timing_note": "⏰ <strong>Pre-bed, empty stomach.</strong> Wait 2+ hrs after last meal. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> AM only, fully fasted overnight."
  },
  "cjc-ipa-blend.html": {
    "name": "CJC + Ipa Blend",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "GHRH + GHRP synergy blend",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 2,
    "dose_mg_per_inj": 0.25,
    "dose_label": "200-400 mcg",
    "dose_range_mg": [
      0.2,
      0.4
    ],
    "freq": "daily PM fasted",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "research_note": "Pre-blended dual; 200-400 mcg",
    "timing_note": "⏰ <strong>Pre-bed, empty stomach.</strong> One shot for both GHRH + GHRP synergy. <strong style=\"color:#FF6B35;\">On a GLP-1?</strong> AM only, fully fasted, food 30-60 min after."
  },
  "igf1-lr3.html": {
    "name": "IGF-1 LR3",
    "category": "gh-axis",
    "tier": "layer",
    "mech": "Long-R3 IGF-1 — extended half-life",
    "route": "sc",
    "vial_mg": 1,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.04,
    "dose_label": "20-80 mcg",
    "dose_range_mg": [
      0.02,
      0.08
    ],
    "freq": "post-workout",
    "cycle_weeks": 4,
    "off_weeks": 4,
    "research_note": "20-80 mcg post-workout; site-specific possible",
    "timing_note": "⏰ <strong>Post-workout window (within 30 min).</strong> Some users add a 2nd dose pre-bed. Site-specific injection possible (research only)."
  },
  "nad-plus.html": {
    "name": "NAD+",
    "category": "longevity",
    "tier": "layer",
    "mech": "Mitochondrial cofactor",
    "route": "sc",
    "vial_mg": 500,
    "bac_ml": 5,
    "dose_mg_per_inj": 100,
    "dose_label": "100 mg",
    "dose_range_mg": [
      50,
      200
    ],
    "freq": "loading 2x/wk × 4wk, then weekly maint",
    "cycle_weeks": 4,
    "off_weeks": 0,
    "research_note": "Loading 100mg 2x/wk × 4wk; substrate for MOTS-c biogenesis",
    "timing_note": "⏰ <strong>Morning, with or without food.</strong> Some users get flushing — split doses help.",
    "titration": [
      {
        "w": "Wk 1 tolerance",
        "d": "25 mg"
      },
      {
        "w": "Wk 2",
        "d": "50 mg"
      },
      {
        "w": "Wk 3-4",
        "d": "75 mg"
      },
      {
        "w": "Wk 5-12 full dose",
        "d": "100 mg"
      }
    ],
    "cadence_flex": {
      "options": [
        {
          "pattern": "1x weekly (200 mg loading)",
          "per_dose_mg": 200,
          "weekly_total_mg": 200
        },
        {
          "pattern": "2x weekly split (100 mg each)",
          "per_dose_mg": 100,
          "weekly_total_mg": 200
        },
        {
          "pattern": "3x weekly Mon · Wed · Fri (67 mg each)",
          "per_dose_mg": 67,
          "weekly_total_mg": 200
        },
        {
          "pattern": "Daily Mon-Fri (40 mg each)",
          "per_dose_mg": 40,
          "weekly_total_mg": 200
        },
        {
          "pattern": "1x weekly (100 mg maintenance)",
          "per_dose_mg": 100,
          "weekly_total_mg": 100
        }
      ],
      "rule": "NAD+ is weekly-total-driven, not per-dose. Same weekly mg = same effect. More frequent = smoother substrate availability + less flushing per shot. Loading phase uses ~200 mg/wk × 4 weeks; maintenance drops to 100 mg/wk."
    }
  },
  "glutathione.html": {
    "name": "Glutathione",
    "category": "longevity",
    "tier": "foundation",
    "mech": "Master antioxidant",
    "route": "sc",
    "vial_mg": 1000,
    "bac_ml": 2,
    "dose_mg_per_inj": 400,
    "dose_label": "200-600 mg",
    "dose_range_mg": [
      200,
      600
    ],
    "freq": "2-3x weekly",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "research_note": "Master antioxidant; 200-600mg 2-3x/wk",
    "timing_note": "⏰ <strong>Morning preferred.</strong> Pairs with NAD+ as a longevity foundation. Push slowly — too fast can cause flushing.",
    "cadence_flex": {
      "options": [
        {
          "pattern": "2x weekly",
          "per_dose_mg": 400,
          "weekly_total_mg": 800
        },
        {
          "pattern": "3x weekly",
          "per_dose_mg": 400,
          "weekly_total_mg": 1200
        },
        {
          "pattern": "daily",
          "per_dose_mg": 200,
          "weekly_total_mg": 1400
        }
      ],
      "rule": "Total weekly dose drives the antioxidant effect, not frequency. Daily at 200 mg/dose = same total as 2-3x/wk at 400 mg. Push slowly either way (too fast IV/SubQ = sulfur taste, mild flushing)."
    }
  },
  "selank.html": {
    "name": "Selank",
    "category": "cognitive",
    "tier": "layer",
    "mech": "Anxiolytic neuropeptide (intranasal)",
    "route": "spray",
    "vial_mg": 10,
    "bac_ml": 6,
    "dose_mg_per_inj": null,
    "dose_label": "1 spray per nostril, 2-3x daily (~300 mcg/spray)",
    "dose_range_mg": null,
    "freq": "2-3x daily intranasal",
    "cycle_weeks": 4,
    "off_weeks": 2,
    "shelf_life_days": 21,
    "recon_tip": "INTRANASAL — do NOT inject. 10 mg vial + 6 mL BAC → reconstitute directly into a nasal spray bottle (not a vial). Pumps deliver ~100 µL = ~167 mcg/spray. Standard dose: 1 spray per nostril, 2-3x daily. Refrigerate 2-8°C, light-protected, 14-21 day shelf.",
    "research_note": "Intranasal; alternate with Semax to avoid tolerance"
  },
  "semax.html": {
    "name": "Semax",
    "category": "cognitive",
    "tier": "layer",
    "mech": "ACTH-derived nootropic (intranasal)",
    "route": "spray",
    "vial_mg": 10,
    "bac_ml": 6,
    "dose_mg_per_inj": null,
    "dose_label": "1-2 sprays per nostril, 1-2x daily (~300-600 mcg/dose)",
    "dose_range_mg": null,
    "freq": "1-2x daily intranasal",
    "cycle_weeks": 4,
    "off_weeks": 2,
    "shelf_life_days": 21,
    "recon_tip": "INTRANASAL — do NOT inject. 10 mg vial + 6 mL BAC → reconstitute directly into a nasal spray bottle (not a vial). Pumps deliver ~100 µL = ~167 mcg/spray. Standard dose: 1-2 sprays per nostril, 1-2x daily (morning + early afternoon — avoid late-day, can be stimulating). Refrigerate 2-8°C, light-protected, 14-21 day shelf.",
    "research_note": "Intranasal; alternate with Selank"
  },
  "dsip.html": {
    "name": "DSIP",
    "category": "cognitive",
    "tier": "layer",
    "mech": "Delta sleep-inducing peptide",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.2,
    "dose_label": "100-300 mcg",
    "dose_range_mg": [
      0.1,
      0.3
    ],
    "freq": "pre-bed",
    "cycle_weeks": 4,
    "off_weeks": 2,
    "research_note": "100-300 mcg pre-bed for sleep architecture"
  },
  "dihexa.html": {
    "name": "Dihexa",
    "category": "cognitive",
    "tier": "layer",
    "mech": "HGF mimetic — synaptogenesis",
    "route": "sc",
    "vial_mg": 50,
    "bac_ml": 1,
    "dose_mg_per_inj": 25,
    "dose_label": "8-25 mg",
    "dose_range_mg": [
      8,
      25
    ],
    "freq": "daily",
    "cycle_weeks": 4,
    "off_weeks": 4,
    "research_note": "HGF mimetic; 8-25 mg/day SubQ"
  },
  "pe2228.html": {
    "name": "PE-22-28",
    "category": "cognitive",
    "tier": "layer",
    "mech": "BDNF-like neuropeptide",
    "route": "spray",
    "vial_mg": null,
    "bac_ml": null,
    "dose_mg_per_inj": 0.375,
    "dose_label": "250-500 mcg",
    "dose_range_mg": [
      0.25,
      0.5
    ],
    "freq": "intranasal",
    "cycle_weeks": 4,
    "off_weeks": 4,
    "research_note": "BDNF-like; intranasal preferred"
  },
  "pt141.html": {
    "name": "PT-141",
    "category": "libido",
    "tier": "layer",
    "mech": "Bremelanotide — melanocortin receptor agonist",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_mg_per_inj": 1.5,
    "dose_label": "1-2 mg",
    "dose_range_mg": [
      1,
      2
    ],
    "freq": "as-needed (45 min before)",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "research_note": "Bremelanotide; 45 min before activity",
    "recon_tip": "Inject <strong>45 minutes before</strong> activity. PT-141 can cause flushing + nausea on first use — start at 1mg, scale to 2mg if tolerated. Do NOT take with stimulants.",
    "timing_note": "⏰ <strong>45 min before activity.</strong> On-demand only — no daily cycling. Avoid stimulants same day. Start at 1mg, scale to 2mg if tolerated."
  },
  "melanotan1.html": {
    "name": "Melanotan I",
    "category": "libido",
    "tier": "layer",
    "mech": "α-MSH analog — melanin stimulation",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.5,
    "dose_label": "0.5-1 mg",
    "dose_range_mg": [
      0.25,
      1
    ],
    "freq": "daily/2x weekly",
    "cycle_weeks": 8,
    "off_weeks": 8,
    "research_note": "Loading 1mg/d × 10d, maint 0.5mg 2x/wk"
  },
  "melanotan2.html": {
    "name": "Melanotan II",
    "category": "libido",
    "tier": "layer",
    "mech": "α-MSH analog — melanin + sexual response",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_mg_per_inj": 0.5,
    "dose_label": "0.5-1 mg",
    "dose_range_mg": [
      0.25,
      1
    ],
    "freq": "daily/2x weekly",
    "cycle_weeks": 8,
    "off_weeks": 8,
    "research_note": "Loading 0.5-1mg/d, maint 0.5mg 2x/wk"
  },
  "l-carnitine.html": {
    "name": "L-Carnitine",
    "category": "fatloss",
    "tier": "foundation",
    "mech": "Fatty-acid β-oxidation cofactor",
    "route": "sc",
    "vial_mg": 1000,
    "bac_ml": 2,
    "dose_mg_per_inj": 350,
    "dose_label": "200-500 mg",
    "dose_range_mg": [
      200,
      500
    ],
    "freq": "pre-cardio",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "research_note": "200-500 mg pre-cardio for fat oxidation"
  },
  "glutamine.html": {
    "name": "Glutamine",
    "category": "recovery",
    "tier": "foundation",
    "mech": "Conditionally-essential amino — gut + immune",
    "route": "sc",
    "vial_mg": 1000,
    "bac_ml": 2,
    "dose_mg_per_inj": 350,
    "dose_label": "200-500 mg",
    "dose_range_mg": [
      200,
      500
    ],
    "freq": "daily",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "research_note": "Gut + recovery support; 200-500 mg/day"
  },
  "slu-pp-322.html": {
    "name": "SLU-PP-332",
    "category": "fatloss",
    "tier": "layer",
    "mech": "ERRα agonist — exercise-mimetic",
    "route": "sc",
    "vial_mg": 5,
    "bac_ml": 2,
    "dose_mg_per_inj": 0.5,
    "dose_label": "500 mcg–1 mg",
    "dose_range_mg": [
      0.5,
      1
    ],
    "freq": "3-5x weekly",
    "weekly_total_mg": [
      1.5,
      3
    ],
    "cycle_weeks": 8,
    "off_weeks": 4,
    "shelf_life_days": 28,
    "recon_tip": "5 mg vial + 2 mL BAC → 2,500 mcg/mL · 500 mcg = 20u on U-100 · refrigerate 2-8°C, light-protected. NOTE: Published murine studies used IP route only; SubQ in humans is not formally validated — research compound.",
    "research_note": "ERRα agonist exercise-mimetic · injectable research compound · 500mcg-1mg 3-5x/wk · SubQ not formally validated"
  },
  "testosterone-cyp.html": {
    "name": "Testosterone Cypionate",
    "category": "trt",
    "tier": "layer",
    "mech": "Long-ester androgen (8-day half-life) · Rx",
    "route": "sc/im",
    "vial_mg": 2000,
    "bac_ml": 10,
    "dose_mg_per_inj": 100,
    "dose_label": "100-200 mg/wk total · 50-100 mg/inj 2x weekly",
    "dose_range_mg": [
      50,
      100
    ],
    "weekly_total_mg": [
      100,
      200
    ],
    "freq": "2x weekly (Mon + Thu)",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "rx": true,
    "premixed": "200 mg/mL",
    "research_note": "Rx · pre-mixed 200mg/mL · 100-200mg/wk total split 2x"
  },
  "testosterone-enth.html": {
    "name": "Testosterone Enanthate",
    "category": "trt",
    "tier": "layer",
    "mech": "Long-ester androgen (7-day half-life) · Rx",
    "route": "sc/im",
    "vial_mg": 2000,
    "bac_ml": 10,
    "dose_mg_per_inj": 100,
    "dose_label": "100-200 mg/wk total · 50-100 mg/inj 2x weekly",
    "dose_range_mg": [
      50,
      100
    ],
    "weekly_total_mg": [
      100,
      200
    ],
    "freq": "2x weekly (Mon + Thu)",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "rx": true,
    "premixed": "200 mg/mL",
    "research_note": "Rx · pre-mixed 200mg/mL · 100-200mg/wk total split 2x"
  },
  "testosterone-prop.html": {
    "name": "Testosterone Propionate",
    "category": "trt",
    "tier": "layer",
    "mech": "Short-ester androgen (3-day half-life) · Rx",
    "route": "sc/im",
    "vial_mg": 1000,
    "bac_ml": 10,
    "dose_mg_per_inj": 50,
    "dose_label": "75-175 mg/wk total · 25-75 mg/inj EOD",
    "dose_range_mg": [
      25,
      75
    ],
    "weekly_total_mg": [
      75,
      175
    ],
    "freq": "every other day",
    "cycle_weeks": 52,
    "off_weeks": 0,
    "rx": true,
    "premixed": "100 mg/mL",
    "research_note": "Rx · pre-mixed 100mg/mL · 75-175mg/wk total EOD"
  },
  "wolverine.html": {
    "name": "Wolverine Stack",
    "category": "stack",
    "tier": "layer",
    "mech": "BPC-157 5mg + TB-500 5mg combined in ONE vial",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_label": "see components",
    "freq": "daily",
    "cycle_weeks": 6,
    "off_weeks": 4,
    "combined_bottle": true,
    "components": [
      {
        "name": "BPC-157",
        "dose_mg": 0.25
      },
      {
        "name": "TB-500",
        "dose_mg": 2.5
      }
    ],
    "research_note": "No copper conflict — chemically stable combined"
  },
  "klow.html": {
    "name": "KLOW Stack",
    "category": "stack",
    "tier": "layer",
    "mech": "KPV + TB-500 + BPC-157 + GHK-Cu combined in ONE vial",
    "route": "sc",
    "vial_mg": 80,
    "bac_ml": 3,
    "dose_label": "see components",
    "freq": "daily",
    "cycle_weeks": 6,
    "off_weeks": 4,
    "combined_bottle": true,
    "components": [
      {
        "name": "KPV",
        "dose_mg": 0.5
      },
      {
        "name": "TB-500",
        "dose_mg": 2.5
      },
      {
        "name": "BPC-157",
        "dose_mg": 0.25
      },
      {
        "name": "GHK-Cu",
        "dose_mg": 2
      }
    ],
    "warning": "GHK-Cu copper degrades TB-500 — mix fresh weekly or run separate bottles",
    "recon_tip": "⚠️ KLOW combo bottle has GHK-Cu copper degrading TB-500. Mix fresh weekly and use within 7 days, OR run as separate vials."
  },
  "glow.html": {
    "name": "GLOW Stack",
    "category": "stack",
    "tier": "layer",
    "mech": "GHK-Cu + TB-500 + BPC-157 combined in ONE vial",
    "route": "sc",
    "vial_mg": 10,
    "bac_ml": 3,
    "dose_label": "see components",
    "freq": "daily",
    "cycle_weeks": 8,
    "off_weeks": 4,
    "combined_bottle": true,
    "components": [
      {
        "name": "GHK-Cu",
        "dose_mg": 2
      },
      {
        "name": "TB-500",
        "dose_mg": 2.5
      },
      {
        "name": "BPC-157",
        "dose_mg": 0.25
      }
    ],
    "warning": "GHK-Cu copper degrades TB-500 — mix fresh weekly or run separate bottles",
    "recon_tip": "⚠️ GLOW combo bottle has GHK-Cu copper degrading TB-500. Mix fresh weekly and use within 7 days, OR run as separate vials."
  },
  "cardiac-stack.html": {
    "name": "Cardiac Stack",
    "category": "stack",
    "tier": "layer",
    "mech": "Heart-focused multi-bottle stack",
    "route": "sc",
    "dose_label": "see components",
    "freq": "daily",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "combined_bottle": false,
    "components": [
      {
        "name": "TB-500",
        "dose_mg": 2.5
      },
      {
        "name": "BPC-157",
        "dose_mg": 0.25
      },
      {
        "name": "MOTS-c",
        "dose_mg": 5
      },
      {
        "name": "SS-31",
        "dose_mg": 5
      }
    ],
    "research_note": "Multi-bottle — separate vials"
  },
  "longevity-stack.html": {
    "name": "Longevity Stack",
    "category": "stack",
    "tier": "layer",
    "mech": "Multi-bottle longevity protocol",
    "route": "sc",
    "dose_label": "see components",
    "freq": "pulsed",
    "cycle_weeks": 16,
    "off_weeks": 4,
    "combined_bottle": false,
    "components": [
      {
        "name": "GHK-Cu",
        "dose_mg": 2
      },
      {
        "name": "Epitalon",
        "dose_mg": 7.5
      },
      {
        "name": "SS-31",
        "dose_mg": 5
      },
      {
        "name": "NAD+",
        "dose_mg": 100
      }
    ],
    "research_note": "Multi-bottle — separate vials"
  },
  "mito-reset.html": {
    "name": "Mito Reset",
    "category": "stack",
    "tier": "layer",
    "mech": "Mitochondrial reset protocol",
    "route": "sc",
    "dose_label": "see components",
    "freq": "daily",
    "cycle_weeks": 12,
    "off_weeks": 4,
    "combined_bottle": false,
    "components": [
      {
        "name": "MOTS-c",
        "dose_mg": 3
      },
      {
        "name": "SS-31",
        "dose_mg": 5
      },
      {
        "name": "NAD+",
        "dose_mg": 100
      },
      {
        "name": "Glutathione",
        "dose_mg": 400
      }
    ],
    "research_note": "Multi-bottle — separate vials. Sequence: NAD+ → MOTS-c → SS-31"
  }
};
window.APEX_INTERACTIONS = [
  {
    "id": "glp1-blunts-gh-pulse",
    "groups": [
      [
        "retatrutide.html",
        "semaglutide.html",
        "tirzepatide.html"
      ],
      [
        "cjc-no-dac.html",
        "cjc1295-dac.html",
        "ipamorelin.html",
        "sermorelin.html",
        "tesamorelin.html",
        "cjc-ipa-blend.html"
      ]
    ],
    "type": "timing",
    "severity": "high",
    "icon": "⚠️",
    "title": "Your GLP-1 is blunting your GH pulse — fix the timing",
    "summary": "GLP-1s (Reta/Sema/Tirz) delay gastric emptying by ~35 minutes. The standard 'wait 2 hours after eating' rule for GH peptides BREAKS when you're on a GLP-1. Food sits in your stomach longer → insulin stays elevated → insulin binds somatotrophs in your pituitary and suppresses ~58% of GH mRNA. Every shot of CJC/Ipa/Tesa you take after a meal is hitting an actively-suppressed pituitary. You're paying for a GH pulse you're not getting.",
    "fix": "Inject your GH peptides FIRST THING IN THE MORNING — fully fasted from overnight. Wait 30-60 min before your first meal. That gives the GH pulse time to peak BEFORE insulin rises. On evenings: skip the pre-bed dose, OR do it at least 4 hours after dinner instead of the standard 2.",
    "citations": [
      "JCEM 2025 — Gastric emptying T½ goes from 95 min → 138 min on GLP-1 RAs (meta-analysis)",
      "ASA 2024 — High-risk GLP-1 patients now require 24-hr liquid-only diet pre-anesthesia",
      "JBC — Insulin binds somatotroph receptor, suppresses GH mRNA ~58% via JAK2/STAT5B",
      "Frontiers in Endocrinology 2024 — Intra-portal insulin upregulates hepatic GHR; fed state = liver pulls more GH = pituitary makes less"
    ]
  },
  {
    "id": "glp1-tesa-overlap",
    "groups": [
      [
        "retatrutide.html",
        "semaglutide.html",
        "tirzepatide.html"
      ],
      [
        "tesamorelin.html"
      ]
    ],
    "type": "dose",
    "severity": "medium",
    "icon": "📉",
    "title": "Reta/Sema/Tirz + Tesamorelin = double visceral-fat hit",
    "summary": "Both compounds drive visceral adiposity reduction by different mechanisms (GLP-1 = systemic appetite + insulin sensitivity, Tesa = direct lipolysis via GHRH). Stacking them can produce aggressive visceral fat loss in 8-12 weeks — sometimes uncomfortably fast (loose skin, lipid panel shifts).",
    "fix": "If you're on a GLP-1 already, start Tesa at 0.5-1.0 mg (not the full 2 mg) for the first 4 weeks. Get baseline + 6-week labs (lipids, IGF-1, fasting glucose). If body comp is moving aggressively, drop Tesa frequency to 5 days/week.",
    "citations": [
      "Falutz et al, NEJM 2007 — Tesamorelin reduces visceral fat 17% in 26 weeks (HIV-LD)",
      "Wilding et al, NEJM 2021 STEP-1 — Semaglutide 2.4mg reduces visceral fat 22%"
    ]
  },
  {
    "id": "ghkcu-degrades-tb500",
    "groups": [
      [
        "ghkcu.html"
      ],
      [
        "tb500.html"
      ]
    ],
    "type": "chemistry",
    "severity": "high",
    "icon": "⚗️",
    "title": "GHK-Cu copper degrades TB-500 in the same vial",
    "summary": "GHK-Cu's copper ion oxidizes TB-500's methionine residues. In a combined vial (KLOW, GLOW), TB-500 is significantly degraded within ~7 days. Most user-reported 'TB-500 stopped working' issues trace to this.",
    "fix": "Run them in SEPARATE vials, not combined. If you must use a combo (KLOW/GLOW), mix fresh weekly and use within 7 days. Better: alternate 4-week pulses (TB-500 weeks 1-4, GHK-Cu weeks 5-8) so they're never in your system at high concentrations simultaneously.",
    "citations": [
      "Methionine oxidation kinetics in copper-containing peptide formulations — well documented in pharmaceutical stability literature",
      "Pickart 2018 — GHK-Cu peptide chemistry review"
    ]
  },
  {
    "id": "fox04-before-epitalon",
    "groups": [
      [
        "fox04-dri.html"
      ],
      [
        "epitalon.html"
      ]
    ],
    "type": "sequencing",
    "severity": "medium",
    "icon": "🔁",
    "title": "Run FOX04 BEFORE Epitalon — order matters",
    "summary": "FOX04-DRI is a senolytic — clears damaged 'zombie' cells. Epitalon is a telomerase activator — extends telomeres on existing cells. If you run Epitalon first, you're extending the lifespan of the SAME senescent cells you'd be clearing later. Run FOX04 first to clean house, then Epitalon to rebuild.",
    "fix": "Schedule: FOX04 5-day pulse → 4-week wash-out → Epitalon 10-20 day pulse. Sequencer auto-orders this if both are in your stack.",
    "citations": [
      "Baar et al, Cell 2017 — FOX04-DRI clears senescent cells in vivo, restores tissue function",
      "Khavinson 2014 — Epitalon telomerase activation in fibroblasts"
    ]
  },
  {
    "id": "motsc-needs-nad",
    "groups": [
      [
        "motsc.html"
      ],
      [
        "nad-plus.html"
      ]
    ],
    "type": "synergy",
    "severity": "synergy",
    "icon": "⚡",
    "title": "MOTS-c + NAD+ = substrate-fueled biogenesis",
    "summary": "MOTS-c drives mitochondrial biogenesis through AMPK activation. The biogenesis machinery RUNS on NAD+ as a cofactor. Adding NAD+ before/during MOTS-c gives the biogenesis pathway the substrate it needs. This is the cleanest synergy in the longevity stack.",
    "fix": "Load NAD+ for 2-4 weeks BEFORE starting MOTS-c (100mg 2x/wk). Then run MOTS-c 8-week cycle with NAD+ maintenance dose 1x/wk. SS-31 comes AFTER (repairs the new mitos biogenesis just produced).",
    "citations": [
      "Lee et al, Cell Metabolism 2015 — MOTS-c activates AMPK, NAD+/SIRT1 axis",
      "Bonkowski & Sinclair, Nat Rev Mol Cell Biol 2016 — NAD+ precursors in mitochondrial biogenesis"
    ]
  },
  {
    "id": "motsc-then-ss31",
    "groups": [
      [
        "motsc.html"
      ],
      [
        "ss31.html"
      ]
    ],
    "type": "sequencing",
    "severity": "medium",
    "icon": "🔁",
    "title": "MOTS-c FIRST (build new mitos), SS-31 SECOND (repair them)",
    "summary": "MOTS-c builds new mitochondria via biogenesis. SS-31 stabilizes/repairs cardiolipin in EXISTING mitochondria. If you run SS-31 before MOTS-c, you're repairing old damaged mitos that are about to be replaced anyway — you waste the SS-31. Sequence wins.",
    "fix": "MOTS-c weeks 1-8 (biogenesis), then SS-31 weeks 9-14 (repair the new ones). Don't run them simultaneously.",
    "citations": [
      "Birk et al, JASN 2013 — SS-31 cardiolipin protection",
      "Lee et al, Cell Metabolism 2015 — MOTS-c biogenesis pathway"
    ]
  },
  {
    "id": "bpc-tb-paired-healing",
    "groups": [
      [
        "bpc157.html"
      ],
      [
        "tb500.html"
      ]
    ],
    "type": "synergy",
    "severity": "synergy",
    "icon": "⚡",
    "title": "BPC-157 + TB-500 — paired healing protocol",
    "summary": "BPC-157 = tissue protection + angiogenesis at the local site. TB-500 = systemic actin filament regulation + immune cell migration. They cover different mechanistic ground — BPC for the where, TB for the how. Pair beats either alone for serious tendon/ligament/gut healing.",
    "fix": "Run as a 4-6 week pulse together for active recovery, then 4 weeks OFF. Continuous use loses effectiveness — both downregulate their own receptors over time.",
    "citations": [
      "Sikiric et al, Curr Pharm Des 2018 — BPC-157 tendon meta-analysis",
      "Goldstein et al, Ann NY Acad Sci 2012 — Thymosin β4 in tissue repair"
    ]
  },
  {
    "id": "cjc-ipa-synergy",
    "groups": [
      [
        "cjc1295-dac.html",
        "cjc-no-dac.html",
        "sermorelin.html",
        "tesamorelin.html"
      ],
      [
        "ipamorelin.html"
      ]
    ],
    "type": "synergy",
    "severity": "synergy",
    "icon": "⚡",
    "title": "GHRH + GHRP = bigger GH pulse than either alone",
    "summary": "CJC-1295 / Sermorelin / Tesamorelin are GHRH analogs (push GH from one direction). Ipamorelin is a ghrelin mimetic / GHRP (pulls GH from another). Stacking them produces a synergistic pulse that's larger than the sum of the two — 'amp + speaker' for the pituitary.",
    "fix": "Inject together pre-bed (or AM if you're also on a GLP-1 — see the GLP-1 timing warning). Pre-blended CJC+Ipa formulations save you a needle. Selective for GH (Ipamorelin doesn't spike cortisol/prolactin like older GHRPs).",
    "citations": [
      "Walker, J Endocrinol Invest 2006 — GHRH + GHRP synergy in healthy adults",
      "Raun et al, Eur J Endocrinol 1998 — Ipamorelin selectivity profile"
    ]
  },
  {
    "id": "trt-bodyfat-aromatase",
    "groups": [
      [
        "testosterone-cyp.html",
        "testosterone-enth.html",
        "testosterone-prop.html"
      ],
      [
        "bpc157.html",
        "tb500.html",
        "ghkcu.html",
        "kpv.html",
        "ll37.html",
        "thymosin-alpha1.html",
        "ara290.html",
        "epitalon.html",
        "ss31.html",
        "motsc.html",
        "cartalax.html",
        "fox04-dri.html",
        "aod9604.html",
        "retatrutide.html",
        "semaglutide.html",
        "tirzepatide.html",
        "cjc-no-dac.html",
        "cjc1295-dac.html",
        "ipamorelin.html",
        "tesamorelin.html",
        "cjc-ipa-blend.html",
        "igf1-lr3.html",
        "5amino1mq.html",
        "nad-plus.html",
        "melanotan1.html",
        "melanotan2.html",
        "pt141.html",
        "sermorelin.html",
        "dsip.html",
        "dihexa.html",
        "pe2228.html",
        "l-carnitine.html",
        "glutamine.html",
        "glutathione.html",
        "selank.html",
        "semax.html",
        "slu-pp-322.html"
      ]
    ],
    "type": "dose",
    "severity": "medium",
    "icon": "⚠️",
    "title": "TRT response is body-fat dependent — drop fat first if you can",
    "summary": "Aromatase (CYP19A1) is concentrated in adipose tissue. Higher body fat = more testosterone converts to estradiol BEFORE it can do its job. Heavier guys routinely report 'I started TRT and didn't feel anything' — this is the mechanism. The relationship is continuous, not a 15% step.",
    "fix": "If TRT is non-negotiable now, monitor E2 (sensitive assay) at 6 weeks and 12 weeks. Plan with your doctor on a possible aromatase inhibitor. If you can drop body fat first, your starting T:E2 ratio is better and you need less testosterone to feel it.",
    "citations": [
      "Cohen, J Sex Med 2008 — aromatase mechanism in adipose",
      "Tajar et al, JCEM 2010 — EMAS: obesity strongest predictor of secondary hypogonadism",
      "Saboor Aftab et al, Clin Endocrinol 2013 — MOSH review",
      "Hammoud et al, JCEM 2009 — weight loss raised T from 370 → 520 ng/dL with no T added",
      "Camacho et al, Eur J Endocrinol 2013 — body comp correlates with T independent of age"
    ]
  },
  {
    "id": "ghkcu-aod-fat-loss",
    "groups": [
      [
        "aod9604.html"
      ],
      [
        "retatrutide.html",
        "semaglutide.html",
        "tirzepatide.html"
      ]
    ],
    "type": "dose",
    "severity": "medium",
    "icon": "🔥",
    "title": "GLP-1 already crushing appetite — adding AOD might be overkill",
    "summary": "GLP-1s already crush appetite; you're running a meaningful caloric deficit. Adding AOD-9604 on top pushes the deficit harder and accelerates lean-mass loss if protein intake + resistance training don't hold up. Most users don't need both.",
    "fix": "If body comp is moving on the GLP-1 alone, hold AOD until you taper off. If you've plateaued (rare), add AOD 0.3 mg fasted AM and reassess at 4 weeks. Either way: bump protein to 1.2 g/lb LBM and prioritize 3+ lifting sessions per week to protect muscle.",
    "citations": [
      "Heffernan et al, Endocrinology 2001 — AOD-9604 lipolytic activity, no diabetogenic effect",
      "Wilding et al, NEJM 2021 — STEP-1 semaglutide weight loss profile"
    ]
  },
  {
    "id": "combined-bottle-dose-flaw",
    "groups": [
      [
        "wolverine.html"
      ],
      [
        "wolverine.html"
      ]
    ],
    "type": "dose",
    "severity": "medium",
    "icon": "⚠️",
    "title": "Wolverine combined bottle — dose-ratio compromise (manageable)",
    "summary": "Wolverine = 5mg BPC + 5mg TB-500 in one 3mL vial. The peptides are CHEMICALLY STABLE together (no copper to destroy TB), but the locked-ratio formulation means you can't independently dose them. BPC target is 0.25mg, TB target is 2.5mg — a 10× difference. Whichever you target by volume, the other is dosed wrong. This is a convenience-vs-optimal trade-off, not a chemistry disaster.",
    "fix": "Practical play: target BPC-157 (0.25mg = ~15 units in standard recon) and inject DAILY. TB will be sub-target (~0.25mg/inj × 7 = 1.75mg/wk vs 5mg/wk target) but still active for systemic recovery. For full optimal TB dosing — run separate vials. The chemistry is fine either way.",
    "citations": [
      "Pharmaceutical formulation principle: components in fixed-ratio combinations cannot be independently titrated — see FDA guidance on combination drug products.",
      "BPC-157 effective dose: 200-500 mcg/day (Sikiric et al, Curr Pharm Des 2018)",
      "TB-500 effective dose: 2.0-5.0 mg 2x weekly (Goldstein et al, Ann NY Acad Sci 2012) — 10× the BPC dose"
    ]
  },
  {
    "id": "bpc-protects-glp1-gut",
    "groups": [
      [
        "bpc157.html"
      ],
      [
        "retatrutide.html",
        "semaglutide.html",
        "tirzepatide.html"
      ]
    ],
    "type": "synergy",
    "severity": "synergy",
    "icon": "⚡",
    "title": "BPC-157 + GLP-1 — gut protection synergy",
    "summary": "GLP-1s delay gastric emptying and routinely cause nausea, bloating, gastroparesis-like symptoms — that's the #1 reason users quit. BPC-157 is gut-mucosa protective; it accelerates healing of the GI lining stressed by slowed transit. Many users report nausea drops within 7-10 days of adding daily BPC.",
    "fix": "If you're starting a GLP-1 OR you've been on one and have GI symptoms — add BPC-157 250 mcg/day, fasted morning, SubQ near the abdomen. Continue for at least 4 weeks. Doesn't reduce GLP-1 effectiveness — just makes the side effects bearable.",
    "citations": [
      "Sikiric et al, Curr Pharm Des 2018 — BPC-157 GI mucosal protection meta",
      "Wettergren et al, Dig Dis Sci 1993 — GLP-1 delays gastric emptying mechanism",
      "Anecdotal: r/Peptides + r/Semaglutide threads consistently report BPC reducing GLP-1 GI side effects"
    ]
  },
  {
    "id": "selank-semax-tolerance",
    "groups": [
      [
        "selank.html"
      ],
      [
        "semax.html"
      ]
    ],
    "type": "dose",
    "severity": "medium",
    "icon": "🔁",
    "title": "Selank + Semax build tolerance fast — alternate them",
    "summary": "Both Selank (anxiolytic) and Semax (nootropic) produce strong week-1 effects but tolerance flattens the response within 3-4 weeks of daily use. Running them simultaneously every day = double tolerance build, half the benefit by week 4.",
    "fix": "Alternate by week. Selank weeks 1-4 → switch to Semax weeks 5-8 → back to Selank weeks 9-12. Or run one at a time, never both daily. 2-week off-period at the end of each 4-week pulse keeps the response sharp.",
    "citations": [
      "Kozlovskii et al, Eksp Klin Farmakol 2002 — Selank tolerance kinetics in repeated dosing",
      "Kaplan et al, Vestn Ross Akad Med Nauk 2007 — Semax neurochemistry + tolerance window"
    ]
  },
  {
    "id": "pt141-melanotan-bp-risk",
    "groups": [
      [
        "pt141.html",
        "melanotan2.html",
        "melanotan1.html"
      ],
      [
        "pt141.html",
        "melanotan2.html",
        "melanotan1.html"
      ]
    ],
    "type": "dose",
    "severity": "high",
    "icon": "⚠️",
    "title": "Melanocortin agonists raise BP — skip stimulants the same day",
    "summary": "PT-141 (bremelanotide) and Melanotan I/II are melanocortin receptor agonists. Common side effect: transient blood-pressure spike of 5-15 mmHg systolic in the 2-4 hours post-injection. Stacking with caffeine, pseudoephedrine, ADHD stimulants (Adderall/Vyvanse), or pre-workout powders compounds the effect — can hit hypertensive-urgency territory in sensitive users.",
    "fix": "On days you inject PT-141 or Melanotan: skip stimulants for 4+ hours before AND after. If you're on chronic ADHD meds, time the injection 6-8 hr after your last dose. If you have ANY history of hypertension or cardiovascular disease — talk to a licensed provider before using.",
    "citations": [
      "Diamond et al, J Sex Med 2006 — Bremelanotide BP profile, healthy adults",
      "Dorr et al, Life Sci 1996 — Melanotan II cardiovascular effects",
      "Rev. of melanocortin receptor signaling in cardiovascular tissue (multiple)"
    ]
  },
  {
    "id": "trt-aod-recomp-synergy",
    "groups": [
      [
        "testosterone-cyp.html",
        "testosterone-enth.html",
        "testosterone-prop.html"
      ],
      [
        "aod9604.html"
      ]
    ],
    "type": "synergy",
    "severity": "synergy",
    "icon": "⚡",
    "title": "TRT + AOD-9604 — clean recomposition synergy",
    "summary": "TRT drives lean mass + nitrogen retention. AOD-9604 drives lipolysis without affecting blood sugar or IGF-1 (unlike full GH). Together: muscle preservation + fat loss with minimal systemic GH downstream. Cleaner than TRT + full GH stack and avoids the IGF-1 elevation that bothers some lifters.",
    "fix": "Inject AOD 250-300 mcg fasted AM (45 min before cardio if possible). Continue TRT on its standard schedule. Watch body comp at 6/12 weeks — combination usually moves visceral fat fast in months 1-2 then plateaus.",
    "citations": [
      "Heffernan et al, Endocrinology 2001 — AOD-9604 lipolysis without GH side effects",
      "Bhasin et al, J Clin Endocrinol Metab 1996 — Testosterone dose-response on lean mass"
    ]
  },
  {
    "id": "multiple-pulse-spread",
    "groups": [
      [
        "fox04-dri.html",
        "epitalon.html",
        "cartalax.html"
      ],
      [
        "fox04-dri.html",
        "epitalon.html",
        "cartalax.html"
      ]
    ],
    "type": "sequencing",
    "severity": "medium",
    "icon": "🔁",
    "title": "Multiple pulse peptides — spread them across the year",
    "summary": "FOX04-DRI, Epitalon, and Cartalax are all 1-2x per year pulse protocols. Running them simultaneously wastes the year's pulse window — you only get one shot at each per cycle. They also hit different mechanisms (senolytic / telomerase / cartilage bioregulation) so doing them stacked muddies the signal of what's working.",
    "fix": "Schedule across 4 quarters: FOX04 in Q1 (clears senescent cells first) → Epitalon in Q2 (telomerase reset on cleaner population) → Cartalax in Q3-Q4 if joint focus. The sequencer auto-spreads them when all three are in your stack.",
    "citations": [
      "Baar et al, Cell 2017 — FOX04-DRI senolytic timing in murine models",
      "Khavinson 2014 — Epitalon telomerase pulse protocol",
      "Khavinson + Anisimov peptide bioregulator review"
    ]
  }
];

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
