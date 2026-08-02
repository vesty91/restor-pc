#!/bin/sh
# Sauvegarde quotidienne de la base Supabase, exécutée par crond dans le
# conteneur restor-pc-backup-cron (voir docs/BACKUP_RESTORE.md).
set -u

[ -f /etc/container.env ] && . /etc/container.env

BACKUP_DIR="/backups"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
FILENAME="restor-pc-db-${STAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"
RAW="${FILEPATH}.raw"
KEEP="${BACKUP_KEEP:-30}"
ERRLOG="${BACKUP_DIR}/.last-error.log"

notify() {
  title="$1"; message="$2"; priority="$3"; tags="$4"
  [ -z "${NTFY_TOPIC:-}" ] && return 0
  server="${NTFY_SERVER:-https://ntfy.sh}"
  server="${server%/}"
  auth_header=""
  [ -n "${NTFY_TOKEN:-}" ] && auth_header="Authorization: Bearer ${NTFY_TOKEN}"
  curl -sS -m 15 \
    -H "Title: ${title}" \
    -H "Priority: ${priority}" \
    -H "Tags: ${tags}" \
    ${auth_header:+-H "$auth_header"} \
    -d "${message}" \
    "${server}/${NTFY_TOPIC}" >/dev/null 2>&1 || true
}

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "ERREUR: SUPABASE_DB_URL manquant"
  notify "Restor-PC backup ECHEC (NAS)" "SUPABASE_DB_URL manquant dans le conteneur backup-cron" "urgent" "rotating_light"
  exit 1
fi

echo "-> pg_dump vers ${FILENAME}"
if pg_dump --no-owner --no-privileges "${SUPABASE_DB_URL}" > "${RAW}" 2>"${ERRLOG}"; then
  gzip -f "${RAW}"
  mv "${RAW}.gz" "${FILEPATH}"
  SIZE_KB=$(du -k "${FILEPATH}" | cut -f1)
  echo "OK (${SIZE_KB} Ko)"

  # Rotation : conserver les KEEP sauvegardes les plus récentes
  to_delete=$(ls -1t "${BACKUP_DIR}"/restor-pc-db-*.sql.gz 2>/dev/null | tail -n "+$((KEEP + 1))")
  if [ -n "${to_delete}" ]; then
    echo "${to_delete}" | while IFS= read -r f; do
      [ -n "$f" ] && rm -f "$f" && echo "Rotation: suppression de $(basename "$f")"
    done
  fi

  notify "Restor-PC backup OK (NAS)" "Sauvegarde reussie sur le NAS : ${FILENAME} (${SIZE_KB} Ko)" "default" "white_check_mark"
  rm -f "${ERRLOG}"
  exit 0
else
  rm -f "${RAW}"
  ERR_DETAIL=$(tail -c 500 "${ERRLOG}" 2>/dev/null)
  echo "ECHEC pg_dump: ${ERR_DETAIL}"
  notify "Restor-PC backup ECHEC (NAS)" "pg_dump a echoue sur le NAS : ${ERR_DETAIL}" "urgent" "rotating_light"
  exit 1
fi
