/**
 * Dynamic Pricing Engine for Marrakech Conciergerie
 * Algorithme d'optimisation tarifaire continue (AirDNA + BeyondPricing Hybrid)
 */

import { 
  Property, 
  MarketBenchmark, 
  CompetitorListing, 
  PricingRecommendation, 
  PricingForecastPoint 
} from "@/types";
import { MARRAKECH_SEASONALITY_FACTORS } from "./insideAirbnb";

export interface PricingContext {
  property: Property;
  benchmark?: MarketBenchmark;
  competitors: CompetitorListing[];
  targetDate?: Date;
  currentBookingsCount?: number;
}

export class PricingEngine {
  private static readonly TARGET_OCCUPANCY_RATE = 80.0; // Taux d'occupation cible idéal (%)
  private static readonly WEEKEND_PREMIUM_PCT = 0.18; // +18% vendredis et samedis soir
  private static readonly SUPERHOST_RATING_BENCHMARK = 4.85; // Seuil d'excellence

  /**
   * Calcule la recommandation tarifaire optimale pour un bien
   */
  public static calculateRecommendation(context: PricingContext): PricingRecommendation {
    const { property, benchmark, competitors, targetDate = new Date() } = context;

    // 1. Détermination du prix de base (Base ADR)
    const basePrice = benchmark?.avg_daily_rate || property.base_price_mad;

    // 2. Facteur de Saisonnalité et Calendrier (Mois + Jour de la semaine)
    const month = targetDate.getMonth() + 1;
    const seasonMultiplier = MARRAKECH_SEASONALITY_FACTORS[month] || 1.0;
    
    const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 5 = Vendredi, 6 = Samedi
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const weekendModifier = isWeekend ? (1 + this.WEEKEND_PREMIUM_PCT) : 1.0;

    const totalSeasonalityModifier = Number((seasonMultiplier * weekendModifier).toFixed(2));

    // 3. Facteur d'Occupation de la Zone vs Objectif
    const zoneOccupancy = benchmark?.occupancy_rate || 78.0;
    const occupancyDiff = zoneOccupancy - this.TARGET_OCCUPANCY_RATE;
    // Si zone sous tension (> 85%), on pousse les prix (+10% à +20%). Si faible demande (< 70%), on assouplit (-8%)
    const occupancyModifier = Number((1 + (occupancyDiff / 100) * 0.75).toFixed(2));

    // 4. Prime de Réputation / Note Moyenne (Rating Premium)
    const propertyRating = property.rating || 4.90;
    const ratingDelta = propertyRating - this.SUPERHOST_RATING_BENCHMARK;
    const ratingPremium = Number((1 + Math.max(-0.10, Math.min(0.20, ratingDelta * 0.6))).toFixed(2));

    // 5. Pression Concurrentielle Directe (Competitor Pressure)
    let competitorAvg = basePrice;
    let competitorPressure = 1.0;

    if (competitors.length > 0) {
      const compPrices = competitors.map(c => c.nightly_price);
      competitorAvg = Math.round(compPrices.reduce((a, b) => a + b, 0) / compPrices.length);
      const ratio = competitorAvg / basePrice;
      // Régulation douce vers la moyenne des concurrents observés
      competitorPressure = Number((0.8 + (ratio * 0.2)).toFixed(2));
    }

    // 6. Calcul du Prix Recommandé Final (Arrondi aux 50 MAD supérieurs pour standing)
    const rawRecommended = basePrice * totalSeasonalityModifier * occupancyModifier * ratingPremium * competitorPressure;
    const recommendedPrice = Math.round(rawRecommended / 50) * 50;

    // 7. Bornes de Sécurité (Plancher / Plafond)
    const minPrice = Math.round((property.base_price_mad * 0.75) / 50) * 50; // -25% max pour préserver le standing
    const maxPrice = Math.round((property.base_price_mad * 1.65) / 50) * 50; // +65% max pour éviter l'inélasticité

    const boundedPrice = Math.max(minPrice, Math.min(maxPrice, recommendedPrice));

    // 8. Indice de Confiance (0 - 100%)
    let confidence = 75;
    if (benchmark) confidence += 10;
    if (competitors.length >= 4) confidence += 10;
    if (property.reviews_count && property.reviews_count > 20) confidence += 5;
    confidence = Math.min(98, confidence);

    // 9. Génération des Justifications Analytiques en Français
    const reasoning = this.buildReasoningText({
      property,
      boundedPrice,
      basePrice,
      seasonMultiplier,
      isWeekend,
      occupancyModifier,
      ratingPremium,
      competitorAvg,
      competitorsCount: competitors.length,
      zone: property.quartier,
    });

    return {
      id: `rec-${property.id}-${Date.now()}`,
      property_id: property.id,
      recommended_price: boundedPrice,
      min_price: minPrice,
      max_price: maxPrice,
      confidence_score: confidence,
      reasoning,
      factors: {
        base_adr: basePrice,
        occupancy_modifier: occupancyModifier,
        seasonality_modifier: totalSeasonalityModifier,
        rating_premium: ratingPremium,
        competitor_pressure: competitorPressure,
      },
      applied: false,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Génère une série temporelle prévisionnelle de tarification sur 30 jours
   */
  public static generate30DayForecast(
    property: Property,
    benchmark?: MarketBenchmark,
    competitors: CompetitorListing[] = []
  ): PricingForecastPoint[] {
    const points: PricingForecastPoint[] = [];
    const today = new Date();

    const compAvg = competitors.length > 0
      ? Math.round(competitors.map(c => c.nightly_price).reduce((a, b) => a + b, 0) / competitors.length)
      : property.base_price_mad;

    for (let i = 0; i < 30; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      const rec = this.calculateRecommendation({
        property,
        benchmark,
        competitors,
        targetDate,
      });

      // Simulation de la demande journalière
      const dayOfWeek = targetDate.getDay();
      const demandFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.25 : 0.95;

      const dateStr = targetDate.toISOString().split("T")[0];

      points.push({
        date: dateStr,
        recommended_price: rec.recommended_price,
        current_price: property.base_price_mad,
        competitors_avg: compAvg,
        market_adr: benchmark?.avg_daily_rate || property.base_price_mad,
        occupancy_demand_factor: Number(demandFactor.toFixed(2)),
      });
    }

    return points;
  }

  /**
   * Construit la synthèse explicative de la recommandation
   */
  private static buildReasoningText(ctx: {
    property: Property;
    boundedPrice: number;
    basePrice: number;
    seasonMultiplier: number;
    isWeekend: boolean;
    occupancyModifier: number;
    ratingPremium: number;
    competitorAvg: number;
    competitorsCount: number;
    zone: string;
  }): string {
    const delta = ctx.boundedPrice - ctx.property.base_price_mad;
    const deltaPct = Math.round((delta / ctx.property.base_price_mad) * 100);
    const sign = deltaPct >= 0 ? "+" : "";

    const parts: string[] = [];

    parts.push(
      `Tarif optimisé à **${ctx.boundedPrice.toLocaleString("fr-FR")} MAD** (${sign}${deltaPct}% vs tarif de base ${ctx.property.base_price_mad.toLocaleString("fr-FR")} MAD).`
    );

    if (ctx.seasonMultiplier > 1.15) {
      parts.push(`🔥 Haute saison touristique sur Marrakech (Indice saisonnier ×${ctx.seasonMultiplier}).`);
    } else if (ctx.seasonMultiplier < 0.85) {
      parts.push(`☀️ Période estivale modérée : ajustement pour stimuler l'occupation.`);
    }

    if (ctx.isWeekend) {
      parts.push(`🎉 Majoration weekend appliquée (+${Math.round(this.WEEKEND_PREMIUM_PCT * 100)}% vendredis & samedis).`);
    }

    if (ctx.ratingPremium > 1.05) {
      parts.push(`⭐ Prime de standing : note exceptionnelle de ${ctx.property.rating}/5 valorisée face au marché.`);
    }

    if (ctx.competitorsCount > 0) {
      parts.push(
        `🔍 Alignement concurrentiel : benchmark sur ${ctx.competitorsCount} biens vérifiés à ${ctx.zone} (Moyenne marché: ${ctx.competitorAvg.toLocaleString("fr-FR")} MAD).`
      );
    }

    return parts.join(" ");
  }
}
