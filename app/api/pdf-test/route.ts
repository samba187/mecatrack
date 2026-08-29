import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { DocumentPdf } from "@/lib/pdf/document";
import type { Devis, Dossier, Garage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** TEMPORAIRE : vérifie que react-pdf rend bien un PDF sur Vercel (sans auth). */
export async function GET() {
  const garage = {
    id: "t",
    nom: "Garage Test",
    adresse: "1 rue de Test, 75000 Paris",
    telephone: "01 23 45 67 89",
    email: "test@fiavo.fr",
    siret: "123 456 789 00010",
    logo_url: null,
    cachet_url: null,
    mentions_devis: null,
    conditions_paiement: null,
  } as unknown as Garage;
  const dossier = {
    client_nom: "Client Test",
    client_telephone: "0612345678",
    client_email: null,
    vehicule_marque: "Renault",
    vehicule_modele: "Clio",
    vehicule_immat: "AA-123-BB",
    vehicule_annee: 2020,
    kilometrage: 90000,
  } as unknown as Dossier;
  const devis = {
    numero: "DEV-TEST-0001",
    type: "initial",
    statut: "en_attente",
    tva_pct: 20,
    montant_ht: 1000,
    montant_ttc: 1200,
    created_at: new Date().toISOString(),
    facture_numero: null,
    lignes: [
      { designation: "Prestation test", quantite: 1, prix_unitaire_ht: 1000 },
    ],
  } as unknown as Devis;

  try {
    const buffer = await renderToBuffer(
      DocumentPdf({ garage, dossier, devis }) as React.ReactElement
    );
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
