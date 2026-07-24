"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const mockTickets = [
  { id: "1", subject: "Withdrawal not processed", status: "open", priority: "high", created: "2026-07-24", lastMessage: "2026-07-25", messages: 3 },
  { id: "2", subject: "KYC verification status", status: "in-progress", priority: "medium", created: "2026-07-22", lastMessage: "2026-07-24", messages: 5 },
  { id: "3", subject: "Investment plan question", status: "resolved", priority: "low", created: "2026-07-20", lastMessage: "2026-07-21", messages: 2 },
  { id: "4", subject: "Account access issue", status: "closed", priority: "high", created: "2026-07-15", lastMessage: "2026-07-16", messages: 4 },
];

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive"; icon: typeof Clock }> = {
  open: { label: "Open", variant: "warning", icon: AlertCircle },
  "in-progress": { label: "In Progress", variant: "default", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "destructive", icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = { high: "text-danger-600", medium: "text-warning-600", low: "text-surface-500" };

export default function SupportPage() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Support</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Get help with your account</p>
        </div>
        <Button onClick={() => setShowNewTicket(!showNewTicket)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {showNewTicket && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Subject</label>
              <Input placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
              <textarea className="flex min-h-[120px] w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 outline-none transition-all placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-white" placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowNewTicket(false)}>Submit Ticket</Button>
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockTickets.map((ticket) => {
          const status = statusConfig[ticket.status];
          return (
            <Card key={ticket.id} className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800">
                    <MessageSquare className="h-5 w-5 text-surface-600 dark:text-surface-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{ticket.subject}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-surface-500">
                      <span>Created {new Date(ticket.created).toLocaleDateString()}</span>
                      <span>{ticket.messages} messages</span>
                      <span className={cn("font-medium", priorityColors[ticket.priority])}>{ticket.priority} priority</span>
                    </div>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
