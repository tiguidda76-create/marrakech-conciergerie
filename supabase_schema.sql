-- ============================================================================
-- Marrakech Conciergerie SaaS — Production Supabase Database Schema
-- Aligned with Moroccan hospitality regulations, MAD currency, and RLS policies
-- ============================================================================

-- 1. ENUMS & TYPES
CREATE TYPE property_type AS ENUM ('riad', 'villa', 'appartement', 'studio', 'duplex');
CREATE TYPE property_quartier AS ENUM ('medina', 'gueliz', 'hivernage', 'palmeraie', 'targa', 'autre');
CREATE TYPE property_status AS ENUM ('actif', 'inactif', 'maintenance');
CREATE TYPE booking_platform AS ENUM ('airbnb', 'booking', 'direct', 'abritel', 'other');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'pending');
CREATE TYPE task_type AS ENUM ('cleaning', 'checkin', 'checkout', 'maintenance', 'other');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'cleaner');

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROPERTIES (Biens Immobiliers & Riads)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type property_type NOT NULL DEFAULT 'riad',
    quartier property_quartier NOT NULL DEFAULT 'medina',
    address TEXT,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    max_guests INT NOT NULL DEFAULT 2,
    base_price_mad INT NOT NULL DEFAULT 1500,
    cleaning_fee_mad INT NOT NULL DEFAULT 350,
    commission_pct INT NOT NULL DEFAULT 25,
    status property_status NOT NULL DEFAULT 'actif',
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    photos TEXT[] DEFAULT '{}',
    occupancy_rate NUMERIC(5,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    ical_airbnb_url TEXT,
    ical_booking_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BOOKINGS (Réservations Multi-Plateformes)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    guests_count INT NOT NULL DEFAULT 2,
    total_mad INT NOT NULL,
    tourist_tax_mad INT GENERATED ALWAYS AS (nights * guests_count * 11) STORED,
    commission_pct INT NOT NULL DEFAULT 25,
    commission_mad INT GENERATED ALWAYS AS (ROUND(total_mad * 0.25)) STORED,
    platform booking_platform NOT NULL DEFAULT 'direct',
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASKS (Ménage 3h turnaround, Check-in, Maintenance)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type task_type NOT NULL DEFAULT 'cleaning',
    scheduled_at TIMESTAMPTZ NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status task_status NOT NULL DEFAULT 'todo',
    turnaround_hours INT DEFAULT 3,
    qc_checklist JSONB DEFAULT '{"linens_ironed": true, "welcome_tea_ready": true, "ac_checked": true}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CONCIERGE SERVICES (Upsells & Extras)
CREATE TABLE IF NOT EXISTS concierge_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: 'Transfert Aéroport RAK', 'Chef Privé Tagine'
    price_mad INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROSPECTS (Agent Prospect Hunter)
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_title TEXT NOT NULL,
    platform TEXT NOT NULL,
    listing_url TEXT,
    owner_name TEXT,
    owner_contact TEXT,
    quartier TEXT NOT NULL,
    estimated_bedrooms INT DEFAULT 1,
    current_price_mad INT,
    estimated_price_mad INT,
    score INT NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'contacté', 'en_négociation', 'signé', 'rejeté'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EMAIL CAMPAIGNS (Agent Email Writer)
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'prospect', 'owner', 'guest'
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'opened', 'clicked', 'replied'
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AGENT EVENTS (Inter-Agent Communications)
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_agent TEXT NOT NULL,
    target_agent TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. REVIEWS (Avis Voyageurs)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    ai_response TEXT,
    status TEXT NOT NULL DEFAULT 'pending_reply', -- 'pending_reply', 'replied'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. FINANCIAL KPI VIEW
CREATE OR REPLACE VIEW v_financial_overview AS
SELECT 
    COUNT(DISTINCT p.id) AS total_properties,
    COALESCE(SUM(b.total_mad), 0) AS total_gross_revenue_mad,
    COALESCE(SUM(b.commission_mad), 0) AS total_concierge_revenue_mad,
    COALESCE(SUM(b.tourist_tax_mad), 0) AS total_tourist_tax_mad,
    COUNT(DISTINCT b.id) AS total_bookings_count
FROM properties p
LEFT JOIN bookings b ON b.property_id = p.id;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierge_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access profiles" ON profiles FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users read own profile" ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins full access properties" ON properties FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Owners read own properties" ON properties FOR SELECT 
USING (owner_id = auth.uid());

CREATE POLICY "Admins full access bookings" ON bookings FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Owners read their property bookings" ON bookings FOR SELECT 
USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = bookings.property_id AND properties.owner_id = auth.uid()));

CREATE POLICY "Admins full access tasks" ON tasks FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Cleaners read assigned tasks" ON tasks FOR SELECT 
USING (assigned_to = auth.uid());
