"use client";

import { siteConfig, navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Menu, Phone, X } from "lucide-react";
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
  const menuId = useId();
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background,border,box-shadow,color] duration-300",
        scrolled || open
          ? "border-line/80 bg-paper/90 backdrop-blur-xl shadow-[var(--shadow-soft)]"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="container-wide flex h-[74px] items-center justify-between gap-4 sm:h-[82px] md:h-[90px]">
        <BrandLogo priority />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? lightNav
                      ? "bg-white/15 text-[#4ba3ff]"
                      : "text-teal bg-teal-soft"
                    : lightNav
                      ? "text-white/75 hover:text-white hover:bg-white/10"
                      : "text-ink-soft hover:text-ink hover:bg-surface-2"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle lightOnDark={lightNav} />
          <a
            href={siteConfig.phoneHref}
            className={cn(
              "hidden xl:inline-flex items-center gap-2 text-sm font-semibold",
              lightNav ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            <Phone className={cn("h-4 w-4", lightNav ? "text-[#4ba3ff]" : "text-teal")} aria-hidden />
            {siteConfig.phone}
          </a>
          <Button href="/contact" size="sm">
            Demander un devis
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle lightOnDark={lightNav} />
          <button
            ref={menuBtnRef}
            type="button"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-xl border",
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
              <Button href="/contact" className="w-full">
                Demander un devis
              </Button>
              <Button href={siteConfig.phoneHref} variant="secondary" className="w-full">
                <Phone className="h-4 w-4" />
                {siteConfig.phone}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
