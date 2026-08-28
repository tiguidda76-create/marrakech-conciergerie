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
