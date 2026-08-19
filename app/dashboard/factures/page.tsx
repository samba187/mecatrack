import Link from "next/link";
import { redirect } from "next/navigation";
import { Printer, Receipt } from "lucide-react";
import { getGarageCourant, listTousDevis } from "@/lib/db";
import { cn, formatDate, formatEuros, formatImmat } from "@/lib/utils";

export const metadata = { title: "Factures" };
export const dynamic = "force-dynamic";

export default async function PageFactures() {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const factures = (await listTousDevis(garage))
    .filter((d) => d.facture_numero)
    .sort(
      (a, b) =>
        new Date(b.facture_at ?? b.created_at).getTime() -
        new Date(a.facture_at ?? a.created_at).getTime()
    );

  const total = factures.reduce((s, d) => s + d.montant_ttc, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Générées depuis vos devis acceptés. Chaque facture reprend le devis
          signé.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-card">
          <p className="text-2xl font-bold text-primary-900">{factures.length}</p>
          <p className="mt-0.5 text-sm text-slate-500">factures émises</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-card">
          <p className="text-2xl font-bold text-accent-600">{formatEuros(total)}</p>
          <p className="mt-0.5 text-sm text-slate-500">total facturé (TTC)</p>
        </div>
      </div>

      {factures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Receipt className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">Aucune facture</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Depuis un dossier, cliquez « Générer la facture » sur un devis
            accepté : elle apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="hidden grid-cols-[120px_1fr_1fr_110px_70px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <span>Facture</span>
            <span>Client</span>
            <span>Véhicule</span>
            <span className="text-right">Montant TTC</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100">
            {factures.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-2 items-center gap-x-3 gap-y-1 px-4 py-3 text-sm md:grid-cols-[120px_1fr_1fr_110px_70px]"
              >
                <div className="font-mono text-xs font-semibold text-primary-800">
                  {d.facture_numero}
                  <span className="mt-0.5 block font-sans text-[10px] font-normal text-slate-400">
                    {formatDate(d.facture_at ?? d.created_at)}
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
                <div className="col-span-2 flex gap-2 md:col-span-1 md:justify-end">
                  <Link
                    href={`/impression/facture/${d.dossier_id}/${d.id}`}
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
