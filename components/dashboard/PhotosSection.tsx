"use client";

import { useRef, useState, useTransition } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import {
  actionAjouterPhoto,
  actionMajPhoto,
  actionSupprimerPhoto,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Photo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PhotosSection({
  dossierId,
  photos,
  maxPhotos,
}: {
  dossierId: string;
  photos: Photo[];
  maxPhotos: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [agrandie, setAgrandie] = useState<Photo | null>(null);
  const [aSupprimer, setASupprimer] = useState<Photo | null>(null);
  const [pending, startTransition] = useTransition();

  const complet = photos.length >= maxPhotos;

  const uploader = async (fichiers: FileList | File[]) => {
    setErreur(null);
    const liste = Array.from(fichiers).filter((f) => f.type.startsWith("image/"));
    if (liste.length === 0) return;
    if (photos.length + liste.length > maxPhotos) {
      setErreur(`Limite de ${maxPhotos} photos par dossier.`);
      return;
    }
    setEnvoiEnCours(liste.length);
    try {
      const { default: compresser } = await import("browser-image-compression");
      for (const brut of liste) {
        const compresse = await compresser(brut, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const fd = new FormData();
        fd.set(
          "fichier",
          new File([compresse], brut.name, { type: compresse.type })
        );
        const res = await actionAjouterPhoto(dossierId, fd);
        if (res.error) {
          setErreur(res.error);
          break;
        }
        setEnvoiEnCours((n) => Math.max(0, n - 1));
      }
    } catch {
      setErreur("Échec de l'envoi. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoiEnCours(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const basculerVisibilite = (photo: Photo) => {
    startTransition(async () => {
      await actionMajPhoto(dossierId, photo.id, {
        visible_client: !photo.visible_client,
      });
    });
  };

  const majLegende = (photo: Photo, legende: string) => {
    if ((photo.legende ?? "") === legende.trim()) return;
    startTransition(async () => {
      await actionMajPhoto(dossierId, photo.id, {
        legende: legende.trim() || null,
      });
    });
  };

  const supprimer = () => {
    if (!aSupprimer) return;
    const photo = aSupprimer;
    setASupprimer(null);
    startTransition(async () => {
      await actionSupprimerPhoto(dossierId, photo.id);
    });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!complet) uploader(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploader(e.target.files)}
      />

      {photos.length === 0 && envoiEnCours === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-primary-400 hover:bg-primary-50"
        >
          <Camera className="h-8 w-8 text-slate-400" />
          <span className="font-medium text-slate-700">
            Prendre ou ajouter des photos
          </span>
          <span className="text-sm text-slate-500">
            Elles apparaissent sur la page de suivi du client — la meilleure
            preuve de votre sérieux.
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.legende ?? "Photo du véhicule"}
                className="aspect-[4/3] w-full cursor-zoom-in object-cover"
                onClick={() => setAgrandie(photo)}
              />
              <div className="absolute right-2 top-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => basculerVisibilite(photo)}
                  disabled={pending}
                  title={
                    photo.visible_client
                      ? "Visible par le client — cliquer pour masquer"
                      : "Masquée pour le client — cliquer pour rendre visible"
                  }
                  className={cn(
                    "rounded-md p-1.5 shadow-sm transition-colors",
                    photo.visible_client
                      ? "bg-white/95 text-primary-700 hover:bg-white"
                      : "bg-ink/70 text-white hover:bg-ink/85"
                  )}
                >
                  {photo.visible_client ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setASupprimer(photo)}
                  disabled={pending}
                  title="Supprimer la photo"
                  className="rounded-md bg-white/95 p-1.5 text-red-600 shadow-sm transition-colors hover:bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {!photo.visible_client && (
                <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-2 py-0.5 text-xs font-medium text-white">
                  Masquée
                </span>
              )}
              <figcaption className="border-t border-slate-200 bg-white p-2">
                <input
                  type="text"
                  defaultValue={photo.legende ?? ""}
                  placeholder="Ajouter une légende…"
                  onBlur={(e) => majLegende(photo, e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.target as HTMLInputElement).blur()
                  }
                  className="w-full bg-transparent text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none"
                />
              </figcaption>
            </figure>
          ))}

          {envoiEnCours > 0 && (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              <span className="text-xs text-slate-500">
                Compression et envoi…
              </span>
            </div>
          )}

          {!complet && envoiEnCours === 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm font-medium">Ajouter</span>
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {photos.length}/{maxPhotos} photos · compressées automatiquement
        </p>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      </div>

      {/* Visionneuse */}
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
          <figure className="max-h-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agrandie.url}
              alt={agrandie.legende ?? "Photo du véhicule"}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {agrandie.legende && (
              <figcaption className="mt-3 text-center text-sm text-white/90">
                {agrandie.legende}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      <Modal
        ouvert={aSupprimer !== null}
        onFermer={() => setASupprimer(null)}
        titre="Supprimer cette photo ?"
      >
        <p className="text-sm text-slate-600">
          La photo sera définitivement supprimée du dossier et de la page de
          suivi du client.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setASupprimer(null)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={supprimer}
            className="border-red-300 bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
