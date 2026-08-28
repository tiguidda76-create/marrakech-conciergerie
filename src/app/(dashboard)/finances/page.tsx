"use client";

import { MOCK_KPI_METRICS, MOCK_BOOKINGS } from "@/lib/mockData";
import { formatDate, formatMAD } from "@/lib/utils";
import { exportFinancialStatementToCSV } from "@/lib/export";
import { SEASONAL_STRATEGIES, LEGAL_ENTITY } from "@/lib/constants";
import { 
  CircleDollarSign, 
  Download, 
  TrendingUp, 
  Sparkles, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Landmark,
  Calendar,
  Building,
  ShieldCheck,
  CreditCard
} from "lucide-react";

export default function FinancesPage() {
  const totalTouristTax = MOCK_BOOKINGS.reduce((sum, b) => sum + (b.tourist_tax_mad || 0), 0);
  const totalOwnerPayouts = MOCK_KPI_METRICS.monthlyRevenueMAD - MOCK_KPI_METRICS.conciergeRevenueMAD;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Finances, Facturation & Reversements</h1>
          <p className="text-xs text-muted-foreground">
            Suivi des encaissements en MAD, commissions 25%, reversements propriétaires et déclarations officielles.
          </p>
        </div>

        <button
          onClick={() => exportFinancialStatementToCSV(MOCK_BOOKINGS)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20"
        >
          <Download className="w-4 h-4" />
          Exporter Grand Livre (CSV / Excel)
        </button>
      </div>

      <div className="p-5 rounded-card bg-surface border border-primary/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                Émetteur Officiel Facturation
              </span>
              <span className="text-xs font-semibold text-foreground">{LEGAL_ENTITY.name} ({LEGAL_ENTITY.status})</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {LEGAL_ENTITY.address} • Tél: {LEGAL_ENTITY.phone} • Email: {LEGAL_ENTITY.email}
            </p>
            <p className="text-[11px] text-primary/90 font-medium">
              ICE : <span className="font-bold text-foreground">{LEGAL_ENTITY.ice}</span> • {LEGAL_ENTITY.tvaExemptionMention}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated/90 border border-surface-border text-xs space-y-1 shrink-0">
            <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
              <CreditCard className="w-3.5 h-3.5" />
              Coordonnées Bancaires Professionnelles
            </div>
            <div className="text-[11px] text-foreground font-mono">RIB : {LEGAL_ENTITY.rib}</div>
            <div className="text-[10px] text-muted-foreground">Code SWIFT : <span className="text-foreground font-semibold">{LEGAL_ENTITY.swift}</span> • {LEGAL_ENTITY.bank}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase mb-2">
            <span>Revenu Brut Total</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">{formatMAD(MOCK_KPI_METRICS.monthlyRevenueMAD)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Volume brut généré</p>
        </div>

        <div className="p-5 rounded-card bg-surface border border-primary/30 shadow-lg">
          <div className="flex items-center justify-between text-primary text-xs font-semibold uppercase mb-2">
            <span>Commissions (25%)</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-primary">{formatMAD(MOCK_KPI_METRICS.conciergeRevenueMAD)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Marge nette conciergerie</p>
        </div>

        <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase mb-2">
            <span>Reversements Propriétaires</span>
            <ArrowDownRight className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">{formatMAD(totalOwnerPayouts)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">75% reversés aux propriétaires</p>
        </div>

        <div className="p-5 rounded-card bg-surface border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase mb-2">
            <span>Taxe Séjour Collectée</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-400">{formatMAD(totalTouristTax, false)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">11 MAD/nuit/pers (Délégation Tourisme)</p>
        </div>
      </div>

      <div className="p-5 rounded-card bg-surface border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Stratégie Tarifaire & Saisons Marrakech
          </div>
          <span className="text-[11px] text-muted-foreground">Recommandations automatiques appliquées</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {Object.entries(SEASONAL_STRATEGIES).map(([key, strat]) => (
            <div key={key} className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border">
              <div className="font-bold text-foreground">{strat.label}</div>
              <div className="text-primary font-bold text-xs mt-1">{strat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-surface border border-surface-border overflow-hidden shadow-xl">
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-elevated/40">
          <h2 className="font-serif text-base font-bold text-foreground">Grand Livre des Opérations & Reversements J+5</h2>
          <span className="text-xs text-primary font-semibold">Devise : MAD (Dirham Marocain)</span>
        </div>

        <div className="divide-y divide-surface-border text-xs">
          {MOCK_BOOKINGS.map((b) => {
            const comm = Math.round(b.total_mad * 0.25);
            const ownerPayout = b.total_mad - comm;
            return (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-elevated/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-primary">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Séjour #{b.id} — {b.guest_name}</div>
                    <div className="text-[11px] text-muted-foreground">{b.property_name} • {formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">Brut</div>
                    <div className="font-bold text-foreground">{formatMAD(b.total_mad, false)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-primary">Com 25%</div>
                    <div className="font-bold text-primary">{formatMAD(comm, false)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">Reversement J+5</div>
                    <div className="font-bold text-emerald-400">{formatMAD(ownerPayout, false)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
