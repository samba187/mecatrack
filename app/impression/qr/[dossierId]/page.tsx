import { notFound, redirect } from "next/navigation";
import { PrintBar } from "@/components/dashboard/PrintButton";
import { lienSuivi } from "@/lib/config";
import { getDossierComplet, getGarageCourant } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import { formatImmat } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "QR code de suivi" };

export default async function PageQrDossier({
  params,
}: {
  params: { dossierId: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const complet = await getDossierComplet(garage, params.dossierId);
  if (!complet) notFound();
  const { dossier } = complet;
  const lien = lienSuivi(dossier.token_public);
  const qr = await qrDataUrl(lien);

  return (
    <div className="min-h-screen bg-slate-100">
      <PrintBar retour={`/dashboard/dossiers/${params.dossierId}`} />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="print-sheet rounded-2xl bg-white p-10 text-center shadow-card">
          <div className="mb-6">
            {garage.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={garage.logo_url}
                alt={garage.nom}
                className="mx-auto h-14 w-auto max-w-[200px] object-contain"
              />
            ) : (
              <p className="text-2xl font-bold text-primary-900">{garage.nom}</p>
            )}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-ink">
            Suivez votre réparation en direct
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-slate-500">
            Scannez ce QR code avec l&apos;appareil photo de votre téléphone.
          </p>

          <div className="my-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt="QR code de suivi"
              className="h-64 w-64 rounded-xl border border-slate-200 p-3"
            />
          </div>

          <div className="inline-flex flex-col items-center gap-1 rounded-xl bg-slate-50 px-6 py-4">
            <p className="text-sm text-slate-500">Votre véhicule</p>
            <p className="text-lg font-semibold text-ink">
              {dossier.vehicule_marque} {dossier.vehicule_modele}
            </p>
            <span className="rounded bg-white px-2 py-0.5 font-mono text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              {formatImmat(dossier.vehicule_immat)}
            </span>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Photos, statut, devis à valider — {garage.nom}
            {garage.telephone ? ` · ${garage.telephone}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
