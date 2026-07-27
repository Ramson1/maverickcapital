import { ShieldX } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function SuspendedScreen() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="mx-4 max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
          <ShieldX className="h-10 w-10 text-danger-600 dark:text-danger-400" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-surface-900 dark:text-white">
          Account Suspended
        </h1>
        <p className="mb-6 text-surface-600 dark:text-surface-400">
          Your account has been suspended. You are no longer able to access the platform. 
          If you believe this is a mistake, please contact support.
        </p>
        <button
          onClick={signOut}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
