import { estDemo, lienSuivi, SUPPORT_EMAIL } from "./config";
import type { Devis, Dossier, Garage, Statut } from "./types";

function echapperHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * SMS (Twilio) et emails (Resend). Si les clés ne sont pas configurées,
 * les envois sont simplement journalisés — l'application reste fonctionnelle.
 */

/**
 * Nom d'expéditeur affiché sur le téléphone du client. Contrainte commune aux
 * opérateurs : 11 caractères alphanumériques maximum, sans accent ni symbole.
 */
function expediteurSms(): string {
  const brut = process.env.SMS_SENDER_ID ?? "Fiavo";
  const propre = brut
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 11);
  return propre || "Fiavo";
}

/** Envoi via Brevo (API HTTP simple, tarif France plus bas que Twilio). */
async function envoyerSmsBrevo(
  cle: string,
  destinataire: string,
  corps: string
): Promise<boolean> {
  const reponse = await fetch("https://api.brevo.com/v3/transactionalSMS/send", {
    method: "POST",
    headers: {
      "api-key": cle,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: expediteurSms(),
      recipient: destinataire,
      content: corps,
      type: "transactional",
    }),
  });
  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    throw new Error(`Brevo ${reponse.status} ${detail.slice(0, 200)}`);
  }
  return true;
}

/** Envoi via Twilio (repli si Brevo n'est pas configuré). */
async function envoyerSmsTwilio(
  sid: string,
  token: string,
  from: string,
  destinataire: string,
  corps: string
): Promise<boolean> {
  const twilio = (await import("twilio")).default;
  await twilio(sid, token).messages.create({
    to: destinataire,
    from,
    body: corps,
  });
  return true;
}

/**
 * Envoie un SMS via le fournisseur configuré (Brevo en priorité, sinon
 * Twilio). Renvoie true si le message est bien parti (ou simulé en l'absence
 * de clés) — false en cas d'échec, pour ne pas décompter du quota du garage
 * un SMS qui n'a jamais été délivré.
 */
export async function envoyerSms(
  vers: string,
  corps: string
): Promise<boolean> {
  const destinataire = normaliserTel(vers);

  // Jamais d'envoi réel depuis une session de démonstration : la démo est
  // publique, un visiteur pourrait sinon faire partir des SMS à nos frais.
  if (estDemo()) {
    console.log(`[SMS démo — non envoyé] → ${destinataire} : ${corps}`);
    return true;
  }

  const brevo = process.env.BREVO_API_KEY;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from =
    process.env.TWILIO_SENDER_ID ??
    process.env.TWILIO_PHONE_NUMBER ??
    expediteurSms();

  try {
    if (brevo) {
      return await envoyerSmsBrevo(brevo, destinataire, corps);
    }
    if (sid && token) {
      return await envoyerSmsTwilio(sid, token, from, destinataire, corps);
    }
  } catch (e) {
    console.error("Échec envoi SMS", e);
    return false;
  }

  console.log(`[SMS simulé] → ${destinataire} : ${corps}`);
  return true;
}

export async function envoyerEmail(
  vers: string,
  sujet: string,
  html: string
): Promise<void> {
  // Comme pour les SMS : aucune sortie réelle depuis la démo publique.
  if (estDemo()) {
    console.log(`[Email démo — non envoyé] → ${vers} : ${sujet}`);
    return;
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[Email simulé] → ${vers} : ${sujet}`);
    return;
  }
  try {
    const { Resend } = await import("resend");
    await new Resend(key).emails.send({
      from: process.env.EMAIL_FROM ?? "Fiavo <notifications@fiavo.fr>",
      to: vers,
      subject: sujet,
      html,
    });
  } catch (e) {
    console.error("Échec envoi email", e);
  }
}

/**
 * Met un numéro au format international E.164 attendu par les opérateurs.
 * Tolère les saisies courantes : 06 12 34 56 78, 0033…, +33 06… (indicatif
 * suivi du 0 initial, erreur fréquente), 33612345678.
 */
export function normaliserTel(tel: string): string {
  let clean = tel.replace(/[\s.\-()]/g, "");
  if (clean.startsWith("00")) clean = `+${clean.slice(2)}`;
  if (clean.startsWith("+")) {
    // +330612345678 → +33612345678 (le 0 national est en trop)
    const m = clean.match(/^\+330(\d{9})$/);
    return m ? `+33${m[1]}` : clean;
  }
  if (clean.startsWith("0")) return `+33${clean.slice(1)}`;
  // 33612345678 ou 330612345678 saisis sans le +
  const m = clean.match(/^33(0?)(\d{9})$/);
  if (m) return `+33${m[2]}`;
  return clean;
}

// ── SMS client selon l'événement ────────────────────────────────────────────

export async function smsCreationDossier(
  garage: Garage,
  dossier: Dossier
): Promise<boolean> {
  if (!dossier.client_telephone) return false;
  return envoyerSms(
    dossier.client_telephone,
    `Bonjour ${dossier.client_nom}, votre ${dossier.vehicule_marque} ${dossier.vehicule_modele} est bien arrivé au garage ${garage.nom}. Suivez l'avancement ici : ${lienSuivi(dossier.token_public)}`
  );
}

export async function smsChangementStatut(
  garage: Garage,
  dossier: Dossier,
  statut: Statut
): Promise<boolean> {
  if (!dossier.client_telephone) return false;
  const lien = lienSuivi(dossier.token_public);
  const vehicule = `${dossier.vehicule_marque} ${dossier.vehicule_modele}`;
  const corps: Partial<Record<Statut, string>> = {
    diagnostic: `${garage.nom} : le diagnostic de votre ${vehicule} est en cours. Suivi : ${lien}`,
    en_cours: `${garage.nom} : la réparation de votre ${vehicule} a commencé. Suivi : ${lien}`,
    en_attente_validation: `${garage.nom} : une intervention supplémentaire nécessite votre accord pour votre ${vehicule}. Validez ou refusez ici : ${lien}`,
    pret: `Bonne nouvelle ! Votre ${vehicule} est prête. Vous pouvez venir la récupérer chez ${garage.nom}. Détails : ${lien}`,
    livre: garage.lien_avis
      ? `Merci d'avoir choisi ${garage.nom} pour votre ${vehicule} ! Votre avis nous aide beaucoup : ${garage.lien_avis}`
      : `Merci d'avoir choisi ${garage.nom} pour votre ${vehicule} ! À bientôt.`,
  };
  const message = corps[statut];
  if (!message) return false;
  return envoyerSms(dossier.client_telephone, message);
}

export async function smsNouveauDevis(
  garage: Garage,
  dossier: Dossier
): Promise<boolean> {
  if (!dossier.client_telephone) return false;
  return envoyerSms(
    dossier.client_telephone,
    `${garage.nom} : un devis pour des travaux supplémentaires sur votre ${dossier.vehicule_marque} ${dossier.vehicule_modele} attend votre validation : ${lienSuivi(dossier.token_public)}`
  );
}

// ── Envoi d'un devis / d'une facture au client ──────────────────────────────

export async function smsDocument(
  garage: Garage,
  dossier: Dossier,
  devis: Devis,
  lien: string
): Promise<boolean> {
  if (!dossier.client_telephone) return false;
  const facture = Boolean(devis.facture_numero);
  const quoi = facture
    ? `votre facture ${devis.facture_numero}`
    : `votre devis ${devis.numero}`;
  return envoyerSms(
    dossier.client_telephone,
    `${garage.nom} : ${quoi} pour votre ${dossier.vehicule_marque} ${dossier.vehicule_modele} est disponible ici : ${lien}`
  );
}

export async function emailDocument(
  garage: Garage,
  dossier: Dossier,
  devis: Devis,
  lien: string
) {
  if (!dossier.client_email) return;
  const facture = Boolean(devis.facture_numero);
  const titre = facture
    ? `Facture ${devis.facture_numero}`
    : `Devis ${devis.numero}`;
  await envoyerEmail(
    dossier.client_email,
    `${titre} — ${garage.nom}`,
    gabarit(
      `${titre} pour votre ${dossier.vehicule_marque}`,
      `<p>Bonjour ${dossier.client_nom},</p>
       <p>${garage.nom} vous transmet ${facture ? "votre facture" : "votre devis"} d'un montant de <strong>${devis.montant_ttc.toFixed(2).replace(".", ",")} &euro; TTC</strong> pour votre ${dossier.vehicule_marque} ${dossier.vehicule_modele} (${dossier.vehicule_immat}).</p>
       <p>Vous pouvez le consulter, l'imprimer ou l'enregistrer en PDF depuis le lien ci-dessous.</p>`,
      { label: facture ? "Voir ma facture" : "Voir mon devis", url: lien }
    )
  );
}

// ── SMS vers le garage (le patron doit savoir tout de suite) ────────────────

export async function smsGarageDevisRepondu(
  garage: Garage,
  dossier: Dossier,
  devis: Devis
) {
  if (!garage.telephone) return;
  const verdict = devis.statut === "accepte" ? "ACCEPTÉ et signé" : "REFUSÉ";
  await envoyerSms(
    garage.telephone,
    `Fiavo : ${dossier.client_nom} a ${verdict} le devis ${devis.numero} (${devis.montant_ttc.toFixed(2).replace(".", ",")} € TTC) pour la ${dossier.vehicule_marque} ${dossier.vehicule_immat}.`
  );
}

export async function smsGarageMessage(
  garage: Garage,
  dossier: Dossier,
  contenu: string
) {
  if (!garage.telephone) return;
  const extrait = contenu.length > 90 ? `${contenu.slice(0, 90)}…` : contenu;
  await envoyerSms(
    garage.telephone,
    `Fiavo : nouveau message de ${dossier.client_nom} (${dossier.vehicule_immat}) : "${extrait}"`
  );
}

// ── Emails garagiste ────────────────────────────────────────────────────────

function gabarit(titre: string, corps: string, cta?: { label: string; url: string }): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:#0F172A">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="font-size:18px;font-weight:bold;color:#1A2338;margin-bottom:24px">Fiavo</div>
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:32px">
      <h1 style="font-size:20px;margin:0 0 16px">${titre}</h1>
      <div style="font-size:15px;line-height:1.6;color:#334155">${corps}</div>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:24px;background:#1A2338;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px">${cta.label}</a>` : ""}
    </div>
    <p style="font-size:12px;color:#94A3B8;margin-top:24px">Fiavo — Suivi de r&eacute;paration pour garages ind&eacute;pendants</p>
  </div>
</body></html>`;
}

export async function emailSupport(
  garage: Garage,
  sujet: string,
  message: string
) {
  await envoyerEmail(
    SUPPORT_EMAIL,
    `[Support Fiavo] ${sujet || "Nouveau message"} — ${garage.nom}`,
    gabarit(
      `Message de ${echapperHtml(garage.nom)}`,
      `<p style="margin:0 0 8px"><strong>Garage :</strong> ${echapperHtml(garage.nom)}</p>
       <p style="margin:0 0 8px"><strong>Email :</strong> ${echapperHtml(garage.email ?? "—")}</p>
       <p style="margin:0 0 8px"><strong>Téléphone :</strong> ${echapperHtml(garage.telephone ?? "—")}</p>
       <p style="margin:0 0 16px"><strong>Sujet :</strong> ${echapperHtml(sujet || "—")}</p>
       <p style="white-space:pre-wrap;margin:0">${echapperHtml(message)}</p>`
    )
  );
}

export async function emailNouveauMessage(
  garage: Garage,
  dossier: Dossier,
  contenu: string,
  urlDossier: string
) {
  if (!garage.email) return;
  await envoyerEmail(
    garage.email,
    `Nouveau message de ${dossier.client_nom} (${dossier.vehicule_immat})`,
    gabarit(
      "Nouveau message client",
      `<p><strong>${dossier.client_nom}</strong> — ${dossier.vehicule_marque} ${dossier.vehicule_modele} (${dossier.vehicule_immat}) :</p>
       <blockquote style="margin:16px 0;padding:12px 16px;background:#F1F5F9;border-left:3px solid #1A2338;border-radius:4px">${contenu}</blockquote>`,
      { label: "Répondre dans le dossier", url: urlDossier }
    )
  );
}

export async function emailDevisRepondu(
  garage: Garage,
  dossier: Dossier,
  devis: Devis,
  urlDossier: string
) {
  if (!garage.email) return;
  const accepte = devis.statut === "accepte";
  await envoyerEmail(
    garage.email,
    `Devis ${accepte ? "accepté" : "refusé"} — ${dossier.client_nom} (${dossier.vehicule_immat})`,
    gabarit(
      accepte ? "Devis accepté et signé" : "Devis refusé",
      `<p>${dossier.client_nom} a ${accepte ? `<strong style="color:#16A34A">accepté et signé</strong>` : `<strong style="color:#DC2626">refusé</strong>`} le devis de <strong>${devis.montant_ttc.toFixed(2).replace(".", ",")} &euro; TTC</strong> :</p>
       <p style="color:#64748B">${devis.description}</p>
       ${accepte ? `<p>Signé par <strong>${devis.signe_par}</strong>. La signature et l'horodatage sont conservés dans le dossier.</p>` : ""}`,
      { label: "Voir le dossier", url: urlDossier }
    )
  );
}

export async function emailBienvenue(garage: Garage, urlDashboard: string) {
  if (!garage.email) return;
  await envoyerEmail(
    garage.email,
    "Bienvenue sur Fiavo — votre essai de 14 jours a commencé",
    gabarit(
      `Bienvenue, ${garage.nom}`,
      `<p>Votre essai gratuit de 14 jours vient de commencer, avec toutes les fonctionnalités Pro, sans carte bancaire.</p>
       <p>Pour démarrer : créez votre premier dossier, ajoutez une photo, et envoyez le lien de suivi à votre client. Deux minutes suffisent.</p>`,
      { label: "Créer mon premier dossier", url: urlDashboard }
    )
  );
}

export async function emailFinEssai(
  garage: Garage,
  joursRestants: number,
  urlCompte: string
) {
  if (!garage.email) return;
  const dernier = joursRestants <= 0;
  await envoyerEmail(
    garage.email,
    dernier
      ? "Votre essai Fiavo est terminé"
      : `Plus que ${joursRestants} jours d'essai Fiavo`,
    gabarit(
      dernier ? "Votre essai est terminé" : `Votre essai se termine dans ${joursRestants} jours`,
      `<p>${dernier ? "Votre période d'essai est arrivée à son terme. Vos dossiers sont conservés, mais la création de nouveaux dossiers est suspendue." : "Après l'essai, choisissez la formule qui vous convient pour continuer sans interruption."}</p>
       <p>Atelier à 34 &euro;/mois ou Pro à 59 &euro;/mois, sans engagement, résiliable en un clic.</p>`,
      { label: "Choisir ma formule", url: urlCompte }
    )
  );
}

export async function emailPaiementEchoue(garage: Garage, urlPortail: string) {
  if (!garage.email) return;
  await envoyerEmail(
    garage.email,
    "Échec du paiement de votre abonnement Fiavo",
    gabarit(
      "Échec de paiement",
      `<p>Le prélèvement de votre abonnement Fiavo n'a pas abouti. Merci de mettre à jour votre moyen de paiement pour conserver l'accès à toutes les fonctionnalités.</p>`,
      { label: "Mettre à jour mon paiement", url: urlPortail }
    )
  );
}
