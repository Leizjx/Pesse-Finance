/**
 * Input.tsx — Neumorphic Input Component
 * ----------------------------------------
 * Features:
 * - Pressed (inset) shadow by default → feels "embedded" in surface
 * - Focus state: accent ring + slight shadow change
 * - Error state: rose border + error message
 * - Optional label, leftIcon, rightIcon, hint text
 */

"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className={cn("relative flex items-center", fullWidth && "w-full")}>
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              "w-full font-[var(--font-sans)] text-sm text-[var(--text-primary)]",
              "bg-[var(--neu-bg)]",
              "rounded-[var(--radius-sm)]",
              "h-11 px-4",
              // Neumorphic inset shadow
              "shadow-[var(--shadow-inset)]",
              "border border-transparent",
              // Placeholder
              "placeholder:text-[var(--text-muted)]",
              // Transition
              "transition-all duration-200",
              // Focus
              "focus:outline-none focus:border-[var(--accent)]",
              "focus:shadow-[var(--shadow-inset),0_0_0_3px_var(--accent-glow)]",
              // Error
              error && "border-[var(--expense)] focus:shadow-[var(--shadow-inset),0_0_0_3px_rgba(244,63,94,0.2)]",
              // Icon padding
              !!leftIcon && "pl-10",
              !!rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <span className="absolute right-3.5 text-[var(--text-muted)] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-[var(--expense)] flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {error}
          </p>
        )}

        {/* Hint */}
        {!error && hint && (
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
