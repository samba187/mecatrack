"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { actionCreerDossier, type EtatFormulaire } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Champ, Input, Textarea } from "@/components/ui/Input";
import { AutoComplete } from "@/components/ui/AutoComplete";
import { MARQUES_NOMS, modelesPour } from "@/lib/vehicules";

const initial: EtatFormulaire = {};

function BoutonCreer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
      Créer le dossier
    </Button>
  );
}

export function FormulaireNouveauDossier() {
  const [etat, dispatch] = useFormState(actionCreerDossier, initial);
  const err = etat.fieldErrors ?? {};
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");

  return (
    <form action={dispatch} className="space-y-5">
      <Card>
        <CardHeader titre="Client" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Champ label="Nom complet" htmlFor="client_nom" obligatoire erreur={err.client_nom} className="sm:col-span-2">
            <Input id="client_nom" name="client_nom" placeholder="Jean Dupont" autoFocus required />
          </Champ>
          <Champ label="Téléphone" htmlFor="client_telephone" erreur={err.client_telephone} aide="Nécessaire pour les SMS automatiques">
            <Input id="client_telephone" name="client_telephone" type="tel" placeholder="06 12 34 56 78" />
          </Champ>
          <Champ label="Email" htmlFor="client_email" erreur={err.client_email}>
            <Input id="client_email" name="client_email" type="email" placeholder="client@email.fr" />
          </Champ>
        </CardBody>
      </Card>

      <Card>
        <CardHeader titre="Véhicule" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Champ label="Marque" htmlFor="vehicule_marque" obligatoire erreur={err.vehicule_marque}>
            <AutoComplete
              id="vehicule_marque"
              name="vehicule_marque"
              options={MARQUES_NOMS}
              value={marque}
              onValueChange={(v) => {
                setMarque(v);
                setModele("");
              }}
              placeholder="Peugeot"
              required
            />
          </Champ>
          <Champ label="Modèle" htmlFor="vehicule_modele" obligatoire erreur={err.vehicule_modele} aide={marque ? undefined : "Choisissez d'abord une marque pour la liste des modèles"}>
            <AutoComplete
              id="vehicule_modele"
              name="vehicule_modele"
              options={modelesPour(marque)}
              value={modele}
              onValueChange={setModele}
              placeholder="308"
              required
            />
          </Champ>
          <Champ label="Immatriculation" htmlFor="vehicule_immat" obligatoire erreur={err.vehicule_immat}>
            <Input id="vehicule_immat" name="vehicule_immat" placeholder="AB-123-CD" required className="font-mono uppercase" />
          </Champ>
          <div className="grid grid-cols-2 gap-4">
            <Champ label="Année" htmlFor="vehicule_annee" erreur={err.vehicule_annee}>
              <Input id="vehicule_annee" name="vehicule_annee" type="number" placeholder="2019" min={1950} />
            </Champ>
            <Champ label="Kilométrage" htmlFor="kilometrage" erreur={err.kilometrage}>
              <Input id="kilometrage" name="kilometrage" type="number" placeholder="96 000" min={0} />
            </Champ>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader titre="Réparation" />
        <CardBody className="space-y-4">
          <Champ label="Motif d'entrée" htmlFor="motif_entree" aide="Le problème décrit par le client — visible sur sa page de suivi" erreur={err.motif_entree}>
            <Textarea id="motif_entree" name="motif_entree" placeholder="Bruit au freinage, vibrations dans la pédale…" />
          </Champ>
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ label="Date prévue de sortie" htmlFor="date_prevue_sortie" erreur={err.date_prevue_sortie}>
              <Input id="date_prevue_sortie" name="date_prevue_sortie" type="date" />
            </Champ>
          </div>
          <Champ label="Notes internes" htmlFor="notes_internes" aide="Jamais visibles par le client" erreur={err.notes_internes}>
            <Textarea id="notes_internes" name="notes_internes" placeholder="À vérifier pendant l'intervention…" />
          </Champ>
        </CardBody>
      </Card>

      {etat.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {etat.error}
        </div>
      )}

      <div className="flex justify-end">
        <BoutonCreer />
      </div>
    </form>
  );
}
