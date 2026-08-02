/** Fiches boutique enrichies (extraites des GUIDE.html LIVRAISON). */
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

export const outilsDetails: Record<string, OutilDetails> = {
  "changer-dns": {
    when: "Quand la navigation est lente, le DNS du FAI est capricieux, ou pour un réglage atelier standard.",
    features: [
      "Choisir un fournisseur DNS prédéfini.",
      "Appliquer la configuration sur les adaptateurs réseau actifs.",
      "Voir le journal des opérations dans l'interface.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence (une fois, avec Internet ou si déjà mémorisée a côté de l'EXE).",
      "Sélectionner le DNS souhaite.",
      "Cliquer sur Appliquer DNS.",
    ],
    tips: [
      "Un mauvais DNS peut couper temporairement la résolution de noms : notez le réglage precedent.",
      "après application, testez un site web ou un ping vers un nom (ex. restor-pc.fr).",
    ],
    exe: "Changer-DNS-GUI.exe",
    preview: "dns",
  },
  "controle-integrite": {
    when: "PC instable, erreurs systeme, après malware, ou avant une livraison client.",
    features: [
      "Lancer les controles d'intégrité Windows.",
      "Proposer la reparation si des fichiers système sont corrompus.",
      "Produire un rapport HTML lisible pour le client / l'atelier.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Lancer le controle (puis reparation si demande).",
      "Consulter le rapport génère.",
    ],
    tips: [
      "Prévoir du temps : DISM/SFC peuvent prendre 15 a 40 minutes.",
      "Ne pas éteindre le PC pendant la reparation.",
    ],
    exe: "Controle-Integrite-GUI.exe",
    preview: "system",
  },
  "createur-iso": {
    when: "réinstall Windows, atelier de déploiement, clé USB d'installation.",
    features: [
      "Travailler a partir d'une ISO ou d'un dossier sources.",
      "Personnaliser le media selon les options de l'interface.",
      "générer une ISO ou preparer une USB.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Choisir la source (ISO / dossier) et la destination.",
      "Lancer la generation / preparation USB.",
    ],
    tips: [
      "Utilisez une clé USB vide : le contenu peut être efface.",
      "Verifiez l'espace disque avant de générer une ISO.",
    ],
    exe: "Createur-ISO-GUI.exe",
    preview: "storage",
  },
  "desactiver-services": {
    when: "Optimisation légère, PC de test, ou services inutiles sur une machine dédiée.",
    features: [
      "Lister des services cibles avec leur état.",
      "désactiver la sélection.",
      "réactiver si besoin.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Cocher les services concernes.",
      "Cliquer sur désactiver ou réactiver.",
    ],
    tips: [
      "Ne desactivez pas de services dont vous ignorez le role.",
      "Sur un PC client, documentez ce qui a ete modifie.",
    ],
    exe: "Desactiver-Services-GUI.exe",
    preview: "system",
  },
  "export-identifiants": {
    when: "Migration de poste, recuperation controlee, inventaire atelier (avec accord client).",
    features: [
      "Collecter les informations d'identifiants accessibles.",
      "Produire un export pour migration / diagnostic atelier.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Choisir le dossier de sortie.",
      "Lancer l'export et sécuriser immédiatement le fichier.",
    ],
    tips: [
      "Donnees ultra sensibles : stocker sur support chiffré / supprimer après usage.",
      "Informer le client et obtenir son accord.",
    ],
    exe: "Exporter-Identifiants-GUI.exe",
    preview: "data",
  },
  "installateur-atelier": {
    when: "Nouveau PC atelier, réinstall tech, mise a niveau de la boite a outils.",
    features: [
      "Choisir les paquets a installer.",
      "Telecharger depuis Internet.",
      "Installer / preparer le poste atelier.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence (Internet requis).",
      "Sélectionner les paquets.",
      "Lancer le telechargement / installation.",
    ],
    tips: [
      "Prévoyez une connexion stable.",
      "Certains installateurs peuvent demander des confirmations Windows.",
    ],
    exe: "Telechargeur-GUI.exe",
    preview: "install",
  },
  "mapper-partages-reseau": {
    when: "Poste remplace, nouvelle session, acces NAS / serveur de fichiers.",
    features: [
      "Mapper des partages SMB vers des lettres de lecteur.",
      "Gerer reconnexion / identifiants selon les options de l'outil.",
    ],
    steps: [
      "Lancer l'EXE.",
      "Valider la licence.",
      "Verifier / renseigner les partages.",
      "Lancer le mapping.",
    ],
    tips: [
      "Le serveur / NAS doit être joignable.",
      "Verifiez les droits du compte Windows utilise.",
    ],
    exe: "Mapper-Partages-Reseau-GUI.exe",
    preview: "network",
  },
  "nettoyage-windows": {
    when: "Disque plein, PC lent, entretien periodique.",
    features: [
      "Estimer l'espace recuperable.",
      "Nettoyer caches / temporaires selon les options.",
      "Produire un compte-rendu.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Lancer une estimation si proposee, puis le nettoyage.",
      "Verifier l'espace libère.",
    ],
    tips: [
      "Fermez les navigateurs avant un nettoyage agressif des caches.",
      "Les fichiers personnels (Documents, Photos) ne sont pas la cible de cet outil.",
    ],
    exe: "Nettoyage-Windows-GUI.exe",
    preview: "system",
  },
  "pilotes-hors-ligne": {
    when: "avant réinstall Windows, PC sans Wi-Fi Ethernet, atelier migration.",
    features: [
      "Exporter les drivers du PC actuel vers un dossier / USB.",
      "Reutiliser le pack sur le meme materiel après réinstall.",
    ],
    steps: [
      "avant formatage : lancer l'EXE puis exporter vers la USB.",
      "après réinstall : reinstaller les pilotes depuis ce dossier.",
      "Valider la licence une fois (idéalement avant formatage, EXE + .rpc-key a garder ensemble).",
    ],
    tips: [
      "Exportez toujours avant de formater.",
      "Idéal en combo avec Sauvegarde Wi-Fi sur la meme clé.",
    ],
    exe: "Exporter-Pilotes-GUI.exe",
    preview: "storage",
  },
  "rapport-batterie": {
    when: "Portable qui tient mal la charge, devis batterie, diagnostic client.",
    features: [
      "Collecter capacite conception vs capacite actuelle.",
      "Produire un rapport HTML avec verdict atelier.",
    ],
    steps: [
      "Brancher éventuellement le chargeur.",
      "Lancer l'EXE.",
      "Valider la licence.",
      "générer le rapport et l'ouvrir.",
    ],
    tips: [
      "Uniquement sur PC portables.",
      "Le verdict aide le devis ; confirmez avec le ressenti client.",
    ],
    exe: "Rapport-Batterie-GUI.exe",
    preview: "battery",
  },
  "rapport-logiciels": {
    when: "avant réinstall, inventaire parc, migration de poste.",
    features: ["Lister les applications installés.", "Exporter un rapport exploitable."],
    steps: [
      "Lancer l'EXE.",
      "Valider la licence.",
      "générer le rapport.",
      "Archiver le fichier avec le dossier client.",
    ],
    tips: [
      "Certaines apps Microsoft Store / portables peuvent être absentes.",
      "Utile avant sauvegarde profils navigateur / réinstall.",
    ],
    exe: "Rapport-Logiciels-GUI.exe",
    preview: "data",
  },
  "reset-reseau-complet": {
    when: "réseau casse, DNS défaillant, proxy bloque, après malware / VPN défaillant.",
    features: [
      "Sauvegarder l'état réseau (ipconfig, routes, profils WLAN).",
      "Reset Winsock, IPv4/IPv6, cache DNS, proxy WinHTTP.",
      "Option: cyclage adaptateurs et reset pare-feu.",
      "générer un rapport HTML + dossier dump.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Choisir les options (adaptateurs / pare-feu).",
      "Lancer le reset, puis redemarrer le PC.",
    ],
    tips: [
      "Redemarrez toujours après un reset réseau.",
      "Le reset pare-feu est optionnel et remet les regles par defaut.",
      "Les dumps sont dans Documents\\Restor-PC\\NetReset.",
    ],
    exe: "Reset-Reseau-Complet-GUI.exe",
    preview: "network",
  },
  "sauvegarde-profils-navigateur": {
    when: "réinstall Windows, changement de machine, sauvegarde preventive.",
    features: [
      "Exporter les profils navigateur vers un dossier / USB.",
      "Restaurer après réinstall ou sur un nouveau PC.",
    ],
    steps: [
      "Fermer les navigateurs.",
      "Lancer l'EXE.",
      "Valider la licence.",
      "Exporter vers la USB, puis Restaurer après réinstall.",
    ],
    tips: [
      "Fermez Chrome / Edge / Firefox avant export ou restore.",
      "Les mots de passe dependent du navigateur et du chiffrement du profil.",
    ],
    exe: "Exporter-Profils-Navigateur-GUI.exe",
    preview: "data",
  },
  "sauvegarde-usb": {
    when: "avant réinstall, depannage, migration rapide Documents/Bureau/etc.",
    features: [
      "Sélectionner sources et destination USB.",
      "Lancer une sauvegarde fichier vers le support externe.",
      "Suivre la progression / journal.",
    ],
    steps: [
      "Brancher la clé USB.",
      "Lancer l'EXE.",
      "Valider la licence.",
      "Choisir ce qu'il faut sauver puis lancer la copie.",
    ],
    tips: ["Verifiez l'espace libre sur la USB.", "Ne pas retirer la clé pendant la copie."],
    exe: "Sauvegarde-USB-GUI.exe",
    preview: "storage",
  },
  "sauvegarde-wifi": {
    when: "avant toute réinstall Windows sur portable / PC Wi-Fi uniquement.",
    features: [
      "Exporter les profils Wi-Fi vers un dossier / USB (avec rapport HTML).",
      "Restaurer les profils après formatage pour retrouver le réseau immédiatement.",
    ],
    steps: [
      "avant réinstall (PC encore en ligne) : lancer depuis la USB, Exporter, valider la licence une fois.",
      "Un fichier .rpc-key-wifi-backup est écrit a côté de l'EXE.",
      "après réinstall (sans Internet) : lancer l'EXE depuis la USB puis Restaurer.",
    ],
    tips: [
      "Sans export avant formatage, les mots de passe Wi-Fi sont perdus.",
      "Gardez l'EXE + le fichier .rpc-key-* + le dossier Profils sur la meme clé.",
    ],
    exe: "Exporter-Profils-WiFi-GUI.exe",
    preview: "network",
  },
  "telemetrie-windows": {
    when: "Client qui veut moins de collecte Microsoft, PC atelier, optimisation vie privee.",
    features: [
      "Arreter / désactiver DiagTrack et dmwappushservice.",
      "désactiver les taches CEIP / Appraiser.",
      "Appliquer (optionnel) les politiques registre AllowTelemetry / CEIP.",
      "Produire un rapport HTML.",
    ],
    steps: [
      "Lancer l'EXE en administrateur.",
      "Valider la licence.",
      "Choisir désactiver ou réactiver.",
      "Appliquer, puis redemarrer si desactivation.",
    ],
    tips: [
      "Ce n'est PAS un debloat : aucune application n'est désinstallée.",
      "Un redémarrage est recommandé après désactivation.",
    ],
    exe: "Telemetrie-Windows-GUI.exe",
    preview: "system",
  },
  "test-reseau-dual-pro": {
    when: "Diag FAI, devis fibre, verifier si IPv6 est plus lent, atelier réseau.",
    features: [
      "Detecter les IP locales IPv4/IPv6 (ignore les adaptateurs virtuels).",
      "Lancer Speedtest par famille IP (IPv4 forcee, IPv6 auto).",
      "Comparer ping / débit desc / asc.",
      "Exporter CSV + rapport HTML.",
    ],
    steps: [
      "Installer Speedtest CLI (ou laisser Auto-install).",
      "Lancer l'EXE, valider la licence.",
      "Laisser Serveurs = auto (recommandé) et Runs = 1+.",
      "Lancer le test (environ 1 min par run IPv4+IPv6).",
    ],
    tips: [
      "Serveurs = auto : les IDs fixes cassent souvent le bind IPv4/IPv6.",
      "Prévoir ~1 minute par run (IPv4 + IPv6).",
      "IPv6 vide = souvent pas d'IPv6 chez le FAI / box.",
      "CSV dans Documents\\Restor-PC\\NetTest.",
    ],
    exe: "Test-Reseau-Dual-Pro-GUI.exe",
    preview: "network",
  },
  "pack-complet": {
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
  },
} as const;

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
