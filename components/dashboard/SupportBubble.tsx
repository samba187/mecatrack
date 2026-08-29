"use client";

import { useState, useTransition } from "react";
import { Check, LifeBuoy, Loader2, Send, X } from "lucide-react";
import { actionEnvoyerSupport } from "@/app/dashboard/actions";

export function SupportBubble({
  garageNom,
  garageEmail,
}: {
  garageNom: string;
  garageEmail: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [etat, setEtat] = useState<"idle" | "ok" | "erreur">("idle");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, demarrer] = useTransition();

  const envoyer = () => {
    setErreur(null);
    demarrer(async () => {
      const r = await actionEnvoyerSupport(sujet, message);
      if (r.error) {
        setErreur(r.error);
        setEtat("erreur");
      } else {
        setEtat("ok");
        setSujet("");
        setMessage("");
      }
    });
  };

  const reinitialiser = () => {
    setEtat("idle");
    setErreur(null);
  };

  return (
    // Sur mobile, remontée au-dessus de la barre d'onglets fixe.
    <div className="fixed bottom-[76px] right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5 print:hidden">
      {ouvert && (
        <div className="w-[360px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 bg-primary-800 px-5 py-4 text-white">
            <div>
              <p className="text-base font-semibold">Besoin d&apos;aide ?</p>
              <p className="mt-0.5 text-sm text-primary-100">
                On vous répond par email sous 24 h.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer"
              className="rounded-lg p-1 text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5">
            {etat === "ok" ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-ink">Message envoyé</p>
                <p className="mt-1 text-sm text-slate-500">
                  On vous répond
                  {garageEmail ? ` à ${garageEmail}` : " par email"} au plus
                  vite.
                </p>
                <button
                  type="button"
                  onClick={reinitialiser}
                  className="mt-4 text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-600">
                  Bonjour {garageNom}, une question, un bug, une idée ?
                  Écrivez-nous, on s&apos;en occupe.
                </p>
                <input
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Sujet (facultatif)"
                  className="mb-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Votre message…"
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                {erreur && (
                  <p className="mt-1.5 text-sm text-red-600">{erreur}</p>
                )}
                <button
                  type="button"
                  onClick={envoyer}
                  disabled={envoi || message.trim().length < 5}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-800 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                >
                  {envoi ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Envoyer
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-label={ouvert ? "Fermer le support" : "Ouvrir le support"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-800 text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-700"
      >
        {ouvert ? (
          <X className="h-6 w-6" />
        ) : (
          <LifeBuoy className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
