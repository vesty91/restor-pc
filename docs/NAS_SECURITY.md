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
