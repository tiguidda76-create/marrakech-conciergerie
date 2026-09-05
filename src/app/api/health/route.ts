import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Marrakech Conciergerie Dashboard",
    currency: "MAD",
    timezone: "Africa/Casablanca",
    timestamp: new Date().toISOString(),
  });
}
