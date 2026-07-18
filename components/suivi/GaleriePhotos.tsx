"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Photo } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function GaleriePhotos({ photos }: { photos: Photo[] }) {
  const [agrandie, setAgrandie] = useState<Photo | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.legende ?? "Photo de votre véhicule"}
              loading="lazy"
              className="aspect-[4/3] w-full cursor-zoom-in object-cover"
              onClick={() => setAgrandie(photo)}
            />
            {photo.legende && (
              <figcaption className="px-2.5 py-2 text-xs leading-snug text-slate-600">
                {photo.legende}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {agrandie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setAgrandie(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
          <figure className="max-h-full max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agrandie.url}
              alt={agrandie.legende ?? "Photo de votre véhicule"}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/90">
              {agrandie.legende}
              <span className="mt-0.5 block text-xs text-white/50">
                Ajoutée le {formatDateTime(agrandie.created_at)}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
