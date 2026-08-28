"use client";

import { DashboardKPIMetrics } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Percent, DollarSign, Star, Building2 } from "lucide-react";

interface KPICardsProps {
  metrics: DashboardKPIMetrics;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: "Taux d'Occupation",
      value: `${metrics.occupancyRate}%`,
      subtitle: "+4.2% vs mois dernier",
      icon: Percent,
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
      sparkColor: "#2D9F6F",
      sparkData: metrics.occupancyTrend,
    },
    {
      title: "Chiffre d'Affaires Mensuel",
      value: formatMAD(metrics.monthlyRevenueMAD, false),
      subtitle: `Com: ${formatMAD(metrics.conciergeRevenueMAD, false)} (25%)`,
      icon: DollarSign,
      color: "from-primary/20 to-primary/5 text-primary border-primary/25",
      sparkColor: "#C49A6C",
      sparkData: metrics.monthlyRevenueTrend,
    },
    {
      title: "Note Moyenne Voyageurs",
      value: `${metrics.avgRating} / 5`,
      subtitle: "Basé sur 189 avis certifiés",
      icon: Star,
      color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
      sparkColor: "#D97706",
      sparkData: metrics.ratingTrend,
    },
    {
      title: "Biens Sous Gestion",
      value: `${metrics.propertiesCount}`,
      subtitle: `${metrics.activeBookingsCount} réservations actives`,
      icon: Building2,
      color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20",
      sparkColor: "#2E5BFF",
      sparkData: [6, 6, 7, 7, 8, 8, 8],
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-card bg-surface border border-surface-border hover:border-primary/40 transition-all duration-300 relative overflow-hidden group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1">
                  {card.title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-foreground tracking-tight mb-1">
                {card.value}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border/50">
              <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {card.subtitle}
              </span>
              <div className="hidden sm:block">
                <Sparkline data={card.sparkData} color={card.sparkColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
