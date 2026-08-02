#!/bin/sh
# busybox crond ne propage pas l'environnement du conteneur à ses jobs.
# On fige donc les variables d'env (SUPABASE_DB_URL, NTFY_TOPIC, ...) reçues
# au démarrage dans un fichier source par backup.sh à chaque exécution.
set -eu

{
  while IFS= read -r line; do
    key="${line%%=*}"
    val="${line#*=}"
    esc_val=$(printf '%s' "$val" | sed "s/'/'\\\\''/g")
    printf "export %s='%s'\n" "$key" "$esc_val"
  done <<ENVEOF
$(env)
ENVEOF
} > /etc/container.env
chmod 600 /etc/container.env

exec "$@"
