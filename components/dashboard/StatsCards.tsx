import { CarFront, Euro, PackageCheck, ThumbsUp } from "lucide-react";
import type { StatsGarage } from "@/lib/db";
import { formatEuros } from "@/lib/utils";

function Carte({
  icone,
  valeur,
  label,
  accent,
}: {
  icone: React.ReactNode;
  valeur: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          accent ? "bg-accent-50 text-accent-600" : "bg-primary-50 text-primary-700"
        }`}
      >
        {icone}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold leading-tight text-ink">
          {valeur}
        </p>
        <p className="truncate text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards({ stats }: { stats: StatsGarage }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Carte
        icone={<CarFront className="h-5 w-5" />}
        valeur={String(stats.atelier)}
        label="Véhicules à l'atelier"
      />
      <Carte
        icone={<Euro className="h-5 w-5" />}
        valeur={formatEuros(stats.caMois)}
        label="Devis acceptés ce mois"
        accent
      />
      <Carte
        icone={<ThumbsUp className="h-5 w-5" />}
        valeur={
          stats.tauxAcceptation == null
            ? "—"
            : `${Math.round(stats.tauxAcceptation * 100)} %`
        }
        label="Taux d'acceptation devis"
      />
      <Carte
        icone={<PackageCheck className="h-5 w-5" />}
        valeur={String(stats.livresMois)}
        label="Véhicules livrés ce mois"
      />
    </div>
  );
}
