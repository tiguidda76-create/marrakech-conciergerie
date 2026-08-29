/**
 * Real Prospect Hunter Engine & Outreach Generator
 * Détection et scoring en temps réel d'opportunités immobilières à Marrakech
 * Signature officielle : Hassan Tiguidda — Conciergerie Privée Marrakech
 */

import { 
  ProspectLead, 
  PropertyQuartier, 
  PropertyType, 
  OutreachStatus 
} from "@/types";
import { CompetitorScraperService } from "@/lib/market/competitorScraper";
import { LEGAL_ENTITY } from "@/lib/constants";

// Benchmarks moyens de référence par quartier pour calculer l'upside
const BENCHMARK_RATES: Record<string, { adr: number; targetOccupancy: number }> = {
  medina: { adr: 3200, targetOccupancy: 0.85 },
  palmeraie: { adr: 7800, targetOccupancy: 0.78 },
  gueliz: { adr: 1650, targetOccupancy: 0.88 },
  hivernage: { adr: 3100, targetOccupancy: 0.82 },
  targa: { adr: 1400, targetOccupancy: 0.75 },
  autre: { adr: 2200, targetOccupancy: 0.80 },
};

export class RealProspectHunterService {
  /**
   * Scanne en direct les biens d'un quartier pour identifier des opportunités de mandat
   */
  public static async huntProspects(zone: PropertyQuartier = "medina", limit: number = 6): Promise<ProspectLead[]> {
    const scrapedListings = await CompetitorScraperService.scrapeCompetitors({
      zone,
      limit,
    });

    const bench = BENCHMARK_RATES[zone] || BENCHMARK_RATES.medina;
    const leads: ProspectLead[] = [];

    for (const item of scrapedListings) {
      const auditNotes: string[] = [];
      let score = 70;

      const currentPrice = item.nightly_price;
      const targetADR = Math.max(currentPrice * 1.15, bench.adr);

      if (currentPrice < bench.adr * 0.80) {
        auditNotes.push(`Sous-tarifié de ${Math.round(((bench.adr - currentPrice) / bench.adr) * 100)}% par rapport au marché de ${zone}`);
        score += 15;
      }

      if (item.rating < 4.88) {
        auditNotes.push(`Note moyenne de ${item.rating}/5 : marge d'optimisation sur l'expérience voyageur & standard hôtelier`);
        score += 8;
      }

      if (!item.is_superhost) {
        auditNotes.push("Non Superhost : gestion potentiellement assurée par un particulier sans équipe 24/7");
        score += 10;
      }

      if (item.reviews_count < 25) {
        auditNotes.push("Faible volume d'avis : visibilité et taux d'occupation optimisables");
        score += 5;
      }

      const currentGrossYearly = currentPrice * (365 * 0.55);
      const optimizedGrossYearly = targetADR * (365 * bench.targetOccupancy);
      const ownerNetOptimized = optimizedGrossYearly * 0.75;

      const estimatedGainMAD = Math.max(
        15000,
        Math.round((ownerNetOptimized - currentGrossYearly) / 1000) * 1000
      );

      score = Math.min(96, Math.max(60, score));
      const ownerName = item.platform === "airbnb" ? "Propriétaire Mandant" : "Gérant Particulier";

      const whatsappMsg = this.generateWhatsAppPitch({
        propertyTitle: item.title,
        zone,
        currentPrice,
        targetADR,
        estimatedGainMAD,
        ownerName,
      });

      const emailMsg = this.generateEmailPitch({
        propertyTitle: item.title,
        zone,
        currentPrice,
        targetADR,
        estimatedGainMAD,
        ownerName,
        url: item.url,
      });

      leads.push({
        id: `lead-${Date.now()}-${leads.length + 1}`,
        title: item.title,
        zone,
        property_type: (item.property_type as PropertyType) || "riad",
        bedrooms: item.bedrooms || 3,
        nightly_price: currentPrice,
        estimated_adr: Math.round(targetADR),
        estimated_gain_annual_mad: estimatedGainMAD,
        rating: item.rating,
        reviews_count: item.reviews_count,
        platform: item.platform,
        url: item.url,
        owner_name: ownerName,
        owner_contact: `+212 6 XX XX XX XX`,
        outreach_status: "nouveau",
        opportunity_score: score,
        audit_notes: auditNotes.length > 0 ? auditNotes : ["Potentiel d'optimisation Dynamic Pricing et gestion 5 étoiles"],
        suggested_message_whatsapp: whatsappMsg,
        suggested_message_email: emailMsg,
        created_at: new Date().toISOString(),
      });
    }

    return leads;
  }

  public static generateWhatsAppPitch(data: {
    propertyTitle: string;
    zone: string;
    currentPrice: number;
    targetADR: number;
    estimatedGainMAD: number;
    ownerName: string;
  }): string {
    return `Bonjour,\n\nJe me permets de vous contacter au sujet de votre magnifique bien "${data.propertyTitle}" à Marrakech (${data.zone.toUpperCase()}).\n\nAprès analyse de votre secteur, votre propriété présente un potentiel exceptionnel : avec notre tarification dynamique et nos standards hôteliers 5 étoiles, vous pourriez dégager un gain additionnel net estimé à +${data.estimatedGainMAD.toLocaleString("fr-FR")} MAD/an tout en déléguant 100% de l'intendance (ménage 3h, check-in VIP, linge, déclarations légales).\n\nNous gérons des Riads et Villas d'exception sur Marrakech avec une commission claire de 25% (100% au succès).\n\nSeriez-vous ouvert à un échange de 10 minutes cette semaine ?\n\nBien cordialement,\nHassan Tiguidda\nFondateur — Marrakech Conciergerie Privée\n📞 +212 6 32 15 54 30\nICE: ${LEGAL_ENTITY.ice}`;
  }

  public static generateEmailPitch(data: {
    propertyTitle: string;
    zone: string;
    currentPrice: number;
    targetADR: number;
    estimatedGainMAD: number;
    ownerName: string;
    url: string;
  }): string {
    return `Objet : Audit de rentabilité locative & Partenariat conciergerie — ${data.propertyTitle}\n\nMadame, Monsieur,\n\nPropriétaire d'un bien d'exception à Marrakech (${data.propertyTitle}), vous visez légitimement une rentabilité maximale combinée à une préservation irréprochable de votre patrimoine.\n\nNotre cabinet Marrakech Conciergerie Privée accompagne les propriétaires de Riads et Villas haut de gamme à travers un mandat de gestion intégrale à 25% :\n\n• 📈 Dynamic Pricing en temps réel : optimisation de votre tarif nuitée de ${data.currentPrice.toLocaleString("fr-FR")} MAD vers un potentiel de ${data.targetADR.toLocaleString("fr-FR")} MAD selon la saisonnalité.\n• 🧹 Rotation ménage certifiée 3 heures & blanchisserie professionnelle.\n• 🛎️ Accueil VIP sur mesure, majordome, cuisinière et chauffeur.\n• ⚖️ Conformité légale totale (enregistrement passeports, taxe de séjour 11 MAD) et virement bancaire net chaque 1er du mois.\n\nGain annuel supplémentaire estimé pour votre propriété : +${data.estimatedGainMAD.toLocaleString("fr-FR")} MAD nets.\n\nJe serais ravi de vous présenter notre audit complet lors d'un rendez-vous sur place ou par téléphone.\n\nBien respectueusement,\n\nHassan Tiguidda\nDirecteur — Marrakech Conciergerie Privée\nAdresse : ${LEGAL_ENTITY.address}\nMobile / WhatsApp : ${LEGAL_ENTITY.phone}\nEmail : ${LEGAL_ENTITY.email}\nIdentifiant Fiscal / ICE : ${LEGAL_ENTITY.ice}`;
  }
}
