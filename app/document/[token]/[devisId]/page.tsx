import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Eye, PenLine } from "lucide-react";
import { getDocumentParToken } from "@/lib/db";
import { formatEuros } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Votre document",
  robots: { index: false, follow: false },
};

export default async function PageDocumentClient({
  params,
}: {
  params: { token: string; devisId: string };
}) {
  const res = await getDocumentParToken(params.token, params.devisId);
  if (!res) notFound();
  const { garage, dossier, devis } = res;
  const facture = Boolean(devis.facture_numero);
  const aValider = devis.statut === "en_attente";
  const pdf = `/api/doc/${params.token}/${params.devisId}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/suivi/${params.token}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au suivi
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="border-b border-slate-100 p-6 text-center">
            <p className="text-sm text-slate-500">{garage.nom}</p>
            <h1 className="mt-1 text-xl font-bold text-primary-900">
              {facture ? "Facture" : "Devis"}{" "}
              {facture ? devis.facture_numero : devis.numero}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {dossier.vehicule_marque} {dossier.vehicule_modele}
            </p>
            <p className="mt-3 text-2xl font-bold text-primary-900">
              {formatEuros(devis.montant_ttc)}
              <span className="ml-1 text-sm font-normal text-slate-400">
                TTC
              </span>
            </p>
          </div>

          <div className="space-y-3 p-6">
            {aValider && (
              <Link
                href={`/suivi/${params.token}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-800 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <PenLine className="h-5 w-5" />
                Valider et signer
              </Link>
            )}
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Voir le {facture ? "document" : "devis"} (PDF)
            </a>
            <a
              href={`${pdf}?dl=1`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Télécharger le PDF
            </a>
          </div>
        </div>

        {/* Aperçu intégré (desktop) — le bouton ci-dessus reste la voie sûre sur mobile. */}
        <object
          data={pdf}
          type="application/pdf"
          className="mt-6 hidden h-[80vh] w-full rounded-xl border border-slate-200 sm:block"
        >
          <p className="p-4 text-center text-sm text-slate-500">
            Aperçu indisponible — utilisez le bouton « Voir le PDF » ci-dessus.
          </p>
        </object>
      </div>
    </div>
  );
}
