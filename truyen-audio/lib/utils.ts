/**
 * Format a Date to a localized Vietnamese date string.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format duration in seconds to mm:ss string.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Merge CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * VIP plan pricing constants (in VND).
 */
export const VIP_PLANS = {
  WEEK: { label: "Tuần", price: 29000, days: 7 },
  MONTH: { label: "Tháng", price: 79000, days: 30 },
  YEAR: { label: "Năm", price: 599000, days: 365 },
} as const;

export type PlanType = keyof typeof VIP_PLANS;
