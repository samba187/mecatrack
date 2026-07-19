import { Camera, Check, FileSignature, MessageSquare } from "lucide-react";
import { LogoIcone } from "@/components/Logo";

/* Fenêtre de navigateur réaliste qui encadre une capture produit. */
export function BrowserFrame({
  children,
  url = "mecatrack.fr/dashboard",
  className,
}: {
  children: React.ReactNode;
  url?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="flex-1">
          <div className="mx-auto max-w-[240px] rounded-md bg-white px-3 py-1 text-center text-[11px] text-slate-400 ring-1 ring-slate-200">
            {url}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

const badge = {
  attente_validation: { label: "Attente validation", dot: "bg-red-500", cls: "bg-red-50 text-red-700 border-red-200" },
  en_cours: { label: "Réparation en cours", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  pret: { label: "Prêt", dot: "bg-green-600", cls: "bg-green-50 text-green-700 border-green-200" },
  diagnostic: { label: "Diagnostic", dot: "bg-blue-500", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

function DossierLigne({
  nom,
  vehicule,
  immat,
  statut,
  photos,
  devis,
  messages,
}: {
  nom: string;
  vehicule: string;
  immat: string;
  statut: keyof typeof badge;
  photos?: number;
  devis?: boolean;
  messages?: number;
}) {
  const b = badge[statut];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">{nom}</p>
          <p className="truncate text-[11px] text-slate-500">{vehicule}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700">
          {immat}
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${b.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
          {b.label}
        </span>
        <span className="flex items-center gap-2 text-[10px] text-slate-400">
          {photos ? (
            <span className="flex items-center gap-0.5">
              <Camera className="h-3 w-3" />
              {photos}
            </span>
          ) : null}
          {devis ? (
            <span className="flex items-center gap-0.5 font-semibold text-red-600">
              <FileSignature className="h-3 w-3" />1
            </span>
          ) : null}
          {messages ? (
            <span className="flex items-center gap-0.5 font-semibold text-blue-600">
              <MessageSquare className="h-3 w-3" />
              {messages}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

/* Mini tableau de bord garagiste (liste des dossiers). */
export function DashboardMock() {
  return (
    <div className="bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink">Dossiers</p>
          <p className="text-[11px] text-slate-500">5 véhicules à l&apos;atelier</p>
        </div>
        <span className="rounded-lg bg-accent-500 px-3 py-1.5 text-[11px] font-semibold text-white">
          Nouveau dossier
        </span>
      </div>
      <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 text-[11px] font-medium">
        <span className="flex-1 rounded-md bg-primary-800 py-1 text-center text-white">Actifs</span>
        <span className="flex-1 py-1 text-center text-slate-500">Livrés</span>
        <span className="flex-1 py-1 text-center text-slate-500">Tous</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <DossierLigne nom="Karim Benaïssa" vehicule="Peugeot 308" immat="GD-482-KV" statut="attente_validation" photos={3} devis messages={1} />
        <DossierLigne nom="Marie Deschamps" vehicule="Renault Clio V" immat="FH-256-ZR" statut="en_cours" photos={1} />
        <DossierLigne nom="Antoine Perrot" vehicule="VW Golf 7 GTD" immat="EK-914-TC" statut="pret" photos={2} />
        <DossierLigne nom="Fatou N'Diaye" vehicule="Citroën C3" immat="DW-703-LM" statut="diagnostic" />
      </div>
    </div>
  );
}

/* Cadre téléphone réaliste. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[248px] rounded-[34px] border border-slate-300 bg-slate-900 p-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)]">
      <div className="overflow-hidden rounded-[26px] bg-surface">
        <div className="flex justify-center bg-white pb-1 pt-2">
          <div className="h-1.5 w-16 rounded-full bg-slate-200" />
        </div>
        {children}
      </div>
    </div>
  );
}

/* Page de suivi client (téléphone). */
export function PhoneMock() {
  return (
    <PhoneFrame>
      <div className="border-b border-slate-200 bg-white px-3.5 pb-2.5 pt-1">
        <p className="text-[13px] font-bold text-ink">Garage Lemoine</p>
        <p className="text-[10px] text-slate-500">01 48 22 61 90 · Villetaneuse</p>
      </div>
      <div className="space-y-2.5 p-3">
        <div className="rounded-xl border-2 border-amber-200 bg-white p-3">
          <p className="text-[10px] text-slate-500">
            Suivi de votre Peugeot 308{" "}
            <span className="rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-700">
              GD-482-KV
            </span>
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <p className="text-[12px] font-bold text-ink">Réparation en cours</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-ink">Avancement</p>
          <ol className="mt-2 space-y-1.5">
            {[
              ["Véhicule pris en charge", true],
              ["Diagnostic terminé", true],
              ["Réparation en cours", false],
            ].map(([label, done], i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className={`flex h-3 w-3 items-center justify-center rounded-full ${done ? "bg-green-600" : "border-2 border-amber-400"}`}
                >
                  {done ? <Check className="h-2 w-2 text-white" strokeWidth={4} /> : null}
                </span>
                <span className={`text-[10px] ${done ? "text-slate-500" : "font-semibold text-ink"}`}>
                  {label as string}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-ink">Photos</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {["from-slate-400 to-slate-600", "from-amber-500/60 to-slate-600", "from-primary-400 to-primary-700"].map(
              (g, i) => (
                <div key={i} className={`aspect-square rounded-md bg-gradient-to-br ${g}`} />
              )
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* Moment de signature du devis (client). */
export function SignatureMock() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5">
        <p className="text-[13px] font-semibold text-amber-900">Votre accord est nécessaire</p>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-[12px] leading-relaxed text-slate-600">
          Remplacement des deux disques de frein avant, constatés sous la cote
          minimale au démontage des plaquettes.
        </p>
        <div className="flex items-baseline justify-between rounded-lg border border-slate-200 bg-surface px-3 py-2">
          <span className="text-[11px] text-slate-500">Total TTC</span>
          <span className="font-mono text-[15px] font-bold text-ink">283,80 €</span>
        </div>
        <div className="relative flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-surface">
          <svg viewBox="0 0 160 40" className="h-9 w-40 text-primary-800">
            <path
              d="M8 28 C 20 6, 28 6, 34 22 S 48 34, 56 16 68 8, 76 24 90 30, 100 14 116 8, 124 26 138 30, 152 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute bottom-1.5 right-2.5 font-mono text-[9px] text-slate-400">
            K. Benaïssa
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-[12px] font-semibold text-white">
          <FileSignature className="h-3.5 w-3.5" />
          J&apos;accepte et je signe ce devis
        </div>
        <p className="text-center text-[10px] text-slate-400">
          Signature horodatée, conservée avec le dossier
        </p>
      </div>
    </div>
  );
}

/* Petit bloc "lien envoyé par SMS". */
export function LienMock() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.3)]">
      <div className="flex items-center gap-2.5 rounded-xl bg-surface p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-800">
          <LogoIcone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-ink">SMS · Garage Lemoine</p>
          <p className="truncate text-[11px] text-slate-500">
            Votre Peugeot 308 est bien arrivée. Suivez la réparation :
            mecatrack.fr/suivi/•••
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
        <span className="rounded-md border border-slate-200 px-2 py-1 font-mono">
          Aucune application
        </span>
        <Check className="h-3.5 w-3.5 text-green-600" />
        <span>ouvert en un tap</span>
      </div>
    </div>
  );
}
