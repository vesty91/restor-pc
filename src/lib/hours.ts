import { siteConfig } from "@/lib/site";

/** Statut d’ouverture approximatif (fuseau Europe/Paris). */
export function getOpenStatus(now = new Date()): {
  open: boolean;
  label: string;
  detail: string;
} {
  const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay(); // 0 = dimanche
  const hour = paris.getHours() + paris.getMinutes() / 60;
  const isOpenDay = siteConfig.openDays.includes(day);
  const open = isOpenDay && hour >= siteConfig.openHour && hour < siteConfig.closeHour;

  if (open) {
    return {
      open: true,
      label: "Ouvert maintenant",
      detail: `Jusqu’à ${siteConfig.closeHour}h · ${siteConfig.city}`,
    };
  }

  if (isOpenDay && hour < siteConfig.openHour) {
    return {
      open: false,
      label: "Fermé",
      detail: `Réouverture à ${siteConfig.openHour}h · ${siteConfig.city}`,
    };
  }

  return {
    open: false,
    label: "Fermé",
    detail: siteConfig.hours,
  };
}
