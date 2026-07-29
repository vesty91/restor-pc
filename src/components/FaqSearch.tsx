"use client";

import { faqs } from "@/lib/data/faq";
import { useMemo, useState } from "react";

export function FaqSearch() {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <label className="mx-auto mb-6 block max-w-3xl" htmlFor="faq-search">
        <span className="sr-only">Rechercher dans la FAQ</span>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex. garantie, domicile, devis…"
          className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-teal"
        />
      </label>

      <div className="mx-auto max-w-3xl divide-y divide-line rounded-[24px] border border-line bg-paper">
        {list.map((item) => (
          <details key={item.q} className="group px-5 py-5 md:px-7" open={query.trim().length > 0 && list.length <= 3}>
            <summary className="cursor-pointer list-none pr-8 font-semibold relative text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal rounded-md">
              {item.q}
              <span
                className="absolute right-0 top-0 text-teal text-xl leading-none transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm md:text-base text-ink-muted leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
        {list.length === 0 ? (
          <p className="px-5 py-8 text-center text-ink-muted">
            Aucune réponse trouvée.{" "}
            <a href="/contact" className="font-semibold text-teal">
              Contactez-nous
            </a>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
