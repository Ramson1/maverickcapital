"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Download, Eye, Ban, Loader2, Shield, ShieldOff, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";
import { useToast } from "@/providers/ToastProvider";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  kyc_status: string;
  account_status: string;
  created_at: string;
  role: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  active: "success",
  suspended: "destructive",
  blocked: "destructive",
  pending_verification: "warning",
};
const kycVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  verified: "success",
  pending: "warning",
  not_submitted: "secondary",
  rejected: "destructive",
};

const AVAILABLE_ROLES = ["user", "admin", "moderator"];

export default function AdminUsersPage() {
  const supabase = createClient();
  const { success: showSuccess, error: showError } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close role menu on outside click
  useEffect(() => {
    if (!roleMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(null);
      }
    };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [roleMenuOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from("mc_profiles")
      .select("id, full_name, email, kyc_status, account_status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin users fetch error:", error.message || error);
      setLoading(false);
      return;
    }
    if (!profiles) {
      setLoading(false);
      return;
    }

    // Fetch all user roles
    const { data: userRoles } = await supabase
      .from("mc_user_roles")
      .select("user_id, mc_roles(name)");

    const roleMap: Record<string, string> = {};
    if (userRoles) {
      userRoles.forEach((ur: any) => {
        roleMap[ur.user_id] = ur.mc_roles?.name || "user";
      });
    }

    const rows: UserRow[] = profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name || "Unnamed",
      email: p.email || "",
      kyc_status: p.kyc_status,
      account_status: p.account_status,
      created_at: p.created_at,
      role: roleMap[p.id] || "user",
    }));

    setUsers(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Ban/Unban user
  const handleBanToggle = async (user: UserRow) => {
    const isBanned = user.account_status === "suspended" || user.account_status === "blocked";
    const newStatus = isBanned ? "active" : "suspended";
    const action = isBanned ? "unban" : "ban";

    setProcessing(user.id);
    const { error } = await supabase
      .from("mc_profiles")
      .update({ account_status: newStatus })
      .eq("id", user.id);

    if (error) {
      showError("Action Failed", `Failed to ${action} user: ${error.message}`);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, account_status: newStatus } : u))
      );
      showSuccess(
        isBanned ? "User Unbanned" : "User Banned",
        isBanned
          ? `${user.full_name} has been unbanned and can access the platform.`
          : `${user.full_name} has been suspended from the platform.`
      );
    }
    setProcessing(null);
  };

  // Change user role
  const handleChangeRole = async (user: UserRow, newRole: string) => {
    setProcessing(user.id);
    setRoleMenuOpen(null);

    try {
      // Get the role_id for the new role
      const { data: roleData, error: roleError } = await supabase
        .from("mc_roles")
        .select("id")
        .eq("name", newRole)
        .single();

      if (roleError || !roleData) {
        showError("Role Change Failed", `Role "${newRole}" not found.`);
        setProcessing(null);
        return;
      }

      // Delete existing role assignment
      await supabase.from("mc_user_roles").delete().eq("user_id", user.id);

      // Insert new role assignment
      const { error: assignError } = await supabase
        .from("mc_user_roles")
        .insert({ user_id: user.id, role_id: roleData.id });

      if (assignError) {
        showError("Role Change Failed", `Failed to assign role: ${assignError.message}`);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        showSuccess("Role Updated", `${user.full_name} is now a ${newRole}.`);
      }
    } catch (err) {
      showError("Role Change Failed", "An unexpected error occurred.");
    }
    setProcessing(null);
  };

  const filtered = users.filter((u) => {
    if (statusFilter !== "all" && u.account_status !== statusFilter) return false;
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.id.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "active", "suspended", "pending_verification"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === s ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">KYC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-surface-500">No users found</td></tr>
                ) : (
                  filtered.map((u) => {
                    const isBanned = u.account_status === "suspended" || u.account_status === "blocked";
                    const isProcessing = processing === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white">{u.full_name}</p>
                            <p className="text-xs text-surface-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant={statusVariant[u.account_status] || "default"}>{u.account_status}</Badge></td>
                        <td className="px-6 py-4"><Badge variant={kycVariant[u.kyc_status] || "secondary"}>{u.kyc_status}</Badge></td>
                        <td className="px-6 py-4">
                          {/* Role dropdown */}
                          <div className="relative" ref={roleMenuOpen === u.id ? roleMenuRef : null}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setRoleMenuOpen(roleMenuOpen === u.id ? null : u.id); }}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-2.5 py-1 text-sm capitalize text-surface-700 transition-colors hover:bg-surface-50 disabled:opacity-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
                            >
                              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                              {u.role}
                              <ChevronDown className="h-3 w-3 text-surface-400" />
                            </button>
                            {roleMenuOpen === u.id && (
                              <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-800">
                                {AVAILABLE_ROLES.map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleChangeRole(u, role)}
                                    className={cn(
                                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm capitalize transition-colors hover:bg-surface-50 dark:hover:bg-surface-700",
                                      u.role === role ? "text-brand-600 dark:text-brand-400 font-medium" : "text-surface-700 dark:text-surface-300"
                                    )}
                                  >
                                    <Shield className="h-3.5 w-3.5" />
                                    {role}
                                    {u.role === role && <span className="ml-auto text-xs text-brand-500">current</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBanToggle(u)}
                              disabled={isProcessing}
                              className={cn(
                                "transition-colors",
                                isBanned
                                  ? "text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10"
                                  : "text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10"
                              )}
                              title={isBanned ? "Unban user" : "Ban user"}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isBanned ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
