-- Maverick Capital Platform - Initial Schema
-- Layer 1: Core tables, RLS, indexes, triggers
-- All objects prefixed with mc_ for easy identification

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE mc_account_status AS ENUM ('active', 'suspended', 'blocked', 'pending_verification');
CREATE TYPE mc_kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE mc_membership_level AS ENUM ('basic', 'growth', 'professional', 'elite');
CREATE TYPE mc_investment_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'paused');
CREATE TYPE mc_deposit_status AS ENUM ('pending', 'confirming', 'approved', 'rejected');
CREATE TYPE mc_withdrawal_status AS ENUM ('pending', 'approved', 'processing', 'sent', 'completed', 'rejected');
CREATE TYPE mc_transaction_type AS ENUM ('deposit', 'withdrawal', 'investment', 'profit', 'bonus', 'subscription');
CREATE TYPE mc_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE mc_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE mc_notification_type AS ENUM ('deposit_approved', 'withdrawal_sent', 'investment_updated', 'profit_added', 'system_announcement', 'signal_posted', 'support_reply', 'subscription_expired');
CREATE TYPE mc_signal_target AS ENUM ('free', 'premium');
CREATE TYPE mc_risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE mc_plan_status AS ENUM ('active', 'paused', 'ended');
CREATE TYPE mc_subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE mc_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  kyc_status mc_kyc_status DEFAULT 'not_submitted',
  account_status mc_account_status DEFAULT 'active',
  membership_level mc_membership_level DEFAULT 'basic',
  wallet_balance DECIMAL(20,2) DEFAULT 0,
  total_investment DECIMAL(20,2) DEFAULT 0,
  total_profit DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles
CREATE TABLE mc_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions
CREATE TABLE mc_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Role-Permission mapping
CREATE TABLE mc_role_permissions (
  role_id UUID REFERENCES mc_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES mc_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Role mapping
CREATE TABLE mc_user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES mc_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- INVESTMENT TABLES
-- ============================================================

CREATE TABLE mc_investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(20,2) NOT NULL,
  max_amount DECIMAL(20,2),
  expected_return_pct DECIMAL(5,2) NOT NULL,
  duration_days INT NOT NULL,
  status mc_plan_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES mc_investment_plans(id),
  amount DECIMAL(20,2) NOT NULL,
  current_value DECIMAL(20,2) NOT NULL DEFAULT 0,
  status mc_investment_status DEFAULT 'pending',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_investment_growth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES mc_investments(id) ON DELETE CASCADE,
  amount_before DECIMAL(20,2) NOT NULL,
  amount_after DECIMAL(20,2) NOT NULL,
  growth_pct DECIMAL(5,2),
  applied_by UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FINANCIAL TABLES
-- ============================================================

CREATE TABLE mc_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL,
  tx_hash TEXT,
  status mc_deposit_status DEFAULT 'pending',
  proof_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES mc_wallets(id),
  amount DECIMAL(20,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  tx_hash TEXT,
  status mc_withdrawal_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type mc_transaction_type NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  reference_id UUID,
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_payout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id UUID REFERENCES mc_withdrawals(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SUBSCRIPTION / SIGNALS TABLES
-- ============================================================

CREATE TABLE mc_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_usdt DECIMAL(20,2) NOT NULL,
  duration_days INT NOT NULL,
  features JSONB DEFAULT '[]',
  signal_access mc_signal_target DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES mc_subscription_plans(id),
  status mc_subscription_status DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_signal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES mc_signal_categories(id),
  pair TEXT NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  stop_loss DECIMAL(20,8),
  take_profit JSONB,
  risk_level mc_risk_level DEFAULT 'medium',
  analysis TEXT,
  image_url TEXT,
  target_audience mc_signal_target DEFAULT 'free',
  posted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTENT / SUPPORT TABLES
-- ============================================================

CREATE TABLE mc_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type mc_notification_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'announcement',
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_news_bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES mc_news(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, news_id)
);

CREATE TABLE mc_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status mc_ticket_status DEFAULT 'open',
  priority mc_ticket_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES mc_support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SYSTEM TABLES
-- ============================================================

CREATE TABLE mc_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address TEXT,
  last_active TIMESTAMPTZ DEFAULT now(),
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mc_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_mc_profiles_status ON mc_profiles(account_status);
CREATE INDEX idx_mc_investments_user ON mc_investments(user_id);
CREATE INDEX idx_mc_investments_status ON mc_investments(status);
CREATE INDEX idx_mc_investments_plan ON mc_investments(plan_id);
CREATE INDEX idx_mc_deposits_user ON mc_deposits(user_id);
CREATE INDEX idx_mc_deposits_status ON mc_deposits(status);
CREATE INDEX idx_mc_withdrawals_user ON mc_withdrawals(user_id);
CREATE INDEX idx_mc_withdrawals_status ON mc_withdrawals(status);
CREATE INDEX idx_mc_transactions_user ON mc_transactions(user_id);
CREATE INDEX idx_mc_transactions_type ON mc_transactions(type);
CREATE INDEX idx_mc_notifications_user ON mc_notifications(user_id);
CREATE INDEX idx_mc_notifications_read ON mc_notifications(user_id, is_read);
CREATE INDEX idx_mc_support_tickets_user ON mc_support_tickets(user_id);
CREATE INDEX idx_mc_support_tickets_status ON mc_support_tickets(status);
CREATE INDEX idx_mc_support_messages_ticket ON mc_support_messages(ticket_id);
CREATE INDEX idx_mc_audit_logs_entity ON mc_audit_logs(entity_type, entity_id);
CREATE INDEX idx_mc_audit_logs_user ON mc_audit_logs(user_id);
CREATE INDEX idx_mc_login_history_user ON mc_login_history(user_id);
CREATE INDEX idx_mc_signals_category ON mc_signals(category_id);
CREATE INDEX idx_mc_signals_target ON mc_signals(target_audience);
CREATE INDEX idx_mc_news_category ON mc_news(category);
CREATE INDEX idx_mc_news_published ON mc_news(published_at DESC);
CREATE INDEX idx_mc_subscriptions_user ON mc_subscriptions(user_id);
CREATE INDEX idx_mc_subscriptions_status ON mc_subscriptions(status);
CREATE INDEX idx_mc_wallets_user ON mc_wallets(user_id);
CREATE INDEX idx_mc_growth_logs_investment ON mc_investment_growth_logs(investment_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE mc_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_profile" ON mc_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "mc_users_can_update_own_profile" ON mc_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "mc_admins_can_view_all_profiles" ON mc_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'moderator', 'support'))
);
CREATE POLICY "mc_admins_can_update_all_profiles" ON mc_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Investments
ALTER TABLE mc_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_investments" ON mc_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_create_investments" ON mc_investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_investments" ON mc_investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'moderator'))
);
CREATE POLICY "mc_admins_can_update_all_investments" ON mc_investments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Deposits
ALTER TABLE mc_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_deposits" ON mc_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_create_deposits" ON mc_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_deposits" ON mc_deposits FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_admins_can_update_all_deposits" ON mc_deposits FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Withdrawals
ALTER TABLE mc_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_withdrawals" ON mc_withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_create_withdrawals" ON mc_withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_withdrawals" ON mc_withdrawals FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_admins_can_update_all_withdrawals" ON mc_withdrawals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Transactions
ALTER TABLE mc_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_transactions" ON mc_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_transactions" ON mc_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Wallets
ALTER TABLE mc_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_wallets" ON mc_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_manage_own_wallets" ON mc_wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_wallets" ON mc_wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Notifications
ALTER TABLE mc_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_notifications" ON mc_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_update_own_notifications" ON mc_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mc_system_can_insert_notifications" ON mc_notifications FOR INSERT WITH CHECK (true);

-- News
ALTER TABLE mc_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_view_published_news" ON mc_news FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "mc_admins_can_manage_news" ON mc_news FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- News bookmarks
ALTER TABLE mc_news_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_manage_own_bookmarks" ON mc_news_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Support tickets
ALTER TABLE mc_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_tickets" ON mc_support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_create_tickets" ON mc_support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_tickets" ON mc_support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support'))
);
CREATE POLICY "mc_admins_can_update_all_tickets" ON mc_support_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support'))
);

-- Support messages
ALTER TABLE mc_support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_messages_on_own_tickets" ON mc_support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "mc_users_can_create_messages_on_own_tickets" ON mc_support_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM mc_support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "mc_admins_can_view_all_messages" ON mc_support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support'))
);
CREATE POLICY "mc_admins_can_create_messages" ON mc_support_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'support'))
);

-- Signals
ALTER TABLE mc_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_view_free_signals" ON mc_signals FOR SELECT USING (target_audience = 'free');
CREATE POLICY "mc_subscribers_can_view_premium_signals" ON mc_signals FOR SELECT USING (
  target_audience = 'premium' AND EXISTS (
    SELECT 1 FROM mc_subscriptions WHERE user_id = auth.uid() AND status = 'active' AND end_date > now()
  )
);
CREATE POLICY "mc_admins_can_manage_signals" ON mc_signals FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin', 'analyst'))
);

-- Subscriptions
ALTER TABLE mc_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_subscriptions" ON mc_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_create_own_subscriptions" ON mc_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_view_all_subscriptions" ON mc_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_admins_can_update_all_subscriptions" ON mc_subscriptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Subscription plans (public read)
ALTER TABLE mc_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_view_subscription_plans" ON mc_subscription_plans FOR SELECT USING (true);
CREATE POLICY "mc_admins_can_manage_subscription_plans" ON mc_subscription_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Investment plans (public read)
ALTER TABLE mc_investment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_view_active_plans" ON mc_investment_plans FOR SELECT USING (status = 'active');
CREATE POLICY "mc_admins_can_manage_plans" ON mc_investment_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Investment growth logs
ALTER TABLE mc_investment_growth_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_logs_for_own_investments" ON mc_investment_growth_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_investments WHERE id = investment_id AND user_id = auth.uid())
);
CREATE POLICY "mc_admins_can_manage_growth_logs" ON mc_investment_growth_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Audit logs
ALTER TABLE mc_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_admins_can_view_audit_logs" ON mc_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_system_can_insert_audit_logs" ON mc_audit_logs FOR INSERT WITH CHECK (true);

-- Activity logs
ALTER TABLE mc_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_activity" ON mc_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_system_can_insert_activity_logs" ON mc_activity_logs FOR INSERT WITH CHECK (true);

-- Device sessions
ALTER TABLE mc_device_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_sessions" ON mc_device_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_users_can_revoke_own_sessions" ON mc_device_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mc_system_can_insert_sessions" ON mc_device_sessions FOR INSERT WITH CHECK (true);

-- Login history
ALTER TABLE mc_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_login_history" ON mc_login_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_system_can_insert_login_history" ON mc_login_history FOR INSERT WITH CHECK (true);

-- System config
ALTER TABLE mc_system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_read_system_config" ON mc_system_config FOR SELECT USING (true);
CREATE POLICY "mc_admins_can_update_system_config" ON mc_system_config FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Admin actions
ALTER TABLE mc_admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_admins_can_view_admin_actions" ON mc_admin_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_admins_can_create_admin_actions" ON mc_admin_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Roles (read for admins)
ALTER TABLE mc_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_admins_can_view_roles" ON mc_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_system_can_insert_roles" ON mc_roles FOR INSERT WITH CHECK (true);

-- Permissions
ALTER TABLE mc_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_admins_can_view_permissions" ON mc_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Role permissions
ALTER TABLE mc_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_admins_can_view_role_permissions" ON mc_role_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);
CREATE POLICY "mc_admins_can_manage_role_permissions" ON mc_role_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name = 'super_admin')
);

-- User roles
ALTER TABLE mc_user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_roles" ON mc_user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mc_admins_can_manage_user_roles" ON mc_user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Payout records
ALTER TABLE mc_payout_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_users_can_view_own_payouts" ON mc_payout_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM mc_withdrawals WHERE id = withdrawal_id AND user_id = auth.uid())
);
CREATE POLICY "mc_admins_can_manage_payouts" ON mc_payout_records FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- Signal categories
ALTER TABLE mc_signal_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc_anyone_can_view_signal_categories" ON mc_signal_categories FOR SELECT USING (true);
CREATE POLICY "mc_admins_can_manage_signal_categories" ON mc_signal_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.mc_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.mc_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  -- Assign default 'user' role
  INSERT INTO public.mc_user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.mc_roles WHERE name = 'user';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER mc_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.mc_handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.mc_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mc_update_profiles_updated_at BEFORE UPDATE ON mc_profiles FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_investments_updated_at BEFORE UPDATE ON mc_investments FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_wallets_updated_at BEFORE UPDATE ON mc_wallets FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_support_tickets_updated_at BEFORE UPDATE ON mc_support_tickets FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_news_updated_at BEFORE UPDATE ON mc_news FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_investment_plans_updated_at BEFORE UPDATE ON mc_investment_plans FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();
CREATE TRIGGER mc_update_system_config_updated_at BEFORE UPDATE ON mc_system_config FOR EACH ROW EXECUTE FUNCTION mc_update_updated_at();

-- ============================================================
-- SEED DATA: Roles and default subscription plans
-- ============================================================

INSERT INTO mc_roles (name, description) VALUES
  ('super_admin', 'Full system access'),
  ('admin', 'Administrative access'),
  ('moderator', 'Content and user moderation'),
  ('support', 'Customer support access'),
  ('analyst', 'Signal and analysis access'),
  ('user', 'Default user role');

INSERT INTO mc_subscription_plans (name, description, price_usdt, duration_days, features, signal_access) VALUES
  ('Basic', 'Access to free signals and basic analytics', 0, 365, '["Free signals", "Basic analytics", "News access"]'::jsonb, 'free'),
  ('Pro', 'Access to premium signals and advanced analytics', 99, 30, '["Premium signals", "Advanced analytics", "Priority support", "Custom alerts"]'::jsonb, 'premium'),
  ('VIP', 'Full access to all features and exclusive content', 299, 30, '["All Pro features", "1-on-1 support", "Exclusive reports", "Early signal access", "Portfolio review"]'::jsonb, 'premium');

INSERT INTO mc_investment_plans (name, description, min_amount, max_amount, expected_return_pct, duration_days) VALUES
  ('Starter', 'Entry-level investment plan', 100, 999, 10, 30),
  ('Growth', 'Mid-tier investment plan', 1000, 9999, 10, 30),
  ('Professional', 'Professional investment plan', 10000, 49999, 10, 30),
  ('Elite', 'Elite investment plan with highest returns', 50000, NULL, 10, 30);

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE mc_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_investments;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_withdrawals;
