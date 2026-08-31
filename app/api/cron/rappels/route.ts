import { NextResponse } from "next/server";
import { journaliser } from "@/lib/admin";
import { APP_URL } from "@/lib/config";
import { emailFinEssai } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Garage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const JOUR = 86400000;

/**
 * Rappels automatiques de fin d'essai (Vercel Cron, 1x/jour).
 * Envoie un email de rappel à J-3, J-1 et le jour de l'expiration, une seule
 * fois par palier (mémorisé dans garages.rappels_essai).
 */
export async function GET(request: Request) {
  // Vercel envoie automatiquement « Authorization: Bearer <CRON_SECRET> » si la
  // variable est définie. Si elle l'est, on l'exige ; sinon on laisse tourner.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }
  }

  const admin = supabaseAdmin();
  const now = Date.now();

  const { data } = await admin
    .from("garages")
    .select("*")
    .eq("plan", "trial")
    .not("trial_ends_at", "is", null);
  const garages = (data ?? []) as (Garage & { rappels_essai?: string | null })[];

  let envoyes = 0;
  for (const g of garages) {
    if (!g.email || !g.trial_ends_at) continue;
    const joursRestants = Math.ceil(
      (new Date(g.trial_ends_at).getTime() - now) / JOUR
    );

    // Paliers : J-3, J-1, et le jour de l'expiration (0 / -1 seulement, pour ne
    // pas relancer les essais expirés depuis longtemps).
    let palier: number | undefined;
    if (joursRestants === 3) palier = 3;
    else if (joursRestants === 1) palier = 1;
    else if (joursRestants <= 0 && joursRestants >= -1) palier = 0;
    if (palier === undefined) continue;

    const dejaEnvoyes = (g.rappels_essai ?? "").split(",").filter(Boolean);
    if (dejaEnvoyes.includes(String(palier))) continue;

    await emailFinEssai(
      g,
      Math.max(0, joursRestants),
      `${APP_URL}/dashboard/compte`
    );
    await admin
      .from("garages")
      .update({ rappels_essai: [...dejaEnvoyes, String(palier)].join(",") })
      .eq("id", g.id);
    await journaliser({
      niveau: "info",
      type: "rappel",
      message:
        palier === 0
          ? "Rappel envoyé : essai terminé"
          : `Rappel envoyé : J-${palier} avant fin d'essai`,
      garage: g.email,
    });
    envoyes++;
  }

  return NextResponse.json({
    ok: true,
    essaisVerifies: garages.length,
    rappelsEnvoyes: envoyes,
  });
}
