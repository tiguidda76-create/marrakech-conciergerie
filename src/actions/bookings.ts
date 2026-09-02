"use server";

import { revalidatePath } from "next/cache";
import { Booking, BookingPlatform } from "@/types";
import { TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD } from "@/lib/constants";

export async function createBookingAction(data: {
  property_id: string;
  property_name: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  platform: BookingPlatform;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_mad: number;
  notes?: string;
}) {
  const tourist_tax_mad = data.nights * data.guests_count * TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD;

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    property_id: data.property_id,
    property_name: data.property_name,
    guest_name: data.guest_name,
    guest_email: data.guest_email || "",
    guest_phone: data.guest_phone || "",
    platform: data.platform,
    check_in: data.check_in,
    check_out: data.check_out,
    nights: data.nights,
    guests_count: data.guests_count,
    total_mad: data.total_mad,
    tourist_tax_mad,
    commission_pct: 25,
    status: "confirmed",
    notes: data.notes || "",
    created_at: new Date().toISOString(),
  };

  revalidatePath("/reservations");
  revalidatePath("/calendrier");
  revalidatePath("/finances");
  revalidatePath("/");

  return { success: true, booking: newBooking };
}

export async function cancelBookingAction(bookingId: string) {
  revalidatePath("/reservations");
  revalidatePath("/calendrier");
  revalidatePath("/finances");
  revalidatePath("/");
  return { success: true, bookingId };
}
