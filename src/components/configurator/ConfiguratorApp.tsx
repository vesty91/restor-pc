"use client";

import { Button } from "@/components/ui/Button";
import {
  budgets,
  categoryLabels,
  generateBuild,
  getOptionsForCategory,
  preferences,
  usages,
  type BudgetId,
  type BuildResult,
  type ComponentCategory,
  type PrefId,
  type UsageId,
} from "@/lib/data/configurator";
import { CONFIG_STORAGE_KEY } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Copy,
  Gauge,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

const steps = ["Usage", "Budget", "Préférences", "Configuration"] as const;

const orderedCategories: ComponentCategory[] = [
  "cpu",
  "gpu",
  "ram",
  "storage",
  "motherboard",
  "psu",
  "case",
  "cooling",
];

export function ConfiguratorApp() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [usage, setUsage] = useState<UsageId>("gaming");
  const [budget, setBudget] = useState<BudgetId>("equilibre");
  const [prefs, setPrefs] = useState<PrefId[]>(["upgrade"]);
  const [overrides, setOverrides] = useState<Partial<Record<ComponentCategory, string>>>({});
  const [copied, setCopied] = useState(false);

  const build: BuildResult = useMemo(
    () => generateBuild(usage, budget, prefs, overrides),
    [usage, budget, prefs, overrides]
  );

  const platform = build.components.cpu.brand === "Intel" ? "intel" : "amd";

  function buildSummaryText() {
    return [
      build.summary,
      "",
      ...orderedCategories.map(
        (cat) =>
          `${categoryLabels[cat]} : ${build.components[cat].name} (${formatPrice(build.components[cat].price)})`
      ),
      "",
      `Pièces : ${formatPrice(build.total)}`,
      `Montage : ${formatPrice(build.assembly)}`,
      `Total estimé : ${formatPrice(build.grandTotal)}`,
      `Score perf : ${build.performanceScore} · Équilibre : ${build.balanceScore}`,
    ].join("\n");
  }

  function togglePref(id: PrefId) {
    setPrefs((prev) => {
      let next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      if (id === "amd" && next.includes("amd")) next = next.filter((p) => p !== "intel");
      if (id === "intel" && next.includes("intel")) next = next.filter((p) => p !== "amd");
      return next;
    });
    setOverrides({});
  }

  function changeComponent(category: ComponentCategory, id: string) {
    setOverrides((prev) => ({ ...prev, [category]: id }));
  }

  async function copySummary() {
    await navigator.clipboard.writeText(buildSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function goToQuote() {
    try {
      sessionStorage.setItem(CONFIG_STORAGE_KEY, buildSummaryText());
    } catch {
      /* private mode */
    }
    router.push(
      `/contact?type=config&usage=${usage}&budget=${budget}&total=${build.grandTotal}`
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] items-start">
      <div>
        {/* Steps */}
        <ol className="mb-8 flex flex-wrap gap-2" aria-label="Étapes">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                  step === i
                    ? "bg-panel text-panel-fg"
                    : i < step
                      ? "bg-teal-soft text-teal"
                      : "bg-paper border border-line text-ink-muted"
                )}
              >
                {i + 1}. {label}
              </button>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl">Pour quel usage ?</h2>
            <p className="mt-2 text-ink-muted">
              Le moteur priorise les composants selon votre usage réel.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {usages.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setUsage(u.id);
                    setOverrides({});
                  }}
                  className={cn(
                    "rounded-[18px] border p-5 text-left transition-all",
                    usage === u.id
                      ? "border-teal bg-teal-soft/60 shadow-[var(--shadow-soft)]"
                      : "border-line bg-paper hover:border-line-strong"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-lg">{u.label}</span>
                    {usage === u.id ? <Check className="h-4 w-4 text-teal" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">{u.description}</p>
                </button>
              ))}
            </div>

            <ProfileCompare
              budget={budget}
              activeUsage={usage}
              onPick={(id) => {
                setUsage(id);
                setOverrides({});
              }}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl md:text-3xl">Quel budget visez-vous ?</h2>
            <p className="mt-2 text-ink-muted">
              Fourchettes indicatives pièces + montage. Ajustables ensuite.
            </p>
            <div className="mt-6 grid gap-3">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBudget(b.id);
                    setOverrides({});
                  }}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-[18px] border p-5 text-left transition-all",
                    budget === b.id
                      ? "border-teal bg-teal-soft/60"
                      : "border-line bg-paper hover:border-line-strong"
                  )}
                >
                  <div>
                    <p className="font-semibold text-lg">{b.label}</p>
                    <p className="mt-1 text-sm text-ink-muted">{b.description}</p>
                  </div>
                  <p className="font-display text-xl tracking-tight shrink-0">
                    {formatPrice(b.min)} – {formatPrice(b.max)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl md:text-3xl">Des préférences particulières ?</h2>
            <p className="mt-2 text-ink-muted">
              Optionnel. Sélectionnez ce qui compte pour vous.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {preferences.map((p) => {
                const active = prefs.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePref(p.id)}
                    className={cn(
                      "rounded-[18px] border p-4 text-left transition-all",
                      active
                        ? "border-teal bg-teal-soft/60"
                        : "border-line bg-paper hover:border-line-strong"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{p.label}</span>
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-md border",
                          active ? "border-teal bg-teal text-white" : "border-line"
                        )}
                      >
                        {active ? <Check className="h-3 w-3" /> : null}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl md:text-3xl">Votre configuration recommandée</h2>
            <p className="mt-2 text-ink-muted">
              Ajustez un composant si besoin. La compatibilité et les scores se mettent à jour.
            </p>
            <div className="mt-6 space-y-3">
              {orderedCategories.map((cat) => {
                const current = build.components[cat];
                const options = getOptionsForCategory(
                  cat,
                  cat === "motherboard" || cat === "cpu" ? platform : undefined
                );
                return (
                  <div
                    key={cat}
                    className="rounded-[18px] border border-line bg-paper p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          {categoryLabels[cat]}
                        </p>
                        <p className="mt-1 font-semibold">{current.name}</p>
                        <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                          {current.note}
                        </p>
                      </div>
                      <p className="font-display text-xl shrink-0">
                        {current.price === 0 ? "Inclus" : formatPrice(current.price)}
                      </p>
                    </div>
                    <label className="mt-4 block">
                      <span className="sr-only">Changer {categoryLabels[cat]}</span>
                      <select
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
                        value={current.id}
                        onChange={(e) => changeComponent(cat, e.target.value)}
                      >
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} — {opt.price === 0 ? "0 €" : formatPrice(opt.price)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[18px] border border-line bg-surface p-5">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-teal" />
                Conseils Restor-PC
              </p>
              <ul className="mt-3 space-y-2">
                {build.tips.map((tip) => (
                  <li key={tip} className="text-sm text-ink-muted leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-teal" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={step === 0 ? "opacity-40 pointer-events-none" : ""}
          >
            Retour
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={goToQuote}>
              Demander un devis pour cette config
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sticky summary panel */}
      <aside className="lg:sticky lg:top-24 rounded-[24px] border border-line bg-panel text-panel-fg p-6 shadow-[var(--shadow-lift)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          Récapitulatif live
        </p>
        <p className="mt-3 font-display text-2xl leading-tight">
          {usages.find((u) => u.id === usage)?.label} ·{" "}
          {budgets.find((b) => b.id === budget)?.label}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ScorePill
            icon={<Gauge className="h-3.5 w-3.5" />}
            label="Performance"
            value={build.performanceScore}
          />
          <ScorePill
            icon={<Scale className="h-3.5 w-3.5" />}
            label="Équilibre"
            value={build.balanceScore}
          />
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-white/60">
          <Zap className="h-4 w-4 text-teal" />
          Conso estimée ~{build.powerDraw} W
        </div>

        <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/55">Pièces</dt>
            <dd className="font-medium">{formatPrice(build.total)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/55">Montage atelier</dt>
            <dd className="font-medium">{formatPrice(build.assembly)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-base">
            <dt className="font-semibold">Total estimé</dt>
            <dd className="font-display text-2xl text-teal">
              {formatPrice(build.grandTotal)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-white/45">
          Estimation indicative. Prix pièces variables selon stock et marché.
          Devis ferme après validation.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" onClick={goToQuote} className="w-full">
            Transformer en devis
          </Button>
          <button
            type="button"
            onClick={copySummary}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copié !" : "Copier le résumé"}
          </button>
          <Link
            href="/services/montage-pc"
            className="text-center text-xs text-white/50 hover:text-white/80 pt-1"
          >
            En savoir plus sur le montage
          </Link>
        </div>
      </aside>
    </div>
  );
}

function ScorePill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] text-white/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-2xl tracking-tight">{value}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-teal transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ProfileCompare({
  budget,
  activeUsage,
  onPick,
}: {
  budget: BudgetId;
  activeUsage: UsageId;
  onPick: (id: UsageId) => void;
}) {
  const rows = useMemo(
    () =>
      usages.map((u) => {
        const b = generateBuild(u.id, budget, ["upgrade"]);
        return {
          id: u.id,
          label: u.label,
          total: b.grandTotal,
          perf: b.performanceScore,
          balance: b.balanceScore,
          gpu: b.components.gpu.name,
        };
      }),
    [budget]
  );

  return (
    <div className="mt-10 rounded-[20px] border border-line bg-paper p-5 md:p-6">
      <p className="font-semibold text-lg">Comparaison rapide des profils</p>
      <p className="mt-1 text-sm text-ink-muted">
        Même budget « {budgets.find((b) => b.id === budget)?.label} » — aperçu
        estimatif pour vous aider à choisir.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-ink-muted border-b border-line">
              <th className="pb-2 font-semibold">Profil</th>
              <th className="pb-2 font-semibold">GPU typique</th>
              <th className="pb-2 font-semibold">Perf.</th>
              <th className="pb-2 font-semibold">Équil.</th>
              <th className="pb-2 font-semibold text-right">Estim.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-line/70 last:border-0",
                  activeUsage === row.id && "bg-teal-soft/50"
                )}
              >
                <td className="py-2" colSpan={5}>
                  <button
                    type="button"
                    onClick={() => onPick(row.id)}
                    className={cn(
                      "grid w-full grid-cols-[1.2fr_1.4fr_0.5fr_0.5fr_0.8fr] items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                      activeUsage === row.id ? "bg-transparent" : "hover:bg-surface"
                    )}
                  >
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-ink-muted truncate">{row.gpu}</span>
                    <span>{row.perf}</span>
                    <span>{row.balance}</span>
                    <span className="text-right font-display text-base">
                      {formatPrice(row.total)}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
