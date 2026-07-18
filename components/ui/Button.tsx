"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-800 text-white hover:bg-primary-700 active:bg-primary-900 shadow-sm",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm",
  secondary:
    "bg-white text-ink border border-slate-300 hover:bg-slate-50 active:bg-slate-100 shadow-sm",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:bg-red-100",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading, className, children, disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
          "disabled:pointer-events-none disabled:opacity-55",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
