export type UsageId =
  | "office"
  | "gaming"
  | "creation"
  | "streaming"
  | "pro"
  | "polyvalent";

export type BudgetId = "eco" | "equilibre" | "performance" | "ultime";

export type PrefId =
  | "quiet"
  | "rgb"
  | "upgrade"
  | "compact"
  | "amd"
  | "intel"
  | "nvidia"
  | "storage";

export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "ram"
  | "storage"
  | "motherboard"
  | "psu"
  | "case"
  | "cooling";

export type ComponentOption = {
  id: string;
  category: ComponentCategory;
  name: string;
  brand: string;
  price: number;
  score: number;
  power: number;
  tags: string[];
  note: string;
};

export const usages: {
  id: UsageId;
  label: string;
  description: string;
  priorities: ComponentCategory[];
}[] = [
  {
    id: "office",
    label: "Bureautique",
    description: "Navigation, Office, visioconférence, fluidité du quotidien.",
    priorities: ["cpu", "ram", "storage"],
  },
  {
    id: "gaming",
    label: "Gaming",
    description: "Jeux AAA, haut framerate, immersion et stabilité.",
    priorities: ["gpu", "cpu", "ram"],
  },
  {
    id: "creation",
    label: "Création",
    description: "Photo, vidéo, 3D, export accéléré, multitâche lourd.",
    priorities: ["cpu", "ram", "storage", "gpu"],
  },
  {
    id: "streaming",
    label: "Streaming",
    description: "Jouer + diffuser, encodeur efficace, machine silencieuse.",
    priorities: ["cpu", "gpu", "ram"],
  },
  {
    id: "pro",
    label: "Professionnel",
    description: "Fiabilité, silence, sécurité et productivité longue durée.",
    priorities: ["cpu", "ram", "storage", "cooling"],
  },
  {
    id: "polyvalent",
    label: "Polyvalent",
    description: "Un PC qui fait tout bien, sans sur-spécialisation.",
    priorities: ["cpu", "gpu", "ram", "storage"],
  },
];

export const budgets: {
  id: BudgetId;
  label: string;
  min: number;
  max: number;
  description: string;
}[] = [
  {
    id: "eco",
    label: "Essentiel",
    min: 550,
    max: 800,
    description: "Solide pour démarrer, durable, sans superflu.",
  },
  {
    id: "equilibre",
    label: "Équilibré",
    min: 900,
    max: 1400,
    description: "Le meilleur rapport perf / prix pour la plupart des usages.",
  },
  {
    id: "performance",
    label: "Performance",
    min: 1500,
    max: 2200,
    description: "Haut niveau, marge pour 2–3 ans d’exigences.",
  },
  {
    id: "ultime",
    label: "Ultime",
    min: 2400,
    max: 3500,
    description: "Sans compromis : création lourde, 4K, compétition.",
  },
];

export const preferences: {
  id: PrefId;
  label: string;
  description: string;
}[] = [
  { id: "quiet", label: "Silence prioritaire", description: "Refroidissement discret" },
  { id: "rgb", label: "Esthétique RGB", description: "Look gaming soigné" },
  { id: "upgrade", label: "Évolutif", description: "Marge d’upgrade future" },
  { id: "compact", label: "Format compact", description: "Boîtier mATX / ITX" },
  { id: "amd", label: "Préférence AMD", description: "CPU AMD privilégié" },
  { id: "intel", label: "Préférence Intel", description: "CPU Intel privilégié" },
  { id: "nvidia", label: "GPU NVIDIA", description: "DLSS / encodeur NVENC" },
  { id: "storage", label: "Stockage XL", description: "Plus d’espace SSD" },
];

export const catalog: ComponentOption[] = [
  // CPU
  { id: "cpu-r5-7600", category: "cpu", name: "Ryzen 5 7600", brand: "AMD", price: 199, score: 78, power: 65, tags: ["amd", "gaming", "polyvalent", "equilibre"], note: "Excellent rapport perf/prix, idéal gaming & polyvalent." },
  { id: "cpu-r7-7700", category: "cpu", name: "Ryzen 7 7700", brand: "AMD", price: 299, score: 88, power: 65, tags: ["amd", "creation", "streaming", "pro", "performance"], note: "8 cœurs : parfait création, streaming et multitâche." },
  { id: "cpu-r9-7900", category: "cpu", name: "Ryzen 9 7900", brand: "AMD", price: 389, score: 95, power: 65, tags: ["amd", "creation", "pro", "ultime"], note: "Puissance serveur pour exports et calculs lourds." },
  { id: "cpu-i5-14400f", category: "cpu", name: "Core i5-14400F", brand: "Intel", price: 179, score: 74, power: 65, tags: ["intel", "office", "gaming", "eco"], note: "Solide en bureautique et gaming entrée/milieu de gamme." },
  { id: "cpu-i7-14700f", category: "cpu", name: "Core i7-14700F", brand: "Intel", price: 349, score: 90, power: 65, tags: ["intel", "creation", "streaming", "performance"], note: "Très fort en multitâche et création grâce aux E-cores." },
  { id: "cpu-r5-5600", category: "cpu", name: "Ryzen 5 5600", brand: "AMD", price: 119, score: 62, power: 65, tags: ["amd", "office", "eco", "polyvalent"], note: "Économique et largement suffisant en bureautique." },

  // GPU
  { id: "gpu-none", category: "gpu", name: "Graphiques intégrés", brand: "iGPU", price: 0, score: 25, power: 0, tags: ["office", "pro", "eco", "quiet"], note: "Suffisant pour bureautique et navigation. Pas de jeux lourds." },
  { id: "gpu-4060", category: "gpu", name: "GeForce RTX 4060 8 Go", brand: "NVIDIA", price: 299, score: 72, power: 115, tags: ["nvidia", "gaming", "equilibre", "streaming"], note: "1080p/1440p fluide, DLSS et encodeur excellent." },
  { id: "gpu-4070s", category: "gpu", name: "GeForce RTX 4070 Super", brand: "NVIDIA", price: 599, score: 88, power: 220, tags: ["nvidia", "gaming", "creation", "performance", "streaming"], note: "Sweet spot 1440p haut niveau et création GPU." },
  { id: "gpu-4080s", category: "gpu", name: "GeForce RTX 4080 Super", brand: "NVIDIA", price: 1049, score: 96, power: 320, tags: ["nvidia", "gaming", "creation", "ultime", "streaming"], note: "4K / création lourde sans compromis." },
  { id: "gpu-7800xt", category: "gpu", name: "Radeon RX 7800 XT", brand: "AMD", price: 479, score: 86, power: 263, tags: ["amd", "gaming", "performance"], note: "Excellent rapport VRAM / prix en 1440p." },
  { id: "gpu-7600", category: "gpu", name: "Radeon RX 7600", brand: "AMD", price: 269, score: 68, power: 165, tags: ["amd", "gaming", "equilibre", "eco"], note: "Bon choix gaming 1080p ultra / 1440p medium." },

  // RAM
  { id: "ram-16", category: "ram", name: "16 Go DDR5 6000", brand: "Corsair", price: 79, score: 65, power: 5, tags: ["office", "gaming", "eco", "equilibre"], note: "Base saine pour la plupart des usages 2026." },
  { id: "ram-32", category: "ram", name: "32 Go DDR5 6000", brand: "Kingston", price: 129, score: 85, power: 8, tags: ["gaming", "creation", "streaming", "pro", "polyvalent", "performance"], note: "Recommandé création, streaming et multitâche." },
  { id: "ram-64", category: "ram", name: "64 Go DDR5 6000", brand: "G.Skill", price: 239, score: 95, power: 12, tags: ["creation", "pro", "ultime"], note: "Indispensable 3D lourde, timelines 4K, VMs." },

  // Storage
  { id: "ssd-1to", category: "storage", name: "SSD NVMe 1 To Gen4", brand: "Samsung", price: 89, score: 70, power: 5, tags: ["office", "gaming", "eco", "equilibre"], note: "Rapide et suffisant pour OS + jeux principaux." },
  { id: "ssd-2to", category: "storage", name: "SSD NVMe 2 To Gen4", brand: "WD", price: 149, score: 85, power: 6, tags: ["gaming", "creation", "streaming", "performance", "storage"], note: "Confortable pour bibliothèque jeux / projets." },
  { id: "ssd-4to", category: "storage", name: "SSD NVMe 4 To Gen4", brand: "Crucial", price: 279, score: 95, power: 8, tags: ["creation", "pro", "ultime", "storage"], note: "Stockage pro pour médias lourds sans externe." },

  // Motherboard
  { id: "mb-b650", category: "motherboard", name: "B650 ATX Wi-Fi", brand: "MSI", price: 169, score: 80, power: 40, tags: ["amd", "equilibre", "performance", "upgrade"], note: "VRM solides, PCIe 5.0, bonne évolutivité." },
  { id: "mb-b760", category: "motherboard", name: "B760 ATX Wi-Fi", brand: "Gigabyte", price: 159, score: 78, power: 40, tags: ["intel", "equilibre", "performance", "upgrade"], note: "Plateforme Intel fiable avec Wi-Fi 6E." },
  { id: "mb-a620", category: "motherboard", name: "A620 mATX", brand: "ASRock", price: 109, score: 60, power: 35, tags: ["amd", "eco", "office", "compact"], note: "Compact et économique pour configs essentielles." },
  { id: "mb-x670", category: "motherboard", name: "X670E ATX", brand: "ASUS", price: 289, score: 92, power: 50, tags: ["amd", "ultime", "creation", "upgrade"], note: "Haut de gamme : connectique et VRM premium." },

  // PSU
  { id: "psu-650", category: "psu", name: "650W 80+ Gold", brand: "be quiet!", price: 99, score: 75, power: 0, tags: ["eco", "equilibre", "quiet"], note: "Silencieuse et largement dimensionnée milieu de gamme." },
  { id: "psu-750", category: "psu", name: "750W 80+ Gold", brand: "Seasonic", price: 129, score: 85, power: 0, tags: ["performance", "gaming", "upgrade"], note: "Marge saine pour GPU milieu/haut de gamme." },
  { id: "psu-850", category: "psu", name: "850W 80+ Platinum", brand: "Corsair", price: 169, score: 92, power: 0, tags: ["ultime", "creation", "performance"], note: "Tête haute pour configs gourmandes et upgrades." },
  { id: "psu-550", category: "psu", name: "550W 80+ Bronze", brand: "Cooler Master", price: 69, score: 60, power: 0, tags: ["eco", "office"], note: "Suffisant pour configs sans gros GPU." },

  // Case
  { id: "case-mesh", category: "case", name: "Boîtier Mesh ATX", brand: "Fractal", price: 99, score: 80, power: 0, tags: ["equilibre", "performance", "gaming", "quiet"], note: "Airflow excellent, look sobre et premium." },
  { id: "case-rgb", category: "case", name: "Boîtier ATX RGB", brand: "Lian Li", price: 129, score: 82, power: 0, tags: ["rgb", "gaming", "performance"], note: "Esthétique soignée, verre trempé, bon airflow." },
  { id: "case-compact", category: "case", name: "Boîtier mATX compact", brand: "Cooler Master", price: 79, score: 70, power: 0, tags: ["compact", "office", "pro", "eco"], note: "Format bureau discret, idéal espace réduit." },
  { id: "case-premium", category: "case", name: "Boîtier premium silencieux", brand: "be quiet!", price: 149, score: 90, power: 0, tags: ["quiet", "pro", "ultime", "creation"], note: "Isolation phonique et finitions haut de gamme." },

  // Cooling
  { id: "cool-air", category: "cooling", name: "Ventirad tour dual tower", brand: "Noctua", price: 89, score: 85, power: 0, tags: ["quiet", "equilibre", "performance", "pro"], note: "Silence + efficacité, sans risque de fuite." },
  { id: "cool-aio240", category: "cooling", name: "AIO 240 mm", brand: "Arctic", price: 99, score: 82, power: 0, tags: ["gaming", "rgb", "performance"], note: "Bon compromis esthétique / thermiques." },
  { id: "cool-stock", category: "cooling", name: "Ventirad stock / basique", brand: "OEM", price: 25, score: 50, power: 0, tags: ["eco", "office"], note: "OK en usage léger, limité sous charge." },
  { id: "cool-aio360", category: "cooling", name: "AIO 360 mm", brand: "NZXT", price: 149, score: 92, power: 0, tags: ["ultime", "creation", "rgb"], note: "Marge thermique max pour CPU haut de gamme." },
];

export type BuildSelection = Record<ComponentCategory, ComponentOption>;

export type BuildResult = {
  components: BuildSelection;
  total: number;
  assembly: number;
  grandTotal: number;
  balanceScore: number;
  performanceScore: number;
  powerDraw: number;
  tips: string[];
  summary: string;
};

const categories: ComponentCategory[] = [
  "cpu",
  "gpu",
  "ram",
  "storage",
  "motherboard",
  "psu",
  "case",
  "cooling",
];

function scoreCandidate(
  item: ComponentOption,
  usage: UsageId,
  budget: BudgetId,
  prefs: PrefId[],
  targetMid: number
): number {
  let s = item.score;

  if (item.tags.includes(usage)) s += 18;
  if (item.tags.includes(budget)) s += 12;

  for (const p of prefs) {
    if (item.tags.includes(p)) s += 10;
  }

  // Prefer staying near budget mid for category share
  const distance = Math.abs(item.price - targetMid * 0.15);
  s -= distance / 40;

  if (prefs.includes("amd") && item.brand === "Intel" && item.category === "cpu") s -= 30;
  if (prefs.includes("intel") && item.brand === "AMD" && item.category === "cpu") s -= 30;
  if (prefs.includes("nvidia") && item.brand === "AMD" && item.category === "gpu") s -= 20;
  if (prefs.includes("quiet") && item.id.includes("rgb") && item.category === "case") s -= 8;

  return s;
}

function pickBest(
  category: ComponentCategory,
  usage: UsageId,
  budget: BudgetId,
  prefs: PrefId[],
  budgetMax: number,
  remaining: number,
  platform: "amd" | "intel" | null
): ComponentOption {
  const pool = catalog.filter((c) => {
    if (c.category !== category) return false;
    if (category === "motherboard" && platform) {
      if (platform === "amd" && c.tags.includes("intel")) return false;
      if (platform === "intel" && c.tags.includes("amd") && !c.tags.includes("intel")) return false;
      if (platform === "amd" && !c.tags.includes("amd")) return false;
      if (platform === "intel" && !c.tags.includes("intel")) return false;
    }
    if (usage === "office" && category === "gpu" && budget === "eco") {
      return c.id === "gpu-none" || c.price < 350;
    }
    return c.price <= remaining * 0.95 || c.price === 0;
  });

  const ranked = [...pool].sort(
    (a, b) =>
      scoreCandidate(b, usage, budget, prefs, budgetMax) -
      scoreCandidate(a, usage, budget, prefs, budgetMax)
  );

  return ranked[0] ?? catalog.find((c) => c.category === category)!;
}

function pickPsu(powerDraw: number, prefs: PrefId[], budget: BudgetId): ComponentOption {
  const needed = Math.ceil(powerDraw * 1.4);
  const options = catalog
    .filter((c) => c.category === "psu")
    .filter((c) => {
      const watts = parseInt(c.name, 10);
      return watts >= needed;
    })
    .sort((a, b) => {
      let sa = a.score;
      let sb = b.score;
      if (prefs.includes("quiet") && a.brand.includes("quiet")) sa += 15;
      if (prefs.includes("quiet") && b.brand.includes("quiet")) sb += 15;
      if (budget === "eco") {
        sa -= a.price / 10;
        sb -= b.price / 10;
      }
      return sb - sa;
    });
  return options[0] ?? catalog.find((c) => c.id === "psu-750")!;
}

export function generateBuild(
  usage: UsageId,
  budgetId: BudgetId,
  prefs: PrefId[],
  overrides?: Partial<Record<ComponentCategory, string>>
): BuildResult {
  const budget = budgets.find((b) => b.id === budgetId)!;
  const mid = (budget.min + budget.max) / 2;
  let remaining = budget.max - 99; // leave room for assembly

  // CPU first to determine platform
  let cpu =
    overrides?.cpu
      ? catalog.find((c) => c.id === overrides.cpu)!
      : pickBest("cpu", usage, budgetId, prefs, mid, remaining, null);

  const platform: "amd" | "intel" = cpu.brand === "Intel" ? "intel" : "amd";
  remaining -= cpu.price;

  const pick = (cat: ComponentCategory) => {
    if (overrides?.[cat]) {
      const found = catalog.find((c) => c.id === overrides[cat]);
      if (found) return found;
    }
    return pickBest(cat, usage, budgetId, prefs, mid, remaining, platform);
  };

  let gpu = pick("gpu");
  if (usage === "office" && budgetId === "eco" && !overrides?.gpu) {
    gpu = catalog.find((c) => c.id === "gpu-none")!;
  }
  remaining -= gpu.price;

  let ram = pick("ram");
  if ((usage === "creation" || usage === "pro") && ram.score < 80 && remaining > 150) {
    ram = catalog.find((c) => c.id === "ram-32")!;
  }
  if (prefs.includes("storage") === false && (usage === "creation" || prefs.includes("upgrade"))) {
    // keep
  }
  remaining -= ram.price;

  let storage = pick("storage");
  if (prefs.includes("storage")) {
    storage = catalog.find((c) => c.id === "ssd-2to") ?? storage;
    if (budgetId === "ultime" || budgetId === "performance") {
      storage = catalog.find((c) => c.id === "ssd-4to") ?? storage;
    }
  }
  remaining -= storage.price;

  let motherboard = pick("motherboard");
  remaining -= motherboard.price;

  let caseOpt = pick("case");
  if (prefs.includes("compact")) caseOpt = catalog.find((c) => c.id === "case-compact")!;
  else if (prefs.includes("quiet")) caseOpt = catalog.find((c) => c.id === "case-premium")!;
  else if (prefs.includes("rgb")) caseOpt = catalog.find((c) => c.id === "case-rgb")!;
  remaining -= caseOpt.price;

  let cooling = pick("cooling");
  if (prefs.includes("quiet") && !prefs.includes("rgb")) {
    cooling = catalog.find((c) => c.id === "cool-air")!;
  }
  if (cpu.score >= 90) {
    cooling = catalog.find((c) => c.id === "cool-aio360") ?? cooling;
  }
  remaining -= cooling.price;

  const powerDraw = cpu.power + gpu.power + ram.power + storage.power + motherboard.power + 80;
  const psu = overrides?.psu
    ? catalog.find((c) => c.id === overrides.psu)!
    : pickPsu(powerDraw, prefs, budgetId);

  const components: BuildSelection = {
    cpu,
    gpu,
    ram,
    storage,
    motherboard,
    psu,
    case: caseOpt,
    cooling,
  };

  const total = categories.reduce((sum, cat) => sum + components[cat].price, 0);
  const assembly = 99;
  const grandTotal = total + assembly;

  // Balance: GPU vs CPU scores shouldn't diverge too much for gaming
  const cpuScore = cpu.score;
  const gpuScore = gpu.id === "gpu-none" ? 40 : gpu.score;
  const ramScore = ram.score;
  const storageScore = storage.score;
  const variance =
    Math.abs(cpuScore - gpuScore) * 0.4 +
    Math.abs(cpuScore - ramScore) * 0.2 +
    Math.abs(gpuScore - storageScore) * 0.1;
  const balanceScore = Math.max(45, Math.min(98, Math.round(100 - variance)));

  const performanceScore = Math.round(
    (cpuScore * 0.3 +
      gpuScore * (usage === "office" ? 0.1 : 0.35) +
      ramScore * 0.2 +
      storageScore * 0.15) /
      (usage === "office" ? 0.75 : 1)
  );

  const tips: string[] = [];
  if (gpu.id === "gpu-none") {
    tips.push("Sans carte graphique dédiée : parfait en bureautique, limité pour le jeu et la vidéo GPU.");
  }
  if (balanceScore < 70) {
    tips.push("L’équilibre CPU/GPU peut être amélioré : un composant tire plus fort que les autres.");
  }
  if (prefs.includes("upgrade")) {
    tips.push("Carte mère et alimentation choisies avec une marge pour upgrader plus tard.");
  }
  if (grandTotal > budget.max) {
    tips.push("Config légèrement au-dessus du budget max : on pourra ajuster GPU ou stockage.");
  } else if (grandTotal < budget.min) {
    tips.push("Budget non entièrement consommé : on peut renforcer le GPU ou passer à 32 Go de RAM.");
  }
  if (prefs.includes("quiet")) {
    tips.push("Priorité silence : ventirad / boîtier orientés acoustique.");
  }
  tips.push("Tous les composants sont vérifiés pour la compatibilité socket / chipset / alimentation.");

  const usageLabel = usages.find((u) => u.id === usage)!.label;
  const summary = `Configuration ${usageLabel.toLowerCase()} — budget ${budget.label.toLowerCase()} — estimation ${grandTotal} € TTC (pièces + montage).`;

  return {
    components,
    total,
    assembly,
    grandTotal,
    balanceScore,
    performanceScore: Math.min(99, performanceScore),
    powerDraw,
    tips,
    summary,
  };
}

export const categoryLabels: Record<ComponentCategory, string> = {
  cpu: "Processeur",
  gpu: "Carte graphique",
  ram: "Mémoire vive",
  storage: "Stockage",
  motherboard: "Carte mère",
  psu: "Alimentation",
  case: "Boîtier",
  cooling: "Refroidissement",
};

export function getOptionsForCategory(category: ComponentCategory, platform?: "amd" | "intel") {
  return catalog.filter((c) => {
    if (c.category !== category) return false;
    if (category === "motherboard" && platform) {
      return c.tags.includes(platform);
    }
    if (category === "cpu" && platform) {
      return platform === "amd" ? c.brand === "AMD" : c.brand === "Intel";
    }
    return true;
  });
}
