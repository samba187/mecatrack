"use client";

import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Check } from "lucide-react";
import { actionMajGarage, type EtatFormulaire } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Champ, Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { Garage } from "@/lib/types";

function BoutonEnregistrer({ ok }: { ok?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {ok && !pending ? (
        <>
          <Check className="h-4 w-4" /> Enregistré
        </>
      ) : (
        "Enregistrer"
      )}
    </Button>
  );
}

export function FormulaireGarage({ garage }: { garage: Garage }) {
  const [etat, dispatch] = useFormState(actionMajGarage, {} as EtatFormulaire);
  const err = etat.fieldErrors ?? {};

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ label="Nom du garage" htmlFor="nom" obligatoire erreur={err.nom}>
          <Input id="nom" name="nom" defaultValue={garage.nom} required />
        </Champ>
        <Champ label="Téléphone fixe" htmlFor="telephone" erreur={err.telephone}>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            placeholder="01 48 22 61 90"
            defaultValue={garage.telephone ?? ""}
          />
        </Champ>
        <Champ
          label="Téléphone mobile"
          htmlFor="telephone_mobile"
          erreur={err.telephone_mobile}
          aide="Reçoit les SMS d'alerte (réponses clients, devis signés)."
        >
          <Input
            id="telephone_mobile"
            name="telephone_mobile"
            type="tel"
            placeholder="06 12 34 56 78"
            defaultValue={garage.telephone_mobile ?? ""}
          />
        </Champ>
        <Champ label="Adresse" htmlFor="adresse" erreur={err.adresse} className="sm:col-span-2">
          <Input
            id="adresse"
            name="adresse"
            defaultValue={garage.adresse ?? ""}
            placeholder="14 rue des Ateliers, 93430 Villetaneuse"
          />
        </Champ>
        <Champ
          label="SIRET"
          htmlFor="siret"
          erreur={err.siret}
          aide="Apparaît sur le cachet de vos devis PDF."
          className="sm:col-span-2"
        >
          <Input
            id="siret"
            name="siret"
            defaultValue={garage.siret ?? ""}
            placeholder="812 456 789 00023"
            className="font-mono"
          />
        </Champ>
        <Champ
          label="Email de notification"
          htmlFor="email"
          erreur={err.email}
          aide="Vous recevez ici les réponses aux devis et les messages clients."
          className="sm:col-span-2"
        >
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={garage.email ?? ""}
          />
        </Champ>

        <Champ
          label="Logo du garage"
          erreur={err.logo_url}
          aide="Apparaît en haut de vos devis PDF et sur la page de suivi du client."
        >
          <ImageUpload
            name="logo_url"
            defaultValue={garage.logo_url}
            format="jpeg"
          />
        </Champ>
        <Champ
          label="Cachet ou signature"
          erreur={err.cachet_url}
          aide="Photo/scan de votre tampon ou signature. Ajouté sur le devis, en plus du cachet automatique. PNG à fond transparent conseillé."
        >
          <ImageUpload
            name="cachet_url"
            defaultValue={garage.cachet_url}
            format="png"
          />
        </Champ>
      </div>

      {etat.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {etat.error}
        </div>
      )}

      <div className="flex justify-end">
        <BoutonEnregistrer ok={etat.ok} />
      </div>
    </form>
  );
}
