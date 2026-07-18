"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { actionMarquerNotifsLues } from "@/app/dashboard/actions";
import type { Notification, NotificationType } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const ICONES: Record<NotificationType, React.ReactNode> = {
  devis_accepte: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  devis_refuse: <XCircle className="h-4 w-4 text-red-500" />,
  message_client: <MessageSquare className="h-4 w-4 text-blue-500" />,
};

export function NotificationBell({
  notifications,
  nonLues,
}: {
  notifications: Notification[];
  nonLues: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const basculer = () => {
    const prochain = !ouvert;
    setOuvert(prochain);
    if (prochain && nonLues > 0) {
      startTransition(() => actionMarquerNotifsLues());
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={basculer}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {nonLues > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-raised">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
          </div>
          <div className="scrollbar-thin max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Aucune notification pour l&apos;instant.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/dashboard/dossiers/${n.dossier_id}`}
                  onClick={() => setOuvert(false)}
                  className={cn(
                    "flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50",
                    !n.lu && "bg-primary-50/40"
                  )}
                >
                  <span className="mt-0.5 shrink-0">{ICONES[n.type]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {n.titre}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {n.corps}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      {formatDateTime(n.created_at)}
                    </span>
                  </span>
                  {!n.lu && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
