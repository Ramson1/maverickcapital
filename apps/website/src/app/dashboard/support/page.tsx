"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive"; icon: typeof Clock }> = {
  open: { label: "Open", variant: "warning", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "destructive", icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = { urgent: "text-danger-600", high: "text-danger-600", medium: "text-warning-600", low: "text-surface-500" };

export default function SupportPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("mc_support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch message counts for each ticket
      const ticketIds = data.map((t) => t.id);
      let messageCounts: Record<string, number> = {};
      if (ticketIds.length > 0) {
        const { data: messages } = await supabase
          .from("mc_support_messages")
          .select("ticket_id")
          .in("ticket_id", ticketIds);
        if (messages) {
          messages.forEach((m) => {
            messageCounts[m.ticket_id] = (messageCounts[m.ticket_id] || 0) + 1;
          });
        }
      }
      setTickets(data.map((t) => ({ ...t, message_count: messageCounts[t.id] || 0 })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmitTicket = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    setSubmitting(true);

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("mc_support_tickets")
        .insert({ user_id: user.id, subject: subject.trim(), status: "open", priority: "medium" })
        .select()
        .single();

      if (ticketError) throw ticketError;

      await supabase.from("mc_support_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        body: message.trim(),
      });

      setSubject("");
      setMessage("");
      setShowNewTicket(false);
      await fetchTickets();
    } catch (err) {
      console.error("Failed to submit ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

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
              <Button onClick={handleSubmitTicket} disabled={submitting || !subject.trim() || !message.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-sm text-surface-500">No support tickets yet</p>
            <p className="mt-1 text-xs text-surface-400">Create a new ticket if you need help</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.open;
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
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>{ticket.message_count} messages</span>
                        <span className={cn("font-medium", priorityColors[ticket.priority])}>{ticket.priority} priority</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
