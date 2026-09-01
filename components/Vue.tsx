"use client";

import { useEffect } from "react";

/**
 * Beacon de visite : envoie un ping (une fois par session de navigation) pour
 * comptabiliser la visite du site dans le pilotage. Silencieux, non bloquant.
 */
export function Vue() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("fiavo_vue")) return;
      sessionStorage.setItem("fiavo_vue", "1");
    } catch {
      /* sessionStorage indisponible : on ping quand même */
    }
    fetch("/api/vue", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
