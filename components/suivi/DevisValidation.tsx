"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, PenLine, XCircle } from "lucide-react";
import {
  actionRefuserDevis,
  actionSignerDevis,
  type EtatPublic,
} from "@/app/suivi/[token]/actions";
import { Button } from "@/components/ui/Button";
import { Champ, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SignatureCanvas } from "./SignatureCanvas";
import type { Devis } from "@/lib/types";
import { formatDateTime, formatEuros } from "@/lib/utils";

function BoutonAccepter() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="success" size="lg" loading={pending} className="w-full">
      <PenLine className="h-4 w-4" />
      J&apos;accepte et je signe ce devis
    </Button>
  );
}

export function DevisValidation({
  token,
  devis,
}: {
  token: string;
  devis: Devis;
}) {
  const [etat, dispatch] = useFormState(
    actionSignerDevis.bind(null, token),
    {} as EtatPublic
  );
  const [confirmRefus, setConfirmRefus] = useState(false);
  const [refusPending, startRefus] = useTransition();
  const [erreurRefus, setErreurRefus] = useState<string | null>(null);

  const refuser = () => {
    setConfirmRefus(false);
    startRefus(async () => {
      const res = await actionRefuserDevis(token, devis.id);
      if (res.error) setErreurRefus(res.error);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-amber-300 bg-amber-50 shadow-card">
      <div className="border-b border-amber-200 bg-amber-100/70 px-4 py-3">
        <p className="flex items-center gap-2 font-semibold text-amber-900">
          <AlertCircle className="h-5 w-5" />
          Votre accord est nécessaire pour continuer
        </p>
      </div>
      <div className="space-y-4 px-4 py-4">
        {devis.description && (
          <p className="text-sm leading-relaxed text-slate-700">
            {devis.description}
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-amber-200 bg-white">
          {devis.lignes?.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2 font-semibold">Détail des travaux</th>
                  <th className="px-2 py-2 text-center font-semibold">Qté</th>
                  <th className="px-4 py-2 text-right font-semibold">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {devis.lignes.map((l, i) => (
                  <tr key={i} className="text-slate-700">
                    <td className="px-4 py-2.5">{l.designation}</td>
                    <td className="px-2 py-2.5 text-center font-mono text-xs text-slate-400">
                      {l.quantite}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {formatEuros(l.quantite * l.prix_unitaire_ht)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <dl className="space-y-1.5 border-t border-slate-200 bg-slate-50/60 p-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Montant HT</dt>
              <dd className="font-mono">{formatEuros(devis.montant_ht)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>TVA ({devis.tva_pct} %)</dt>
              <dd className="font-mono">
                {formatEuros(devis.montant_ttc - devis.montant_ht)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-ink">
              <dt>Total TTC</dt>
              <dd className="font-mono">{formatEuros(devis.montant_ttc)}</dd>
            </div>
          </dl>
        </div>

        <form action={dispatch} className="space-y-4">
          <input type="hidden" name="devis_id" value={devis.id} />
          <SignatureCanvas nomChamp="signature_base64" />
          <Champ label="Votre nom complet" htmlFor={`nom-${devis.id}`} obligatoire>
            <Input
              id={`nom-${devis.id}`}
              name="signe_par"
              placeholder="Prénom Nom"
              autoComplete="name"
              required
            />
          </Champ>
          {etat.error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-100 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {etat.error}
            </div>
          )}
          <BoutonAccepter />
        </form>

        <button
          type="button"
          onClick={() => setConfirmRefus(true)}
          disabled={refusPending}
          className="w-full rounded-lg py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white hover:text-red-600"
        >
          Je refuse ces travaux supplémentaires
        </button>
        {erreurRefus && (
          <p className="text-center text-sm text-red-600">{erreurRefus}</p>
        )}

        <p className="text-center text-xs text-slate-400">
          Signature électronique horodatée, conservée avec le dossier.
        </p>
      </div>

      <Modal
        ouvert={confirmRefus}
        onFermer={() => setConfirmRefus(false)}
        titre="Refuser ce devis ?"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Le garage sera prévenu que vous refusez ces travaux supplémentaires.
          Vous pouvez aussi lui poser une question via la messagerie plus bas
          avant de décider.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmRefus(false)}>
            Revenir
          </Button>
          <Button
            variant="danger"
            onClick={refuser}
            className="border-red-300 bg-red-600 text-white hover:bg-red-700"
          >
            Confirmer le refus
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function DevisRepondu({ devis }: { devis: Devis }) {
  const accepte = devis.statut === "accepte";
  return (
    <div
      className={`rounded-xl border p-4 ${accepte ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-semibold ${accepte ? "text-green-800" : "text-slate-600"}`}
      >
        {accepte ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Devis {accepte ? "accepté" : "refusé"}
        {accepte && devis.signature_at && (
          <span className="font-normal text-green-700">
            le {formatDateTime(devis.signature_at)}
          </span>
        )}
      </p>
      {devis.description && (
        <p className="mt-2 text-sm text-slate-600">{devis.description}</p>
      )}
      {devis.lignes?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {devis.lignes.map((l, i) => (
            <li
              key={i}
              className="flex justify-between gap-3 text-sm text-slate-600"
            >
              <span>
                {l.designation}
                {l.quantite > 1 && (
                  <span className="text-slate-400"> × {l.quantite}</span>
                )}
              </span>
              <span className="shrink-0 font-mono">
                {formatEuros(l.quantite * l.prix_unitaire_ht)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 border-t border-slate-200/70 pt-2 font-mono text-sm font-semibold">
        {formatEuros(devis.montant_ttc)} TTC
      </p>
    </div>
  );
}
