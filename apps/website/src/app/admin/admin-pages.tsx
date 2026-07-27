"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, TrendingUp, DollarSign, Users, BarChart3, Download, FileText, Clock, Search, Bell, Send, Edit, Trash2, Pin, Image, Eye, MessageSquare, AlertCircle, CheckCircle, Activity, Shield, Settings, Layout, Megaphone, Loader2, ArrowLeft, X, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ═══════════════════════════════════════════════════════════════════════
// Admin Signals Page - With Subscription Management
// ═══════════════════════════════════════════════════════════════════════
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  amount: number;
  payment_method: string | null;
  tx_hash: string | null;
  proof_url: string | null;
  proof_data: string | null;
  network: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export function AdminSignalsPage() {
  const supabase = createClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    const { data, error } = await supabase
      .from("mc_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { console.error("Subscriptions fetch error:", error); setLoading(false); return; }
    if (!data) { setLoading(false); return; }

    // Fetch user info for each subscription
    const enriched = await Promise.all(
      data.map(async (sub) => {
        const { data: profile } = await supabase
          .from("mc_profiles")
          .select("full_name, email")
          .eq("id", sub.user_id)
          .single();
        return {
          ...sub,
          amount: Number(sub.amount) || 0,
          user_name: profile?.full_name || "Unknown User",
          user_email: profile?.email || "",
        };
      })
    );

    setSubscriptions(enriched);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleApprove = async (sub: Subscription) => {
    setProcessing(sub.id);
    const { error } = await supabase
      .from("mc_subscriptions")
      .update({ status: "active", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (!error) {
      setSubscriptions((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "active" } : s));
    }
    setProcessing(null);
  };

  const handleReject = async (sub: Subscription) => {
    setProcessing(sub.id);
    const { error } = await supabase
      .from("mc_subscriptions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (!error) {
      setSubscriptions((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "rejected" } : s));
    }
    setProcessing(null);
  };

  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch = searchQuery === "" || s.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.tx_hash?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending_confirmation: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
    active: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    rejected: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400",
    cancelled: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
    expired: "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500",
  };

  const statusLabels: Record<string, string> = {
    pending_confirmation: "Pending",
    active: "Active",
    rejected: "Rejected",
    cancelled: "Cancelled",
    expired: "Expired",
  };

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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Signals & Subscriptions</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage signal subscriptions and verify payments</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Badge variant="warning">{subscriptions.filter((s) => s.status === "pending_confirmation").length} Pending</Badge>
          <Badge variant="success">{subscriptions.filter((s) => s.status === "active").length} Active</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input placeholder="Search by user name or tx hash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          <option value="all">All Status</option>
          <option value="pending_confirmation">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Proof</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filteredSubs.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-surface-500">No subscriptions found</td></tr>
                ) : (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{sub.user_name}</p>
                          <p className="text-xs text-surface-500">{sub.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 capitalize">{sub.plan_id.replace(/-/g, " ")}</td>
                      <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{formatCurrency(sub.amount)}</td>
                      <td className="px-6 py-4">
                        {sub.tx_hash ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-surface-600 dark:text-surface-400">{sub.tx_hash.slice(0, 10)}...{sub.tx_hash.slice(-6)}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(sub.tx_hash || ""); setCopiedHash(sub.id); setTimeout(() => setCopiedHash(null), 2000); }}
                              className="rounded p-1 transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
                              title="Copy full tx hash"
                            >
                              <Copy className="h-3.5 w-3.5 text-surface-400" />
                            </button>
                          </div>
                        ) : <span className="text-xs text-surface-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        {(sub.proof_data || sub.proof_url) ? (
                          <button
                            onClick={() => setViewingProof(sub.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        ) : <span className="text-xs text-surface-400">No proof</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusColors[sub.status] || statusColors.pending_confirmation)}>
                          {statusLabels[sub.status] || sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {sub.status === "pending_confirmation" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(sub)}
                              disabled={processing === sub.id}
                              className="rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20 disabled:opacity-50"
                            >
                              {processing === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 inline h-3 w-3" />Approve</>}
                            </button>
                            <button
                              onClick={() => handleReject(sub)}
                              disabled={processing === sub.id}
                              className="rounded-lg bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700 hover:bg-danger-100 dark:bg-danger-500/10 dark:text-danger-400 dark:hover:bg-danger-500/20 disabled:opacity-50"
                            >
                              {processing === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="mr-1 inline h-3 w-3" />Reject</>}
                            </button>
                          </div>
                        ) : <span className="text-xs text-surface-400">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Proof Modal */}
      {viewingProof && (() => {
        const sub = subscriptions.find((s) => s.id === viewingProof);
        if (!sub) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewingProof(null)}>
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Proof of Payment</h3>
                  <p className="text-sm text-surface-500">{sub.user_name} &middot; {formatCurrency(sub.amount)}</p>
                </div>
                <button onClick={() => setViewingProof(null)} className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
                <img src={sub.proof_data || sub.proof_url || ""} alt="Proof of payment" className="w-full" />
              </div>
              {sub.tx_hash && (
                <div className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-900">
                  <p className="text-xs font-medium text-surface-500">Transaction Hash</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="flex-1 break-all font-mono text-sm text-surface-900 dark:text-white">{sub.tx_hash}</p>
                    <button onClick={() => navigator.clipboard.writeText(sub.tx_hash || "")} className="shrink-0 rounded p-1.5 hover:bg-surface-200 dark:hover:bg-surface-700">
                      <Copy className="h-4 w-4 text-surface-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Admin News Page (placeholder - no dummy data)
export function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">News Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Create and manage news articles</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Create Article</Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">News management interface - Create articles with rich text editor, categories, and scheduling</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Admin Support Page - Full Supabase Integration
// ═══════════════════════════════════════════════════════════════════════
interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  last_message?: string;
  last_message_time?: string;
  message_count?: number;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  type: "text" | "image" | "file";
  file_url?: string | null;
  file_name?: string | null;
  edited: boolean;
  deleted: boolean;
  created_at: string;
}

const ticketStatusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In Progress", variant: "default" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "destructive" },
};

export function AdminSupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [adminUserId, setAdminUserId] = useState<string>("");

  useEffect(() => {
    const getAdminId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminUserId(user.id);
    };
    getAdminId();
  }, [supabase]);

  const fetchTickets = useCallback(async () => {
    const { data: ticketsData, error } = await supabase
      .from("mc_support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) { console.error("Tickets fetch error:", error); setLoading(false); return; }
    if (!ticketsData) { setLoading(false); return; }

    // Fetch user info and last message for each ticket
    const enriched = await Promise.all(
      ticketsData.map(async (t) => {
        const [{ data: profile }, { data: lastMsg }, { count }] = await Promise.all([
          supabase.from("mc_profiles").select("full_name, email").eq("id", t.user_id).single(),
          supabase.from("mc_support_messages").select("body, created_at").eq("ticket_id", t.id).eq("deleted", false).order("created_at", { ascending: false }).limit(1),
          supabase.from("mc_support_messages").select("*", { count: "exact", head: true }).eq("ticket_id", t.id).eq("deleted", false),
        ]);
        return {
          ...t,
          user_name: profile?.full_name || "Unknown User",
          user_email: profile?.email || "",
          last_message: lastMsg?.[0]?.body || "",
          last_message_time: lastMsg?.[0]?.created_at || t.updated_at,
          message_count: count || 0,
        };
      })
    );

    setTickets(enriched);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from("mc_support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    setLoadingMessages(false);
  }, [supabase]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedTicket) return;
    const channel = supabase
      .channel(`admin-support-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mc_support_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
        const newMsg = payload.new as SupportMessage;
        setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket, supabase]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("mc_support_messages")
        .insert({ ticket_id: selectedTicket.id, sender_id: adminUserId, body: replyText.trim(), type: "text" })
        .select()
        .single();
      if (error) throw error;
      if (data) setMessages((prev) => [...prev, data]);
      // Update ticket's updated_at
      await supabase.from("mc_support_tickets").update({ updated_at: new Date().toISOString() }).eq("id", selectedTicket.id);
      setReplyText("");
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    const { error } = await supabase
      .from("mc_support_tickets")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", selectedTicket.id);
    if (!error) {
      setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : prev);
      setTickets((prev) => prev.map((t) => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = searchQuery === "" || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ─── Chat View ───────────────────────────────────────────────────
  if (selectedTicket) {
    const status = ticketStatusConfig[selectedTicket.status] || ticketStatusConfig.open;
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedTicket(null); setMessages([]); fetchTickets(); }} className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{selectedTicket.subject}</h2>
              <p className="text-sm text-surface-500">{selectedTicket.user_name} &middot; {selectedTicket.user_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <select
              value={selectedTicket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col h-[calc(100vh-16rem)] rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-surface-400">No messages yet</p></div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_id === adminUserId;
                if (msg.deleted) {
                  return (
                    <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                      <div className="max-w-[70%] rounded-xl px-4 py-2 opacity-50"><p className="text-sm italic text-surface-400">Message deleted</p></div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5", isAdmin ? "bg-brand-500 text-white rounded-tr-md" : "bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-white rounded-tl-md")}>
                      {msg.type === "image" && msg.file_url && <img src={msg.file_url} alt={msg.file_name || "Image"} className="mb-2 max-h-64 rounded-lg" />}
                      {msg.type === "file" && msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={cn("mb-2 flex items-center gap-2 rounded-lg p-2 text-sm underline", isAdmin ? "bg-brand-600/30" : "bg-surface-200 dark:bg-surface-700")}>
                          <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{msg.file_name || "File"}</span>
                        </a>
                      )}
                      {msg.body && <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>}
                      <div className={cn("mt-1 flex items-center gap-1 text-[10px]", isAdmin ? "justify-end text-white/60" : "text-surface-400")}>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {msg.edited && <span>(edited)</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input */}
          <div className="flex items-end gap-2 border-t border-surface-200 bg-white px-4 py-3 dark:border-surface-700 dark:bg-surface-900">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
              placeholder="Type your reply..."
              rows={1}
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 outline-none placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
            <button onClick={handleSendReply} disabled={sending || !replyText.trim()} className="shrink-0 rounded-xl bg-brand-500 p-2.5 text-white transition-opacity hover:bg-brand-600 disabled:opacity-50">
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Ticket List View ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Support Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage user support tickets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Badge variant="warning">{tickets.filter((t) => t.status === "open").length} Open</Badge>
          <Badge variant="default">{tickets.filter((t) => t.status === "in_progress").length} In Progress</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input placeholder="Search by subject or user name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-2">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-surface-300 dark:text-surface-600" />
              <p className="mt-4 text-sm text-surface-500">No support tickets found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const status = ticketStatusConfig[ticket.status] || ticketStatusConfig.open;
            const priorityColor = ticket.priority === "high" ? "text-danger-600" : ticket.priority === "urgent" ? "text-danger-700 font-semibold" : "text-surface-500";
            return (
              <Card key={ticket.id} className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800" onClick={() => handleSelectTicket(ticket)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                      <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-surface-900 dark:text-white">{ticket.subject}</p>
                        <Badge variant={status.variant} className="shrink-0 text-[10px]">{status.label}</Badge>
                        <span className={cn("shrink-0 text-xs capitalize", priorityColor)}>{ticket.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="truncate text-xs text-surface-500">{ticket.user_name}</p>
                        <span className="text-xs text-surface-400">&middot;</span>
                        <p className="truncate text-xs text-surface-400">{ticket.last_message || "No messages yet"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right ml-2">
                    <p className="text-xs text-surface-400">{new Date(ticket.last_message_time || ticket.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-surface-400">{ticket.message_count || 0} msgs</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// Admin Analytics Page - Real data
export function AdminAnalyticsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<{ totalRevenue: number; activeUsers: number; totalInvestments: number; growthRate: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Total revenue = approved deposits
      const { data: deposits } = await supabase
        .from("mc_deposits")
        .select("amount")
        .eq("status", "approved");
      const totalRevenue = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Active users = profiles with account_status = 'active'
      const { count: activeUsers } = await supabase
        .from("mc_profiles")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "active");

      // Total investments
      const { data: investments } = await supabase
        .from("mc_investments")
        .select("amount");
      const totalInvestments = investments?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;

      // Growth rate: compare this month's deposits vs last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const { data: thisMonthDeps } = await supabase
        .from("mc_deposits")
        .select("amount")
        .eq("status", "approved")
        .gte("submitted_at", thisMonthStart);

      const { data: lastMonthDeps } = await supabase
        .from("mc_deposits")
        .select("amount")
        .eq("status", "approved")
        .gte("submitted_at", lastMonthStart)
        .lt("submitted_at", thisMonthStart);

      const thisMonthTotal = thisMonthDeps?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const lastMonthTotal = lastMonthDeps?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const growthRate = lastMonthTotal > 0 ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1) : "0.0";

      setStats({
        totalRevenue: totalRevenue,
        activeUsers: activeUsers || 0,
        totalInvestments: totalInvestments,
        growthRate: `${Number(growthRate) >= 0 ? "+" : ""}${growthRate}%`,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const statCards = stats ? [
    { name: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign },
    { name: "Active Users", value: stats.activeUsers.toLocaleString(), icon: Users },
    { name: "Total Investments", value: formatCurrency(stats.totalInvestments), icon: TrendingUp },
    { name: "Growth Rate", value: stats.growthRate, icon: BarChart3 },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Platform-wide analytics and reports</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Report</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                    <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">{stat.name}</p>
                    <p className="text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Admin Audit Logs Page - Real data
export function AdminAuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("mc_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch admin profiles
      const userIds = [...new Set(data.map((l) => l.user_id).filter(Boolean))];
      let nameMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("mc_profiles")
          .select("id, full_name")
          .in("id", userIds);
        if (profiles) {
          profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
        }
      }

      const mapped = data.map((l) => ({
        id: l.id,
        admin: nameMap[l.user_id] || l.user_id?.slice(0, 8) || "System",
        action: l.action,
        target: l.entity_type ? `${l.entity_type}${l.entity_id ? ` - ${l.entity_id.slice(0, 8)}` : ""}` : "-",
        time: new Date(l.created_at).toLocaleString(),
        ip: l.ip_address || "-",
      }));

      setLogs(mapped);
      setLoading(false);
    };

    fetchLogs();
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Complete audit trail of admin actions</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-surface-500">No audit logs found</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.admin}</td>
                      <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.target}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{log.time}</td>
                      <td className="px-6 py-4 font-mono text-xs text-surface-500">{log.ip}</td>
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

// Admin Notifications Page (placeholder - no dummy data)
export function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Send and manage notifications</p>
        </div>
        <Button><Send className="mr-2 h-4 w-4" />Send Notification</Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">Broadcast notifications to all users or target specific groups</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin CMS Page (placeholder - no dummy data)
export function AdminCMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Content Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage website and app content</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[{ title: "Homepage Banners", desc: "Manage hero banners and promotions", icon: Layout }, { title: "FAQs", desc: "Frequently asked questions", icon: MessageSquare }, { title: "Terms & Privacy", desc: "Legal documents", icon: FileText }, { title: "About Page", desc: "Company information", icon: Users }, { title: "Contact Info", desc: "Contact details and form", icon: MessageSquare }, { title: "Announcements", desc: "System-wide announcements", icon: Megaphone }].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="cursor-pointer hover:border-brand-200 dark:hover:border-brand-800">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                  <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-surface-500">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Admin Wallets Page (placeholder - no dummy data)
export function AdminWalletsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wallet Management</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Monitor and verify user wallets</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-sm text-surface-500">View all connected wallets, verify/blacklist, and monitor usage</p>
        </CardContent>
      </Card>
    </div>
  );
}
