import { FormulaireNouveauMotDePasse } from "@/components/auth/FormulaireAuth";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Nouveau mot de passe" };

export default function PageNouveauMotDePasse() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choisissez votre nouveau mot de passe.
        </p>
      </div>
      <Card>
        <CardBody className="py-6">
          <FormulaireNouveauMotDePasse />
        </CardBody>
      </Card>
    </div>
  );
}
