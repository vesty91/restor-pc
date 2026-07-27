"use client";

import { Button } from "@/components/ui/Button";
import { siteConfig, CONFIG_STORAGE_KEY } from "@/lib/site";
import { services } from "@/lib/data/services";
import { buildContactWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { CheckCircle2, MessageCircle, Phone, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useId, useMemo, useState, type ReactNode } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  type: string;
  service: string;
  mode: string;
  urgency: string;
  message: string;
  consent: boolean;
  company: string;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  type: "devis",
  service: "",
  mode: "",
  urgency: "normal",
  message: "",
  consent: false,
  company: "",
};

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

export function ContactForm() {
  const params = useSearchParams();
  const uid = useId();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [configAttached, setConfigAttached] = useState(false);

  useEffect(() => {
    const rawType = params.get("type") ?? "devis";
    // Ancien lien « distance » → devis atelier (plus d’assistance à distance)
    const type = rawType === "distance" ? "devis" : rawType;
    const service =
      params.get("service") === "assistance-distance"
        ? "depannage-informatique"
        : (params.get("service") ?? "");
    const summary = params.get("summary");
    const total = params.get("total");
    const usage = params.get("usage");
    const budget = params.get("budget");
    const mode =
      params.get("mode") === "distance"
        ? "atelier"
        : rawType === "distance"
          ? "atelier"
          : (params.get("mode") ?? "");
    const city = params.get("city") ?? "";
    const urgency = params.get("urgency") ?? "";

    let message = "";
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(CONFIG_STORAGE_KEY);
    } catch {
      stored = null;
    }

    if (stored) {
      message = `Bonjour,\n\nJe souhaite un devis pour la configuration suivante :\n${stored}\n\nCordialement`;
      setConfigAttached(true);
    } else if (summary && type === "config") {
      message = `Bonjour,\n\nJe souhaite un devis pour la configuration suivante :\n${summary}${total ? `\nTotal estimé : ${total} €` : ""}${usage ? `\nUsage : ${usage}` : ""}${budget ? `\nBudget : ${budget}` : ""}\n\nCordialement`;
      setConfigAttached(true);
    } else if (summary) {
      message = `Bonjour,\n\n${decodeURIComponent(summary)}\n\nCordialement`;
    }

    const resolvedType =
      stored || (summary && type === "config") ? "config" : type;
    const resolvedUrgency =
      urgency ||
      (resolvedType === "urgence" ? "asap" : empty.urgency);

    setForm((f) => ({
      ...f,
      type: resolvedType,
      service,
      mode,
      city: city || f.city,
      urgency: resolvedUrgency,
      message: message || f.message,
    }));
  }, [params]);

  const whatsappHref = useMemo(() => {
    const serviceTitle =
      services.find((s) => s.slug === form.service)?.title ?? form.service;
    return buildContactWhatsApp({
      name: form.name,
      type: typeLabels[form.type] ?? form.type,
      service: serviceTitle,
      mode: form.mode,
      urgency: urgencyLabels[form.urgency] ?? form.urgency,
      city: form.city,
      message: form.message || undefined,
    });
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Email invalide.";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Téléphone invalide.";
    if (!form.message.trim() || form.message.trim().length < 10)
      next.message = "Décrivez brièvement votre besoin.";
    if (!form.consent) next.consent = "Consentement requis.";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      const order = ["name", "phone", "email", "message", "consent"] as const;
      const first = order.find((k) => next[k]);
      if (first) {
        window.setTimeout(() => {
          const el = document.getElementById(`${uid}-${first}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.focus();
        }, 0);
      }
      return false;
    }
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    setMailtoFallback(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        mailto?: string;
        delivered?: boolean;
      };

      // Succès uniquement si l’API confirme l’envoi réel
      if (!res.ok || !data.ok || !data.delivered) {
        setErrors({
          form:
            data.error ??
            "L’envoi a échoué. Appelez-nous, WhatsApp, ou réessayez.",
        });
        if (data.mailto) setMailtoFallback(data.mailto);
        return;
      }

      try {
        sessionStorage.removeItem(CONFIG_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setSent(true);
    } catch {
      setErrors({ form: "Réseau indisponible. Appelez-nous ou réessayez." });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        className="success-pop rounded-[24px] border border-teal/30 bg-teal-soft/50 p-8 text-center"
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={(node) => node?.focus()}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal success-pop" aria-hidden />
        <h3 className="mt-4 text-2xl">Message envoyé</h3>
        <p className="mt-2 text-ink-muted leading-relaxed">
          Merci {form.name.split(" ")[0]} ! Nous vous répondons généralement{" "}
          {siteConfig.responseTime.toLowerCase().replace(/^réponse\s+/i, "")}.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          En attendant, un appel ou un WhatsApp accélère souvent le diagnostic.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={siteConfig.phoneHref} variant="secondary">
            <Phone className="h-4 w-4" />
            Appeler
          </Button>
          <Button
            href={whatsappHref}
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Continuer sur WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal aria-[invalid=true]:border-[var(--danger)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-busy={loading}>
      {configAttached ? (
        <p className="rounded-xl border border-teal/25 bg-teal-soft/40 px-4 py-3 text-sm text-ink-soft">
          Votre configuration PC a été préremplie dans le message. Vous pouvez
          l’ajuster avant envoi.
        </p>
      ) : null}

      {form.type === "urgence" ? (
        <p className="rounded-xl border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-ink-soft">
          Urgence sélectionnée — on priorise le rappel. Vous pouvez aussi{" "}
          <a href={siteConfig.phoneHref} className="font-semibold text-teal">
            appeler directement
          </a>
          .
        </p>
      ) : null}

      <div className="absolute -left-[9999px] opacity-0" aria-hidden tabIndex={-1}>
        <label htmlFor={`${uid}-company`}>Entreprise</label>
        <input
          id={`${uid}-company`}
          name="company"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-name`} label="Nom complet" error={errors.name}>
          <input
            id={`${uid}-name`}
            className={field}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            required
          />
        </Field>
        <Field id={`${uid}-phone`} label="Téléphone" error={errors.phone}>
          <input
            id={`${uid}-phone`}
            className={field}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-email`} label="Email" error={errors.email}>
          <input
            id={`${uid}-email`}
            type="email"
            className={field}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            required
          />
        </Field>
        <Field id={`${uid}-city`} label="Votre commune">
          <input
            id={`${uid}-city`}
            className={field}
            list={`${uid}-cities`}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Ex. Yerres, Brunoy…"
            autoComplete="address-level2"
          />
          <datalist id={`${uid}-cities`}>
            {siteConfig.nearbyCities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-type`} label="Type de demande">
          <select
            id={`${uid}-type`}
            className={field}
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${uid}-service`} label="Service concerné">
          <select
            id={`${uid}-service`}
            className={field}
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
          >
            <option value="">Non précisé</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-mode`} label="Mode d’intervention">
          <select
            id={`${uid}-mode`}
            className={field}
            value={form.mode}
            onChange={(e) => update("mode", e.target.value)}
          >
            <option value="">À définir ensemble</option>
            <option value="domicile">À domicile (je me déplace)</option>
            <option value="atelier">En atelier (vous déposez)</option>
          </select>
        </Field>
        <Field id={`${uid}-urgency`} label="Urgence">
          <select
            id={`${uid}-urgency`}
            className={field}
            value={form.urgency}
            onChange={(e) => update("urgency", e.target.value)}
          >
            {Object.entries(urgencyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id={`${uid}-message`} label="Décrivez la panne ou le besoin" error={errors.message}>
        <textarea
          id={`${uid}-message`}
          className={cn(field, "min-h-36 resize-y")}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          required
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input
          id={`${uid}-consent`}
          type="checkbox"
          className="mt-1"
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
        />
        <span>
          J’accepte d’être recontacté au sujet de ma demande. Vos données ne
          sont pas revendues.{" "}
          <a href="/politique-confidentialite" className="text-teal underline">
            Politique de confidentialité
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p id={`${uid}-consent-err`} className="text-sm text-[var(--danger)]" role="alert">
          {errors.consent}
        </p>
      ) : null}
      {errors.form ? (
        <div
          className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]"
          role="alert"
        >
          <p>{errors.form}</p>
          {mailtoFallback ? (
            <p className="mt-2">
              <a
                href={mailtoFallback}
                className="font-semibold underline underline-offset-2"
              >
                Ouvrir votre messagerie
              </a>
              {" · "}
              <a href={siteConfig.phoneHref} className="font-semibold underline underline-offset-2">
                Appeler
              </a>
              {" · "}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                WhatsApp
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Button type="submit" size="lg" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Envoi…" : "Envoyer ma demande"}
        </Button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-line bg-paper px-5 text-sm font-semibold hover:bg-surface"
        >
          <MessageCircle className="h-4 w-4 text-teal" />
          WhatsApp
        </a>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
