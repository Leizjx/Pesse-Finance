/**
 * Badge.tsx — Status/Category Badge Component
 * ---------------------------------------------
 * Used for: transaction type, budget status, category labels
 */

import { cn } from "@/lib/utils";
import type { TransactionCategory } from "@/types/database.types";

type BadgeVariant = "income" | "expense" | "neutral" | "warning" | "accent";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  income: "bg-[var(--income-bg)] text-[var(--income)] border-[var(--income)]/20",
  expense: "bg-[var(--expense-bg)] text-[var(--expense)] border-[var(--expense)]/20",
  neutral: "bg-[var(--neu-surface)] text-[var(--text-secondary)] border-[var(--neu-border)] shadow-[var(--shadow-flat)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20",
  accent: "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

const dotColors: Record<BadgeVariant, string> = {
  income: "bg-[var(--income)]",
  expense: "bg-[var(--expense)]",
  neutral: "bg-[var(--text-muted)]",
  warning: "bg-[var(--warning)]",
  accent: "bg-[var(--accent)]",
};

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "transition-colors duration-150",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

// ── Category Badge helper ──────────────────────────────────

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food: "Ăn uống",
  transport: "Di chuyển",
  entertainment: "Giải trí",
  health: "Sức khỏe",
  education: "Học tập",
  shopping: "Mua sắm",
  utilities: "Tiện ích",
  rent: "Nhà ở",
  salary: "Lương",
  investment: "Đầu tư",
  other: "Khác",
};

interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: TransactionCategory;
  size?: BadgeSize;
}

export function CategoryBadge({ category, size = "md", ...props }: CategoryBadgeProps) {
  return (
    <Badge variant="neutral" size={size} {...props}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
