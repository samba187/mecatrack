"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [scrolle, setScrolle] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolle(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolle
          ? "border-b border-slate-200/80 bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Fiavo">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-slate-600 md:flex">
          <a href="#produit" className="transition-colors hover:text-primary-800">
            Le produit
          </a>
          <a href="#methode" className="transition-colors hover:text-primary-800">
            Comment ça marche
          </a>
          <a href="#tarifs" className="transition-colors hover:text-primary-800">
            Tarifs
          </a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="hidden rounded-lg px-3.5 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:text-primary-800 sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-primary-800 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-md"
          >
            Essai gratuit
          </Link>
        </div>
      </div>
    </header>
  );
}
