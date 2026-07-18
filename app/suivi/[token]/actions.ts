"use server";

import { revalidatePath } from "next/cache";
import { envoyerMessageClient, repondreDevis } from "@/lib/db";
import { schemaMessage, schemaSignature } from "@/lib/validation";

export interface EtatPublic {
  error?: string;
  ok?: boolean;
}

// Garde-fou simple contre l'abus de la page publique (par token, en mémoire).
const compteurs = new Map<string, { n: number; depuis: number }>();
function tropDeRequetes(token: string): boolean {
  const now = Date.now();
  const c = compteurs.get(token);
  if (!c || now - c.depuis > 60_000) {
    compteurs.set(token, { n: 1, depuis: now });
    return false;
  }
  c.n += 1;
  return c.n > 30;
}

export async function actionSignerDevis(
  token: string,
  _prev: EtatPublic,
  formData: FormData
): Promise<EtatPublic> {
  if (tropDeRequetes(token)) return { error: "Trop de tentatives, réessayez dans une minute." };
  const parsed = schemaSignature.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Signature ou nom manquant.",
    };
  }
  try {
    await repondreDevis(token, parsed.data.devis_id, {
      action: "accepte",
      signature_base64: parsed.data.signature_base64,
      signe_par: parsed.data.signe_par,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Validation impossible." };
  }
  revalidatePath(`/suivi/${token}`);
  return { ok: true };
}

export async function actionRefuserDevis(
  token: string,
  devisId: string
): Promise<EtatPublic> {
  if (tropDeRequetes(token)) return { error: "Trop de tentatives, réessayez dans une minute." };
  try {
    await repondreDevis(token, devisId, { action: "refuse" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Opération impossible." };
  }
  revalidatePath(`/suivi/${token}`);
  return { ok: true };
}

export async function actionMessageClient(
  token: string,
  _prev: EtatPublic,
  formData: FormData
): Promise<EtatPublic> {
  if (tropDeRequetes(token)) return { error: "Trop de messages envoyés, réessayez dans une minute." };
  const parsed = schemaMessage.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Message invalide." };
  }
  try {
    await envoyerMessageClient(token, parsed.data.contenu);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi impossible." };
  }
  revalidatePath(`/suivi/${token}`);
  return { ok: true };
}
