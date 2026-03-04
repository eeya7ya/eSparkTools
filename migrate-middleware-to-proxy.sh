#!/usr/bin/env bash
#
# migrate-middleware-to-proxy.sh
#
# Migrates a Next.js project from the deprecated middleware.ts/js convention
# to the new proxy.ts/js convention introduced in Next.js 16.
#
# What it does:
#   1. Finds middleware.ts or middleware.js in the project root or src/
#   2. Renames the file to proxy.ts / proxy.js
#   3. Renames the exported "middleware" function to "proxy"
#   4. Converts named export to default export
#
# Usage:
#   ./migrate-middleware-to-proxy.sh [project-directory]
#
# If no directory is given, the current directory is used.

set -euo pipefail

PROJECT_DIR="${1:-.}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: '$PROJECT_DIR' is not a directory."
  exit 1
fi

# Resolve to absolute path
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

FOUND=0

find_and_migrate() {
  local dir="$1"
  local ext

  for ext in ts js tsx jsx; do
    local src="$dir/middleware.$ext"
    local dst="$dir/proxy.$ext"

    if [ -f "$src" ]; then
      FOUND=1
      echo "Found: $src"

      if [ -f "$dst" ]; then
        echo "Error: $dst already exists. Skipping to avoid overwriting."
        continue
      fi

      # Replace the function name and convert to default export
      sed \
        -e 's/export[[:space:]]\+function[[:space:]]\+middleware/export default function proxy/g' \
        -e 's/export[[:space:]]\+async[[:space:]]\+function[[:space:]]\+middleware/export default async function proxy/g' \
        -e 's/export[[:space:]]\+const[[:space:]]\+middleware[[:space:]]*=/export default function proxy/g' \
        "$src" > "$dst"

      rm "$src"
      echo "Migrated: $src -> $dst"
    fi
  done
}

# Check project root
find_and_migrate "$PROJECT_DIR"

# Check src/ directory
if [ -d "$PROJECT_DIR/src" ]; then
  find_and_migrate "$PROJECT_DIR/src"
fi

if [ "$FOUND" -eq 0 ]; then
  echo "No middleware file found in '$PROJECT_DIR' or '$PROJECT_DIR/src/'."
  echo ""
  echo "Expected one of:"
  echo "  middleware.ts, middleware.js, middleware.tsx, middleware.jsx"
  echo ""
  echo "Make sure you run this script from your Next.js project root."
  exit 1
fi

echo ""
echo "Migration complete!"
echo ""
echo "Notes:"
echo "  - The proxy function now runs on the Node.js runtime (not Edge)."
echo "  - If you were using 'export const config = { runtime: \"edge\" }', remove it."
echo "  - Verify your imports and matcher config still work correctly."
echo "  - Learn more: https://nextjs.org/docs/messages/middleware-to-proxy"
