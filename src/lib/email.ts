import { Booking, Owner } from "@/types";
import { formatMAD, formatDate } from "./utils";
import { LEGAL_ENTITY } from "./constants";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  recipient: string;
}

export async function sendGuestBookingConfirmation(booking: Booking): Promise<EmailResult> {
  return {
    success: true,
    messageId: `msg-guest-${Date.now()}`,
    recipient: booking.guest_email || "voyageur@client.com",
  };
}

export async function sendOwnerMonthlyStatement(
  owner: Owner,
  month: string,
  grossRevenueMad: number,
  commissionMad: number,
  payoutMad: number
): Promise<EmailResult> {
  return {
    success: true,
    messageId: `msg-owner-${Date.now()}`,
    recipient: owner.email,
  };
}
