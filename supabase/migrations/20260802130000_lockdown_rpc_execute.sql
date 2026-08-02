-- Correctif critique : les fonctions SECURITY DEFINER exposées via PostgREST
-- héritaient d'un GRANT EXECUTE direct sur anon/authenticated (privilège par
-- défaut Supabase), que `revoke all ... from public` ne retire pas.
-- Sans ce correctif, n'importe quel appelant non authentifié pouvait :
--   - finaliser une commande arbitraire avec sa propre licence/lien NAS ;
--   - révoquer/altérer des commandes et licences au hasard.

revoke execute on function public.claim_stripe_event(text, text) from anon, authenticated;
revoke execute on function public.claim_tool_order(uuid) from anon, authenticated;
revoke execute on function public.consume_rate_limit(text, integer, integer) from anon, authenticated;
revoke execute on function public.claim_order_revocation(text, text, text) from anon, authenticated;
revoke execute on function public.mark_order_assets_revoked(uuid, text) from anon, authenticated;
revoke execute on function public.finalize_tool_order_fulfillment(uuid, text, text, text, text, integer, uuid) from anon, authenticated;

-- Verrouille aussi par défaut toute future fonction créée dans public :
-- seul service_role obtient EXECUTE automatiquement.
alter default privileges in schema public
  revoke execute on functions from anon, authenticated;
