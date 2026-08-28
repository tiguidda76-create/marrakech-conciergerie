import { KPICards } from "@/components/dashboard/KPICards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MOCK_KPI_METRICS, MOCK_BOOKINGS, MOCK_TASKS, MOCK_PROPERTIES } from "@/lib/mockData";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="p-5 sm:p-6 rounded-card bg-gradient-to-r from-surface to-surface-elevated border border-primary/25 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Plateforme Active
            </span>
            <span className="text-xs text-muted-foreground">Marrakech, Maroc</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Marrakech Conciergerie Dashboard
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Gestion hôtelière complète de vos Riads & Villas : synchronisation des calendriers, suivi des encaissements en Dirham (MAD), taxe de séjour et coordination des gouvernantes.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="px-3.5 py-2 rounded-lg bg-surface border border-surface-border text-center">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Parc Géré</div>
            <div className="text-base sm:text-lg font-bold text-foreground">{MOCK_PROPERTIES.length} Biens</div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-surface border border-surface-border text-center">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Occupation</div>
            <div className="text-base sm:text-lg font-bold text-primary">{MOCK_KPI_METRICS.occupancyRate}%</div>
          </div>
        </div>
      </div>

      <QuickActions />
      <KPICards metrics={MOCK_KPI_METRICS} />
      <RevenueChart />
      <RecentActivity bookings={MOCK_BOOKINGS} tasks={MOCK_TASKS} />
    </div>
  );
}
