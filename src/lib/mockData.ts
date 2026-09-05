import { Property, Booking, Task, DashboardKPIMetrics, Owner, TeamMember } from "@/types";

/**
 * BASE DE DONNÉES RÉELLE MARRAKECH CONCIERGERIE PRIVÉE
 * Initialisée à zéro : aucun faux bien, fausse réservation ou faux chiffre de prospection.
 */

export const MOCK_PROPERTIES: Property[] = [];

export const MOCK_OWNERS: Owner[] = [];

export const MOCK_BOOKINGS: Booking[] = [];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team-1",
    name: "Fatima-Zahra El Alami",
    role: "Gouvernante Principale",
    phone: "+212 6 63 11 22 33",
    email: "gouvernante@marrakech-concierge.ma",
    zone: "Médina & Guéliz",
    active_tasks_count: 0,
    status: "disponible",
  },
  {
    id: "team-2",
    name: "Amine Bennani",
    role: "Concierge de Garde",
    phone: "+212 6 64 22 33 44",
    email: "concierge@marrakech-concierge.ma",
    zone: "Hivernage & Palmeraie",
    active_tasks_count: 0,
    status: "disponible",
  },
  {
    id: "team-3",
    name: "Yassine Maintenance",
    role: "Technicien Climatisation/Piscine",
    phone: "+212 6 65 33 44 55",
    email: "maintenance@marrakech-concierge.ma",
    zone: "Grand Marrakech",
    active_tasks_count: 0,
    status: "disponible",
  }
];

export const MOCK_TASKS: Task[] = [];

export const MOCK_KPI_METRICS: DashboardKPIMetrics = {
  occupancyRate: 0,
  occupancyTrend: [0, 0, 0, 0, 0, 0, 0],
  monthlyRevenueMAD: 0,
  monthlyRevenueTrend: [0, 0, 0, 0, 0, 0, 0],
  avgRating: 5.0,
  ratingTrend: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
  propertiesCount: 0,
  activeBookingsCount: 0,
  pendingTasksCount: 0,
  conciergeRevenueMAD: 0,
};
