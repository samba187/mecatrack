import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { donneesPilotage, jetonPilotage } from "@/lib/admin";
import { formatDate, formatDateTime, formatEuros } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pilotage",
  robots: { index: false, follow: false },
};

const LIBELLE_PLAN: Record<string, string> = {
  trial: "Essai",
  atelier: "Atelier",
  pro: "Pro",
  expired: "Expiré",
};

function Kpi({
  valeur,
  libelle,
  accent,
}: {
  valeur: string;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p
        className={`text-2xl font-bold ${accent ? "text-accent-600" : "text-primary-900"}`}
      >
        {valeur}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{libelle}</p>
    </div>
  );
}

export default async function PagePilotage() {
  const jeton = jetonPilotage();
  const cookie = cookies().get("fiavo_pilo")?.value;
  if (!jeton || cookie !== jeton) notFound();

  const d = await donneesPilotage();

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Pilotage Fiavo
          </h1>
          {d.stripe.mode && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                d.stripe.mode === "LIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              Stripe {d.stripe.mode}
            </span>
          )}
        </div>

        {/* Visites du site (premier signal : est-ce que des gens viennent ?) */}
        <div className="grid grid-cols-3 gap-3">
          <Kpi
            valeur={String(d.visitesAujourdhui)}
            libelle="Visites aujourd'hui"
            accent
          />
          <Kpi valeur={String(d.visites7j)} libelle="Visites (7 j)" />
          <Kpi valeur={String(d.visitesTotal)} libelle="Visites (total)" />
        </div>

        {/* KPI principaux */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi valeur={String(d.garages)} libelle="Comptes garages" />
          <Kpi valeur={String(d.essaisEnCours)} libelle="Essais en cours" />
          <Kpi valeur={String(d.atelier + d.pro)} libelle="Abonnés payants" />
          <Kpi
            valeur={`${d.mrr} €`}
            libelle="MRR estimé (plans)"
            accent
          />
        </div>

        {/* Détail plans + acquisition */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Kpi valeur={String(d.atelier)} libelle="Plan Atelier" />
          <Kpi valeur={String(d.pro)} libelle="Plan Pro" />
          <Kpi valeur={String(d.expires)} libelle="Expirés" />
          <Kpi valeur={String(d.nouveauxSemaine)} libelle="Nouveaux (7 j)" />
          <Kpi valeur={String(d.nouveauxMois)} libelle="Nouveaux (30 j)" />
        </div>

        {/* Stripe réel */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-ink">Paiements (Stripe)</h2>
          {!d.stripe.configure ? (
            <p className="text-sm text-slate-500">Stripe pas encore configuré.</p>
          ) : d.stripe.erreur ? (
            <p className="text-sm text-red-600">Erreur Stripe : {d.stripe.erreur}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Kpi
                  valeur={String(d.stripe.abonnementsActifs)}
                  libelle="Abonnements actifs"
                />
                <Kpi
                  valeur={`${d.stripe.revenuReel} €`}
                  libelle="Revenu réel /mois"
                  accent
                />
              </div>
              {d.stripe.paiements.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Client</th>
                        <th className="pb-2 text-right">Montant</th>
                        <th className="pb-2 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {d.stripe.paiements.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 text-slate-600">
                            {formatDate(p.date)}
                          </td>
                          <td className="py-2 text-slate-600">{p.client}</td>
                          <td className="py-2 text-right font-mono font-medium">
                            {formatEuros(p.montant)}
                          </td>
                          <td className="py-2 text-right text-slate-500">
                            {p.statut}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {d.stripe.mode === "TEST" && (
                <p className="mt-3 text-xs text-amber-600">
                  Mode TEST : ces montants sont fictifs. Passez en Live pour le
                  réel.
                </p>
              )}
            </>
          )}
        </section>

        {/* À surveiller */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-ink">
              Essais qui finissent bientôt
            </h2>
            {d.essaisBientot.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun dans les 5 jours.</p>
            ) : (
              <ul className="space-y-2">
                {d.essaisBientot.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-ink">{e.nom}</span>
                      {e.email && (
                        <span className="text-slate-400"> · {e.email}</span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        e.jours <= 2
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      J-{e.jours}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Kpi valeur={String(d.smsMois)} libelle="SMS envoyés ce mois" />
            <Kpi
              valeur={String(d.supportNonTraite)}
              libelle="Support à traiter"
              accent={d.supportNonTraite > 0}
            />
          </section>
        </div>

        {/* Derniers comptes */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-ink">Derniers comptes créés</h2>
          {d.derniersComptes.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun compte pour l&apos;instant.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2">Garage</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Créé le</th>
                    <th className="pb-2">Fin d&apos;essai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.derniersComptes.map((g, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-ink">{g.nom}</td>
                      <td className="py-2 text-slate-500">{g.email ?? "—"}</td>
                      <td className="py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          {LIBELLE_PLAN[g.plan] ?? g.plan}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500">{formatDate(g.cree)}</td>
                      <td className="py-2 text-slate-500">
                        {g.finEssai ? formatDate(g.finEssai) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Journal d'événements / erreurs */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-ink">
            Journal — inscriptions, paiements, erreurs
          </h2>
          {d.journal.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aucun événement pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.journal.map((j, i) => {
                const couleur =
                  j.niveau === "erreur"
                    ? "bg-red-100 text-red-700"
                    : j.niveau === "succes"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600";
                return (
                  <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${couleur}`}
                    >
                      {j.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink">{j.message}</p>
                      <p className="text-xs text-slate-400">
                        {j.garage ? `${j.garage} · ` : ""}
                        {formatDateTime(j.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="pb-4 text-center text-xs text-slate-400">
          Vue privée · données en temps réel · rafraîchir la page pour mettre à
          jour
        </p>
      </div>
    </div>
  );
}
