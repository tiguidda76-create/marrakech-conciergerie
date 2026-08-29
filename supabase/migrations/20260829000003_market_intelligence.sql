-- ==============================================================================
-- MIGRATION: 20260829000003_market_intelligence.sql
-- Module Market Intelligence & Dynamic Pricing (Alternative AirDNA Open-Source)
-- Conciergerie Privée Marrakech
-- ==============================================================================

CREATE TABLE IF NOT EXISTS market_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone VARCHAR(50) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  avg_daily_rate NUMERIC(10,2) NOT NULL,
  occupancy_rate NUMERIC(5,2) NOT NULL,
  revpar NUMERIC(10,2) GENERATED ALWAYS AS (avg_daily_rate * (occupancy_rate / 100.0)) STORED,
  active_listings_count INT NOT NULL DEFAULT 0,
  seasonality_factor NUMERIC(4,2) DEFAULT 1.0,
  source VARCHAR(50) DEFAULT 'inside_airbnb',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_market_benchmark UNIQUE(zone, property_type, bedrooms)
);

CREATE TABLE IF NOT EXISTS competitor_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) NOT NULL,
  platform VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  zone VARCHAR(50) NOT NULL,
  property_type VARCHAR(50),
  bedrooms INT DEFAULT 1,
  nightly_price NUMERIC(10,2) NOT NULL,
  cleaning_fee NUMERIC(10,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 4.80,
  reviews_count INT DEFAULT 0,
  url TEXT NOT NULL,
  is_superhost BOOLEAN DEFAULT false,
  amenities TEXT[] DEFAULT '{}',
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  recommended_price NUMERIC(10,2) NOT NULL,
  min_price NUMERIC(10,2) NOT NULL,
  max_price NUMERIC(10,2) NOT NULL,
  confidence_score INT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  reasoning TEXT NOT NULL,
  factors JSONB DEFAULT '{}'::jsonb,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_benchmarks_zone_type ON market_benchmarks(zone, property_type, bedrooms);
CREATE INDEX IF NOT EXISTS idx_competitor_listings_zone_platform ON competitor_listings(zone, platform, nightly_price);
CREATE INDEX IF NOT EXISTS idx_competitor_listings_scraped_at ON competitor_listings(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_recommendations_property ON pricing_recommendations(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_recommendations_applied ON pricing_recommendations(applied);

ALTER TABLE market_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read market_benchmarks" ON market_benchmarks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage market_benchmarks" ON market_benchmarks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read competitor_listings" ON competitor_listings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage competitor_listings" ON competitor_listings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read pricing_recommendations" ON pricing_recommendations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage pricing_recommendations" ON pricing_recommendations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full market_benchmarks" ON market_benchmarks
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full competitor_listings" ON competitor_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full pricing_recommendations" ON pricing_recommendations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO market_benchmarks (zone, property_type, bedrooms, avg_daily_rate, occupancy_rate, active_listings_count, seasonality_factor, source)
VALUES
  ('medina', 'riad', 5, 4200.00, 84.5, 480, 1.25, 'inside_airbnb'),
  ('medina', 'riad', 3, 2600.00, 86.0, 620, 1.20, 'inside_airbnb'),
  ('medina', 'studio', 1, 850.00, 78.0, 950, 1.15, 'inside_airbnb'),
  ('palmeraie', 'villa', 6, 8900.00, 76.5, 210, 1.35, 'inside_airbnb'),
  ('palmeraie', 'villa', 4, 6200.00, 79.0, 340, 1.30, 'inside_airbnb'),
  ('gueliz', 'appartement', 2, 1450.00, 89.0, 810, 1.10, 'inside_airbnb'),
  ('hivernage', 'duplex', 3, 2900.00, 81.5, 290, 1.25, 'inside_airbnb'),
  ('targa', 'appartement', 2, 1100.00, 68.0, 310, 1.05, 'inside_airbnb')
ON CONFLICT (zone, property_type, bedrooms) DO UPDATE
SET avg_daily_rate = EXCLUDED.avg_daily_rate,
    occupancy_rate = EXCLUDED.occupancy_rate,
    active_listings_count = EXCLUDED.active_listings_count,
    updated_at = NOW();
