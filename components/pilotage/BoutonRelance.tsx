"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BoutonRelance({ garageId }: { garageId: string }) {
  const [etat, setEtat] = useState<"repos" | "envoi" | "envoye">("repos");
  const router = useRouter();

  async function envoyer() {
    setEtat("envoi");
    try {
      const res = await fetch("/api/pilotage/relance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ garageId }),
      });
      if (!res.ok) throw new Error();
      setEtat("envoye");
      router.refresh();
    } catch {
      setEtat("repos");
      alert("Échec de l'envoi du rappel.");
    }
  }

  if (etat === "envoye") {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        Envoyé
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={envoyer}
      disabled={etat === "envoi"}
      className="shrink-0 rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"
    >
      {etat === "envoi" ? "Envoi…" : "Envoyer le rappel"}
    </button>
  );
}
