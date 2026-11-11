-- ==============================================================================
-- CareLoop ASHA Platform - Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Children Table
CREATE TABLE IF NOT EXISTS public.children (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    dob DATE,
    gender TEXT NOT NULL,
    address TEXT NOT NULL,
    guardian_name TEXT NOT NULL,
    guardian_relation TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    asha_worker TEXT NOT NULL,
    assigned_facility TEXT DEFAULT 'Local PHC / Sub-Centre',
    current_stage INTEGER NOT NULL DEFAULT 1,
    status_text TEXT NOT NULL DEFAULT 'Registered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Caregiver Consent Table
CREATE TABLE IF NOT EXISTS public.caregiver_consent (
    id TEXT PRIMARY KEY DEFAULT ('CONS-' || substr(md5(random()::text), 1, 8)),
    child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    guardian_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    consent_screening BOOLEAN NOT NULL DEFAULT true,
    consent_data_sharing BOOLEAN NOT NULL DEFAULT true,
    consent_deic_referral BOOLEAN NOT NULL DEFAULT true,
    consent_followup BOOLEAN NOT NULL DEFAULT true,
    signature_type TEXT NOT NULL DEFAULT 'Digital Thumb / Verbal Consent',
    verified_mobile TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'Active'
);

-- 4. Dedicated DEIC Referrals Table
CREATE TABLE IF NOT EXISTS public.deic_referrals (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    referred_by TEXT NOT NULL,
    referred_by_role TEXT NOT NULL DEFAULT 'ASHA Community Health Worker',
    deic_center TEXT NOT NULL,
    target_specialties TEXT,
    primary_concerns TEXT NOT NULL,
    detailed_referral_reason TEXT NOT NULL,
    functional_impact TEXT,
    onset_duration TEXT,
    urgency TEXT NOT NULL DEFAULT 'Medium',
    transit_assistance_requested BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Submitted to DEIC',
    scheduled_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Developmental Observations & Nutrition Table
CREATE TABLE IF NOT EXISTS public.observations (
    id TEXT PRIMARY KEY DEFAULT ('OBS-' || substr(md5(random()::text), 1, 8)),
    child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    author TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ASHA Facilitator',
    height_cm NUMERIC,
    weight_kg NUMERIC,
    muac_cm NUMERIC,
    meals_note TEXT,
    speech_obs TEXT,
    sound_obs TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Follow-up Visits Table
CREATE TABLE IF NOT EXISTS public.followups (
    id TEXT PRIMARY KEY DEFAULT ('FOL-' || substr(md5(random()::text), 1, 8)),
    child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    contact_status TEXT NOT NULL,
    readiness TEXT NOT NULL,
    notes TEXT,
    barrier TEXT,
    assistance_provided TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- Enables public read/write access for anonymous ASHA field workers
-- (You can restrict these policies later when Supabase Auth is added)
-- ==============================================================================

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deic_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

-- Allow Anon/Public SELECT & INSERT on all tables
DO $$
BEGIN
    -- Children
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Public read access for children') THEN
        CREATE POLICY "Public read access for children" ON public.children FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Public insert access for children') THEN
        CREATE POLICY "Public insert access for children" ON public.children FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Public update access for children') THEN
        CREATE POLICY "Public update access for children" ON public.children FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Public delete access for children') THEN
        CREATE POLICY "Public delete access for children" ON public.children FOR DELETE USING (true);
    END IF;

    -- Caregiver Consent
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'caregiver_consent' AND policyname = 'Public read consent') THEN
        CREATE POLICY "Public read consent" ON public.caregiver_consent FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'caregiver_consent' AND policyname = 'Public insert consent') THEN
        CREATE POLICY "Public insert consent" ON public.caregiver_consent FOR INSERT WITH CHECK (true);
    END IF;

    -- DEIC Referrals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deic_referrals' AND policyname = 'Public read referrals') THEN
        CREATE POLICY "Public read referrals" ON public.deic_referrals FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deic_referrals' AND policyname = 'Public insert referrals') THEN
        CREATE POLICY "Public insert referrals" ON public.deic_referrals FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deic_referrals' AND policyname = 'Public update referrals') THEN
        CREATE POLICY "Public update referrals" ON public.deic_referrals FOR UPDATE USING (true);
    END IF;

    -- Observations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'observations' AND policyname = 'Public read observations') THEN
        CREATE POLICY "Public read observations" ON public.observations FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'observations' AND policyname = 'Public insert observations') THEN
        CREATE POLICY "Public insert observations" ON public.observations FOR INSERT WITH CHECK (true);
    END IF;

    -- Followups
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followups' AND policyname = 'Public read followups') THEN
        CREATE POLICY "Public read followups" ON public.followups FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followups' AND policyname = 'Public insert followups') THEN
        CREATE POLICY "Public insert followups" ON public.followups FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Optional: Enable Realtime for children and referrals
ALTER PUBLICATION supabase_realtime ADD TABLE public.children;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deic_referrals;
