/* ═════════════════════════════════════════════════════════════
   APEX EDITORIAL LAYER — injects "What this means for you"
   contextual decision box onto every peptide page.
   Turns the encyclopedia from a study dump into a decision tool.
   ═════════════════════════════════════════════════════════════ */
(function(){
  try {
    if (document.getElementById('apex-editorial-box')) return;
    var path = (location.pathname || '').toLowerCase();
    var slug = (path.split('/').pop() || '').replace(/\.html$/,'');
    if (!slug || /^(browse|research|wiki|basics|compare|privacy|terms|reset|nutrition|index|protocol-tracker)$/.test(slug)) return;

    // ── EDITORIAL DATA — keyed by file slug ──────────────────────────────
    // Each entry: best for, when to consider, when to skip, stack position
    var ED = {
      'retatrutide': {
        bestFor: 'Aggressive fat loss + metabolic reset when semaglutide/tirzepatide have plateaued or weren\'t enough.',
        consider: 'You\'re 30+ lb from goal weight, have insulin resistance or fatty liver markers, or you plateaued on tirzepatide. NEJM Phase 2: 24% weight loss at 12mg. Best-in-class so far.',
        skip: 'You\'re within 10-15 lb of goal (you\'re paying for a cannon to hit a squirrel). You can\'t commit to 6+ months. You have personal/family history of medullary thyroid carcinoma.',
        stackFit: 'Foundation of a cut. Pair with Ipamorelin (muscle preservation) + MOTS-c (fights GLP-1 fatigue). Do NOT stack with another GLP-1.'
      },
      'tirzepatide': {
        bestFor: 'Fat loss with better metabolic benefits than sema — GLP-1 + GIP dual agonism means less nausea per unit of weight loss.',
        consider: 'You tolerated semaglutide but plateaued, you want maximum appetite suppression with minimum GI drama, or you\'re metabolically resistant (HOMA-IR > 2.5).',
        skip: 'Pregnancy, thyroid cancer history, severe gastroparesis. Also skip if you can\'t eat enough protein — you\'ll cannibalize muscle.',
        stackFit: 'Pair with GH peptide (Ipamorelin) during a cut to protect lean mass. MOTS-c helps if you feel fatigued on higher doses.'
      },
      'semaglutide': {
        bestFor: 'First-time GLP-1 users who want the most-studied, longest-track-record option. Proven, predictable, accessible.',
        consider: 'You\'re new to GLP-1s, have 20-60 lb to lose, or want a lower starting cost before committing to reta/tirz.',
        skip: 'You already plateaued on sema. Tirzepatide or retatrutide are the next rungs up — don\'t re-run what already stopped working.',
        stackFit: 'Solo or with Ipamorelin to preserve muscle. BPC-157 helps with GI discomfort at higher doses.'
      },
      'bpc157': {
        bestFor: 'Healing soft tissue injuries — tendons, ligaments, gut lining, connective tissue. Local & systemic repair.',
        consider: 'You have a lingering joint injury, leaky gut symptoms, post-surgical recovery, or you\'re running hard training on a cut.',
        skip: 'No active injury or inflammation to address — BPC is most effective when there\'s something to repair.',
        stackFit: 'Pairs with TB-500 (Wolverine Stack) for systemic mobility. With GHK-Cu for skin/collagen. Foundational in any cut or training-heavy cycle.'
      },
      'tb500': {
        bestFor: 'Systemic recovery — muscle, cardiovascular tissue, full-body mobility. Complements BPC-157\'s local repair.',
        consider: 'You train hard, have chronic stiffness across multiple joints, or you\'re recovering from a systemic insult (surgery, overtraining).',
        skip: 'Active cancer history — TB-500 promotes angiogenesis, which is contraindicated with tumor biology.',
        stackFit: 'The other half of the Wolverine Stack with BPC-157. 2x/week loading phase, then maintenance.'
      },
      'ipamorelin': {
        bestFor: 'Clean GH pulse — muscle preservation, sleep quality, recovery — without cortisol, prolactin, or hunger side effects.',
        consider: 'You\'re on a cut and want to protect muscle, your sleep quality is mediocre, or you\'re 30+ and natural GH is declining.',
        skip: 'You\'re already on HGH or MK-677 — stacking ghrelin-receptor agonists is redundant.',
        stackFit: 'Best paired with CJC-1295 No DAC for 2-4× GH pulse amplitude. Gold standard GH stack.'
      },
      'cjc-no-dac': {
        bestFor: 'GHRH stimulation with a short half-life that matches natural pulsatile release. Pairs perfectly with ghrelin-mimetics.',
        consider: 'You\'re running Ipamorelin solo and want to amplify the pulse, or you want a more natural GH pattern than DAC versions.',
        skip: 'You\'re already on CJC-1295 DAC or Sermorelin — you don\'t need two GHRH analogs.',
        stackFit: 'Ipamorelin + CJC No DAC is the gold standard GH stack. Single pre-bed injection.'
      },
      'ghkcu': {
        bestFor: 'Skin, hair, collagen, and wound healing. Copper peptide with ~400 documented biological effects — genuinely pleiotropic.',
        consider: 'You want skin/hair improvements, you\'re post-surgery or scarring, or you\'re building a longevity/anti-aging stack.',
        skip: 'Copper toxicity risk (Wilson\'s disease) or chronically elevated serum copper.',
        stackFit: 'Core of the GLOW stack (with BPC + TB-500). Also great solo for aesthetic cycles.'
      },
      'motsc': {
        bestFor: 'Mitochondrial function + metabolic resilience. A mitokine — sends signals from mitochondria to improve systemic metabolism.',
        consider: 'You\'re running a GLP-1 and feel drained, insulin resistance markers, or over 35 and mitochondrial function is declining.',
        skip: 'You\'re already running multiple mitochondrial peptides (SS-31, NAD+) — pick your layer.',
        stackFit: 'Best pair with a GLP-1 to offset fatigue. Also stacks cleanly with NAD+ for dual mito support.'
      },
      'aod9604': {
        bestFor: 'Targeted fat loss without the full GH cascade — the C-terminal fragment of GH that keeps lipolysis but drops the IGF-1 effect.',
        consider: 'Stubborn fat depots (visceral, love handles), you want lipolysis without appetite changes, or IGF-1 concerns rule out full GH peptides.',
        skip: 'Generalized weight loss goal — a GLP-1 will outperform AOD-9604 by 5×.',
        stackFit: 'Strongest as an adjunct in a fat-loss stack alongside Reta/Tirz. Not a standalone solution.'
      },
      'pt141': {
        bestFor: 'Libido + sexual function via central melanocortin receptors — works in brain chemistry, not vasculature (unlike Viagra/Cialis).',
        consider: 'Arousal/desire issues that aren\'t vascular, or when PDE5 inhibitors aren\'t working.',
        skip: 'You\'re running Melanotan II — they overlap and stack nausea with no added benefit.',
        stackFit: 'Solo use — runs on its own schedule. Not a stack peptide.'
      },
      'epitalon': {
        bestFor: 'Telomere maintenance + pineal axis restoration. Short pulses, long breaks — classic longevity cycling pattern.',
        consider: 'You\'re 40+, building a longevity stack, or you have poor sleep architecture tied to low melatonin.',
        skip: 'You expect immediate results — Epitalon works over months, not weeks. Benchmark via DNA methylation age.',
        stackFit: 'Foundation of any longevity stack. Pair with DSIP for sleep amplification. 20-day pulses, 3-6mo breaks.'
      },
      'selank': {
        bestFor: 'Anxiety reduction + cognitive calm without sedation or dependency. Nasal — works in 10-15 min, lasts hours.',
        consider: 'Social/performance anxiety, PM wind-down, or when benzodiazepines aren\'t acceptable.',
        skip: 'You\'re already on a strong GABA modulator (benzos, gabapentin) — additive risk.',
        stackFit: 'Selank PM + Semax AM is the classic cognitive balance stack. Foundational nootropic pairing.'
      },
      'semax': {
        bestFor: 'Stimulating cognitive peptide — BDNF upregulation, focus, neuroprotection. Pairs with Selank for AM/PM balance.',
        consider: 'You want cognitive amplification without stimulants, post-concussion recovery, or you\'re stacking for high-output work.',
        skip: 'PM use (it\'s stimulating — you won\'t sleep). Active mania or unmanaged ADHD without professional guidance.',
        stackFit: 'Semax AM + Selank PM — the recommended cognitive rhythm stack.'
      },
      'dsip': {
        bestFor: 'Deep sleep architecture — specifically slow-wave sleep. Works synergistically with growth hormone axis.',
        consider: 'You fall asleep fine but wake tired. Your Oura/Whoop says deep sleep < 60 min. Or you\'re pairing with Epitalon/GH peptides.',
        skip: 'Primary insomnia (falling asleep) — DSIP doesn\'t help with sleep onset, only depth.',
        stackFit: 'Amplifies Epitalon and any GH peptide. Pre-bed, alongside CJC/Ipamorelin for maximum GH pulse during deep sleep.'
      },
      'nad-plus': {
        bestFor: 'Cellular energy + sirtuin activation — foundational for mitochondrial function and longevity cycling.',
        consider: 'Chronic fatigue that isn\'t thyroid/adrenal, you\'re 40+ and NAD+ is naturally declining, or you\'re building a mito-longevity stack.',
        skip: 'You feel fine energy-wise and your labs are clean — NAD+ is expensive and has diminishing returns on a healthy baseline.',
        stackFit: 'Core of any mitochondrial or longevity stack. Pairs with MOTS-c, SS-31, Epitalon.'
      },
      'kpv': {
        bestFor: 'Anti-inflammatory + gut healing — KPV is the C-terminal of alpha-MSH, acts locally without systemic immune suppression.',
        consider: 'IBS/IBD symptoms, leaky gut, chronic inflammation that hasn\'t responded to BPC-157 alone, or autoimmune digestive issues.',
        skip: 'Active serious infection — you don\'t want to suppress immune response during it.',
        stackFit: 'Core of the KLOW stack (KPV + TB-500 + BPC-157 + GHK-Cu) for gut + systemic repair.'
      },
      'klow': {
        bestFor: 'Maximum healing — the 4-peptide anti-inflammatory + tissue repair supercycle.',
        consider: 'Serious injury recovery, multiple concurrent issues (gut + joint + skin), or post-surgical protocols.',
        skip: 'Mild or single-issue concerns — overkill. Start with BPC + TB-500 before going to full KLOW.',
        stackFit: 'Standalone intensive cycle. 6-8 weeks, then step down to BPC + TB-500 maintenance.'
      },
      'glow': {
        bestFor: 'Skin, hair, and aesthetic cycles — collagen remodeling + tissue repair + copper signaling.',
        consider: 'Pre-wedding/event cycles, post-weight-loss skin tightening, or chronological skin aging concerns.',
        skip: 'You\'re looking for deep internal healing — GLOW is more surface-layer than KLOW.',
        stackFit: '4-6 week intensive, then maintain with GHK-Cu solo. Stacks cleanly with Retatrutide cut cycles.'
      },
      'wolverine-stack': {
        bestFor: 'Fastest recovery from structural injuries — BPC (local) + TB-500 (systemic) combined.',
        consider: 'Torn ligaments, tendinosis, cartilage degradation, chronic injury that\'s blocking training.',
        skip: 'Active cancer (TB-500 angiogenesis concern). Nothing to heal — wasted injection burden.',
        stackFit: 'Core protocol for any repair-focused cycle. 2-4 weeks loading, then weekly maintenance.'
      },
      'cardiac-stack': {
        bestFor: 'Cardiovascular support stack — peptides with documented heart/vessel benefits.',
        consider: 'Family history of CVD, elevated ApoB/LDL, early atherosclerosis markers, or you\'re 50+ building longevity protocols.',
        skip: 'Medical cardiac conditions require MD oversight — this is education, not a prescription.',
        stackFit: 'Discuss with a licensed provider. We can educate you but medical oversight is non-negotiable here.'
      },
      'longevity-stack': {
        bestFor: 'Multi-axis aging slowdown — telomere, mitochondrial, sirtuin, collagen, tissue repair.',
        consider: 'You\'re 40+, running annual longevity protocols, or tracking biological age (DNA methylation, Glycan age).',
        skip: 'You have more urgent issues to solve first (fat loss, injury, hormone imbalance) — fix those before layering longevity.',
        stackFit: '3-4 month annual cycle. Pair with quality sleep, training, and foundational supplements.'
      },
      '5amino1mq': {
        bestFor: 'NNMT inhibition for stubborn fat — works upstream of metabolic slowdown, oral capsule (no injection).',
        consider: 'You\'re late-stage cut, hit a plateau, or you want a fat-loss adjunct without injections. Pairs well alongside a GLP-1.',
        skip: 'You\'re early in your weight-loss journey — Reta or Tirz will outperform 5×. This is a finishing tool, not a foundation.',
        stackFit: 'Adjunct only. Combines well with Retatrutide late-cycle or as a maintenance bridge between GLP-1 cycles.'
      },
      'tesamorelin': {
        bestFor: 'Visceral fat reduction (the deep belly fat that\'s hardest to shed) and a moderate GH bump — clinically validated.',
        consider: 'You\'re carrying central obesity, metabolic syndrome markers, or you want GHRH benefits without the longer half-life of CJC DAC.',
        skip: 'You\'re already running CJC-1295 No DAC or a CJC + Ipa blend — same receptor class, redundant.',
        stackFit: 'Solo on a cut, or paired with Ipamorelin. Avoid stacking with another GHRH analog.'
      },
      'sermorelin': {
        bestFor: 'Entry-level GHRH for older users — gentler stimulation, well-tolerated, lots of clinical history.',
        consider: 'You\'re 40+ and want to start on a GH peptide cautiously, or your provider prefers conservative protocols.',
        skip: 'You\'re looking for fast or strong GH amplification — Ipamorelin + CJC No DAC is 3–4× more effective.',
        stackFit: 'Pairs with Ipamorelin. For experienced users, CJC-1295 No DAC outperforms.'
      },
      'cjc1295-dac': {
        bestFor: 'Convenience-first GH protocols — weekly dosing, sustained IGF-1 elevation. Trades pulsatility for ease.',
        consider: 'You hate daily injections and want a once-a-week schedule, or you\'re running a long blast where convenience matters.',
        skip: 'You want natural GH pulsatility (DAC creates a flat elevation, not pulses). Most physiologically-minded users prefer No DAC.',
        stackFit: 'Solo or paired with Ipamorelin. Don\'t stack with CJC No DAC or Tesamorelin — same upstream receptor.'
      },
      'cjc-ipa-blend': {
        bestFor: 'The single-injection gold-standard GH stack. Convenience of one shot, with both GHRH + ghrelin pathway hit.',
        consider: 'You want to run the proven CJC + Ipa combo without measuring two separate vials. Saves time, reduces error.',
        skip: 'You want to dial each component independently — separate vials give you that flexibility.',
        stackFit: 'Replaces both Ipamorelin and CJC No DAC in your stack. Pre-bed dosing for max GH pulse during deep sleep.'
      },
      'igf1-lr3': {
        bestFor: 'Direct IGF-1 elevation — bypasses the GH pulse entirely. Site-specific muscle hypertrophy when injected near the target tissue.',
        consider: 'You\'re plateauing on GH peptides, you want growth without the GH cascade, or you\'re running a serious bulk.',
        skip: 'Cancer family history (IGF-1 is a growth signal — benign and malignant alike). Diabetes (affects glucose control). Most users should run GH peptides first.',
        stackFit: 'Advanced. Often run 4–6 weeks during a bulk. Avoid stacking with high-dose GH secretagogues.'
      },
      'cartalax': {
        bestFor: 'Cartilage-specific bioregulator — supports joint health, particularly for older users and athletes with chronic joint stress.',
        consider: 'You have nagging joint pain, you\'re 40+ with cartilage wear, or you\'re building a longevity protocol focused on joints.',
        skip: 'You\'re looking for fast pain relief — Cartalax is slow + cumulative, not acute. Try BPC-157 + TB-500 for faster results.',
        stackFit: 'Pairs with BPC-157 + TB-500 for joint protocols. Pulse-cycled like Epitalon (10–20 days on, long off).'
      },
      'ara290': {
        bestFor: 'Neuropathic pain + nerve repair — EPO-derived peptide that targets the tissue-protective receptor without erythropoiesis.',
        consider: 'You have peripheral neuropathy, post-injury nerve damage, or you\'re working on chronic inflammation that GLP-1s alone aren\'t fixing.',
        skip: 'You don\'t have specific nerve / inflammation issues — this is a targeted tool, not a general anti-inflammatory.',
        stackFit: 'Solo or alongside BPC-157. Niche but powerful for the right indication.'
      },
      'dihexa': {
        bestFor: 'Aggressive neuroplasticity research — angiotensin IV analog, ~7 orders of magnitude more potent than BDNF for synaptogenesis.',
        consider: 'You\'re recovering from concussion, doing neuroplasticity research, or you\'ve hit a ceiling with Semax + Selank.',
        skip: 'Most users don\'t need this. Semax and Selank handle the cognitive load for 95% of cases. Dihexa is research-grade and underdocumented.',
        stackFit: 'Niche. Pairs with Semax. Run short, careful cycles — long-term safety data is thin.'
      },
      'pe2228': {
        bestFor: 'TREK-1 channel blocker — research peptide for mood, particularly depression resistant to SSRIs.',
        consider: 'You\'ve struggled with mood that hasn\'t responded to standard tools, you\'re working with a provider, or you\'re researching alternatives.',
        skip: 'Active mental health conditions need proper medical care. PE-22-28 is research-stage, not a substitute for treatment.',
        stackFit: 'Solo. Often paired with Selank for an anxiolytic profile. Short cycles only.'
      },
      'fox04-dri': {
        bestFor: 'Senolytic activity — selectively eliminates senescent ("zombie") cells that drive aging and chronic inflammation.',
        consider: 'You\'re 50+, building a longevity stack, or you have chronic inflammatory conditions linked to senescence load.',
        skip: 'Acute illness or active immune challenge — this isn\'t the time. Cancer history requires MD oversight.',
        stackFit: 'Pulse-cycle 5 days every 3–6 months. Pair with Epitalon and quality antioxidants.'
      },
      'ss31': {
        bestFor: 'Inner mitochondrial membrane targeting — protects cardiolipin, restores energy production in damaged mitochondria.',
        consider: 'You\'re building a longevity protocol, you have mitochondrial dysfunction symptoms (chronic fatigue, exercise intolerance), or you\'re 50+.',
        skip: 'You\'re running multiple mitochondrial peptides (MOTS-c, NAD+) — pick your layer. SS-31 is more niche/expensive.',
        stackFit: 'Top tier of mitochondrial stack. Pairs with MOTS-c (different mechanism — they complement). 4–6 week cycles.'
      },
      'thymosin-a1': {
        bestFor: 'T-cell modulation — the foundational immune peptide. Boosts adaptive immunity, well-studied, used clinically for chronic infections.',
        consider: 'You\'re fighting recurring illness, post-COVID syndromes, autoimmune balance, or you\'re building a long-term immune protocol.',
        skip: 'Active organ transplant / immunosuppression therapy — adding T-cell stimulation is contraindicated.',
        stackFit: 'Foundation of any immune stack. Pairs with KPV (gut anti-inflammatory) and BPC-157 (gut barrier).'
      },
      'thymosin-alpha1': {
        bestFor: 'T-cell modulation — the foundational immune peptide. Boosts adaptive immunity, well-studied, used clinically for chronic infections.',
        consider: 'You\'re fighting recurring illness, post-COVID syndromes, autoimmune balance, or you\'re building a long-term immune protocol.',
        skip: 'Active organ transplant / immunosuppression therapy — adding T-cell stimulation is contraindicated.',
        stackFit: 'Foundation of any immune stack. Pairs with KPV (gut anti-inflammatory) and BPC-157 (gut barrier).'
      },
      'll37': {
        bestFor: 'Antimicrobial cathelicidin — broad-spectrum activity against bacteria, viruses, and biofilms. Useful where antibiotics fail.',
        consider: 'Chronic biofilm-driven infections, antibiotic-resistant skin issues, or chronic Lyme / co-infections (with provider oversight).',
        skip: 'Acute infections respond to antibiotics. LL-37 is a niche tool, not a first-line antimicrobial.',
        stackFit: 'Pairs with Thymosin Alpha-1 for stubborn immune challenges. Cycle conservatively — long-term safety data is limited.'
      },
      'glutathione': {
        bestFor: 'Master antioxidant — direct cellular protection, liver detox support, foundational for any longevity or oxidative-stress protocol.',
        consider: 'You\'re running 3+ peptides, doing aggressive cuts, environmental toxin exposure, or building a longevity stack.',
        skip: 'You\'re already getting plenty via NAC + diet — Glutathione is helpful, not magic. Diminishing returns on a clean baseline.',
        stackFit: 'Foundation layer. Pairs with NAD+ and MOTS-c for full mitochondrial support. Cycle 4–8 weeks at a time.'
      },
      'glutamine': {
        bestFor: 'Gut barrier support + recovery — oral powder, foundational for anyone with gut issues or hard training load.',
        consider: 'IBS / IBD symptoms, post-antibiotic recovery, hard training cuts (high catabolism), or as a foundational add to any peptide stack.',
        skip: 'Healthy gut + clean diet — the marginal benefit is small. Save your money for higher-leverage compounds.',
        stackFit: 'Pairs with BPC-157 + KPV for gut protocols. Daily, oral, no cycling needed.'
      },
      'l-carnitine': {
        bestFor: 'Fatty acid transport into mitochondria for oxidation — cheap, well-researched, mild fat-loss adjunct.',
        consider: 'You\'re on a serious cut, your fasted cardio isn\'t hitting hard enough, or you want a low-cost layer to a GLP-1 protocol.',
        skip: 'Diet + training are dialed and you\'re losing fat fine — L-carnitine\'s effect is modest. Better leverage elsewhere.',
        stackFit: 'Adjunct to any fat-loss stack. Especially good alongside Reta/Tirz to support metabolic energy.'
      },
      'mito-reset': {
        bestFor: 'Comprehensive mitochondrial protocol — combines MOTS-c + NAD+ + SS-31 for full energy + longevity stacking.',
        consider: 'Chronic fatigue, mitochondrial dysfunction, post-illness recovery, or annual longevity reset cycles.',
        skip: 'You\'re running just one of the components already — adding more isn\'t additive past a point. Pick your layer.',
        stackFit: 'Standalone 6–8 week intensive. Then maintain with one of the components solo.'
      },
      'melanotan1': {
        bestFor: 'Pigmentation only — α-MSH analog, tanning without UV exposure. No libido or appetite effects.',
        consider: 'You want a tan without sun damage, you have photosensitive skin issues, or you\'re prepping for events.',
        skip: 'Atypical mole patterns or family history of melanoma — talk to a dermatologist first. Pigmentation peptides need monitoring.',
        stackFit: 'Solo use. Loading phase + maintenance. Pairs with cumulative sun exposure (with sunscreen still recommended).'
      },
      'melanotan2': {
        bestFor: 'Tan + libido boost — combined α-MSH + melanocortin agonism. More aggressive effect than Melanotan I.',
        consider: 'You want both tanning + sexual function in one compound, you\'re experienced with Melanotan I and want next level.',
        skip: 'PT-141 + Melanotan I is a cleaner split. Melanotan II has more side effects (nausea, flushing, weird darkening of moles).',
        stackFit: 'Solo or with PT-141 (but watch for additive nausea). Loading phase + maintenance.'
      },
      'slu-pp-322': {
        bestFor: 'Exercise mimetic research — ERR agonist, oral capsule. Targets fat-loss + endurance pathways without working out.',
        consider: 'You can\'t train (injury, illness) but want to maintain metabolic health, or you\'re researching novel fat-loss compounds.',
        skip: 'Most users have access to actual exercise. SLU-PP-332 is research-stage and doesn\'t replace training\'s full benefits.',
        stackFit: 'Adjunct or bridge during injury recovery. Not a primary fat-loss tool — GLP-1s outperform for that purpose.'
      },
    };

    var entry = ED[slug];
    if (!entry) return; // Page not in our editorial database — no injection

    // ── INJECT editorial box after the CTA bar ───────────────────────────
    var wait = function() {
      var target = document.getElementById('apex-cta-bar') || document.getElementById('apex-nav-top');
      if (!target) { return setTimeout(wait, 80); }
      var box = document.createElement('div');
      box.id = 'apex-editorial-box';
      box.innerHTML = ''+
        '<style>'+
          '#apex-editorial-box{max-width:1160px;margin:20px auto;padding:0 20px;font-family:"Barlow",sans-serif;}'+
          '#apex-editorial-box .apex-ed-wrap{background:linear-gradient(135deg,rgba(20,184,166,.05),rgba(0,212,255,.02));border:1px solid rgba(20,184,166,.28);border-radius:6px;padding:22px 26px;}'+
          '#apex-editorial-box .apex-ed-eyebrow{font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:.22em;color:#14b8a6;text-transform:uppercase;margin-bottom:10px;}'+
          '#apex-editorial-box .apex-ed-title{font-family:"Rajdhani",sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:-.2px;}'+
          '#apex-editorial-box .apex-ed-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}'+
          '#apex-editorial-box .apex-ed-tile{padding:14px 16px;background:rgba(8,12,16,.5);border-radius:4px;border-left:3px solid var(--ed-c,#14b8a6);}'+
          '#apex-editorial-box .apex-ed-tile-label{font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:.2em;margin-bottom:6px;text-transform:uppercase;font-weight:700;}'+
          '#apex-editorial-box .apex-ed-tile-body{font-size:13px;color:#cbd5e1;line-height:1.55;}'+
          '#apex-editorial-box .apex-ed-tile-body b{color:#fff;}'+
          '#apex-editorial-box .apex-ed-stackfit{margin-top:16px;padding:14px 16px;background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.3);border-left:3px solid #fbbf24;border-radius:4px;}'+
          '#apex-editorial-box .apex-ed-stackfit .apex-ed-tile-label{color:#fbbf24;}'+
          '@media(max-width:640px){#apex-editorial-box .apex-ed-grid{grid-template-columns:1fr;}#apex-editorial-box .apex-ed-wrap{padding:18px 18px;}#apex-editorial-box .apex-ed-title{font-size:19px;}}'+
        '</style>'+
        '<div class="apex-ed-wrap">'+
          '<div class="apex-ed-eyebrow">🧠 What this means for your stack</div>'+
          '<div class="apex-ed-title">Decision framework — is this the right peptide for you?</div>'+
          '<div class="apex-ed-grid">'+
            '<div class="apex-ed-tile" style="--ed-c:#10b981;">'+
              '<div class="apex-ed-tile-label" style="color:#10b981;">✓ BEST FOR</div>'+
              '<div class="apex-ed-tile-body">'+entry.bestFor+'</div>'+
            '</div>'+
            '<div class="apex-ed-tile" style="--ed-c:#60a5fa;">'+
              '<div class="apex-ed-tile-label" style="color:#60a5fa;">→ WHEN TO CONSIDER IT</div>'+
              '<div class="apex-ed-tile-body">'+entry.consider+'</div>'+
            '</div>'+
            '<div class="apex-ed-tile" style="--ed-c:#f59e0b;grid-column:1 / -1;">'+
              '<div class="apex-ed-tile-label" style="color:#f59e0b;">⚠ WHEN TO SKIP IT</div>'+
              '<div class="apex-ed-tile-body">'+entry.skip+'</div>'+
            '</div>'+
          '</div>'+
          '<div class="apex-ed-stackfit">'+
            '<div class="apex-ed-tile-label">🧩 STACK FIT</div>'+
            '<div class="apex-ed-tile-body">'+entry.stackFit+'</div>'+
          '</div>'+
        '</div>';
      target.parentNode.insertBefore(box, target.nextSibling);
    };
    wait();
  } catch(e) { /* silent */ }
})();
