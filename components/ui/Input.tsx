"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] text-ink placeholder:text-slate-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-slate-50 disabled:text-slate-500";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(base, "min-h-[96px] py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
});

export function Champ({
  label,
  htmlFor,
  obligatoire,
  erreur,
  aide,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  obligatoire?: boolean;
  erreur?: string;
  aide?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {obligatoire && <span className="ml-0.5 text-accent-500">*</span>}
      </label>
      {children}
      {erreur ? (
        <p className="text-sm text-red-600">{erreur}</p>
      ) : aide ? (
        <p className="text-sm text-slate-500">{aide}</p>
      ) : null}
    </div>
  );
}
