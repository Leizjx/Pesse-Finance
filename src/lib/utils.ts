/**
 * utils.ts
 * --------
 * Pure utility functions shared across the Pesse app.
 * No side effects, no imports from app-specific modules.
 */

/**
 * Format a number as Vietnamese Dong currency.
 * Example: 1500000 → "1.500.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string for display.
 * Example: "2024-01-15" → "15 tháng 1, 2024"
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

/**
 * Merge class names conditionally (lightweight cn() without clsx dependency).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Calculate percentage of spent vs limit for budget display.
 * Clamps between 0–100 to avoid invalid CSS values.
 */
export function calcBudgetPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((spent / limit) * 100));
}

/**
 * Get the color class for a budget progress bar based on usage %.
 */
export function getBudgetStatusColor(percent: number): string {
  if (percent >= 90) return "text-red-500";
  if (percent >= 70) return "text-amber-500";
  return "text-green-500";
}
