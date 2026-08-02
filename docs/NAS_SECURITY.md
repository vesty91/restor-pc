# Sécurité NAS Synology (Restor-PC)

## DSM API

- URL obligatoire en **HTTPS** (`NAS_DSM_URL`).
- Login / create share en **POST** (plus de mot de passe dans la query string).
- Ne jamais journaliser les URL contenant `_sid` ou `passwd`.
- Compte technique dédié **sans 2FA** (ex. `restorpc-api`), droits File Station minimaux.

## Certificat TLS

Ne **jamais** désactiver `NODE_TLS_REJECT_UNAUTHORIZED`.

Si le NAS utilise un certificat auto-signé :

1. Exportez l’autorité de certification (CA) Synology.
2. Installez-la dans le magasin de confiance de l’hôte (Windows / Linux).
3. Ou configurez `NODE_EXTRA_CA_CERTS=/chemin/vers/ca.pem` sur le runtime.

## Fallback SSH

Désactivé par défaut :

```env
NAS_SSH_FALLBACK_ENABLED=false
```

Si activé (atelier local uniquement) :

- préférer une **clé SSH** dédiée plutôt qu’un mot de passe ;
- compte à privilèges minimaux ;
- ne pas utiliser `echo password | sudo -S` en production longue durée ;
- épingler la clé hôte SSH.

## Variables

Voir `.env.example` section NAS.

## Reverse proxy et rate-limit (TRUST_PROXY_HEADERS)

Par défaut, l’application **ignore** `X-Forwarded-For` / `X-Real-IP` pour le
rate-limit (`TRUST_PROXY_HEADERS` non défini ou `false`). Un client ne peut
donc pas contourner les limites en forgeant ces en-têtes.

Sur le NAS Synology, activer explicitement :

```env
TRUST_PROXY_HEADERS=true
```

**uniquement** si le reverse proxy écrase les en-têtes (ne pas propager la
valeur envoyée par le navigateur) :

```nginx
# Exemple — à adapter dans la conf Synology / Nginx
# NE PAS appliquer sans vérifier la conf réelle du reverse proxy DSM.
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
```

Sans cette écrasement, laisser `TRUST_PROXY_HEADERS=false` : le rate-limit
utilise alors une clé partagée (`unknown`), ce qui reste sûr contre le spoofing
(mais moins précis par IP réelle).

## Exposition du port Docker (Phase 5)

### Diagnostic production (2026-08-01)

| Élément                           | Valeur observée                                                               |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Conteneur                         | `restor-pc`, network `restor-pc_default`, IP `172.20.0.2`                     |
| Publish actuel (avant changement) | `0.0.0.0:3000->3000` et `[::]:3000`                                           |
| Healthcheck                       | `wget http://127.0.0.1:3000/api/health` (dans le conteneur)                   |
| Curl NAS loopback                 | `http://127.0.0.1:3000/api/health` → 200                                      |
| Curl NAS LAN                      | `http://192.168.1.5:3000/api/health` → 200                                    |
| Nginx `www`                       | `proxy_pass http://192.168.1.5:3000;` (`http.restor-pc-www-migration.conf`)   |
| Reverse Proxy DSM `atelier`       | backend `192.168.1.5:3000` (overridden en 301 vers www par la conf migration) |

### Cible

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

Le loopback est **atteignable** depuis nginx sur le NAS (`curl 127.0.0.1:3000` OK).
En revanche, publier uniquement sur `127.0.0.1` **casse** le site si nginx
continue de cibler `192.168.1.5:3000`.

### Déploiement coordonné (obligatoire)

1. Mettre à jour nginx **avant** ou **dans la même fenêtre** que le recreate Docker :
   - `proxy_pass http://127.0.0.1:3000;`
   - (recommandé) `proxy_set_header X-Forwarded-For $remote_addr;` au lieu de `$proxy_add_x_forwarded_for`
2. `docker compose up -d` avec le nouveau `ports`
3. Vérifier :
   - conteneur healthy
   - `curl -s http://127.0.0.1:3000/api/health` → 200
   - `https://www.restor-pc.fr/api/health` → 200
   - `https://www.restor-pc.fr/robots.txt` et `/sitemap.xml` → 200
   - depuis un PC LAN : `http://192.168.1.5:3000` doit **échouer** (connexion refusée)
4. Ne pas appliquer nginx / DSM sans validation explicite (règle production).

Snippet nginx attendu (emplacement : `conf.d/http.restor-pc-www-migration.conf`) :

```nginx
proxy_pass http://127.0.0.1:3000;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Forwarded-Proto https;
proxy_set_header Host $http_host;
```
