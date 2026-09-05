import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { LEGAL_ENTITY } from '@/lib/constants';

const dnsPromises = dns.promises;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, recipient, content } = body;

    const recipientEmail = (recipient?.email || '').trim();

    // =========================================================================
    // BOUCLIER ANTI-BOUNCE DNS : Vérifie que le domaine destinataire existe
    // et possède un serveur MX avant tout envoi pour protéger la boîte Gmail.
    // =========================================================================
    if (recipientEmail) {
      const domain = recipientEmail.split('@')[1];
      if (!domain || !domain.includes('.')) {
        return NextResponse.json({
          success: false,
          error: `Adresse email invalide ("${recipientEmail}"). Envoi annulé.`
        }, { status: 400 });
      }

      try {
        const mxRecords = await dnsPromises.resolveMx(domain.trim());
        if (!mxRecords || mxRecords.length === 0) {
          console.warn(`[Anti-Bounce Blocked] Le domaine ${domain} n'a pas de serveur MX actif.`);
          return NextResponse.json({
            success: false,
            error: `Le domaine "${domain}" ne possède aucun serveur email actif (enregistrement MX introuvable). Envoi bloqué pour éviter un rejet (bounce).`
          }, { status: 400 });
        }
      } catch (dnsErr: any) {
        console.warn(`[Anti-Bounce Blocked] Domaine introuvable ${domain}:`, dnsErr?.code);
        return NextResponse.json({
          success: false,
          error: `Le domaine "${domain}" est introuvable sur Internet (NXDOMAIN). Envoi bloqué pour protéger la réputation de votre boîte Gmail.`
        }, { status: 400 });
      }
    }

    const user = process.env.GMAIL_USER || 'tiguidda76@gmail.com';
    const pass = process.env.GMAIL_APP_PASSWORD || 'bfgznhusgoyrlpml';

    let deliveryStatus = 'QUEUED';
    let messageId: string | undefined;

    if (user && pass && recipientEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });

        const subject = content?.subject || `Proposition Conciergerie Privée Marrakech — ${recipient.venueName || recipient.title || recipient.name || 'Propriété'}`;
        const messageText = content?.messageText || 'Audit et gestion conciergerie privée pour votre propriété à Marrakech.';
        const gainMAD = content?.gainMAD || '120 000';

        const info = await transporter.sendMail({
          from: `"${LEGAL_ENTITY.brand} — Hassan Tiguidda" <${user}>`,
          to: recipientEmail,
          replyTo: user,
          subject,
          text: messageText,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #12121a 0%, #1e1e2d 100%); padding: 24px; text-align: center; color: #c49a6c; border-bottom: 2px solid #c49a6c;">
                <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">MARRAKECH CONCIERGERIE PRIVÉE 🇲🇦</h2>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Intendance VIP & Optimisation Locative Haut de Gamme</p>
              </div>

              <div style="padding: 24px; color: #1e293b;">
                <p style="font-size: 14px; margin-top: 0;">Bonjour <strong>${recipient.contactPerson || recipient.name || 'Madame, Monsieur le Propriétaire'}</strong>,</p>
                
                <p style="font-size: 13px; line-height: 1.6; color: #334155;">
                  ${messageText.replace(/\n/g, '<br/>')}
                </p>

                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center;">
                  <div style="font-size: 11px; font-weight: bold; color: #15803d; text-transform: uppercase;">Potentiel d'Optimisation Locative Détecté</div>
                  <div style="font-size: 24px; font-weight: 900; color: #166534; margin: 4px 0;">+${gainMAD} MAD / an</div>
                  <div style="font-size: 11px; color: #475569;">Gestion intégrale à 25% (au succès) • 0 avance requise</div>
                </div>

                <div style="margin: 24px 0; text-align: center;">
                  <a href="https://wa.me/212632155430?text=${encodeURIComponent(`Bonjour Hassan Tiguidda, j'ai bien reçu votre proposition conciergerie et souhaite échanger concernant ma propriété à Marrakech.`)}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(5,150,105,0.3); margin-right: 8px;">
                    💬 Échanger sur WhatsApp (+212 6 32 15 54 30)
                  </a>
                  <a href="mailto:${user}?subject=${encodeURIComponent(subject)}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 20px; font-size: 13px; font-weight: bold; border-radius: 8px; display: inline-block;">
                    ✉️ Répondre par Email
                  </a>
                </div>

                <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                  Nous intervenons sur l'ensemble de Marrakech (Médina, Palmeraie, Guéliz, Hivernage, Targa, Amelkis).
                </p>
              </div>

              <div style="background: #f8fafc; padding: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
                <strong>${LEGAL_ENTITY.brand}</strong> — Fondateur : Hassan Tiguidda<br/>
                Tél / WhatsApp : ${LEGAL_ENTITY.phone} • Email : ${LEGAL_ENTITY.email}<br/>
                ICE : ${LEGAL_ENTITY.ice} • BMCE Bank Guéliz Marrakech RIB : ${LEGAL_ENTITY.rib}
              </div>
            </div>
          `
        });

        deliveryStatus = 'DELIVERED_REAL';
        messageId = info.messageId;
        console.log(`[Gmail SMTP Success] Envoyé à ${recipientEmail}, MessageID: ${messageId}`);
      } catch (mailErr: any) {
        console.error('Mail dispatch error:', mailErr);
        return NextResponse.json({
          success: false,
          error: mailErr?.message || 'Erreur lors de l\'envoi via le relais Gmail SMTP.'
        }, { status: 500 });
      }
    } else if (!recipientEmail && eventType === 'EMAIL') {
      return NextResponse.json({
        success: false,
        error: 'Aucune adresse email fournie pour ce prospect.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      executionId: `exec_${Date.now()}`,
      status: deliveryStatus,
      messageId: messageId || `wa_direct_${Date.now()}`,
      provider: recipientEmail ? 'GMAIL_SMTP' : 'WHATSAPP_DIRECT',
      recipient: recipientEmail || recipient?.phone || 'WhatsApp Direct',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
