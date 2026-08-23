import "server-only";
import QRCode from "qrcode";

/** Génère un QR code (data URL PNG) pour un texte — typiquement un lien de suivi. */
export async function qrDataUrl(texte: string): Promise<string> {
  return QRCode.toDataURL(texte, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
    color: { dark: "#0F172A", light: "#ffffff" },
  });
}
