import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getDevisPourImpression, getGarageCourant } from "@/lib/db";
import { DocumentPdf } from "@/lib/pdf/document";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Génère le devis ou la facture en PDF à la volée : rien n'est écrit sur le
 * serveur. `?dl=1` force le téléchargement, sinon le PDF s'ouvre dans le
 * navigateur (aperçu, impression).
 */
export async function GET(
  request: Request,
  { params }: { params: { dossierId: string; devisId: string } }
) {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const res = await getDevisPourImpression(
    garage,
    params.dossierId,
    params.devisId
  );
  if (!res) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }
  const { devis, dossier } = res;

  const buffer = await renderToBuffer(
    DocumentPdf({ garage, dossier, devis }) as React.ReactElement
  );

  const facture = Boolean(devis.facture_numero);
  const nom = `${facture ? "Facture" : "Devis"}-${
    facture ? devis.facture_numero : devis.numero
  }-${dossier.vehicule_immat}.pdf`.replace(/\s+/g, "-");

  const telecharger = new URL(request.url).searchParams.get("dl") === "1";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename="${nom}"`,
      "Cache-Control": "no-store",
    },
  });
}
