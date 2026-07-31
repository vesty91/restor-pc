"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
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
import { cn, formatPrice } from "@/lib/utils";
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
  const [overrides, setOverrides] = useState<
    Partial<Record<ComponentCategory, string>>
  >({});
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
    window.setTimeout(() => setCopied(false), 2000);
  }

  function goToQuote() {
    try {
      sessionStorage.setItem(CONFIG_STORAGE_KEY, buildSummaryText());
    } catch {
      /* private mode */
    }
    void import("@/lib/analytics").then(({ trackBeginQuote }) => {
      trackBeginQuote({
        usage,
        budget,
        total: build.grandTotal,
      });
    });
    router.push(
      `/contact?type=config&usage=${usage}&budget=${budget}&total=${build.grandTotal}`
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
      <div>
        <ol className="mb-8 flex flex-wrap gap-2" aria-label="Étapes">
          {steps.map((label, i) => {
            const active = step === i;
            const done = i < step;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Badge
                    variant={active ? "default" : done ? "info" : "outline"}
                    className={cn(
                      "cursor-pointer px-3.5 py-1.5 text-sm",
                      active && "bg-panel text-panel-fg hover:bg-panel"
                    )}
                  >
                    {i + 1}. {label}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <div>
            <Badge variant="info" className="mb-3">
              Étape 1
            </Badge>
            <h2 className="text-2xl md:text-3xl">Pour quel usage ?</h2>
            <p className="mt-2 text-ink-muted">
              Le moteur priorise les composants selon votre usage réel.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {usages.map((u) => {
                const selected = usage === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsage(u.id);
                      setOverrides({});
                    }}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-all",
                      selected
                        ? "border-teal bg-teal-soft/60 shadow-[var(--shadow-soft)]"
                        : "border-line bg-paper hover:border-line-strong"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-semibold">{u.label}</span>
                      {selected ? (
                        <Badge variant="success" className="gap-1">
                          <Check className="size-3" aria-hidden />
                          Choisi
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {u.description}
                    </p>
                  </button>
                );
              })}
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
            <Badge variant="info" className="mb-3">
              Étape 2
            </Badge>
            <h2 className="text-2xl md:text-3xl">Quel budget visez-vous ?</h2>
            <p className="mt-2 text-ink-muted">
              Fourchettes indicatives pièces + montage. Ajustables ensuite.
            </p>
            <div className="mt-6 grid gap-3">
              {budgets.map((b) => {
                const selected = budget === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBudget(b.id);
                      setOverrides({});
                    }}
                    className={cn(
                      "flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all sm:flex-row sm:items-center sm:justify-between",
                      selected
                        ? "border-teal bg-teal-soft/60"
                        : "border-line bg-paper hover:border-line-strong"
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">{b.label}</p>
                        {selected ? <Badge variant="success">Choisi</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{b.description}</p>
                    </div>
                    <p className="shrink-0 font-display text-xl tracking-tight">
                      {formatPrice(b.min)} – {formatPrice(b.max)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Badge variant="info" className="mb-3">
              Étape 3
            </Badge>
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
                      "rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-teal bg-teal-soft/60"
                        : "border-line bg-paper hover:border-line-strong"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{p.label}</span>
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-md border",
                          active ? "border-teal bg-teal text-white" : "border-line"
                        )}
                        aria-hidden
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
            <Badge variant="info" className="mb-3">
              Étape 4
            </Badge>
            <h2 className="text-2xl md:text-3xl">Votre configuration recommandée</h2>
            <p className="mt-2 text-ink-muted">
              Ajustez un composant si besoin. La compatibilité et les scores se
              mettent à jour.
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
                    className="rounded-2xl border border-line bg-paper p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <Badge variant="muted" className="mb-2">
                          {categoryLabels[cat]}
                        </Badge>
                        <p className="font-semibold">{current.name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {current.note}
                        </p>
                      </div>
                      <p className="shrink-0 font-display text-xl">
                        {current.price === 0 ? "Inclus" : formatPrice(current.price)}
                      </p>
                    </div>
                    <label className="mt-4 block">
                      <span className="sr-only">Changer {categoryLabels[cat]}</span>
                      <select
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teal focus-visible:ring-2 focus-visible:ring-teal/30"
                        value={current.id}
                        onChange={(e) => changeComponent(cat, e.target.value)}
                      >
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} —{" "}
                            {opt.price === 0 ? "0 €" : formatPrice(opt.price)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-teal" aria-hidden />
                Conseils Restor-PC
              </p>
              <ul className="mt-3 space-y-2">
                {build.tips.map((tip) => (
                  <li
                    key={tip}
                    className="relative pl-4 text-sm leading-relaxed text-ink-muted"
                  >
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={step === 0 ? "pointer-events-none opacity-40" : ""}
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

      <aside className="relative overflow-hidden rounded-[24px] border border-line bg-panel p-6 text-panel-fg shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
        <BorderBeam size={70} duration={10} borderWidth={1.25} />
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white/80"
            >
              Récap live
            </Badge>
            <Badge
              variant="info"
              className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]"
            >
              Indicatif
            </Badge>
          </div>
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
            <Zap className="h-4 w-4 text-teal" aria-hidden />
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
            Bêta — estimation indicative. Prix pièces variables selon stock et
            marché. Compatibilité et total final confirmés en atelier avant devis
            ferme.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" onClick={goToQuote} className="w-full">
              Transformer en devis
            </Button>
            <button
              type="button"
              onClick={() => void copySummary()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {copied ? "Copié !" : "Copier le résumé"}
            </button>
            <Link
              href="/services/montage-pc"
              className="pt-1 text-center text-xs text-white/50 hover:text-white/80"
            >
              En savoir plus sur le montage
            </Link>
          </div>
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
          className="h-full rounded-full bg-teal transition-all duration-500 motion-reduce:transition-none"
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
    <div className="mt-10 rounded-2xl border border-line bg-paper p-5 md:p-6">
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge variant="muted">Comparaison</Badge>
        <Badge variant="outline">
          Budget {budgets.find((b) => b.id === budget)?.label}
        </Badge>
      </div>
      <p className="text-lg font-semibold">Comparaison rapide des profils</p>
      <p className="mt-1 text-sm text-ink-muted">
        Aperçu estimatif pour vous aider à choisir un usage.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-ink-muted">
              <th className="pb-2 font-semibold">Profil</th>
              <th className="pb-2 font-semibold">GPU typique</th>
              <th className="pb-2 font-semibold">Perf.</th>
              <th className="pb-2 font-semibold">Équil.</th>
              <th className="pb-2 text-right font-semibold">Estim.</th>
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
                    <span className="truncate text-ink-muted">{row.gpu}</span>
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
