"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sélecteur d'image qui redimensionne le fichier côté client puis le stocke
 * en data URL dans un champ caché (name) — soumis avec le formulaire. Pas de
 * bucket ni d'upload distant : fonctionne à l'identique en démo et en réel.
 */
export function ImageUpload({
  name,
  defaultValue,
  format = "png",
  maxSize = 400,
  retirerFond = false,
  className,
  hauteurApercu = "h-20",
}: {
  name: string;
  defaultValue?: string | null;
  /** jpeg = fond blanc (logo) ; png = transparence conservée (cachet/signature). */
  format?: "png" | "jpeg";
  maxSize?: number;
  /** Détoure automatiquement le fond blanc (scan de cachet/signature). */
  retirerFond?: boolean;
  className?: string;
  hauteurApercu?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [chargement, setChargement] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const traiter = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setChargement(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (format === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(img, 0, 0, w, h);
          // Détourage : rend le fond blanc (papier scanné) transparent, en
          // gardant l'encre. Adouci sur les gris clairs pour lisser les bords.
          if (retirerFond && format === "png") {
            const data = ctx.getImageData(0, 0, w, h);
            const d = data.data;
            for (let i = 0; i < d.length; i += 4) {
              const min = Math.min(d[i], d[i + 1], d[i + 2]);
              if (min > 238) {
                d[i + 3] = 0;
              } else if (min > 205) {
                d[i + 3] = Math.round((d[i + 3] * (238 - min)) / 33);
              }
            }
            ctx.putImageData(data, 0, 0);
          }
          setValue(
            canvas.toDataURL(
              format === "jpeg" ? "image/jpeg" : "image/png",
              0.85
            )
          );
        }
        setChargement(false);
      };
      img.onerror = () => setChargement(false);
      img.src = reader.result as string;
    };
    reader.onerror = () => setChargement(false);
    reader.readAsDataURL(file);
  };

  const vider = () => {
    setValue("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) traiter(f);
        }}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Aperçu"
              className={cn("w-auto max-w-[160px] object-contain", hauteurApercu)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={vider}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" /> Retirer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-700"
        >
          {chargement ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Traitement…
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" /> Choisir une image
            </>
          )}
        </button>
      )}
    </div>
  );
}
