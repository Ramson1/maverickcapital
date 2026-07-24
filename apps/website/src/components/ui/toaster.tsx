"use client";

import { useToast } from "@/providers/ToastProvider";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10",
  error: "border-danger-200 bg-danger-50 dark:border-danger-500/30 dark:bg-danger-500/10",
  warning: "border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10",
  info: "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10",
};

const iconStyles = {
  success: "text-success-600 dark:text-success-400",
  error: "text-danger-600 dark:text-danger-400",
  warning: "text-warning-600 dark:text-warning-400",
  info: "text-brand-600 dark:text-brand-400",
};

const titleStyles = {
  success: "text-success-800 dark:text-success-300",
  error: "text-danger-800 dark:text-danger-300",
  warning: "text-warning-800 dark:text-warning-300",
  info: "text-brand-800 dark:text-brand-300",
};

const descStyles = {
  success: "text-success-700 dark:text-success-400",
  error: "text-danger-700 dark:text-danger-400",
  warning: "text-warning-700 dark:text-warning-400",
  info: "text-brand-700 dark:text-brand-400",
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm animate-[slideIn_0.3s_ease-out] ${styles[toast.type]}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${titleStyles[toast.type]}`}>{toast.title}</p>
              {toast.description && (
                <p className={`mt-1 text-xs ${descStyles[toast.type]}`}>{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
