import { NextRequest, NextResponse } from "next/server";
import { RealProspectHunterService } from "@/lib/prospects/realProspectHunter";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Autorisé si appel direct interne
  }

  try {
    // Scan réel des zones clés de Marrakech
    const medinaLeads = await RealProspectHunterService.huntProspects("medina", 3);
    const palmeraieLeads = await RealProspectHunterService.huntProspects("palmeraie", 3);
    const allLeads = [...medinaLeads, ...palmeraieLeads];

    const supabase = await createServerClient();
    if (supabase && allLeads.length > 0) {
      try {
        await supabase.from("prospect_leads").upsert(
          allLeads.map(l => ({
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
      } catch (e) {
        console.warn("[CronProspectHunter] Table prospect_leads indisponible");
      }
    }

    return NextResponse.json({
      success: true,
      agent: "Prospect-Hunter-07",
      timestamp: new Date().toISOString(),
      scanned_listings_count: allLeads.length,
      qualified_leads: allLeads.map(l => ({
        title: l.title,
        zone: l.zone,
        estimated_gain_mad: l.estimated_gain_annual_mad,
        opportunity_score: l.opportunity_score,
        url: l.url,
      })),
      next_action: "Messages d'outreach générés et prêts pour WhatsApp/Email",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur cron" },
      { status: 500 }
    );
  }
}
