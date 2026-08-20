#!/usr/bin/env bash
# Render every SVG in this directory to png/, at twice the viewBox so the result
# stays sharp on a HiDPI screen. One scale across all diagrams, or they will not
# sit together on the page.
#
# Usage: docs/diagrams/render.sh
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p png

for svg in *.svg; do
  rsvg-convert -z 2 "$svg" -o "png/${svg%.svg}.png"
  echo "rendered png/${svg%.svg}.png"
done
