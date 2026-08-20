#!/usr/bin/env bash
# Search files for literal secret values listed in a file that is never committed.
#
# Usage:   scripts/check-secrets.sh [path ...]          # defaults to the whole repo
#          SECRETS_FILE=/other/list scripts/check-secrets.sh .sessions
#
# The list file holds one literal value per line — an API key, a token, a
# password as it actually appears. Blank lines and lines starting with # are
# ignored. It is gitignored, and this script never prints a value from it: a
# leak checker that echoes the secret into a terminal, a CI log or a session
# transcript has moved the problem rather than found it. Hits are reported by
# the entry's line number in the list.
#
# Exit: 0 clean · 1 something matched · 2 no list to check against.
set -uo pipefail

SECRETS_FILE="${SECRETS_FILE:-.secrets}"

if [ ! -f "$SECRETS_FILE" ]; then
  echo "No secrets list at $SECRETS_FILE, so nothing was checked." >&2
  echo "Create it with one literal value per line — it is gitignored — or set SECRETS_FILE." >&2
  exit 2
fi

# Default to the whole tree. .git and node_modules are excluded because a hit
# inside either is a copy of something already found in the working tree.
targets=("$@")
[ ${#targets[@]} -eq 0 ] && targets=(.)

found=0
entry=0

while IFS= read -r value || [ -n "$value" ]; do
  entry=$((entry + 1))
  case "$value" in ''|'#'*) continue ;; esac

  # -F: the value is a literal, not a pattern. -I: skip binaries, where a
  # match is unreadable and usually a false positive from compression.
  hits=$(grep -rInF --exclude-dir=.git --exclude-dir=node_modules \
                    --exclude="$(basename "$SECRETS_FILE")" \
                    -- "$value" "${targets[@]}" 2>/dev/null | cut -d: -f1,2)

  if [ -n "$hits" ]; then
    found=1
    echo "entry $entry of $SECRETS_FILE appears in:"
    echo "$hits" | sed 's/^/  /'
  fi
done < "$SECRETS_FILE"

if [ "$found" -eq 0 ]; then
  echo "Clean: no entry from $SECRETS_FILE appears in ${targets[*]}"
  exit 0
fi

echo
echo "Do not commit these. Rotate anything that has already been pushed —" >&2
echo "a value that reached a remote is compromised whether or not it is removed." >&2
exit 1
