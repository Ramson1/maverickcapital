"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, DollarSign, TrendingUp, MessageSquare, Info, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  deposit_approved: { icon: DollarSign, color: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10" },
  withdrawal_sent: { icon: DollarSign, color: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10" },
  profit_added: { icon: TrendingUp, color: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10" },
  signal_posted: { icon: TrendingUp, color: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10" },
  support_reply: { icon: MessageSquare, color: "text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-500/10" },
  investment_updated: { icon: TrendingUp, color: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10" },
  system_announcement: { icon: Info, color: "text-surface-600 bg-surface-100 dark:text-surface-400 dark:bg-surface-800" },
  subscription_expired: { icon: AlertCircle, color: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10" },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("mc_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.is_read);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("mc_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("mc_notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", filter === f ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((notification) => {
          const config = typeConfig[notification.type] || typeConfig.system_announcement;
          const Icon = config.icon;
          return (
            <Card
              key={notification.id}
              className={cn("cursor-pointer transition-colors", !notification.is_read && "border-brand-200 bg-brand-50/30 dark:border-brand-800 dark:bg-brand-500/5")}
              onClick={() => markRead(notification.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !notification.is_read ? "text-surface-900 dark:text-white" : "text-surface-700 dark:text-surface-300")}>
                      {notification.title}
                    </p>
                    {!notification.is_read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                  </div>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{notification.body}</p>
                  <p className="mt-2 text-xs text-surface-400">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-sm text-surface-500">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
