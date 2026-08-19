import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function PageCgu() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Conditions générales d&apos;utilisation
        </h1>
        <div className="prose-sm mt-6 space-y-5 text-slate-600">
          <section>
            <h2 className="font-semibold text-ink">1. Le service</h2>
            <p className="mt-1.5 leading-relaxed">
              Mécatrack est un service de suivi de réparation destiné aux
              professionnels de la réparation automobile. Il permet de partager
              avec le client final l&apos;avancement d&apos;une intervention,
              des photos, et de recueillir la validation de devis
              supplémentaires.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink">2. Abonnement et essai</h2>
            <p className="mt-1.5 leading-relaxed">
              L&apos;essai gratuit dure 14 jours et ne nécessite pas de carte
              bancaire. Les abonnements sont mensuels, sans engagement, et
              résiliables à tout moment depuis l&apos;espace compte. La
              résiliation prend effet à la fin de la période en cours.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink">3. Données personnelles</h2>
            <p className="mt-1.5 leading-relaxed">
              Les données saisies (coordonnées clients, photos, devis) restent
              la propriété du garage. Elles sont hébergées dans l&apos;Union
              européenne et ne sont ni revendues ni exploitées à des fins
              publicitaires. Le garage reste responsable d&apos;informer ses
              clients de l&apos;utilisation de leurs coordonnées pour le suivi
              de réparation, conformément au RGPD.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink">4. Signature électronique</h2>
            <p className="mt-1.5 leading-relaxed">
              La validation de devis enregistre la signature tracée, le nom
              saisi et l&apos;horodatage. Elle constitue une trace du
              consentement du client au sens de la preuve par écrit
              électronique, sans se substituer aux obligations légales de
              facturation du professionnel.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink">5. Contact</h2>
            <p className="mt-1.5 leading-relaxed">
              Pour toute question : contact@mecatrack.com
            </p>
          </section>
        </div>
        <p className="mt-10 text-sm text-slate-400">
          Conditions générales susceptibles d&apos;évoluer. Pour toute
          question : contact@mecatrack.com
        </p>
      </main>
    </div>
  );
}
