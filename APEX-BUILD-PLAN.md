# Apex Peptide Encyclopedia & Protocol Tracker — Master Build Plan

## The Brand Position
**Credibility is the product.** Apex is not a supplement company with a blog. It is the consolidated authority on peptide research — the most organized, most honest, most clinically-grounded free resource in the space. Everything the tracker does (cite sources, show clinical vs optimal ranges, explain mechanisms, tell people when to rest, never push a purchase) is in service of that position. Trust is the moat. The pen, the BAC water, the needles — those sell themselves to anyone who trusts the tool.

> *"The tool that tells you to rest when you should rest is the tool people trust."*

## What This Is
A free peptide research + cycle tracking tool that captures emails, tracks user intent (researcher → buyer), and feeds behavioral data into GHL for automated marketing of:
- **Apex V3 Injection Pen** — precision dosing, no syringe drift
- **Bacteriostatic Water** — off Amazon, we have it in stock
- **Pen Needles** — off Amazon, we have them
- **Cartridges** — consumable refills

---

## Current Status: TRACKER BUILT ✅

`protocol-tracker.html` is feature-complete and live in preview. Everything below marked ✅ is done.

---

## What's Built (protocol-tracker.html)

### Core Tracker ✅
- Email gate → name + email capture on first visit
- 35+ peptides in CATALOG with full dosing, timing, cycle, frequency data
- Add protocol form with:
  - Vial reconstitution calculator (mcg/unit auto-calc)
  - Low / Standard / Aggressive dose tier selector
  - Frequency, timing, fasted/fed, cycle weeks, break weeks
  - Titration protocol support (Sema, Tirz, Reta with step-up schedules)
- Active cycle cards with:
  - Progress bar + days remaining countdown
  - Daily dose logging with streak tracking
  - Pause / End cycle
  - TAPERING badge + cold-stop warnings for GLP-1 taper steps
  - Titration step display with color-coded dose tiers
  - Clickable peptide name → encyclopedia modal
- Break period tracking with countdown to next cycle
- Planner tab — daily injection schedule (AM / PM / Bedtime columns)

### Lab Panel ✅
- 25+ biomarkers in LAB_DB with full data per marker:
  - Clinical range vs Optimal range (longevity targets)
  - Draw instructions
  - What is it / Why it matters / How peptides affect this
  - Cited sources (ADA, AHA, peer-reviewed journals)
- PEPTIDE_LABS mapping — each peptide drives its own lab recommendations
- All labs deduped across active protocols, grouped by category (Metabolic, Hormonal, Inflammation, etc.)
- Copy lab order to clipboard
- LabCorp integration placeholder
- **Every biomarker is clickable** → opens detail modal with full educational content + citations

### Mechanism Analysis ✅
- Mechanism coverage map (Repair, Fat Loss, GH Axis, etc.)
- Redundancy alerts when 3+ peptides hit the same mechanism
- Interaction warnings (e.g. GLP-1 + BPC-157 + TB-500 combo notes)

### Encyclopedia Modal ✅
- Clickable from any peptide name in cycle cards
- Shows: mechanism tags, stack note, dose tiers (Low/Standard/Aggressive), frequency, timing, cycle length, recommended labs
- Testosterone (TRT) entry shows TruWell referral card with provider CTA

### Alert System ✅
- In-app alert bar: protocols ≤7 days from cycle end get a dismissible warning banner
- GHL webhooks: cycle_started + cycle_ended fire to GHL_WEBHOOK_URL (paste URL when ready)
- Browser push: handled via GHL workflow (no service worker push needed)

### Apex Product Integration ✅ (non-aggressive, trust-first)
- Reconstitution calc: "BAC water off Amazon — get it from Apex →" (text link)
- Units-to-draw display: "Syringes drift — Apex V3 pen hits it exactly →" (text link)
- Cycle start: bottom-of-screen toast — "You've dialed in your dose. The Apex V3 pen delivers it exactly." [GET SET UP →] — auto-dismisses after 9 sec
- GHL payload on cycle_started includes: supplyCheckDate (mid-cycle), bacBottlesNeeded, needleBoxesNeeded, needs_pen, needs_bac_water, needs_needles — so GHL can send timed "running low?" emails at exactly the right moment

### Testosterone / TRT ✅
- Oil-based entry (no reconstitution) — cypionate / enanthate / cream
- Shows oil-based notice instead of recon calculator
- Full TRT lab panel: Total T, Free T, Estradiol, SHBG, LH/FSH, Hematocrit, PSA, AST/ALT, CBC
- TruWell Health referral card in encyclopedia modal

### PWA (Progressive Web App) ✅
- manifest.json — app name "Apex Tracker", theme #00d4ff, standalone display
- sw.js — network-first service worker, offline fallback
- Full iOS meta tags (apple-mobile-web-app-capable, status bar, touch icon)
- Android install banner support
- **Still needed:** icon-192.png + icon-512.png (Apex logo on dark background)

### Peptide Stacks ✅
- GLOW Stack: GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg / 3.0cc BAC
- KLOW Stack (Wolverine): GHK-Cu 50mg + KPV 10mg (SC inj) + TB-500 10mg + BPC-157 10mg / 2.0cc BAC
- Components shown with per-peptide role labels

---

## GHL Integration — Wire Up Tomorrow

### GHL_WEBHOOK_URL
Paste the webhook URL into line ~949 of protocol-tracker.html:
```js
const GHL_WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';
```

### 4 Webhook Events Already Firing
| Event | When | Key Payload Fields |
|-------|------|--------------------|
| `signup` | Email gate submit | email, name, tag: apex-lead |
| `page_view` | Peptide encyclopedia modal opened | peptide, tag: viewed-{slug} |
| `cycle_started` | New protocol saved | peptide, dose, startDate, endDate, supplyCheckDate, bacBottlesNeeded, needleBoxesNeeded, needs_pen, needs_bac_water |
| `cycle_ended` | End cycle clicked | peptide, daysCompleted, endDate |

### GHL Workflows to Build
1. **Signup → Nurture sequence** — tag: researcher, start educational email series
2. **cycle_started → Day 1** — "Cycle started" confirmation + pen CTA
3. **cycle_started → supplyCheckDate** — "Running low on BAC water / needles?" timed email
4. **cycle_ended → Re-engagement** — "Ready for your next cycle? Stock up."
5. **3+ peptide views → Escalate** — researcher → buyer-curious tag upgrade

### Custom Fields to Create in GHL
- `funnel_level`: researcher | buyer-curious | buyer-intent | active-user
- `peptides_viewed`: comma-separated
- `peptides_stacked`: comma-separated
- `active_cycles`: comma-separated
- `supply_check_date`: date (from cycle_started payload)
- `bac_bottles_needed`: number
- `needle_boxes_needed`: number

---

## Next Build Phase — Encyclopedia Site

The tracker links out to "ENCYCLOPEDIA" tab. Still needed:
- Full peptide grid (filterable by category)
- Individual peptide detail pages (35+ pages already exist as HTML stubs in this folder)
- Search
- "Add to Tracker" CTA on each peptide page → deep links back to tracker

---

## Marketing Strategy

### Trust-First, Sell via GHL
- No buy buttons or modals inside the tracker
- Tool feels like pure education → higher referral/share rate
- GHL does the selling via timed, personalized sequences
- Apex branding (logo) always visible — passive recall

### The Supply Narrative
> "You can't get BAC water or needles on Amazon anymore. We have both — plus the pen that makes your research worth the effort."

### Pen Positioning
> "You did the research. You calculated the dose. The Apex V3 pen delivers it exactly — every time."

---

## Deployment Checklist

- [ ] Netlify deploy (drag & drop the folder or connect GitHub repo)
- [ ] Set custom domain
- [ ] Paste GHL_WEBHOOK_URL into protocol-tracker.html
- [ ] Create icon-192.png + icon-512.png (Apex logo, dark bg) for PWA install
- [ ] Build GHL workflows (5 sequences above)
- [ ] n8n automation (tomorrow)
- [ ] LabCorp API integration (future)

---

---

## Future Cycle Planner — Build Spec (Next Phase)

### What It Does
A planning tool that lets users map what comes next — after a cycle ends, after a break, across their full protocol calendar. Not a suggestion engine. A scheduling calculator.

### The Core Philosophy
**Off-cycle breaks are mechanism-specific, not global.**
- Resting BPC-157 (repair/anti-inflammatory) ≠ resting everything
- The break resets receptor sensitivity for THAT mechanism
- Running Ipamorelin during a BPC-157 break is fine — completely different system
- Running KPV during a BPC-157 break defeats the purpose — same mechanism family

The planner enforces this distinction. It is never a suggestion engine — it is a scheduling tool. User picks the category, user picks the peptide, the planner shows the math.

### How It Works
1. **User picks a category** (GH Axis, Fat Loss, Anti-Inflammatory, Nootropic, Longevity, Sleep, etc.)
2. **Planner shows current state** for that category:
   - What's running now in that mechanism
   - When the cycle ends
   - When the break ends
   - Visual timeline showing the open window
3. **Within same mechanism (break window):**
   - Show the break as intentional with a brief explanation of why it exists (receptor reset, consolidation)
   - Show all other peptides in that mechanism they could run next — timing, cycle length, how it slots in
   - Do NOT recommend. Present options and let them place it.
4. **Cross-mechanism view:**
   - Show what's already running in OTHER categories during the break window
   - If they want to add something from a different mechanism during the break — supported, no friction
   - Flag any timing conflicts with other active protocols
5. **Place on timeline:**
   - Selected future peptide appears in the Annual Planner as a "PLANNED" entry (distinct visual style — dashed border, muted color)
   - Becomes active automatically when start date arrives, or user manually activates it

### What It Never Does
- Never says "you should add X"
- Never fills the break automatically
- Never suggests continuous use when a break is clinically indicated
- Source citations explain the break rationale — user decides whether to honor it

### Why This Builds Credibility
A tracker that tells you to rest is a tracker people trust. That trust is worth more than any banner ad or CTA. Users who trust the tool share it, come back daily, and buy supplies from the brand behind it without being asked.

### UI Entry Point
New tab in the Analysis section: **"PLAN NEXT CYCLE"** — opens as a full-width panel below the annual planner.

---

## "F*ck Father Time" Content Series — Strategy

### Concept
Neil (53, metabolic age 32, running peptides for years) documents the protocols, labs, and results in a video series. Polarizing name, personal credibility, educational format.

### Episode Formula
1. **Hook (30 sec)** — on camera, no intro: *"I'm 53. My metabolic age is 32. Here's what's in my stack."*
2. **One peptide deep dive** — mechanism, dosing, lab markers it moves (pulled directly from the encyclopedia)
3. **Real labs** — show Clinical vs Optimal ranges, show his actual numbers
4. **Tracker CTA** — *"Everything I just showed you is inside the Apex tracker — free. apexpens.com"*

### Episode Roadmap
| # | Topic |
|---|-------|
| 1 | Full origin story — 53 looking 30, what changed, why most people are flying blind |
| 2 | BPC-157 — the repair peptide, what it does to gut, joints, and tissue |
| 3 | Understanding your labs — Clinical vs Optimal, why your doctor says you're fine and you're not |
| 4 | The GH Axis — Ipamorelin + CJC, what it actually does for body composition at 50+ |
| 5 | GLP-1s — Semaglutide/Tirzepatide/Reta, the full picture beyond just weight loss |
| 6 | GLOW Stack — skin, collagen, and the vanity metrics that tell you your biology is working |
| ...| One peptide per episode, 35+ episodes without running out |

### Distribution Note
Series name `F*ck Father Time` is perfect for organic/social. For paid (YouTube ads, Meta) have a clean version ready: `Outrun Father Time`. Same content, different wrapper for platform compliance.

### Content → Tracker → GHL Flow
Watch video → visit tracker → enter email → GHL tags by peptides researched → targeted supply sequences → purchase

---

## File Map

| File | What It Is |
|------|------------|
| `protocol-tracker.html` | The entire tracker app — single file, self-contained |
| `manifest.json` | PWA manifest — app name, icon, theme |
| `sw.js` | Service worker — offline support, install prompt |
| `icon-192.png` | PWA icon (NEEDED — not yet created) |
| `icon-512.png` | PWA icon (NEEDED — not yet created) |
| `*.html` (35 files) | Individual peptide encyclopedia pages (stubs) |
| `APEX-BUILD-PLAN.md` | This file |
