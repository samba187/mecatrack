"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Info } from "lucide-react";
import {
  actionConnexion,
  actionInscription,
  actionMotDePasseOublie,
  actionNouveauMotDePasse,
  type EtatAuth,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Champ, Input } from "@/components/ui/Input";

function BoutonSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {label}
    </Button>
  );
}

function Messages({ etat }: { etat: EtatAuth }) {
  if (etat.error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {etat.error}
      </div>
    );
  }
  if (etat.info) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        {etat.info}
      </div>
    );
  }
  return null;
}

export function FormulaireConnexion() {
  const [etat, dispatch] = useFormState(actionConnexion, {} as EtatAuth);
  return (
    <form action={dispatch} className="space-y-4">
      <Champ label="Email" htmlFor="email" obligatoire>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Champ>
      <Champ label="Mot de passe" htmlFor="password" obligatoire>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Champ>
      <Messages etat={etat} />
      <BoutonSubmit label="Se connecter" />
      <p className="text-center text-sm text-slate-500">
        <Link href="/auth/forgot-password" className="hover:text-primary-700 hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </form>
  );
}

export function FormulaireInscription() {
  const [etat, dispatch] = useFormState(actionInscription, {} as EtatAuth);
  return (
    <form action={dispatch} className="space-y-4">
      <Champ label="Nom du garage" htmlFor="nom_garage" obligatoire>
        <Input id="nom_garage" name="nom_garage" placeholder="Garage Martin" required autoFocus />
      </Champ>
      <Champ label="Email professionnel" htmlFor="email" obligatoire>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="contact@garage-martin.fr" required />
      </Champ>
      <Champ label="Mot de passe" htmlFor="password" obligatoire aide="8 caractères minimum">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Champ>
      <Champ label="Téléphone du garage" htmlFor="telephone">
        <Input id="telephone" name="telephone" type="tel" placeholder="01 23 45 67 89" />
      </Champ>
      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          name="cgu"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
        />
        <span>
          J&apos;accepte les{" "}
          <Link href="/cgu" className="text-primary-700 underline underline-offset-2" target="_blank">
            conditions générales d&apos;utilisation
          </Link>
        </span>
      </label>
      <Messages etat={etat} />
      <BoutonSubmit label="Commencer mes 14 jours gratuits" />
      <p className="text-center text-xs text-slate-400">
        Sans engagement · Résiliable en un clic
      </p>
    </form>
  );
}

export function FormulaireMotDePasseOublie() {
  const [etat, dispatch] = useFormState(actionMotDePasseOublie, {} as EtatAuth);
  return (
    <form action={dispatch} className="space-y-4">
      <Champ label="Email de votre compte" htmlFor="email" obligatoire>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Champ>
      <Messages etat={etat} />
      <BoutonSubmit label="Recevoir le lien de réinitialisation" />
    </form>
  );
}

export function FormulaireNouveauMotDePasse() {
  const [etat, dispatch] = useFormState(actionNouveauMotDePasse, {} as EtatAuth);
  return (
    <form action={dispatch} className="space-y-4">
      <Champ label="Nouveau mot de passe" htmlFor="password" obligatoire aide="8 caractères minimum">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus />
      </Champ>
      <Messages etat={etat} />
      <BoutonSubmit label="Enregistrer et me connecter" />
    </form>
  );
}
