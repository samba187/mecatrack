"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SendHorizonal } from "lucide-react";
import {
  actionEnvoyerMessage,
  actionMarquerLus,
  type EtatFormulaire,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

function BoutonEnvoi() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="h-11 shrink-0 px-3.5" aria-label="Envoyer">
      {!pending && <SendHorizonal className="h-4 w-4" />}
    </Button>
  );
}

const REPONSES_RAPIDES = [
  "Votre véhicule est prêt, vous pouvez venir le récupérer.",
  "Nous vous rappelons dès que possible.",
  "Le devis vous a été envoyé, merci de le valider.",
  "Bien reçu, merci !",
];

export function ChatGarage({
  dossierId,
  messages,
  aDesNonLus,
}: {
  dossierId: string;
  messages: Message[];
  aDesNonLus: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const action = actionEnvoyerMessage.bind(null, dossierId);
  const [etat, dispatch] = useFormState(
    async (prev: EtatFormulaire, fd: FormData) => {
      const res = await action(prev, fd);
      if (res.ok) formRef.current?.reset();
      return res;
    },
    {}
  );

  useEffect(() => {
    if (aDesNonLus) void actionMarquerLus(dossierId);
  }, [aDesNonLus, dossierId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  return (
    <div>
      <div className="scrollbar-thin max-h-80 space-y-2.5 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            Aucun message pour l&apos;instant. Le client peut vous écrire
            depuis sa page de suivi.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.auteur === "garage" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2",
                m.auteur === "garage"
                  ? "rounded-br-md bg-primary-800 text-white"
                  : "rounded-bl-md bg-slate-100 text-ink"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {m.contenu}
              </p>
              <p
                className={cn(
                  "mt-1 text-[11px]",
                  m.auteur === "garage" ? "text-primary-200" : "text-slate-400"
                )}
              >
                {m.auteur === "garage" ? "Vous" : "Client"} ·{" "}
                {formatDateTime(m.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={finRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {REPONSES_RAPIDES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = r;
                inputRef.current.focus();
              }
            }}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            {r.length > 34 ? `${r.slice(0, 32)}…` : r}
          </button>
        ))}
      </div>

      <form ref={formRef} action={dispatch} className="mt-2 flex gap-2">
        <input
          ref={inputRef}
          name="contenu"
          placeholder="Répondre au client…"
          autoComplete="off"
          required
          className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <BoutonEnvoi />
      </form>
      {etat.error && <p className="mt-1.5 text-sm text-red-600">{etat.error}</p>}
    </div>
  );
}
