#!/usr/bin/env bash
# Regenerate ATLAS voice clips (Ryan, en-GB neural). Needs: pip install edge-tts
set -euo pipefail
cd "$(dirname "$0")/../public/voice"
NAME="${1:-Jan}"
gen() { edge-tts --voice en-GB-RyanNeural --rate=-6% --pitch=-6Hz --text "$2" --write-media "$1.mp3"; }
gen hello-morning "Good morning, $NAME. Systems online. Shall we secure the day?"
gen hello-afternoon "Good afternoon, $NAME. Systems online. Shall we secure the day?"
gen hello-evening "Good evening, $NAME. Systems online. Shall we secure the day?"
gen secured "Day secured. Well done, $NAME."
echo "Voice clips written to public/voice/"
