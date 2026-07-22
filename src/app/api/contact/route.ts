import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

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

function buildMailParts(body: ContactPayload, name: string, email: string, phone: string, message: string) {
  const subject = `[Restor-PC] ${body.type ?? "contact"} — ${name}`;
  const text = [
    `Nom : ${name}`,
    `Email : ${email}`,
    `Téléphone : ${phone}`,
    `Type : ${body.type ?? ""}`,
    `Service : ${body.service ?? ""}`,
    `Mode : ${body.mode ?? ""}`,
    `Commune : ${body.city ?? ""}`,
    `Urgence : ${body.urgency ?? ""}`,
    "",
    message,
  ].join("\n");

  return { subject, text };
}

async function sendWithResend(opts: {
  subject: string;
  text: string;
  replyTo: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || siteConfig.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Restor-PC <onboarding@resend.dev>";

  if (!apiKey) return false;

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
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[Restor-PC] Resend error", res.status, detail);
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, message: "Demande reçue." });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ error: "Consentement requis." }, { status: 400 });
  }

  const { subject, text } = buildMailParts(body, name, email, phone, message);

  console.info("[Restor-PC] Nouvelle demande de contact", {
    name,
    email,
    phone,
    type: body.type,
    service: body.service,
    mode: body.mode,
    city: body.city,
    urgency: body.urgency,
    messageLength: message.length,
    at: new Date().toISOString(),
  });

  let delivered = false;
  try {
    delivered = await sendWithResend({ subject, text, replyTo: email });
  } catch (err) {
    console.error("[Restor-PC] Envoi email échoué", err);
  }

  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  return NextResponse.json({
    ok: true,
    delivered,
    message: delivered
      ? "Demande reçue. Nous vous recontactons rapidement."
      : "Demande enregistrée. Vous pouvez aussi nous écrire directement.",
    mailto: delivered ? undefined : mailto,
  });
}
