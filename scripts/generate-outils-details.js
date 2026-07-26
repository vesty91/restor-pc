const fs = require("fs");
const path = require("path");

const root = "c:/Users/Jeux/Desktop/test/mes-script-LIVRAISON";
const outTs = "c:/Users/Jeux/Desktop/test/restor-pc/src/lib/data/outils-details.ts";

const folderToSlug = {
  "Changer-DNS": "changer-dns",
  "Controle-Integrite": "controle-integrite",
  "Createur-ISO": "createur-iso",
  "Desactiver-Services": "desactiver-services",
  "Export-Identifiants": "export-identifiants",
  "Installateur-Atelier": "installateur-atelier",
  "Mapper-Partages-Reseau": "mapper-partages-reseau",
  "Nettoyage-Windows": "nettoyage-windows",
  "Pilotes-Hors-Ligne": "pilotes-hors-ligne",
  "Rapport-Batterie": "rapport-batterie",
  "Rapport-Logiciels": "rapport-logiciels",
  "Reset-Reseau-Complet": "reset-reseau-complet",
  "Sauvegarde-Profils-Navigateur": "sauvegarde-profils-navigateur",
  "Sauvegarde-USB": "sauvegarde-usb",
  "Sauvegarde-WiFi": "sauvegarde-wifi",
  "Telemetrie-Windows": "telemetrie-windows",
  "Test-Reseau-Dual-Pro": "test-reseau-dual-pro",
};

function decode(s) {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function accentFix(s) {
  return s
    .replace(/\bpredefini\b/gi, "prédéfini")
    .replace(/\breseau\b/gi, "réseau")
    .replace(/\bReseau\b/g, "Réseau")
    .replace(/\bintegrite\b/gi, "intégrité")
    .replace(/\bIntegrite\b/g, "Intégrité")
    .replace(/\brepare\b/gi, "répare")
    .replace(/\bVerifie\b/g, "Vérifie")
    .replace(/\bverifie\b/gi, "vérifie")
    .replace(/\beteindre\b/gi, "éteindre")
    .replace(/\bdesactive\b/gi, "désactive")
    .replace(/\bDesactive\b/g, "Désactive")
    .replace(/\breactive\b/gi, "réactive")
    .replace(/\betat\b/gi, "état")
    .replace(/\benregistres\b/gi, "enregistrés")
    .replace(/\bTelecharge\b/g, "Télécharge")
    .replace(/\btelecharge\b/gi, "télécharge")
    .replace(/\bselection\b/gi, "sélection")
    .replace(/\bSelectionner\b/g, "Sélectionner")
    .replace(/\bselectionner\b/gi, "sélectionner")
    .replace(/\bdeja\b/gi, "déjà")
    .replace(/\bcote\b/gi, "côté")
    .replace(/\bmemoiree\b/gi, "mémorisée")
    .replace(/\bmemorisee\b/gi, "mémorisée")
    .replace(/\bgenerer\b/gi, "générer")
    .replace(/\bGenerer\b/g, "Générer")
    .replace(/\bcle\b/gi, "clé")
    .replace(/\bCle\b/g, "Clé")
    .replace(/\beface\b/gi, "effacé")
    .replace(/\bsante\b/gi, "santé")
    .replace(/\ba surveiller\b/gi, "à surveiller")
    .replace(/\ba changer\b/gi, "à changer")
    .replace(/\beventuellement\b/gi, "éventuellement")
    .replace(/\binstallees\b/gi, "installées")
    .replace(/\binstalles\b/gi, "installés")
    .replace(/\bRemet a zero\b/g, "Remet à zéro")
    .replace(/\ba zero\b/gi, "à zéro")
    .replace(/\bfoireux\b/gi, "défaillant")
    .replace(/\bdebit\b/gi, "débit")
    .replace(/\bPrevoir\b/g, "Prévoir")
    .replace(/\bprevoir\b/gi, "prévoir")
    .replace(/\brecommande\b/gi, "recommandé")
    .replace(/\bRecommande\b/g, "Recommandé")
    .replace(/\bdesactiver\b/gi, "désactiver")
    .replace(/\bDesactiver\b/g, "Désactiver")
    .replace(/\breactiver\b/gi, "réactiver")
    .replace(/\btelemetrie\b/gi, "télémétrie")
    .replace(/\bTelemetrie\b/g, "Télémétrie")
    .replace(/\bpolitiques\b/gi, "politiques")
    .replace(/\bdesinstallee\b/gi, "désinstallée")
    .replace(/\bdesinstaller\b/gi, "désinstaller")
    .replace(/\bapres\b/gi, "après")
    .replace(/\bApres\b/g, "Après")
    .replace(/\bavant\b/gi, "avant")
    .replace(/\betre\b/gi, "être")
    .replace(/\becrire\b/gi, "écrire")
    .replace(/\becrit\b/gi, "écrit")
    .replace(/\bimmediatement\b/gi, "immédiatement")
    .replace(/\bsecuriser\b/gi, "sécuriser")
    .replace(/\bchiffre\b/gi, "chiffré")
    .replace(/\bagreement\b/gi, "accord")
    .replace(/\bideale?ment\b/gi, "idéalement")
    .replace(/\bIdeal\b/g, "Idéal")
    .replace(/\bideale?\b/gi, "idéal")
    .replace(/\bPrevoyez\b/g, "Prévoyez")
    .replace(/\bprevoyez\b/gi, "prévoyez")
    .replace(/\bconnex?ion\b/gi, "connexion")
    .replace(/\blibere\b/gi, "libère")
    .replace(/\bsecurite\b/gi, "sécurité")
    .replace(/\breinstall\b/gi, "réinstall")
    .replace(/\bReinstall\b/g, "Réinstall")
    .replace(/\bpersonnalise\b/gi, "personnalise")
    .replace(/\bPrepare\b/g, "Prépare")
    .replace(/\bprepare\b/gi, "prépare")
    .replace(/\bdeploiement\b/gi, "déploiement")
    .replace(/\blegere\b/gi, "légère")
    .replace(/\bdediee\b/gi, "dédiée")
    .replace(/\betait\b/gi, "était")
    .replace(/\bcree\b/gi, "crée")
    .replace(/\bgenere\b/gi, "génère")
    .replace(/\bGenere\b/g, "Génère")
    .replace(/\bproduit\b/gi, "produit")
    .replace(/\breadable\b/gi, "lisible")
    .replace(/\bfichiers? systeme\b/gi, "fichiers système")
    .replace(/\badaptateurs\b/gi, "adaptateurs")
    .replace(/\boperations\b/gi, "opérations")
    .replace(/\bresolution\b/gi, "résolution")
    .replace(/\breglage\b/gi, "réglage")
    .replace(/\breglages?\b/gi, (m) => (m.endsWith("s") ? "réglages" : "réglage"))
    .replace(/\bcapricieux\b/gi, "capricieux")
    .replace(/\bstandard\b/gi, "standard")
    .replace(/\bDocuments\\\\Restor-PC\\\\/g, "Documents\\Restor-PC\\")
    .replace(/\\\\/g, "\\");
}

function sectionLis(html, titlePartial) {
  const re = new RegExp(
    `<h2>[^<]*${titlePartial}[^<]*</h2>([\\s\\S]*?)(?=<h2>|</section>|<div class="grid2")`,
    "i"
  );
  const m = html.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) =>
    accentFix(decode(x[1].replace(/<[^>]+>/g, "")))
  );
}

function callout(html) {
  const m = html.match(/Quand l'utiliser :<\/strong>\s*([\s\S]*?)<\/div>/i);
  return m ? accentFix(decode(m[1])) : "";
}

function exe(html) {
  const m = html.match(/Executable : <code>([^<]+)<\/code>/i);
  return m ? m[1] : "";
}

function previewKind(slug) {
  if (slug.includes("dns")) return "dns";
  if (slug.includes("reseau") || slug.includes("wifi") || slug.includes("partages")) return "network";
  if (slug.includes("batterie")) return "battery";
  if (slug.includes("iso") || slug.includes("usb") || slug.includes("pilotes")) return "storage";
  if (slug.includes("nettoyage") || slug.includes("integrite") || slug.includes("telemetrie") || slug.includes("services"))
    return "system";
  if (slug.includes("navigateur") || slug.includes("logiciels") || slug.includes("identifiants")) return "data";
  if (slug.includes("installateur")) return "install";
  if (slug.includes("test-reseau")) return "speed";
  return "generic";
}

const details = {};

for (const [folder, slug] of Object.entries(folderToSlug)) {
  const p = path.join(root, folder, "GUIDE.html");
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, "utf8");
  const features = sectionLis(html, "A quoi");
  const steps = sectionLis(html, "Mode d");
  const tips = sectionLis(html, "Conseils");
  details[slug] = {
    when: callout(html),
    features: features.length ? features : ["Interface graphique Restor-PC.", "Guide HTML / PDF inclus."],
    steps: steps.length ? steps : ["Lancer l'EXE.", "Valider la licence.", "Suivre l'assistant."],
    tips: tips.length ? tips : ["Conservez le ZIP et la clé de licence."],
    exe: exe(html) || `${folder}-GUI.exe`,
    preview: previewKind(slug),
  };
}

details["pack-complet"] = {
  when: "Atelier / tech qui veut toute la boîte à outils Restor-PC sur un seul PC licencié.",
  features: [
    "Les 17 outils validés LIVRAISON dans un seul pack.",
    "Une licence pack (script_id *) liée à 1 PC.",
    "Guides HTML / PDF pour chaque outil.",
    "Idéal dépannage, migrations et interventions domicile.",
  ],
  steps: [
    "Télécharger le ZIP pack après paiement.",
    "Dézipper sur le PC atelier.",
    "Activer la licence une fois (Internet).",
    "Lancer l'outil souhaité selon le besoin client.",
  ],
  tips: [
    "La licence pack est liée au premier PC d'activation.",
    "Conservez une copie du ZIP sur votre NAS atelier.",
  ],
  exe: "RestorPC-Outils-LIVRAISON.zip",
  preview: "pack",
};

const body = `/** Fiches boutique enrichies (extraites des GUIDE.html LIVRAISON). */
export type OutilPreviewKind =
  | "dns"
  | "network"
  | "battery"
  | "storage"
  | "system"
  | "data"
  | "install"
  | "speed"
  | "pack"
  | "generic";

export type OutilDetails = {
  when: string;
  features: string[];
  steps: string[];
  tips: string[];
  exe: string;
  preview: OutilPreviewKind;
};

export const outilsDetails: Record<string, OutilDetails> = ${JSON.stringify(details, null, 2)};

export function getOutilDetails(slug: string): OutilDetails {
  return (
    outilsDetails[slug] ?? {
      when: "Outil atelier Restor-PC.",
      features: ["Interface graphique.", "Guide inclus."],
      steps: ["Lancer l'EXE.", "Valider la licence.", "Utiliser l'outil."],
      tips: ["Support : contact@restor-pc.fr"],
      exe: "outil.exe",
      preview: "generic",
    }
  );
}
`;

fs.writeFileSync(outTs, body.replace(/"preview":/g, "preview:").replace(/"when":/g, "when:").replace(/"features":/g, "features:").replace(/"steps":/g, "steps:").replace(/"tips":/g, "tips:").replace(/"exe":/g, "exe:"), "utf8");
// Actually JSON.stringify already quoted keys which is fine in TS
fs.writeFileSync(outTs, `/** Fiches boutique enrichies (extraites des GUIDE.html LIVRAISON). */
export type OutilPreviewKind =
  | "dns"
  | "network"
  | "battery"
  | "storage"
  | "system"
  | "data"
  | "install"
  | "speed"
  | "pack"
  | "generic";

export type OutilDetails = {
  when: string;
  features: string[];
  steps: string[];
  tips: string[];
  exe: string;
  preview: OutilPreviewKind;
};

export const outilsDetails: Record<string, OutilDetails> = ${JSON.stringify(details, null, 2)} as const;

export function getOutilDetails(slug: string): OutilDetails {
  return (
    outilsDetails[slug] ?? {
      when: "Outil atelier Restor-PC.",
      features: ["Interface graphique.", "Guide inclus."],
      steps: ["Lancer l'EXE.", "Valider la licence.", "Utiliser l'outil."],
      tips: ["Support : contact@restor-pc.fr"],
      exe: "outil.exe",
      preview: "generic" as const,
    }
  );
}
`, "utf8");
console.log("wrote", Object.keys(details).length, "details");
