# Plan de migration — authentification administrateur

> **Statut :** préparation uniquement (branche maintenance).  
> **Ne pas exécuter** la bascule HMAC → Supabase sans validation explicite.

## Objectif

Remplacer progressivement le login atelier par secret (`ATELIER_SECRET` + cookie HMAC)
par **Supabase Auth + `user_roles`**, sans risque de verrouillage administrateur.

Le système HMAC **reste actif** jusqu’à la fin de l’étape 8.

---

## État actuel (post PR #23)

| Couche | Mécanisme |
|---|---|
| Pages `/admin`, `/admin/licences`, `/admin/livraison` | `isAtelierAuthed()` (cookie HMAC) |
| Pages `/atelier/*` | idem |
| API `/api/atelier/*` | `requireTechnician()` = HMAC **ou** rôle `technician`/`admin` |
| Cookie | `restorpc_atelier_session` = token opaque `v1.exp.nonce.sig` |
| Prod | `ATELIER_SESSION_SECRET` obligatoire (pas de fallback sur le mot de passe) |

Helpers déjà présents : `src/lib/auth/roles.ts` (`requireAuthenticatedUser`, `getUserRole`, `requireTechnician`, `requireAdmin`).

---

## Migration progressive (9 étapes)

### 1. Créer ou confirmer le compte Supabase administrateur

- Créer un utilisateur Auth (email magique / Google) sur le projet Supabase **cible**.
- Noter l’UUID `auth.users.id`.
- Vérifier la connexion sur `/compte` (session cookie Supabase).

### 2. Attribuer le rôle admin dans `user_roles`

```sql
insert into public.user_roles (user_id, role)
values ('<uuid-auth-users>', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Rôles prévus : `customer` | `technician` | `admin`.

### 3. Tester `requireTechnician` et `requireAdmin`

- Avec session Supabase admin (sans cookie HMAC) : appels `GET /api/atelier/licenses` → 200.
- Sans session ni HMAC → 401/403.
- Avec HMAC seul (compte Supabase absent) → encore 200 (fallback transition).

### 4. Migrer les pages `/admin` vers la session Supabase

Fichiers concernés (à modifier dans une **PR dédiée**, pas celle-ci) :

- `src/app/admin/page.tsx`
- `src/app/admin/licences/page.tsx`
- `src/app/admin/livraison/page.tsx`
- `src/app/atelier/page.tsx`
- `src/app/atelier/licences/page.tsx`
- `src/components/admin/AdminHome.tsx` (login UI)

Comportement cible des pages :

1. Si `requireAdmin` / rôle technician OK via Supabase → dashboard.
2. Sinon si HMAC OK → dashboard (secours).
3. Sinon → écran de connexion (Supabase Auth prioritaire + lien « accès atelier legacy » optionnel).

### 5. Conserver temporairement HMAC comme accès de secours

Ne pas supprimer :

- `src/lib/atelier-auth.ts`
- `src/app/api/atelier/auth/route.ts`
- le fallback HMAC dans `requireTechnician` (tant que `ATELIER_HMAC_FALLBACK` ≠ false)

**Important (Phase 2 code) :** `requireAdmin()` n’accepte **plus** la session HMAC.
Seul un utilisateur Supabase avec `user_roles.role = 'admin'` convient.

### 6. Variable de désactivation du fallback

Proposer (sans l’activer en prod tant que non validé) :

```bash
# true (défaut) = HMAC encore accepté pour requireTechnician
# false = seules les sessions Supabase + user_roles (technician/admin)
ATELIER_HMAC_FALLBACK=true
```

`requireAdmin` ignore toujours HMAC (rôles Supabase uniquement).

À brancher dans `src/lib/auth/roles.ts` et éventuellement masquer le formulaire secret.

### 7. Tester le compte admin

Checklist manuelle :

- [ ] Login Supabase → `/admin` accessible
- [ ] Licences : liste, filtre, pagination, création, révocation
- [ ] Livraison manuelle
- [ ] Logout Supabase coupe l’accès (HMAC désactivé ou cookie atelier absent)
- [ ] Second admin / technician créé et testé
- [ ] Rate-limit login atelier toujours OK si HMAC encore visible

### 8. Désactiver le fallback HMAC

1. `ATELIER_HMAC_FALLBACK=false` (ou retirer le secret du formulaire).
2. Surveiller logs `admin.login.*` / 403.
3. Fenêtre de observation ≥ 7 jours recommandée.

### 9. Retirer le code obsolète (PR séparée)

Après validation explicite :

- supprimer login secret UI ;
- supprimer cookie HMAC + `ATELIER_SECRET` / `ATELIER_SESSION_SECRET` ;
- nettoyer docs / `.env.example` ;
- tests E2E basés sur mocks Supabase session au lieu du secret.

---

## Routes concernées

| Route | Auth aujourd’hui | Cible |
|---|---|---|
| `/admin` | HMAC page | Supabase (+ HMAC secours) |
| `/admin/licences` | HMAC redirect | idem |
| `/admin/livraison` | HMAC redirect | idem |
| `/atelier/*` | HMAC | idem |
| `/api/atelier/auth` | secret → cookie | déprécié puis retiré |
| `/api/atelier/licenses` | `requireTechnician` | Supabase roles only |
| `/api/atelier/fulfill` | `requireTechnician` | idem |
| `/auth/callback` | OAuth code exchange | inchangé (déjà requis) |

---

## Risques de verrouillage administrateur

| Risque | Mitigation |
|---|---|
| UUID / rôle mal saisi | Tester API avant de couper HMAC |
| Session Supabase expirée | Middleware sur `/admin` + `/compte` |
| Perte accès email OAuth | Second compte admin + HMAC secours |
| `ATELIER_HMAC_FALLBACK=false` trop tôt | Rollback env immédiat |
| Suppression code trop tôt | PR séparée après observation |

---

## Procédure de retour arrière

1. Remettre `ATELIER_HMAC_FALLBACK=true` (ou redeployer l’image précédente).
2. Vérifier `ATELIER_SECRET` + `ATELIER_SESSION_SECRET` présents sur le NAS.
3. Se reconnecter via `/admin` (formulaire secret).
4. Ne **pas** supprimer les lignes `user_roles` (réversibilité).

Le rollback SQL de `user_roles` n’est **pas** nécessaire pour rétablir HMAC.

---

## Tests nécessaires (avant bascule)

- Unit : `requireTechnician` avec mock user + rôle / sans rôle / HMAC.
- Integration : refus API sans auth (déjà couvert E2E partiellement).
- E2E : login admin HMAC (actuel) + scénario futur session Supabase mockée.
- Manuel staging Docker Synology.

---

## Actions hors périmètre de cette branche

- Aucune modification du flux de connexion admin actif.
- Aucune écriture Supabase distante.
- Aucune suppression HMAC.
