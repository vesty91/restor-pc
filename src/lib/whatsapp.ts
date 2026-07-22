import { siteConfig } from "@/lib/site";

export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${siteConfig.whatsapp}?text=${text}`;
}

export function buildContactWhatsApp(opts: {
  name?: string;
  type?: string;
  service?: string;
  mode?: string;
  urgency?: string;
  city?: string;
  message?: string;
}): string {
  const lines = [
    "Bonjour Restor-PC,",
    "",
    opts.name ? `Je suis ${opts.name}.` : "",
    opts.type ? `Demande : ${opts.type}` : "",
    opts.service ? `Service : ${opts.service}` : "",
    opts.mode ? `Mode : ${opts.mode}` : "",
    opts.urgency ? `Urgence : ${opts.urgency}` : "",
    opts.city ? `Commune : ${opts.city}` : "",
    "",
    opts.message || "J’ai besoin d’aide pour mon PC.",
  ].filter(Boolean);

  return buildWhatsAppUrl(lines.join("\n"));
}
