import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { journaliser, jetonPilotage } from "@/lib/admin";
import { baseUrl } from "@/lib/config";
import { emailRelanceDossier } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Garage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Envoi manuel du rappel « créez votre premier dossier » à un garage précis.
 * Jamais automatique : ne part que sur ce clic depuis /pilotage.
 */
export async function POST(request: Request) {
  const jeton = jetonPilotage();
  const cookie = cookies().get("fiavo_pilo")?.value;
  if (!jeton || cookie !== jeton) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const { garageId } = (await request.json().catch(() => ({}))) as {
    garageId?: string;
  };
  if (!garageId) {
    return NextResponse.json({ error: "garageId manquant" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("garages")
    .select("*")
    .eq("id", garageId)
    .maybeSingle();
  const garage = data as Garage | null;
  if (!garage || !garage.email) {
    return NextResponse.json({ error: "garage introuvable" }, { status: 404 });
  }

  await emailRelanceDossier(garage, `${baseUrl()}/dashboard`);
  await admin
    .from("garages")
    .update({ relance_dossier_envoyee: true })
    .eq("id", garageId);
  await journaliser({
    niveau: "info",
    type: "relance",
    message: "Rappel envoyé : créer son premier dossier",
    garage: garage.email,
  });

  return NextResponse.json({ ok: true });
}
