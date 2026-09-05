"use client";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { formatMAD } from "@/lib/utils";
import { useState } from "react";

const MONTHLY_REVENUE_DATA = [
  { month: "Jan", revenueMAD: 0, commissionMAD: 0 },
  { month: "Fév", revenueMAD: 0, commissionMAD: 0 },
  { month: "Mar", revenueMAD: 0, commissionMAD: 0 },
  { month: "Avr", revenueMAD: 0, commissionMAD: 0 },
  { month: "Mai", revenueMAD: 0, commissionMAD: 0 },
  { month: "Juin", revenueMAD: 0, commissionMAD: 0 },
];

const OCCUPANCY_COMPARISON_DATA = [
  { month: "Jan", thisYear: 0, lastYear: 0 },
  { month: "Fév", thisYear: 0, lastYear: 0 },
  { month: "Mar", thisYear: 0, lastYear: 0 },
  { month: "Avr", thisYear: 0, lastYear: 0 },
  { month: "Mai", thisYear: 0, lastYear: 0 },
  { month: "Juin", thisYear: 0, lastYear: 0 },
];

const SOURCE_DATA = [
  { name: "Direct Concierge", value: 100, color: "#C49A6C" },
];

export function RevenueChart() {
  const [activeTab, setActiveTab] = useState<"revenue" | "occupancy">("revenue");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue or Occupancy Chart */}
      <div className="lg:col-span-2 p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">
              {activeTab === "revenue" ? "Chiffre d'Affaires Mensuel (MAD)" : "Taux d'Occupation vs Année N-1 (%)"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeTab === "revenue" ? "Volume brut généré vs Commission 25%" : "Comparaison mensuelle 2026 vs 2025"}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-surface-border self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "revenue"
                  ? "bg-primary text-surface-muted shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Revenus MAD
            </button>
            <button
              onClick={() => setActiveTab("occupancy")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "occupancy"
                  ? "bg-primary text-surface-muted shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Occupation %
            </button>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "revenue" ? (
              <BarChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                <XAxis dataKey="month" stroke="#A0A0B2" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#A0A0B2"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label} 2026</p>
                          <p className="text-primary font-bold">
                            Total: {formatMAD(payload[0].value as number)}
                          </p>
                          <p className="text-blue-400">
                            Com (25%): {formatMAD(payload[1].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenueMAD" fill="#C49A6C" radius={[4, 4, 0, 0]} name="Revenu Brut" />
                <Bar dataKey="commissionMAD" fill="#2E5BFF" radius={[4, 4, 0, 0]} name="Commission Conciergerie (25%)" />
              </BarChart>
            ) : (
              <LineChart data={OCCUPANCY_COMPARISON_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                <XAxis dataKey="month" stroke="#A0A0B2" fontSize={11} tickLine={false} />
                <YAxis stroke="#A0A0B2" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label}</p>
                          <p className="text-emerald-400 font-bold">2026: {payload[0].value}%</p>
                          <p className="text-muted-foreground">2025: {payload[1].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="thisYear" stroke="#2D9F6F" strokeWidth={3} dot={{ r: 4 }} name="2026" />
                <Line type="monotone" dataKey="lastYear" stroke="#A0A0B2" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="2025" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Breakdown Pie Chart */}
      <div className="p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">Canaux de Réservation</h2>
          <p className="text-xs text-muted-foreground">Répartition des plateformes</p>
        </div>

        <div className="w-full h-44 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SOURCE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {SOURCE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#12121A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2 rounded-lg bg-surface-elevated border border-surface-border shadow-lg text-xs">
                        <span className="font-semibold text-foreground">{data.name}: </span>
                        <span className="text-primary font-bold">{data.value}%</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 pt-3 border-t border-surface-border text-xs">
          {SOURCE_DATA.map((src) => (
            <div key={src.name} className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                <span>{src.name}</span>
              </div>
              <span className="font-bold text-foreground">{src.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
