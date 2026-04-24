// ══════════════════════════════════════════════════════════════════════════
// APEX MACRO CALCULATOR — Shared engine
// Used by nutrition.html AND protocol-tracker.html (Reta wizard Step 6)
// so the two pages ALWAYS agree on BMR, TDEE, deficit, and macro split.
//
// Usage:
//   const result = ApexMacroCalc.calculate({
//     weight: 245,          // lb
//     heightIn: 70,         // inches total
//     age: 38,              // years
//     gender: 'male',       // 'male' | 'female'
//     bfCurrent: 13,        // body fat % (optional — triggers Katch-McArdle)
//     activity: 1.35,       // multiplier (ignored if workoutBurn > 0)
//     workoutBurn: 0,       // daily workout burn in kcal (optional, more accurate)
//     goal: 'cut',          // 'cut' | 'maintain' | 'bulk'
//     compound: null,       // 'Retatrutide' | 'Tirzepatide' | 'Semaglutide' | null
//     userProteinPerLb: 1.0 // manual protein slider value (fallback)
//   });
//
//   result: {
//     bmr, mifflinBmr, katchBmr, formulaName, formulaNote,
//     lbmLb, tdee, activityNote,
//     targetCal, deficit, deficitLabel,
//     proteinG, proteinPerLb, proteinNote,
//     fatG, fatNote,
//     carbG,
//     glp1: 'Retatrutide' | null
//   }
// ══════════════════════════════════════════════════════════════════════════
(function(global){
  'use strict';

  // ── Per-compound deficit + protein profile (Phase 2/3 trial data) ──
  const COMPOUND_PROFILES = {
    Retatrutide: {
      deficit: 1000,
      proteinPerLbLbm: 1.1,
      proteinPerLbBw: 1.2,
      weeklyLossRate: 2.0,
      source: 'Jastreboff et al. Retatrutide Phase 2, NEJM 2023',
      deficitLabel: '1000 cal deficit — aggressive muscle-sparing (Reta)',
    },
    Tirzepatide: {
      deficit: 750,
      proteinPerLbLbm: 1.05,
      proteinPerLbBw: 1.1,
      weeklyLossRate: 1.5,
      source: 'Jastreboff et al. SURMOUNT-1, NEJM 2022',
      deficitLabel: '750 cal deficit — Tirzepatide muscle-aware',
    },
    Semaglutide: {
      deficit: 600,
      proteinPerLbLbm: 1.05,
      proteinPerLbBw: 1.1,
      weeklyLossRate: 1.2,
      source: 'Wilding et al. STEP-1, NEJM 2021',
      deficitLabel: '600 cal deficit — Semaglutide mode',
    },
  };

  function calculate(input) {
    const w = parseFloat(input.weight) || 0;
    const heightIn = parseFloat(input.heightIn) || 70;
    const age = parseFloat(input.age) || 35;
    const gender = input.gender || 'male';
    const bfCurrent = parseFloat(input.bfCurrent) || 0;
    const activity = parseFloat(input.activity) || 1.35;
    const workoutBurn = parseFloat(input.workoutBurn) || 0;
    const goal = input.goal || 'cut';
    const compound = input.compound || null;
    const userProteinPerLb = parseFloat(input.userProteinPerLb) || 1.0;

    const wKg = w * 0.453592;
    const hCm = heightIn * 2.54;

    // ── BMR: auto-pick Katch-McArdle when BF% is known (more accurate for lean OR obese),
    //         fall back to Mifflin-St Jeor otherwise ──
    const mifflinBmr = gender === 'male'
      ? Math.round(10 * wKg + 6.25 * hCm - 5 * age + 5)
      : Math.round(10 * wKg + 6.25 * hCm - 5 * age - 161);

    let katchBmr = null;
    let lbmLb = null;
    if (bfCurrent > 0 && bfCurrent < 60) {
      lbmLb = w * (1 - bfCurrent / 100);
      const lbmKg = lbmLb * 0.453592;
      katchBmr = Math.round(370 + 21.6 * lbmKg);
    }

    const useKatch = katchBmr !== null;
    const bmr = useKatch ? katchBmr : mifflinBmr;
    const formulaName = useKatch ? 'Katch-McArdle' : 'Mifflin-St Jeor';
    const formulaNote = useKatch
      ? 'Uses your lean body mass (' + (lbmLb ? lbmLb.toFixed(0) : '?') + ' lb). More accurate because body fat % is known.'
      : 'Uses weight + height + age. General-population standard.';

    // ── TDEE: prefer direct workout burn input, else activity multiplier ──
    let tdee, activityNote;
    if (workoutBurn > 0) {
      tdee = Math.round(bmr * 1.2 + workoutBurn);
      activityNote = 'BMR × 1.2 (sedentary baseline) + ' + workoutBurn + ' cal/day workout burn';
    } else {
      tdee = Math.round(bmr * activity);
      activityNote = 'BMR × ' + activity + ' activity multiplier';
    }

    // ── Deficit and target calories ──
    const profile = compound ? COMPOUND_PROFILES[compound] : null;
    let deficit = 500;
    let deficitLabel = '500 cal deficit';
    if (profile) {
      deficit = profile.deficit;
      deficitLabel = profile.deficitLabel;
    }

    let targetCal = tdee;
    if (goal === 'cut') {
      targetCal = Math.max(1200, tdee - deficit);
    } else if (goal === 'bulk') {
      targetCal = tdee + 300;
      deficitLabel = '300 cal surplus';
    } else {
      deficitLabel = 'maintenance';
    }

    // ── PROTEIN: LBM-based when BF% known (Phillips 2018), BW-based fallback ──
    let proteinG, proteinNote, proteinPerLb;
    if (useKatch) {
      const perLbLbm = profile ? profile.proteinPerLbLbm : 1.05;
      proteinG = Math.round(lbmLb * perLbLbm);
      proteinPerLb = perLbLbm;
      proteinNote = perLbLbm + 'g per lb of LEAN body mass (Phillips 2018 meta-analysis)';
    } else {
      const perLb = profile ? profile.proteinPerLbBw : userProteinPerLb;
      proteinG = Math.round(w * perLb);
      proteinPerLb = perLb;
      proteinNote = perLb + 'g per lb of bodyweight (fallback — no BF% entered)';
    }

    // ── FAT: MAX of 25% of calories, 0.3g per lb BW (hormone floor) ──
    const fatGFromCals = Math.round((targetCal * 0.25) / 9);
    const fatGFloor = Math.round(w * 0.3);
    const fatG = Math.max(fatGFromCals, fatGFloor);
    const fatNote = fatG === fatGFloor
      ? '0.3g per lb bodyweight (hormone floor)'
      : '25% of calories';

    // ── CARBS: remainder ──
    const carbG = Math.max(0, Math.round((targetCal - proteinG * 4 - fatG * 9) / 4));

    return {
      bmr,
      mifflinBmr,
      katchBmr,
      formulaName,
      formulaNote,
      useKatch,
      lbmLb,
      tdee,
      activityNote,
      targetCal,
      deficit,
      deficitLabel,
      proteinG,
      proteinPerLb,
      proteinNote,
      fatG,
      fatNote,
      carbG,
      glp1: compound,
      compoundProfile: profile,
    };
  }

  // Export
  global.ApexMacroCalc = {
    calculate,
    COMPOUND_PROFILES,
  };
})(typeof window !== 'undefined' ? window : this);
