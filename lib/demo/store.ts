import { randomUUID } from "crypto";
import type {
  Devis,
  Dossier,
  Garage,
  HistoriqueStatut,
  Message,
  Notification,
  Photo,
  Prestation,
  Statut,
} from "../types";
import { photoPlaceholder } from "./placeholder";

interface DemoDb {
  garage: Garage;
  dossiers: Dossier[];
  photos: Photo[];
  devis: Devis[];
  messages: Message[];
  historique: HistoriqueStatut[];
  prestations: Prestation[];
  notifications: Notification[];
  compteurDevis: number;
}

function ilYa(jours: number, heures = 0): string {
  return new Date(
    Date.now() - jours * 86400000 - heures * 3600000
  ).toISOString();
}

function dans(jours: number): string {
  return new Date(Date.now() + jours * 86400000).toISOString();
}

function seed(): DemoDb {
  const garage: Garage = {
    id: "demo-garage",
    user_id: "demo-user",
    nom: "Garage Lemoine",
    adresse: "14 rue des Ateliers, 93430 Villetaneuse",
    telephone: "01 48 22 61 90",
    telephone_mobile: "06 12 98 45 30",
    email: "contact@garage-lemoine.fr",
    logo_url: null,
    cachet_url: null,
    siret: "812 456 789 00023",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan: "trial",
    trial_ends_at: dans(11),
    created_at: ilYa(3),
  };

  const dossiers: Dossier[] = [];
  const photos: Photo[] = [];
  const devis: Devis[] = [];
  const messages: Message[] = [];
  const historique: HistoriqueStatut[] = [];

  const pousse = (
    d: Omit<
      Dossier,
      "id" | "garage_id" | "token_public" | "created_at" | "updated_at"
    > & { id?: string; token?: string }
  ): Dossier => {
    const { id, token, ...reste } = d;
    const dossier: Dossier = {
      id: id ?? randomUUID(),
      garage_id: garage.id,
      token_public: token ?? id ?? randomUUID(),
      created_at: d.date_entree,
      updated_at: d.date_entree,
      ...reste,
    };
    dossiers.push(dossier);
    return dossier;
  };

  const trace = (d: Dossier, etapes: [Statut | null, Statut, number, number?][]) => {
    for (const [ancien, nouveau, j, h] of etapes) {
      historique.push({
        id: randomUUID(),
        dossier_id: d.id,
        ancien_statut: ancien,
        nouveau_statut: nouveau,
        note: null,
        created_at: ilYa(j, h ?? 0),
      });
    }
  };

  // ── Dossier 1 : en attente de validation (le cas vitrine, token fixe pour la démo)
  const d1 = pousse({
    id: "demo-1",
    token: "demo",
    client_nom: "Karim Benaïssa",
    client_telephone: "06 12 44 87 30",
    client_email: "k.benaissa@gmail.com",
    vehicule_marque: "Peugeot",
    vehicule_modele: "308 1.5 BlueHDi",
    vehicule_immat: "GD-482-KV",
    vehicule_annee: 2019,
    kilometrage: 96400,
    motif_entree:
      "Bruit métallique au freinage, vibrations dans la pédale à haute vitesse.",
    statut: "en_attente_validation",
    date_entree: ilYa(2, 3),
    date_prevue_sortie: dans(2),
    date_livraison: null,
    notes_internes:
      "Disques avant limite mini. Prévoir contrôle rotules pendant qu'elle est sur le pont.",
  });
  trace(d1, [
    [null, "en_attente", 2, 3],
    ["en_attente", "diagnostic", 2, 1],
    ["diagnostic", "en_cours", 1, 6],
    ["en_cours", "en_attente_validation", 0, 4],
  ]);
  photos.push(
    {
      id: randomUUID(),
      dossier_id: d1.id,
      url: photoPlaceholder("Plaquettes avant côté droit", 215),
      legende: "Plaquettes avant usées à 90 %",
      visible_client: true,
      created_at: ilYa(2, 1),
    },
    {
      id: randomUUID(),
      dossier_id: d1.id,
      url: photoPlaceholder("Disque avant droit", 25),
      legende: "Disque avant rayé, sous la cote mini",
      visible_client: true,
      created_at: ilYa(2, 1),
    },
    {
      id: randomUUID(),
      dossier_id: d1.id,
      url: photoPlaceholder("Véhicule sur le pont", 150),
      legende: null,
      visible_client: true,
      created_at: ilYa(2, 2),
    }
  );
  devis.push(
    {
      id: "demo-devis-1a",
      dossier_id: d1.id,
      numero: "DEV-2026-0031",
      type: "initial",
      lignes: [
        { designation: "Plaquettes de frein avant (jeu)", quantite: 1, prix_unitaire_ht: 58 },
        { designation: "Main d'œuvre — remplacement plaquettes", quantite: 1, prix_unitaire_ht: 55 },
      ],
      montant_ht: 113,
      tva_pct: 20,
      montant_ttc: 135.6,
      description: "Devis d'entrée : freinage avant.",
      statut: "accepte",
      signature_base64: null,
      signature_at: ilYa(2, 2),
      signe_par: "Karim Benaïssa",
      created_at: ilYa(2, 3),
    },
    {
      id: "demo-devis-1b",
      dossier_id: d1.id,
      numero: "DEV-2026-0034",
      type: "supplementaire",
      lignes: [
        { designation: "Disque de frein avant (Brembo)", quantite: 2, prix_unitaire_ht: 68.25 },
        { designation: "Main d'œuvre — remplacement disques", quantite: 1, prix_unitaire_ht: 100 },
      ],
      montant_ht: 236.5,
      tva_pct: 20,
      montant_ttc: 283.8,
      description:
        "Disques avant constatés sous la cote minimale lors du remplacement des plaquettes.",
      statut: "en_attente",
      signature_base64: null,
      signature_at: null,
      signe_par: null,
      created_at: ilYa(0, 4),
    }
  );
  messages.push(
    {
      id: randomUUID(),
      dossier_id: d1.id,
      auteur: "client",
      contenu: "Bonjour, est-ce que la voiture sera prête pour vendredi ? Merci",
      lu: true,
      created_at: ilYa(1, 5),
    },
    {
      id: randomUUID(),
      dossier_id: d1.id,
      auteur: "garage",
      contenu:
        "Bonjour, oui si vous validez le devis des disques aujourd'hui, elle sera prête vendredi midi.",
      lu: true,
      created_at: ilYa(1, 4),
    },
    {
      id: randomUUID(),
      dossier_id: d1.id,
      auteur: "client",
      contenu: "D'accord je regarde ça ce soir.",
      lu: false,
      created_at: ilYa(0, 2),
    }
  );

  // ── Dossier 2 : réparation en cours
  const d2 = pousse({
    id: "demo-2",
    client_nom: "Marie Deschamps",
    client_telephone: "06 74 20 15 62",
    client_email: null,
    vehicule_marque: "Renault",
    vehicule_modele: "Clio V TCe 90",
    vehicule_immat: "FH-256-ZR",
    vehicule_annee: 2021,
    kilometrage: 43200,
    motif_entree: "Révision complète + voyant pression pneus allumé.",
    statut: "en_cours",
    date_entree: ilYa(1, 2),
    date_prevue_sortie: dans(1),
    date_livraison: null,
    notes_internes: "Capteur TPMS avant gauche HS, remplacé.",
  });
  trace(d2, [
    [null, "en_attente", 1, 2],
    ["en_attente", "en_cours", 0, 6],
  ]);
  photos.push({
    id: randomUUID(),
    dossier_id: d2.id,
    url: photoPlaceholder("Vidange + filtres", 200),
    legende: "Révision : vidange et remplacement des filtres",
    visible_client: true,
    created_at: ilYa(0, 5),
  });

  // ── Dossier 3 : prêt à récupérer
  const d3 = pousse({
    id: "demo-3",
    client_nom: "Antoine Perrot",
    client_telephone: "07 61 38 29 44",
    client_email: "a.perrot@outlook.fr",
    vehicule_marque: "Volkswagen",
    vehicule_modele: "Golf 7 GTD",
    vehicule_immat: "EK-914-TC",
    vehicule_annee: 2017,
    kilometrage: 128700,
    motif_entree: "Embrayage qui patine en côte.",
    statut: "pret",
    date_entree: ilYa(4),
    date_prevue_sortie: ilYa(0, 6),
    date_livraison: null,
    notes_internes: "Kit embrayage + volant moteur. RAS à l'essai routier.",
  });
  trace(d3, [
    [null, "en_attente", 4],
    ["en_attente", "diagnostic", 3, 20],
    ["diagnostic", "en_attente_validation", 3, 8],
    ["en_attente_validation", "en_cours", 2, 12],
    ["en_cours", "pret", 0, 6],
  ]);
  devis.push({
    id: "demo-devis-3",
    dossier_id: d3.id,
    numero: "DEV-2026-0028",
    type: "initial",
    lignes: [
      { designation: "Kit embrayage complet (LUK)", quantite: 1, prix_unitaire_ht: 430 },
      { designation: "Volant moteur bi-masse", quantite: 1, prix_unitaire_ht: 275 },
      { designation: "Main d'œuvre — dépose/repose boîte (5 h)", quantite: 5, prix_unitaire_ht: 55 },
    ],
    montant_ht: 980,
    tva_pct: 20,
    montant_ttc: 1176,
    description:
      "Remplacement kit embrayage complet + volant moteur bi-masse (LUK).",
    statut: "accepte",
    signature_base64: null,
    signature_at: ilYa(2, 14),
    signe_par: "Antoine Perrot",
    created_at: ilYa(3, 8),
  });
  photos.push(
    {
      id: randomUUID(),
      dossier_id: d3.id,
      url: photoPlaceholder("Ancien embrayage déposé", 15),
      legende: "Disque d'embrayage usé jusqu'aux rivets",
      visible_client: true,
      created_at: ilYa(2, 10),
    },
    {
      id: randomUUID(),
      dossier_id: d3.id,
      url: photoPlaceholder("Kit neuf monté", 130),
      legende: "Kit embrayage neuf monté",
      visible_client: true,
      created_at: ilYa(1, 3),
    }
  );

  // ── Dossier 4 : diagnostic
  const d4 = pousse({
    id: "demo-4",
    client_nom: "Fatou N'Diaye",
    client_telephone: "06 99 51 07 18",
    client_email: null,
    vehicule_marque: "Citroën",
    vehicule_modele: "C3 PureTech 82",
    vehicule_immat: "DW-703-LM",
    vehicule_annee: 2016,
    kilometrage: 87950,
    motif_entree: "Voyant moteur allumé, perte de puissance par moments.",
    statut: "diagnostic",
    date_entree: ilYa(0, 5),
    date_prevue_sortie: null,
    date_livraison: null,
    notes_internes: "Passage valise prévu en fin de journée.",
  });
  trace(d4, [
    [null, "en_attente", 0, 5],
    ["en_attente", "diagnostic", 0, 3],
  ]);

  // ── Dossier 5 : en attente
  pousse({
    id: "demo-5",
    client_nom: "Lucas Marinho",
    client_telephone: "07 82 64 90 31",
    client_email: "lucas.marinho@free.fr",
    vehicule_marque: "Dacia",
    vehicule_modele: "Duster dCi 110",
    vehicule_immat: "CS-158-QP",
    vehicule_annee: 2015,
    kilometrage: 154300,
    motif_entree: "Contrôle technique refusé : jeu dans la direction, plaquettes arrière.",
    statut: "en_attente",
    date_entree: ilYa(0, 1),
    date_prevue_sortie: dans(3),
    date_livraison: null,
    notes_internes: null,
  });

  // ── Dossier 6 : livré (historique)
  const d6 = pousse({
    id: "demo-6",
    client_nom: "Nadia Belkacem",
    client_telephone: "06 45 12 78 03",
    client_email: "nadia.belk@gmail.com",
    vehicule_marque: "Toyota",
    vehicule_modele: "Yaris Hybride",
    vehicule_immat: "FR-329-HD",
    vehicule_annee: 2020,
    kilometrage: 61500,
    motif_entree: "Pneus avant + géométrie.",
    statut: "livre",
    date_entree: ilYa(7),
    date_prevue_sortie: ilYa(6),
    date_livraison: ilYa(6, 2),
    notes_internes: null,
  });
  trace(d6, [
    [null, "en_attente", 7],
    ["en_attente", "en_cours", 6, 20],
    ["en_cours", "pret", 6, 8],
    ["pret", "livre", 6, 2],
  ]);
  devis.push({
    id: "demo-devis-6",
    dossier_id: d6.id,
    numero: "DEV-2026-0019",
    type: "initial",
    lignes: [
      { designation: "Pneu avant 185/65 R15 (monté équilibré)", quantite: 2, prix_unitaire_ht: 74 },
      { designation: "Géométrie train avant", quantite: 1, prix_unitaire_ht: 60 },
    ],
    montant_ht: 208,
    tva_pct: 20,
    montant_ttc: 249.6,
    description: "Pneus avant + géométrie.",
    statut: "accepte",
    signature_base64: null,
    signature_at: ilYa(6, 22),
    signe_par: "Nadia Belkacem",
    created_at: ilYa(7),
  });

  // ── Catalogue de prestations réutilisables
  const prestations: Prestation[] = [
    ["Vidange + filtre à huile", 89],
    ["Plaquettes de frein avant (jeu)", 58],
    ["Plaquettes de frein arrière (jeu)", 52],
    ["Disque de frein (l'unité)", 68.25],
    ["Forfait distribution (kit)", 320],
    ["Pneu tourisme (monté équilibré)", 74],
    ["Géométrie train avant", 60],
    ["Diagnostic électronique (valise)", 45],
    ["Main d'œuvre — taux horaire", 55],
    ["Contrôle et recharge climatisation", 79],
  ].map(([designation, prix_ht]) => ({
    id: randomUUID(),
    garage_id: garage.id,
    designation: designation as string,
    prix_ht: prix_ht as number,
  }));

  // ── Notifications (le garage doit être au courant)
  const notifications: Notification[] = [
    {
      id: randomUUID(),
      garage_id: garage.id,
      type: "message_client",
      dossier_id: d1.id,
      titre: "Nouveau message — Karim Benaïssa",
      corps: "D'accord je regarde ça ce soir.",
      lu: false,
      created_at: ilYa(0, 2),
    },
    {
      id: randomUUID(),
      garage_id: garage.id,
      type: "devis_accepte",
      dossier_id: d3.id,
      titre: "Devis accepté — Antoine Perrot",
      corps: "Devis DEV-2026-0028 signé (1 176,00 € TTC).",
      lu: true,
      created_at: ilYa(2, 14),
    },
  ];

  return {
    garage,
    dossiers,
    photos,
    devis,
    messages,
    historique,
    prestations,
    notifications,
    compteurDevis: 34,
  };
}

const globalStore = globalThis as unknown as { __mecatrackDemo?: DemoDb };

export function demoDb(): DemoDb {
  if (!globalStore.__mecatrackDemo) {
    globalStore.__mecatrackDemo = seed();
  }
  return globalStore.__mecatrackDemo;
}

export function resetDemo(): void {
  globalStore.__mecatrackDemo = seed();
}
