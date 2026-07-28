import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";
import { enforceRateLimit } from "@/lib/security/rate-limit";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  type?: string;
  service?: string;
  mode?: string;
  urgency?: string;
  message?: string;
  consent?: boolean;
  company?: string;
};

const MAX_NAME = 120;
const MAX_EMAIL = 160;
const MAX_PHONE = 40;
const MAX_CITY = 80;
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 10;

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+()\s.-]/g, "").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const typeLabels: Record<string, string> = {
  devis: "Demande de devis",
  urgence: "Urgence / panne",
  config: "Devis configuration PC",
  serenite: "Pack sérénité",
  maintenance: "Contrat maintenance",
  autre: "Autre",
};

const urgencyLabels: Record<string, string> = {
  normal: "Sous 48 h",
  today: "Aujourd’hui si possible",
  asap: "Dès que possible",
};

function isUrgentRequest(type?: string, urgency?: string): boolean {
  return type === "urgence" || urgency === "today" || urgency === "asap";
}

function buildMailParts(
  body: ContactPayload,
  name: string,
  email: string,
  phone: string,
  message: string
) {
  const typeKey = body.type ?? "devis";
  const urgencyKey = body.urgency ?? "normal";
  const typeLabel = typeLabels[typeKey] ?? typeKey;
  const urgencyLabel = urgencyLabels[urgencyKey] ?? urgencyKey;
  const urgent = isUrgentRequest(typeKey, urgencyKey);

  const subject = urgent
    ? `[Restor-PC] ⚠ URGENCE — ${name}`
    : `[Restor-PC] ${typeLabel} — ${name}`;

  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Nom", value: name },
    { label: "Email", value: email },
    { label: "Téléphone", value: phone },
    { label: "Type", value: typeLabel, highlight: typeKey === "urgence" },
    { label: "Service", value: body.service ?? "" },
    { label: "Mode", value: body.mode ?? "" },
    { label: "Commune", value: body.city ?? "" },
    {
      label: "Urgence",
      value: urgencyLabel,
      highlight: urgencyKey === "today" || urgencyKey === "asap",
    },
  ];

  const text = [
    ...rows.map((r) => `${r.label} : ${r.value}`),
    "",
    message,
  ].join("\n");

  const htmlRows = rows
    .map((r) => {
      const valueStyle = r.highlight
        ? "padding:4px 0;color:#dc2626;font-weight:700;"
        : "padding:4px 0;color:#0f172a;";
      return `<tr>
  <td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top;">${escapeHtml(r.label)}</td>
  <td style="${valueStyle}">${escapeHtml(r.value || "—")}</td>
</tr>`;
    })
    .join("");

  const banner = urgent
    ? `<p style="margin:0 0 16px;padding:10px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#dc2626;font-weight:700;">⚠ Demande urgente — rappel prioritaire</p>`
    : "";

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#0f172a;">
${banner}
<table style="border-collapse:collapse;margin-bottom:20px;">${htmlRows}</table>
<p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Message</p>
<p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
</body></html>`;

  return { subject, text, html };
}

async function sendWithResend(opts: {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || siteConfig.email;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) return false;

  // Refuse the Resend sandbox sender in production-like setups
  if (from.includes("resend.dev") && process.env.NODE_ENV === "production") {
    console.error("[Restor-PC] CONTACT_FROM_EMAIL must use a verified domain");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    console.error("[Restor-PC] Resend error", res.status);
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit({
    request,
    scope: "contact",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Trop de demandes. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
    );
  }

  // Honeypot : réponse neutre sans envoi
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, delivered: true });
  }

  const name = (body.name?.trim() ?? "").slice(0, MAX_NAME);
  const email = (body.email?.trim() ?? "").slice(0, MAX_EMAIL).toLowerCase();
  const phone = sanitizePhone(body.phone ?? "").slice(0, MAX_PHONE);
  const city = (body.city?.trim() ?? "").slice(0, MAX_CITY);
  const message = (body.message?.trim() ?? "").slice(0, MAX_MESSAGE);

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      { ok: false, error: "Champs obligatoires manquants." },
      { status: 400 }
    );
  }

  if (message.length < MIN_MESSAGE) {
    return NextResponse.json(
      { ok: false, error: "Message trop court." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Email invalide." },
      { status: 400 }
    );
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return NextResponse.json(
      { ok: false, error: "Téléphone invalide." },
      { status: 400 }
    );
  }

  if (!body.consent) {
    return NextResponse.json(
      { ok: false, error: "Consentement requis." },
      { status: 400 }
    );
  }

  const allowedTypes = new Set([
    "devis",
    "urgence",
    "config",
    "serenite",
    "maintenance",
    "autre",
  ]);
  if (body.type && !allowedTypes.has(body.type)) {
    return NextResponse.json(
      { ok: false, error: "Type de demande invalide." },
      { status: 400 }
    );
  }

  const payload: ContactPayload = { ...body, city };
  const { subject, text, html } = buildMailParts(
    payload,
    name,
    email,
    phone,
    message
  );

  // Logs sans données personnelles
  console.info("[Restor-PC] Contact request", {
    type: body.type ?? "devis",
    service: body.service || null,
    mode: body.mode || null,
    urgency: body.urgency || null,
    hasCity: Boolean(city),
    messageLength: message.length,
    at: new Date().toISOString(),
  });

  let delivered = false;
  try {
    delivered = await sendWithResend({
      subject,
      text,
      html,
      replyTo: email,
    });
  } catch {
    console.error("[Restor-PC] Email send failed");
  }

  if (!delivered) {
    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        error:
          "L’envoi automatique a échoué. Utilisez le lien ci-dessous, WhatsApp ou le téléphone.",
        mailto,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    delivered: true,
    message: "Demande reçue. Nous vous recontactons rapidement.",
  });
}
