#!/bin/bash
# Apex LOCAL DEV server — while Netlify credits are exhausted until May 13
# Usage: bash serve.sh  (then open http://localhost:8080)
cd "$(dirname "$0")"

PORT=${1:-8080}

# Get local IP for testing on phone
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo "════════════════════════════════════════════════════════"
echo "  🚀 Apex LOCAL SERVER"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  💻 Desktop:   http://localhost:$PORT"
echo "  📱 Phone:     http://$LOCAL_IP:$PORT  (same wifi)"
echo "  🏠 Home:      http://localhost:$PORT/index.html"
echo "  🧪 Tracker:   http://localhost:$PORT/protocol-tracker.html"
echo ""
echo "  Press Ctrl+C to stop"
echo "════════════════════════════════════════════════════════"
echo ""

python3 -m http.server $PORT
