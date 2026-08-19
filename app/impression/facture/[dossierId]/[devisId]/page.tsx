import { notFound, redirect } from "next/navigation";
import { Cachet } from "@/components/dashboard/Cachet";
import { PrintBar } from "@/components/dashboard/PrintButton";
import { getDevisPourImpression, getGarageCourant } from "@/lib/db";
import {
  formatDate,
  formatDateTime,
  formatEuros,
  formatImmat,
} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Facture" };

export default async function PageImpressionFacture({
  params,
}: {
  params: { dossierId: string; devisId: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const res = await getDevisPourImpression(garage, params.dossierId, params.devisId);
  if (!res) notFound();
  const { devis, dossier } = res;
  // Une facture n'existe que pour un devis accepté et facturé.
  if (!devis.facture_numero) notFound();

  return (
    <div className="min-h-screen bg-slate-100">
      <PrintBar retour={`/dashboard/dossiers/${params.dossierId}`} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="print-sheet rounded-lg bg-white p-10 shadow-card">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              {garage.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={garage.logo_url}
                  alt={garage.nom}
                  className="mb-2.5 h-14 w-auto max-w-[180px] object-contain"
                />
              )}
              <h1 className="text-2xl font-bold text-primary-900">{garage.nom}</h1>
              <div className="mt-1.5 space-y-0.5 text-sm text-slate-500">
                {garage.adresse && <p>{garage.adresse}</p>}
                {garage.telephone && <p>Tél. {garage.telephone}</p>}
                {garage.telephone_mobile && <p>Mobile {garage.telephone_mobile}</p>}
                {garage.email && <p>{garage.email}</p>}
                {garage.siret && (
                  <p className="font-mono text-xs">SIRET {garage.siret}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold uppercase tracking-wide text-slate-800">
                Facture
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-primary-800">
                {devis.facture_numero}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(devis.facture_at ?? devis.created_at)}
              </p>
              <span className="mt-2 inline-block rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                Acquittée
              </span>
              <p className="mt-1 font-mono text-[11px] text-slate-400">
                réf. devis {devis.numero}
              </p>
            </div>
          </div>

          {/* Client + véhicule */}
          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Client
              </p>
              <p className="font-semibold text-ink">{dossier.client_nom}</p>
              {dossier.client_telephone && (
                <p className="text-slate-500">{dossier.client_telephone}</p>
              )}
              {dossier.client_email && (
                <p className="text-slate-500">{dossier.client_email}</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Véhicule
              </p>
              <p className="font-semibold text-ink">
                {dossier.vehicule_marque} {dossier.vehicule_modele}
                {dossier.vehicule_annee ? ` (${dossier.vehicule_annee})` : ""}
              </p>
              <p className="font-mono text-slate-600">
                {formatImmat(dossier.vehicule_immat)}
              </p>
              {dossier.kilometrage != null && (
                <p className="text-slate-500">
                  {dossier.kilometrage.toLocaleString("fr-FR")} km
                </p>
              )}
            </div>
          </div>

          {/* Lignes */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Désignation</th>
                <th className="pb-2 text-center font-semibold">Qté</th>
                <th className="pb-2 text-right font-semibold">PU HT</th>
                <th className="pb-2 text-right font-semibold">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devis.lignes?.map((l, i) => (
                <tr key={i}>
                  <td className="py-2.5 pr-2 text-slate-700">{l.designation}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                    {l.quantite}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono text-slate-500">
                    {formatEuros(l.prix_unitaire_ht)}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono font-medium text-ink">
                    {formatEuros(l.quantite * l.prix_unitaire_ht)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="mt-4 flex justify-end">
            <dl className="w-56 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Total HT</dt>
                <dd className="font-mono">{formatEuros(devis.montant_ht)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>TVA ({devis.tva_pct} %)</dt>
                <dd className="font-mono">
                  {formatEuros(devis.montant_ttc - devis.montant_ht)}
                </dd>
              </div>
              <div className="flex justify-between border-t-2 border-slate-200 pt-1.5 text-base font-bold text-primary-900">
                <dt>Total TTC</dt>
                <dd className="font-mono">{formatEuros(devis.montant_ttc)}</dd>
              </div>
            </dl>
          </div>

          {/* Pied : mentions, cachet */}
          <div className="mt-8 flex items-end justify-between gap-6 border-t border-slate-200 pt-6">
            <div className="max-w-xs text-xs leading-relaxed text-slate-400">
              <p>
                Facture acquittée. Devis {devis.numero} accepté et signé
                {devis.signe_par ? ` par ${devis.signe_par}` : ""}
                {devis.signature_at ? ` le ${formatDate(devis.signature_at)}` : ""}.
              </p>
              <p className="mt-1">
                TVA non applicable, art. 293 B du CGI le cas échéant. Document
                généré via Mécatrack le {formatDateTime(devis.facture_at ?? devis.created_at)}.
              </p>
            </div>
            <div className="flex items-end gap-4">
              {garage.cachet_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={garage.cachet_url}
                  alt="Cachet du garage"
                  className="h-24 w-auto max-w-[150px] object-contain"
                />
              )}
              <Cachet garage={garage} date={devis.facture_at ?? devis.created_at} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
