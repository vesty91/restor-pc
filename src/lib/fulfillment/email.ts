import { siteConfig } from "@/lib/site";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPurchaseEmail(opts: {
  to: string;
  toolTitle: string;
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY / CONTACT_FROM_EMAIL manquants");
  }

  const subject = `Restor-PC — ${opts.toolTitle} : licence et téléchargement`;
  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#1a1a1a">
  <h1 style="font-size:1.25rem">Merci pour votre achat</h1>
  <p>Voici vos accès pour <strong>${escapeHtml(opts.toolTitle)}</strong>.</p>
  <h2 style="font-size:1.05rem">1. Téléchargement (1 fois)</h2>
  <p><a href="${escapeHtml(opts.downloadUrl)}">${escapeHtml(opts.downloadUrl)}</a></p>
  <p>Mot de passe : <code style="font-size:1.1rem">${escapeHtml(opts.downloadPassword)}</code></p>
  <p style="color:#555">Limite : ${opts.expireTimes} téléchargement(s). Ne partagez pas ce lien.</p>
  <h2 style="font-size:1.05rem">2. Clé de licence (1 PC)</h2>
  <p style="font-size:1.2rem;letter-spacing:0.04em"><code>${escapeHtml(opts.licenseKey)}</code></p>
  <p style="color:#555">La clé s’active sur le premier PC utiliséé. Elle ne fonctionne pas sur une autre machine.</p>
  <h2 style="font-size:1.05rem">3. Installation</h2>
  <ol>
    <li>Téléchargez et dézippez l’outil.</li>
    <li>Lancez l’EXE (admin si demandé).</li>
    <li>Saisissez la clé (Internet requis la 1<sup>re</sup> fois).</li>
  </ol>
  <p>Besoin d’aide ? ${escapeHtml(siteConfig.email)} · ${escapeHtml(siteConfig.phone)}</p>
  <p style="color:#888;font-size:0.85rem">Restor-PC · ${escapeHtml(siteConfig.address)}</p>
</body></html>`;

  const text = [
    `Merci pour votre achat — ${opts.toolTitle}`,
    "",
    "TELECHARGEMENT (1 fois):",
    opts.downloadUrl,
    `Mot de passe: ${opts.downloadPassword}`,
    "",
    "CLE DE LICENCE (1 PC):",
    opts.licenseKey,
    "",
    `Aide: ${siteConfig.email} / ${siteConfig.phone}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
}
