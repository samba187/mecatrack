"use client";

import { useEffect, useState } from "react";
import { Camera, Check, FileSignature } from "lucide-react";

const ETAPES = [
  { cle: "en_attente", label: "Véhicule pris en charge", dot: "#64748B", teinte: "rgba(100,116,139,0.16)" },
  { cle: "diagnostic", label: "Diagnostic en cours", dot: "#3B82F6", teinte: "rgba(59,130,246,0.16)" },
  { cle: "en_cours", label: "Réparation en cours", dot: "#F59E0B", teinte: "rgba(245,158,11,0.16)" },
  { cle: "pret", label: "Véhicule prêt", dot: "#22C55E", teinte: "rgba(34,197,94,0.18)" },
];

export function LiveTracker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ETAPES.length);
    }, 2100);
    return () => clearInterval(id);
  }, []);

  const etape = ETAPES[index];
  const progress = (index + 1) / ETAPES.length;
  // Aiguille : -90° (gauche) → +90° (droite)
  const angle = -90 + progress * 180;

  return (
    <div className="relative w-full max-w-sm">
      {/* Halo */}
      <div
        className="absolute -inset-6 -z-10 rounded-[40px] blur-2xl transition-colors duration-700"
        style={{ background: etape.teinte }}
      />

      <div className="overflow-hidden rounded-3xl border border-white/12 bg-asphalt-800/90 shadow-2xl backdrop-blur">
        {/* Barre supérieure façon appareil */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            Suivi client
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-accent-400">
              En direct
            </span>
          </span>
        </div>

        <div className="px-5 py-5">
          {/* Plaque + véhicule */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Peugeot 308</p>
              <p className="text-xs text-white/45">Garage Lemoine</p>
            </div>
            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-white/80">
              GD-482-KV
            </span>
          </div>

          {/* Jauge à aiguille */}
          <div className="relative mx-auto mt-5 h-24 w-48">
            <svg viewBox="0 0 100 58" className="h-full w-full overflow-visible">
              <path
                d="M8 50 A42 42 0 0 1 92 50"
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M8 50 A42 42 0 0 1 92 50"
                fill="none"
                stroke={etape.dot}
                strokeWidth="7"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={100 - progress * 100}
                style={{
                  transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1), stroke 0.7s ease",
                }}
              />
              {/* Aiguille */}
              <g
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "50px 50px",
                  transition: "transform 0.9s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <line x1="50" y1="50" x2="50" y2="18" stroke={etape.dot} strokeWidth="2.5" strokeLinecap="round" />
              </g>
              <circle cx="50" cy="50" r="4" fill="#fff" />
            </svg>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
              <span
                className="font-mono text-lg font-bold transition-colors duration-500"
                style={{ color: etape.dot }}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          {/* Bandeau statut */}
          <div
            className="mt-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-colors duration-500"
            style={{ background: etape.teinte }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-500"
              style={{ background: etape.dot }}
            />
            <span className="text-sm font-semibold text-white transition-all duration-500">
              {etape.label}
            </span>
          </div>

          {/* Timeline compacte */}
          <ol className="mt-4 space-y-2.5">
            {ETAPES.map((e, i) => {
              const passe = i < index;
              const actif = i === index;
              return (
                <li key={e.cle} className="flex items-center gap-2.5">
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-500"
                    style={{
                      borderColor: passe || actif ? e.dot : "rgba(255,255,255,0.2)",
                      background: passe ? e.dot : "transparent",
                    }}
                  >
                    {passe && <Check className="h-2.5 w-2.5 text-asphalt-900" strokeWidth={3.5} />}
                    {actif && (
                      <span
                        className="h-1.5 w-1.5 animate-pulse-dot rounded-full"
                        style={{ background: e.dot }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-xs transition-colors duration-500 ${
                      actif ? "font-semibold text-white" : passe ? "text-white/60" : "text-white/30"
                    }`}
                  >
                    {e.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Détails contextuels */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/55">
              <Camera className="h-3.5 w-3.5" /> 3 photos
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-500 ${
                index >= 2
                  ? "bg-green-500/15 text-green-300"
                  : "bg-white/5 text-white/40"
              }`}
            >
              <FileSignature className="h-3.5 w-3.5" />
              Devis 283,80 € {index >= 2 ? "signé" : "en attente"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
