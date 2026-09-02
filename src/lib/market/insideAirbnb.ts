/**
 * Inside Airbnb Macro & Historical Data Ingestion Service
 * Module Market Intelligence — Marrakech Conciergerie (AirDNA Open-Source Alternative)
 */

import { MarketBenchmark, PropertyQuartier, PropertyType } from "@/types";

export interface InsideAirbnbRawListing {
  id: string;
  name: string;
  neighbourhood_cleansed: string;
  room_type: string;
  accommodates: number;
  bedrooms: number;
  price: string; // e.g. "$120.00" or "1200 MAD"
  number_of_reviews: number;
  review_scores_rating: number;
  availability_30: number;
  availability_90: number;
  availability_365: number;
}

export interface InsideAirbnbCalendarRow {
  listing_id: string;
  date: string;
  available: 't' | 'f';
  price: string;
}

export interface QuartierAggregatedStats {
  zone: PropertyQuartier | string;
  propertyType: PropertyType;
  bedrooms: number;
  sampleSize: number;
  avgDailyRateMAD: number;
  medianPriceMAD: number;
  occupancyRatePct: number;
  revPARMAD: number;
  seasonalityFactor: number;
  historicalP90MAD: number;
  historicalP10MAD: number;
}

// Mapping des quartiers officiels de Marrakech pour Inside Airbnb
const ZONE_NORMALIZATION_MAP: Record<string, PropertyQuartier> = {
  "medina": "medina",
  "médina": "medina",
  "dar el bacha": "medina",
  "bab doukkala": "medina",
  "riad zitoun": "medina",
  "gueliz": "gueliz",
  "guéliz": "gueliz",
  "hivernage": "hivernage",
  "l'hivernage": "hivernage",
  "palmeraie": "palmeraie",
  "la palmeraie": "palmeraie",
  "targa": "targa",
};

// Facteurs de saisonnalité historiques pour Marrakech (mois 1 à 12)
export const MARRAKECH_SEASONALITY_FACTORS: Record<number, number> = {
  1: 1.10, // Janvier: Hiver doux & golf
  2: 1.15, // Février: Vacances scolaires EU
  3: 1.30, // Mars: Printemps, pic touristique
  4: 1.45, // Avril: Très haute saison (Pâques)
  5: 1.35, // Mai: Climat idéal
  6: 0.90, // Juin: Début des fortes chaleurs
  7: 0.75, // Juillet: Basse saison estivale (chaleur)
  8: 0.70, // Août: Basse saison
  9: 1.10, // Septembre: Reprise
  10: 1.40, // Octobre: Pic automnal très fort
  11: 1.35, // Novembre: Événements, festivals
  12: 1.50, // Décembre: Fêtes de fin d'année (Nouvel An VIP)
};

export class InsideAirbnbService {
  private static readonly USD_TO_MAD_RATE = 10.15;
  private static readonly EUR_TO_MAD_RATE = 10.95;

  /**
   * Parse un flux CSV ou texte brut de Inside Airbnb (listings.csv)
   */
  public static parseListingsCSV(csvText: string): InsideAirbnbRawListing[] {
    const lines = csvText.trim().split("\n");
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const results: InsideAirbnbRawListing[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVLine(lines[i]);
      if (row.length === headers.length) {
        const item: Record<string, string> = {};
        headers.forEach((h, idx) => {
          item[h] = row[idx];
        });

        results.push({
          id: item["id"] || `csv-${i}`,
          name: item["name"] || "",
          neighbourhood_cleansed: item["neighbourhood_cleansed"] || item["neighbourhood"] || "Medina",
          room_type: item["room_type"] || "Entire home/apt",
          accommodates: parseInt(item["accommodates"] || "2", 10),
          bedrooms: parseInt(item["bedrooms"] || "1", 10),
          price: item["price"] || "1000",
          number_of_reviews: parseInt(item["number_of_reviews"] || "0", 10),
          review_scores_rating: parseFloat(item["review_scores_rating"] || "4.8"),
          availability_30: parseInt(item["availability_30"] || "10", 10),
          availability_90: parseInt(item["availability_90"] || "30", 10),
          availability_365: parseInt(item["availability_365"] || "120", 10),
        });
      }
    }

    return results;
  }

  /**
   * Normalise une chaîne de prix en Dirham Marocain (MAD)
   */
  public static parsePriceToMAD(priceStr: string | number): number {
    if (typeof priceStr === "number") return priceStr;
    const clean = priceStr.replace(/[^0-9.,]/g, "").replace(",", ".");
    const val = parseFloat(clean) || 0;

    if (priceStr.includes("$")) return Math.round(val * this.USD_TO_MAD_RATE);
    if (priceStr.includes("€")) return Math.round(val * this.EUR_TO_MAD_RATE);
    return Math.round(val);
  }

  /**
   * Normalise le quartier vers notre typologie
   */
  public static normalizeZone(zoneRaw: string): PropertyQuartier {
    const clean = zoneRaw.toLowerCase().trim();
    for (const [key, normalized] of Object.entries(ZONE_NORMALIZATION_MAP)) {
      if (clean.includes(key)) return normalized;
    }
    return "autre";
  }

  /**
   * Déduit le type de bien à partir des caractéristiques Inside Airbnb
   */
  public static inferPropertyType(listing: InsideAirbnbRawListing): PropertyType {
    const name = listing.name.toLowerCase();
    if (name.includes("riad")) return "riad";
    if (name.includes("villa")) return "villa";
    if (name.includes("duplex") || name.includes("rooftop")) return "duplex";
    if (listing.bedrooms === 1 || name.includes("studio")) return "studio";
    return "appartement";
  }

  /**
   * Calcule les métriques agrégées (ADR, Taux d'occupation, RevPAR, Percentiles)
   */
  public static aggregateMarketData(
    listings: InsideAirbnbRawListing[],
    currentMonth: number = new Date().getMonth() + 1
  ): QuartierAggregatedStats[] {
    const groups: Map<string, InsideAirbnbRawListing[]> = new Map();

    listings.forEach(item => {
      const zone = this.normalizeZone(item.neighbourhood_cleansed);
      const propType = this.inferPropertyType(item);
      const bedrooms = Math.max(1, Math.min(item.bedrooms || 1, 8));
      const groupKey = `${zone}__${propType}__${bedrooms}`;

      const list = groups.get(groupKey) || [];
      list.push(item);
      groups.set(groupKey, list);
    });

    const stats: QuartierAggregatedStats[] = [];
    const seasonFactor = MARRAKECH_SEASONALITY_FACTORS[currentMonth] || 1.0;

    groups.forEach((groupList, key) => {
      const [zone, propType, bedroomsStr] = key.split("__");
      const bedrooms = parseInt(bedroomsStr, 10);

      // Calcul des prix en MAD
      const prices = groupList
        .map(l => this.parsePriceToMAD(l.price))
        .filter(p => p > 200 && p < 100000)
        .sort((a, b) => a - b);

      if (prices.length === 0) return;

      const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      const medianPrice = prices[Math.floor(prices.length / 2)];
      const p10 = prices[Math.floor(prices.length * 0.1)] || prices[0];
      const p90 = prices[Math.floor(prices.length * 0.9)] || prices[prices.length - 1];

      // Estimation du taux d'occupation via availability_30 (Jours réservés = 30 - dispo)
      const occupancyRates = groupList.map(l => {
        const bookedDays = Math.max(0, 30 - (l.availability_30 || 15));
        return (bookedDays / 30) * 100;
      });
      const avgOccupancy = Math.min(
        98,
        Math.max(40, Math.round(occupancyRates.reduce((s, r) => s + r, 0) / occupancyRates.length))
      );

      const revPAR = Math.round(avgPrice * (avgOccupancy / 100));

      stats.push({
        zone: zone as PropertyQuartier,
        propertyType: propType as PropertyType,
        bedrooms,
        sampleSize: groupList.length,
        avgDailyRateMAD: avgPrice,
        medianPriceMAD: medianPrice,
        occupancyRatePct: avgOccupancy,
        revPARMAD: revPAR,
        seasonalityFactor: seasonFactor,
        historicalP10MAD: p10,
        historicalP90MAD: p90,
      });
    });

    return stats;
  }

  /**
   * Génère les benchmarks prêts à insérer en base de données Supabase
   */
  public static toMarketBenchmarks(stats: QuartierAggregatedStats[]): Omit<MarketBenchmark, "id">[] {
    const now = new Date().toISOString();
    return stats.map(s => ({
      zone: s.zone,
      property_type: s.propertyType,
      bedrooms: s.bedrooms,
      avg_daily_rate: s.avgDailyRateMAD,
      occupancy_rate: s.occupancyRatePct,
      revpar: s.revPARMAD,
      active_listings_count: s.sampleSize,
      seasonality_factor: s.seasonalityFactor,
      source: "inside_airbnb",
      updated_at: now,
    }));
  }

  /**
   * Helper pour parser les lignes CSV avec guillemets
   */
  private static parseCSVLine(text: string): string[] {
    const p: string[] = [];
    let entry = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        p.push(entry.trim().replace(/^["']|["']$/g, ""));
        entry = "";
      } else {
        entry += char;
      }
    }
    p.push(entry.trim().replace(/^["']|["']$/g, ""));
    return p;
  }
}
