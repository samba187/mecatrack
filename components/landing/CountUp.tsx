"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  duration = 1400,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const lance = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || lance.current) return;
      lance.current = true;
      const debut = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - debut) / duration);
        // easeOutExpo
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(Math.round(to * e));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("fr-FR")}
    </span>
  );
}
