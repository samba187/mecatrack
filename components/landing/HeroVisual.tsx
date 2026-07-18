"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import {
  BrowserFrame,
  DashboardMock,
  PhoneMock,
  SignatureMock,
} from "./Mockups";

/**
 * Composition produit en profondeur : plusieurs cartes flottantes avec
 * animation d'apesanteur décalée + parallaxe douce au mouvement de la souris.
 */
export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const bouge = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
      const d = parseFloat(layer.dataset.depth ?? "0");
      layer.style.transform = `translate3d(${(-cx * d * 22).toFixed(1)}px, ${(-cy * d * 22).toFixed(1)}px, 0)`;
    });
  };

  const reset = () => {
    ref.current
      ?.querySelectorAll<HTMLElement>("[data-depth]")
      .forEach((l) => (l.style.transform = ""));
  };

  return (
    <>
      {/* Mobile : version simple et sûre */}
      <div className="mx-auto mt-12 max-w-md sm:hidden">
        <BrowserFrame>
          <DashboardMock />
        </BrowserFrame>
      </div>

      {/* Desktop : composition flottante */}
      <div
        ref={ref}
        onMouseMove={bouge}
        onMouseLeave={reset}
        className="relative mx-auto mt-16 hidden h-[500px] w-full max-w-4xl sm:block"
      >
        {/* Halo */}
        <div className="absolute inset-x-10 bottom-0 top-16 -z-10 rounded-[2.5rem] bg-gradient-to-b from-primary-100/70 via-primary-50/40 to-transparent blur-2xl" />

        {/* Tableau de bord (fond) */}
        <div
          data-depth="0.3"
          className="absolute left-0 top-6 w-[76%] transition-transform duration-500 ease-out"
        >
          <div className="animate-float" style={{ animationDuration: "7s" }}>
            <BrowserFrame className="ring-1 ring-slate-900/5">
              <DashboardMock />
            </BrowserFrame>
          </div>
        </div>

        {/* Carte signature (flottante, légèrement inclinée) */}
        <div
          data-depth="1"
          className="absolute left-4 top-0 w-[280px] transition-transform duration-500 ease-out"
        >
          <div
            className="animate-float -rotate-2"
            style={{ animationDuration: "6s", animationDelay: "-1.5s" }}
          >
            <SignatureMock />
          </div>
        </div>

        {/* Téléphone client (premier plan) */}
        <div
          data-depth="1.25"
          className="absolute -bottom-4 right-2 transition-transform duration-500 ease-out"
        >
          <div
            className="animate-float"
            style={{ animationDuration: "8s", animationDelay: "-3s" }}
          >
            <PhoneMock />
          </div>
        </div>

        {/* Notification flottante "devis signé" */}
        <div
          data-depth="1.6"
          className="absolute right-0 top-8 transition-transform duration-500 ease-out"
        >
          <div
            className="animate-float flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-raised backdrop-blur"
            style={{ animationDuration: "5.5s", animationDelay: "-0.8s" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">
                Devis accepté et signé
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                283,80 € · K. Benaïssa
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
