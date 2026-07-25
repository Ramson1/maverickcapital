"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Download, Eye, Edit, Ban, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface UserRow {
  id: string;
  full_name: string;
  kyc_status: string;
  account_status: string;
  created_at: string;
  role: string;
  investments: number;
  totalInvested: number;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { active: "success", suspended: "destructive", blocked: "destructive", pending_verification: "warning" };
const kycVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = { verified: "success", pending: "warning", not_submitted: "secondary", rejected: "destructive" };

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from("mc_profiles")
        .select("id, full_name, kyc_status, account_status, created_at")
        .order("created_at", { ascending: false });

      if (error || !profiles) {
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

      // Fetch investment counts per user
      const { data: allInvestments } = await supabase
        .from("mc_investments")
        .select("user_id, amount");

      const invCounts: Record<string, { count: number; total: number }> = {};
      if (allInvestments) {
        allInvestments.forEach((inv) => {
          if (!invCounts[inv.user_id]) invCounts[inv.user_id] = { count: 0, total: 0 };
          invCounts[inv.user_id].count++;
          invCounts[inv.user_id].total += Number(inv.amount);
        });
      }

      const rows: UserRow[] = profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name || "Unnamed",
        kyc_status: p.kyc_status,
        account_status: p.account_status,
        created_at: p.created_at,
        role: roleMap[p.id] || "user",
        investments: invCounts[p.id]?.count || 0,
        totalInvested: invCounts[p.id]?.total || 0,
      }));

      setUsers(rows);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (statusFilter !== "all" && u.account_status !== statusFilter) return false;
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.id.toLowerCase().includes(search.toLowerCase())) return false;
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Investments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">No users found</td></tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{u.full_name}</p>
                          <p className="text-sm text-surface-500 font-mono">{u.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[u.account_status] || "default"}>{u.account_status}</Badge></td>
                      <td className="px-6 py-4"><Badge variant={kycVariant[u.kyc_status] || "secondary"}>{u.kyc_status}</Badge></td>
                      <td className="px-6 py-4"><span className="capitalize text-sm text-surface-600 dark:text-surface-400">{u.role}</span></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{u.investments}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-danger-600"><Ban className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
