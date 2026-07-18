import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Printer } from "lucide-react";
import { getGarageCourant, listTousDevis } from "@/lib/db";
import type { DevisStatut } from "@/lib/types";
import { cn, formatDate, formatEuros, formatImmat } from "@/lib/utils";

export const metadata = { title: "Devis" };
export const dynamic = "force-dynamic";

const STATUTS: { id: DevisStatut | "tous"; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "en_attente", label: "En attente" },
  { id: "accepte", label: "Acceptés" },
  { id: "refuse", label: "Refusés" },
];

const BADGE: Record<DevisStatut, string> = {
  en_attente: "bg-amber-50 text-amber-700 border-amber-200",
  accepte: "bg-green-50 text-green-700 border-green-200",
  refuse: "bg-red-50 text-red-700 border-red-200",
};
const LIBELLE: Record<DevisStatut, string> = {
  en_attente: "En attente",
  accepte: "Accepté",
  refuse: "Refusé",
};

export default async function PageDevis({
  searchParams,
}: {
  searchParams: { statut?: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const statut = STATUTS.some((s) => s.id === searchParams.statut)
    ? (searchParams.statut as DevisStatut | "tous")
    : "tous";

  const devis = await listTousDevis(
    garage,
    statut === "tous" ? undefined : { statut }
  );

  const totalAccepte = devis
    .filter((d) => d.statut === "accepte")
    .reduce((s, d) => s + d.montant_ttc, 0);
  const nbEnAttente = devis.filter((d) => d.statut === "en_attente").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Tous vos devis, classés du plus récent au plus ancien.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat valeur={String(devis.length)} label="devis au total" />
        <Stat valeur={String(nbEnAttente)} label="en attente de signature" accent />
        <Stat valeur={formatEuros(totalAccepte)} label="acceptés (TTC)" />
      </div>

      <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
        {STATUTS.map((s) => (
          <Link
            key={s.id}
            href={s.id === "tous" ? "/dashboard/devis" : `/dashboard/devis?statut=${s.id}`}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-4 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none",
              statut === s.id
                ? "bg-primary-800 text-white shadow-sm"
                : "text-slate-600 hover:text-ink"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {devis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">Aucun devis ici</p>
          <p className="mt-1 text-sm text-slate-500">
            Les devis créés depuis les dossiers apparaissent automatiquement dans
            cet espace.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="hidden grid-cols-[110px_1fr_1fr_110px_110px_70px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <span>Numéro</span>
            <span>Client</span>
            <span>Véhicule</span>
            <span className="text-right">Montant TTC</span>
            <span>Statut</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100">
            {devis.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-2 items-center gap-x-3 gap-y-1 px-4 py-3 text-sm md:grid-cols-[110px_1fr_1fr_110px_110px_70px]"
              >
                <div className="font-mono text-xs font-semibold text-primary-800">
                  {d.numero}
                  <span className="mt-0.5 block font-sans text-[10px] font-normal text-slate-400">
                    {d.type === "initial" ? "Entrée" : "Supplément"} ·{" "}
                    {formatDate(d.created_at)}
                  </span>
                </div>
                <div className="truncate font-medium text-ink">{d.client_nom}</div>
                <div className="truncate text-slate-500">
                  {d.vehicule}
                  <span className="ml-1.5 font-mono text-xs text-slate-400">
                    {formatImmat(d.vehicule_immat)}
                  </span>
                </div>
                <div className="text-right font-mono font-semibold text-ink">
                  {formatEuros(d.montant_ttc)}
                </div>
                <div>
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-xs font-medium",
                      BADGE[d.statut]
                    )}
                  >
                    {LIBELLE[d.statut]}
                  </span>
                </div>
                <div className="col-span-2 flex gap-2 md:col-span-1 md:justify-end">
                  <Link
                    href={`/impression/devis/${d.dossier_id}/${d.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-primary-300 hover:text-primary-700"
                    title="Imprimer / PDF"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/dossiers/${d.dossier_id}`}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-primary-300 hover:text-primary-700"
                  >
                    Dossier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  valeur,
  label,
  accent,
}: {
  valeur: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-card">
      <p className={cn("text-2xl font-bold", accent ? "text-accent-600" : "text-primary-900")}>
        {valeur}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );
}
