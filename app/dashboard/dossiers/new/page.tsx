import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireNouveauDossier } from "@/components/dashboard/FormulaireNouveauDossier";

export const metadata = { title: "Nouveau dossier" };

export default function PageNouveauDossier() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/dashboard/dossiers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux dossiers
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Nouveau dossier
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Deux minutes suffisent. Le lien de suivi client est généré
          automatiquement.
        </p>
      </div>
      <FormulaireNouveauDossier />
    </div>
  );
}
