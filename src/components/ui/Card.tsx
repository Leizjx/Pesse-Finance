/**
 * Card.tsx — Neumorphic Card Component
 * -------------------------------------
 * Variants: flat | float | pressed | glass
 * Fully composable: Card, CardHeader, CardTitle, CardContent, CardFooter
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "flat" | "float" | "pressed" | "glass";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  flat: "bg-[var(--neu-surface)] shadow-[var(--shadow-flat)] rounded-[var(--radius-lg)]",
  float: "bg-[var(--neu-surface)] shadow-[var(--shadow-float)] rounded-[var(--radius-lg)]",
  pressed: "bg-[var(--neu-bg)] shadow-[var(--shadow-pressed)] rounded-[var(--radius-lg)]",
  glass: [
    "rounded-[var(--radius-lg)]",
    "bg-white/60 dark:bg-white/5",
    "backdrop-blur-xl",
    "border border-white/40 dark:border-white/10",
    "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
  ].join(" "),
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "flat", noPadding = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-200",
        variantStyles[variant],
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

// ── Sub-components ──────────────────────────────────────────

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-base font-semibold text-[var(--text-primary)] tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center mt-4 pt-4 border-t border-[var(--neu-border)]",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
