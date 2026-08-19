import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  getGarageCourant,
  listDossiers,
  statsGarage,
  type OngletDossiers,
} from "@/lib/db";
import { DossierCarte } from "@/components/dashboard/DossierCarte";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dossiers" };
export const dynamic = "force-dynamic";

const ONGLETS: { id: OngletDossiers; label: string }[] = [
  { id: "actifs", label: "Actifs" },
  { id: "livres", label: "Livrés" },
  { id: "tous", label: "Tous" },
];

export default async function PageDossiers({
  searchParams,
}: {
  searchParams: { onglet?: string; q?: string };
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const onglet = (
    ONGLETS.some((o) => o.id === searchParams.onglet)
      ? searchParams.onglet
      : "actifs"
  ) as OngletDossiers;
  const q = searchParams.q ?? "";
  const dossiers = await listDossiers(garage, onglet, q);
  const nbActifs =
    onglet === "actifs"
      ? dossiers.length
      : (await listDossiers(garage, "actifs")).length;
  const stats = await statsGarage(garage);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {nbActifs} véhicule{nbActifs > 1 ? "s" : ""} à l&apos;atelier
          </p>
        </div>
        <Link
          href="/dashboard/dossiers/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nouveau dossier
        </Link>
      </div>

      <StatsCards stats={stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {ONGLETS.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/dossiers?onglet=${o.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={cn(
                "flex-1 rounded-md px-4 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none",
                onglet === o.id
                  ? "bg-primary-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-ink"
              )}
            >
              {o.label}
            </Link>
          ))}
        </div>
        <form className="relative sm:w-80" action="/dashboard/dossiers">
          <input type="hidden" name="onglet" value={onglet} />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nom du client ou immatriculation…"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 text-[15px] shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </form>
      </div>

      {dossiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          {q ? (
            <>
              <p className="font-medium text-slate-700">
                Aucun dossier ne correspond à « {q} »
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Vérifiez l&apos;orthographe ou essayez avec l&apos;immatriculation.
              </p>
            </>
          ) : onglet === "livres" ? (
            <p className="font-medium text-slate-700">
              Aucun véhicule livré pour le moment.
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-slate-800">
                Aucun dossier actif
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Créez votre premier dossier : votre client recevra un lien pour
                suivre sa réparation en temps réel.
              </p>
              <Link
                href="/dashboard/dossiers/new"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-primary-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Créer mon premier dossier
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dossiers.map((d) => (
            <DossierCarte key={d.id} dossier={d} />
          ))}
        </div>
      )}
    </div>
  );
}
