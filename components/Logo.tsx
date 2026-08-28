import { cn } from "@/lib/utils";

export function LogoIcone({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-icon.png"
      alt=""
      aria-hidden
      className={cn("h-8 w-auto", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-full.png"
      alt="Fiavo"
      className={cn("h-8 w-auto", className)}
    />
  );
}
