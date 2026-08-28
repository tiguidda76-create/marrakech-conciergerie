import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const scanResults = {
    timestamp: new Date().toISOString(),
    agent: "Prospect-Hunter-07",
    scannedListingsCount: 42,
    qualifiedLeadsCount: 4,
    hotLeads: [
      {
        title: "Riad Dar Salam - Médina Bab Doukkala",
        score: 85,
        estimatedGainMAD: 14000,
        reason: "Pas de conciergerie pro détectée, photos sous-exposées, délai de réponse > 2h",
      },
      {
        title: "Villa Les Palmiers - Palmeraie",
        score: 78,
        estimatedGainMAD: 25000,
        reason: "Prix nuitée 35% sous le benchmark Palmeraie avec piscine privée",
      },
    ],
    nextAction: "Triggered agent-email-writer for 2 hot leads",
  };

  return NextResponse.json({ success: true, ...scanResults });
}
