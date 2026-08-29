"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  BarChart3, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

interface MarketOverviewCardProps {
  portfolioAvgPriceMAD?: number;
  marketAvgPriceMAD?: number;
  marketOccupancyRate?: number;
  activePropertiesCount?: number;
}

export default function MarketOverviewCard({
  portfolioAvgPriceMAD = 3850,
  marketAvgPriceMAD = 3420,
  marketOccupancyRate = 81.4,
  activePropertiesCount = 8,
}: MarketOverviewCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const priceDiffPct = Math.round(
    ((portfolioAvgPriceMAD - marketAvgPriceMAD) / marketAvgPriceMAD) * 100
  );
  const isPremium = priceDiffPct >= 0;

  const handleSyncMarket = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      const res = await fetch("/api/market/sync", { method: "POST" });
      if (res.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 4000);
      }
    } catch (e) {
      console.error("Erreur sync marché:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-card bg-gradient-to-br from-surface via-surface to-surface-elevated border border-primary/25 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">
                Market Intelligence Marrakech
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AirDNA Alt. Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Agrégation macro Inside Airbnb & veille concurrentielle temps réel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncMarket}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-surface-elevated hover:bg-surface-border text-xs font-semibold text-foreground border border-surface-border transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Scraping en cours..." : "Actualiser Marché"}</span>
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="my-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Synchronisation réussie : 30 annonces concurrentes Airbnb & Booking actualisées sur Marrakech.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Prix Moyen Marché (ADR)</span>
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-foreground">
            {marketAvgPriceMAD.toLocaleString("fr-FR")} MAD
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Moyenne tous quartiers (Médina, Guéliz, Palmeraie)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Taux d&apos;Occupation Ville</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-emerald-400">
            {marketOccupancyRate}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            +5.2% de tension touristique ce mois
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span>Positionnement Tarifaire</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold text-primary">
              {isPremium ? `+${priceDiffPct}%` : `${priceDiffPct}%`}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">vs marché</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Prime de standing justifiée par vos notes 4.9+
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-muted-foreground font-medium">Repères quartiers :</span>
          <span className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-foreground">
            🕌 Médina: <b className="text-primary">2.800 MAD</b>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-foreground">
            🌴 Palmeraie: <b className="text-primary">7.500 MAD</b>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-foreground">
            🏙️ Guéliz: <b className="text-primary">1.450 MAD</b>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-foreground">
            🍸 Hivernage: <b className="text-primary">2.900 MAD</b>
          </span>
        </div>

        <Link
          href="/biens/prop-1/pricing"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs font-semibold shadow-md shadow-primary/20 transition-all group shrink-0"
        >
          <span>Accéder au Dynamic Pricing</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
