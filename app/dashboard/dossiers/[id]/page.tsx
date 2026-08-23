import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Car, Gauge, Phone, Wrench } from "lucide-react";
import { ChatGarage } from "@/components/dashboard/ChatGarage";
import { DatePrevue } from "@/components/dashboard/DatePrevue";
import { DevisSection } from "@/components/dashboard/DevisSection";
import { LienClient } from "@/components/dashboard/LienClient";
import { NotesInternes } from "@/components/dashboard/NotesInternes";
import { PhotosSection } from "@/components/dashboard/PhotosSection";
import { StatutSelect } from "@/components/dashboard/StatutSelect";
import { Timeline } from "@/components/Timeline";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { lienSuivi } from "@/lib/config";
import {
  getDossierComplet,
  getGarageCourant,
  historiqueVehicule,
  listPrestations,
} from "@/lib/db";
import { maxPhotosParDossier, peutEnvoyerSms } from "@/lib/plans";
import { statutConfig } from "@/lib/statuts";
import { cn, formatDate, formatImmat } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PageDossier({
  params,
}: {
  params: { id: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const complet = await getDossierComplet(garage, params.id);
  if (!complet) notFound();

  const prestations = await listPrestations(garage);
  const { dossier, photos, devis, messages, historique } = complet;
  const nonLus = messages.some((m) => m.auteur === "client" && !m.lu);
  const passages = await historiqueVehicule(
    garage,
    dossier.vehicule_immat,
    dossier.id
  );

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/dossiers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux dossiers
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {dossier.client_nom}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Car className="h-4 w-4" />
                {dossier.vehicule_marque} {dossier.vehicule_modele}
                {dossier.vehicule_annee && ` (${dossier.vehicule_annee})`}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-slate-700">
                {formatImmat(dossier.vehicule_immat)}
              </span>
              {dossier.kilometrage != null && (
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4" />
                  {dossier.kilometrage.toLocaleString("fr-FR")} km
                </span>
              )}
              {dossier.client_telephone && (
                <a
                  href={`tel:${dossier.client_telephone}`}
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <Phone className="h-4 w-4" />
                  {dossier.client_telephone}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1.5 text-sm text-slate-500 sm:items-end">
            <span>Entré le {formatDate(dossier.date_entree)}</span>
            {dossier.statut === "livre" ? (
              <span className="font-medium text-green-700">
                Livré le {formatDate(dossier.date_livraison)}
              </span>
            ) : (
              <DatePrevue
                dossierId={dossier.id}
                date={dossier.date_prevue_sortie}
              />
            )}
          </div>
        </div>

        <div className="mt-4">
          <StatutSelect dossierId={dossier.id} statut={dossier.statut} />
        </div>
      </div>

      <Card>
        <CardBody>
          <LienClient
            dossierId={dossier.id}
            lien={lienSuivi(dossier.token_public)}
            smsPossible={peutEnvoyerSms(garage)}
          />
        </CardBody>
      </Card>

      {dossier.motif_entree && (
        <Card>
          <CardBody className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Motif d&apos;entrée
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {dossier.motif_entree}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              titre="Photos"
              description="Montrez votre travail : c'est votre meilleure preuve en cas de litige."
            />
            <CardBody>
              <PhotosSection
                dossierId={dossier.id}
                photos={photos}
                maxPhotos={maxPhotosParDossier(garage)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              titre="Devis"
              description="Devis d'entrée et suppléments, imprimables en PDF, signés en ligne."
            />
            <CardBody>
              <DevisSection
                dossierId={dossier.id}
                devis={devis}
                prestations={prestations}
                tvaDefaut={garage.tva_defaut ?? 20}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader titre="Messagerie client" />
            <CardBody>
              <ChatGarage
                dossierId={dossier.id}
                messages={messages}
                aDesNonLus={nonLus}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          {passages.length > 0 && (
            <Card>
              <CardHeader
                titre={`Déjà venu ${passages.length} fois`}
                description="Historique de ce véhicule dans votre garage."
              />
              <CardBody className="space-y-2.5">
                {passages.map((p) => {
                  const cfg = statutConfig(p.statut);
                  return (
                    <Link
                      key={p.id}
                      href={`/dashboard/dossiers/${p.id}`}
                      className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {formatDate(p.date_entree)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            cfg.bg,
                            cfg.color
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      {p.motif_entree && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {p.motif_entree}
                        </p>
                      )}
                      {p.kilometrage != null && (
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {p.kilometrage.toLocaleString("fr-FR")} km
                        </p>
                      )}
                    </Link>
                  );
                })}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader titre="Historique" />
            <CardBody>
              <Timeline historique={historique} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader titre="Notes internes" />
            <CardBody>
              <NotesInternes
                dossierId={dossier.id}
                notes={dossier.notes_internes}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
