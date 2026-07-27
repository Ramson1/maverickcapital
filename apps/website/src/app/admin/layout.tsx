"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { SuspendedScreen } from "@/components/ui/SuspendedScreen";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    const checkAdmin = async () => {
      const supabase = createClient();

      // Check if user is suspended
      const { data: profile } = await supabase
        .from("mc_profiles")
        .select("account_status")
        .eq("id", user.id)
        .single();

      if (profile?.account_status === "suspended" || profile?.account_status === "blocked") {
        setIsSuspended(true);
        setChecking(false);
        return;
      }

      const { data: isAdminUser } = await supabase
        .rpc("is_admin", { uid: user.id });

      setIsAdmin(!!isAdminUser);
      setChecking(false);

      if (!isAdminUser) {
        router.replace("/dashboard");
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  // Show loading while checking auth or admin status
  if (authLoading || checking) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // User is suspended
  if (isSuspended) {
    return <SuspendedScreen />;
  }

  // Not an admin — don't render children (already redirecting)
  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return <>{children}</>;
}
