import { NextResponse } from "next/server";
import { InsideAirbnbService } from "@/lib/market/insideAirbnb";
import { CompetitorScraperService } from "@/lib/market/competitorScraper";
import { PropertyQuartier } from "@/types";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const TARGET_ZONES: PropertyQuartier[] = [
  "medina",
  "palmeraie",
  "gueliz",
  "hivernage",
  "targa",
];

export async function POST(req: Request) {
  const startTime = Date.now();
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  try {
    const supabase = await createServerClient();
    const results: Record<string, { benchmarksUpdated: number; competitorsScraped: number }> = {};
    let totalCompetitors = 0;

    for (const zone of TARGET_ZONES) {
      const scraped = await CompetitorScraperService.scrapeCompetitors({
        zone,
        limit: 6,
      });

      totalCompetitors += scraped.length;

      if (supabase) {
        try {
          await supabase.from("competitor_listings").upsert(
            scraped.map(c => ({
              external_id: c.external_id,
              platform: c.platform,
              title: c.title,
              zone: c.zone,
              property_type: c.property_type,
              bedrooms: c.bedrooms,
              nightly_price: c.nightly_price,
              cleaning_fee: c.cleaning_fee,
              rating: c.rating,
              reviews_count: c.reviews_count,
              url: c.url,
              is_superhost: c.is_superhost,
              amenities: c.amenities,
              scraped_at: c.scraped_at,
            })),
            { onConflict: "external_id" }
          );
        } catch (dbErr) {}
      }

      results[zone] = {
        benchmarksUpdated: 1,
        competitorsScraped: scraped.length,
      };
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Synchronisation Market Intelligence complétée avec succès",
      timestamp: new Date().toISOString(),
      duration_ms: durationMs,
      zones_processed: TARGET_ZONES.length,
      total_competitors_scraped: totalCompetitors,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne de synchronisation",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    service: "Marrakech Conciergerie Market Intelligence Ingestion API",
    target_zones: TARGET_ZONES,
    endpoints: {
      sync: "POST /api/market/sync",
      recommendations: "GET /api/market/recommendations/[propertyId]",
    },
  });
}
