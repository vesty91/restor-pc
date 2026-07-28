"use client";

import { createClient, signOutClient } from "@/lib/supabase/client";
import { siteConfig, navLinks } from "@/lib/site";
import { getUserFirstName } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Phone, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { Button } from "./ui/Button";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compteLabel, setCompteLabel] = useState("Mon compte");
  const [loggedIn, setLoggedIn] = useState(false);
  const menuId = useId();
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const compteActive = pathname === "/compte" || pathname.startsWith("/compte/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const syncUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const first = getUserFirstName(data.user);
        setLoggedIn(Boolean(data.user));
        setCompteLabel(first || "Mon compte");
      } catch {
        if (!cancelled) {
          setLoggedIn(false);
          setCompteLabel("Mon compte");
        }
      }
    };

    void syncUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const panel = panelRef.current;
      const focusables = panel?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusables?.[0]?.focus();

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          return;
        }
        if (e.key !== "Tab" || !focusables?.length) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }

    if (wasOpen.current) {
      wasOpen.current = false;
      menuBtnRef.current?.focus();
    }
  }, [open]);

  const isHome = pathname === "/";
  const lightNav = isHome && !scrolled && !open;

  const compteClass = cn(
    "inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 text-sm font-semibold transition-colors",
    lightNav
      ? compteActive
        ? "border-white/35 bg-white/15 text-white"
        : "border-white/20 bg-transparent text-white/85 hover:bg-white/10 hover:text-white"
      : compteActive
        ? "border-teal/40 bg-teal-soft text-teal"
        : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
  );

  const logoutClass = cn(
    "inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 text-sm font-semibold transition-colors",
    lightNav
      ? "border-white/20 bg-transparent text-white/85 hover:bg-white/10 hover:text-white"
      : "border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background,border,box-shadow,color] duration-300",
        scrolled || open
          ? "border-line/80 bg-paper/90 backdrop-blur-xl shadow-[var(--shadow-soft)]"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container-wide flex h-[74px] items-center gap-3 sm:h-[82px] md:h-[90px]">
        <BrandLogo priority />

        <nav
          className="hidden lg:flex flex-1 items-center justify-center gap-0.5 px-2"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active ? "true" : "false"}
                className={cn(
                  "nav-link rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? lightNav
                      ? "text-[#4ba3ff]"
                      : "text-teal"
                    : lightNav
                      ? "text-white/75 hover:text-white"
                      : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle lightOnDark={lightNav} />
          </div>
          <a
            href={siteConfig.phoneHref}
            className="phone-fr hidden xl:inline-flex items-center gap-2 text-sm font-semibold"
          >
            <Phone className="phone-fr-icon h-4 w-4 shrink-0" aria-hidden />
            <span className="phone-fr-text">{siteConfig.phone}</span>
          </a>
          <Link
            href="/compte"
            className={cn(compteClass, "inline-flex max-w-[10rem]")}
            aria-label={compteLabel === "Mon compte" ? "Mon compte" : `Compte de ${compteLabel}`}
          >
            <UserRound className="size-4 shrink-0" aria-hidden />
            <span className="hidden truncate sm:inline">{compteLabel}</span>
          </Link>
          {loggedIn ? (
            <button
              type="button"
              className={logoutClass}
              aria-label="Déconnexion"
              onClick={() => void signOutClient()}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          ) : null}

          <button
            ref={menuBtnRef}
            type="button"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-xl border lg:hidden",
              lightNav
                ? "border-white/20 bg-white/10 text-white"
                : "border-line bg-paper text-ink"
            )}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className="lg:hidden border-t border-line bg-paper"
        >
          <nav className="container-wide flex flex-col py-4" aria-label="Menu mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3.5 text-base font-semibold text-ink hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              <Button href="/compte" variant="secondary" className="w-full">
                <UserRound className="h-4 w-4" />
                {compteLabel}
              </Button>
              {loggedIn ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => void signOutClient()}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              ) : null}
              <Button href={siteConfig.phoneHref} variant="secondary" className="phone-fr w-full">
                <Phone className="phone-fr-icon h-4 w-4" />
                <span className="phone-fr-text">{siteConfig.phone}</span>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
