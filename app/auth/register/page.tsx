import Link from "next/link";
import { FormulaireInscription } from "@/components/auth/FormulaireAuth";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Essai gratuit 14 jours" };

export default function PageInscription() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Créez votre espace garage
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          14 jours d&apos;essai avec toutes les fonctionnalités Pro, résiliable
          en un clic.
        </p>
      </div>
      <Card>
        <CardBody className="py-6">
          <FormulaireInscription />
        </CardBody>
      </Card>
      <p className="text-center text-sm text-slate-500">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary-700 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
