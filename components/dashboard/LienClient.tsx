"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, MessageSquareShare } from "lucide-react";
import { actionEnvoyerLienSms } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";

export function LienClient({
  dossierId,
  lien,
  smsPossible,
}: {
  dossierId: string;
  lien: string;
  smsPossible: boolean;
}) {
  const [copie, setCopie] = useState(false);
  const [smsEnvoye, setSmsEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
    } catch {
      // Fallback vieux navigateurs
      const ta = document.createElement("textarea");
      ta.value = lien;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const envoyerSms = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await actionEnvoyerLienSms(dossierId);
      if (res.error) {
        setErreur(res.error);
      } else {
        setSmsEnvoye(true);
        setTimeout(() => setSmsEnvoye(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={copier} className="h-11">
          {copie ? (
            <>
              <Check className="h-4 w-4 text-green-600" /> Lien copié
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copier le lien client
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={envoyerSms}
          loading={pending}
          disabled={!smsPossible}
          title={smsPossible ? undefined : "Réservé au plan Pro"}
          className="h-11"
        >
          {smsEnvoye ? (
            <>
              <Check className="h-4 w-4 text-green-600" /> SMS envoyé
            </>
          ) : (
            <>
              <MessageSquareShare className="h-4 w-4" /> Envoyer par SMS
            </>
          )}
        </Button>
        <a
          href={lien}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          Voir la page client
        </a>
      </div>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      {!smsPossible && (
        <p className="text-xs text-slate-400">
          L&apos;envoi de SMS automatiques est inclus dans le plan Pro.
        </p>
      )}
    </div>
  );
}
