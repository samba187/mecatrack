"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Révèle son contenu en douceur à l'entrée dans le viewport.
 * L'état visible est piloté en style inline (priorité maximale, indépendant de
 * toute feuille de style) et un filet de sécurité garantit que le contenu
 * s'affiche toujours — jamais de page blanche, même si l'IntersectionObserver
 * ne répond pas.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respecte la préférence système « animations réduites » : contenu direct.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    let fait = false;
    const montre = () => {
      if (!fait) {
        fait = true;
        setVisible(true);
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            montre();
            observer?.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
    } else {
      montre();
    }

    const secours = window.setTimeout(montre, 1200);
    return () => {
      observer?.disconnect();
      window.clearTimeout(secours);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
