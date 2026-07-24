"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Edit, Plus } from "lucide-react";

const roles = [
  { id: "1", name: "Super Admin", users: 1, permissions: "All access" },
  { id: "2", name: "Admin", users: 3, permissions: "Manage users, deposits, withdrawals, investments" },
  { id: "3", name: "Moderator", users: 2, permissions: "Manage signals, news, support" },
  { id: "4", name: "Support", users: 5, permissions: "Manage support tickets" },
  { id: "5", name: "Analyst", users: 4, permissions: "Manage signals, investments" },
  { id: "6", name: "User", users: 1247, permissions: "Dashboard access only" },
];

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Role Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage roles and permissions</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Create Role</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white">{role.name}</p>
                    <p className="text-xs text-surface-500">{role.users} users</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400">{role.permissions}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
