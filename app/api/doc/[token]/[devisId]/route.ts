import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getDocumentParToken } from "@/lib/db";
import { DocumentPdf } from "@/lib/pdf/document";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PDF public du devis/facture, accessible au client via le token de suivi
 * (aucune authentification). Généré à la volée, jamais stocké.
 */
export async function GET(
  request: Request,
  { params }: { params: { token: string; devisId: string } }
) {
  const res = await getDocumentParToken(params.token, params.devisId);
  if (!res) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }
  const { garage, dossier, devis } = res;

  const buffer = await renderToBuffer(
    DocumentPdf({ garage, dossier, devis }) as React.ReactElement
  );

  const facture = Boolean(devis.facture_numero);
  const nom = `${facture ? "Facture" : "Devis"}-${
    facture ? devis.facture_numero : devis.numero
  }.pdf`.replace(/\s+/g, "-");
  const telecharger = new URL(request.url).searchParams.get("dl") === "1";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename="${nom}"`,
      "Cache-Control": "no-store",
    },
  });
}
