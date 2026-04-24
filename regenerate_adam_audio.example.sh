#!/bin/bash
# ═════════════════════════════════════════════════════════════
# REGENERATE ADAM AUDIO — Apex tour + analysis narration
# Reads ElevenLabs API key from environment.
#
# Usage:
#   export XI_API_KEY="your_key_here"
#   ./regenerate_adam_audio.example.sh
# OR copy this file to regenerate_adam_audio.sh (gitignored)
# and hardcode the key locally.
# ═════════════════════════════════════════════════════════════

set -e

if [ -z "$XI_API_KEY" ]; then
  echo "❌ XI_API_KEY environment variable not set."
  echo "   export XI_API_KEY=\"sk_...\" before running."
  exit 1
fi

ADAM_VOICE_ID="pNInz6obpgDQGcFmaJgB"
AUDIO_DIR="$(cd "$(dirname "$0")" && pwd)/audio"
STABILITY=0.45
SIMILARITY=0.75
STYLE=0.30

# Site tour script (~75 sec at Adam's pace)
SITE_TOUR_TEXT="Welcome to Apex. Quick tour of your tracker — I'll keep it under ninety seconds.

These four stats up top — active protocols, injections today, anything on break, and your streak. The streak's the one to watch. Consistency wins this game.

Orange banner means what it says. Research and educational only. Not medical advice. Always talk to a licensed provider.

Below that — your active cycles. Each card knows your week, your dose, and your ramp. Retatrutide, maintenance dose, titration complete. When you're ready to come off, one click starts your taper — stepped down the right way.

Supply status is auto-tracked. Bottle shelf-life, doses remaining, reorder date — all live. We alert you before you run out. No more scrambling.

Hit the Analysis tab and you'll see what your stack is actually doing — mechanism map, synergies, overlap warnings. Everything your peptides hit at the receptor level.

When you're ready to clear this demo and build your own, tap the gold button. Takes thirty seconds.

That's it. You're good to go."

ANALYSIS_TOUR_TEXT="This is where your stack comes alive — every peptide, every receptor, mapped in real time.

Up top: what your stack is actually doing. Not marketing copy. The biological levers you're pulling, in plain English.

Below that: the mechanism map. GLP-1 agonism, growth hormone pulse, tissue repair, mitochondrial function — you see which pathways are covered, and which are wide open.

Then the alerts panel. This is the bouncer. Two peptides fighting, timing clash, dose out of range — it flags before you make the mistake.

The engine does the receptor math. You just run the protocol."

generate() {
  local OUT_FILE="$1"
  local TEXT="$2"
  local LABEL="$3"

  echo ""
  echo "🎙  Generating: $LABEL → $OUT_FILE"

  if [ -f "$AUDIO_DIR/$OUT_FILE" ]; then
    cp "$AUDIO_DIR/$OUT_FILE" "$AUDIO_DIR/${OUT_FILE%.mp3}_backup.mp3"
  fi

  ESCAPED_TEXT=$(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$TEXT")

  RESPONSE_CODE=$(curl -sS -o "$AUDIO_DIR/$OUT_FILE" -w "%{http_code}" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/$ADAM_VOICE_ID" \
    -H "xi-api-key: $XI_API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: audio/mpeg" \
    -d "{\"text\":$ESCAPED_TEXT,\"model_id\":\"eleven_turbo_v2_5\",\"voice_settings\":{\"stability\":$STABILITY,\"similarity_boost\":$SIMILARITY,\"style\":$STYLE,\"use_speaker_boost\":true}}")

  if [ "$RESPONSE_CODE" != "200" ]; then
    echo "❌ API error (HTTP $RESPONSE_CODE)"
    cat "$AUDIO_DIR/$OUT_FILE"
    [ -f "$AUDIO_DIR/${OUT_FILE%.mp3}_backup.mp3" ] && mv "$AUDIO_DIR/${OUT_FILE%.mp3}_backup.mp3" "$AUDIO_DIR/$OUT_FILE"
    exit 1
  fi
  echo "   ✅ done"
}

generate "adam_site_tour.mp3"     "$SITE_TOUR_TEXT"     "Site walkthrough"
generate "adam_analysis_tour.mp3" "$ANALYSIS_TOUR_TEXT" "Analysis deep-dive"

echo ""
echo "✅ Adam is live. Reload tracker to hear the new cuts."
