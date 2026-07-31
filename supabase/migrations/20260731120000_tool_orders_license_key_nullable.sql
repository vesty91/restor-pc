-- Réservation commande pending : license_key rempli seulement après génération.
alter table public.tool_orders
  alter column license_key drop not null;
