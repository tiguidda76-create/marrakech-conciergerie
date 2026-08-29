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
  property_name?: string;
  property_photo?: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_mad: number;
  tourist_tax_mad: number;
  commission_pct: number;
  platform: BookingPlatform;
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
  priority?: TaskPriority;
  turnaround_hours?: number;
  notes?: string;
  created_at?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  rib: string;
  swift: string;
  bank: string;
  commission_pct: number;
  contract_start_date: string;
  properties_count: number;
  properties_names: string[];
  total_payouts_mad: number;
  status: 'actif' | 'en_attente' | 'résilié';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Gouvernante Principale' | 'Concierge de Garde' | 'Technicien Climatisation/Piscine' | 'Chauffeur VIP';
  phone: string;
  email: string;
  zone: string;
  active_tasks_count: number;
  status: 'disponible' | 'en_mission' | 'repos';
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

export interface MarketBenchmark {
  id: string;
  zone: PropertyQuartier | string;
  property_type: PropertyType;
  bedrooms: number;
  avg_daily_rate: number;
  occupancy_rate: number;
  revpar: number;
  active_listings_count: number;
  source?: 'inside_airbnb' | 'scraped_competitors' | 'blended';
  seasonality_factor?: number;
  updated_at: string;
}

export interface CompetitorListing {
  id: string;
  external_id: string;
  platform: 'airbnb' | 'booking' | 'abritel';
  title: string;
  zone: PropertyQuartier | string;
  property_type?: PropertyType;
  bedrooms?: number;
  nightly_price: number;
  cleaning_fee: number;
  rating: number;
  reviews_count: number;
  url: string;
  is_superhost?: boolean;
  amenities?: string[];
  scraped_at: string;
}

export interface PricingRecommendation {
  id: string;
  property_id: string;
  recommended_price: number;
  min_price: number;
  max_price: number;
  confidence_score: number;
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
  localMarketADR: number;
  globalOccupancyRate: number;
  portfolioPositioningPct: number;
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
