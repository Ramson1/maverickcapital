"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: roleData } = await supabase
        .from("mc_user_roles")
        .select("mc_roles(name)")
        .eq("user_id", user.id);

      const roles = (roleData || []).flatMap((r: any) =>
        Array.isArray(r.mc_roles) ? r.mc_roles : [r.mc_roles]
      ).filter(Boolean);

      const hasAdmin = roles.some((r: { name: string }) =>
        ["super_admin", "admin", "moderator"].includes(r.name)
      );

      setIsAdmin(hasAdmin);
      setChecking(false);

      if (!hasAdmin) {
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
