import { useState } from "react";
import { MOCK_KPI_METRICS, MOCK_PROPERTIES, MOCK_BOOKINGS, MOCK_TASKS } from "@/lib/mockData";
import { DashboardKPIMetrics, Property, Booking, Task } from "@/types";

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardKPIMetrics>(MOCK_KPI_METRICS);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [isLoading, setIsLoading] = useState(false);

  return {
    metrics,
    properties,
    bookings,
    tasks,
    isLoading,
  };
}
