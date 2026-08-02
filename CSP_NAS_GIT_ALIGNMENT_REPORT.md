# Rapport d’alignement CSP — NAS / Git / HTTP

Date : 2026-07-29  
Projet : Restor-PC  
Auteur audit : agent DevOps (exécution réelle des contrôles)

> **Mise à jour domaine (2026-07-30)** : l’URL canonique de production est désormais
> **`https://www.restor-pc.fr`**. `https://atelier.restor-pc.fr` redirige en 301 vers www.
> Les mesures HTTP de la section 6 ci-dessous reflètent l’état **avant** cette migration
> (historique d’audit CSP) et ne doivent plus être utilisées comme source de vérité SEO.

## 1. SHA GitHub `master`

`b363df4` — `fix(docker): pass public environment variables at build time`

- `Content-Security-Policy-Report-Only` : **absent**
- `Reporting-Endpoints` : **absent**
- `src/app/api/csp-report/route.ts` : **absent**
- Commit `2097bf0` : **non présent** sur GitHub (`gh api …/commits/2097bf0` → 422)
- Branche distante `security/csp-hardening` : **absente**
- PR CSP préexistante : **aucune**

## 2. SHA local

| Réf                                   | SHA       | Notes                                        |
| ------------------------------------- | --------- | -------------------------------------------- |
| `master` (avant travail)              | `b363df4` | working tree clean, = `origin/master`        |
| `security/csp-hardening` (locale)     | `2097bf0` | uniquement locale ; 3 fichiers CSP           |
| `security/csp-hardening-sync` (créée) | `6b055b7` | cherry-pick propre de `2097bf0` sur `master` |

`git merge-base --is-ancestor 2097bf0 master` → **non** (exit 1).  
Pas de cherry-pick équivalent déjà dans `master` (blobs `next.config.ts` différents ; route absente).

## 3. SHA dépôt NAS

Chemin : `/volume1/vesty/restor-pc`

| Contrôle                                                    | Résultat                                   |
| ----------------------------------------------------------- | ------------------------------------------ |
| `git rev-parse HEAD`                                        | `b363df4cbb489880bb233742711cdb69092da79b` |
| Working tree                                                | clean (`git status --short` vide)          |
| Ancêtre `2097bf0`                                           | **non** (objet inconnu sur le NAS)         |
| `Content-Security-Policy-Report-Only` dans `next.config.ts` | **absent**                                 |
| `src/app/api/csp-report/route.ts`                           | **absent**                                 |
| `tests/unit/csp-report.test.ts`                             | **absent**                                 |
| Diff non commité CSP                                        | **aucun**                                  |

## 4. Image Docker active

| Champ             | Valeur                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Conteneur         | `restor-pc`                                                                     |
| Image ID          | `sha256:273fd297edc08e5d7a2df45a5519e08f1e8ac10295c95445a1b2ad39b74a1c07`       |
| Tag local compose | `restor-pc-restor-pc`                                                           |
| Origine build     | `docker compose build` depuis dépôt NAS `@ b363df4` (déploiement du 2026-07-29) |

Contrôles conteneur (sans restart) :

- `grep Report-Only` / `csp-report` dans `/app/server.js` : **vide**
- `find … *csp-report*` : **aucune route compilée**
- Seule la CSP **enforcement** (présente via headers Next de `b363df4`) est active

## 5. Présence du commit `2097bf0`

| Cible                          | Présent ?                                 |
| ------------------------------ | ----------------------------------------- |
| Local `security/csp-hardening` | oui                                       |
| Local / GitHub `master`        | **non**                                   |
| GitHub remote (tout objet)     | **non**                                   |
| NAS                            | **non**                                   |
| Conteneur                      | **non** (image construite sans ce commit) |

Équivalent poussé : `6b055b7` sur `security/csp-hardening-sync` (même contenu, nouveau SHA après cherry-pick).

## 6. Présence des fichiers CSP par cible

| Fichier                                                | master / NAS / image | branche CSP sync |
| ------------------------------------------------------ | -------------------- | ---------------- |
| `next.config.ts` (+ Report-Only + Reporting-Endpoints) | non                  | oui              |
| `src/app/api/csp-report/route.ts`                      | non                  | oui              |
| `tests/unit/csp-report.test.ts`                        | non                  | oui              |

## 7. Résultat des en-têtes HTTP

~~Site Next.js de production pour ce projet : `https://atelier.restor-pc.fr`~~  
~~(`www.restor-pc.fr` = autre site / static Web Station, hors scope Docker Restor-PC)~~  
**Obsolète** — depuis 2026-07-30 : production = **`https://www.restor-pc.fr`** (Docker Restor-PC derrière nginx DSM).

### `https://atelier.restor-pc.fr/`

| Header                                  | Statut                 |
| --------------------------------------- | ---------------------- |
| `Content-Security-Policy` (enforcement) | **présent** (inchangé) |
| `Content-Security-Policy-Report-Only`   | **absent**             |
| `Reporting-Endpoints`                   | **absent**             |

### `https://www.restor-pc.fr/`

| Header                                | Statut |
| ------------------------------------- | ------ |
| `Content-Security-Policy`             | absent |
| `Content-Security-Policy-Report-Only` | absent |
| `Reporting-Endpoints`                 | absent |

## 8. Résultat de `/api/csp-report`

| URL                                           | Méthode                | Résultat                             |
| --------------------------------------------- | ---------------------- | ------------------------------------ |
| `https://atelier.restor-pc.fr/api/csp-report` | GET                    | **404** (page Next HTML)             |
| `https://atelier.restor-pc.fr/api/csp-report` | POST (rapport factice) | **404** (pas de route)               |
| `https://www.restor-pc.fr/api/csp-report`     | GET/POST               | **200** HTML static (pas l’API Next) |

Aucun secret / stack exposé dans les réponses testées.

## 9. Origine réelle du code CSP en production

**La CSP Report-Only n’est pas active en production.**

Ce qui a été pris pour « CSP déjà sur le NAS » est la **CSP enforcement** déjà présente dans `next.config.ts` sur `master` (`b363df4`), renvoyée par le conteneur.

La Report-Only + collector existent uniquement :

1. en local sur `security/csp-hardening` (`2097bf0`) ;
2. désormais sur GitHub via PR `#26` (`6b055b7`).

Aucun fichier CSP copié manuellement sur le NAS. Aucune image construite depuis la branche CSP.

## 10. Écart détecté

**Cas D (affiné) + écart Git :**

- Prod = GitHub `master` = NAS = `b363df4` : **cohérents entre eux**
- Report-Only : **absente partout en prod**, présente seulement en branche locale / PR
- Perception initiale « CSP déjà sur NAS » : **incorrecte** pour Report-Only

## 11. Correction Git effectuée

Oui, sans toucher la production :

1. `git checkout -b security/csp-hardening-sync` depuis `master`
2. `git cherry-pick 2097bf0` → `6b055b7` (sans conflit)
3. Diff vs `master` : uniquement les 3 fichiers CSP attendus
4. Push : `origin/security/csp-hardening-sync`
5. PR créée (non mergée)

## 12. PR créée

- URL : https://github.com/vesty91/restor-pc/pull/26
- Titre : `feat(security): CSP Report-Only et endpoint de collecte`
- Merge automatique : **non**

## 13. Déploiement effectué

**NON** (conforme aux règles : pas de rebuild, pas de recreate, pas de restart).

## 14. Actions manuelles restantes

1. Review + merge de la PR `#26` (humain).
2. Sur le NAS, **après merge** et validation explicite :
   ```bash
   cd /volume1/vesty/restor-pc
   git pull origin master
   docker compose build --no-cache
   docker compose up -d
   ```
3. Revérifier HTTP :
   - présence de `Content-Security-Policy-Report-Only`
   - présence de `Reporting-Endpoints`
   - conservation de `Content-Security-Policy` (enforcement)
   - `POST /api/csp-report` → `204` (pas 404)
4. Optionnel : supprimer la branche locale obsolète `security/csp-hardening` après merge, ou la laisser.

## 15. Procédure de retour arrière

Si Report-Only pose problème **après** un futur déploiement :

1. Revenir au commit précédent sur le NAS (`git checkout b363df4` ou `git revert` du merge CSP).
2. `docker compose build && docker compose up -d`.
3. Ou retirer uniquement les headers Report-Only / Reporting-Endpoints dans `next.config.ts` et la route `/api/csp-report`, sans toucher l’enforcement.
4. L’enforcement actuelle (`Content-Security-Policy`) n’est **pas** introduite par cette PR ; un rollback CSP Report-Only ne doit pas la supprimer.

---

## Validation locale (branche PR)

| Commande                   | Résultat                                       |
| -------------------------- | ---------------------------------------------- |
| `npm ci`                   | OK (après unlock EPERM next-swc)               |
| `npm run typecheck`        | OK                                             |
| `npm run lint`             | OK                                             |
| `npm run test:unit`        | OK                                             |
| `npm run test:integration` | OK                                             |
| `npm run build`            | OK — `.next/server/app/api/csp-report` présent |
| `npm run test:e2e:ci`      | 31 passed / 1 failed (`admin.spec` — hors CSP) |

## Conclusion

- **Cas** : D (Report-Only absente du conteneur) + correction Git via PR.
- GitHub / local master / NAS / image : alignés sur `b363df4` **sans** Report-Only.
- PR `#26` aligne le code CSP sur GitHub ; **aucun déploiement**.
- CSP enforcement inchangée ; Report-Only reste à activer uniquement après merge + rebuild NAS validé.
