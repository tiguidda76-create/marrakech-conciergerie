import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { LEGAL_ENTITY } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, recipient, content } = body;

    const user = process.env.GMAIL_USER || 'tiguidda76@gmail.com';
    const pass = process.env.GMAIL_APP_PASSWORD || 'bfgznhusgoyrlpml';

    let deliveryStatus = 'QUEUED';
    let messageId: string | undefined;

    if (user && pass && recipient?.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });

        const info = await transporter.sendMail({
          from: `"${LEGAL_ENTITY.brand}" <${user}>`,
          to: recipient.email,
          subject: content?.subject || `Proposition Conciergerie Privée Marrakech — ${recipient.venueName || recipient.name}`,
          text: content?.messageText || 'Audit et gestion conciergerie privée pour votre propriété à Marrakech.',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: #12121a; padding: 20px; text-align: center; color: #c49a6c;">
                <h2 style="margin: 0; font-size: 18px;">MARRAKECH CONCIERGERIE PRIVÉE 🇲🇦</h2>
              </div>
              <div style="padding: 24px; color: #1e293b;">
                <p style="font-size: 14px;">Bonjour <strong>${recipient.contactPerson || recipient.name || 'Propriétaire'}</strong>,</p>
                <p style="font-size: 13px; line-height: 1.6; color: #334155;">
                  ${content?.messageText || 'Notre conciergerie privée prend en charge l\'intendance complète, l\'accueil VIP et l\'optimisation de vos revenus locatifs à Marrakech.'}
                </p>
                <div style="margin: 24px 0; text-align: center;">
                  <a href="https://wa.me/212632155430?text=Bonjour%20Si%20Hassan%20Tiguidda,%20je%20souhaite%20%C3%A9changer%20concernant%20la%20gestion%20de%20ma%20propri%C3%A9t%C3%A9." style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 8px; display: inline-block;">
                    💬 Échanger sur WhatsApp (0632155430)
                  </a>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
                ${LEGAL_ENTITY.name} • ICE: ${LEGAL_ENTITY.ice} • Tél: ${LEGAL_ENTITY.phone}
              </div>
            </div>
          `
        });

        deliveryStatus = 'DELIVERED_REAL';
        messageId = info.messageId;
      } catch (mailErr: any) {
        console.error('Mail dispatch error:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      executionId: `exec_${Date.now()}`,
      status: deliveryStatus,
      messageId,
      recipient: recipient?.email || recipient?.phone,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
