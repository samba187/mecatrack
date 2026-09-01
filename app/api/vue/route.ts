import { NextResponse } from "next/server";
import { estDemo } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Compte une visite du site (appelé par un beacon client sur la landing). */
export async function POST() {
  if (estDemo()) return NextResponse.json({ ok: true });
  try {
    const admin = supabaseAdmin();
    const jour = new Date().toISOString().slice(0, 10);
    const { data } = await admin
      .from("visites")
      .select("vues")
      .eq("jour", jour)
      .maybeSingle();
    const vues = (((data?.vues as number | undefined) ?? 0) + 1);
    await admin.from("visites").upsert({ jour, vues }, { onConflict: "jour" });
  } catch {
    // best-effort : une visite non comptée ne doit rien casser
  }
  return NextResponse.json({ ok: true });
}
