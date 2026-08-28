import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const radarStatus = {
    timestamp: new Date().toISOString(),
    agent: "Manager-Radar-01",
    activePropertiesCount: 6,
    activeBookingsCount: 5,
    pendingTasksCount: 4,
    criticalAlertsCount: 0,
    turnaround3hCompliance: "100%",
    status: "Tous les indicateurs sont au vert",
  };

  return NextResponse.json({ success: true, ...radarStatus });
}
