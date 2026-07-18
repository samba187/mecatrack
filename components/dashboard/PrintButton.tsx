"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export function PrintBar({ retour }: { retour: string }) {
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <Link
        href={retour}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dossier
      </Link>
      <button
        onClick={() => window.print()}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        <Printer className="h-4 w-4" />
        Imprimer / Enregistrer en PDF
      </button>
    </div>
  );
}
