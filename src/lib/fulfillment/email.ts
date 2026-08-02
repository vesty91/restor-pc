import { siteConfig } from "@/lib/site";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type PurchaseEmailResult = {
  id: string;
};

export async function sendPurchaseEmail(opts: {
  to: string;
  toolTitle: string;
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
}): Promise<PurchaseEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY / CONTACT_FROM_EMAIL manquants");
  }

  const replyTo = (process.env.CONTACT_TO_EMAIL || siteConfig.email).trim();
  const bccRaw = process.env.PURCHASE_EMAIL_BCC?.trim() || replyTo;
  const bcc = [
    ...new Set(
      bccRaw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].filter((e) => e !== opts.to.trim().toLowerCase());

  const subject = `Restor-PC - ${opts.toolTitle} - licence et telechargement`;
  const html = `<!DOCTYPE html><html lang="fr"><body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#1a1a1a">
  <h1 style="font-size:1.25rem">Merci pour votre achat</h1>
  <p>Voici vos acces pour <strong>${escapeHtml(opts.toolTitle)}</strong>.</p>
  <p style="color:#555">Vous les retrouvez aussi dans votre espace : <a href="${escapeHtml(siteConfig.url)}/compte">${escapeHtml(siteConfig.url)}/compte</a></p>
  <h2 style="font-size:1.05rem">1. Telechargement (1 fois)</h2>
  <p><a href="${escapeHtml(opts.downloadUrl)}">${escapeHtml(opts.downloadUrl)}</a></p>
  <p>Mot de passe : <code style="font-size:1.1rem">${escapeHtml(opts.downloadPassword)}</code></p>
  <p style="color:#555">Limite : ${opts.expireTimes} telechargement(s). Ne partagez pas ce lien.</p>
  <h2 style="font-size:1.05rem">2. Cle de licence (1 PC)</h2>
  <p style="font-size:1.2rem;letter-spacing:0.04em"><code>${escapeHtml(opts.licenseKey)}</code></p>
  <p style="color:#555">La cle s'active sur le premier PC utilise.</p>
  <h2 style="font-size:1.05rem">3. Installation</h2>
  <ol>
    <li>Telechargez et dezippez l'outil.</li>
    <li>Lancez l'EXE (admin si demande).</li>
    <li>Saisissez la cle (Internet requis la 1re fois).</li>
  </ol>
  <p>Besoin d'aide ? ${escapeHtml(siteConfig.email)} · ${escapeHtml(siteConfig.phone)}</p>
  <p style="color:#888;font-size:0.85rem">Restor-PC · ${escapeHtml(siteConfig.address)}</p>
</body></html>`;

  const text = [
    `Merci pour votre achat - ${opts.toolTitle}`,
    "",
    `Espace client: ${siteConfig.url}/compte`,
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

  const payload: Record<string, unknown> = {
    from,
    to: [opts.to],
    reply_to: replyTo,
    subject,
    html,
    text,
  };
  if (bcc.length > 0) payload.bcc = bcc;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(`Resend HTTP ${res.status}: ${bodyText.slice(0, 400)}`);
  }

  let id = "";
  try {
    id = String((JSON.parse(bodyText) as { id?: string }).id || "");
  } catch {
    /* ignore */
  }
  if (!id) throw new Error("Resend: reponse sans id");
  return { id };
}
