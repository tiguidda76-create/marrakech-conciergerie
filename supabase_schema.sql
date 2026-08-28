-- ============================================================================
-- Marrakech Conciergerie SaaS — Production Supabase Database Schema
-- ============================================================================

CREATE TYPE property_type AS ENUM ('riad', 'villa', 'appartement', 'studio', 'duplex');
CREATE TYPE property_quartier AS ENUM ('medina', 'gueliz', 'hivernage', 'palmeraie', 'targa', 'autre');
CREATE TYPE property_status AS ENUM ('actif', 'inactif', 'maintenance');
CREATE TYPE booking_platform AS ENUM ('airbnb', 'booking', 'direct', 'abritel', 'other');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'pending');
CREATE TYPE task_type AS ENUM ('cleaning', 'checkin', 'checkout', 'maintenance', 'other');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

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
    photos TEXT[] DEFAULT '{}',
    occupancy_rate NUMERIC(5,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    tourist_tax_mad INT NOT NULL DEFAULT 0,
    commission_mad INT NOT NULL DEFAULT 0,
    owner_payout_mad INT NOT NULL DEFAULT 0,
    platform booking_platform NOT NULL DEFAULT 'direct',
    status booking_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type task_type NOT NULL DEFAULT 'cleaning',
    scheduled_at TIMESTAMPTZ NOT NULL,
    assigned_to TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    turnaround_hours INT DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
