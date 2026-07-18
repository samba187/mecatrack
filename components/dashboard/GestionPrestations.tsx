"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  actionCreerPrestation,
  actionSupprimerPrestation,
  type EtatFormulaire,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Prestation } from "@/lib/types";
import { formatEuros } from "@/lib/utils";

function BoutonAjout() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="shrink-0">
      <Plus className="h-4 w-4" />
      Ajouter
    </Button>
  );
}

export function GestionPrestations({
  prestations,
}: {
  prestations: Prestation[];
}) {
  const [etat, dispatch] = useFormState(
    async (prev: EtatFormulaire, fd: FormData) => {
      const res = await actionCreerPrestation(prev, fd);
      if (res.ok) {
        (document.getElementById("presta-form") as HTMLFormElement)?.reset();
      }
      return res;
    },
    {}
  );
  const [pending, startTransition] = useTransition();
  const [suppr, setSuppr] = useState<string | null>(null);

  const supprimer = (id: string) => {
    setSuppr(id);
    startTransition(async () => {
      await actionSupprimerPrestation(id);
      setSuppr(null);
    });
  };

  return (
    <div className="space-y-5">
      <form
        id="presta-form"
        action={dispatch}
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <Input
            name="designation"
            placeholder="Désignation (ex. Vidange + filtre à huile)"
            required
          />
          {etat.fieldErrors?.designation && (
            <p className="mt-1 text-xs text-red-600">
              {etat.fieldErrors.designation}
            </p>
          )}
        </div>
        <div className="w-full sm:w-40">
          <div className="relative">
            <Input
              name="prix_ht"
              inputMode="decimal"
              placeholder="Prix HT"
              className="pr-10 font-mono"
              required
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              € HT
            </span>
          </div>
          {etat.fieldErrors?.prix_ht && (
            <p className="mt-1 text-xs text-red-600">{etat.fieldErrors.prix_ht}</p>
          )}
        </div>
        <BoutonAjout />
      </form>

      {etat.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {etat.error}
        </div>
      )}

      {prestations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Votre catalogue est vide. Ajoutez vos prestations courantes : elles
          seront proposées en un clic lors de la création d&apos;un devis.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {prestations.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 bg-white px-4 py-2.5"
            >
              <span className="text-sm text-ink">{p.designation}</span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-slate-700">
                  {formatEuros(p.prix_ht)}
                </span>
                <button
                  onClick={() => supprimer(p.id)}
                  disabled={pending && suppr === p.id}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
