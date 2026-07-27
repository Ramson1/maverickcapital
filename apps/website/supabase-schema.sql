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

-- Ensure columns exist on previously-created tables
alter table mc_profiles add column if not exists email text;
alter table mc_profiles add column if not exists avatar_url text;
alter table mc_profiles add column if not exists phone text;

-- Populate email for existing profiles from auth.users (requires SECURITY DEFINER to bypass auth.users RLS)
create or replace function _sync_profile_emails()
returns void as $$
begin
  update mc_profiles p
  set email = u.email
  from auth.users u
  where p.id = u.id and (p.email is null or p.email = '');
end;
$$ language plpgsql security definer;

select _sync_profile_emails();
drop function if exists _sync_profile_emails();

alter table mc_profiles add column if not exists phone text;
alter table mc_profiles add column if not exists withdrawal_address text;
alter table mc_profiles add column if not exists wallet_balance numeric(18,2) default 0;
alter table mc_profiles add column if not exists total_investment numeric(18,2) default 0;
alter table mc_profiles add column if not exists total_profit numeric(18,2) default 0;
alter table mc_profiles add column if not exists referral_code text unique;
alter table mc_profiles add column if not exists referred_by uuid references mc_profiles(id);
alter table mc_profiles add column if not exists kyc_status text default 'pending';
alter table mc_profiles add column if not exists account_status text default 'active';
alter table mc_profiles add column if not exists is_active boolean default true;

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

-- Seed default roles
insert into mc_roles (name, description) values
  ('user', 'Default user role'),
  ('admin', 'Administrator with full access'),
  ('super_admin', 'Super administrator with elevated privileges'),
  ('moderator', 'Moderator with limited admin access')
on conflict (name) do nothing;

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

alter table mc_deposits add column if not exists plan_name text;
alter table mc_deposits add column if not exists lock_period_months int;
alter table mc_deposits add column if not exists lock_end_date timestamptz;
alter table mc_deposits add column if not exists tx_hash text;
alter table mc_deposits add column if not exists proof_data text;
alter table mc_deposits add column if not exists destination_address text;
alter table mc_deposits add column if not exists reviewed_by uuid references auth.users(id);
alter table mc_deposits add column if not exists reviewed_at timestamptz;

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

alter table mc_withdrawals add column if not exists destination_address text;
alter table mc_withdrawals add column if not exists tx_hash text;
alter table mc_withdrawals add column if not exists reviewed_by uuid references auth.users(id);
alter table mc_withdrawals add column if not exists reviewed_at timestamptz;

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

alter table mc_investment_plans add column if not exists active boolean default true;

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

alter table mc_investments add column if not exists deposit_id uuid references mc_deposits(id);
alter table mc_investments add column if not exists current_value numeric(18,2) default 0;
alter table mc_investments add column if not exists roi_percent numeric(8,2) default 0;
alter table mc_investments add column if not exists end_date timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7b. KYC SUBMISSIONS — user identity verification documents
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists mc_kyc_submissions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  id_document_data      text,
  address_document_data text,
  selfie_document_data  text,
  id_document_name      text,
  address_document_name text,
  selfie_document_name  text,
  status                text not null default 'pending',  -- pending | approved | rejected
  reviewed_by           uuid references auth.users(id),
  reviewed_at           timestamptz,
  rejection_reason      text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table mc_kyc_submissions add column if not exists reviewed_by uuid references auth.users(id);
alter table mc_kyc_submissions add column if not exists reviewed_at timestamptz;
alter table mc_kyc_submissions add column if not exists rejection_reason text;
alter table mc_kyc_submissions add column if not exists id_document_data text;
alter table mc_kyc_submissions add column if not exists address_document_data text;
alter table mc_kyc_submissions add column if not exists selfie_document_data text;
alter table mc_kyc_submissions add column if not exists id_document_name text;
alter table mc_kyc_submissions add column if not exists address_document_name text;
alter table mc_kyc_submissions add column if not exists selfie_document_name text;
alter table mc_kyc_submissions add column if not exists status text not null default 'pending';
alter table mc_kyc_submissions add column if not exists created_at timestamptz default now();
alter table mc_kyc_submissions add column if not exists updated_at timestamptz default now();

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

alter table mc_signal_categories add column if not exists active boolean default true;

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
  payment_method text,
  network     text,
  status      text not null default 'pending_confirmation',
                               -- pending_confirmation | active | rejected | cancelled | expired
  start_date  timestamptz,
  end_date    timestamptz,
  reviewed_at timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table mc_subscriptions add column if not exists amount numeric(18,2) default 0;
alter table mc_subscriptions add column if not exists tx_hash text;
alter table mc_subscriptions add column if not exists proof_data text;
alter table mc_subscriptions add column if not exists payment_method text;
alter table mc_subscriptions add column if not exists network text;
alter table mc_subscriptions add column if not exists start_date timestamptz;
alter table mc_subscriptions add column if not exists end_date timestamptz;
alter table mc_subscriptions add column if not exists reviewed_at timestamptz;

-- Migrate plan_id from uuid to text (safe no-op if already text)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'mc_subscriptions' and column_name = 'plan_id' and data_type = 'uuid'
  ) then
    alter table mc_subscriptions add column plan_id_text text;
    update mc_subscriptions set plan_id_text = plan_id::text where plan_id is not null;
    alter table mc_subscriptions drop column plan_id;
    alter table mc_subscriptions rename column plan_id_text to plan_id;
    alter table mc_subscriptions alter column plan_id set not null;
  end if;
end $$;

-- Migrate status from enum to text (safe no-op if already text)
-- First drop dependent policies that reference this column
select _drop_policy('mc_signals', 'mc_subscribers_can_view_premium_signals');

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'mc_subscriptions' and column_name = 'status' and data_type = 'USER-DEFINED'
  ) then
    alter table mc_subscriptions add column status_text text default 'pending_confirmation';
    update mc_subscriptions set status_text = status::text;
    alter table mc_subscriptions drop column status;
    alter table mc_subscriptions rename column status_text to status;
    alter table mc_subscriptions alter column status set not null;
    alter table mc_subscriptions alter column status set default 'pending_confirmation';
  end if;
end $$;

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

alter table mc_wallets add column if not exists active boolean default true;

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

alter table mc_cms add column if not exists active boolean default true;

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
    where ur.user_id = uid and r.name in ('admin', 'super_admin', 'moderator')
  );
$$ language sql security definer stable;

-- Get total capital raised (sum of approved deposits) — bypasses RLS
create or replace function get_total_capital_raised()
returns numeric as $$
  select coalesce(sum(amount), 0) from mc_deposits where status = 'approved';
$$ language sql security definer stable;

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═════════════════════════════════════════════════════════════════════════════

-- Helper: safely drop a policy (idempotent re-runs)
create or replace function _drop_policy(p_table text, p_policy text)
returns void as $$
begin
  execute format('drop policy %I on %I', p_policy, p_table);
exception when undefined_object then null;
end;
$$ language plpgsql;

-- Enable RLS on all tables
alter table mc_profiles enable row level security;
alter table mc_roles enable row level security;
alter table mc_user_roles enable row level security;
alter table mc_settings enable row level security;
alter table mc_deposits enable row level security;
alter table mc_withdrawals enable row level security;
alter table mc_investment_plans enable row level security;
alter table mc_investments enable row level security;
alter table mc_kyc_submissions enable row level security;
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
select _drop_policy('mc_profiles', 'Users can view own profile');
create policy "Users can view own profile"
  on mc_profiles for select using (auth.uid() = id or is_admin(auth.uid()));

select _drop_policy('mc_profiles', 'Users can update own profile');
create policy "Users can update own profile"
  on mc_profiles for update using (auth.uid() = id or is_admin(auth.uid()));

select _drop_policy('mc_profiles', 'Admins can insert profiles');
create policy "Admins can insert profiles"
  on mc_profiles for insert with check (is_admin(auth.uid()));

-- ── Settings: everyone can read, only admins can write ──
select _drop_policy('mc_settings', 'Anyone can read settings');
create policy "Anyone can read settings"
  on mc_settings for select using (true);

select _drop_policy('mc_settings', 'Admins can manage settings');
select _drop_policy('mc_settings', 'Admins can insert settings');
select _drop_policy('mc_settings', 'Admins can update settings');
select _drop_policy('mc_settings', 'Admins can delete settings');
create policy "Admins can manage settings"
  on mc_settings for all
  using (is_admin(auth.uid()));

-- ── Deposits: users read own, admins read/update all ──
select _drop_policy('mc_deposits', 'Users can view own deposits');
create policy "Users can view own deposits"
  on mc_deposits for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_deposits', 'Users can insert own deposits');
create policy "Users can insert own deposits"
  on mc_deposits for insert with check (auth.uid() = user_id);

select _drop_policy('mc_deposits', 'Admins can manage deposits');
select _drop_policy('mc_deposits', 'Admins can insert deposits');
select _drop_policy('mc_deposits', 'Admins can update deposits');
select _drop_policy('mc_deposits', 'Admins can delete deposits');
create policy "Admins can manage deposits"
  on mc_deposits for all using (is_admin(auth.uid()));

-- ── Withdrawals: users read own, admins read/update all ──
select _drop_policy('mc_withdrawals', 'Users can view own withdrawals');
create policy "Users can view own withdrawals"
  on mc_withdrawals for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_withdrawals', 'Users can insert own withdrawals');
create policy "Users can insert own withdrawals"
  on mc_withdrawals for insert with check (auth.uid() = user_id);

select _drop_policy('mc_withdrawals', 'Admins can manage withdrawals');
select _drop_policy('mc_withdrawals', 'Admins can insert withdrawals');
select _drop_policy('mc_withdrawals', 'Admins can update withdrawals');
select _drop_policy('mc_withdrawals', 'Admins can delete withdrawals');
create policy "Admins can manage withdrawals"
  on mc_withdrawals for all using (is_admin(auth.uid()));

-- ── Investments: users read own, admins read/update all ──
select _drop_policy('mc_investments', 'Users can view own investments');
create policy "Users can view own investments"
  on mc_investments for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_investments', 'Admins can manage investments');
select _drop_policy('mc_investments', 'Admins can insert investments');
select _drop_policy('mc_investments', 'Admins can update investments');
select _drop_policy('mc_investments', 'Admins can delete investments');
create policy "Admins can manage investments"
  on mc_investments for all using (is_admin(auth.uid()));

-- ── KYC Submissions: users read/insert own, admins manage all ──
select _drop_policy('mc_kyc_submissions', 'Users can view own KYC submissions');
create policy "Users can view own KYC submissions"
  on mc_kyc_submissions for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_kyc_submissions', 'Users can insert own KYC submissions');
create policy "Users can insert own KYC submissions"
  on mc_kyc_submissions for insert with check (auth.uid() = user_id);

select _drop_policy('mc_kyc_submissions', 'Users can delete own pending KYC');
create policy "Users can delete own pending KYC"
  on mc_kyc_submissions for delete using (auth.uid() = user_id and status = 'pending');

select _drop_policy('mc_kyc_submissions', 'Admins can manage KYC submissions');
create policy "Admins can manage KYC submissions"
  on mc_kyc_submissions for all using (is_admin(auth.uid()));

-- ── Signals: everyone can read active, admins full access ──
select _drop_policy('mc_signals', 'Anyone can read active signals');
create policy "Anyone can read active signals"
  on mc_signals for select using (status = 'active' or is_admin(auth.uid()));

select _drop_policy('mc_signals', 'Admins can manage signals');
select _drop_policy('mc_signals', 'Admins can insert signals');
select _drop_policy('mc_signals', 'Admins can update signals');
select _drop_policy('mc_signals', 'Admins can delete signals');
create policy "Admins can manage signals"
  on mc_signals for all using (is_admin(auth.uid()));

-- ── Signal categories: everyone can read ──
select _drop_policy('mc_signal_categories', 'Anyone can read signal categories');
create policy "Anyone can read signal categories"
  on mc_signal_categories for select using (true);

-- ── Subscription plans: everyone can read ──
select _drop_policy('mc_subscription_plans', 'Anyone can read subscription plans');
create policy "Anyone can read subscription plans"
  on mc_subscription_plans for select using (true);

-- ── Subscriptions: users read own, admins read/update all ──
select _drop_policy('mc_subscriptions', 'Users can view own subscriptions');
create policy "Users can view own subscriptions"
  on mc_subscriptions for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_subscriptions', 'Users can insert own subscriptions');
create policy "Users can insert own subscriptions"
  on mc_subscriptions for insert with check (auth.uid() = user_id);

select _drop_policy('mc_subscriptions', 'Admins can manage subscriptions');
select _drop_policy('mc_subscriptions', 'Admins can insert subscriptions');
select _drop_policy('mc_subscriptions', 'Admins can update subscriptions');
select _drop_policy('mc_subscriptions', 'Admins can delete subscriptions');
create policy "Admins can manage subscriptions"
  on mc_subscriptions for all using (is_admin(auth.uid()));

-- ── News: everyone can read published, admins full access ──
select _drop_policy('mc_news', 'Anyone can read published news');
create policy "Anyone can read published news"
  on mc_news for select using (published_at is not null or is_admin(auth.uid()));

select _drop_policy('mc_news', 'Admins can manage news');
select _drop_policy('mc_news', 'Admins can insert news');
select _drop_policy('mc_news', 'Admins can update news');
select _drop_policy('mc_news', 'Admins can delete news');
create policy "Admins can manage news"
  on mc_news for all using (is_admin(auth.uid()));

-- ── Notifications: users read own, admins full access ──
select _drop_policy('mc_notifications', 'Users can view own notifications');
create policy "Users can view own notifications"
  on mc_notifications for select using (auth.uid() = user_id or user_id is null or is_admin(auth.uid()));

select _drop_policy('mc_notifications', 'Users can update own notifications');
create policy "Users can update own notifications"
  on mc_notifications for update using (auth.uid() = user_id);

select _drop_policy('mc_notifications', 'Admins can manage notifications');
select _drop_policy('mc_notifications', 'Admins can view notifications');
select _drop_policy('mc_notifications', 'Admins can insert notifications');
select _drop_policy('mc_notifications', 'Admins can update notifications');
select _drop_policy('mc_notifications', 'Admins can delete notifications');
create policy "Admins can view notifications"
  on mc_notifications for select using (is_admin(auth.uid()));

create policy "Admins can insert notifications"
  on mc_notifications for insert with check (is_admin(auth.uid()));

create policy "Admins can update notifications"
  on mc_notifications for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "Admins can delete notifications"
  on mc_notifications for delete using (is_admin(auth.uid()));

-- ── Support tickets: users read own, admins read all ──
select _drop_policy('mc_support_tickets', 'Users can view own support tickets');
create policy "Users can view own support tickets"
  on mc_support_tickets for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_support_tickets', 'Users can create support tickets');
create policy "Users can create support tickets"
  on mc_support_tickets for insert with check (auth.uid() = user_id);

select _drop_policy('mc_support_tickets', 'Admins can manage support tickets');
select _drop_policy('mc_support_tickets', 'Admins can insert support tickets');
select _drop_policy('mc_support_tickets', 'Admins can update support tickets');
select _drop_policy('mc_support_tickets', 'Admins can delete support tickets');
create policy "Admins can manage support tickets"
  on mc_support_tickets for all using (is_admin(auth.uid()));

-- ── Support messages: users read own ticket messages, admins read all ──
select _drop_policy('mc_support_messages', 'Users can view messages on own tickets');
create policy "Users can view messages on own tickets"
  on mc_support_messages for select
  using (is_admin(auth.uid()) or exists (
    select 1 from mc_support_tickets t where t.id = ticket_id and t.user_id = auth.uid()
  ));

select _drop_policy('mc_support_messages', 'Users can send messages on own tickets');
create policy "Users can send messages on own tickets"
  on mc_support_messages for insert
  with check (auth.uid() = sender_id and exists (
    select 1 from mc_support_tickets t where t.id = ticket_id and t.user_id = auth.uid()
  ));

select _drop_policy('mc_support_messages', 'Admins can manage support messages');
select _drop_policy('mc_support_messages', 'Admins can insert support messages');
select _drop_policy('mc_support_messages', 'Admins can update support messages');
select _drop_policy('mc_support_messages', 'Admins can delete support messages');
create policy "Admins can manage support messages"
  on mc_support_messages for all using (is_admin(auth.uid()));

-- ── Wallets: everyone can read active, admins full access ──
select _drop_policy('mc_wallets', 'Anyone can read active wallets');
create policy "Anyone can read active wallets"
  on mc_wallets for select using (active = true or is_admin(auth.uid()));

select _drop_policy('mc_wallets', 'Admins can manage wallets');
select _drop_policy('mc_wallets', 'Admins can insert wallets');
select _drop_policy('mc_wallets', 'Admins can update wallets');
select _drop_policy('mc_wallets', 'Admins can delete wallets');
create policy "Admins can manage wallets"
  on mc_wallets for all using (is_admin(auth.uid()));

-- ── CMS: everyone can read active, admins full access ──
select _drop_policy('mc_cms', 'Anyone can read active CMS items');
create policy "Anyone can read active CMS items"
  on mc_cms for select using (active = true or is_admin(auth.uid()));

select _drop_policy('mc_cms', 'Admins can manage CMS items');
select _drop_policy('mc_cms', 'Admins can insert CMS items');
select _drop_policy('mc_cms', 'Admins can update CMS items');
select _drop_policy('mc_cms', 'Admins can delete CMS items');
create policy "Admins can manage CMS items"
  on mc_cms for all using (is_admin(auth.uid()));

-- ── Referrals: users read own, admins read all ──
select _drop_policy('mc_referrals', 'Users can view own referrals');
create policy "Users can view own referrals"
  on mc_referrals for select using (auth.uid() = referrer_id or is_admin(auth.uid()));

select _drop_policy('mc_referrals', 'Admins can manage referrals');
select _drop_policy('mc_referrals', 'Admins can insert referrals');
select _drop_policy('mc_referrals', 'Admins can update referrals');
select _drop_policy('mc_referrals', 'Admins can delete referrals');
create policy "Admins can manage referrals"
  on mc_referrals for all using (is_admin(auth.uid()));

-- ── Audit logs: admins only ──
select _drop_policy('mc_audit_logs', 'Admins can read audit logs');
create policy "Admins can read audit logs"
  on mc_audit_logs for select
  using (is_admin(auth.uid()));

select _drop_policy('mc_audit_logs', 'Admins can insert audit logs');
create policy "Admins can insert audit logs"
  on mc_audit_logs for insert
  with check (is_admin(auth.uid()));

-- ── Roles: everyone can read ──
select _drop_policy('mc_roles', 'Anyone can read roles');
create policy "Anyone can read roles"
  on mc_roles for select using (true);

-- ── User roles: users read own, admins manage all ──
select _drop_policy('mc_user_roles', 'Users can view own roles');
create policy "Users can view own roles"
  on mc_user_roles for select using (auth.uid() = user_id or is_admin(auth.uid()));

select _drop_policy('mc_user_roles', 'Admins can manage user roles');
select _drop_policy('mc_user_roles', 'Admins can insert user roles');
select _drop_policy('mc_user_roles', 'Admins can update user roles');
select _drop_policy('mc_user_roles', 'Admins can delete user roles');
create policy "Admins can manage user roles"
  on mc_user_roles for all using (is_admin(auth.uid()));

-- ── Investment plans: everyone can read active ──
select _drop_policy('mc_investment_plans', 'Anyone can read active investment plans');
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
