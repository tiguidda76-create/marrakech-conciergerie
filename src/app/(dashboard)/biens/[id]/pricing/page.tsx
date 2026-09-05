"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Building2, 
  Star, 
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { 
  Property, 
  MarketBenchmark, 
  CompetitorListing, 
  PricingRecommendation, 
  PricingForecastPoint 
} from "@/types";

interface PricingPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyPricingPage({ params }: PricingPageProps) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId);
  const [property, setProperty] = useState<Property | null>(null);
  const [benchmark, setBenchmark] = useState<MarketBenchmark | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorListing[]>([]);
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [forecast, setForecast] = useState<PricingForecastPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch live market recommendation for the selected property
  useEffect(() => {
    async function loadPricingData() {
      setIsLoading(true);
      setApplySuccess(false);
      try {
        const res = await fetch(`/api/market/recommendations/${selectedPropertyId}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data.property);
          setBenchmark(data.benchmark);
          setCompetitors(data.competitors || []);
          setRecommendation(data.recommendation);
          setForecast(data.forecast || []);
        } else {
          // Fallback to local mock data
          const localProp = MOCK_PROPERTIES.find(p => p.id === selectedPropertyId) || MOCK_PROPERTIES[0];
          setProperty(localProp);
        }
      } catch (err) {
        console.error("Erreur chargement pricing:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPricingData();
  }, [selectedPropertyId]);

  // Appliquer le tarif recommandé
  const handleApplyPrice = async () => {
    if (!recommendation || !property) return;
    setIsApplying(true);
    try {
      const res = await fetch(`/api/market/recommendations/${property.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_mad: recommendation.recommended_price }),
      });

      if (res.ok) {
        setApplySuccess(true);
        setProperty({ ...property, base_price_mad: recommendation.recommended_price });
        setTimeout(() => setApplySuccess(false), 5000);
      }
    } catch (e) {
      console.error("Erreur application tarif:", e);
    } finally {
      setIsApplying(false);
    }
  };

  const defaultFallbackProp = {
    id: "prop-demo",
    name: "Propriété Démo",
    type: "riad" as const,
    quartier: "medina" as const,
    bedrooms: 4,
    bathrooms: 4,
    max_guests: 8,
    base_price_mad: 2500,
    cleaning_fee_mad: 400,
    status: "actif" as const,
    photos: [],
    occupancy_rate: 0,
    rating: 5.0,
    created_at: new Date().toISOString()
  };

  const currentProp = property || MOCK_PROPERTIES[0] || defaultFallbackProp;
  const priceDiff = recommendation ? recommendation.recommended_price - currentProp.base_price_mad : 0;
  const priceDiffPct = currentProp.base_price_mad ? Math.round((priceDiff / currentProp.base_price_mad) * 100) : 0;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Property Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/biens"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour au Parc de Biens
            </Link>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <span>Dynamic Pricing & Veille Marché</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              IA & AirDNA Open
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Tarification algorithmique continue pour {currentProp.name} ({currentProp.quartier?.toUpperCase()})
          </p>
        </div>

        {/* Property Selector */}
        <div className="relative">
          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Sélectionner un bien
          </label>
          <div className="relative">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="appearance-none bg-surface border border-surface-border hover:border-primary/40 rounded-lg px-4 py-2.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-64 shadow-sm"
            >
              {MOCK_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.base_price_mad.toLocaleString("fr-FR")} MAD)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {applySuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Tarif de <b>{recommendation?.recommended_price.toLocaleString("fr-FR")} MAD/nuit</b> appliqué avec succès sur le bien et synchronisé avec les flux iCal.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded">En direct</span>
        </div>
      )}

      {/* Hero Recommendation Card */}
      <div className="p-6 rounded-card bg-gradient-to-r from-surface via-surface to-surface-elevated border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Main Price Recommendation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tarif Recommandé IA
              </span>
              <span className="text-xs text-muted-foreground">Par nuitée</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                {recommendation ? recommendation.recommended_price.toLocaleString("fr-FR") : currentProp.base_price_mad.toLocaleString("fr-FR")}{" "}
                <span className="text-lg sm:text-2xl text-primary font-normal">MAD</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted-foreground">Tarif actuel : {currentProp.base_price_mad.toLocaleString("fr-FR")} MAD</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${priceDiff >= 0 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`}>
                {priceDiff >= 0 ? `+${priceDiffPct}%` : `${priceDiffPct}%`} ({priceDiff >= 0 ? `+${priceDiff}` : priceDiff} MAD)
              </span>
            </div>
          </div>

          {/* Safety Bounds & Confidence */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Plancher Min</span>
              <span className="text-sm font-bold text-foreground">
                {recommendation ? recommendation.min_price.toLocaleString("fr-FR") : "—"} MAD
              </span>
            </div>
            <div className="text-center border-x border-surface-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Plafond Max</span>
              <span className="text-sm font-bold text-foreground">
                {recommendation ? recommendation.max_price.toLocaleString("fr-FR") : "—"} MAD
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Confiance</span>
              <span className="text-sm font-bold text-emerald-400">
                {recommendation ? `${recommendation.confidence_score}%` : "92%"}
              </span>
            </div>
          </div>

          {/* Apply CTA Action */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleApplyPrice}
              disabled={isApplying || isLoading}
              className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Application en cours...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Appliquer ce tarif au calendrier</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Mise à jour instantanée vers Supabase & synchronisation iCal Airbnb/Booking
            </p>
          </div>
        </div>

        {/* AI Reasoning Strip */}
        {recommendation && (
          <div className="mt-5 pt-5 border-t border-surface-border/60 text-xs text-muted-foreground flex items-start gap-2.5">
            <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-foreground">Synthèse du Moteur Algorithmique :</div>
              <p className="leading-relaxed text-muted-foreground">{recommendation.reasoning}</p>
            </div>
          </div>
        )}
      </div>

      {/* 30-Day Interactive Forecast Recharts */}
      <div className="p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Courbe Prévisionnelle sur 30 Jours (MAD)
            </h2>
            <p className="text-xs text-muted-foreground">
              Comparaison en temps réel : Prix Recommandé vs Base vs Concurrents Directs
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary inline-block" />
              <span className="text-muted-foreground">Prix Recommandé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 inline-block" />
              <span className="text-muted-foreground">Tarif Actuel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-400 inline-block" />
              <span className="text-muted-foreground">Moyenne Concurrents</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C49A6C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C49A6C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262320" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8C827A"
                fontSize={11}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                stroke="#8C827A"
                fontSize={11}
                tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161412",
                  borderColor: "#262320",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any) => {
                  const valNum = Number(value);
                  if (name === "recommended_price") return [`${valNum.toLocaleString("fr-FR")} MAD`, "Recommandé"];
                  if (name === "current_price") return [`${valNum.toLocaleString("fr-FR")} MAD`, "Tarif Actuel"];
                  if (name === "competitors_avg") return [`${valNum.toLocaleString("fr-FR")} MAD`, "Concurrents"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date : ${new Date(label).toLocaleDateString("fr-FR")}`}
              />
              <Area
                type="monotone"
                dataKey="recommended_price"
                stroke="#C49A6C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRecPrice)"
              />
              <Area
                type="step"
                dataKey="current_price"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="competitors_avg"
                stroke="#3B82F6"
                strokeWidth={1.5}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Scraped Competitors Table */}
      <div className="p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">
              Annonces Concurrentes Détectées ({currentProp.quartier?.toUpperCase()})
            </h2>
            <p className="text-xs text-muted-foreground">
              Scraping temps réel (Airbnb & Booking) filtré sur capacité et standing équivalents
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-elevated border border-surface-border text-primary">
            {competitors.length} annonces actives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Annonce Concurrente</th>
                <th className="py-3 px-3">Plateforme</th>
                <th className="py-3 px-3">Prix / Nuit</th>
                <th className="py-3 px-3">Frais Ménage</th>
                <th className="py-3 px-3">Note / Avis</th>
                <th className="py-3 px-3 text-right">Lien Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {competitors.map((comp) => (
                <tr key={comp.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{comp.title}</span>
                      {comp.is_superhost && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                          Superhost
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${comp.platform === "airbnb" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {comp.platform}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    {comp.nightly_price.toLocaleString("fr-FR")} MAD
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {comp.cleaning_fee.toLocaleString("fr-FR")} MAD
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{comp.rating}</span>
                      <span className="text-muted-foreground text-[10px]">({comp.reviews_count})</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-border text-[11px] text-primary hover:underline transition-colors"
                    >
                      <span>Voir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
