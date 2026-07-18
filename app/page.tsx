import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSignature,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { LandingNav } from "@/components/landing/LandingNav";
import { Reveal } from "@/components/landing/Reveal";
import { HeroVisual } from "@/components/landing/HeroVisual";
import {
  BrowserFrame,
  DashboardMock,
  PhoneMock,
  SignatureMock,
} from "@/components/landing/Mockups";
import { PLANS } from "@/lib/plans";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-ink">
      <LandingNav />
      <Hero />
      <TrustBar />
      <FeatureLien />
      <FeatureSignature />
      <FeatureDashboard />
      <Methode />
      <Gagnant />
      <Tarifs />
      <Faq />
      <CtaFinal />
      <PiedDePage />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-accent-500/60" />
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
        {children}
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-[68px]">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F8FC 100%)" }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>Logiciel pour garages indépendants</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-primary-950 sm:text-[3.4rem]">
              Le suivi de réparation qui
              <span className="text-accent-600"> rassure vos clients</span> et
              vous fait gagner en crédibilité.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Chaque client reçoit un lien pour suivre sa réparation en direct :
              photos, avancement, et devis signés en ligne avant la moindre
              intervention. Moins d&apos;appels, zéro litige, une image
              d&apos;atelier sérieux.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-md"
              >
                Essayer gratuitement 14 jours
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/suivi/demo"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-base font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400"
              >
                <MonitorSmartphone className="h-4 w-4" />
                Voir la page vue par le client
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-4 text-sm text-slate-500">
              Sans engagement · Résiliable en un clic · Prêt en 5 minutes
            </p>
          </Reveal>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icone: MonitorSmartphone, texte: "Aucune application à installer" },
    { icone: ShieldCheck, texte: "Conforme RGPD" },
    { icone: MapPin, texte: "Hébergé en France" },
    { icone: FileSignature, texte: "Signature électronique horodatée" },
  ];
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.texte} className="flex items-center justify-center gap-2.5 text-center">
            <it.icone className="h-5 w-5 shrink-0 text-primary-600" />
            <span className="text-sm font-medium text-slate-600">{it.texte}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  titre,
  texte,
  points,
  visuel,
  inverse,
  fond,
}: {
  eyebrow: string;
  titre: string;
  texte: string;
  points: string[];
  visuel: React.ReactNode;
  inverse?: boolean;
  fond?: boolean;
}) {
  return (
    <section className={fond ? "bg-surface py-20 sm:py-24" : "bg-white py-20 sm:py-24"}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal className={inverse ? "lg:order-2" : ""}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-primary-950 sm:text-[2.1rem]">
            {titre}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{texte}</p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-slate-700">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal
          delay={120}
          className={`flex justify-center ${inverse ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}
        >
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-100/70 via-primary-50/40 to-transparent blur-2xl" />
            {visuel}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureLien() {
  return (
    <FeatureRow
      eyebrow="Un simple lien"
      titre="Le client suit tout, sans rien installer"
      texte="À la création du dossier, votre client reçoit un SMS avec un lien. Il l'ouvre comme un suivi de colis : aucun compte, aucune application, aucun mot de passe. Ça marche sur tous les téléphones."
      points={[
        "Envoi automatique du lien à l'arrivée du véhicule",
        "Avancement mis à jour en temps réel",
        "Fini les dix appels « c'est prêt ? » par jour",
      ]}
      visuel={<PhoneMock />}
    />
  );
}

function FeatureSignature() {
  return (
    <FeatureRow
      fond
      inverse
      eyebrow="Devis supplémentaires"
      titre="Les imprévus, validés et signés avant d'y toucher"
      texte="Des disques hors cote en changeant les plaquettes ? Envoyez le devis sur le lien du client : il l'accepte en signant du bout du doigt, ou le refuse. Vous gardez une preuve horodatée."
      points={[
        "Signature électronique avec nom, tracé et horodatage",
        "Le garage est prévenu par email de la réponse",
        "Plus jamais de « je n'ai jamais donné mon accord »",
      ]}
      visuel={<SignatureMock />}
    />
  );
}

function FeatureDashboard() {
  return (
    <FeatureRow
      eyebrow="Votre atelier en un coup d'œil"
      titre="Tous vos véhicules, tous leurs statuts, une seule vue"
      texte="Chaque dossier affiche le client, le véhicule, son statut et ce qui attend une action de votre part : un devis à faire valider, un message à lire. Créez un dossier complet en deux minutes."
      points={[
        "Photos prises directement depuis le téléphone",
        "Statuts, historique et notes internes par dossier",
        "Recherche par nom de client ou immatriculation",
      ]}
      visuel={
        <BrowserFrame className="w-full max-w-lg">
          <DashboardMock />
        </BrowserFrame>
      }
      inverse
    />
  );
}

function Methode() {
  const etapes = [
    {
      num: "1",
      titre: "Créez le dossier",
      texte:
        "Client, véhicule, motif d'entrée. Le lien de suivi part par SMS automatiquement.",
    },
    {
      num: "2",
      titre: "Avancez, photographiez",
      texte:
        "Une photo, un changement de statut : le client est prévenu sans que vous décrochiez.",
    },
    {
      num: "3",
      titre: "Faites valider les imprévus",
      texte:
        "Le client signe les devis en ligne. Vous rendez le véhicule réglé, sans discussion.",
    },
  ];
  return (
    <section id="methode" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Comment ça marche</Eyebrow>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            Pensé pour l&apos;atelier, pas pour le bureau
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Des boutons évidents, de grandes zones tactiles. Si vous savez
            envoyer un SMS, vous savez utiliser Mécatrack.
          </p>
        </Reveal>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3">
          <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 md:block" />
          {etapes.map((e, i) => (
            <Reveal key={e.num} delay={i * 120}>
              <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary-800 text-lg font-bold text-white shadow-md ring-1 ring-slate-200">
                  {e.num}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-primary-950">
                  {e.titre}
                </h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-slate-600">
                  {e.texte}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gagnant() {
  const gains = [
    "Le client voit votre travail en photos : il comprend ce qu'il paie",
    "Chaque accord est signé et daté : fini les litiges à la caisse",
    "Une image d'atelier moderne et transparent",
    "Un client rassuré revient — et vous recommande",
  ];
  return (
    <section id="produit" className="relative overflow-hidden bg-primary-50/70 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <div className="flex justify-center">
            <Eyebrow>Vous êtes gagnant</Eyebrow>
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-primary-950 sm:text-4xl">
            La transparence, c&apos;est exactement ce qui vous rend crédible
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Les concessions ont des portails clients à plusieurs milliers
            d&apos;euros par an. Vos clients y sont habitués — et ne comprennent
            pas pourquoi leur garage de quartier reste silencieux. Mécatrack vous
            met à leur niveau, pour le prix d&apos;un plein.
          </p>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mx-auto mt-12 grid max-w-3xl gap-x-10 gap-y-5 px-4 sm:grid-cols-2 sm:px-6">
          {gains.map((g) => (
            <div
              key={g}
              className="flex items-start gap-3 rounded-xl border border-primary-100 bg-white/70 px-4 py-3.5 shadow-card backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-raised"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-[15px] text-slate-700">{g}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-10 text-center">
          <Link
            href="/suivi/demo"
            className="group inline-flex items-center gap-2 font-semibold text-accent-600 transition-colors hover:text-accent-700"
          >
            Voir une page de suivi d&apos;exemple
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Tarifs() {
  return (
    <section id="tarifs" className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Tarifs</Eyebrow>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            Essayez 14 jours, tout inclus
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Puis choisissez votre formule. Sans engagement, résiliable en un clic.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl items-center gap-6 md:grid-cols-2">
          {(["essentiel", "pro"] as const).map((id) => {
            const plan = PLANS[id];
            const pro = id === "pro";
            return (
              <Reveal key={id} delay={pro ? 120 : 0}>
                <div
                  className={
                    pro
                      ? "relative rounded-2xl border-2 border-primary-700 bg-white p-7 shadow-raised transition-transform duration-300 hover:-translate-y-1 md:-my-3 md:py-9"
                      : "relative rounded-2xl border border-slate-200 bg-white p-7 shadow-card transition-transform duration-300 hover:-translate-y-1"
                  }
                >
                  {pro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-800 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                      Le plus choisi
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-primary-950">
                    {plan.nom}
                  </h3>
                  <p className="mt-1 min-h-[40px] text-sm text-slate-500">
                    {plan.description}
                  </p>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-primary-950">
                      {plan.prix} €
                    </span>
                    <span className="text-slate-500">/mois HT</span>
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.fonctionnalites.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${pro ? "text-primary-600" : "text-slate-400"}`}
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className={
                      pro
                        ? "mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent-500 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-600"
                        : "mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400"
                    }
                  >
                    Commencer l&apos;essai gratuit
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <p className="mx-auto mt-8 max-w-lg text-center text-sm text-slate-500">
            Un seul devis signé au lieu d&apos;être contesté rembourse
            l&apos;abonnement de l&apos;année.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const questions = [
    {
      q: "Mes clients doivent-ils installer une application ?",
      r: "Non. Ils reçoivent un lien par SMS et l'ouvrent dans leur navigateur, comme un suivi de colis. Aucun compte, aucun téléchargement, aucun mot de passe.",
    },
    {
      q: "C'est compliqué à prendre en main ?",
      r: "Créer un dossier prend deux minutes : nom du client, véhicule, motif. Ensuite tout se fait d'un geste — une photo, un changement de statut. Si vous savez envoyer un SMS, vous savez utiliser Mécatrack.",
    },
    {
      q: "La signature électronique a-t-elle une valeur en cas de litige ?",
      r: "Chaque validation enregistre la signature tracée, le nom complet saisi, la date et l'heure, rattachés au devis précis. C'est une trace écrite datée du consentement de votre client — exactement ce qui manque quand un désaccord éclate.",
    },
    {
      q: "Suis-je engagé ?",
      r: "Aucun engagement. L'abonnement est mensuel et se résilie en un clic depuis votre compte. Vos dossiers restent consultables.",
    },
    {
      q: "Où sont stockées les données de mes clients ?",
      r: "Sur des serveurs européens, conformément au RGPD. Les pages de suivi sont protégées par un lien unique impossible à deviner, et vos données ne sont jamais revendues.",
    },
    {
      q: "Ça remplace mon logiciel de devis et factures ?",
      r: "Non, et c'est voulu. Mécatrack complète votre outil de gestion : il s'occupe de la communication et des validations pendant la réparation. Vous continuez à facturer comme aujourd'hui.",
    },
  ];
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          {questions.map((item) => (
            <details key={item.q} className="group px-5 py-4 open:bg-slate-50/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-primary-950 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {item.r}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section className="relative overflow-hidden bg-primary-900 py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(50% 70% at 50% 0%, rgba(232,64,28,0.25) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Reprenez la main sur votre relation client
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-200">
            Créez votre premier dossier aujourd&apos;hui. Dans dix minutes, votre
            prochain client suivra sa réparation en direct.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-accent-500 px-7 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-400"
            >
              Essayer gratuitement 14 jours
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/suivi/demo"
              className="inline-flex h-12 items-center rounded-xl border border-white/25 px-7 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Voir la démo
            </Link>
          </div>
          <p className="mt-4 text-sm text-primary-300">
            Sans engagement · Résiliable en un clic · Support en français
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PiedDePage() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-10 sm:flex-row sm:px-6">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-slate-500">
          <a href="#tarifs" className="transition-colors hover:text-primary-800">
            Tarifs
          </a>
          <Link href="/suivi/demo" className="transition-colors hover:text-primary-800">
            Démo
          </Link>
          <Link href="/cgu" className="transition-colors hover:text-primary-800">
            CGU
          </Link>
          <Link href="/auth/login" className="transition-colors hover:text-primary-800">
            Connexion
          </Link>
        </nav>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} Mécatrack</p>
      </div>
    </footer>
  );
}
