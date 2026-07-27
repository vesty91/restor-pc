"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useState, type FormEvent } from "react";

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Email non confirmé. Vérifiez votre boîte mail (ou désactivez la confirmation dans Supabase Auth pour les tests).";
  }
  if (m.includes("user already registered")) {
    return "Ce compte existe déjà. Utilisez l’onglet Connexion.";
  }
  if (m.includes("password")) {
    return "Mot de passe trop court (6 caractères minimum).";
  }
  return message;
}

function safeNext(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/compte";
  return path;
}

function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3l-.8.6-2.5 1.9C3.5 19.7 7.4 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-5.9-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.9 7.1A9.9 9.9 0 0 0 2 12c0 1.7.4 3.3 1.1 4.7l3.3-2.5A5.9 5.9 0 0 1 6 12c0-.9.2-1.7.5-2.4L3.9 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.7 14.7 2 12 2 7.4 2 3.5 4.3 1.9 7.7l3.3 2.5C6.9 7.8 9.2 5.9 12 5.9z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}

export function CompteAuthForm({
  initialMode = "signup",
  nextPath,
  oauthError = false,
}: {
  initialMode?: "login" | "signup";
  nextPath?: string;
  oauthError?: boolean;
}) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(
    oauthError ? "Connexion Google / GitHub interrompue. Réessayez." : null
  );
  const [info, setInfo] = useState<string | null>(null);
  const redirectTo = safeNext(nextPath);

  async function onOAuth(provider: "google" | "github") {
    setError(null);
    setInfo(null);
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", redirectTo);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callback.toString(),
        },
      });
      if (err) {
        setError(mapAuthError(err.message));
        setOauthLoading(null);
      }
    } catch {
      setError("Impossible de démarrer la connexion OAuth.");
      setOauthLoading(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Email valide et mot de passe (6 caractères min.) requis.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(mapAuthError(err.message));
          return;
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(mapAuthError(err.message));
          return;
        }
        if (data.user && !data.session) {
          setInfo(
            "Compte créé. Confirmez l’email reçu, puis connectez-vous pour continuer."
          );
          setMode("login");
          return;
        }
      }
      window.location.assign(redirectTo);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || oauthLoading !== null;

  return (
    <div className="mx-auto mt-8 max-w-md rounded-[24px] border border-line bg-paper p-6 md:p-7">
      <p className="text-sm text-ink-muted">
        {redirectTo.startsWith("/boutique/")
          ? "Créez votre compte pour finaliser l’achat. Licence et lien seront liés à cet email."
          : "Un compte est requis pour acheter et retrouver vos licences dans l’espace personnel."}
      </p>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onOAuth("google")}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-line bg-paper text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-50"
        >
          <GoogleIcon />
          {oauthLoading === "google" ? "Redirection…" : "Continuer avec Google"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onOAuth("github")}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-line bg-ink text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50 dark:bg-paper dark:text-ink"
        >
          <GitHubIcon />
          {oauthLoading === "github" ? "Redirection…" : "Continuer avec GitHub"}
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        ou par email
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex gap-2 rounded-[12px] bg-surface p-1">
        <button
          type="button"
          className={`flex-1 rounded-[10px] py-2 text-sm font-semibold transition ${
            mode === "signup" ? "bg-paper text-ink shadow-sm" : "text-ink-muted"
          }`}
          onClick={() => {
            setMode("signup");
            setError(null);
            setInfo(null);
          }}
        >
          Inscription
        </button>
        <button
          type="button"
          className={`flex-1 rounded-[10px] py-2 text-sm font-semibold transition ${
            mode === "login" ? "bg-paper text-ink shadow-sm" : "text-ink-muted"
          }`}
          onClick={() => {
            setMode("login");
            setError(null);
            setInfo(null);
          }}
        >
          Connexion
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-ink-muted">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          />
        </label>
        <label className="block text-sm text-ink-muted">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          />
        </label>
        <Button type="submit" className="w-full" disabled={busy}>
          {loading
            ? "…"
            : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
        </Button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {info ? <p className="mt-3 text-sm text-teal">{info}</p> : null}

      <p className="mt-6 border-t border-line pt-4 text-center text-xs text-ink-muted">
        Atelier Restor-PC ?{" "}
        <a href="/admin" className="font-semibold text-teal underline underline-offset-2">
          Accéder à l’espace admin
        </a>
      </p>
    </div>
  );
}
