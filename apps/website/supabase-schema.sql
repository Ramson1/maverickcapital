-- ═══════════════════════════════════════════════════════════════════════════════
-- Maverick Capital — Full Database Schema (Supabase / PostgreSQL)
-- Run this file in the Supabase SQL Editor to create all required tables.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES — extends auth.users with extra user fields
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  avatar_url    text,
  withdrawal_address text,
  wallet_balance numeric(18,2) default 0,
  total_investment numeric(18,2) default 0,
  total_profit  numeric(18,2) default 0,
  referral_code text unique,
  referred_by   uuid references mc_profiles(id),
  kyc_status    text default 'pending',  -- pending | approved | rejected
  account_status text default 'active',  -- active | suspended | blocked | pending_verification
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup with referral code handling
create or replace function handle_new_user()
returns trigger as $$
declare
  v_referral_code text;
  v_referrer_id uuid;
  v_ref_code_input text;
begin
  -- Generate unique referral code for the new user (MC + 8 alphanumeric chars)
  v_referral_code := 'MC' || upper(substr(md5(new.id::text || random()::text), 1, 8));

  -- Check if user was referred by someone
  v_ref_code_input := new.raw_user_meta_data->>'referral_code';
  if v_ref_code_input is not null and v_ref_code_input <> '' then
    select id into v_referrer_id from mc_profiles where referral_code = v_ref_code_input limit 1;
  end if;

  insert into mc_profiles (id, full_name, email, avatar_url, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    v_referral_code,
    v_referrer_id
  );

  -- Create referral record if user was referred
  if v_referrer_id is not null then
    insert into mc_referrals (referrer_id, referred_id, status)
    values (v_referrer_id, new.id, 'pending');
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ROLES & USER_ROLES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists mc_user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role_id    uuid not null references mc_roles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, role_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SETTINGS — key-value store for global platform config
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      text not null default '',
  updated_at timestamptz default now()
);

-- Seed default settings
insert into mc_settings (key, value) values
  ('platform_name',                'Maverick Capital'),
  ('platform_hard_cap',            '1000000'),
  ('min_deposit',                  '50'),
  ('min_withdrawal',               '10'),
  ('deposit_wallet_address',       ''),
  ('deposit_network',              'TRC20 (Tron)'),
  ('deposit_currency',             'USDT'),
  ('subscription_wallet_address',  ''),
  ('subscription_network',         'TRC20 (Tron)'),
  ('subscription_currency',        'USDT')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DEPOSITS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_deposits (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  amount           numeric(18,2) not null,
  currency         text not null default 'USDT',
  network          text not null default 'TRC20 (Tron)',
  plan_name        text,
  lock_period_months int,
  lock_end_date    timestamptz,
  tx_hash          text,
  proof_data       text,           -- base64 data URL of proof image/PDF
  destination_address text,
  status           text not null default 'pending',  -- pending | approved | rejected
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  submitted_at     timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. WITHDRAWALS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_withdrawals (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  amount              numeric(18,2) not null,
  currency            text not null default 'USDT',
  network             text not null default 'TRC20 (Tron)',
  destination_address text,
  tx_hash             text,
  status              text not null default 'pending',  -- pending | approved | rejected | completed
  reviewed_by         uuid references auth.users(id),
  reviewed_at         timestamptz,
  submitted_at        timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. INVESTMENT PLANS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_investment_plans (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  min_amount        numeric(18,2) not null default 0,
  max_amount        numeric(18,2),
  roi_percent       numeric(8,2) not null default 0,
  lock_period_months int not null default 1,
  active            boolean default true,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. INVESTMENTS (user's active investment positions)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_investments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_id       uuid references mc_investment_plans(id),
  deposit_id    uuid references mc_deposits(id),
  amount        numeric(18,2) not null,
  current_value numeric(18,2) default 0,
  roi_percent   numeric(8,2) default 0,
  status        text not null default 'pending',  -- pending | active | completed | cancelled
  start_date    timestamptz default now(),
  end_date      timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SIGNAL CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_signal_categories (
  id      uuid primary key default gen_random_uuid(),
  name    text unique not null,
  slug    text unique not null,
  active  boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SIGNALS — trading signal posts
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_signals (
  id              uuid primary key default gen_random_uuid(),
  pair            text not null,
  entry_price     numeric(18,8) not null,
  stop_loss       numeric(18,8),
  take_profit     numeric(18,8)[],
  risk_level      text not null default 'medium',  -- low | medium | high
  analysis        text,
  target_audience text not null default 'all',      -- all | premium | free
  status          text not null default 'active',   -- active | closed | pending
  category_id     uuid references mc_signal_categories(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. SUBSCRIPTION PLANS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price_usdt    numeric(18,2) not null default 0,
  duration_days int not null default 30,
  features      text[] default '{}',
  signal_access text not null default 'none',  -- none | basic | premium | all
  active        boolean default true,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. SUBSCRIPTIONS — user subscription records
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     text not null,
  amount      numeric(18,2) default 0,
  tx_hash     text,
  proof_data  text,              -- base64 data URL of proof image/PDF
  status      text not null default 'pending_confirmation',
                               -- pending_confirmation | active | rejected | cancelled | expired
  start_date  timestamptz,
  end_date    timestamptz,
  reviewed_at timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. NEWS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  category     text default 'Announcement',
  image_url    text,
  is_pinned    boolean default false,
  published_at timestamptz,
  author_id    uuid references auth.users(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,  -- null = broadcast to all
  title      text not null,
  body       text,
  type       text not null default 'info',  -- info | warning | success | error
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. SUPPORT TICKETS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject    text not null,
  status     text not null default 'open',  -- open | in_progress | resolved | closed
  priority   text not null default 'medium', -- low | medium | high | urgent
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. SUPPORT MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_support_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references mc_support_tickets(id) on delete cascade,
  sender_id  uuid references auth.users(id),
  body       text not null,
  deleted    boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. WALLET ADDRESSES — admin-managed wallet list
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_wallets (
  id         uuid primary key default gen_random_uuid(),
  network    text not null,
  label      text not null,
  address    text not null,
  active     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. CMS — content management entries
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_cms (
  id         uuid primary key default gen_random_uuid(),
  page_key   text not null,
  title      text not null,
  content    text,
  type       text not null default 'banner',  -- banner | faq | terms | about | contact | announcement
  sort_order int default 0,
  active     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. REFERRALS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_referrals (
  id                    uuid primary key default gen_random_uuid(),
  referrer_id           uuid not null references auth.users(id) on delete cascade,
  referred_id           uuid references auth.users(id) on delete set null,
  commission_earned     numeric(18,2) default 0,
  first_deposit_amount  numeric(18,2),
  first_deposit_at      timestamptz,
  status                text not null default 'pending',  -- pending | completed | rejected
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. AUDIT LOGS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- ADMIN HELPER — SECURITY DEFINER to prevent RLS recursion
-- ═════════════════════════════════════════════════════════════════════════════
create or replace function is_admin(uid uuid)
returns boolean as $$
  select exists (
    select 1 from mc_user_roles ur
    join mc_roles r on r.id = ur.role_id
    where ur.user_id = uid and r.name = 'admin'
  );
$$ language sql security definer stable;

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table mc_profiles enable row level security;
alter table mc_roles enable row level security;
alter table mc_user_roles enable row level security;
alter table mc_settings enable row level security;
alter table mc_deposits enable row level security;
alter table mc_withdrawals enable row level security;
alter table mc_investment_plans enable row level security;
alter table mc_investments enable row level security;
alter table mc_signal_categories enable row level security;
alter table mc_signals enable row level security;
alter table mc_subscription_plans enable row level security;
alter table mc_subscriptions enable row level security;
alter table mc_news enable row level security;
alter table mc_notifications enable row level security;
alter table mc_support_tickets enable row level security;
alter table mc_support_messages enable row level security;
alter table mc_wallets enable row level security;
alter table mc_cms enable row level security;
alter table mc_referrals enable row level security;
alter table mc_audit_logs enable row level security;

-- ── Profiles: users read/update own, admins read/update all ──
create policy "Users can view own profile"
  on mc_profiles for select using (auth.uid() = id or is_admin(auth.uid()));

create policy "Users can update own profile"
  on mc_profiles for update using (auth.uid() = id or is_admin(auth.uid()));

create policy "Admins can insert profiles"
  on mc_profiles for insert with check (is_admin(auth.uid()));

-- ── Settings: everyone can read, only admins can write ──
create policy "Anyone can read settings"
  on mc_settings for select using (true);

create policy "Admins can manage settings"
  on mc_settings for all
  using (is_admin(auth.uid()));

-- ── Deposits: users read own, admins read/update all ──
create policy "Users can view own deposits"
  on mc_deposits for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Users can insert own deposits"
  on mc_deposits for insert with check (auth.uid() = user_id);

create policy "Admins can manage deposits"
  on mc_deposits for all using (is_admin(auth.uid()));

-- ── Withdrawals: users read own, admins read/update all ──
create policy "Users can view own withdrawals"
  on mc_withdrawals for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Users can insert own withdrawals"
  on mc_withdrawals for insert with check (auth.uid() = user_id);

create policy "Admins can manage withdrawals"
  on mc_withdrawals for all using (is_admin(auth.uid()));

-- ── Investments: users read own, admins read/update all ──
create policy "Users can view own investments"
  on mc_investments for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Admins can manage investments"
  on mc_investments for all using (is_admin(auth.uid()));

-- ── Signals: everyone can read active, admins full access ──
create policy "Anyone can read active signals"
  on mc_signals for select using (status = 'active' or is_admin(auth.uid()));

create policy "Admins can manage signals"
  on mc_signals for all using (is_admin(auth.uid()));

-- ── Signal categories: everyone can read ──
create policy "Anyone can read signal categories"
  on mc_signal_categories for select using (true);

-- ── Subscription plans: everyone can read ──
create policy "Anyone can read subscription plans"
  on mc_subscription_plans for select using (true);

-- ── Subscriptions: users read own, admins read/update all ──
create policy "Users can view own subscriptions"
  on mc_subscriptions for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Users can insert own subscriptions"
  on mc_subscriptions for insert with check (auth.uid() = user_id);

create policy "Admins can manage subscriptions"
  on mc_subscriptions for all using (is_admin(auth.uid()));

-- ── News: everyone can read published, admins full access ──
create policy "Anyone can read published news"
  on mc_news for select using (published_at is not null or is_admin(auth.uid()));

create policy "Admins can manage news"
  on mc_news for all using (is_admin(auth.uid()));

-- ── Notifications: users read own, admins full access ──
create policy "Users can view own notifications"
  on mc_notifications for select using (auth.uid() = user_id or user_id is null or is_admin(auth.uid()));

create policy "Users can update own notifications"
  on mc_notifications for update using (auth.uid() = user_id);

create policy "Admins can manage notifications"
  on mc_notifications for all using (is_admin(auth.uid()));

-- ── Support tickets: users read own, admins read all ──
create policy "Users can view own support tickets"
  on mc_support_tickets for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Users can create support tickets"
  on mc_support_tickets for insert with check (auth.uid() = user_id);

create policy "Admins can manage support tickets"
  on mc_support_tickets for all using (is_admin(auth.uid()));

-- ── Support messages: users read own ticket messages, admins read all ──
create policy "Users can view messages on own tickets"
  on mc_support_messages for select
  using (is_admin(auth.uid()) or exists (
    select 1 from mc_support_tickets t where t.id = ticket_id and t.user_id = auth.uid()
  ));

create policy "Users can send messages on own tickets"
  on mc_support_messages for insert
  with check (auth.uid() = sender_id and exists (
    select 1 from mc_support_tickets t where t.id = ticket_id and t.user_id = auth.uid()
  ));

create policy "Admins can manage support messages"
  on mc_support_messages for all using (is_admin(auth.uid()));

-- ── Wallets: everyone can read active, admins full access ──
create policy "Anyone can read active wallets"
  on mc_wallets for select using (active = true or is_admin(auth.uid()));

create policy "Admins can manage wallets"
  on mc_wallets for all using (is_admin(auth.uid()));

-- ── CMS: everyone can read active, admins full access ──
create policy "Anyone can read active CMS items"
  on mc_cms for select using (active = true or is_admin(auth.uid()));

create policy "Admins can manage CMS items"
  on mc_cms for all using (is_admin(auth.uid()));

-- ── Referrals: users read own, admins read all ──
create policy "Users can view own referrals"
  on mc_referrals for select using (auth.uid() = referrer_id or is_admin(auth.uid()));

create policy "Admins can manage referrals"
  on mc_referrals for all using (is_admin(auth.uid()));

-- ── Audit logs: admins only ──
create policy "Admins can read audit logs"
  on mc_audit_logs for select
  using (is_admin(auth.uid()));

create policy "Admins can insert audit logs"
  on mc_audit_logs for insert
  with check (is_admin(auth.uid()));

-- ── Roles: everyone can read ──
create policy "Anyone can read roles"
  on mc_roles for select using (true);

-- ── User roles: users read own, admins manage all ──
create policy "Users can view own roles"
  on mc_user_roles for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Admins can manage user roles"
  on mc_user_roles for all using (is_admin(auth.uid()));

-- ── Investment plans: everyone can read active ──
create policy "Anyone can read active investment plans"
  on mc_investment_plans for select using (active = true);

-- ═════════════════════════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═════════════════════════════════════════════════════════════════════════════

create index if not exists idx_deposits_user on mc_deposits(user_id);
create index if not exists idx_deposits_status on mc_deposits(status);
create index if not exists idx_withdrawals_user on mc_withdrawals(user_id);
create index if not exists idx_withdrawals_status on mc_withdrawals(status);
create index if not exists idx_investments_user on mc_investments(user_id);
create index if not exists idx_investments_status on mc_investments(status);
create index if not exists idx_subscriptions_user on mc_subscriptions(user_id);
create index if not exists idx_subscriptions_status on mc_subscriptions(status);
create index if not exists idx_notifications_user on mc_notifications(user_id);
create index if not exists idx_notifications_unread on mc_notifications(user_id, is_read) where is_read = false;
create index if not exists idx_support_tickets_user on mc_support_tickets(user_id);
create index if not exists idx_support_tickets_status on mc_support_tickets(status);
create index if not exists idx_support_messages_ticket on mc_support_messages(ticket_id);
create index if not exists idx_audit_logs_entity on mc_audit_logs(entity_type, entity_id);
create index if not exists idx_referrals_referrer on mc_referrals(referrer_id);
create index if not exists idx_signals_status on mc_signals(status);
create index if not exists idx_news_published on mc_news(published_at desc);
