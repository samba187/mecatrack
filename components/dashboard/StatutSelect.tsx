"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, PackageCheck } from "lucide-react";
import { actionChangerStatut } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { STATUTS, statutConfig } from "@/lib/statuts";
import type { Statut } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatutSelect({
  dossierId,
  statut,
}: {
  dossierId: string;
  statut: Statut;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [confirmLivre, setConfirmLivre] = useState(false);
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const cfg = statutConfig(statut);

  const changer = (nouveau: Statut) => {
    setOuvert(false);
    setConfirmLivre(false);
    setErreur(null);
    startTransition(async () => {
      const res = await actionChangerStatut(dossierId, nouveau);
      if (res.error) setErreur(res.error);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          disabled={pending}
          className={cn(
            "flex h-11 items-center gap-2.5 rounded-lg border px-4 text-sm font-semibold shadow-sm transition-colors",
            cfg.bg,
            cfg.color,
            cfg.border,
            pending && "opacity-60"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", cfg.dot, cfg.pulse && "animate-pulse-dot")} />
          {cfg.label}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>

        {ouvert && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOuvert(false)} />
            <div className="absolute left-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-raised">
              {STATUTS.filter((s) => s.value !== "livre").map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => changer(s.value)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.dot)} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block text-xs text-slate-500">{s.description}</span>
                  </span>
                  {s.value === statut && <Check className="h-4 w-4 text-primary-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {statut !== "livre" && (
        <Button
          variant="success"
          onClick={() => setConfirmLivre(true)}
          disabled={pending}
          className="h-11"
        >
          <PackageCheck className="h-4 w-4" />
          Marquer comme livré
        </Button>
      )}

      {erreur && <p className="w-full text-sm text-red-600">{erreur}</p>}

      <Modal
        ouvert={confirmLivre}
        onFermer={() => setConfirmLivre(false)}
        titre="Marquer comme livré ?"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Le dossier passera dans l&apos;onglet « Livrés » et le client verra
          que son véhicule lui a été restitué. Cette action clôture le suivi.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmLivre(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={() => changer("livre")} loading={pending}>
            Confirmer la livraison
          </Button>
        </div>
      </Modal>
    </div>
  );
}
