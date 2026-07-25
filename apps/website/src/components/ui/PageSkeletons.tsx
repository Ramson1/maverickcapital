import { Skeleton, SkeletonText, SkeletonStatCard, SkeletonTable, SkeletonAvatar } from "@/components/ui/skeleton";

// ─── Dashboard Main Page ─────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Hard Cap Progress */}
      <div className="rounded-xl border border-surface-200 p-5 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" rounded="lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="mt-4 h-3 w-full" rounded="full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Chart + Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-surface-200 p-6 dark:border-surface-800">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-10" />
              ))}
            </div>
          </div>
          <Skeleton className="h-64 w-full" rounded="lg" />
        </div>

        <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="sm" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-2 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 p-5 dark:border-surface-800">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12" rounded="lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table-based Pages (Deposits, Withdrawals, Transactions, etc.) ───
export function TablePageSkeleton({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          {subtitle && <Skeleton className="h-4 w-56" />}
        </div>
        <Skeleton className="h-10 w-32" rounded="lg" />
      </div>

      <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
        <SkeletonTable rows={6} cols={5} />
      </div>
    </div>
  );
}

// ─── Admin Pages ──────────────────────────────────────────────────────
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts + Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
          <Skeleton className="mb-4 h-5 w-36" />
          <Skeleton className="h-64 w-full" rounded="lg" />
        </div>
        <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
          <Skeleton className="mb-4 h-5 w-36" />
          <SkeletonTable rows={5} cols={3} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <Skeleton className="mb-4 h-5 w-40" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    </div>
  );
}

// ─── Profile / Settings Page ──────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20" rounded="full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blog List Page ───────────────────────────────────────────────────
export function BlogListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto h-4 w-96 max-w-full" />
      </div>

      {/* Featured post */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" rounded="lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-20" rounded="full" />
          <Skeleton className="h-8 w-full" />
          <SkeletonText lines={3} />
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="sm" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Blog cards grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" rounded="lg" />
            <Skeleton className="h-5 w-16" rounded="full" />
            <Skeleton className="h-6 w-full" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blog Detail Page ─────────────────────────────────────────────────
export function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <Skeleton className="h-6 w-20" rounded="full" />
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="sm" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
      <Skeleton className="h-72 w-full" rounded="lg" />
      <SkeletonText lines={12} />
      <Skeleton className="h-48 w-full" rounded="lg" />
      <SkeletonText lines={8} />
    </div>
  );
}

// ─── Market Page ──────────────────────────────────────────────────────
export function MarketSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-72" />
        <Skeleton className="mx-auto h-4 w-96 max-w-full" />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" rounded="full" />
        ))}
      </div>

      {/* Chart area */}
      <Skeleton className="h-96 w-full" rounded="lg" />

      {/* Market table */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <SkeletonTable rows={8} cols={6} />
      </div>
    </div>
  );
}

// ─── Referral Page (User) ─────────────────────────────────────────────
export function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Referral code */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-28" />
        </div>
      </div>

      {/* Referral list */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <Skeleton className="mb-4 h-5 w-36" />
        <SkeletonTable rows={4} cols={4} />
      </div>
    </div>
  );
}

// ─── Auth Pages (Login, Register, etc.) ───────────────────────────────
export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12" rounded="full" />
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
          <Skeleton className="h-11 w-full" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Generic Page Skeleton (for simple pages) ─────────────────────────
export function GenericPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <SkeletonTable rows={6} cols={4} />
      </div>
    </div>
  );
}

// ─── Wallet Page ──────────────────────────────────────────────────────
export function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Balance card */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-4 h-10 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" rounded="lg" />
          <Skeleton className="h-10 w-28" rounded="lg" />
        </div>
      </div>

      {/* Assets list */}
      <div className="rounded-xl border border-surface-200 p-6 dark:border-surface-800">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonAvatar size="sm" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Signals Page ─────────────────────────────────────────────────────
export function SignalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 p-5 dark:border-surface-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" rounded="full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-14" rounded="full" />
            </div>
            <SkeletonText lines={3} />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-8 w-20" rounded="lg" />
              <Skeleton className="h-8 w-20" rounded="lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
