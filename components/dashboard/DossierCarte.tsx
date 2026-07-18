import Link from "next/link";
import { Camera, FileSignature, MessageSquare } from "lucide-react";
import { StatutBadge } from "@/components/StatutBadge";
import type { DossierResume } from "@/lib/types";
import { formatDate, formatImmat } from "@/lib/utils";

export function DossierCarte({ dossier }: { dossier: DossierResume }) {
  return (
    <Link
      href={`/dashboard/dossiers/${dossier.id}`}
      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {dossier.client_nom}
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {dossier.vehicule_marque} {dossier.vehicule_modele}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium tracking-wide text-slate-700">
          {formatImmat(dossier.vehicule_immat)}
        </span>
      </div>

      <div className="mt-3">
        <StatutBadge statut={dossier.statut} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Entré le {formatDate(dossier.date_entree)}
          {dossier.date_prevue_sortie &&
            dossier.statut !== "livre" &&
            ` · prévu ${formatDate(dossier.date_prevue_sortie)}`}
        </span>
        <span className="flex items-center gap-2.5">
          {dossier.nb_photos > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Camera className="h-3.5 w-3.5" />
              {dossier.nb_photos}
            </span>
          )}
          {dossier.devis_en_attente > 0 && (
            <span
              className="flex items-center gap-1 font-semibold text-red-600"
              title="Devis en attente de validation client"
            >
              <FileSignature className="h-3.5 w-3.5" />
              {dossier.devis_en_attente}
            </span>
          )}
          {dossier.messages_non_lus > 0 && (
            <span
              className="flex items-center gap-1 font-semibold text-blue-600"
              title="Messages client non lus"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {dossier.messages_non_lus}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
