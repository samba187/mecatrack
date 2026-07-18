"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

/**
 * Zone de signature tactile/souris. Expose la signature en data-URL PNG via
 * un input caché `signature_base64` pour l'envoi en server action.
 */
export function SignatureCanvas({ nomChamp }: { nomChamp: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dessine = useRef(false);
  const [vide, setVide] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0F172A";
    }
  }, []);

  const position = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const commencer = (e: React.PointerEvent) => {
    e.preventDefault();
    dessine.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = position(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const tracer = (e: React.PointerEvent) => {
    if (!dessine.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = position(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    if (vide) setVide(false);
  };

  const terminer = () => {
    dessine.current = false;
    if (inputRef.current && canvasRef.current && !vide) {
      inputRef.current.value = canvasRef.current.toDataURL("image/png");
    }
    // Capture aussi le tout premier trait
    if (inputRef.current && canvasRef.current) {
      inputRef.current.value = canvasRef.current.toDataURL("image/png");
    }
  };

  const effacer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (inputRef.current) inputRef.current.value = "";
    setVide(true);
  };

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={commencer}
          onPointerMove={tracer}
          onPointerUp={terminer}
          onPointerLeave={terminer}
          className="h-36 w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-slate-300 bg-white"
          aria-label="Zone de signature"
        />
        {vide && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Signez ici avec le doigt ou la souris
          </span>
        )}
        {!vide && (
          <button
            type="button"
            onClick={effacer}
            className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-ink"
          >
            <Eraser className="h-3.5 w-3.5" />
            Effacer
          </button>
        )}
      </div>
      <input ref={inputRef} type="hidden" name={nomChamp} />
    </div>
  );
}
