"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, Trash2, DollarSign, TrendingUp, MessageSquare, Info, AlertCircle } from "lucide-react";

const mockNotifications = [
  { id: "1", title: "Deposit Approved", body: "Your deposit of $5,000 USDT has been approved and credited to your wallet.", type: "deposit", isRead: false, date: "2026-07-25T10:30:00" },
  { id: "2", title: "Profit Added", body: "$250 USDT profit has been added to your Growth Plan investment.", type: "profit", isRead: false, date: "2026-07-24T14:00:00" },
  { id: "3", title: "New Signal Posted", body: "New BTC/USDT trading signal is now available. Check it out!", type: "signal", isRead: false, date: "2026-07-24T09:15:00" },
  { id: "4", title: "Withdrawal Sent", body: "Your withdrawal of $1,000 USDT has been sent. Tx: 0xaaaa...bbbb", type: "withdrawal", isRead: true, date: "2026-07-23T16:45:00" },
  { id: "5", title: "Support Reply", body: "Your support ticket 'Withdrawal not processed' has received a reply.", type: "support", isRead: true, date: "2026-07-22T11:00:00" },
  { id: "6", title: "Investment Update", body: "Your Professional Plan investment has reached 50% of its duration.", type: "investment", isRead: true, date: "2026-07-20T08:00:00" },
  { id: "7", title: "System Announcement", body: "Scheduled maintenance on July 30 from 02:00 to 06:00 UTC.", type: "system", isRead: true, date: "2026-07-19T12:00:00" },
];

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  deposit: { icon: DollarSign, color: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10" },
  withdrawal: { icon: DollarSign, color: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10" },
  profit: { icon: TrendingUp, color: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10" },
  signal: { icon: TrendingUp, color: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10" },
  support: { icon: MessageSquare, color: "text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-500/10" },
  investment: { icon: TrendingUp, color: "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10" },
  system: { icon: Info, color: "text-surface-600 bg-surface-100 dark:text-surface-400 dark:bg-surface-800" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.isRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));

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
          <Button variant="outline" size="sm" onClick={markAllRead}>
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
          const config = typeConfig[notification.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <Card
              key={notification.id}
              className={cn("cursor-pointer transition-colors", !notification.isRead && "border-brand-200 bg-brand-50/30 dark:border-brand-800 dark:bg-brand-500/5")}
              onClick={() => markRead(notification.id)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !notification.isRead ? "text-surface-900 dark:text-white" : "text-surface-700 dark:text-surface-300")}>
                      {notification.title}
                    </p>
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                  </div>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{notification.body}</p>
                  <p className="mt-2 text-xs text-surface-400">{new Date(notification.date).toLocaleString()}</p>
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
