"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, Receipt, Settings, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export const LIENS = [
  { href: "/dashboard/dossiers", label: "Dossiers", icone: FolderOpen },
  { href: "/dashboard/devis", label: "Devis", icone: FileText },
  { href: "/dashboard/factures", label: "Factures", icone: Receipt },
  { href: "/dashboard/prestations", label: "Prestations", icone: Tag },
  { href: "/dashboard/compte", label: "Compte", icone: Settings },
];

function estActif(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation horizontale de l'en-tête (à partir du format tablette). */
export function NavBureau() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {LIENS.map((l) => {
        const actif = estActif(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              actif
                ? "bg-primary-50 text-primary-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            )}
          >
            <l.icone className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Barre d'onglets fixée en bas sur mobile : cible large, atteignable au
 * pouce, avec l'onglet courant mis en évidence (l'ancienne barre défilante
 * de l'en-tête était trop dense pour être utilisable).
 */
export function NavMobile() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden print:hidden">
      <div className="flex">
        {LIENS.map((l) => {
          const actif = estActif(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                actif ? "text-primary-800" : "text-slate-500"
              )}
            >
              <l.icone
                className={cn("h-[22px] w-[22px]", actif && "stroke-[2.4]")}
              />
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
