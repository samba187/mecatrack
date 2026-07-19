import { z } from "zod";

const telephone = z
  .string()
  .trim()
  .regex(/^(\+33|0)[1-9]([ .\-]?\d{2}){4}$/, "Numéro de téléphone invalide")
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v));

const optionnel = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

// Image envoyée sous forme de data URL (redimensionnée côté client) ou vide.
const imageOptionnelle = z
  .string()
  .trim()
  .max(3_000_000, "Image trop lourde")
  .refine((v) => v === "" || v.startsWith("data:image/"), "Image invalide")
  .transform((v) => (v === "" ? null : v));

export const schemaNouveauDossier = z.object({
  client_nom: z.string().trim().min(2, "Le nom du client est obligatoire"),
  client_telephone: telephone,
  client_email: z
    .string()
    .trim()
    .email("Email invalide")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  vehicule_marque: z.string().trim().min(1, "La marque est obligatoire"),
  vehicule_modele: z.string().trim().min(1, "Le modèle est obligatoire"),
  vehicule_immat: z
    .string()
    .trim()
    .min(4, "L'immatriculation est obligatoire")
    .transform((v) => v.toUpperCase()),
  vehicule_annee: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z
      .number()
      .int()
      .min(1950)
      .max(new Date().getFullYear() + 1)
      .nullable()
      .catch(null)
  ),
  kilometrage: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(0).nullable().catch(null)
  ),
  motif_entree: optionnel,
  date_prevue_sortie: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : new Date(v).toISOString())),
  notes_internes: optionnel,
});

export const schemaLigneDevis = z.object({
  designation: z.string().trim().min(2, "Désignation requise"),
  quantite: z.coerce.number().positive("Quantité invalide"),
  prix_unitaire_ht: z.coerce.number().min(0, "Prix invalide"),
});

export const schemaDevis = z.object({
  type: z.enum(["initial", "supplementaire"]).default("initial"),
  tva_pct: z.coerce.number().min(0).max(100).default(20),
  description: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  lignes: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v);
      } catch {
        ctx.addIssue({ code: "custom", message: "Lignes invalides" });
        return z.NEVER;
      }
    })
    .pipe(schemaLigneDevis.array().min(1, "Ajoutez au moins une ligne")),
});

export const schemaPrestation = z.object({
  designation: z.string().trim().min(2, "Désignation requise"),
  prix_ht: z.coerce.number().min(0, "Prix invalide"),
});

export const schemaMessage = z.object({
  contenu: z
    .string()
    .trim()
    .min(1, "Le message est vide")
    .max(2000, "Message trop long (2000 caractères max)"),
});

export const schemaSignature = z.object({
  devis_id: z.string().min(1),
  signe_par: z.string().trim().min(3, "Votre nom complet est obligatoire"),
  signature_base64: z
    .string()
    .startsWith("data:image/", "Signature manquante")
    .max(500_000),
});

export const schemaGarage = z.object({
  nom: z.string().trim().min(2, "Le nom du garage est obligatoire"),
  adresse: optionnel,
  telephone: telephone,
  telephone_mobile: telephone,
  siret: optionnel,
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  logo_url: imageOptionnelle,
  cachet_url: imageOptionnelle,
});

export const schemaInscription = z.object({
  nom_garage: z.string().trim().min(2, "Le nom du garage est obligatoire"),
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  telephone: telephone,
  cgu: z.literal("on", { error: "Vous devez accepter les CGU" }),
});

export const schemaConnexion = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Mot de passe obligatoire"),
});
