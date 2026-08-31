import { redirect } from "next/navigation";
import { BadgeCheck, Car, CreditCard, MessageSquare } from "lucide-react";
import { FormulaireGarage } from "@/components/dashboard/FormulaireGarage";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DEMO_MODE } from "@/lib/config";
import {
  getGarageCourant,
  smsCeMois,
  vehiculesCeMois,
} from "@/lib/db";
import {
  coutDepassementSms,
  PLANS,
  planEffectif,
  PRIX_SMS_SUPPLEMENTAIRE,
  quotaSms,
  quotaVehicules,
} from "@/lib/plans";
import { formatDate, joursRestants } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

function Barre({ pct }: { pct: number }) {
  const couleur =
    pct >= 100 ? "bg-amber-500" : pct >= 80 ? "bg-amber-400" : "bg-primary-600";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full transition-all", couleur)}
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  );
}

export default async function PageCompte({
  searchParams,
}: {
  searchParams: { abonnement?: string; erreur?: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const plan = planEffectif(garage);
  const enEssai = garage.plan === "trial" && plan !== "expired";
  const jours = joursRestants(garage.trial_ends_at);
  const abonne = garage.plan === "atelier" || garage.plan === "pro";

  // Consommation du mois en cours (véhicules + SMS).
  const [vehUtilises, smsUtilises] = await Promise.all([
    vehiculesCeMois(garage),
    smsCeMois(garage),
  ]);
  const qVeh = quotaVehicules(garage);
  const qSms = quotaSms(garage);
  const smsSup = Math.max(0, smsUtilises - qSms);
  const coutSup = coutDepassementSms(smsUtilises, qSms);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon compte</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Informations du garage et gestion de l&apos;abonnement.
        </p>
      </div>

      {searchParams.abonnement === "ok" && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          Abonnement activé. Merci pour votre confiance !
        </div>
      )}
      {searchParams.abonnement === "demo" && (
        <div className="flex items-center gap-2.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          Mode démo : changement de formule simulé (aucun paiement).
        </div>
      )}
      {searchParams.erreur && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {searchParams.erreur === "stripe-non-configure"
            ? "Le paiement n'est pas encore configuré sur cet environnement."
            : searchParams.erreur === "stripe-checkout"
              ? "Impossible d'ouvrir le paiement pour le moment. Réessayez dans un instant."
              : "Le portail de facturation n'est pas disponible pour ce compte."}
        </div>
      )}

      <Card>
        <CardHeader
          titre="Abonnement"
          description={
            enEssai
              ? `Essai gratuit — ${jours} jour${jours > 1 ? "s" : ""} restant${jours > 1 ? "s" : ""} avec toutes les fonctionnalités Pro.`
              : plan === "expired"
                ? "Votre essai est terminé. Choisissez une formule pour continuer."
                : `Vous êtes sur la formule ${PLANS[plan as "atelier" | "pro"].nom}.`
          }
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["atelier", "pro"] as const).map((id) => {
              const p = PLANS[id];
              const actuel = garage.plan === id;
              return (
                <div
                  key={id}
                  className={cn(
                    "relative rounded-xl border p-5",
                    id === "pro"
                      ? "border-primary-300 bg-primary-50/50"
                      : "border-slate-200"
                  )}
                >
                  {id === "pro" && (
                    <span className="absolute -top-2.5 left-5 rounded-full bg-primary-800 px-2.5 py-0.5 text-xs font-semibold text-white">
                      Recommandé
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold">{p.nom}</h3>
                    <p>
                      <span className="text-2xl font-bold">{p.prix} €</span>
                      <span className="text-sm text-slate-500"> /mois</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{p.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {p.fonctionnalites.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {actuel ? (
                      <span className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-green-100 text-sm font-semibold text-green-800">
                        Formule actuelle
                      </span>
                    ) : (
                      <a
                        href={`/api/stripe/checkout?plan=${id}`}
                        className={cn(
                          "inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                          id === "pro"
                            ? "bg-primary-800 text-white hover:bg-primary-700"
                            : "border border-slate-300 bg-white hover:bg-slate-50"
                        )}
                      >
                        {abonne ? `Passer en ${p.nom}` : `Choisir ${p.nom}`}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span>
              {enEssai && garage.trial_ends_at
                ? `Fin de l'essai le ${formatDate(garage.trial_ends_at)} — aucune carte bancaire requise pendant l'essai.`
                : "Sans engagement : résiliable à tout moment en un clic."}
            </span>
            {abonne && !DEMO_MODE && (
              <a
                href="/api/stripe/portal"
                className="inline-flex items-center gap-2 font-medium text-primary-700 hover:underline"
              >
                <CreditCard className="h-4 w-4" />
                Gérer mon abonnement et mes factures
              </a>
            )}
          </div>
        </CardBody>
      </Card>

      {plan !== "expired" && (
        <Card>
          <CardHeader
            titre="Consommation du mois"
            description="Vos compteurs se remettent à zéro le 1er de chaque mois."
          />
          <CardBody className="space-y-5">
            {/* Véhicules */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <Car className="h-4 w-4 text-slate-400" />
                  Véhicules ce mois
                </span>
                <span className="text-slate-500">
                  {Number.isFinite(qVeh) ? (
                    <>
                      <span className="font-semibold text-ink">{vehUtilises}</span> / {qVeh}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-ink">{vehUtilises}</span> · illimité
                    </>
                  )}
                </span>
              </div>
              {Number.isFinite(qVeh) ? (
                <Barre pct={Math.min(100, (vehUtilises / qVeh) * 100)} />
              ) : (
                <div className="h-2 rounded-full bg-primary-100" />
              )}
              {Number.isFinite(qVeh) && vehUtilises >= qVeh && (
                <p className="mt-1.5 text-xs text-amber-700">
                  Limite atteinte — passez au plan Pro pour des véhicules illimités.
                </p>
              )}
            </div>

            {/* SMS */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  SMS clients ce mois
                </span>
                <span className="text-slate-500">
                  <span className="font-semibold text-ink">{smsUtilises}</span> / {qSms} inclus
                </span>
              </div>
              <Barre pct={Math.min(100, (smsUtilises / Math.max(qSms, 1)) * 100)} />
              {smsSup > 0 ? (
                <p className="mt-1.5 text-xs text-amber-700">
                  {smsSup} SMS hors forfait ce mois ·{" "}
                  <span className="font-semibold">{coutSup.toFixed(2).replace(".", ",")} €</span>{" "}
                  facturés en plus ({PRIX_SMS_SUPPLEMENTAIRE.toFixed(2).replace(".", ",")} €/SMS).
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">
                  Au-delà du forfait : {PRIX_SMS_SUPPLEMENTAIRE.toFixed(2).replace(".", ",")} € par SMS.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          titre="Informations du garage"
          description="Le nom apparaît sur la page de suivi et dans les SMS envoyés à vos clients."
        />
        <CardBody>
          <FormulaireGarage garage={garage} />
        </CardBody>
      </Card>
    </div>
  );
}
