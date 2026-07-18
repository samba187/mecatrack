import { statutConfig } from "@/lib/statuts";
import type { Statut } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatutBadge({
  statut,
  client,
  className,
}: {
  statut: Statut;
  client?: boolean;
  className?: string;
}) {
  const cfg = statutConfig(statut);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.bg,
        cfg.color,
        cfg.border,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          cfg.dot,
          cfg.pulse && "animate-pulse-dot"
        )}
      />
      {client ? cfg.labelClient : cfg.label}
    </span>
  );
}
