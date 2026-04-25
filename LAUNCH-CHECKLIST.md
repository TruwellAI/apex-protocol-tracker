# 🚀 Apex Launch Checklist

Everything you need to do to ship Apex to the world. Sequenced by dependency.

---

## ✅ Already done (codebase ready)

- [x] Web app on GitHub Pages (https://truwellai.github.io/apex-protocol-tracker/)
- [x] Production hosted on Netlify (apexdosing.com)
- [x] Affiliate program hidden until post-launch
- [x] Pro pricing UI hidden (everything free at launch)
- [x] Per-user activity tracking (apex-tracking.js) wired on all 55 pages
- [x] Quick Reference Card as primary daily view
- [x] TRT cap raised to 3.0 mL/wk
- [x] Tile-based ADD PROTOCOL flow (categories → peptides → dose dial)
- [x] Capacitor config + package.json scaffolded
- [x] PWA manifest configured
- [x] Sitemap + robots + SEO meta on every page
- [x] Customer support widget with FAQ + bug reporter

---

## 🔴 STAGE 1 — Wire the data flow (10 minutes, you do this)

### 1.1 GHL webhook
**Why:** Without this, every page view, every signup, every bug report is dropped on the floor.

**Steps:**
1. GHL → Settings → Inbound Webhooks → Create
2. Name: `Apex Site Events`
3. Copy the URL (looks like `https://services.leadconnectorhq.com/hooks/...`)
4. Send the URL to Claude — I'll inject it into the codebase in 30 seconds

### 1.2 Build at least ONE GHL workflow
While you're in GHL:
- **Trigger:** Inbound webhook + filter `event = "peptide_view"`
- **Action 1:** Create/update contact by email
- **Action 2:** Add custom field `last_peptide_viewed` = `peptide_name`
- **Action 3:** Add tag `viewed-{peptide_name}`

This single workflow turns every encyclopedia page view into a tagged contact in your CRM. Remarketing can now run.

---

## 🟡 STAGE 2 — PWA install (this week, no native dev needed)

The site is already a Progressive Web App. Anyone can install it:
- **iPhone:** Safari → Share → Add to Home Screen
- **Android:** Chrome → 3-dot menu → Install App
- **Desktop:** Browser → URL bar → Install icon

**Marketing:** Add an "Install Apex" prompt that fires once per user when they hit the tracker.

I can ship the install prompt in 1 hour when you say go.

---

## 🟢 STAGE 3 — Native apps (2-3 weeks, real work begins)

This is where you go from PWA → real iOS/Android apps in the stores.

### 3.1 Sign up for developer accounts
- **Apple Developer Program:** $99/year — https://developer.apple.com/programs/enroll/
  - Requires a 2-factor Apple ID
  - Approval typically 24-48 hours
- **Google Play Console:** $25 one-time — https://play.google.com/console/signup
  - Requires Google Workspace or Gmail
  - Approval typically 1-3 days
- **Total upfront cost:** $124

### 3.2 Install build tools (your Mac)
```bash
# Node.js (if not installed)
brew install node

# Xcode (for iOS — free from App Store, ~10GB download)
# Open App Store → search "Xcode" → install
xcode-select --install

# Android Studio (for Android)
brew install --cask android-studio
# Open Android Studio → finish setup wizard → install Android SDK
```

### 3.3 Initialize Capacitor
```bash
cd "/Users/truwell/Desktop/apex/Code/peptide break doenapex"
npm install
npx cap init Apex com.apexdosing.app --web-dir=.

# Add platforms
npx cap add ios
npx cap add android

# Sync your web code into both
npx cap sync
```

### 3.4 Test locally
```bash
# iOS
npm run cap:open:ios
# Xcode opens → click ▶ → app runs on simulator or your iPhone

# Android
npm run cap:open:android
# Android Studio opens → click ▶ → app runs on emulator or your phone
```

### 3.5 App icons + splash screens
You already have icons in `assets/icon-*.png`. For Capacitor:
```bash
# Install the icon generator (one-time)
npm install -g @capacitor/assets

# Place a 1024x1024 master icon at: assets/master-icon.png
# Place a 2732x2732 splash at: assets/master-splash.png

# Generate all required sizes
npx capacitor-assets generate --iconBackgroundColor '#080c10' --splashBackgroundColor '#080c10'
```

I can mock up the master icon and splash if you don't have them. Just say so.

---

## 🌐 STAGE 4 — Submit to stores (3-5 days dev + 1-2 weeks review)

See **STORE-SUBMISSION.md** for the per-store walkthrough.

---

## 📡 Optional: Apex Podcast (the "Spotify play")

Spotify isn't an app store, but it IS a top-3 audio platform. The Adam-voiced peptide content you've already got is **podcast-ready**. Distribution playbook:

1. **Take the existing Adam audio** (site tour, analysis tour) and expand to 8-12 episodes
2. **Episode topics:**
   - "Retatrutide — what NEJM Phase 2 actually showed"
   - "BPC-157 vs TB-500 — which is the foundation"
   - "Cycling 101 — when to start, when to break"
   - "GLP-1 muscle preservation — the Ipa pairing"
   - "Lab integration — what biomarkers your stack should move"
3. **Distribute via Buzzsprout / Anchor / Transistor** ($12-19/mo) → auto-syndicates to:
   - Spotify
   - Apple Podcasts
   - Google Podcasts
   - Amazon Music
   - iHeartRadio
   - YouTube Music
4. **Drive listeners → apexdosing.com** in show notes

This is a separate channel that becomes top-of-funnel for the app. ~2 weeks to launch the show after Stage 3 is done.

---

## 📊 Stage gate — what to check before each stage

### Before Stage 1 (data wiring)
- [ ] GHL account active and you can create webhooks
- [ ] You know which workflow you want to test first

### Before Stage 2 (PWA install prompt)
- [ ] Stage 1 webhook is firing successfully
- [ ] You've tested the PWA on at least one phone

### Before Stage 3 (native build)
- [ ] At least 100 PWA installs (validates the appetite)
- [ ] Apple Developer + Google Play accounts paid + approved
- [ ] Your Mac has Xcode + Android Studio installed and tested

### Before Stage 4 (store submission)
- [ ] App tested on at least 2 real iOS devices and 2 Android devices
- [ ] App icons + splash screens generated
- [ ] Privacy policy live at apexdosing.com/privacy.html
- [ ] Terms of service live at apexdosing.com/terms.html
- [ ] Screenshots prepared per platform (5 each)
- [ ] App Store listing copy written

---

## 🎯 Realistic timeline

| Week | What ships |
|---|---|
| **This week** | Stage 1 (GHL wired, data flowing) |
| **Week 2** | Stage 2 (PWA install prompt live, recruit first 200 users) |
| **Week 3-4** | Stage 3 (Capacitor wrapping, internal testing on real devices) |
| **Week 5** | Stage 4 (submit to App Store + Google Play) |
| **Week 6-7** | Reviews, approvals, public launch |
| **Week 8** | Marketing push: "Now on iOS + Android" |

**Total: ~8 weeks to native apps in both stores.**

Realistic. Not hyped.
