import { cn } from "@/lib/utils";

export function LogoIcone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-8 w-8", className)}
      aria-hidden
      fill="none"
    >
      <rect width="40" height="40" rx="10" className="fill-primary-800" />
      {/* Compteur : arc gradué + aiguille */}
      <path
        d="M11 26a9.5 9.5 0 0 1 18.4-3.3"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line x1="11.6" y1="20.5" x2="13.8" y2="21.6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="15.6" x2="17.2" y2="17.7" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="22.5" y1="14.3" x2="22.2" y2="16.7" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28.3" y1="17.2" x2="26.6" y2="18.9" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="26" r="2.6" className="fill-accent-500" />
      <line
        x1="20"
        y1="26"
        x2="27.5"
        y2="21.5"
        className="stroke-accent-500"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  clair,
}: {
  className?: string;
  clair?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoIcone />
      <span
        className={cn(
          "text-[19px] font-bold tracking-tight",
          clair ? "text-white" : "text-primary-900"
        )}
      >
        Fiavo
      </span>
    </span>
  );
}
