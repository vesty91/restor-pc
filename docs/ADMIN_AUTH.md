# Authentification administrateur / atelier

## Ancien système (transition)

- Cookie `restorpc_atelier_session` : token HMAC opaque `v1.exp.nonce.sig`.
- **Jamais** `ATELIER_SECRET` dans le cookie.
- En production : `ATELIER_SESSION_SECRET` **obligatoire** (plus de fallback sur le mot de passe).
- Rate-limit login atelier.
- Marqué **deprecated** : préférer Supabase Auth + `user_roles`.

## Cible

Table `user_roles` (`customer` | `technician` | `admin`).

Helpers :

- `requireAuthenticatedUser()`
- `requireTechnician()` — session HMAC **ou** rôle technician/admin
- `requireAdmin()` — session HMAC **ou** rôle admin

Les routes `/api/atelier/*` passent par `requireTechnician()`.

## Créer un admin

Via SQL service role (exemple) :

```sql
insert into public.user_roles (user_id, role)
values ('<uuid-auth-users>', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

L’utilisateur se connecte avec Supabase Auth (Google / email) puis accède à l’admin.

## Suppression prévue du login secret

1. Créer au moins un compte `admin` / `technician`.
2. Mettre `ATELIER_SECRET` hors service (désactiver le formulaire).
3. Supprimer le fallback HMAC dans `requireTechnician`.

## Logs

`admin.login.success` / `admin.login.failed` / accès refusés — jamais le mot de passe.
