"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Filter, Download, MoreVertical, Eye, Edit, Ban, CheckCircle } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", kyc: "verified", role: "user", investments: 3, totalInvested: 25000, joined: "2026-01-15" },
  { id: "2", name: "Sarah Smith", email: "sarah@example.com", status: "active", kyc: "verified", role: "user", investments: 1, totalInvested: 5000, joined: "2026-03-22" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", status: "active", kyc: "pending", role: "user", investments: 2, totalInvested: 15000, joined: "2026-05-10" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", status: "suspended", kyc: "verified", role: "user", investments: 0, totalInvested: 0, joined: "2026-06-01" },
  { id: "5", name: "Alex Brown", email: "alex@example.com", status: "active", kyc: "not_submitted", role: "user", investments: 1, totalInvested: 10000, joined: "2026-07-01" },
  { id: "6", name: "Admin User", email: "admin@maverick.com", status: "active", kyc: "verified", role: "admin", investments: 0, totalInvested: 0, joined: "2025-12-01" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "default"> = { active: "success", suspended: "destructive", blocked: "destructive", pending: "warning" };
const kycVariant: Record<string, "success" | "warning" | "secondary"> = { verified: "success", pending: "warning", not_submitted: "secondary" };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockUsers.filter((u) => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{mockUsers.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button>Create User</Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "active", "suspended"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === s ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
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
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-surface-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[user.status]}>{user.status}</Badge></td>
                    <td className="px-6 py-4"><Badge variant={kycVariant[user.kyc]}>{user.kyc}</Badge></td>
                    <td className="px-6 py-4"><span className="capitalize text-sm text-surface-600 dark:text-surface-400">{user.role}</span></td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{user.investments}</td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(user.joined).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-danger-600"><Ban className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
