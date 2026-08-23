export type Plan = "trial" | "essentiel" | "pro" | "expired";

export type Statut =
  | "en_attente"
  | "diagnostic"
  | "en_cours"
  | "en_attente_validation"
  | "pret"
  | "livre";

export type DevisStatut = "en_attente" | "accepte" | "refuse";

export type DevisType = "initial" | "supplementaire";

export type NotificationType =
  | "devis_accepte"
  | "devis_refuse"
  | "message_client";

export interface Garage {
  id: string;
  user_id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  telephone_mobile: string | null;
  email: string | null;
  logo_url: string | null;
  cachet_url: string | null;
  lien_avis: string | null;
  siret: string | null;
  tva_defaut: number | null;
  conditions_paiement: string | null;
  mentions_devis: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Dossier {
  id: string;
  garage_id: string;
  token_public: string;
  client_nom: string;
  client_telephone: string | null;
  client_email: string | null;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_immat: string;
  vehicule_annee: number | null;
  kilometrage: number | null;
  motif_entree: string | null;
  statut: Statut;
  date_entree: string;
  date_prevue_sortie: string | null;
  date_livraison: string | null;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DossierResume extends Dossier {
  nb_photos: number;
  devis_en_attente: number;
  messages_non_lus: number;
}

export interface Photo {
  id: string;
  dossier_id: string;
  url: string;
  legende: string | null;
  visible_client: boolean;
  created_at: string;
}

export interface LigneDevis {
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
}

export interface Devis {
  id: string;
  dossier_id: string;
  numero: string;
  type: DevisType;
  lignes: LigneDevis[];
  montant_ht: number;
  tva_pct: number;
  montant_ttc: number;
  description: string;
  statut: DevisStatut;
  signature_base64: string | null;
  signature_at: string | null;
  signe_par: string | null;
  facture_numero: string | null;
  facture_at: string | null;
  created_at: string;
}

export interface Prestation {
  id: string;
  garage_id: string;
  designation: string;
  prix_ht: number;
}

export interface Notification {
  id: string;
  garage_id: string;
  type: NotificationType;
  dossier_id: string;
  titre: string;
  corps: string;
  lu: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  dossier_id: string;
  auteur: "garage" | "client";
  contenu: string;
  lu: boolean;
  created_at: string;
}

export interface HistoriqueStatut {
  id: string;
  dossier_id: string;
  ancien_statut: Statut | null;
  nouveau_statut: Statut;
  note: string | null;
  created_at: string;
}

export interface DossierComplet {
  dossier: Dossier;
  photos: Photo[];
  devis: Devis[];
  messages: Message[];
  historique: HistoriqueStatut[];
}

export interface SuiviPublic {
  garage: Pick<
    Garage,
    | "nom"
    | "telephone"
    | "telephone_mobile"
    | "adresse"
    | "logo_url"
    | "lien_avis"
    | "plan"
  >;
  dossier: Dossier;
  photos: Photo[];
  devis: Devis[];
  messages: Message[];
  historique: HistoriqueStatut[];
}
