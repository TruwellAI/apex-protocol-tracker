#!/bin/bash
# Apex deploy — PAUSED until 2026-05-13 (Netlify credits exhausted)
# Run `bash serve.sh` for local dev in the meantime
set -e

cd "$(dirname "$0")"

echo "⚠️  NETLIFY DEPLOYS PAUSED UNTIL 2026-05-13 (credits exhausted)"
echo "   Run 'bash serve.sh' for local dev at http://localhost:8080"
echo ""
echo "🔄 Syncing files to ApexApp Capacitor bundle (safe — no credits)..."
cp index.html "/Users/truwell/Desktop/apex/ApexApp/www/index.html"
cp protocol-tracker.html "/Users/truwell/Desktop/apex/ApexApp/www/protocol-tracker.html"
cp nutrition.html "/Users/truwell/Desktop/apex/ApexApp/www/nutrition.html"
cp -r assets "/Users/truwell/Desktop/apex/ApexApp/www/" 2>/dev/null || true
echo "✅ Capacitor bundle synced."

echo ""
echo "──── UNCOMMENT BELOW AFTER MAY 13 TO RESUME NETLIFY DEPLOYS ────"
echo "# netlify deploy --prod --dir=. --no-build    # --no-build skips build minutes"
echo ""
