#!/usr/bin/env bash
# Render every diagram SVG in this directory to a PNG under png/.
# Reproducible from source — requires rsvg-convert (librsvg).
#
# Usage: docs/diagrams/render.sh   (or: make diagrams)
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p png

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "error: rsvg-convert not found (install librsvg2-tools / librsvg)" >&2
  exit 1
fi

for svg in *.svg; do
  png="png/${svg%.svg}.png"
  rsvg-convert --zoom=2 "$svg" -o "$png"
  echo "rendered $svg -> $png"
done
