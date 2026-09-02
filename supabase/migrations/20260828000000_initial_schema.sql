-- Supabase Migration: Marrakech Conciergerie Schema & RLS
-- Aligned with skills/supabase-schema.md and agent.md

-- 1. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('riad', 'villa', 'appartement', 'studio', 'duplex');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_quartier AS ENUM ('medina', 'gueliz', 'hivernage', 'palmeraie', 'targa', 'autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('actif', 'inactif', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_platform AS ENUM ('airbnb', 'booking', 'direct', 'abritel', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('cleaning', 'checkin', 'checkout', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles (Users / Roles: admin, owner, cleaner)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('admin', 'owner', 'cleaner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Properties Table
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
    status property_status NOT NULL DEFAULT 'actif',
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    photos TEXT[] DEFAULT '{}',
    occupancy_rate NUMERIC(5,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bookings Table
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
    tourist_tax_mad INT NOT NULL DEFAULT 0, -- 11 MAD / night / person
    platform booking_platform NOT NULL DEFAULT 'direct',
    commission_pct INT NOT NULL DEFAULT 25,
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type task_type NOT NULL DEFAULT 'cleaning',
    scheduled_at TIMESTAMPTZ NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status task_status NOT NULL DEFAULT 'todo',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Properties: Admins see all, owners see only their properties
CREATE POLICY "Admins can view and manage all properties" ON properties
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Owners can view own properties" ON properties
    FOR SELECT USING (owner_id = auth.uid());

-- Bookings: Admins see all, owners see bookings for their properties
CREATE POLICY "Admins manage all bookings" ON bookings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Owners view bookings of their properties" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = bookings.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Tasks: Admins see all, cleaners see assigned tasks, owners see tasks on their properties
CREATE POLICY "Admins manage all tasks" ON tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Cleaners view assigned tasks" ON tasks
    FOR SELECT USING (assigned_to = auth.uid());

-- 8. Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_quartier ON properties(quartier);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
