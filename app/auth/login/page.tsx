import Link from "next/link";
import { FormulaireConnexion } from "@/components/auth/FormulaireAuth";
import { Card, CardBody } from "@/components/ui/Card";
import { DEMO_MODE } from "@/lib/config";

export const metadata = { title: "Connexion" };

export default function PageConnexion() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accédez à votre espace garage.
        </p>
      </div>
      {DEMO_MODE && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-center text-sm text-primary-800">
          Mode démonstration : cliquez sur « Se connecter » pour entrer
          directement dans l&apos;espace du garage fictif.
        </div>
      )}
      <Card>
        <CardBody className="py-6">
          <FormulaireConnexion />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary-700 hover:underline"
        >
          Essayer gratuitement 14 jours
        </Link>
      </p>
    </div>
  );
}
