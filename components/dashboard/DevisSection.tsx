"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  Trash2,
  XCircle,
} from "lucide-react";
import { actionCreerDevis, type EtatFormulaire } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Champ, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Devis, LigneDevis, Prestation } from "@/lib/types";
import { formatDateTime, formatEuros, totauxDevis } from "@/lib/utils";

interface LigneEdit extends LigneDevis {
  cle: string;
}

function ligneVide(): LigneEdit {
  return { cle: crypto.randomUUID(), designation: "", quantite: 1, prix_unitaire_ht: 0 };
}

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Enregistrer et envoyer au client
    </Button>
  );
}

function FormulaireDevis({
  dossierId,
  type,
  prestations,
  onSucces,
}: {
  dossierId: string;
  type: "initial" | "supplementaire";
  prestations: Prestation[];
  onSucces: () => void;
}) {
  const action = actionCreerDevis.bind(null, dossierId);
  const [etat, dispatch] = useFormState(
    async (prev: EtatFormulaire, fd: FormData) => {
      const res = await action(prev, fd);
      if (res.ok) onSucces();
      return res;
    },
    {}
  );
  const [lignes, setLignes] = useState<LigneEdit[]>([ligneVide()]);
  const [tva, setTva] = useState("20");

  const totaux = useMemo(
    () => totauxDevis(lignes, parseFloat(tva.replace(",", ".")) || 0),
    [lignes, tva]
  );

  const majLigne = (cle: string, patch: Partial<LigneDevis>) =>
    setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, ...patch } : l)));
  const supprLigne = (cle: string) =>
    setLignes((ls) => (ls.length > 1 ? ls.filter((l) => l.cle !== cle) : ls));
  const ajouterPresta = (p: Prestation) =>
    setLignes((ls) => {
      const vide = ls.find((l) => !l.designation);
      const nouvelle = {
        cle: vide?.cle ?? crypto.randomUUID(),
        designation: p.designation,
        quantite: 1,
        prix_unitaire_ht: p.prix_ht,
      };
      return vide
        ? ls.map((l) => (l.cle === vide.cle ? nouvelle : l))
        : [...ls, nouvelle];
    });

  const lignesPropres = lignes
    .filter((l) => l.designation.trim())
    .map(({ designation, quantite, prix_unitaire_ht }) => ({
      designation,
      quantite,
      prix_unitaire_ht,
    }));

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="lignes" value={JSON.stringify(lignesPropres)} />

      {prestations.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            Ajout rapide depuis votre catalogue
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prestations.slice(0, 10).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => ajouterPresta(p)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <Plus className="h-3 w-3" />
                {p.designation}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="hidden grid-cols-[1fr_64px_92px_32px] gap-2 px-1 text-xs font-medium text-slate-400 sm:grid">
          <span>Désignation</span>
          <span className="text-center">Qté</span>
          <span className="text-right">PU HT</span>
          <span />
        </div>
        {lignes.map((l) => (
          <div
            key={l.cle}
            className="grid grid-cols-[1fr_64px_92px_32px] items-center gap-2"
          >
            <Input
              value={l.designation}
              onChange={(e) => majLigne(l.cle, { designation: e.target.value })}
              placeholder="Pièce ou main d'œuvre…"
              list="catalogue-prestations"
              className="h-10"
            />
            <Input
              type="number"
              min={0}
              step="0.5"
              value={l.quantite}
              onChange={(e) =>
                majLigne(l.cle, { quantite: parseFloat(e.target.value) || 0 })
              }
              className="h-10 text-center font-mono"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={l.prix_unitaire_ht}
              onChange={(e) =>
                majLigne(l.cle, {
                  prix_unitaire_ht: parseFloat(e.target.value) || 0,
                })
              }
              className="h-10 text-right font-mono"
            />
            <button
              type="button"
              onClick={() => supprLigne(l.cle)}
              className="flex h-10 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Supprimer la ligne"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <datalist id="catalogue-prestations">
          {prestations.map((p) => (
            <option key={p.id} value={p.designation} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => setLignes((ls) => [...ls, ligneVide()])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          <Plus className="h-4 w-4" />
          Ajouter une ligne
        </button>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <Champ label="TVA (%)" htmlFor="tva_pct" className="w-28">
          <Input
            id="tva_pct"
            name="tva_pct"
            inputMode="decimal"
            value={tva}
            onChange={(e) => setTva(e.target.value)}
            className="font-mono"
          />
        </Champ>
        <div className="space-y-0.5 text-right text-sm">
          <div className="flex justify-between gap-8 text-slate-500">
            <span>Total HT</span>
            <span className="font-mono">{formatEuros(totaux.ht)}</span>
          </div>
          <div className="flex justify-between gap-8 text-slate-500">
            <span>TVA</span>
            <span className="font-mono">{formatEuros(totaux.tva)}</span>
          </div>
          <div className="flex justify-between gap-8 text-base font-bold text-primary-900">
            <span>Total TTC</span>
            <span className="font-mono">{formatEuros(totaux.ttc)}</span>
          </div>
        </div>
      </div>

      {etat.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {etat.error}
        </div>
      )}
      <div className="flex justify-end">
        <BoutonEnvoyer />
      </div>
    </form>
  );
}

const STATUT_DEVIS = {
  en_attente: {
    icone: <Clock className="h-4 w-4" />,
    label: "En attente de validation",
    classe: "border-amber-200 bg-amber-50 text-amber-800",
  },
  accepte: {
    icone: <CheckCircle2 className="h-4 w-4" />,
    label: "Accepté et signé",
    classe: "border-green-200 bg-green-50 text-green-800",
  },
  refuse: {
    icone: <XCircle className="h-4 w-4" />,
    label: "Refusé",
    classe: "border-red-200 bg-red-50 text-red-700",
  },
};

function DevisCarte({ devis, dossierId }: { devis: Devis; dossierId: string }) {
  const s = STATUT_DEVIS[devis.statut];
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-primary-900">
            {devis.numero}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
            {devis.type === "initial" ? "Devis d'entrée" : "Supplémentaire"}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.classe}`}
        >
          {s.icone}
          {s.label}
        </span>
      </div>

      {devis.lignes?.length > 0 && (
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {devis.lignes.map((l, i) => (
              <tr key={i} className="text-slate-600">
                <td className="py-1 pr-2">{l.designation}</td>
                <td className="py-1 px-2 text-center font-mono text-xs text-slate-400">
                  {l.quantite} ×
                </td>
                <td className="py-1 pl-2 text-right font-mono">
                  {formatEuros(l.quantite * l.prix_unitaire_ht)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">
          {formatDateTime(devis.created_at)}
          {devis.statut === "accepte" && devis.signe_par && (
            <> · signé par {devis.signe_par}</>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-bold text-primary-900">
            {formatEuros(devis.montant_ttc)}
            <span className="ml-1 text-xs font-normal text-slate-400">TTC</span>
          </span>
          <Link
            href={`/impression/devis/${dossierId}/${devis.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            <Printer className="h-3.5 w-3.5" />
            PDF
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DevisSection({
  dossierId,
  devis,
  prestations,
}: {
  dossierId: string;
  devis: Devis[];
  prestations: Prestation[];
}) {
  const [modal, setModal] = useState<null | "initial" | "supplementaire">(null);
  const aDejaDevis = devis.length > 0;

  return (
    <div className="space-y-3">
      {devis.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Établissez le devis d&apos;entrée du véhicule : lignes de prestations,
          total automatique, imprimable en PDF avec votre cachet. Le client le
          valide et le signe en ligne.
        </p>
      ) : (
        devis.map((d) => (
          <DevisCarte key={d.id} devis={d} dossierId={dossierId} />
        ))
      )}

      <div className="flex flex-wrap gap-2">
        {!aDejaDevis && (
          <Button onClick={() => setModal("initial")}>
            <Plus className="h-4 w-4" />
            Établir le devis d&apos;entrée
          </Button>
        )}
        <Button
          variant={aDejaDevis ? "primary" : "secondary"}
          onClick={() => setModal("supplementaire")}
        >
          <Plus className="h-4 w-4" />
          Devis supplémentaire
        </Button>
      </div>

      <Modal
        ouvert={modal !== null}
        onFermer={() => setModal(null)}
        titre={
          modal === "initial"
            ? "Devis d'entrée du véhicule"
            : "Devis supplémentaire"
        }
        large
      >
        {modal && (
          <FormulaireDevis
            dossierId={dossierId}
            type={modal}
            prestations={prestations}
            onSucces={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
