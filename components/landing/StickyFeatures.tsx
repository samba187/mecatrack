"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import {
  BrowserFrame,
  DashboardMock,
  PhoneMock,
  SignatureMock,
} from "./Mockups";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    eyebrow: "Un simple lien",
    titre: "Le client suit tout, sans rien installer",
    texte:
      "À la création du dossier, votre client reçoit un SMS avec un lien. Il l'ouvre comme un suivi de colis : aucun compte, aucune application, aucun mot de passe.",
    points: [
      "Envoi automatique à l'arrivée du véhicule",
      "Avancement mis à jour en temps réel",
      "Fini les dix appels « c'est prêt ? » par jour",
    ],
  },
  {
    eyebrow: "Devis supplémentaires",
    titre: "Les imprévus, signés avant d'y toucher",
    texte:
      "Des disques hors cote en changeant les plaquettes ? Envoyez le devis sur le lien du client : il l'accepte en signant du bout du doigt, ou le refuse. Vous gardez une preuve horodatée.",
    points: [
      "Signature électronique avec nom et horodatage",
      "Le garage est prévenu par email de la réponse",
      "Plus jamais de « je n'ai pas donné mon accord »",
    ],
  },
  {
    eyebrow: "Votre atelier en un coup d'œil",
    titre: "Tous vos véhicules, tous leurs statuts",
    texte:
      "Chaque dossier affiche le client, le véhicule, son statut et ce qui attend une action de votre part. Créez un dossier complet en deux minutes.",
    points: [
      "Photos prises depuis le téléphone",
      "Statuts, historique et notes par dossier",
      "Recherche par client ou immatriculation",
    ],
  },
];

function Visuel({ i }: { i: number }) {
  if (i === 0) return <PhoneMock />;
  if (i === 1) return <SignatureMock />;
  return (
    <BrowserFrame className="w-full max-w-lg">
      <DashboardMock />
    </BrowserFrame>
  );
}

export function StickyFeatures() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pick = () => {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const dist = Math.abs(centre - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    // L'IntersectionObserver se déclenche à chaque passage de seuil pendant le
    // défilement, indépendamment des événements « scroll » de window.
    const io = new IntersectionObserver(pick, {
      threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1],
    });
    refs.current.forEach((el) => el && io.observe(el));
    pick();
    return () => io.disconnect();
  }, []);

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Colonne texte */}
        <div className="py-8 lg:py-24">
          {STEPS.map((s, i) => (
            <div
              key={i}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="border-t border-slate-200 py-12 first:border-t-0 lg:min-h-[70vh] lg:border-t-0 lg:py-0 lg:flex lg:flex-col lg:justify-center"
            >
              <div
                className={cn(
                  "transition-all duration-500 lg:duration-700",
                  active === i
                    ? "lg:opacity-100"
                    : "lg:opacity-35 lg:blur-[0.5px]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-accent-600">
                    0{i + 1}
                  </span>
                  <span className="h-px w-8 bg-accent-500/50" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {s.eyebrow}
                  </p>
                </div>
                <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-primary-950 sm:text-[1.9rem]">
                  {s.titre}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  {s.texte}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visuel inline (mobile uniquement) */}
              <div className="mt-8 flex justify-center lg:hidden">
                <Visuel i={i} />
              </div>
            </div>
          ))}
        </div>

        {/* Colonne visuelle épinglée (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center">
            <div className="relative flex h-[540px] w-full items-center justify-center">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute flex w-full items-center justify-center transition-all duration-500 ease-out",
                    active === i
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-6 scale-95 opacity-0"
                  )}
                >
                  <Visuel i={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lien démo */}
      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <Link
          href="/suivi/demo"
          className="group inline-flex items-center gap-2 font-semibold text-accent-600 transition-colors hover:text-accent-700"
        >
          Voir une page de suivi d&apos;exemple
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
