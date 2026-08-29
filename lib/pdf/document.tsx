import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Devis, Dossier, Garage } from "@/lib/types";
import { formatDate, formatEuros, formatImmat } from "@/lib/utils";

/**
 * Devis / facture en PDF réel, généré à la volée (jamais stocké côté
 * serveur). Rendu identique quel que soit l'appareil, contrairement à une
 * impression HTML dont la mise en page dépend du navigateur.
 */

/**
 * Les formats français utilisent une espace fine insécable (U+202F) comme
 * séparateur de milliers ; absente des polices PDF de base, elle s'affiche
 * en « / ». On la remplace par une espace ordinaire.
 */
function fr(texte: string): string {
  return texte.replace(/[  ]/g, " ");
}

const NAVY = "#1A2338";
const ORANGE = "#F26419";
const GRIS = "#64748B";
const GRIS_CLAIR = "#E2E8F0";

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9,
    color: NAVY,
    fontFamily: "Helvetica",
  },
  // En-tête
  entete: { flexDirection: "row", justifyContent: "space-between" },
  logo: { height: 34, marginBottom: 6, objectFit: "contain" },
  nomGarage: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  coord: { fontSize: 8, color: GRIS, marginTop: 1.5 },
  titreDoc: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    letterSpacing: 1,
  },
  numero: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 3,
  },
  dateDoc: { fontSize: 8, color: GRIS, textAlign: "right", marginTop: 2 },
  badge: {
    marginTop: 5,
    alignSelf: "flex-end",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  separateur: {
    borderBottomWidth: 1,
    borderBottomColor: GRIS_CLAIR,
    marginTop: 12,
    marginBottom: 12,
  },
  // Client / véhicule
  colonnes: { flexDirection: "row", gap: 24 },
  colonne: { flex: 1 },
  etiquette: {
    fontSize: 7,
    color: GRIS,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  fort: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  ligneInfo: { fontSize: 8.5, color: GRIS, marginTop: 1.5 },
  // Tableau
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 4,
  },
  th: { fontSize: 7, color: GRIS, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  tr: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: GRIS_CLAIR,
  },
  cDesignation: { flex: 1 },
  cQte: { width: 40, textAlign: "center" },
  cPu: { width: 70, textAlign: "right" },
  cTotal: { width: 75, textAlign: "right" },
  // Totaux
  totaux: { marginTop: 10, alignItems: "flex-end" },
  ligneTotal: { flexDirection: "row", width: 190, paddingVertical: 2 },
  libelleTotal: { flex: 1, color: GRIS },
  valeurTotal: { width: 85, textAlign: "right" },
  ligneTTC: {
    flexDirection: "row",
    width: 190,
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: 1.5,
    borderTopColor: NAVY,
  },
  libelleTTC: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 11 },
  valeurTTC: {
    width: 85,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  // Pied
  pied: {
    position: "absolute",
    bottom: 36,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: GRIS_CLAIR,
    paddingTop: 10,
  },
  mentions: { flex: 1, paddingRight: 20 },
  mention: { fontSize: 7, color: GRIS, marginBottom: 2, lineHeight: 1.4 },
  cachet: {
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    alignItems: "center",
    maxWidth: 150,
  },
  cachetVille: { fontSize: 6, letterSpacing: 1, fontFamily: "Helvetica-Bold" },
  cachetNom: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginVertical: 1.5,
    textAlign: "center",
  },
  cachetInfo: { fontSize: 6, color: GRIS },
  signature: { height: 34, objectFit: "contain", marginBottom: 3 },
  cachetImage: { height: 52, objectFit: "contain", marginRight: 10 },
});

export function DocumentPdf({
  garage,
  dossier,
  devis,
}: {
  garage: Garage;
  dossier: Dossier;
  devis: Devis;
}) {
  const facture = Boolean(devis.facture_numero);
  const dateDoc = facture
    ? devis.facture_at ?? devis.created_at
    : devis.created_at;
  const signe = devis.statut === "accepte";
  const ville =
    garage.adresse?.split(",").pop()?.trim().replace(/^\d{5}\s*/, "") ?? "";
  const lignes = devis.lignes ?? [];

  return (
    <Document
      title={`${facture ? "Facture" : "Devis"} ${facture ? devis.facture_numero : devis.numero} — ${garage.nom}`}
      author={garage.nom}
    >
      <Page size="A4" style={s.page}>
        {/* ── En-tête ── */}
        <View style={s.entete}>
          <View style={{ flex: 1, paddingRight: 20 }}>
            {garage.logo_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={garage.logo_url} style={s.logo} />
            ) : null}
            <Text style={s.nomGarage}>{garage.nom}</Text>
            {garage.adresse ? (
              <Text style={s.coord}>{garage.adresse}</Text>
            ) : null}
            {garage.telephone ? (
              <Text style={s.coord}>Tél. {garage.telephone}</Text>
            ) : null}
            {garage.email ? <Text style={s.coord}>{garage.email}</Text> : null}
            {garage.siret ? (
              <Text style={s.coord}>SIRET {garage.siret}</Text>
            ) : null}
          </View>
          <View>
            <Text style={s.titreDoc}>{facture ? "FACTURE" : "DEVIS"}</Text>
            <Text style={s.numero}>
              {facture ? devis.facture_numero : devis.numero}
            </Text>
            <Text style={s.dateDoc}>{formatDate(dateDoc)}</Text>
            <Text
              style={[
                s.badge,
                facture
                  ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                  : { backgroundColor: "#F1F5F9", color: GRIS },
              ]}
            >
              {facture
                ? "ACQUITTÉE"
                : devis.type === "initial"
                  ? "DEVIS D'ENTRÉE"
                  : "DEVIS SUPPLÉMENTAIRE"}
            </Text>
          </View>
        </View>

        <View style={s.separateur} />

        {/* ── Client / véhicule ── */}
        <View style={s.colonnes}>
          <View style={s.colonne}>
            <Text style={s.etiquette}>CLIENT</Text>
            <Text style={s.fort}>{dossier.client_nom}</Text>
            {dossier.client_telephone ? (
              <Text style={s.ligneInfo}>{dossier.client_telephone}</Text>
            ) : null}
            {dossier.client_email ? (
              <Text style={s.ligneInfo}>{dossier.client_email}</Text>
            ) : null}
          </View>
          <View style={s.colonne}>
            <Text style={s.etiquette}>VÉHICULE</Text>
            <Text style={s.fort}>
              {dossier.vehicule_marque} {dossier.vehicule_modele}
              {dossier.vehicule_annee ? ` (${dossier.vehicule_annee})` : ""}
            </Text>
            <Text style={s.ligneInfo}>
              {formatImmat(dossier.vehicule_immat)}
            </Text>
            {dossier.kilometrage != null ? (
              <Text style={s.ligneInfo}>
                {fr(dossier.kilometrage.toLocaleString("fr-FR"))} km
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Prestations ── */}
        <View style={{ marginTop: 18 }}>
          <View style={s.thead}>
            <Text style={[s.th, s.cDesignation]}>DÉSIGNATION</Text>
            <Text style={[s.th, s.cQte]}>QTÉ</Text>
            <Text style={[s.th, s.cPu]}>PU HT</Text>
            <Text style={[s.th, s.cTotal]}>TOTAL HT</Text>
          </View>
          {lignes.map((l, i) => (
            <View key={i} style={s.tr} wrap={false}>
              <Text style={s.cDesignation}>{l.designation}</Text>
              <Text style={[s.cQte, { color: GRIS }]}>{l.quantite}</Text>
              <Text style={[s.cPu, { color: GRIS }]}>
                {fr(formatEuros(l.prix_unitaire_ht))}
              </Text>
              <Text style={[s.cTotal, { fontFamily: "Helvetica-Bold" }]}>
                {fr(formatEuros(l.quantite * l.prix_unitaire_ht))}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totaux ── */}
        <View style={s.totaux}>
          <View style={s.ligneTotal}>
            <Text style={s.libelleTotal}>Total HT</Text>
            <Text style={s.valeurTotal}>{fr(formatEuros(devis.montant_ht))}</Text>
          </View>
          <View style={s.ligneTotal}>
            <Text style={s.libelleTotal}>TVA ({devis.tva_pct} %)</Text>
            <Text style={s.valeurTotal}>
              {fr(formatEuros(devis.montant_ttc - devis.montant_ht))}
            </Text>
          </View>
          <View style={s.ligneTTC}>
            <Text style={s.libelleTTC}>Total TTC</Text>
            <Text style={[s.valeurTTC, { color: ORANGE }]}>
              {fr(formatEuros(devis.montant_ttc))}
            </Text>
          </View>
        </View>

        {/* ── Accord signé ── */}
        {signe ? (
          <View
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderColor: GRIS_CLAIR,
              borderRadius: 4,
              padding: 9,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#15803D" }}>
                Bon pour accord — accepté et signé
              </Text>
              <Text style={{ fontSize: 7.5, color: GRIS, marginTop: 2 }}>
                Par {devis.signe_par}
                {devis.signature_at ? `, le ${formatDate(devis.signature_at)}` : ""}
              </Text>
            </View>
            {devis.signature_base64 ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={devis.signature_base64} style={s.signature} />
            ) : null}
          </View>
        ) : null}

        {/* ── Pied de page (ancré en bas) ── */}
        <View style={s.pied} fixed>
          <View style={s.mentions}>
            <Text style={s.mention}>
              {garage.mentions_devis ??
                "Devis valable 30 jours. Les travaux ne débutent qu'après votre validation."}
            </Text>
            {garage.conditions_paiement ? (
              <Text style={s.mention}>{garage.conditions_paiement}</Text>
            ) : null}
            <Text style={s.mention}>Document généré via Fiavo.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            {garage.cachet_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={garage.cachet_url} style={s.cachetImage} />
            ) : null}
            <View style={s.cachet}>
              {ville ? <Text style={s.cachetVille}>{ville.toUpperCase()}</Text> : null}
              <Text style={s.cachetNom}>{garage.nom.toUpperCase()}</Text>
              {garage.siret ? (
                <Text style={s.cachetInfo}>SIRET {garage.siret}</Text>
              ) : null}
              <Text style={s.cachetInfo}>Reçu le {formatDate(dateDoc)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
