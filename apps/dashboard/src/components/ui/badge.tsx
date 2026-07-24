import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
        secondary: "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
        success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500",
        destructive: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500",
        warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
        outline: "border border-surface-200 text-surface-700 dark:border-surface-700 dark:text-surface-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
