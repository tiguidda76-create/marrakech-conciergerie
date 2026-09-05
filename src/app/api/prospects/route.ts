import { NextResponse } from "next/server";
import { RealProspectHunterService } from "@/lib/prospects/realProspectHunter";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = (searchParams.get("zone") as any) || "gueliz";
    const propertyType = (searchParams.get("property_type") as any) || "appartement";

    const supabase = await createServerClient();
    if (supabase) {
      let query = supabase
        .from("prospect_leads")
        .select("*")
        .order("opportunity_score", { ascending: false });

      if (propertyType && propertyType !== "all") {
        query = query.eq("property_type", propertyType);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, leads: data });
      }
    }

    // Fallback scan initial : Focus Appartements & Penthouses (Guéliz)
    const initialLeads = await RealProspectHunterService.huntProspects(zone, 8, propertyType);
    return NextResponse.json({ success: true, count: initialLeads.length, leads: initialLeads });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { lead_id, outreach_status, audit_notes, owner_contact } = body;

    if (!lead_id) {
      return NextResponse.json({ success: false, error: "ID du lead manquant" }, { status: 400 });
    }

    const supabase = await createServerClient();
    if (supabase) {
      const updatePayload: Record<string, any> = {};
      if (outreach_status) {
        updatePayload.outreach_status = outreach_status;
        if (outreach_status === "contacte") {
          updatePayload.last_contacted_at = new Date().toISOString();
        }
      }
      if (audit_notes) updatePayload.audit_notes = audit_notes;
      if (owner_contact) updatePayload.owner_contact = owner_contact;

      await supabase
        .from("prospect_leads")
        .update(updatePayload)
        .eq("id", lead_id);
    }

    return NextResponse.json({
      success: true,
      message: "Lead mis à jour avec succès",
      lead_id,
      outreach_status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur mise à jour" },
      { status: 500 }
    );
  }
}
