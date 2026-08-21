"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_DEMO, DEMO_MODE, APP_URL } from "@/lib/config";
import { DUREE_ESSAI_JOURS } from "@/lib/plans";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { schemaConnexion, schemaInscription } from "@/lib/validation";
import { emailBienvenue } from "@/lib/notifications";
import type { Garage } from "@/lib/types";

export interface EtatAuth {
  error?: string;
  ok?: boolean;
  info?: string;
}

// Quitte une éventuelle session de démonstration lors d'une vraie connexion.
function quitterDemo() {
  try {
    cookies().set(COOKIE_DEMO, "", { path: "/", maxAge: 0 });
  } catch {
    /* pas de contexte cookie : rien à faire */
  }
}

export async function actionConnexion(
  _prev: EtatAuth,
  formData: FormData
): Promise<EtatAuth> {
  if (DEMO_MODE) redirect("/dashboard/dossiers");

  const parsed = schemaConnexion.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return { error: "Email ou mot de passe invalide." };

  const supabase = supabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email ou mot de passe incorrect." };
  quitterDemo();
  redirect("/dashboard/dossiers");
}

export async function actionInscription(
  _prev: EtatAuth,
  formData: FormData
): Promise<EtatAuth> {
  if (DEMO_MODE) redirect("/dashboard/dossiers");

  const parsed = schemaInscription.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Certains champs sont invalides.",
    };
  }
  const { nom_garage, email, password, telephone } = parsed.data;

  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${APP_URL}/auth/login` },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Inscription impossible." };
  }

  const trialEnd = new Date(
    Date.now() + DUREE_ESSAI_JOURS * 86400000
  ).toISOString();
  const admin = supabaseAdmin();
  const { data: garage, error: errGarage } = await admin
    .from("garages")
    .insert({
      user_id: data.user.id,
      nom: nom_garage,
      email,
      telephone,
      plan: "trial",
      trial_ends_at: trialEnd,
    })
    .select()
    .single();
  if (errGarage) return { error: "Erreur lors de la création du compte garage." };

  await emailBienvenue(garage as Garage, `${APP_URL}/dashboard/dossiers/new`);
  quitterDemo();
  redirect("/dashboard/dossiers?bienvenue=1");
}

export async function actionMotDePasseOublie(
  _prev: EtatAuth,
  formData: FormData
): Promise<EtatAuth> {
  if (DEMO_MODE) {
    return { info: "Mode démo : la réinitialisation est désactivée." };
  }
  const email = (formData.get("email") as string | null)?.trim();
  if (!email) return { error: "Saisissez votre email." };
  const supabase = supabaseServer();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/auth/reset-password`,
  });
  return {
    ok: true,
    info: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function actionNouveauMotDePasse(
  _prev: EtatAuth,
  formData: FormData
): Promise<EtatAuth> {
  if (DEMO_MODE) redirect("/dashboard/dossiers");
  const password = formData.get("password") as string | null;
  if (!password || password.length < 8) {
    return { error: "8 caractères minimum." };
  }
  const supabase = supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Lien expiré. Refaites une demande de réinitialisation." };
  redirect("/dashboard/dossiers");
}

export async function actionDeconnexion(): Promise<void> {
  if (!DEMO_MODE) {
    const supabase = supabaseServer();
    await supabase.auth.signOut();
  }
  redirect("/");
}
