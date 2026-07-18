import { formatDate } from "@/lib/utils";
import type { Garage } from "@/lib/types";

/** Cachet du garage — tampon encreur stylisé, apposé sur le devis. */
export function Cachet({ garage, date }: { garage: Garage; date: string }) {
  const ville =
    garage.adresse?.split(",").pop()?.trim().replace(/^\d{5}\s*/, "") ??
    "France";
  return (
    <div
      className="pointer-events-none inline-flex select-none flex-col items-center justify-center rounded-md border-[3px] border-primary-800/70 px-4 py-2 text-center text-primary-800/80"
      style={{ transform: "rotate(-6deg)" }}
    >
      <span className="text-[8px] font-semibold uppercase tracking-[0.2em]">
        {ville}
      </span>
      <span className="my-0.5 max-w-[150px] text-[13px] font-bold uppercase leading-tight">
        {garage.nom}
      </span>
      {garage.siret && (
        <span className="font-mono text-[8px]">SIRET {garage.siret}</span>
      )}
      <span className="mt-0.5 border-t border-primary-800/40 pt-0.5 text-[8px] uppercase tracking-wide">
        Reçu le {formatDate(date)}
      </span>
    </div>
  );
}
