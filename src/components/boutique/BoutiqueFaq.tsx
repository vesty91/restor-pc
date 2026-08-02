import { faqs } from "@/lib/data/faq";

const boutiqueKeywords = [
  "compte",
  "licence",
  "télécharger",
  "outil",
  "boutique",
  "script",
  "responsable",
  "restor-pc est responsable",
];

const boutiqueFaqs = faqs.filter(
  (f) =>
    boutiqueKeywords.some((k) => f.q.toLowerCase().includes(k)) ||
    f.a.toLowerCase().includes("mon compte") ||
    f.a.toLowerCase().includes("conditions générales"),
);

export function BoutiqueFaq() {
  if (boutiqueFaqs.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-[24px] border border-line bg-paper">
      {boutiqueFaqs.map((item) => (
        <details key={item.q} className="group px-5 py-5 md:px-7">
          <summary className="cursor-pointer list-none pr-8 font-semibold relative text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal rounded-md">
            {item.q}
            <span
              className="absolute right-0 top-0 text-teal text-xl leading-none transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm md:text-base text-ink-muted leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
