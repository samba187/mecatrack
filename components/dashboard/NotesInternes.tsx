"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { actionMajNotes } from "@/app/dashboard/actions";
import { Textarea } from "@/components/ui/Input";

type Etat = "repos" | "attente" | "sauvegarde" | "ok" | "erreur";

export function NotesInternes({
  dossierId,
  notes,
}: {
  dossierId: string;
  notes: string | null;
}) {
  const [etat, setEtat] = useState<Etat>("repos");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const derniereValeur = useRef(notes ?? "");

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onChange = (valeur: string) => {
    setEtat("attente");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (valeur === derniereValeur.current) {
        setEtat("repos");
        return;
      }
      setEtat("sauvegarde");
      const res = await actionMajNotes(dossierId, valeur);
      if (res.error) {
        setEtat("erreur");
      } else {
        derniereValeur.current = valeur;
        setEtat("ok");
        setTimeout(() => setEtat("repos"), 2000);
      }
    }, 1000);
  };

  return (
    <div>
      <Textarea
        defaultValue={notes ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pense-bête atelier : pièces à commander, points à vérifier… Le client ne voit jamais ces notes."
        className="min-h-[120px]"
      />
      <p className="mt-1.5 flex h-5 items-center gap-1.5 text-xs text-slate-400">
        {etat === "sauvegarde" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…
          </>
        )}
        {etat === "ok" && (
          <>
            <Check className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Enregistré</span>
          </>
        )}
        {etat === "erreur" && (
          <span className="text-red-600">
            Échec de l&apos;enregistrement — modifiez le texte pour réessayer.
          </span>
        )}
        {(etat === "repos" || etat === "attente") && "Sauvegarde automatique"}
      </p>
    </div>
  );
}
