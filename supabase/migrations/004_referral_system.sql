-- Referral/Affiliate System
-- Run this SQL in Supabase SQL Editor to set up the referral system

-- Add referral_code column to mc_profiles
ALTER TABLE mc_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE mc_profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Create referral tracking table
CREATE TABLE IF NOT EXISTS mc_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  commission_earned DECIMAL(20,2) DEFAULT 0,
  first_deposit_amount DECIMAL(20,2),
  first_deposit_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, completed, paid
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_user_id)
);

-- Create referral commissions table
CREATE TABLE IF NOT EXISTS mc_referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES mc_referrals(id) ON DELETE CASCADE,
  deposit_id UUID REFERENCES mc_deposits(id) ON DELETE CASCADE,
  amount DECIMAL(20,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  status TEXT DEFAULT 'pending', -- pending, approved, paid
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE mc_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_referral_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mc_referrals
CREATE POLICY "Users can view their own referrals" ON mc_referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they are part of" ON mc_referrals
  FOR SELECT USING (auth.uid() = referred_user_id);

CREATE POLICY "Admins can view all referrals" ON mc_referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
  );

CREATE POLICY "System can insert referrals" ON mc_referrals
  FOR INSERT WITH CHECK (true);

-- RLS Policies for mc_referral_commissions
CREATE POLICY "Users can view their own commissions" ON mc_referral_commissions
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all commissions" ON mc_referral_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
  );

CREATE POLICY "System can insert commissions" ON mc_referral_commissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update commissions" ON mc_referral_commissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM mc_user_roles ur JOIN mc_roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('super_admin', 'admin'))
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mc_referrals_referrer ON mc_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_mc_referrals_referred ON mc_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_mc_referral_commissions_referrer ON mc_referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_mc_profiles_referral_code ON mc_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_mc_profiles_referred_by ON mc_profiles(referred_by);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION mc_generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code = 'MC' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    code = upper(code);
    SELECT EXISTS(SELECT 1 FROM mc_profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Function to handle referral on first deposit
CREATE OR REPLACE FUNCTION mc_handle_referral_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_uuid UUID;
  commission_amount DECIMAL(20,2);
  referral_record UUID;
BEGIN
  -- Only process when deposit is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Check if user was referred
    SELECT referred_by INTO referrer_uuid FROM mc_profiles WHERE id = NEW.user_id;
    
    IF referrer_uuid IS NOT NULL THEN
      -- Check if this is the first deposit (no previous approved deposits)
      IF NOT EXISTS (
        SELECT 1 FROM mc_deposits 
        WHERE user_id = NEW.user_id 
        AND status = 'approved' 
        AND id != NEW.id
      ) THEN
        -- Calculate 5% commission
        commission_amount := NEW.amount * 0.05;
        
        -- Update referral record
        UPDATE mc_referrals 
        SET first_deposit_amount = NEW.amount,
            first_deposit_at = NEW.created_at,
            commission_earned = commission_amount,
            status = 'completed'
        WHERE referred_user_id = NEW.user_id
        RETURNING id INTO referral_record;
        
        -- Create commission record
        INSERT INTO mc_referral_commissions (referrer_id, referral_id, deposit_id, amount, percentage, status)
        VALUES (referrer_uuid, referral_record, NEW.id, commission_amount, 5.00, 'approved');
        
        -- Add to referrer's wallet balance
        UPDATE mc_profiles 
        SET wallet_balance = wallet_balance + commission_amount
        WHERE id = referrer_uuid;
        
        -- Create transaction record for the commission
        INSERT INTO mc_transactions (user_id, type, amount, currency, status, description)
        VALUES (referrer_uuid, 'bonus', commission_amount, 'USDT', 'completed', 
                'Referral commission from first deposit');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral commission
DROP TRIGGER IF EXISTS trg_mc_referral_commission ON mc_deposits;
CREATE TRIGGER trg_mc_referral_commission
  AFTER UPDATE ON mc_deposits
  FOR EACH ROW
  EXECUTE FUNCTION mc_handle_referral_commission();

-- Add referral commission to transaction type enum if not exists
-- Note: We use 'bonus' type which already exists in the enum

-- Update the handle_new_user function to generate referral code and handle referrals
CREATE OR REPLACE FUNCTION public.mc_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate unique referral code for new user
  new_referral_code := mc_generate_referral_code();
  
  -- Check if user was referred (from metadata)
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM mc_profiles WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  
  INSERT INTO public.mc_profiles (id, full_name, avatar_url, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    new_referral_code,
    referrer_id
  );
  
  -- If referred, create referral record
  IF referrer_id IS NOT NULL THEN
    INSERT INTO public.mc_referrals (referrer_id, referred_user_id, referral_code, status)
    VALUES (referrer_id, NEW.id, NEW.raw_user_meta_data->>'referral_code', 'pending');
  END IF;
  
  -- Assign default 'user' role
  INSERT INTO public.mc_user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.mc_roles WHERE name = 'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
