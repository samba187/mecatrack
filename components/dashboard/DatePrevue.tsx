"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { actionMajDatePrevue } from "@/app/dashboard/actions";

export function DatePrevue({
  dossierId,
  date,
}: {
  dossierId: string;
  date: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState(false);
  const valeur = date ? new Date(date).toISOString().slice(0, 10) : "";

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <CalendarDays className="h-4 w-4 text-slate-400" />
      <span>Sortie prévue :</span>
      <input
        type="date"
        defaultValue={valeur}
        onChange={(e) => {
          setErreur(false);
          const v = e.target.value;
          startTransition(async () => {
            const res = await actionMajDatePrevue(dossierId, v);
            if (res.error) setErreur(true);
          });
        }}
        className="rounded-md border border-transparent px-1.5 py-0.5 font-medium text-ink transition-colors hover:border-slate-300 focus:border-primary-500 focus:outline-none"
      />
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      {erreur && <span className="text-xs text-red-600">Échec</span>}
    </label>
  );
}
