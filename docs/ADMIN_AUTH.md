# Authentification administrateur / atelier

## Modèle de rôles

| Identité                                   | Privilège                                                     |
| ------------------------------------------ | ------------------------------------------------------------- |
| Client Supabase (`customer` ou sans ligne) | Compte boutique uniquement                                    |
| Session atelier HMAC                       | **Technicien transitoire** (si `ATELIER_HMAC_FALLBACK` actif) |
| Rôle Supabase `technician`                 | Opérations atelier / licences                                 |
| Rôle Supabase `admin`                      | Administration (jamais via HMAC seul)                         |

Table `user_roles` (`customer` | `technician` | `admin`), RLS : lecture du
propre rôle ; écriture **service role uniquement** (pas de self-promotion).

## Ancien système (transition)

- Cookie `restorpc_atelier_session` : token HMAC opaque `v1.exp.nonce.sig`.
- **Jamais** `ATELIER_SECRET` dans le cookie.
- En production : `ATELIER_SESSION_SECRET` **obligatoire**.
- Rate-limit login atelier (`mode: auth`).
- Deprecated : préférer Supabase Auth + `user_roles`.

## Helpers

- `requireAuthenticatedUser()` — session Supabase
- `requireTechnician()` — HMAC (si fallback) **ou** rôle `technician`/`admin`
- `requireAdmin()` — **uniquement** rôle Supabase `admin` (HMAC refusé)

Les routes `/api/atelier/*` passent par `requireTechnician()`.

Les pages `/admin` conservent encore l’UI via cookie HMAC (accès atelier /
technicien) : ce n’est **pas** équivalent à `requireAdmin()`.

## Variable de bascule

```env
# true (défaut) = HMAC accepté pour requireTechnician
# false = uniquement Supabase + user_roles (après avoir créé un admin)
ATELIER_HMAC_FALLBACK=true
```

Ne passer à `false` en production qu’après l’étape SQL ci-dessous et des tests
API avec un compte admin Supabase.

## Attribuer le rôle admin (manuel, hors Git)

1. Créer / identifier l’utilisateur dans Authentication → Users (UUID).
2. Exécuter via SQL Editor (service role), **en remplaçant le placeholder** :

```sql
-- Remplacer :UUID_AUTH_USER: par l’UUID auth.users.id (ne pas committer d’UUID réel)
insert into public.user_roles (user_id, role)
values (':UUID_AUTH_USER:'::uuid, 'admin')
on conflict (user_id) do update set role = excluded.role;
```

3. Se connecter via OAuth / magie sur `/compte`, puis vérifier
   `GET /api/atelier/licenses` **sans** cookie HMAC → 200.
4. Vérifier qu’une session HMAC seule ne passe **pas** `requireAdmin`
   (déjà garanti côté code).

Technicien :

```sql
insert into public.user_roles (user_id, role)
values (':UUID_AUTH_USER:'::uuid, 'technician')
on conflict (user_id) do update set role = excluded.role;
```

## Suppression prévue du login secret

1. Au moins un compte `admin` (et éventuellement `technician`) en `user_roles`.
2. `ATELIER_HMAC_FALLBACK=false` + observation.
3. Retirer le formulaire secret / code HMAC (PR séparée).

## Logs

`admin.login.success` / `admin.login.failed` / accès refusés — jamais le mot de passe.
