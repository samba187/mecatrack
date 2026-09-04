"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ComposerMessage({
  garageId,
  sujetDefaut,
  messageDefaut,
}: {
  garageId: string;
  sujetDefaut: string;
  messageDefaut: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [sujet, setSujet] = useState(sujetDefaut);
  const [message, setMessage] = useState(messageDefaut);
  const [etat, setEtat] = useState<"repos" | "envoi" | "envoye">("repos");
  const router = useRouter();

  async function envoyer() {
    setEtat("envoi");
    try {
      const res = await fetch("/api/pilotage/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ garageId, sujet, message }),
      });
      if (!res.ok) throw new Error();
      setEtat("envoye");
      router.refresh();
    } catch {
      setEtat("repos");
      alert("Échec de l'envoi du message.");
    }
  }

  if (etat === "envoye") {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        Message envoyé
      </span>
    );
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Écrire un message
      </button>
    );
  }

  return (
    <div className="mt-2 w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <input
        value={sujet}
        onChange={(e) => setSujet(e.target.value)}
        placeholder="Sujet"
        className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        placeholder="Message"
        className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={envoyer}
          disabled={etat === "envoi" || !sujet.trim() || !message.trim()}
          className="rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"
        >
          {etat === "envoi" ? "Envoi…" : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
