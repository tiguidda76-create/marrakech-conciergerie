import { NextResponse } from "next/server";
import { RealProspectHunterService } from "@/lib/prospects/realProspectHunter";
import { PropertyQuartier } from "@/types";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const zone: PropertyQuartier = body.zone || "medina";
    const limit = Number(body.limit) || 6;

    // Scan en direct via Prospect Hunter
    const leads = await RealProspectHunterService.huntProspects(zone, limit);

    // Sauvegarde dans Supabase si connecté
    const supabase = await createServerClient();
    if (supabase && leads.length > 0) {
      try {
        await supabase.from("prospect_leads").upsert(
          leads.map(l => ({
            title: l.title,
            zone: l.zone,
            property_type: l.property_type,
            bedrooms: l.bedrooms,
            nightly_price: l.nightly_price,
            estimated_adr: l.estimated_adr,
            estimated_gain_annual_mad: l.estimated_gain_annual_mad,
            rating: l.rating,
            reviews_count: l.reviews_count,
            platform: l.platform,
            url: l.url,
            owner_name: l.owner_name,
            owner_contact: l.owner_contact,
            outreach_status: l.outreach_status,
            opportunity_score: l.opportunity_score,
            audit_notes: l.audit_notes,
            suggested_message_whatsapp: l.suggested_message_whatsapp,
            suggested_message_email: l.suggested_message_email,
            created_at: l.created_at,
          })),
          { onConflict: "url" }
        );
      } catch (dbErr) {
        console.warn("[ProspectHunt] Table prospect_leads indisponible, envoi direct en mémoire");
      }
    }

    return NextResponse.json({
      success: true,
      zone,
      discovered_leads_count: leads.length,
      leads,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ProspectHunt] Erreur:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
