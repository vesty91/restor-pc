#!/usr/bin/env bash
# EXEMPLE — ne pas exécuter tel quel contre la production.
# Usage prévu : staging uniquement, après copie manuelle des variables.

set -euo pipefail

TARGET_DB_URL="${TARGET_DB_URL:-}"
DUMP_FILE="${1:-backup-data.sql}"
CONFIRM="${CONFIRM_RESTORE:-}"

if [[ -z "$TARGET_DB_URL" ]]; then
  echo "REFUS: TARGET_DB_URL manquant"
  exit 1
fi

if [[ "$TARGET_DB_URL" == *"rjymdpstakbrbqtfpomj"* ]]; then
  echo "REFUS: URL de production détectée. Utilisez un projet staging."
  exit 1
fi

if [[ "$CONFIRM_RESTORE" != "YES_I_UNDERSTAND" ]]; then
  echo "REFUS: exportez CONFIRM_RESTORE=YES_I_UNDERSTAND pour confirmer."
  exit 1
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Fichier introuvable: $DUMP_FILE"
  exit 1
fi

echo "Restore de $DUMP_FILE vers staging…"
psql "$TARGET_DB_URL" -f "$DUMP_FILE"
echo "OK"
