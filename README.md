# Apex Protocol Tracker

> Free peptide protocol tracker, encyclopedia, and stack analyzer.
> Built for serious users who want intelligent dosing without paying clinic markups.

🌐 **Live:** https://apexdosing.com (production · Netlify)
🌐 **Preview:** https://truwellai.github.io/apex-protocol-tracker/ (GitHub Pages)
📦 **Repo:** https://github.com/TruwellAI/apex-protocol-tracker

---

## What this is

A vanilla-JS, single-file-per-page web app that gives peptide users a real tool — not a sales funnel.

**Free tier:**
- 46+ peptide encyclopedia with research-backed dosing
- Goals-first stack builder with conflict-aware engine (no double GLP-1, no double GHRH, etc.)
- Cycle tracker with daily logging, streak counter, supply forecasting
- Receptor coverage map + missing-support detector
- Cost tracker ($/day / $/month / $/year)
- Progress photos + weight log + mood/energy/sleep journal
- Adam-voiced site tour + analysis deep-dive
- Manual export/import for cross-device sync

**Apex Pro ($2.99/mo):**
- Cloud sync, lab integration, AI protocol coach
- Member-only stacks, priority support, Discord access
- Affiliate program eligibility ($1/mo per referral, forever)
- 20% off Apex hardware

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS, single HTML files per page |
| Hosting | Netlify (production) + GitHub Pages (mirror) |
| State | localStorage (offline-first) |
| Marketing | GHL webhooks for events, ManyChat-style funnels |
| Voice | ElevenLabs Adam (production) / macOS Daniel (fallback) |
| Audio gen | `regenerate_adam_audio.example.sh` (env-var version) |
| QR codes | api.qrserver.com (no API key required) |

**No build step.** Edit HTML/JS, push, deploy.

---

## File structure

```
.
├── index.html                    # Landing — lane picker + pricing anchor
├── protocol-tracker.html         # Main app — tracker, goals builder, profile, Pro
├── browse.html                   # Encyclopedia grid
├── retatrutide.html, bpc157.html # Per-peptide pages (46+)
├── affiliate.html                # Affiliate recruitment landing
├── wizard.html                   # Onboarding wizard
├── compare.html                  # Side-by-side peptide compare
├── basics.html                   # Reconstitution + storage primer
├── nutrition.html                # Macro calculator (BigZKatz extending)
├── assets/
│   ├── apex-nav-pill.js          # Sticky top bar + back-to-tracker pill
│   ├── apex-editorial.js         # Per-peptide decision-framework tiles
│   ├── apex-social-proof.js      # Testimonial rotator + trending stacks
│   ├── apex-support.js           # FAQ + bug reporter overlay
│   └── apex-macro-calc.js        # Macro tools
├── audio/
│   ├── adam_site_tour.mp3        # Site walkthrough narration (~63s)
│   ├── adam_analysis_tour.mp3    # Analysis tab deep dive (~38s)
│   └── ep0-stack-analysis.mp3    # Legacy fallback
├── netlify/functions/            # Serverless (paused)
├── sitemap.xml                   # 53 indexed URLs
├── robots.txt
└── regenerate_adam_audio.example.sh  # Env-var version (safe to commit)
```

`regenerate_adam_audio.sh` (with hardcoded ElevenLabs key) is **gitignored**.

---

## Local development

```bash
# Serve locally
./serve.sh                        # Python http.server on :8080
# Or:
python3 -m http.server 8080

# Public preview (Cloudflare Tunnel)
cloudflared tunnel --url http://localhost:8080
```

---

## Deploy

**Netlify:** push to `main` → auto-deploys (when credits aren't exhausted).
**GitHub Pages:** push to `main` → rebuilds at `truwellai.github.io/apex-protocol-tracker/` in ~1-2 min.

---

## GHL events fired

The frontend fires these events to a configurable webhook (`GHL_WEBHOOK_URL`):

| Event | When |
|---|---|
| `affiliate_signup` | User submits the 4-field signup on /affiliate.html |
| `affiliate_payout_set` | User configures payout method in profile |
| `referral_landing` | Visitor arrives with `?ref=` param |
| `referral_shared` | User clicks share button (with channel: sms/email/twitter/native) |
| `referral_converted` | Referred user captures email or starts Pro |
| `pricing_viewed` | User opens the Pro paywall modal |
| `pro_checkout_started` | User clicks the Pro Stripe button |
| `goals_builder_run` | User submits goals selection |
| `goals_stack_committed` | User adds the recommended stack to tracker |
| `cycle_started` | New protocol added (real, non-demo) |
| `milestone_reached` | Day 7 / 30 / 60 / 90 on any protocol |
| `cycle_ending_soon` | 0-5 days before cycle end |
| `email_captured` | User opts in via soft email modal |
| `bug_report` | User submits via support overlay |

---

## Apex Pro economics

- **Sub price:** $2.99 / mo
- **Affiliate payout:** $1.00 / mo per active sub, paid forever
- **Stripe fee:** ~$0.39 per charge
- **Net to Apex:** $1.60 / mo per affiliate-acquired sub, $2.60 / mo organic
- **Min payout:** $10 (rolls forward below threshold)

Refer 3 paying users → your sub is free.
Refer 100 → $100/mo recurring forever.

See `/affiliate.html` for the full pitch.

---

## Compliance

- All disclaimers stamp **research and educational use only · not medical advice**
- Age gate (17+) enforced on first visit
- HIPAA not applicable (no PHI stored server-side; all health data is local)
- GDPR-compliant (export, deletion, no third-party tracking by default)
- Apex sells hardware only — never peptides directly

---

## Contributing

Currently a closed contributor model:
- @TruwellAI (owner)
- @BigZKatz (collaborator, focused on macro/meal planning)

PRs welcome from collaborators. External contributions: open an issue first.

---

## License

Proprietary. All rights reserved.
Code is public for transparency, not for re-use.
