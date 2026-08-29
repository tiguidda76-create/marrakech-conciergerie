import { NextResponse } from "next/server";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { CompetitorScraperService } from "@/lib/market/competitorScraper";
import { PricingEngine } from "@/lib/market/pricingEngine";
import { MarketBenchmark, Property, PropertyQuartier } from "@/types";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const DEFAULT_BENCHMARKS: Record<string, MarketBenchmark> = {
  medina: {
    id: "bm-medina",
    zone: "medina",
    property_type: "riad",
    bedrooms: 5,
    avg_daily_rate: 4200,
    occupancy_rate: 84.5,
    revpar: 3549,
    active_listings_count: 480,
    seasonality_factor: 1.25,
    source: "inside_airbnb",
    updated_at: new Date().toISOString(),
  },
  palmeraie: {
    id: "bm-palmeraie",
    zone: "palmeraie",
    property_type: "villa",
    bedrooms: 6,
    avg_daily_rate: 8900,
    occupancy_rate: 76.5,
    revpar: 6808,
    active_listings_count: 210,
    seasonality_factor: 1.35,
    source: "inside_airbnb",
    updated_at: new Date().toISOString(),
  },
  gueliz: {
    id: "bm-gueliz",
    zone: "gueliz",
    property_type: "appartement",
    bedrooms: 2,
    avg_daily_rate: 1450,
    occupancy_rate: 89.0,
    revpar: 1290,
    active_listings_count: 810,
    seasonality_factor: 1.10,
    source: "inside_airbnb",
    updated_at: new Date().toISOString(),
  },
  hivernage: {
    id: "bm-hivernage",
    zone: "hivernage",
    property_type: "duplex",
    bedrooms: 3,
    avg_daily_rate: 2900,
    occupancy_rate: 81.5,
    revpar: 2363,
    active_listings_count: 290,
    seasonality_factor: 1.25,
    source: "inside_airbnb",
    updated_at: new Date().toISOString(),
  },
  targa: {
    id: "bm-targa",
    zone: "targa",
    property_type: "appartement",
    bedrooms: 2,
    avg_daily_rate: 1100,
    occupancy_rate: 68.0,
    revpar: 748,
    active_listings_count: 310,
    seasonality_factor: 1.05,
    source: "inside_airbnb",
    updated_at: new Date().toISOString(),
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    let property: Property | undefined;
    const supabase = await createServerClient();

    if (supabase) {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (data) property = data as Property;
    }

    if (!property) {
      property = MOCK_PROPERTIES.find(p => p.id === propertyId) || MOCK_PROPERTIES[0];
    }

    const zone = (property.quartier || "medina") as PropertyQuartier;
    const benchmark = DEFAULT_BENCHMARKS[zone] || DEFAULT_BENCHMARKS.medina;

    const competitors = await CompetitorScraperService.scrapeCompetitors({
      zone,
      propertyType: property.type,
      bedrooms: property.bedrooms,
      limit: 5,
    });

    const recommendation = PricingEngine.calculateRecommendation({
      property,
      benchmark,
      competitors,
      targetDate: new Date(),
    });

    const forecast = PricingEngine.generate30DayForecast(
      property,
      benchmark,
      competitors
    );

    return NextResponse.json({
      success: true,
      property,
      benchmark,
      competitors,
      recommendation,
      forecast,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const body = await request.json();
    const newPriceMAD = Number(body.price_mad);

    if (!newPriceMAD || isNaN(newPriceMAD) || newPriceMAD <= 0) {
      return NextResponse.json(
        { success: false, error: "Prix en MAD invalide" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    if (supabase) {
      await supabase
        .from("properties")
        .update({ base_price_mad: newPriceMAD })
        .eq("id", propertyId);

      await supabase.from("pricing_recommendations").insert({
        property_id: propertyId,
        recommended_price: newPriceMAD,
        applied: true,
        applied_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Tarif du bien mis à jour avec succès à ${newPriceMAD.toLocaleString("fr-FR")} MAD/nuit`,
      propertyId,
      new_price_mad: newPriceMAD,
      applied_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur d'application",
      },
      { status: 500 }
    );
  }
}
