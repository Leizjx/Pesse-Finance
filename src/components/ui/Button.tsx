/**
 * Button.tsx — Neumorphic Button Component
 * ----------------------------------------
 * Variants: primary | secondary | ghost | danger
 * Sizes: sm | md | lg
 * States: default → hover (lift) → active (pressed/inset) → disabled
 */

"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--accent)] text-white",
    "shadow-[0_4px_15px_var(--accent-glow),4px_4px_10px_rgba(0,0,0,0.15),-2px_-2px_8px_rgba(255,255,255,0.1)]",
    "hover:shadow-[0_6px_20px_var(--accent-glow),6px_6px_14px_rgba(0,0,0,0.2),-4px_-4px_10px_rgba(255,255,255,0.15)]",
    "hover:-translate-y-0.5",
    "active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.1)]",
    "active:translate-y-0",
  ].join(" "),

  secondary: [
    "bg-[var(--neu-surface)] text-[var(--text-primary)]",
    "shadow-[var(--shadow-flat)]",
    "hover:shadow-[var(--shadow-float)]",
    "hover:-translate-y-0.5",
    "active:shadow-[var(--shadow-pressed)] active:translate-y-0",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--text-secondary)]",
    "hover:bg-[var(--neu-surface)] hover:text-[var(--text-primary)]",
    "hover:shadow-[var(--shadow-flat)]",
  ].join(" "),

  danger: [
    "bg-[var(--expense)] text-white",
    "shadow-[0_4px_15px_rgba(244,63,94,0.3)]",
    "hover:shadow-[0_6px_20px_rgba(244,63,94,0.4)]",
    "hover:-translate-y-0.5",
    "active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.2)] active:translate-y-0",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-10 px-5 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-7 text-base gap-2.5 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-out",
          "cursor-pointer select-none",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          // Full width
          fullWidth && "w-full",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
