# 🏪 Apex Store Submission Guide

Detailed walkthroughs for getting Apex into the **Apple App Store** and **Google Play Store**.

---

## 🍎 APPLE APP STORE

### Prerequisites
- [x] Apple Developer Program membership ($99/yr, paid + active)
- [x] Mac with latest Xcode installed
- [x] Apple ID with 2-factor authentication
- [x] App tested on at least 1 real iPhone

### Submission flow

#### 1. Create the App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** `Apex` (must match `appName` in capacitor.config.json)
   - **Primary language:** English (US)
   - **Bundle ID:** `com.apexdosing.app` (must match `appId`)
   - **SKU:** `apex-protocol-tracker-001` (any unique string)
   - **User access:** Full Access
4. Click **Create**

#### 2. App Information
- **Subtitle (30 chars):** `Peptide protocol tracker`
- **Category:**
  - Primary: **Health & Fitness**
  - Secondary: **Medical** (optional — be careful, see compliance below)
- **Content Rights:** Confirm you have rights to all content

#### 3. Pricing & Availability
- **Price:** Free
- **Availability:** All territories

#### 4. App Privacy
This is critical. Apple requires you disclose what data you collect.

**Apex's privacy disclosure:**
- **Data Linked to You (collected):**
  - Email Address (only if user opts into soft email gate)
- **Data Not Linked to You (collected anonymously):**
  - Usage Data (page views, peptide views — for product improvement)
- **Data Not Collected:**
  - Health & Fitness data (stored locally only — never uploaded)
  - Photos (stored locally only)
  - Contacts, Location, Financial Info, etc.

**Privacy Policy URL:** `https://apexdosing.com/privacy.html` (confirm this is live)
**Terms of Use URL:** `https://apexdosing.com/terms.html`

#### 5. Version Information
- **Version:** `1.0.0`
- **What's New in This Version:**
```
The first version of Apex — the free peptide protocol tracker.

Track your stack, calculate your dose, build research-backed protocols
based on your goals. The intelligent companion for serious peptide users.

• 46+ peptide encyclopedia with research-backed dosing
• Conflict-aware stack builder
• Daily injection card you can print
• Cost tracker
• Progress photos + weight log
• 100% free, 100% local-storage, no account required

Research and educational use only. Not medical advice.
```

#### 6. App Description (4000 chars max)
```
APEX — THE FREE PEPTIDE PROTOCOL TRACKER

Stop guessing your dosing. Stop juggling spreadsheets. Apex is the
research-backed companion that respects your intelligence.

WHAT'S INSIDE
• 46+ peptide encyclopedia — every dose, every cycle length, every citation
• Goals-first stack builder — pick what you're trying to solve, we build a
  no-conflict stack instantly (no double GLP-1, no double GHRH)
• Conflict detection — flag redundant peptides before you waste vials
• Receptor coverage map — visual diagnostic of what your stack is doing
• Daily injection card — "what do I do right now" answered in 1 second
• Cost tracker — $/day, $/month, $/year per protocol
• Progress photos + weight log + mood/energy/sleep journal
• Annual cycle planner
• Cycle ending? We tell you 5 days before
• Vial running out? We tell you 14 days out

WHAT IT'S NOT
Apex is not a marketplace. We don't sell peptides. We don't replace your
doctor. Every disclaimer is real — this is research and educational only.

WHO IT'S FOR
Serious users who already understand the basics and want a real tool.
Coaches managing client cycles. Athletes optimizing recovery. Anyone
running peptides who's tired of guessing.

100% FREE
Free forever for the encyclopedia, tracker, goals builder, conflict
detection, cost tracker, photo log, and Adam-voiced site tour. No
account required. Your data stays on your device.

RESEARCH USE ONLY
This is not medical advice. Always consult a licensed healthcare provider
before starting any peptide protocol. All compounds referenced are research
chemicals not approved by the FDA for human use.
```

#### 7. Keywords (100 chars total)
```
peptides,GLP-1,retatrutide,tirzepatide,semaglutide,BPC-157,TB-500,tracker,dose,TRT,protocol
```

#### 8. Screenshots
Required sizes for iPhone:
- **6.9" Display (iPhone 16 Pro Max):** 1320×2868 — required
- **6.5" Display (iPhone 11 Pro Max):** 1242×2688 — required
- **5.5" Display (iPhone 8 Plus):** 1242×2208 — required

**5 screenshots minimum.** Recommended sequence:
1. Quick Reference Card (the home view) — "Your daily dose, dialed in"
2. Goals builder tile picker — "Pick what you want to fix"
3. Receptor map — "See what your stack is hitting"
4. Encyclopedia entry (Retatrutide) — "Every dose, every citation"
5. Progress photo timeline — "Track your transformation"

#### 9. Build Upload (Xcode)
```bash
cd "/Users/truwell/Desktop/apex/Code/peptide break doenapex"
npx cap sync ios
npx cap open ios
```
In Xcode:
1. Select **Any iOS Device (arm64)** in the device dropdown (top center)
2. **Product** menu → **Archive**
3. Wait for build (~5-10 min first time)
4. **Organizer** opens → click **Distribute App**
5. Choose **App Store Connect** → **Upload**
6. Sign with your Apple Developer credentials
7. Build appears in App Store Connect after ~15-30 min processing

#### 10. Submit for Review
Back in App Store Connect:
1. Select your build under **Build**
2. Fill in **App Review Information** with a contact email + phone
3. **Demo account** field: Leave blank (we have no account system at launch)
4. **Notes:** "This is a research and educational tool. All disclaimers stating not medical advice are visible on every page. No subscriptions or in-app purchases at launch."
5. Click **Save** → **Submit for Review**

**Review takes 24 hours – 7 days.** Most apps approved in 2-3 days.

### ⚠ Apple compliance — things to watch
- **Don't claim medical efficacy.** Every claim should be framed as "research" not "treatment."
- **No "Buy peptides here" links** — Apex sells hardware only, peptides go through pharmacies/research vendors. Mention this clearly.
- **Disclaimers on every page** — already handled by the persistent banner.
- **Age gate** — "Research use only · 17+" — already in the codebase.
- **No subscription IAP** — we're shipping 100% free, no paywall, no purchases at launch. This is the cleanest path through review.

---

## 🤖 GOOGLE PLAY STORE

### Prerequisites
- [x] Google Play Console account ($25 one-time, paid + active)
- [x] Mac with Android Studio installed
- [x] App tested on at least 1 real Android device

### Submission flow

#### 1. Create the App in Play Console
1. Go to https://play.google.com/console
2. **Create app**
3. Fill in:
   - **App name:** `Apex`
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - Confirm Developer Program Policies + US export laws

#### 2. Set up your app
Play Console will guide you through these. Most map to App Store fields:
- **App access:** All functionality available without restrictions
- **Ads:** No ads
- **Content rating:** Run the questionnaire (Apex should land Teen / 17+)
- **Target audience:** Adults 18+
- **News apps:** No
- **Health apps:** Yes — disclose this is informational only
- **COVID-19 contact tracing:** No
- **Data safety:** Same disclosures as Apple (email optional, no health data uploaded)

#### 3. App Content
- **Privacy Policy URL:** `https://apexdosing.com/privacy.html`
- **Government apps:** No
- **Financial features:** No
- **Health apps:** Yes — informational/educational only

#### 4. Store Listing
- **App name:** Apex
- **Short description (80 chars):** `The free peptide protocol tracker. Research-backed dosing & cycle planning.`
- **Full description:** Same as App Store description above
- **App category:** Health & Fitness
- **Tags:** Choose 3-5 from `Health & Fitness`, `Medical`, `Lifestyle`

#### 5. Graphics
- **App icon:** 512×512 PNG (already in `assets/icon-512.png`)
- **Feature graphic:** 1024×500 PNG — banner for the listing top
- **Phone screenshots:** Min 2, max 8. Same content as iOS, different aspect ratio (16:9 portrait or 9:16)
- **7-inch tablet:** Optional
- **10-inch tablet:** Optional

#### 6. Build the AAB (Android App Bundle)
```bash
cd "/Users/truwell/Desktop/apex/Code/peptide break doenapex"
npx cap sync android
npx cap open android
```
In Android Studio:
1. **Build** menu → **Generate Signed App Bundle / APK**
2. Choose **Android App Bundle**
3. Create a new keystore (save the password somewhere safe — you'll need it for every update)
4. Build variants: **release**
5. Output: `android/app/release/app-release.aab`

#### 7. Upload + Release
1. Play Console → **Production** → **Create new release**
2. Upload the `.aab` file
3. Release name: `1.0.0`
4. Release notes: Same as App Store "What's New" copy
5. **Review release** → **Start rollout to Production**

**Review takes 1-3 days.** Google is faster than Apple.

---

## 📐 Asset specs cheat sheet

| Asset | iOS | Android |
|---|---|---|
| App icon (master) | 1024×1024 | 512×512 |
| Splash screen | 2732×2732 | (Capacitor handles) |
| Phone screenshots | 1320×2868 (6.9") | 1080×1920 portrait |
| Tablet screenshots | 2048×2732 (12.9") | 2048×2732 |
| Feature graphic | N/A | 1024×500 |
| Promo video | optional 30s | optional 30-120s |

---

## 🎯 After approval — launch day

1. **Tweet/post:** "Apex is now in the App Store + Google Play"
2. **Email your existing list:** "The app is live"
3. **Update apexdosing.com** with App Store + Play Store badges
4. **Add deep links:** apexdosing.com/get-app → smart-detects iOS vs Android, redirects to right store
5. **Monitor reviews** — respond to every 1-3 star review within 48 hours

---

## 🚫 Common rejection reasons (and how to avoid)

| Apple says | Why | Fix |
|---|---|---|
| "Misleading users" | Calls peptides medical/treatment | Use "research" / "educational" framing everywhere |
| "Inadequate disclosure" | Privacy policy missing or incomplete | Make sure /privacy.html lists every data point |
| "Repeated submissions" | Multiple identical submissions | Wait for review, address feedback before resubmitting |
| "Spam" | Description over-keywords | Keep description natural, not keyword-stuffed |
| "Bug crashes" | App crashes on launch | Test on multiple devices before submitting |

| Google says | Why | Fix |
|---|---|---|
| "Health app misrepresentation" | Claiming medical claims | Same as Apple — research framing only |
| "Privacy policy URL broken" | URL returns 404 | Verify https://apexdosing.com/privacy.html is live |
| "Target API too low" | Capacitor defaults usually OK | Update Android Gradle if Capacitor warns |

---

## 🔁 Updating the app later

Once approved, every code update follows the same flow:
```bash
# Make your changes to HTML/JS
# Sync to native projects
npx cap sync

# Open + rebuild in Xcode (iOS)
npx cap open ios
# Archive → upload to App Store Connect → submit version 1.0.1

# Open + rebuild in Android Studio (Android)
npx cap open android
# Build → Generate Signed AAB → upload to Play Console → release 1.0.1
```

**Tip:** Bump the `version` field in `capacitor.config.json` and `package.json` before each release. Apple/Google reject duplicate version submissions.
