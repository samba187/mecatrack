"use client";

import { LogOut } from "lucide-react";
import { actionDeconnexion } from "@/app/auth/actions";

export function DeconnexionBouton() {
  return (
    <form action={actionDeconnexion}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
        title="Se déconnecter"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </form>
  );
}
