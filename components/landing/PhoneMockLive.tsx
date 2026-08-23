"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PhoneFrame } from "./Mockups";

/**
 * Version « vivante » de la page de suivi client : la réparation progresse
 * toute seule en boucle (étapes qui se cochent, statut qui change de couleur),
 * comme un mini screencast. Se fige sur un état propre si l'utilisateur a
 * demandé des animations réduites.
 */
const ETAPES = ["Véhicule pris en charge", "Diagnostic terminé", "Réparation en cours"];

const STADES = [
  { label: "Diagnostic en cours", dot: "bg-blue-500", bord: "border-blue-200", faites: 1 },
  { label: "Réparation en cours", dot: "bg-amber-500", bord: "border-amber-200", faites: 2 },
  { label: "Véhicule prêt", dot: "bg-green-600", bord: "border-green-300", faites: 3 },
];

export function PhoneMockLive() {
  const [i, setI] = useState(1); // état par défaut (et si reduced-motion)

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % STADES.length), 2300);
    return () => clearInterval(t);
  }, []);

  const s = STADES[i];

  return (
    <PhoneFrame>
      <div className="border-b border-slate-200 bg-white px-3.5 pb-2.5 pt-1">
        <p className="text-[13px] font-bold text-ink">Garage Lemoine</p>
        <p className="text-[10px] text-slate-500">01 48 22 61 90 · Villetaneuse</p>
      </div>
      <div className="space-y-2.5 p-3">
        {/* Carte statut */}
        <div
          className={`rounded-xl border-2 bg-white p-3 transition-colors duration-500 ${s.bord}`}
        >
          <p className="text-[10px] text-slate-500">
            Suivi de votre Peugeot 308{" "}
            <span className="whitespace-nowrap rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-700">
              GD-482-KV
            </span>
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-500 ${s.dot}`}
            />
            <p
              key={s.label}
              className="text-[12px] font-bold text-ink"
              style={{ animation: "fadeSwap 0.5s ease" }}
            >
              {s.label}
            </p>
          </div>
        </div>

        {/* Avancement */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-ink">Avancement</p>
          <ol className="mt-2 space-y-1.5">
            {ETAPES.map((label, j) => {
              const fait = j < s.faites;
              const enCours = j === s.faites;
              return (
                <li key={j} className="flex items-center gap-2">
                  <span
                    className={`flex h-3 w-3 items-center justify-center rounded-full transition-all duration-500 ${
                      fait
                        ? "scale-100 bg-green-600"
                        : enCours
                          ? "scale-100 border-2 border-amber-400"
                          : "scale-90 border-2 border-slate-200"
                    }`}
                  >
                    {fait ? (
                      <Check className="h-2 w-2 text-white" strokeWidth={4} />
                    ) : null}
                  </span>
                  <span
                    className={`text-[10px] transition-colors duration-500 ${
                      fait
                        ? "text-slate-500"
                        : enCours
                          ? "font-semibold text-ink"
                          : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Photos */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-ink">Photos</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {["from-slate-400 to-slate-600", "from-amber-500/60 to-slate-600", "from-primary-400 to-primary-700"].map(
              (g, k) => (
                <div
                  key={k}
                  className={`aspect-square rounded-md bg-gradient-to-br ${g}`}
                />
              )
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
