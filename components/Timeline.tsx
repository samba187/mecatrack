import { statutConfig } from "@/lib/statuts";
import type { HistoriqueStatut } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * Timeline type « suivi de colis ». `ordreAncienEnPremier` pour la page client
 * (lecture chronologique), sinon le plus récent en premier (dashboard).
 */
export function Timeline({
  historique,
  client,
}: {
  historique: HistoriqueStatut[];
  client?: boolean;
}) {
  if (historique.length === 0) {
    return (
      <p className="text-sm text-slate-400">Aucun changement pour le moment.</p>
    );
  }

  // Le plus récent en tête dans les deux vues (repère immédiat).
  const liste = [...historique].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <ol className="relative space-y-0">
      {liste.map((h, i) => {
        const cfg = statutConfig(h.nouveau_statut);
        const dernier = i === 0;
        return (
          <li key={h.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < liste.length - 1 && (
              <span
                className="absolute left-[7px] top-5 h-full w-px bg-slate-200"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200",
                dernier ? cfg.dot : "bg-slate-300"
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm",
                  dernier ? "font-semibold text-ink" : "font-medium text-slate-600"
                )}
              >
                {client ? cfg.labelClient : cfg.label}
              </p>
              <p className="text-xs text-slate-400">
                {formatDateTime(h.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
