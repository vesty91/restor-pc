# Conteneur autonome de sauvegarde DB, pensé pour tourner 24/7 sur le NAS
# (contrairement à une tâche planifiée sur un PC qui peut être éteint).
# Basé sur postgres:17-alpine : contient déjà pg_dump, pas de dépendance
# supplémentaire à gérer côté version Postgres.
FROM postgres:17-alpine

RUN apk add --no-cache curl tzdata

ENV TZ=Europe/Paris

COPY entrypoint.sh /entrypoint.sh
COPY backup.sh /scripts/backup.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /entrypoint.sh /scripts/backup.sh \
    && mkdir -p /backups

ENTRYPOINT ["/entrypoint.sh"]
CMD ["crond", "-f", "-l", "8"]
