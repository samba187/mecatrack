import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, CalendarDays, MapPin, Phone, Star } from "lucide-react";
import { LogoIcone } from "@/components/Logo";
import { Timeline } from "@/components/Timeline";
import { ChatClient } from "@/components/suivi/ChatClient";
import { DevisRepondu, DevisValidation } from "@/components/suivi/DevisValidation";
import { GaleriePhotos } from "@/components/suivi/GaleriePhotos";
import { getSuiviParToken } from "@/lib/db";
import { statutConfig } from "@/lib/statuts";
import { cn, formatDate, formatImmat } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}) {
  const suivi = await getSuiviParToken(params.token);
  if (!suivi) return { title: "Suivi introuvable" };
  return {
    title: `Suivi de votre ${suivi.dossier.vehicule_marque} ${suivi.dossier.vehicule_modele}`,
    robots: { index: false, follow: false },
  };
}

export default async function PageSuivi({
  params,
}: {
  params: { token: string };
}) {
  const suivi = await getSuiviParToken(params.token);
  if (!suivi) notFound();

  const { garage, dossier, photos, devis, messages, historique } = suivi;
  const cfg = statutConfig(dossier.statut);
  const devisEnAttente = devis.filter((d) => d.statut === "en_attente");
  const devisRepondus = devis.filter((d) => d.statut !== "en_attente");

  return (
    <div className="min-h-screen bg-surface pb-10">
      {/* En-tête garage */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
          {garage.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={garage.logo_url}
              alt={garage.nom}
              className="h-10 w-auto max-w-[96px] shrink-0 object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">
              {garage.nom}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
              {(garage.telephone || garage.telephone_mobile) && (
                <a
                  href={`tel:${garage.telephone ?? garage.telephone_mobile}`}
                  className="flex items-center gap-1 hover:text-ink"
                >
                  <Phone className="h-3 w-3" />
                  {garage.telephone ?? garage.telephone_mobile}
                </a>
              )}
              {garage.adresse && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{garage.adresse}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-5 px-4 pt-5">
        {/* Statut principal */}
        <section
          className={cn(
            "rounded-2xl border-2 bg-white p-5 shadow-card",
            cfg.border
          )}
        >
          <p className="text-sm text-slate-500">
            Suivi de votre {dossier.vehicule_marque} {dossier.vehicule_modele}
            <span className="ml-2 inline-block whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-700">
              {formatImmat(dossier.vehicule_immat)}
            </span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={cn(
                "h-3.5 w-3.5 shrink-0 rounded-full",
                cfg.dot,
                cfg.pulse && "animate-pulse-dot"
              )}
            />
            <h1 className="text-xl font-bold leading-tight">
              {cfg.labelClient}
            </h1>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-start gap-2 text-slate-600">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                Entré le
                <span className="block font-semibold text-ink">
                  {formatDate(dossier.date_entree)}
                </span>
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {dossier.statut === "livre" ? "Restitué le" : "Récupération prévue"}
                <span className="block font-semibold text-ink">
                  {dossier.statut === "livre"
                    ? formatDate(dossier.date_livraison)
                    : formatDate(dossier.date_prevue_sortie)}
                </span>
              </span>
            </div>
          </div>
          {dossier.motif_entree && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Motif : </span>
              {dossier.motif_entree}
            </p>
          )}
        </section>

        {/* Demande d'avis après restitution */}
        {dossier.statut === "livre" && garage.lien_avis && (
          <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-center shadow-card">
            <div className="mb-2 flex justify-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="font-semibold text-ink">
              Merci d&apos;avoir choisi {garage.nom} !
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-600">
              Votre avis aide beaucoup notre garage. Cela ne prend qu&apos;une
              minute.
            </p>
            <a
              href={garage.lien_avis}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Star className="h-4 w-4" />
              Laisser un avis
            </a>
          </section>
        )}

        {/* Devis à valider */}
        {devisEnAttente.map((d) => (
          <DevisValidation key={d.id} token={params.token} devis={d} />
        ))}

        {/* Photos */}
        {photos.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="font-semibold">Photos de l&apos;intervention</h2>
            <p className="mb-3 mt-0.5 text-sm text-slate-500">
              Ajoutées par votre garagiste au fil des travaux.
            </p>
            <GaleriePhotos photos={photos} />
          </section>
        )}

        {/* Avancement */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 font-semibold">Avancement</h2>
          <Timeline historique={historique} client />
        </section>

        {/* Devis déjà répondus */}
        {devisRepondus.length > 0 && (
          <section className="space-y-3">
            {devisRepondus.map((d) => (
              <DevisRepondu key={d.id} devis={d} token={params.token} />
            ))}
          </section>
        )}

        {/* Messagerie */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-3 font-semibold">Contacter le garage</h2>
          <ChatClient
            token={params.token}
            messages={messages}
            nomGarage={garage.nom}
          />
        </section>

        {/* Pied de page */}
        {garage.plan !== "pro" && (
          <footer className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              <LogoIcone className="h-4 w-4 rounded" />
              Propulsé par Fiavo — le suivi de réparation en temps réel
            </Link>
          </footer>
        )}
      </main>
    </div>
  );
}
