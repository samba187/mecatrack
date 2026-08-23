import { formatEuros } from "@/lib/utils";

/** Petit histogramme du CA (devis acceptés) sur les 6 derniers mois. */
export function CaChart({
  donnees,
}: {
  donnees: { mois: string; montant: number }[];
}) {
  const max = Math.max(1, ...donnees.map((d) => d.montant));
  const total = donnees.reduce((s, d) => s + d.montant, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-ink">Chiffre d&apos;affaires</h2>
        <span className="text-sm text-slate-500">
          6 derniers mois ·{" "}
          <span className="font-semibold text-ink">{formatEuros(total)}</span>
        </span>
      </div>

      <div className="mt-5 flex h-36 items-stretch gap-2 sm:gap-4">
        {donnees.map((d, i) => {
          const h = Math.round((d.montant / max) * 100);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="group relative w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-primary-700 to-primary-400 transition-[height] duration-500"
                  style={{ height: `${Math.max(h, d.montant > 0 ? 4 : 0)}%` }}
                  title={formatEuros(d.montant)}
                >
                  {d.montant > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-medium text-slate-500">
                      {Math.round(d.montant)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-500">{d.mois}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
