import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { journaliser, jetonPilotage } from "@/lib/admin";
import { emailPersonnalise } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Garage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Message libre envoyé à un garage précis depuis /pilotage. Toujours un clic
 * manuel — jamais déclenché automatiquement.
 */
export async function POST(request: Request) {
  const jeton = jetonPilotage();
  const cookie = cookies().get("fiavo_pilo")?.value;
  if (!jeton || cookie !== jeton) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const { garageId, sujet, message } = (await request.json().catch(() => ({}))) as {
    garageId?: string;
    sujet?: string;
    message?: string;
  };
  if (!garageId || !sujet?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "champs manquants" }, { status: 400 });
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

  await emailPersonnalise(garage, sujet.trim(), message.trim());
  await journaliser({
    niveau: "info",
    type: "message",
    message: `Message envoyé : ${sujet.trim()}`,
    garage: garage.email,
  });

  return NextResponse.json({ ok: true });
}
