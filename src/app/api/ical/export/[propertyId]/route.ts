import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROPERTIES, MOCK_BOOKINGS } from "@/lib/mockData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const property = MOCK_PROPERTIES.find((p) => p.id === propertyId);

  const propName = property ? property.name : "Marrakech Property";
  const propBookings = MOCK_BOOKINGS.filter((b) => b.property_id === propertyId);

  // Format dates to iCal YYYYMMDD
  const formatIcalDate = (dateStr: string) => dateStr.replace(/-/g, "");

  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Marrakech Conciergerie//iCal Sync 1.0//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${propName} - Calendrier`,
    "X-WR-TIMEZONE:Africa/Casablanca",
  ];

  for (const b of propBookings) {
    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@marrakech-concierge.ma`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(b.check_in)}`,
      `DTEND;VALUE=DATE:${formatIcalDate(b.check_out)}`,
      `SUMMARY:Réservé (${b.platform.toUpperCase()}) - ${b.guest_name}`,
      `DESCRIPTION:Séjour ${b.nights} nuits • ${b.guests_count} personnes. Marrakech Conciergerie.`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  icsContent.push("END:VCALENDAR");

  return new NextResponse(icsContent.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${propertyId}-calendar.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
