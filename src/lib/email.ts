import nodemailer from 'nodemailer';
import { Booking, Owner } from "@/types";
import { formatMAD, formatDate } from "./utils";
import { LEGAL_ENTITY } from "./constants";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  provider?: string;
  error?: string;
}

function getMailTransporter() {
  const user = process.env.GMAIL_USER || 'tiguidda76@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD || 'bfgznhusgoyrlpml';

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }
  return null;
}

export async function sendGuestBookingConfirmation(booking: Booking): Promise<EmailResult> {
  const recipient = booking.guest_email || "tiguidda76@gmail.com";
  const subject = `Confirmation de votre séjour à Marrakech — ${booking.property_name}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #12121A; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background-color: #12121A; padding: 24px; text-align: center; color: #C49A6C;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 2px;">MARRAKECH CONCIERGERIE</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; color: #F5EBE1;">Séjour d'Exception & Hospitalité Privée 🇲🇦</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="font-size: 16px; color: #12121A; margin-top: 0;">Bienvenue à Marrakech, ${booking.guest_name} !</h2>
        <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
          Votre réservation pour <strong>${booking.property_name}</strong> est bien confirmée. Notre équipe de conciergerie prépare votre arrivée personnalisée.
        </p>
        <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Arrivée (Check-in) :</strong> ${formatDate(booking.check_in)} à partir de 14h00</p>
          <p style="margin: 4px 0;"><strong>Départ (Check-out) :</strong> ${formatDate(booking.check_out)} jusqu'à 11h00</p>
          <p style="margin: 4px 0;"><strong>Durée :</strong> ${booking.nights} nuits • ${booking.guests_count} personnes</p>
          <p style="margin: 4px 0;"><strong>Montant Total :</strong> ${formatMAD(booking.total_mad)}</p>
          <p style="margin: 4px 0; color: #92400E;"><strong>Taxe de séjour incluse (11 MAD/p/n) :</strong> ${formatMAD(booking.tourist_tax_mad, false)}</p>
        </div>
        <div style="margin: 24px 0; text-align: center;">
          <a href="https://wa.me/212632155430?text=Bonjour%20Si%20Hassan,%20je%20vous%20contacte%20concernant%20ma%20r%C3%A9servation%20pour%20${encodeURIComponent(booking.property_name || 'votre propriété')}." style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 8px; display: inline-block;">
            💬 Contacter votre Concierge WhatsApp (${LEGAL_ENTITY.rawPhone})
          </a>
        </div>
        <p style="font-size: 12px; color: #6B7280; text-align: center;">
          Notre concierge reste à votre disposition 24h/24 pour organiser vos transferts aéroport, cuisinière privée et excursions.
        </p>
      </div>
      <div style="background-color: #F3F4F6; padding: 16px; text-align: center; font-size: 11px; color: #9CA3AF;">
        ${LEGAL_ENTITY.name} • ICE: ${LEGAL_ENTITY.ice} • Tél: ${LEGAL_ENTITY.phone}
      </div>
    </div>
  `;

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${LEGAL_ENTITY.brand}" <${process.env.GMAIL_USER || 'tiguidda76@gmail.com'}>`,
        to: recipient,
        subject,
        html,
      });
      return {
        success: true,
        messageId: info.messageId,
        recipient,
        provider: 'GMAIL_SMTP'
      };
    }
  } catch (err: any) {
    console.error('Failed to dispatch booking confirmation email:', err);
    return {
      success: false,
      recipient,
      error: err.message
    };
  }

  return {
    success: true,
    messageId: `sim-${Date.now()}`,
    recipient,
    provider: 'LOCAL_QUEUE'
  };
}

export async function sendOwnerMonthlyStatement(
  owner: Owner,
  month: string,
  grossRevenueMad: number,
  commissionMad: number,
  payoutMad: number
): Promise<EmailResult> {
  const recipient = owner.email || "tiguidda76@gmail.com";
  const subject = `Relevé Mensuel de Gestion Conciergerie (${month}) — ${LEGAL_ENTITY.brand}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #12121A; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background-color: #12121A; padding: 20px; text-align: center; color: #C49A6C;">
        <h2 style="margin: 0; font-size: 18px;">RELEVÉ DE REVENUS CONCIERGERIE</h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #F5EBE1;">Période : ${month}</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 13px;">Bonjour <strong>${owner.name}</strong>,</p>
        <p style="font-size: 13px; color: #4B5563;">
          Voici le récapitulatif financier certifié de vos propriétés gérées à Marrakech pour le mois de ${month} :
        </p>
        <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
          <p style="margin: 6px 0;"><strong>Revenus Bruts Locatifs :</strong> ${formatMAD(grossRevenueMad)}</p>
          <p style="margin: 6px 0;"><strong>Honoraires Conciergerie (25%) :</strong> -${formatMAD(commissionMad)}</p>
          <div style="border-top: 2px solid #C49A6C; margin-top: 10px; padding-top: 10px;">
            <p style="margin: 0; font-size: 15px; font-weight: bold; color: #065F46;">
              Net Virement Propriétaire : ${formatMAD(payoutMad)}
            </p>
          </div>
        </div>
        <p style="font-size: 11px; color: #6B7280;">
          Virement exécuté depuis notre compte BMCE Bank (RIB: ${LEGAL_ENTITY.rib}). ${LEGAL_ENTITY.tvaExemptionMention}.
        </p>
      </div>
      <div style="background-color: #F3F4F6; padding: 12px; text-align: center; font-size: 11px; color: #9CA3AF;">
        ${LEGAL_ENTITY.name} • ${LEGAL_ENTITY.address} • WhatsApp: ${LEGAL_ENTITY.phone}
      </div>
    </div>
  `;

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${LEGAL_ENTITY.name}" <${process.env.GMAIL_USER || 'tiguidda76@gmail.com'}>`,
        to: recipient,
        subject,
        html,
      });
      return {
        success: true,
        messageId: info.messageId,
        recipient,
        provider: 'GMAIL_SMTP'
      };
    }
  } catch (err: any) {
    console.error('Failed to dispatch owner statement email:', err);
    return {
      success: false,
      recipient,
      error: err.message
    };
  }

  return {
    success: true,
    messageId: `stmt-${Date.now()}`,
    recipient,
    provider: 'LOCAL_QUEUE'
  };
}
