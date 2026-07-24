import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USDT",
  decimals: number = 2
): string {
  if (currency === "USDT") {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function shortenAddress(address: string, chars: number = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10",
    confirming: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-400/10",
    approved: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
    completed: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
    active: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
    rejected: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
    cancelled: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
    processing: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-400/10",
    sent: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-400/10",
    paused: "text-surface-500 bg-surface-100 dark:text-surface-400 dark:bg-surface-400/10",
    suspended: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
    blocked: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10",
  };
  return colors[status.toLowerCase()] || colors.pending;
}
