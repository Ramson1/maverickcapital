"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Edit, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Role {
  id: string;
  name: string;
  description: string | null;
  user_count: number;
}

export default function AdminRolesPage() {
  const supabase = createClient();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: rolesData, error } = await supabase
        .from("mc_roles")
        .select("id, name, description")
        .order("name");

      if (error || !rolesData) {
        setLoading(false);
        return;
      }

      // Fetch user counts per role
      const { data: userRoles } = await supabase
        .from("mc_user_roles")
        .select("role_id");

      const countMap: Record<string, number> = {};
      if (userRoles) {
        userRoles.forEach((ur) => {
          countMap[ur.role_id] = (countMap[ur.role_id] || 0) + 1;
        });
      }

      const mapped: Role[] = rolesData.map((r) => ({
        ...r,
        user_count: countMap[r.id] || 0,
      }));

      setRoles(mapped);
      setLoading(false);
    };

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

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
        {roles.length === 0 ? (
          <p className="col-span-3 py-8 text-center text-sm text-surface-500">No roles found</p>
        ) : (
          roles.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                      <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">{role.name}</p>
                      <p className="text-xs text-surface-500">{role.user_count} users</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400">{role.description || "No description"}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
