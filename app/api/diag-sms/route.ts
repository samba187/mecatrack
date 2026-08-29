import { NextResponse } from "next/server";
import { getGarageCourant, smsCeMois } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * TEMPORAIRE : diagnostique le compteur SMS pour le garage connecté.
 * Indique si la table sms_usage existe et la consommation lue.
 */
export async function GET() {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { error } = await supabaseAdmin()
    .from("sms_usage")
    .select("count")
    .limit(1);

  return NextResponse.json({
    garage: garage.nom,
    tableSmsUsageExiste: !error,
    erreurTable: error?.message ?? null,
    smsConsommesCeMois: await smsCeMois(garage),
    conclusion: error
      ? "La table sms_usage n'existe pas — lancez le script SQL fourni."
      : "Table OK. Le compteur s'incrémentera aux prochains SMS envoyés.",
  });
}
