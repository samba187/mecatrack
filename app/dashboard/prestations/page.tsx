import { redirect } from "next/navigation";
import { GestionPrestations } from "@/components/dashboard/GestionPrestations";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getGarageCourant, listPrestations } from "@/lib/db";

export const metadata = { title: "Prestations" };
export const dynamic = "force-dynamic";

export default async function PagePrestations() {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");
  const prestations = await listPrestations(garage);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prestations</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Votre catalogue de tarifs. Chaque prestation devient un bouton
          d&apos;ajout rapide dans vos devis.
        </p>
      </div>
      <Card>
        <CardHeader
          titre="Catalogue"
          description="Ajoutez, tarifez et réutilisez vos prestations courantes."
        />
        <CardBody>
          <GestionPrestations prestations={prestations} />
        </CardBody>
      </Card>
    </div>
  );
}
