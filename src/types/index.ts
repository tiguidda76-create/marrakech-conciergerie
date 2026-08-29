export type PropertyType = 'riad' | 'villa' | 'appartement' | 'studio' | 'duplex';
export type PropertyQuartier = 'medina' | 'gueliz' | 'hivernage' | 'palmeraie' | 'targa' | 'autre';
export type PropertyStatus = 'actif' | 'inactif' | 'maintenance' | 'Libre' | 'Réservé' | 'En ménage';

export type BookingPlatform = 'airbnb' | 'booking' | 'direct' | 'abritel' | 'other';
export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

export type TaskType = 'cleaning' | 'checkin' | 'checkout' | 'maintenance' | 'other';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  quartier: PropertyQuartier;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  base_price_mad: number;
  cleaning_fee_mad: number;
  status: PropertyStatus;
  owner_id?: string;
  owner_name?: string;
  owner_phone?: string;
  photos: string[];
  occupancy_rate: number;
  monthly_revenue_mad?: number;
  rating: number;
  reviews_count?: number;
  created_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  property_name: string;
  property_photo: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  platform: BookingPlatform;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_mad: number;
  tourist_tax_mad: number;
  commission_pct: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  property_id: string;
  property_name: string;
  title: string;
  type: TaskType;
  scheduled_at: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: TaskPriority;
  turnaround_hours?: number;
  notes?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  rib?: string;
  swift?: string;
  bank?: string;
  commission_pct: number;
  contract_start_date: string;
  properties_count: number;
  properties_names: string[];
  total_payouts_mad: number;
  status: 'actif' | 'inactif' | 'en_attente';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  zone: string;
  active_tasks_count: number;
  status: 'disponible' | 'en_mission' | 'indisponible';
}

export interface DashboardKPIMetrics {
  occupancyRate: number;
  occupancyTrend: number[];
  monthlyRevenueMAD: number;
  monthlyRevenueTrend: number[];
  avgRating: number;
  ratingTrend: number[];
  propertiesCount: number;
  activeBookingsCount: number;
  pendingTasksCount: number;
  conciergeRevenueMAD: number;
}

export interface RevenueBySource {
  source: string;
  amountMAD: number;
  percentage: number;
  color: string;
}

export interface MarketBenchmark {
  id: string;
  zone: PropertyQuartier | string;
  property_type: PropertyType | string;
  bedrooms: number;
  avg_daily_rate: number; // ADR en MAD
  occupancy_rate: number; // %
  revpar: number; // MAD
  active_listings_count: number;
  updated_at: string;
}

export interface CompetitorListing {
  id: string;
  external_id: string;
  platform: BookingPlatform | 'airbnb' | 'booking';
  title: string;
  zone: PropertyQuartier | string;
  property_type?: PropertyType | string;
  bedrooms?: number;
  nightly_price: number; // MAD
  cleaning_fee: number; // MAD
  rating: number;
  reviews_count: number;
  url: string;
  photo_url?: string;
  is_superhost?: boolean;
  amenities?: string[];
  scraped_at: string;
}

export interface PricingRecommendation {
  id: string;
  property_id: string;
  recommended_price: number; // MAD
  min_price: number; // MAD floor
  max_price: number; // MAD ceiling
  confidence_score: number; // 0-100%
  reasoning: string;
  factors: {
    base_adr: number;
    occupancy_modifier: number;
    seasonality_modifier: number;
    rating_premium: number;
    competitor_pressure: number;
  };
  applied: boolean;
  created_at: string;
}

export interface MarketOverviewMetrics {
  localMarketADR: number; // MAD
  globalOccupancyRate: number; // %
  portfolioPositioningPct: number; // % (+12% vs market)
  activeCompetitorsCount: number;
  topPerformingZone: string;
  suggestedAction: string;
}

export interface PricingForecastPoint {
  date: string;
  recommended_price: number;
  current_price: number;
  competitors_avg: number;
  market_adr: number;
  occupancy_demand_factor: number;
}

export type OutreachStatus = 'nouveau' | 'contacte' | 'rendez_vous' | 'mandat_signe' | 'archive';

export interface ProspectLead {
  id: string;
  title: string;
  zone: PropertyQuartier | string;
  property_type: PropertyType;
  bedrooms: number;
  nightly_price: number; // Prix actuel constaté (MAD)
  estimated_adr: number; // Prix optimisé potentiel (MAD)
  estimated_gain_annual_mad: number; // Gain additionnel net estimé (MAD/an)
  rating: number;
  reviews_count: number;
  platform: BookingPlatform | 'airbnb' | 'booking' | 'direct';
  url: string;
  owner_name?: string;
  owner_contact?: string; // Téléphone, WhatsApp ou email
  outreach_status: OutreachStatus;
  opportunity_score: number; // 0 à 100
  audit_notes: string[];
  suggested_message_whatsapp: string;
  suggested_message_email: string;
  last_contacted_at?: string;
  created_at: string;
}
