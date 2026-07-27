"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, TrendingUp, DollarSign, Users, BarChart3, Download, FileText, Clock, Search, Bell, Send, Edit, Trash2, Pin, Image, Eye, MessageSquare, AlertCircle, CheckCircle, Activity, Shield, Settings, Layout, Megaphone, Loader2, ArrowLeft, X, Copy, Check, Wallet, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Audit Log Helper ───
async function logAudit(
  supabase: ReturnType<typeof createClient>,
  action: string,
  entityType?: string,
  entityId?: string | null,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("mc_audit_logs").insert({
      user_id: user?.id || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata || null,
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Admin Signals Page - Signal Posts CRUD + Subscription Management
// ═══════════════════════════════════════════════════════════════════════
interface SignalPost {
  id: string;
  pair: string;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number[] | null;
  risk_level: string;
  analysis: string | null;
  target_audience: string;
  status: string;
  category_id: string | null;
  category_name?: string;
  created_at: string;
}

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
  const [activeTab, setActiveTab] = useState<"posts" | "subscriptions">("posts");

  // ─── Signal Posts State ───
  const [signals, setSignals] = useState<SignalPost[]>([]);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [showSignalForm, setShowSignalForm] = useState(false);
  const [editingSignal, setEditingSignal] = useState<SignalPost | null>(null);
  const [processingSignal, setProcessingSignal] = useState<string | null>(null);
  const [savingSignal, setSavingSignal] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Signal form
  const [formPair, setFormPair] = useState("");
  const [formEntry, setFormEntry] = useState("");
  const [formSL, setFormSL] = useState("");
  const [formTP1, setFormTP1] = useState("");
  const [formTP2, setFormTP2] = useState("");
  const [formTP3, setFormTP3] = useState("");
  const [formRisk, setFormRisk] = useState("medium");
  const [formAnalysis, setFormAnalysis] = useState("");
  const [formAudience, setFormAudience] = useState("all");
  const [formStatus, setFormStatus] = useState("active");
  const [formCategory, setFormCategory] = useState("");

  // ─── Subscriptions State ───
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // ─── Fetch Signal Posts ───
  const fetchSignals = useCallback(async () => {
    const { data: cats } = await supabase.from("mc_signal_categories").select("id, name, slug");
    if (cats) setCategories(cats);

    const { data, error } = await supabase
      .from("mc_signals")
      .select("*, mc_signal_categories(name, slug)")
      .order("created_at", { ascending: false });
    if (error) { console.error("Signals fetch error:", error); setLoadingSignals(false); return; }
    if (!data) { setLoadingSignals(false); return; }

    setSignals(data.map((s) => ({
      ...s,
      entry_price: Number(s.entry_price),
      stop_loss: s.stop_loss ? Number(s.stop_loss) : null,
      take_profit: Array.isArray(s.take_profit) ? s.take_profit.map(Number) : null,
      category_name: (s as any).mc_signal_categories?.name || "",
    })));
    setLoadingSignals(false);
  }, [supabase]);

  // ─── Fetch Subscriptions ───
  const fetchSubscriptions = useCallback(async () => {
    const { data, error } = await supabase.from("mc_subscriptions").select("*").order("created_at", { ascending: false });
    if (error) { console.error("Subscriptions fetch error:", error); setLoadingSubs(false); return; }
    if (!data) { setLoadingSubs(false); return; }

    const enriched = await Promise.all(data.map(async (sub) => {
      const { data: profile } = await supabase.from("mc_profiles").select("full_name, email").eq("id", sub.user_id).single();
      return { ...sub, amount: Number(sub.amount) || 0, user_name: profile?.full_name || "Unknown", user_email: profile?.email || "" };
    }));
    setSubscriptions(enriched);
    setLoadingSubs(false);
  }, [supabase]);

  useEffect(() => { fetchSignals(); fetchSubscriptions(); }, [fetchSignals, fetchSubscriptions]);

  // ─── Signal CRUD ───
  const openCreateSignal = () => {
    setEditingSignal(null);
    setFormPair(""); setFormEntry(""); setFormSL(""); setFormTP1(""); setFormTP2(""); setFormTP3("");
    setFormRisk("medium"); setFormAnalysis(""); setFormAudience("all"); setFormStatus("active"); setFormCategory("");
    setShowSignalForm(true);
  };

  const openEditSignal = (s: SignalPost) => {
    setEditingSignal(s);
    setFormPair(s.pair); setFormEntry(String(s.entry_price)); setFormSL(s.stop_loss ? String(s.stop_loss) : "");
    const tp = s.take_profit || [];
    setFormTP1(tp[0] ? String(tp[0]) : ""); setFormTP2(tp[1] ? String(tp[1]) : ""); setFormTP3(tp[2] ? String(tp[2]) : "");
    setFormRisk(s.risk_level); setFormAnalysis(s.analysis || ""); setFormAudience(s.target_audience); setFormStatus(s.status); setFormCategory(s.category_id || "");
    setShowSignalForm(true);
  };

  const handleSaveSignal = async () => {
    if (!formPair.trim() || !formEntry) return;
    setSavingSignal(true);
    const tp = [formTP1, formTP2, formTP3].filter(Boolean).map(Number);
    const payload: Record<string, any> = {
      pair: formPair.trim().toUpperCase(),
      entry_price: Number(formEntry),
      stop_loss: formSL ? Number(formSL) : null,
      take_profit: tp.length > 0 ? tp : null,
      risk_level: formRisk,
      analysis: formAnalysis.trim() || null,
      target_audience: formAudience,
      status: formStatus,
      category_id: formCategory || null,
    };

    if (editingSignal) {
      const { error } = await supabase.from("mc_signals").update(payload).eq("id", editingSignal.id);
      if (!error) { fetchSignals(); logAudit(supabase, `Updated signal ${formPair.trim().toUpperCase()}`, "mc_signals", editingSignal.id, payload); }
    } else {
      const { error } = await supabase.from("mc_signals").insert(payload);
      if (!error) { fetchSignals(); logAudit(supabase, `Created signal ${formPair.trim().toUpperCase()}`, "mc_signals", null, payload); }
    }
    setSavingSignal(false);
    setShowSignalForm(false);
  };

  const handleDeleteSignal = async (s: SignalPost) => {
    if (!confirm(`Delete signal "${s.pair}"?`)) return;
    setProcessingSignal(s.id);
    const { error } = await supabase.from("mc_signals").delete().eq("id", s.id);
    if (!error) { setSignals((prev) => prev.filter((x) => x.id !== s.id)); logAudit(supabase, `Deleted signal ${s.pair}`, "mc_signals", s.id); }
    setProcessingSignal(null);
  };

  const handleToggleSignalStatus = async (s: SignalPost) => {
    const newStatus = s.status === "active" ? "closed" : "active";
    setProcessingSignal(s.id);
    const { error } = await supabase.from("mc_signals").update({ status: newStatus }).eq("id", s.id);
    if (!error) { setSignals((prev) => prev.map((x) => x.id === s.id ? { ...x, status: newStatus } : x)); logAudit(supabase, `Set signal ${s.pair} to ${newStatus}`, "mc_signals", s.id); }
    setProcessingSignal(null);
  };

  // ─── Subscription CRUD ───
  const handleApprove = async (sub: Subscription) => {
    setProcessing(sub.id);
    const { error } = await supabase.from("mc_subscriptions").update({ status: "active", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", sub.id);
    if (!error) { setSubscriptions((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "active" } : s)); logAudit(supabase, `Approved subscription for ${sub.user_name}`, "mc_subscriptions", sub.id); }
    setProcessing(null);
  };

  const handleReject = async (sub: Subscription) => {
    setProcessing(sub.id);
    const { error } = await supabase.from("mc_subscriptions").update({ status: "rejected", reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", sub.id);
    if (!error) { setSubscriptions((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "rejected" } : s)); logAudit(supabase, `Rejected subscription for ${sub.user_name}`, "mc_subscriptions", sub.id); }
    setProcessing(null);
  };

  const handleDeleteSub = async (sub: Subscription) => {
    if (!confirm(`Delete subscription for ${sub.user_name}?`)) return;
    setProcessing(sub.id);
    const { error } = await supabase.from("mc_subscriptions").delete().eq("id", sub.id);
    if (!error) { setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id)); logAudit(supabase, `Deleted subscription for ${sub.user_name}`, "mc_subscriptions", sub.id); }
    setProcessing(null);
  };

  const filteredSubs = subscriptions.filter((s) => {
    const matchesSearch = searchQuery === "" || s.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.tx_hash?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const riskColors: Record<string, string> = { low: "text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10", medium: "text-warning-600 bg-warning-50 dark:text-warning-500 dark:bg-warning-500/10", high: "text-danger-600 bg-danger-50 dark:text-danger-500 dark:bg-danger-500/10" };
  const statusColors: Record<string, string> = { pending_confirmation: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400", active: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400", rejected: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400", cancelled: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400", expired: "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Signals Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage trading signals and subscriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
        <button onClick={() => setActiveTab("posts")} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === "posts" ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white" : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200")}>
          Signal Posts ({signals.length})
        </button>
        <button onClick={() => setActiveTab("subscriptions")} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === "subscriptions" ? "bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white" : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200")}>
          Subscriptions ({subscriptions.length})
        </button>
      </div>

      {/* ═══ SIGNAL POSTS TAB ═══ */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateSignal}><Plus className="mr-2 h-4 w-4" />Create Signal</Button>
          </div>

          {/* Signal Form */}
          {showSignalForm && (
            <Card className="border-brand-200 dark:border-brand-800">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900 dark:text-white">{editingSignal ? "Edit Signal" : "New Signal"}</h3>
                  <button onClick={() => setShowSignalForm(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Pair</label>
                      <Input value={formPair} onChange={(e) => setFormPair(e.target.value)} placeholder="BTC/USDT" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Entry Price</label>
                      <Input type="number" step="any" value={formEntry} onChange={(e) => setFormEntry(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Stop Loss</label>
                      <Input type="number" step="any" value={formSL} onChange={(e) => setFormSL(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Risk Level</label>
                      <select value={formRisk} onChange={(e) => setFormRisk(e.target.value)} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Take Profit 1</label>
                      <Input type="number" step="any" value={formTP1} onChange={(e) => setFormTP1(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Take Profit 2</label>
                      <Input type="number" step="any" value={formTP2} onChange={(e) => setFormTP2(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Take Profit 3</label>
                      <Input type="number" step="any" value={formTP3} onChange={(e) => setFormTP3(e.target.value)} placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Analysis</label>
                    <textarea value={formAnalysis} onChange={(e) => setFormAnalysis(e.target.value)} placeholder="Trading analysis notes..." rows={3} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        <option value="">None</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Audience</label>
                      <select value={formAudience} onChange={(e) => setFormAudience(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        <option value="all">All Users</option><option value="premium">Premium Only</option><option value="free">Free Users</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
                      <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        <option value="active">Active</option><option value="closed">Closed</option><option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSignal} disabled={savingSignal || !formPair.trim() || !formEntry}>
                      {savingSignal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingSignal ? "Update Signal" : "Create Signal"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSignalForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signals Table */}
          {loadingSignals ? <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div> : (
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Pair</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Entry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">SL / TP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {signals.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-surface-500">No signals yet. Create your first signal.</td></tr>
                  ) : signals.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3 font-semibold text-surface-900 dark:text-white">{s.pair}</td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{s.entry_price}</td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">
                        <span className="text-danger-500">{s.stop_loss || "-"}</span> / {(s.take_profit || []).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", riskColors[s.risk_level] || riskColors.medium)}>{s.risk_level}</span></td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{s.category_name || "-"}</td>
                      <td className="px-4 py-3"><Badge variant={s.status === "active" ? "success" : "default"}>{s.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-surface-500">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleSignalStatus(s)} disabled={processingSignal === s.id} title={s.status === "active" ? "Close" : "Activate"}>
                            {processingSignal === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditSignal(s)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processingSignal === s.id} onClick={() => handleDeleteSignal(s)}>
                            {processingSignal === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></CardContent></Card>
          )}
        </div>
      )}

      {/* ═══ SUBSCRIPTIONS TAB ═══ */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <Input placeholder="Search by user or tx hash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
              <option value="all">All Status</option>
              <option value="pending_confirmation">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loadingSubs ? <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div> : (
            <Card><CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {filteredSubs.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-surface-500">No subscriptions found</td></tr>
                  ) : filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4"><div><p className="text-sm font-medium text-surface-900 dark:text-white">{sub.user_name}</p><p className="text-xs text-surface-500">{sub.user_email}</p></div></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 capitalize">{sub.plan_id.replace(/-/g, " ")}</td>
                      <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{formatCurrency(sub.amount)}</td>
                      <td className="px-6 py-4">
                        {sub.tx_hash ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-surface-600 dark:text-surface-400">{sub.tx_hash.slice(0, 10)}...{sub.tx_hash.slice(-6)}</span>
                            <button onClick={() => { navigator.clipboard.writeText(sub.tx_hash || ""); setCopiedHash(sub.id); setTimeout(() => setCopiedHash(null), 2000); }} className="rounded p-1 hover:bg-surface-100 dark:hover:bg-surface-700" title="Copy"><Copy className="h-3.5 w-3.5 text-surface-400" /></button>
                          </div>
                        ) : <span className="text-xs text-surface-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4"><span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusColors[sub.status] || statusColors.pending_confirmation)}>{sub.status === "pending_confirmation" ? "Pending" : sub.status}</span></td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {sub.status === "pending_confirmation" && (
                            <>
                              <button onClick={() => handleApprove(sub)} disabled={processing === sub.id} className="rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 disabled:opacity-50">
                                {processing === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 inline h-3 w-3" />Approve</>}
                              </button>
                              <button onClick={() => handleReject(sub)} disabled={processing === sub.id} className="rounded-lg bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700 hover:bg-danger-100 dark:bg-danger-500/10 dark:text-danger-400 disabled:opacity-50">
                                {processing === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><X className="mr-1 inline h-3 w-3" />Reject</>}
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteSub(sub)} disabled={processing === sub.id} className="rounded-lg p-1.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 disabled:opacity-50" title="Delete">
                            {processing === sub.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></CardContent></Card>
          )}
        </div>
      )}

      {/* Proof Modal */}
      {viewingProof && (() => {
        const sub = subscriptions.find((s) => s.id === viewingProof);
        if (!sub) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewingProof(null)}>
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <div><h3 className="text-lg font-semibold text-surface-900 dark:text-white">Proof of Payment</h3><p className="text-sm text-surface-500">{sub.user_name} &middot; {formatCurrency(sub.amount)}</p></div>
                <button onClick={() => setViewingProof(null)} className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700"><img src={sub.proof_data || sub.proof_url || ""} alt="Proof" className="w-full" /></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Admin News Page - Full CRUD (matches mc_news schema)
// ═══════════════════════════════════════════════════════════════════════
interface NewsArticle {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  image_url: string | null;
  is_pinned: boolean;
  published_at: string | null;
  author_id: string | null;
  author_name?: string;
  created_at: string;
}

export function AdminNewsPage() {
  const supabase = createClient();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategory, setFormCategory] = useState("Announcement");
  const [formPinned, setFormPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const newsCategories = ["Announcement", "Maintenance", "Investment Updates", "Market News", "Promotions"];

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from("mc_news")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });
    if (error) { console.error("News fetch error:", error); setLoading(false); return; }
    if (!data) { setLoading(false); return; }

    const authorIds = [...new Set(data.map((a) => a.author_id).filter(Boolean))];
    let nameMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase.from("mc_profiles").select("id, full_name").in("id", authorIds);
      if (profiles) profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
    }

    setArticles(data.map((a) => ({ ...a, author_name: nameMap[a.author_id] || "Admin" })));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreate = () => {
    setEditingArticle(null);
    setFormTitle(""); setFormBody(""); setFormCategory("Announcement"); setFormPinned(false);
    setShowForm(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormBody(article.body || "");
    setFormCategory(article.category || "Announcement");
    setFormPinned(article.is_pinned);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (editingArticle) {
      const updateData: Record<string, any> = {
        title: formTitle.trim(),
        body: formBody.trim() || null,
        category: formCategory,
        is_pinned: formPinned,
      };
      const { error } = await supabase.from("mc_news").update(updateData).eq("id", editingArticle.id);
      if (!error) {
        setArticles((prev) => prev.map((a) => a.id === editingArticle.id ? { ...a, title: formTitle.trim(), body: formBody.trim(), category: formCategory, is_pinned: formPinned } : a));
        logAudit(supabase, `Updated article "${formTitle.trim()}"`, "mc_news", editingArticle.id);
      }
    } else {
      const insertData: Record<string, any> = {
        title: formTitle.trim(),
        body: formBody.trim() || null,
        category: formCategory,
        is_pinned: formPinned,
        published_at: new Date().toISOString(),
        author_id: user?.id || null,
      };
      const { data, error } = await supabase.from("mc_news").insert(insertData).select().single();
      if (!error && data) {
        setArticles((prev) => [{ ...data, author_name: "Admin" }, ...prev]);
        logAudit(supabase, `Published article "${formTitle.trim()}"`, "mc_news", data.id);
      }
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (article: NewsArticle) => {
    if (!confirm(`Delete article "${article.title}"?`)) return;
    setProcessing(article.id);
    const { error } = await supabase.from("mc_news").delete().eq("id", article.id);
    if (!error) { setArticles((prev) => prev.filter((a) => a.id !== article.id)); logAudit(supabase, `Deleted article "${article.title}"`, "mc_news", article.id); }
    setProcessing(null);
  };

  const handleTogglePin = async (article: NewsArticle) => {
    const newPinned = !article.is_pinned;
    setProcessing(article.id);
    const { error } = await supabase.from("mc_news").update({ is_pinned: newPinned }).eq("id", article.id);
    if (!error) { setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, is_pinned: newPinned } : a)); logAudit(supabase, `${newPinned ? "Pinned" : "Unpinned"} article "${article.title}"`, "mc_news", article.id); }
    setProcessing(null);
  };

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.body || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || a.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))] as string[];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">News Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Create and manage news articles for users</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Article</Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">{editingArticle ? "Edit Article" : "New Article"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Article title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Body</label>
                <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Article content..." rows={8} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    {newsCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} className="rounded" />
                    Pin to top
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formTitle.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingArticle ? "Update Article" : "Publish Article"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><FileText className="h-12 w-12 text-surface-300 dark:text-surface-600" /><p className="mt-4 text-sm text-surface-500">No articles found</p></CardContent></Card>
        ) : (
          filtered.map((article) => (
            <Card key={article.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900 dark:text-white truncate">{article.title}</h3>
                    {article.is_pinned && <Badge variant="warning">Pinned</Badge>}
                    {article.category && <Badge variant="default">{article.category}</Badge>}
                  </div>
                  <p className="text-sm text-surface-500 truncate">{(article.body || "").slice(0, 120)}...</p>
                  <p className="mt-1 text-xs text-surface-400">By {article.author_name} &middot; {new Date(article.published_at || article.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleTogglePin(article)} disabled={processing === article.id} title={article.is_pinned ? "Unpin" : "Pin to top"}>
                    {processing === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pin className={cn("h-4 w-4", article.is_pinned ? "text-warning-500" : "text-surface-400")} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(article)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processing === article.id} onClick={() => handleDelete(article)}>
                    {processing === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
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
      logAudit(supabase, `Replied to ticket "${selectedTicket.subject}"`, "mc_support_tickets", selectedTicket.id);
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
      logAudit(supabase, `Changed ticket "${selectedTicket.subject}" to ${newStatus}`, "mc_support_tickets", selectedTicket.id);
    }
  };

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    if (!confirm(`Delete ticket "${ticket.subject}" and all its messages?`)) return;
    // Delete all messages first, then the ticket
    await supabase.from("mc_support_messages").delete().eq("ticket_id", ticket.id);
    const { error } = await supabase.from("mc_support_tickets").delete().eq("id", ticket.id);
    if (!error) {
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
        setMessages([]);
      }
      logAudit(supabase, `Deleted ticket "${ticket.subject}"`, "mc_support_tickets", ticket.id);
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
                  <div className="shrink-0 text-right ml-2 flex items-center gap-2">
                    <div>
                      <p className="text-xs text-surface-400">{new Date(ticket.last_message_time || ticket.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-surface-400">{ticket.message_count || 0} msgs</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket); }}
                      className="rounded-lg p-1.5 text-surface-400 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10"
                      title="Delete ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

// Admin Analytics Page - Comprehensive breakdowns with charts
interface MonthlyBucket { month: string; deposits: number; withdrawals: number; users: number; }
interface DepositStatusBreakdown { approved: number; pending: number; rejected: number; cancelled: number; }
interface KycBreakdown { verified: number; pending: number; rejected: number; not_submitted: number; }
interface PlanBreakdown { plan: string; count: number; revenue: number; }

export function AdminAnalyticsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<MonthlyBucket[]>([]);
  const [depositStatus, setDepositStatus] = useState<DepositStatusBreakdown>({ approved: 0, pending: 0, rejected: 0, cancelled: 0 });
  const [kycStatus, setKycStatus] = useState<KycBreakdown>({ verified: 0, pending: 0, rejected: 0, not_submitted: 0 });
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [growthRate, setGrowthRate] = useState("0.0");
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [topUsers, setTopUsers] = useState<{ name: string; email: string; invested: number; profit: number }[]>([]);
  const [signalStats, setSignalStats] = useState({ total: 0, active: 0, categories: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      // ── Monthly buckets (last 6 months) ──
      const now = new Date();
      const months: MonthlyBucket[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("default", { month: "short" });
        const start = d.toISOString();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

        const [{ data: deps }, { data: wds }, { count: usrCount }] = await Promise.all([
          supabase.from("mc_deposits").select("amount").eq("status", "approved").gte("submitted_at", start).lt("submitted_at", end),
          supabase.from("mc_withdrawals").select("amount").eq("status", "approved").gte("submitted_at", start).lt("submitted_at", end),
          supabase.from("mc_profiles").select("*", { count: "exact", head: true }).gte("created_at", start).lt("created_at", end),
        ]);

        months.push({
          month: label,
          deposits: deps?.reduce((s, d) => s + Number(d.amount), 0) || 0,
          withdrawals: wds?.reduce((s, w) => s + Number(w.amount), 0) || 0,
          users: usrCount || 0,
        });
      }
      setMonthly(months);

      // ── Summary stats ──
      const [{ data: approvedDeps }, { data: approvedWds }, { count: aUsers }, { count: allUsers }] = await Promise.all([
        supabase.from("mc_deposits").select("amount").eq("status", "approved"),
        supabase.from("mc_withdrawals").select("amount").eq("status", "approved"),
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }).eq("account_status", "active"),
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }),
      ]);
      const rev = approvedDeps?.reduce((s, d) => s + Number(d.amount), 0) || 0;
      const wd = approvedWds?.reduce((s, w) => s + Number(w.amount), 0) || 0;
      setTotalRevenue(rev);
      setTotalWithdrawn(wd);
      setActiveUsers(aUsers || 0);
      setTotalUsers(allUsers || 0);

      // Growth rate
      const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const [{ data: tDeps }, { data: lDeps }] = await Promise.all([
        supabase.from("mc_deposits").select("amount").eq("status", "approved").gte("submitted_at", thisStart),
        supabase.from("mc_deposits").select("amount").eq("status", "approved").gte("submitted_at", lastStart).lt("submitted_at", thisStart),
      ]);
      const tTotal = tDeps?.reduce((s, d) => s + Number(d.amount), 0) || 0;
      const lTotal = lDeps?.reduce((s, d) => s + Number(d.amount), 0) || 0;
      const gr = lTotal > 0 ? (((tTotal - lTotal) / lTotal) * 100).toFixed(1) : "0.0";
      setGrowthRate(gr);

      // ── Deposit status breakdown ──
      const [{ count: depAppr }, { count: depPend }, { count: depRej }, { count: depCancel }] = await Promise.all([
        supabase.from("mc_deposits").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("mc_deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("mc_deposits").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("mc_deposits").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      ]);
      setDepositStatus({ approved: depAppr || 0, pending: depPend || 0, rejected: depRej || 0, cancelled: depCancel || 0 });
      setPendingDeposits(depPend || 0);

      // ── Pending withdrawals & open tickets ──
      const [{ count: pendWds }, { count: oTickets }] = await Promise.all([
        supabase.from("mc_withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("mc_support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
      ]);
      setPendingWithdrawals(pendWds || 0);
      setOpenTickets(oTickets || 0);

      // ── KYC breakdown ──
      const [{ count: kycV }, { count: kycP }, { count: kycR }, { count: kycN }] = await Promise.all([
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "verified"),
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "pending"),
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "rejected"),
        supabase.from("mc_profiles").select("*", { count: "exact", head: true }).or("kyc_status.is.null,kyc_status.eq.not_submitted"),
      ]);
      setKycStatus({ verified: kycV || 0, pending: kycP || 0, rejected: kycR || 0, not_submitted: kycN || 0 });

      // ── Subscription plan breakdown ──
      const { data: subs } = await supabase.from("mc_subscriptions").select("plan_id, amount, status").eq("status", "active");
      if (subs) {
        const planMap: Record<string, { count: number; revenue: number }> = {};
        subs.forEach((s) => {
          const key = s.plan_id || "unknown";
          if (!planMap[key]) planMap[key] = { count: 0, revenue: 0 };
          planMap[key].count++;
          planMap[key].revenue += Number(s.amount) || 0;
        });
        setPlanBreakdown(Object.entries(planMap).map(([plan, d]) => ({ plan, count: d.count, revenue: d.revenue })).sort((a, b) => b.count - a.count));
      }

      // ── Top users by investment ──
      const { data: profiles } = await supabase
        .from("mc_profiles")
        .select("full_name, email, total_investment, total_profit")
        .order("total_investment", { ascending: false })
        .limit(5);
      if (profiles) {
        setTopUsers(profiles.map((p) => ({
          name: p.full_name || "Unknown",
          email: p.email || "",
          invested: Number(p.total_investment) || 0,
          profit: Number(p.total_profit) || 0,
        })));
      }

      // ── Signal stats ──
      const [{ count: sigTotal }, { count: sigActive }, { count: sigCats }] = await Promise.all([
        supabase.from("mc_signals").select("*", { count: "exact", head: true }),
        supabase.from("mc_signals").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("mc_signal_categories").select("*", { count: "exact", head: true }),
      ]);
      setSignalStats({ total: sigTotal || 0, active: sigActive || 0, categories: sigCats || 0 });

      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  const maxMonthly = Math.max(...monthly.map((m) => Math.max(m.deposits, m.withdrawals)), 1);
  const maxUsersMonth = Math.max(...monthly.map((m) => m.users), 1);
  const totalDepCount = depositStatus.approved + depositStatus.pending + depositStatus.rejected + depositStatus.cancelled;
  const totalKyc = kycStatus.verified + kycStatus.pending + kycStatus.rejected + kycStatus.not_submitted;

  const statCards = [
    { name: "Total Revenue", value: formatCurrency(totalRevenue), sub: `${Number(growthRate) >= 0 ? "+" : ""}${growthRate}% vs last month`, icon: DollarSign, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
    { name: "Active Users", value: activeUsers.toLocaleString(), sub: `${totalUsers.toLocaleString()} total registered`, icon: Users, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { name: "Total Withdrawn", value: formatCurrency(totalWithdrawn), sub: `${pendingWithdrawals} pending`, icon: TrendingUp, color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-500/10" },
    { name: "Net Flow", value: formatCurrency(totalRevenue - totalWithdrawn), sub: "Deposits - Withdrawals", icon: BarChart3, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
  ];

  const depStatusColors = { approved: "bg-success-500", pending: "bg-warning-500", rejected: "bg-danger-500", cancelled: "bg-surface-400" };
  const kycColors = { verified: "bg-success-500", pending: "bg-warning-500", rejected: "bg-danger-500", not_submitted: "bg-surface-400" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Platform-wide analytics and breakdowns</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{pendingDeposits} Pending Deposits</Badge>
          <Badge variant="warning">{openTickets} Open Tickets</Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.bg)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-surface-500">{stat.name}</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-surface-400">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Revenue Chart + User Registrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Deposits vs Withdrawals Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4" />Monthly Deposits vs Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-52">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1" style={{ height: "180px" }}>
                    <div className="w-5 rounded-t bg-success-500 transition-all" style={{ height: `${(m.deposits / maxMonthly) * 170}px`, minHeight: m.deposits > 0 ? "4px" : "0" }} title={`Deposits: ${formatCurrency(m.deposits)}`} />
                    <div className="w-5 rounded-t bg-danger-500 transition-all" style={{ height: `${(m.withdrawals / maxMonthly) * 170}px`, minHeight: m.withdrawals > 0 ? "4px" : "0" }} title={`Withdrawals: ${formatCurrency(m.withdrawals)}`} />
                  </div>
                  <span className="text-[10px] text-surface-500">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success-500" />Deposits</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-danger-500" />Withdrawals</span>
            </div>
          </CardContent>
        </Card>

        {/* User Registrations Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />New User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-52">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center" style={{ height: "180px" }}>
                    <div className="w-8 max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all" style={{ height: `${(m.users / maxUsersMonth) * 170}px`, minHeight: m.users > 0 ? "4px" : "0" }} title={`${m.users} users`} />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-medium text-surface-700 dark:text-surface-300">{m.users}</span>
                    <span className="text-[10px] text-surface-500">{m.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Status + KYC Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Deposit Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deposit Status Breakdown</CardTitle>
            <p className="text-xs text-surface-500">{totalDepCount} total deposits</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["approved", "pending", "rejected", "cancelled"] as const).map((status) => {
              const count = depositStatus[status];
              const pct = totalDepCount > 0 ? (count / totalDepCount) * 100 : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-surface-700 dark:text-surface-300">{status}</span>
                    <span className="font-medium text-surface-900 dark:text-white">{count} <span className="text-xs text-surface-400">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <div className={cn("h-full rounded-full transition-all", depStatusColors[status])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* KYC Verification Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">KYC Verification Status</CardTitle>
            <p className="text-xs text-surface-500">{totalKyc} total users</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["verified", "pending", "rejected", "not_submitted"] as const).map((status) => {
              const count = kycStatus[status];
              const pct = totalKyc > 0 ? (count / totalKyc) * 100 : 0;
              const label = status === "not_submitted" ? "Not Submitted" : status.charAt(0).toUpperCase() + status.slice(1);
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-surface-700 dark:text-surface-300">{label}</span>
                    <span className="font-medium text-surface-900 dark:text-white">{count} <span className="text-xs text-surface-400">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <div className={cn("h-full rounded-full transition-all", kycColors[status])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans + Signal Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscription Plan Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {planBreakdown.length === 0 ? (
              <p className="py-6 text-center text-sm text-surface-500">No active subscriptions</p>
            ) : (
              <div className="space-y-3">
                {planBreakdown.map((p) => {
                  const maxPlan = Math.max(...planBreakdown.map((x) => x.count), 1);
                  return (
                    <div key={p.plan} className="flex items-center gap-4">
                      <span className="w-32 truncate text-sm font-medium capitalize text-surface-900 dark:text-white">{p.plan.replace(/-/g, " ")}</span>
                      <div className="flex-1">
                        <div className="h-6 overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800">
                          <div className="flex h-full items-center rounded-lg bg-brand-500 px-2 transition-all" style={{ width: `${(p.count / maxPlan) * 100}%`, minWidth: p.count > 0 ? "40px" : "0" }}>
                            <span className="text-xs font-medium text-white">{p.count} users</span>
                          </div>
                        </div>
                      </div>
                      <span className="w-24 text-right text-sm font-medium text-surface-700 dark:text-surface-300">{formatCurrency(p.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signal Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Signal Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-brand-50 p-3 text-center dark:bg-brand-500/10">
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{signalStats.total}</p>
                <p className="text-[10px] text-surface-500">Total</p>
              </div>
              <div className="rounded-lg bg-success-50 p-3 text-center dark:bg-success-500/10">
                <p className="text-lg font-bold text-success-600 dark:text-success-400">{signalStats.active}</p>
                <p className="text-[10px] text-surface-500">Active</p>
              </div>
              <div className="rounded-lg bg-warning-50 p-3 text-center dark:bg-warning-500/10">
                <p className="text-lg font-bold text-warning-600 dark:text-warning-400">{signalStats.categories}</p>
                <p className="text-[10px] text-surface-500">Categories</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Active Rate</span>
                <span className="font-medium text-surface-900 dark:text-white">{signalStats.total > 0 ? ((signalStats.active / signalStats.total) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                <div className="h-full rounded-full bg-success-500 transition-all" style={{ width: `${signalStats.total > 0 ? (signalStats.active / signalStats.total) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Users by Investment</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Total Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">Total Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-surface-500">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {topUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-surface-500">No user data yet</td></tr>
                ) : (
                  topUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          i === 0 && "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
                          i === 1 && "bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300",
                          i === 2 && "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
                          i > 2 && "text-surface-500"
                        )}>{i + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-surface-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{formatCurrency(u.invested)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-success-600 dark:text-success-400">{formatCurrency(u.profit)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-surface-700 dark:text-surface-300">{u.invested > 0 ? ((u.profit / u.invested) * 100).toFixed(1) : "0.0"}%</td>
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

// Admin Audit Logs Page - Real data with search, filter, export
interface AuditLogEntry {
  id: string;
  admin: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  target: string;
  time: string;
  raw_time: string;
  ip: string;
  metadata: Record<string, any> | null;
}

export function AdminAuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("mc_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((l) => l.user_id).filter(Boolean))];
    let nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("mc_profiles").select("id, full_name").in("id", userIds);
      if (profiles) profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
    }

    const mapped: AuditLogEntry[] = data.map((l) => ({
      id: l.id,
      admin: nameMap[l.user_id] || l.user_id?.slice(0, 8) || "System",
      action: l.action || "",
      entity_type: l.entity_type || null,
      entity_id: l.entity_id || null,
      target: l.entity_type ? `${l.entity_type}${l.entity_id ? ` #${l.entity_id.slice(0, 8)}` : ""}` : "-",
      time: new Date(l.created_at).toLocaleString(),
      raw_time: l.created_at,
      ip: l.ip_address || "-",
      metadata: l.metadata || null,
    }));

    setLogs(mapped);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const handleExport = () => {
    const rows = filtered.map((l) => [
      l.admin, l.action, l.target, l.time, l.ip,
    ]);
    const csv = ["Admin,Action,Target,Time,IP", ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Derive unique action verbs and entity types for filters
  const actionVerbs = [...new Set(logs.map((l) => {
    const first = l.action.split(" ")[0]?.toLowerCase();
    return first || "other";
  }))].sort();
  const entityTypes = [...new Set(logs.map((l) => l.entity_type).filter(Boolean))].sort() as string[];

  const filtered = logs.filter((l) => {
    const matchesSearch = !search || l.admin.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction === "all" || l.action.split(" ")[0]?.toLowerCase() === filterAction;
    const matchesEntity = filterEntity === "all" || l.entity_type === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const actionColors: Record<string, string> = {
    created: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    published: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    added: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    sent: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
    updated: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
    approved: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    rejected: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400",
    deleted: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400",
    deactivated: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
    activated: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    pinned: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
    unpinned: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
    replied: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
    changed: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
    set: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  };

  const getActionBadge = (action: string) => {
    const verb = action.split(" ")[0]?.toLowerCase() || "";
    return actionColors[verb] || "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400";
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{filtered.length} of {logs.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input placeholder="Search by admin, action, or target..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          <option value="all">All Actions</option>
          {actionVerbs.map((v) => <option key={v} value={v} className="capitalize">{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
        </select>
        <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          <option value="all">All Entities</option>
          {entityTypes.map((t) => <option key={t} value={t}>{t.replace("mc_", "")}</option>)}
        </select>
      </div>

      {/* Table */}
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
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-surface-500">
                    {logs.length === 0 ? "No audit logs yet. Actions will appear here as admins use the platform." : "No logs match your filters."}
                  </td></tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{log.admin}</td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", getActionBadge(log.action))}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        <div>
                          <span>{log.target}</span>
                          {log.metadata && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs text-brand-500 hover:text-brand-600">Details</summary>
                              <pre className="mt-1 max-w-xs overflow-hidden text-ellipsis rounded bg-surface-50 p-2 text-xs text-surface-500 dark:bg-surface-800 dark:text-surface-400">{JSON.stringify(log.metadata, null, 2)}</pre>
                            </details>
                          )}
                        </div>
                      </td>
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

// ═══════════════════════════════════════════════════════════════════════
// Admin Notifications Page - Full CRUD
// ═══════════════════════════════════════════════════════════════════════
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string; // "all", "specific_user"
  target_user_id: string | null;
  target_user_name?: string;
  created_at: string;
  read: boolean;
}

export function AdminNotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState("info");
  const [formTarget, setFormTarget] = useState("all");

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("mc_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) { setLoading(false); return; }

    const userIds = [...new Set(data.map((n) => n.target_user_id).filter(Boolean))];
    let nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("mc_profiles").select("id, full_name").in("id", userIds);
      if (profiles) profiles.forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
    }

    setNotifications(data.map((n) => ({ ...n, target_user_name: nameMap[n.target_user_id] || "" })));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openCreate = () => {
    setEditing(null);
    setFormTitle(""); setFormMessage(""); setFormType("info"); setFormTarget("all");
    setShowForm(true);
  };

  const openEdit = (n: Notification) => {
    setEditing(n);
    setFormTitle(n.title); setFormMessage(n.message); setFormType(n.type); setFormTarget(n.target);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formMessage.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("mc_notifications")
        .update({ title: formTitle.trim(), message: formMessage.trim(), type: formType, target: formTarget })
        .eq("id", editing.id);
      if (!error) { setNotifications((prev) => prev.map((n) => n.id === editing.id ? { ...n, title: formTitle.trim(), message: formMessage.trim(), type: formType, target: formTarget } : n)); logAudit(supabase, `Updated notification "${formTitle.trim()}"`, "mc_notifications", editing.id); }
    } else {
      const { data, error } = await supabase.from("mc_notifications")
        .insert({ title: formTitle.trim(), message: formMessage.trim(), type: formType, target: formTarget })
        .select().single();
      if (!error && data) { setNotifications((prev) => [data, ...prev]); logAudit(supabase, `Sent notification "${formTitle.trim()}"`, "mc_notifications", data.id); }
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (n: Notification) => {
    if (!confirm(`Delete notification "${n.title}"?`)) return;
    setProcessing(n.id);
    const { error } = await supabase.from("mc_notifications").delete().eq("id", n.id);
    if (!error) { setNotifications((prev) => prev.filter((x) => x.id !== n.id)); logAudit(supabase, `Deleted notification "${n.title}"`, "mc_notifications", n.id); }
    setProcessing(null);
  };

  const filtered = notifications.filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()));

  const typeColors: Record<string, string> = { info: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400", warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400", success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400", alert: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400" };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Send and manage notifications</p>
        </div>
        <Button onClick={openCreate}><Send className="mr-2 h-4 w-4" />Send Notification</Button>
      </div>

      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">{editing ? "Edit Notification" : "New Notification"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Notification title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
                <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} placeholder="Notification message..." rows={3} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Target</label>
                  <select value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    <option value="all">All Users</option>
                    <option value="active_users">Active Users</option>
                    <option value="new_users">New Users</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formMessage.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Send Notification"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><Bell className="h-12 w-12 text-surface-300 dark:text-surface-600" /><p className="mt-4 text-sm text-surface-500">No notifications found</p></CardContent></Card>
        ) : (
          filtered.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900 dark:text-white truncate">{n.title}</h3>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeColors[n.type] || typeColors.info)}>{n.type}</span>
                    <Badge variant="default">{n.target}</Badge>
                  </div>
                  <p className="text-sm text-surface-500">{n.message}</p>
                  <p className="mt-1 text-xs text-surface-400">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(n)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processing === n.id} onClick={() => handleDelete(n)}>
                    {processing === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Admin CMS Page - Full CRUD
// ═══════════════════════════════════════════════════════════════════════
interface CMSItem {
  id: string;
  page_key: string;
  title: string;
  content: string | null;
  type: string; // "banner", "faq", "terms", "about", "contact", "announcement"
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminCMSPage() {
  const supabase = createClient();
  const [items, setItems] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CMSItem | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState("banner");
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase.from("mc_cms").select("*").order("type").order("sort_order");
    if (error || !data) { setLoading(false); return; }
    setItems(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = (type?: string) => {
    setEditing(null);
    setFormTitle(""); setFormKey(""); setFormContent(""); setFormType(type || "banner"); setFormOrder(0); setFormActive(true);
    setShowForm(true);
  };

  const openEdit = (item: CMSItem) => {
    setEditing(item);
    setFormTitle(item.title); setFormKey(item.page_key); setFormContent(item.content || ""); setFormType(item.type); setFormOrder(item.sort_order); setFormActive(item.active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formKey.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("mc_cms")
        .update({ title: formTitle.trim(), page_key: formKey.trim(), content: formContent.trim(), type: formType, sort_order: formOrder, active: formActive, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (!error) { setItems((prev) => prev.map((i) => i.id === editing.id ? { ...i, title: formTitle.trim(), page_key: formKey.trim(), content: formContent.trim(), type: formType, sort_order: formOrder, active: formActive } : i)); logAudit(supabase, `Updated CMS "${formTitle.trim()}"`, "mc_cms", editing.id); }
    } else {
      const { data, error } = await supabase.from("mc_cms")
        .insert({ title: formTitle.trim(), page_key: formKey.trim(), content: formContent.trim(), type: formType, sort_order: formOrder, active: formActive })
        .select().single();
      if (!error && data) { setItems((prev) => [...prev, data]); logAudit(supabase, `Created CMS "${formTitle.trim()}"`, "mc_cms", data.id); }
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (item: CMSItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setProcessing(item.id);
    const { error } = await supabase.from("mc_cms").delete().eq("id", item.id);
    if (!error) { setItems((prev) => prev.filter((i) => i.id !== item.id)); logAudit(supabase, `Deleted CMS "${item.title}"`, "mc_cms", item.id); }
    setProcessing(null);
  };

  const handleToggle = async (item: CMSItem) => {
    const newActive = !item.active;
    setProcessing(item.id);
    const { error } = await supabase.from("mc_cms").update({ active: newActive, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (!error) { setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, active: newActive } : i)); logAudit(supabase, `${newActive ? "Activated" : "Deactivated"} CMS "${item.title}"`, "mc_cms", item.id); }
    setProcessing(null);
  };

  const filtered = items.filter((i) => {
    const matchesType = filterType === "all" || i.type === filterType;
    const matchesSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.page_key.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeLabels: Record<string, { label: string; icon: any }> = {
    banner: { label: "Homepage Banners", icon: Layout },
    faq: { label: "FAQs", icon: MessageSquare },
    terms: { label: "Terms & Privacy", icon: FileText },
    about: { label: "About Page", icon: Users },
    contact: { label: "Contact Info", icon: MessageSquare },
    announcement: { label: "Announcements", icon: Megaphone },
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Content Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage website and app content</p>
        </div>
        <Button onClick={() => openCreate()}><Plus className="mr-2 h-4 w-4" />Add Content</Button>
      </div>

      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">{editing ? "Edit Content" : "New Content"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Content title" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Page Key</label>
                  <Input value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="e.g. hero_banner_1" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Content</label>
                <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="HTML or text content..." rows={5} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-white" />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                  <Input type="number" value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value))} className="w-24" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="rounded" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formKey.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType("all")} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", filterType === "all" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>All</button>
        {Object.entries(typeLabels).map(([k, v]) => (
          <button key={k} onClick={() => setFilterType(k)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", filterType === k ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>{v.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-3 py-8 text-center text-sm text-surface-500">No content found</p>
        ) : (
          filtered.map((item) => {
            const typeInfo = typeLabels[item.type] || { label: item.type, icon: FileText };
            const Icon = typeInfo.icon;
            return (
              <Card key={item.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900 dark:text-white text-sm">{item.title}</p>
                        <p className="text-xs text-surface-500">{item.page_key}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(item)} title={item.active ? "Deactivate" : "Activate"}>
                        <Eye className={cn("h-4 w-4", !item.active && "text-surface-300")} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processing === item.id} onClick={() => handleDelete(item)}>
                        {processing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-2">{item.content || "No content"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={item.active ? "success" : "default"}>{item.active ? "Active" : "Inactive"}</Badge>
                    <span className="text-xs text-surface-400">Order: {item.sort_order}</span>
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

// ═══════════════════════════════════════════════════════════════════════
// Admin Wallets Page - Full CRUD
// ═══════════════════════════════════════════════════════════════════════
interface WalletAddress {
  id: string;
  network: string;
  label: string;
  address: string;
  active: boolean;
  created_at: string;
}

export function AdminWalletsPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WalletAddress | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [formNetwork, setFormNetwork] = useState("TRC20");
  const [formLabel, setFormLabel] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formActive, setFormActive] = useState(true);

  const fetchWallets = useCallback(async () => {
    const { data, error } = await supabase.from("mc_wallets").select("*").order("network");
    if (error || !data) { setLoading(false); return; }
    setWallets(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  const openCreate = () => {
    setEditing(null);
    setFormNetwork("TRC20"); setFormLabel(""); setFormAddress(""); setFormActive(true);
    setShowForm(true);
  };

  const openEdit = (w: WalletAddress) => {
    setEditing(w);
    setFormNetwork(w.network); setFormLabel(w.label); setFormAddress(w.address); setFormActive(w.active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formAddress.trim() || !formLabel.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("mc_wallets")
        .update({ network: formNetwork, label: formLabel.trim(), address: formAddress.trim(), active: formActive })
        .eq("id", editing.id);
      if (!error) { setWallets((prev) => prev.map((w) => w.id === editing.id ? { ...w, network: formNetwork, label: formLabel.trim(), address: formAddress.trim(), active: formActive } : w)); logAudit(supabase, `Updated wallet "${formLabel.trim()}"`, "mc_wallets", editing.id); }
    } else {
      const { data, error } = await supabase.from("mc_wallets")
        .insert({ network: formNetwork, label: formLabel.trim(), address: formAddress.trim(), active: formActive })
        .select().single();
      if (!error && data) { setWallets((prev) => [...prev, data]); logAudit(supabase, `Added wallet "${formLabel.trim()}"`, "mc_wallets", data.id); }
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (w: WalletAddress) => {
    if (!confirm(`Delete wallet "${w.label}"?`)) return;
    setProcessing(w.id);
    const { error } = await supabase.from("mc_wallets").delete().eq("id", w.id);
    if (!error) { setWallets((prev) => prev.filter((x) => x.id !== w.id)); logAudit(supabase, `Deleted wallet "${w.label}"`, "mc_wallets", w.id); }
    setProcessing(null);
  };

  const handleToggle = async (w: WalletAddress) => {
    const newActive = !w.active;
    setProcessing(w.id);
    const { error } = await supabase.from("mc_wallets").update({ active: newActive }).eq("id", w.id);
    if (!error) { setWallets((prev) => prev.map((x) => x.id === w.id ? { ...x, active: newActive } : x)); logAudit(supabase, `${newActive ? "Activated" : "Deactivated"} wallet "${w.label}"`, "mc_wallets", w.id); }
    setProcessing(null);
  };

  const copyAddress = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wallet Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage deposit wallet addresses for each network</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Wallet</Button>
      </div>

      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">{editing ? "Edit Wallet" : "New Wallet"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Network</label>
                  <select value={formNetwork} onChange={(e) => setFormNetwork(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    <option value="TRC20">TRC20 (Tron)</option>
                    <option value="ERC20">ERC20 (Ethereum)</option>
                    <option value="BEP20">BEP20 (BSC)</option>
                    <option value="POLYGON">Polygon</option>
                    <option value="SOLANA">Solana</option>
                    <option value="BTC">Bitcoin</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Label</label>
                  <Input value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="e.g. Main TRC20 Deposit" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Wallet Address</label>
                <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Wallet address" className="font-mono" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="rounded" />
                  Active (shown to users)
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formAddress.trim() || !formLabel.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Add Wallet"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {wallets.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12 col-span-2"><Shield className="h-12 w-12 text-surface-300 dark:text-surface-600" /><p className="mt-4 text-sm text-surface-500">No wallet addresses configured</p></CardContent></Card>
        ) : (
          wallets.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                      <Wallet className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">{w.label}</p>
                      <p className="text-xs text-surface-500">{w.network}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(w)} title={w.active ? "Deactivate" : "Activate"}>
                      <Eye className={cn("h-4 w-4", !w.active && "text-surface-300")} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(w)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" disabled={processing === w.id} onClick={() => handleDelete(w)}>
                      {processing === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-50 p-2.5 dark:bg-surface-800">
                  <code className="flex-1 truncate text-sm text-surface-700 dark:text-surface-300 font-mono" title={w.address}>{w.address}</code>
                  <button onClick={() => copyAddress(w.id, w.address)} className="shrink-0 rounded p-1 hover:bg-surface-200 dark:hover:bg-surface-700">
                    {copied === w.id ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-surface-400" />}
                  </button>
                </div>
                <div className="mt-2">
                  <Badge variant={w.active ? "success" : "default"}>{w.active ? "Active" : "Inactive"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Admin Settings Page - Global platform configuration
// ═══════════════════════════════════════════════════════════════════════
interface SettingEntry {
  key: string;
  value: string;
  label: string;
  description: string;
  type: "text" | "number" | "address" | "select";
  section: string;
  options?: string[];
}

const SETTINGS_SCHEMA: SettingEntry[] = [
  // Platform
  { key: "platform_name", value: "", label: "Platform Name", description: "Displayed across the site", type: "text", section: "Platform" },
  { key: "platform_hard_cap", value: "1000000", label: "Hard Cap (USD)", description: "Maximum total deposits before deposits are disabled", type: "number", section: "Platform" },
  { key: "min_deposit", value: "50", label: "Minimum Deposit (USDT)", description: "Minimum amount users can deposit", type: "number", section: "Platform" },
  { key: "min_withdrawal", value: "10", label: "Minimum Withdrawal (USDT)", description: "Minimum amount users can withdraw", type: "number", section: "Platform" },
  // Deposit Wallet
  { key: "deposit_wallet_address", value: "", label: "Deposit Wallet Address", description: "Address users send deposits to", type: "address", section: "Deposit Wallet" },
  { key: "deposit_network", value: "TRC20 (Tron)", label: "Deposit Network", description: "Network for deposits", type: "select", section: "Deposit Wallet", options: ["TRC20 (Tron)", "ERC20 (Ethereum)", "BEP20 (BSC)", "POLYGON", "SOLANA", "BTC"] },
  { key: "deposit_currency", value: "USDT", label: "Deposit Currency", description: "Token currency for deposits", type: "text", section: "Deposit Wallet" },
  // Subscription Wallet
  { key: "subscription_wallet_address", value: "", label: "Subscription Wallet Address", description: "Address users send subscription payments to", type: "address", section: "Subscription Wallet" },
  { key: "subscription_network", value: "TRC20 (Tron)", label: "Subscription Network", description: "Network for subscription payments", type: "select", section: "Subscription Wallet", options: ["TRC20 (Tron)", "ERC20 (Ethereum)", "BEP20 (BSC)", "POLYGON", "SOLANA", "BTC"] },
  { key: "subscription_currency", value: "USDT", label: "Subscription Currency", description: "Token currency for subscriptions", type: "text", section: "Subscription Wallet" },
];

export function AdminSettingsPage() {
  const supabase = createClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("mc_settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row) => { map[row.key] = row.value; });
        setValues(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
    for (const row of rows) {
      const { error } = await supabase
        .from("mc_settings")
        .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) console.error(`Settings save error for ${row.key}:`, error);
    }
    logAudit(supabase, "Updated platform settings", "mc_settings", null, values);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const copyValue = (key: string) => {
    navigator.clipboard.writeText(values[key] || "");
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  const sections = [...new Set(SETTINGS_SCHEMA.map((s) => s.section))];
  const getVal = (key: string) => values[key] ?? SETTINGS_SCHEMA.find((s) => s.key === key)?.value ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Platform Settings</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Configure global platform values used across the user dashboard</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : saved ? <><Check className="mr-2 h-4 w-4" />Saved!</> : <><Save className="mr-2 h-4 w-4" />Save All Settings</>}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-800 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircle className="h-4 w-4" />Settings saved successfully
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const fields = SETTINGS_SCHEMA.filter((s) => s.section === section);
        return (
          <Card key={section}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {fields.map((field) => (
                <div key={field.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{field.label}</label>
                    {field.type === "address" && getVal(field.key) && (
                      <button onClick={() => copyValue(field.key)} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {copied === field.key ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                      </button>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-surface-400">{field.description}</p>
                  {field.type === "select" ? (
                    <select
                      value={getVal(field.key)}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
                    >
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={getVal(field.key)}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      className={field.type === "address" ? "font-mono text-sm" : ""}
                      step={field.type === "number" ? "any" : undefined}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Bottom save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : saved ? <><Check className="mr-2 h-4 w-4" />Saved!</> : <><Save className="mr-2 h-4 w-4" />Save All Settings</>}
        </Button>
      </div>
    </div>
  );
}
