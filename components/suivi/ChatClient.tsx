"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SendHorizonal } from "lucide-react";
import {
  actionMessageClient,
  type EtatPublic,
} from "@/app/suivi/[token]/actions";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

function BoutonEnvoi() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="h-11 shrink-0 px-3.5" aria-label="Envoyer le message">
      {!pending && <SendHorizonal className="h-4 w-4" />}
    </Button>
  );
}

export function ChatClient({
  token,
  messages,
  nomGarage,
}: {
  token: string;
  messages: Message[];
  nomGarage: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [etat, dispatch] = useFormState(
    async (prev: EtatPublic, fd: FormData) => {
      const res = await actionMessageClient(token, prev, fd);
      if (res.ok) formRef.current?.reset();
      return res;
    },
    {} as EtatPublic
  );

  return (
    <div>
      {messages.length > 0 && (
        <div className="scrollbar-thin mb-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.auteur === "client" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2",
                  m.auteur === "client"
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
                    m.auteur === "client"
                      ? "text-primary-200"
                      : "text-slate-400"
                  )}
                >
                  {m.auteur === "client" ? "Vous" : nomGarage} ·{" "}
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={dispatch} className="flex gap-2">
        <input
          name="contenu"
          placeholder="Une question sur la réparation ?"
          autoComplete="off"
          required
          className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <BoutonEnvoi />
      </form>
      {etat.error && <p className="mt-1.5 text-sm text-red-600">{etat.error}</p>}
      <p className="mt-2 text-xs text-slate-400">
        Le garage est prévenu par email et vous répond ici.
      </p>
    </div>
  );
}
