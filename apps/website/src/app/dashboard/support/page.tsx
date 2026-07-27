"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2,
  Send, Paperclip, Smile, MoreVertical, Reply, Pencil, Trash2,
  X, Image as ImageIcon, ChevronLeft, ArrowLeft, Check, CheckCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

// ─── Types ───────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_time?: string;
  unread?: boolean;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  type: "text" | "image" | "file";
  file_url?: string | null;
  file_name?: string | null;
  reply_to_id: string | null;
  edited: boolean;
  deleted: boolean;
  created_at: string;
}

// ─── Emoji Data ──────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤝", "🙏", "💪", "🦾", "🖕"],
  },
  {
    name: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
  },
  {
    name: "Objects",
    emojis: ["🔥", "⭐", "💫", "✨", "🎉", "🎊", "💯", "💰", "💵", "📈", "📉", "✅", "❌", "⚠️", "🚀", "💡", "📌", "📎", "🔗", "📧", "📱", "💻", "🖥️"],
  },
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) => c.emojis);

// ─── Status Config ───────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In Progress", variant: "default" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "destructive" },
};

// ─── Main Page ───────────────────────────────────────────────────────
export default function SupportPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { error: showError, success: showSuccess } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mc_support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      // Get last message for each ticket
      const ticketsWithLastMsg = await Promise.all(
        data.map(async (t) => {
          const { data: lastMsg } = await supabase
            .from("mc_support_messages")
            .select("body, created_at")
            .eq("ticket_id", t.id)
            .eq("deleted", false)
            .order("created_at", { ascending: false })
            .limit(1);
          return {
            ...t,
            last_message: lastMsg?.[0]?.body || "",
            last_message_time: lastMsg?.[0]?.created_at || t.updated_at,
          };
        })
      );
      setTickets(ticketsWithLastMsg);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Fetch messages for selected ticket
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

  // Select ticket
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedTicket || !user) return;

    const channel = supabase
      .channel(`support-${selectedTicket.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mc_support_messages", filter: `ticket_id=eq.${selectedTicket.id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mc_support_messages", filter: `ticket_id=eq.${selectedTicket.id}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket, user, supabase]);

  // Scroll to bottom on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <TablePageSkeleton />;

  // ─── Chat View ───────────────────────────────────────────────────
  if (selectedTicket) {
    return (
      <ChatView
        ticket={selectedTicket}
        messages={messages}
        loadingMessages={loadingMessages}
        userId={user?.id || ""}
        supabase={supabase}
        onBack={() => { setSelectedTicket(null); setMessages([]); fetchTickets(); }}
        onMessageUpdate={(updated) =>
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        }
        onMessageDelete={(id) =>
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, deleted: true, body: "This message was deleted" } : m)))
        }
        onNewMessage={(msg) => setMessages((prev) => [...prev, msg])}
      />
    );
  }

  // ─── Ticket List View ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Support</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Chat with our support team</p>
        </div>
        <Button onClick={() => setShowNewTicket(!showNewTicket)}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {showNewTicket && (
        <NewTicketForm
          supabase={supabase}
          userId={user?.id || ""}
          onCreated={(ticket) => {
            setShowNewTicket(false);
            fetchTickets();
            handleSelectTicket(ticket);
          }}
          onCancel={() => setShowNewTicket(false)}
        />
      )}

      <div className="space-y-2">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-sm text-surface-500">No conversations yet</p>
            <p className="mt-1 text-xs text-surface-400">Start a new chat if you need help</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.open;
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-colors hover:border-brand-200 dark:hover:border-brand-800"
                onClick={() => handleSelectTicket(ticket)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
                      <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-surface-900 dark:text-white">{ticket.subject}</p>
                        <Badge variant={status.variant} className="shrink-0 text-[10px]">{status.label}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-surface-500">
                        {ticket.last_message || "No messages yet"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-surface-400 ml-2">
                    {ticket.last_message_time ? new Date(ticket.last_message_time).toLocaleDateString() : ""}
                  </span>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// New Ticket Form
// ═══════════════════════════════════════════════════════════════════════
function NewTicketForm({
  supabase, userId, onCreated, onCancel,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  onCreated: (ticket: Ticket) => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const { data: ticket, error } = await supabase
        .from("mc_support_tickets")
        .insert({ user_id: userId, subject: subject.trim(), status: "open", priority: "medium" })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("mc_support_messages").insert({
        ticket_id: ticket.id,
        sender_id: userId,
        body: message.trim(),
        type: "text",
      });

      onCreated({ ...ticket, last_message: message.trim(), last_message_time: ticket.created_at });
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Subject</label>
          <Input placeholder="What do you need help with?" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
          <textarea
            className="flex min-h-[100px] w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 outline-none placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={submitting || !subject.trim() || !message.trim()}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Chat
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Chat View
// ═══════════════════════════════════════════════════════════════════════
function ChatView({
  ticket, messages, loadingMessages, userId, supabase, onBack, onMessageUpdate, onMessageDelete, onNewMessage,
}: {
  ticket: Ticket;
  messages: Message[];
  loadingMessages: boolean;
  userId: string;
  supabase: ReturnType<typeof createClient>;
  onBack: () => void;
  onMessageUpdate: (msg: Message) => void;
  onMessageDelete: (id: string) => void;
  onNewMessage: (msg: Message) => void;
}) {
  const { error: showError } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(null);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() && !editingMsg) return;
    setSending(true);

    try {
      if (editingMsg) {
        // Update message
        const { data, error } = await supabase
          .from("mc_support_messages")
          .update({ body: editValue.trim(), edited: true })
          .eq("id", editingMsg.id)
          .select()
          .single();
        if (error) {
          console.error("Message update error:", error);
          showError("Send Failed", error.message || "Failed to update message.");
        } else if (data) {
          onMessageUpdate(data);
          setEditingMsg(null);
          setEditValue("");
        }
      } else {
        // New message
        const { data, error } = await supabase
          .from("mc_support_messages")
          .insert({
            ticket_id: ticket.id,
            sender_id: userId,
            body: inputValue.trim(),
            type: "text",
            reply_to_id: replyTo?.id || null,
          })
          .select()
          .single();
        if (error) {
          console.error("Message send error:", error);
          showError("Send Failed", error.message || "Failed to send message.");
        } else if (data) {
          onNewMessage(data);
          setInputValue("");
          setReplyTo(null);
          // Update ticket's updated_at and last_message
          await supabase
            .from("mc_support_tickets")
            .update({ updated_at: new Date().toISOString(), last_message: inputValue.trim(), last_message_time: new Date().toISOString() })
            .eq("id", ticket.id);
        }
      }
    } catch (err) {
      console.error("Send failed:", err);
      showError("Send Failed", "An unexpected error occurred. Please try again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Upload media
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) { showError("Unsupported File", "Please upload a PNG, JPG, WEBP, GIF, or PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { showError("File Too Large", "File must be under 10MB."); return; }

    setSending(true);
    const ext = file.name.split(".").pop();
    const fileName = `${userId}/${ticket.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("support-media").upload(fileName, file);
    if (uploadError) { showError("Upload Failed", "Failed to upload file. Please try again."); setSending(false); return; }

    const { data: urlData } = supabase.storage.from("support-media").getPublicUrl(fileName);

    const { data: msgData } = await supabase
      .from("mc_support_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: userId,
        body: isImage ? "" : file.name,
        type: isImage ? "image" : "file",
        file_url: urlData?.publicUrl || "",
        file_name: file.name,
        reply_to_id: replyTo?.id || null,
      })
      .select()
      .single();

    if (msgData) onNewMessage(msgData);
    setSending(false);
    setReplyTo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete message
  const handleDelete = async (msgId: string) => {
    const { data } = await supabase
      .from("mc_support_messages")
      .update({ deleted: true, body: "This message was deleted" })
      .eq("id", msgId)
      .select()
      .single();
    if (data) onMessageDelete(msgId);
    setMenuOpen(null);
  };

  // Start edit
  const startEdit = (msg: Message) => {
    setEditingMsg(msg);
    setEditValue(msg.body);
    setMenuOpen(null);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      if (editingMsg) { setEditingMsg(null); setEditValue(""); }
      if (replyTo) setReplyTo(null);
    }
  };

  // Find reply target
  const getReplyTarget = (replyId: string | null | undefined) => {
    if (!replyId) return null;
    return messages.find((m) => m.id === replyId) || null;
  };

  const status = statusConfig[ticket.status] || statusConfig.open;

  if (loadingMessages) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3 dark:border-surface-700">
        <button onClick={onBack} className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
          <MessageSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-surface-900 dark:text-white">{ticket.subject}</p>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-surface-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            const isDeleted = msg.deleted;
            const replyTarget = getReplyTarget(msg.reply_to_id ?? null);

            if (isDeleted) {
              return (
                <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <div className="max-w-[70%] rounded-xl px-4 py-2 opacity-50">
                    <p className="text-sm italic text-surface-400">Message deleted</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn("group flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn("relative max-w-[75%] sm:max-w-[60%]", isOwn ? "order-1" : "order-1")}>
                  {/* Menu button */}
                  {isOwn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === msg.id ? null : msg.id); }}
                      className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                      style={isOwn ? { left: "-28px" } : { right: "-28px" }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  )}
                  {!isOwn && (
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="absolute -top-1 right-[-28px] opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-surface-600"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Dropdown menu */}
                  {menuOpen === msg.id && isOwn && (
                    <div className={cn("absolute top-0 z-50 w-32 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-800", isOwn ? "left-[-140px]" : "right-[-140px]")}>
                      <button onClick={() => startEdit(msg)} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-700">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(msg.id)} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}

                  {/* Reply preview */}
                  {replyTarget && (
                    <div className={cn("mb-1 rounded-t-lg border-b px-3 py-1.5 text-xs", isOwn ? "bg-brand-100/50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-800" : "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700")}>
                      <p className="truncate text-surface-500">{replyTarget.body || "📎 Attachment"}</p>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5",
                    isOwn
                      ? "bg-brand-500 text-white rounded-tr-md"
                      : "bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-white rounded-tl-md"
                  )}>
                    {msg.type === "image" && msg.file_url && (
                      <img src={msg.file_url} alt={msg.file_name || "Image"} className="mb-2 max-h-64 rounded-lg" />
                    )}
                    {msg.type === "file" && msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={cn("mb-2 flex items-center gap-2 rounded-lg p-2 text-sm underline", isOwn ? "bg-brand-600/30" : "bg-surface-200 dark:bg-surface-700")}>
                        <Paperclip className="h-4 w-4 shrink-0" />
                        <span className="truncate">{msg.file_name || "File"}</span>
                      </a>
                    )}
                    {msg.body && <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>}
                    <div className={cn("mt-1 flex items-center gap-1 text-[10px]", isOwn ? "justify-end text-white/60" : "text-surface-400")}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.edited && <span>(edited)</span>}
                      {isOwn && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div ref={emojiRef} className="border-t border-surface-200 bg-white p-3 dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-2 flex gap-2">
            {EMOJI_CATEGORIES.map((cat) => (
              <span key={cat.name} className="text-xs text-surface-400">{cat.emojis[0]} {cat.name}</span>
            ))}
          </div>
          <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto sm:grid-cols-12">
            {ALL_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue((prev) => prev + emoji);
                  inputRef.current?.focus();
                }}
                className="rounded p-1 text-xl hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply/Edit Preview Bar */}
      {(replyTo || editingMsg) && (
        <div className="flex items-center gap-2 border-t border-surface-200 bg-surface-50 px-4 py-2 dark:border-surface-700 dark:bg-surface-800">
          {replyTo && (
            <>
              <Reply className="h-4 w-4 text-brand-500" />
              <span className="text-xs text-surface-500">Replying to: </span>
              <span className="flex-1 truncate text-xs text-surface-600 dark:text-surface-400">{replyTo.body || "Attachment"}</span>
              <button onClick={() => setReplyTo(null)} className="text-surface-400 hover:text-surface-600"><X className="h-3.5 w-3.5" /></button>
            </>
          )}
          {editingMsg && (
            <>
              <Pencil className="h-4 w-4 text-brand-500" />
              <span className="text-xs text-surface-500">Editing message</span>
              <span className="flex-1" />
              <button onClick={() => { setEditingMsg(null); setEditValue(""); }} className="text-surface-400 hover:text-surface-600"><X className="h-3.5 w-3.5" /></button>
            </>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 border-t border-surface-200 bg-white px-4 py-3 dark:border-surface-700 dark:bg-surface-900">
        {/* File upload */}
        <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.pdf" className="hidden" onChange={handleFileUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Emoji toggle */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={cn("shrink-0 rounded-lg p-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800", showEmoji ? "text-brand-500" : "text-surface-400 hover:text-surface-600 dark:hover:text-surface-300")}
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={editingMsg ? editValue : inputValue}
          onChange={(e) => editingMsg ? setEditValue(e.target.value) : setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMsg ? "Edit message..." : "Type a message..."}
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 outline-none placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || (!inputValue.trim() && !editingMsg)}
          className="shrink-0 rounded-xl bg-brand-500 p-2.5 text-white transition-opacity hover:bg-brand-600 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : editingMsg ? <Check className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
