import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { DeconnexionBouton } from "@/components/dashboard/DeconnexionBouton";
import { NavBureau, NavMobile } from "@/components/dashboard/navigation";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { SupportBubble } from "@/components/dashboard/SupportBubble";
import {
  compteNotificationsNonLues,
  getGarageCourant,
  listNotifications,
} from "@/lib/db";
import { planEffectif } from "@/lib/plans";
import { joursRestants } from "@/lib/utils";
import { DEMO_MODE, estDemo } from "@/lib/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");

  const plan = planEffectif(garage);
  const enEssai = garage.plan === "trial" && plan !== "expired";
  const jours = joursRestants(garage.trial_ends_at);
  const [notifications, nonLues] = await Promise.all([
    listNotifications(garage),
    compteNotificationsNonLues(garage),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/dossiers" aria-label="Accueil Fiavo">
              <Logo />
            </Link>
            <NavBureau />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[160px] truncate text-sm font-medium text-slate-700 lg:block">
              {garage.nom}
            </span>
            <NotificationBell notifications={notifications} nonLues={nonLues} />
            <DeconnexionBouton />
          </div>
        </div>
      </header>

      {estDemo() && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-primary-100 bg-primary-50 px-4 py-2 text-center text-sm text-primary-800">
          <span>
            <strong>Démonstration</strong> — vous explorez un garage fictif.
          </span>
          {!DEMO_MODE && (
            <span className="flex items-center gap-3">
              <Link
                href="/auth/register"
                className="rounded-md bg-primary-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Créer mon compte gratuit
              </Link>
              <Link
                href="/demo/quitter"
                className="text-xs font-medium underline underline-offset-2 hover:text-primary-900"
              >
                Quitter la démo
              </Link>
            </span>
          )}
        </div>
      )}

      {enEssai && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Essai gratuit : <strong>{jours} jour{jours > 1 ? "s" : ""}</strong> restant{jours > 1 ? "s" : ""} avec toutes les fonctionnalités Pro.{" "}
          <Link href="/dashboard/compte" className="font-semibold underline underline-offset-2 hover:text-amber-900">
            Choisir ma formule
          </Link>
        </div>
      )}

      {plan === "expired" && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          Votre essai est terminé. Vos dossiers sont conservés, mais la création est suspendue.{" "}
          <Link href="/dashboard/compte" className="font-semibold underline underline-offset-2 hover:text-red-900">
            Choisir ma formule
          </Link>
        </div>
      )}

      {/* pb-24 sur mobile : laisse la place à la barre d'onglets fixe */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
        {children}
      </main>

      <NavMobile />
      <SupportBubble garageNom={garage.nom} garageEmail={garage.email} />
    </div>
  );
}
