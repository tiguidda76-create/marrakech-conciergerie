import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const billingStatus = {
    timestamp: new Date().toISOString(),
    agent: "Billing-Officer-06",
    billingCycle: "Août 2026",
    grossRevenueMAD: 124500,
    conciergeCommissionMAD: 31125,
    ownerPayoutsDueMAD: 93375,
    payoutRule: "Virement bancaire à J+5 après fin de séjour",
    status: "Bordereaux et factures prêts pour transmission",
  };

  return NextResponse.json({ success: true, ...billingStatus });
}
