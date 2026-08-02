# Validation métier — passage en Stripe Live (Restor-PC)

## Objet

Ce document formalise la décision **métier** (non technique) d'activer les
paiements réels (`ALLOW_STRIPE_LIVE=true`). Il doit être relu et signé par
le porteur du projet **après** avoir pris connaissance des points ci-dessous,
en particulier les risques résiduels qui restent de sa responsabilité.

Il complète `docs/PRODUCTION_CHECKLIST.md` (checklist technique détaillée).

---

## 1. Ce qui a été validé techniquement

| Élément                                                               | Statut                                               | Preuve                                                                                                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkout → webhook → email → licence + lien NAS                       | ✅ Testé en conditions réelles (Stripe Test)         | Commande réelle passée le 2026-08-02 : mail reçu, licence active, lien NAS fonctionnel                                                                            |
| Remboursement / litige → révocation licence + lien NAS                | ✅ Testé en conditions réelles                       | Même session du 2026-08-02                                                                                                                                        |
| Remboursement hors-ordre (refund avant webhook de fulfillment)        | ✅ Couvert par tests automatisés + harness SQL isolé | `tests/integration/stripe-webhook.test.ts`, `scripts/sql-harness-race-assertions.sql` — **non rejoué en conditions réelles Stripe Test** (voir risques résiduels) |
| Double webhook Stripe (idempotence)                                   | ✅ Testé                                             | `tests/integration/stripe-webhook.test.ts`, CI verte                                                                                                              |
| Échec d'envoi email (pas de recréation de licence)                    | ✅ Testé                                             | `tests/unit`/`tests/integration` fulfillment-flow, CI verte                                                                                                       |
| RLS `tool_orders` / `script_licenses` (`user_id = auth.uid()` strict) | ✅ Vérifié                                           | Migrations + harness SQL                                                                                                                                          |
| RPC `SECURITY DEFINER` réservées à `service_role`                     | ✅ Corrigé et vérifié                                | Migration `20260802130000_lockdown_rpc_execute.sql`, advisors Supabase relus                                                                                      |
| Backfill `user_id` sur commandes existantes                           | ✅ Fait                                              | 8/8 commandes, 2026-08-02                                                                                                                                         |
| CI (quality, unit, integration, build, e2e)                           | ✅ Verte                                             | Branch protection activée sur `master`                                                                                                                            |
| Accessibilité (contrastes Axe, hors canvas WebGL)                     | ✅ Vérifié                                           | `tests/e2e/a11y.spec.ts`, CI verte                                                                                                                                |
| Toasts Sonner (contact + licences, succès/erreur)                     | ✅ Vérifié                                           | `tests/e2e/smoke.spec.ts`, `tests/e2e/admin.spec.ts`, CI verte                                                                                                    |
| Mentions légales / CGV (éditeur, hébergeur, responsabilité outils)    | ✅ Contenu à jour                                    | `src/app/mentions-legales`, `src/app/conditions-vente`                                                                                                            |
| Secrets hors dépôt Git                                                | ✅ Vérifié                                           | Historique git audité 2026-08-02, seuls les `.env.example` sont trackés                                                                                           |
| `npm audit`                                                           | ✅ Lu, pas de correctif forcé aveugle                | 2 `high` (`sharp`/`postcss`, transitifs Next.js) documentés dans `SECURITY.md`                                                                                    |

---

## 2. Risques résiduels — décision du porteur du projet

Ces points **ne peuvent pas être résolus par le code** ou nécessitent une
décision/action métier explicite. Le passage en Live signifie que ces
risques sont **sciemment acceptés** (ou traités avant, au choix du porteur).

### 2.1 Médiateur de la consommation — obligation légale non remplie

Aucun médiateur de la consommation n'est actuellement souscrit
(`siteConfig.legal.mediator` = `null`, volontairement — le code n'invente
aucune coordonnée). Pour toute vente en ligne à des consommateurs en France,
la loi impose de proposer un dispositif de médiation (art. L.611-1 et s. du
Code de la consommation).

**Action requise avant Live** (recommandé) **ou en parallèle avec
tolérance courte** (au choix du porteur, à ses risques) :
souscrire un médiateur (ex. CM2C, SACM, ou médiateur sectoriel), puis
renseigner `NEXT_PUBLIC_CONSUMER_MEDIATOR_NAME/WEBSITE/ADDRESS` dans
`.env.local`.

### 2.2 Sauvegarde de la base — résolu (2026-08-02), à surveiller dans la durée

L'organisation Supabase reste sur le **plan Free** : pas de backup quotidien
ni de PITR gérés par Supabase (réservés au plan Pro). En compensation,
`npm run backup:db` est configuré, testé contre la vraie base de production
(51 Ko, toutes les tables), et planifié via le Planificateur de tâches
Windows (tous les jours à 3h00 — déclenchement réel vérifié, succès).
Voir `docs/BACKUP_RESTORE.md`.

Risque résiduel : cette sauvegarde dépend du PC restant allumé/disponible
à 3h du matin, et n'a pas de vérification automatique d'échec (pas
d'alerte si le job ne tourne pas). À surveiller manuellement de temps en
temps (`logs/backup-db.log`, dossier `backups/`).

### 2.3 Refund hors-ordre — non rejoué en conditions Stripe réelles

La logique (refund reçu avant que le fulfillment ait eu le temps de
s'exécuter) est validée par tests automatisés et harness SQL isolé, mais
n'a pas été reproduite manuellement avec un vrai paiement Stripe Test +
remboursement immédiat. Risque jugé faible (couverture logique forte) mais
non nul.

### 2.4 Assurance / responsabilité professionnelle

Les CGV excluent la responsabilité de Restor-PC pour l'usage des outils
logiciels vendus. Le porteur du projet reste seul juge de l'opportunité de
souscrire une assurance RC Pro complémentaire — hors périmètre technique.

---

## 3. Déclaration de validation métier

Je soussigné, porteur du projet Restor-PC, atteste avoir pris connaissance :

- des éléments validés techniquement (section 1) ;
- des risques résiduels listés (section 2), en particulier l'absence de
  médiateur de la consommation souscrit et l'absence de sauvegarde
  automatique de la base tant que le plan Supabase reste Free ;

et **décide en connaissance de cause** d'activer (ou non) les paiements
réels.

|           |                                                                             |
| --------- | --------------------------------------------------------------------------- |
| Décision  | ☐ Go Live maintenant ☐ Go Live après correction des points 2.1/2.2 ☐ Report |
| Nom       | ___________________________                                                 |
| Date      | ___________________________                                                 |
| Signature | ___________________________                                                 |

Une fois signé, passer `ALLOW_STRIPE_LIVE=true`, configurer les clés Stripe
Live + webhook Live, et activer le monitoring d'alertes (dernier point de
`docs/PRODUCTION_CHECKLIST.md`).
