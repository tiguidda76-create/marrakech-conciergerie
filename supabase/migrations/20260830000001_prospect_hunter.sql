-- ==============================================================================
-- MIGRATION: 20260830000001_prospect_hunter.sql
-- Table Prospect Leads pour l'Agent IA Prospect Hunter & CRM Prospection
-- Conciergerie Privée Marrakech (Hassan Tiguidda)
-- ==============================================================================

CREATE TYPE outreach_status_type AS ENUM ('nouveau', 'contacte', 'rendez_vous', 'mandat_signe', 'archive');

CREATE TABLE IF NOT EXISTS prospect_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  zone VARCHAR(50) NOT NULL,
  property_type VARCHAR(50) NOT NULL DEFAULT 'riad',
  bedrooms INT NOT NULL DEFAULT 1,
  nightly_price NUMERIC(10,2) NOT NULL,
  estimated_adr NUMERIC(10,2) NOT NULL,
  estimated_gain_annual_mad NUMERIC(12,2) NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.75,
  reviews_count INT DEFAULT 0,
  platform VARCHAR(30) DEFAULT 'airbnb',
  url TEXT NOT NULL,
  owner_name VARCHAR(150),
  owner_contact VARCHAR(100),
  outreach_status outreach_status_type DEFAULT 'nouveau',
  opportunity_score INT NOT NULL CHECK (opportunity_score BETWEEN 0 AND 100),
  audit_notes TEXT[] DEFAULT '{}',
  suggested_message_whatsapp TEXT,
  suggested_message_email TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_prospect_url UNIQUE(url)
);

CREATE INDEX IF NOT EXISTS idx_prospect_leads_zone ON prospect_leads(zone, outreach_status);
CREATE INDEX IF NOT EXISTS idx_prospect_leads_score ON prospect_leads(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_leads_gain ON prospect_leads(estimated_gain_annual_mad DESC);

ALTER TABLE prospect_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read prospect_leads" ON prospect_leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated manage prospect_leads" ON prospect_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full prospect_leads" ON prospect_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);
