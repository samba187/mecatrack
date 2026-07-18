import { CalendarCheck, CalendarDays, PenLine } from "lucide-react";

/**
 * Aperçu fidèle de la page de suivi client, dans un cadre de téléphone.
 * Pur HTML/CSS : rien à charger, toujours net.
 */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[290px] sm:w-[310px]">
      <div className="absolute -inset-6 -z-10 rounded-[48px] bg-gradient-to-br from-primary-200/60 via-transparent to-accent-200/40 blur-2xl" />
      <div className="rounded-[38px] border border-slate-300 bg-slate-900 p-2.5 shadow-modal">
        <div className="overflow-hidden rounded-[28px] bg-surface">
          {/* Encoche */}
          <div className="flex justify-center bg-white pb-1 pt-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-200" />
          </div>

          {/* En-tête garage */}
          <div className="border-b border-slate-200 bg-white px-4 pb-3 pt-1">
            <p className="text-sm font-bold text-ink">Garage Lemoine</p>
            <p className="text-[10px] text-slate-500">
              01 48 22 61 90 · Villetaneuse
            </p>
          </div>

          <div className="space-y-3 px-3 py-3">
            {/* Statut */}
            <div className="rounded-xl border-2 border-red-200 bg-white p-3 shadow-sm">
              <p className="text-[10px] text-slate-500">
                Suivi de votre Peugeot 308{" "}
                <span className="rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-700">
                  GD-482-KV
                </span>
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse-dot" />
                <p className="text-[13px] font-bold leading-tight">
                  Votre validation est attendue
                </p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[9px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-2.5 w-2.5" />
                  Entré le 15 juil.
                </span>
                <span className="flex items-center gap-1">
                  <CalendarCheck className="h-2.5 w-2.5" />
                  Prévu le 19 juil.
                </span>
              </div>
            </div>

            {/* Devis à signer */}
            <div className="overflow-hidden rounded-xl border-2 border-amber-300 bg-amber-50 shadow-sm">
              <p className="border-b border-amber-200 bg-amber-100/70 px-3 py-1.5 text-[10px] font-semibold text-amber-900">
                Votre accord est nécessaire
              </p>
              <div className="space-y-2 p-3">
                <p className="text-[10px] leading-snug text-slate-600">
                  Remplacement des deux disques de frein avant (usure sous la
                  cote minimale constatée).
                </p>
                <div className="flex items-baseline justify-between rounded-lg border border-amber-200 bg-white px-2.5 py-1.5">
                  <span className="text-[9px] text-slate-500">Total TTC</span>
                  <span className="font-mono text-[12px] font-bold">
                    283,80 €
                  </span>
                </div>
                <div className="flex h-10 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                  <svg viewBox="0 0 120 24" className="h-5 w-24 text-slate-700">
                    <path
                      d="M6 18c8-14 12-12 14-4s6 6 10-4 8-8 10 2 6 8 12 0 10-10 14-2 8 8 14 2 10-8 14-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-green-600 text-[10px] font-semibold text-white">
                  <PenLine className="h-3 w-3" />
                  J&apos;accepte et je signe ce devis
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-[11px] font-semibold">
                Photos de l&apos;intervention
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {["from-slate-500 to-slate-700", "from-amber-600/70 to-slate-700", "from-primary-400 to-primary-800"].map(
                  (g, i) => (
                    <div
                      key={i}
                      className={`aspect-[4/3] rounded-md bg-gradient-to-br ${g}`}
                    />
                  )
                )}
              </div>
              <p className="mt-1.5 text-[9px] text-slate-400">
                Plaquettes avant usées à 90 % · photo horodatée
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
