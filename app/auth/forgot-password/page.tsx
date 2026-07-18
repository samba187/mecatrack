import Link from "next/link";
import { FormulaireMotDePasseOublie } from "@/components/auth/FormulaireAuth";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Mot de passe oublié" };

export default function PageMotDePasseOublie() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Recevez un lien de réinitialisation par email.
        </p>
      </div>
      <Card>
        <CardBody className="py-6">
          <FormulaireMotDePasseOublie />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-500">
        <Link
          href="/auth/login"
          className="font-medium text-primary-700 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
