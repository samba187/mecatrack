import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * TEMPORAIRE — diagnostic de la persistance des sessions de démo.
 * /api/diag-demo?cle=ADMIN_PASSWORD
 *
 * Remonte l'erreur Supabase exacte sur une lecture et une écriture de la table
 * demo_sessions : supabase-js renvoie ses erreurs dans la réponse au lieu de
 * lever, donc un souci de table ou de droits est invisible dans les logs.
 * À retirer dès la cause identifiée.
 */
export async function GET(request: NextRequest) {
  const cle = request.nextUrl.searchParams.get("cle");
  if (!process.env.ADMIN_PASSWORD || cle !== process.env.ADMIN_PASSWORD) {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = supabaseAdmin();
  const id = `diag-${Date.now()}`;

  const lecture = await admin
    .from("demo_sessions")
    .select("id, updated_at")
    .limit(3);

  const ecriture = await admin
    .from("demo_sessions")
    .upsert({ id, donnees: { test: true }, updated_at: new Date().toISOString() });

  const relecture = await admin
    .from("demo_sessions")
    .select("donnees")
    .eq("id", id)
    .maybeSingle();

  await admin.from("demo_sessions").delete().eq("id", id);

  const comptage = await admin
    .from("demo_sessions")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    env: {
      urlSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      cleServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      demoForce: process.env.NEXT_PUBLIC_DEMO ?? null,
    },
    lecture: { erreur: lecture.error, lignes: lecture.data?.length ?? null },
    ecriture: { erreur: ecriture.error },
    relecture: {
      erreur: relecture.error,
      relu: relecture.data ? "oui" : "non",
    },
    sessionsEnBase: comptage.count ?? null,
  });
}
