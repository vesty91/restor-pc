#!/usr/bin/env bash
# Dump non destructif (nécessite Supabase CLI liée au projet).
set -euo pipefail
OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
npx supabase db dump -f "$OUT_DIR/schema-$STAMP.sql" --schema public
npx supabase db dump -f "$OUT_DIR/data-$STAMP.sql" --data-only --schema public
echo "Backups écrits dans $OUT_DIR"
