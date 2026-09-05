"use client";

import { useState, useEffect } from "react";
import { 
  Target, 
  Search, 
  Sparkles, 
  TrendingUp, 
  ExternalLink, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Building2, 
  DollarSign, 
  RefreshCw, 
  Filter, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Star,
  PhoneCall,
  Send,
  Trash2,
  Activity,
  AlertCircle,
  Zap
} from "lucide-react";
import { ProspectLead, PropertyQuartier, OutreachStatus } from "@/types";
import { formatMAD } from "@/lib/utils";
import { LEGAL_ENTITY } from "@/lib/constants";
import { 
  recordOutreachLog, 
  getOutreachStats, 
  purgeOutreachLogs,
  getOutreachLogs,
  OutreachLogEntry
} from "@/lib/outreachStorage";
import { MassOutreachModal } from "@/components/modals/MassOutreachModal";

const MARRAKECH_ZONES: { id: PropertyQuartier | "all"; label: string }[] = [
  { id: "gueliz", label: "🏢 Guéliz (Appartements, Studios & Penthouses — Focus)" },
  { id: "hivernage", label: "🌟 Hivernage (Penthouses, Duplex & Résidences de Standing)" },
  { id: "autre", label: "🌴 Majorelle & Agdal (Résidences avec Piscine & Balcons)" },
  { id: "all", label: "🌍 Tout Marrakech (Multi-Zones avec Priorité Appartements)" },
  { id: "medina", label: "Médina (Riads & Maisons d'Hôtes)" },
  { id: "targa", label: "Targa (Résidences & Villas Familiales)" },
  { id: "palmeraie", label: "Palmeraie (Villas & Domaines)" },
];

export default function ProspectsPage() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedZone, setSelectedZone] = useState<PropertyQuartier | "all">("gueliz");
  const [filterType, setFilterType] = useState<string>("appartement");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeModalLead, setActiveModalLead] = useState<ProspectLead | null>(null);
  const [isMassModalOpen, setIsMassModalOpen] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<"whatsapp" | "email" | null>(null);

  // Outreach Modal States
  const [modalLang, setModalLang] = useState<"FR" | "DARIJA" | "EN">("FR");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [sendErrorMsg, setSendErrorMsg] = useState<string | null>(null);

  // Telemetry stats
  const [telemetry, setTelemetry] = useState({
    totalSent: 0,
    delivered: 0,
    bounced: 0,
    whatsappCount: 0,
    emailCount: 0,
    deliveryRate: 100,
  });

  // Refresh telemetry
  const refreshTelemetry = () => {
    setTelemetry(getOutreachStats());
  };

  useEffect(() => {
    fetchProspects();
    refreshTelemetry();
  }, [filterType, selectedZone]);

  // Update target contact inputs when active modal lead changes
  useEffect(() => {
    if (activeModalLead) {
      setTargetEmail(activeModalLead.owner_contact?.includes("@") ? activeModalLead.owner_contact : "");
      setTargetPhone(activeModalLead.owner_contact?.includes("+") ? activeModalLead.owner_contact : "0632155430");
      setSendSuccessMsg(null);
      setSendErrorMsg(null);
      setModalLang("FR");
    }
  }, [activeModalLead]);

  const fetchProspects = async () => {
    setIsLoading(true);
    try {
      const typeParam = filterType === "all" ? "" : `&property_type=${filterType}`;
      const res = await fetch(`/api/prospects?zone=${selectedZone}${typeParam}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error("Erreur chargement prospects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Lancer un scan en direct avec Prospect Hunter
  const handleRunLiveHunt = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/prospects/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          zone: selectedZone, 
          property_type: filterType === "all" ? undefined : filterType,
          limit: selectedZone === "all" ? 18 : 8 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          setLeads(prev => {
            const existingUrls = new Set(prev.map(p => p.url));
            const newOnes = data.leads.filter((l: ProspectLead) => !existingUrls.has(l.url));
            return [...newOnes, ...prev];
          });
        }
      }
    } catch (e) {
      console.error("Erreur scan prospection:", e);
    } finally {
      setIsScanning(false);
    }
  };

  // Mettre à jour le statut du lead
  const handleUpdateStatus = async (leadId: string, status: OutreachStatus) => {
    try {
      await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, outreach_status: status }),
      });

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, outreach_status: status } : l));
      if (activeModalLead && activeModalLead.id === leadId) {
        setActiveModalLead({ ...activeModalLead, outreach_status: status });
      }
    } catch (e) {
      console.error("Erreur update lead:", e);
    }
  };

  const handleCopyText = (text: string, type: "whatsapp" | "email") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Générateur dynamique de pitch ultra-performant et personnalisé selon le type de bien
  const getPitchContent = (lead: ProspectLead, lang: "FR" | "DARIJA" | "EN") => {
    const gainFormatted = lead.estimated_gain_annual_mad.toLocaleString("fr-FR");
    const isApartment = ['appartement', 'studio', 'duplex'].includes(lead.property_type) || ['gueliz', 'hivernage'].includes(lead.zone);
    const typeLabel = lead.property_type === 'studio' ? 'studio' : lead.property_type === 'duplex' ? 'duplex' : isApartment ? 'appartement' : 'bien';

    if (lang === "DARIJA") {
      if (isApartment) {
        return {
          whatsapp: `Salam Si/Lalla 👋,\n\nM3ak Hassan Tiguidda men Marrakech Conciergerie Privée.\n\nCheft l'annonce dyal l-${typeLabel} dyalk "${lead.title}" f Marrakech (${lead.zone.toUpperCase()}).\nKhedemna audit rapide : n-qedrou n-tal3o lik l-rentabilité b ta9riban +${gainFormatted} MAD f l-3am b l-gestion spécial appartements bla ma t-sde3 rask :\n\n🔑 Check-in autonome b boîtier / serrure connectée 24/7 (bla ma t-tsena d-dyaf f noss lil)\n🏢 Sérénité Syndic : filtrage strict d-dyaf b la carte, caution, w zéro sda3 m3a l-voisins\n🧹 Ménage express f 3h & blanchisserie pressing hôtelière\n📈 Dynamic pricing : remplissage d l-appartement 7etta f l-iyamat d l-khdma (lundi-jeudi b les professionnels w digital nomads)\n⚖️ Fiches de police déclarées f l-waqt w virement d l-flouss kolla 1er f ch-her.\n\nCommission dyalna claire : 20% à 25% (100% au succès, 0 avance).\n\nN-qder n-sayfet lik l-audit complet f had l-WhatsApp ?\n\n📞 Tél : +212 6 32 15 54 30\nHassan Tiguidda`,
          email: `Objet : Audit de rentabilité locative & Mandat de gestion — ${lead.title}\n\nSalam Si/Lalla,\n\nPropriétaire d'un ${typeLabel} de standing f Marrakech (${lead.title} - ${lead.zone.toUpperCase()}),\n\nMarrakech Conciergerie Privée kay-9eddem lik gestion intégrale sans tracas :\n• 📈 Dynamic Pricing : optimisation dyal tarif nuitée vers ${lead.estimated_adr.toLocaleString("fr-FR")} MAD (remplissage 88% garanti)\n• 🔑 Check-in autonome & serrure connectée 24/7\n• 🏢 Tranquillité syndic & respect dyal copropriété\n• 🧹 Ménage certifié 3 heures & blanchisserie hôtelière\n• ⚖️ Fiches de police obligatoires & virement mensuel net.\n\nGain annuel estimé : +${gainFormatted} MAD nets.\n\nDiscutons-en par retour d'email ou WhatsApp.\n\nHassan Tiguidda\nTél : ${LEGAL_ENTITY.phone}`
        };
      }

      return {
        whatsapp: `Salam Si/Lalla 👋,\n\nM3ak Hassan Tiguidda men Marrakech Conciergerie Privée.\n\nCheft l'annonce dyal l-propriété dyalk "${lead.title}" f Marrakech (${lead.zone.toUpperCase()}).\nKhedemna audit rapide : n-qedrou n-tal3o lik l-rentabilité b ta9riban +${gainFormatted} MAD f l-3am b l-gestion VIP dyalna (ménage 3h, check-in d-dyaf, l-khdma kamla bla ma t-sde3 rask).\n\nCommission dyalna claire : 25% 3la les réservations (100% au succès, 0 avance).\n\nN-qder n-sayfet lik l-audit complet f had l-WhatsApp ?\n\n📞 Tél : +212 6 32 15 54 30\nHassan Tiguidda`,
        email: `Objet : Audit de rentabilité locative & Partenariat conciergerie — ${lead.title}\n\nSalam Si/Lalla,\n\nPropriétaire dyal bien d'exception f Marrakech (${lead.title}),\n\nMarrakech Conciergerie Privée kay-9eddem lik gestion intégrale à 25% :\n• 📈 Dynamic Pricing : optimisation dyal tarif nuitée vers ${lead.estimated_adr.toLocaleString("fr-FR")} MAD\n• 🧹 Ménage 3 heures certifié & blanchisserie VIP\n• 🛎️ Accueil VIP, chauffeur & intendance complète\n\nGain annuel estimé : +${gainFormatted} MAD nets.\n\nDiscutons-en par retour d'email ou WhatsApp.\n\nHassan Tiguidda\nTél : ${LEGAL_ENTITY.phone}`
      };
    }

    if (lang === "EN") {
      if (isApartment) {
        return {
          whatsapp: `Hello 👋,\n\nI am reaching out regarding your ${typeLabel} "${lead.title}" in Marrakech (${lead.zone.toUpperCase()}).\n\nOur market benchmarking reveals an untapped net revenue potential of +${gainFormatted} MAD/year through our hands-off apartment management:\n\n🔑 24/7 Smart Keyless Check-in (no airport waiting or late-night arrivals)\n🏢 HOA & Syndic Peace of Mind (strict guest screening, security deposits, zero disturbance)\n🧹 Professional 3-hour housekeeping turnaround & hotel linen\n📈 Dynamic pricing targeting business travelers & digital nomads on weekdays (88% target occupancy)\n⚖️ Full Moroccan police registration & guaranteed monthly net transfers.\n\nWe manage quality apartments in Guéliz & Hivernage at 20-25% performance fee (zero upfront cost).\n\nMay I share our quick property audit on WhatsApp?\n\nWarm regards,\nHassan Tiguidda\nFounder — Marrakech Conciergerie Privée\n📞 +212 6 32 15 54 30`,
          email: `Subject: Rental Revenue Optimization & Hands-off Management — ${lead.title}\n\nDear Owner,\n\nAs the owner of a prime ${typeLabel} in Marrakech (${lead.title} - ${lead.zone.toUpperCase()}), you likely value maximized returns without the day-to-day hassles of late arrivals, express cleaning, or syndic compliance.\n\nMarrakech Conciergerie Privée specializes in turnkey apartment management:\n\n• 📈 Daily Dynamic Pricing: uplifting average rates from ${lead.nightly_price.toLocaleString("fr-FR")} MAD to ${lead.estimated_adr.toLocaleString("fr-FR")} MAD with a targeted 88% occupancy rate.\n• 🔑 24/7 Autonomous Keyless Access: seamless arrival via smart lock or code box.\n• 🏢 Syndic & Neighbor Tranquility: rigorous guest ID verification and zero tolerance for noise.\n• 🧹 3-Hour Rapid Turnover: professional hotel-grade laundry and hospitality restock.\n• ⚖️ Full Regulatory Compliance: police registrations, tourist tax handling, and direct monthly net wire transfers.\n\nEstimated additional net profit: +${gainFormatted} MAD/year.\n\nWe would be pleased to schedule a short call or on-site meeting to share our data.\n\nRespectfully,\n\nHassan Tiguidda\nDirector — Marrakech Conciergerie Privée\nPhone / WhatsApp: ${LEGAL_ENTITY.phone}\nEmail: ${LEGAL_ENTITY.email}`
        };
      }

      return {
        whatsapp: `Hello,\n\nI am contacting you regarding your property "${lead.title}" in Marrakech (${lead.zone.toUpperCase()}).\n\nOur market analysis shows an estimated revenue upside of +${gainFormatted} MAD/year through our VIP short-term rental management (3-hour turnover, dynamic pricing, concierge hosting, full legal compliance).\n\nWe operate on a 25% performance commission (zero upfront cost).\n\nMay I send you our complimentary property audit via WhatsApp or email?\n\nWarm regards,\nHassan Tiguidda — Marrakech Private Concierge\nPhone/WhatsApp: +212 6 32 15 54 30`,
        email: `Subject: Rental Revenue Audit & Concierge Partnership — ${lead.title}\n\nDear Owner,\n\nRegarding your prestigious property in Marrakech (${lead.title} - ${lead.zone.toUpperCase()}), our private concierge firm provides turnkey short-term rental management at a 25% performance fee:\n\n• 📈 Real-time Dynamic Pricing: elevating base rates from ${lead.nightly_price.toLocaleString("fr-FR")} MAD towards ~${lead.estimated_adr.toLocaleString("fr-FR")} MAD.\n• 🧹 Certified 3-hour housekeeping & luxury linen.\n• 🛎️ Tailored VIP guest hosting, airport transfers, and private cooks.\n• ⚖️ Full Moroccan regulatory compliance.\n\nEstimated additional net revenue: +${gainFormatted} MAD/year.\n\nWe would be delighted to discuss this opportunity at your convenience.\n\nRespectfully yours,\n\nHassan Tiguidda\nDirector — Marrakech Conciergerie Privée\nPhone / WhatsApp: ${LEGAL_ENTITY.phone}\nEmail: ${LEGAL_ENTITY.email}`
      };
    }

    // Default: FR
    if (isApartment) {
      return {
        whatsapp: `Bonjour 👋,\n\nJe me permets de vous contacter au sujet de votre ${typeLabel} "${lead.title}" à Marrakech (${lead.zone.toUpperCase()}).\n\nEn analysant les performances locatives de votre secteur, votre bien présente un potentiel exceptionnel : vous pourriez dégager un gain additionnel net estimé à +${gainFormatted} MAD/an tout en vous libérant à 100% des contraintes du quotidien :\n\n🔑 Accès autonome 24/7 (boîtier / serrure connectée, zéro attente voyageur tardif)\n🏢 Sérénité Syndic & Copropriété (filtrage strict d'identité, caution systématique, zéro fête ni nuisance sonore)\n🧹 Rotation ménage express sous 3h & blanchisserie pressing hôtelière\n📈 Tarification dynamique (remplissage à 88% en captant les voyageurs business et nomades digitaux en semaine)\n⚖️ Déclaration des fiches de police obligatoires & virement bancaire net chaque 1er du mois.\n\nNous gérons déjà un portefeuille d'appartements et penthouses à ${lead.zone === "gueliz" ? "Guéliz" : lead.zone === "hivernage" ? "l'Hivernage" : "Marrakech"} avec une commission claire de 20% à 25% (100% au succès, 0 avance requise).\n\nPuis-je vous transmettre notre audit chiffré complet sans engagement ?\n\nBien cordialement,\nHassan Tiguidda\nFondateur — Marrakech Conciergerie Privée\n📞 +212 6 32 15 54 30\nICE: ${LEGAL_ENTITY.ice}`,
        email: `Objet : Audit de rentabilité locative & Mandat de gestion — ${lead.title}\n\nMadame, Monsieur,\n\nPropriétaire d'un ${typeLabel} de standing à Marrakech (${lead.title} - Secteur ${lead.zone.toUpperCase()}), vous visez légitimement une rentabilité maximale sans les contraintes quotidiennes de gestion (attente des clés à minuit, rotation ménage le jour même, relations avec le syndic de copropriété).\n\nNotre cabinet Marrakech Conciergerie Privée est spécialisé dans la gestion intégrale d'appartements, penthouses et duplex à Marrakech avec une commission à la performance de 20% à 25% :\n\n• 📈 Tarification Dynamique Quotidienne : passage de votre tarif actuel de ${lead.nightly_price.toLocaleString("fr-FR")} MAD vers ~${lead.estimated_adr.toLocaleString("fr-FR")} MAD et un taux d'occupation cible de 88% en captant une clientèle d'affaires et de digital nomads du lundi au jeudi.\n• 🔑 Check-in Autonome Sécurisé 24/7 : installation de serrures connectées ou boîtiers sécurisés pour des arrivées 100% fluides sans déranger le propriétaire.\n• 🏢 Sérénité Totale Vis-à-vis du Syndic : vérification systématique des pièces d'identité, caution bancaire bloquée et tolérance zéro pour les nuisances sonores.\n• 🧹 Rotation Ménage Hôtelier sous 3 Heures : draps blancs satinés repassés en pressing hôtelier et réassort complet des kits d'accueil (café Nespresso, produits de bain).\n• ⚖️ Conformité Réglementaire & Sécurité : enregistrement obligatoire des fiches de police, déclaration de la taxe de séjour (11 MAD) et virement bancaire net chaque début de mois avec relevé transparent.\n\nGain annuel supplémentaire estimé pour votre ${typeLabel} : +${gainFormatted} MAD nets.\n\nJe serais ravi de vous présenter notre audit complet ainsi que nos réalisations sur le secteur lors d'un rendez-vous sur place ou par téléphone.\n\nBien respectueusement,\n\nHassan Tiguidda\nDirecteur — Marrakech Conciergerie Privée\nAdresse : ${LEGAL_ENTITY.address}\nMobile / WhatsApp : ${LEGAL_ENTITY.phone}\nEmail : ${LEGAL_ENTITY.email}\nIdentifiant Fiscal / ICE : ${LEGAL_ENTITY.ice}`
      };
    }

    return {
      whatsapp: `Bonjour 👋,\n\nJe me permets de vous contacter au sujet de votre bien "${lead.title}" à Marrakech (${lead.zone.toUpperCase()}).\n\nAprès analyse de votre secteur, votre propriété présente un potentiel exceptionnel : avec notre conciergerie privée et notre tarification dynamique, vous pourriez dégager un gain additionnel estimé à +${gainFormatted} MAD/an tout en déléguant 100% de l'intendance (ménage 3h, check-in VIP, linge de luxe, déclarations légales).\n\nNous intervenons sur Marrakech avec une commission claire de 25% (100% au succès, 0 avance requise).\n\nPuis-je vous transmettre notre audit complet sans engagement ?\n\nBien cordialement,\nHassan Tiguidda\nFondateur — Marrakech Conciergerie Privée\n📞 +212 6 32 15 54 30\nICE: ${LEGAL_ENTITY.ice}`,
      email: `Objet : Audit de rentabilité locative & Partenariat conciergerie — ${lead.title}\n\nMadame, Monsieur,\n\nPropriétaire d'un bien d'exception à Marrakech (${lead.title} - Quartier ${lead.zone.toUpperCase()}), vous visez légitimement une rentabilité maximale combinée à une préservation irréprochable de votre patrimoine.\n\nNotre cabinet Marrakech Conciergerie Privée accompagne les propriétaires de Riads et Villas haut de gamme à travers un mandat de gestion intégrale à 25% :\n\n• 📈 Dynamic Pricing en temps réel : optimisation de votre tarif nuitée de ${lead.nightly_price.toLocaleString("fr-FR")} MAD vers un potentiel de ${lead.estimated_adr.toLocaleString("fr-FR")} MAD selon la saisonnalité.\n• 🧹 Rotation ménage certifiée 3 heures & blanchisserie hôtelière.\n• 🛎️ Accueil VIP sur mesure, majordome, cuisinière et chauffeur.\n• ⚖️ Conformité légale totale (enregistrement passeports, taxe de séjour 11 MAD) et virement bancaire net chaque 1er du mois.\n\nGain annuel supplémentaire estimé pour votre propriété : +${gainFormatted} MAD nets.\n\nJe serais ravi de vous présenter notre audit complet lors d'un rendez-vous sur place ou par téléphone.\n\nBien respectueusement,\n\nHassan Tiguidda\nDirecteur — Marrakech Conciergerie Privée\nAdresse : ${LEGAL_ENTITY.address}\nMobile / WhatsApp : ${LEGAL_ENTITY.phone}\nEmail : ${LEGAL_ENTITY.email}\nIdentifiant Fiscal / ICE : ${LEGAL_ENTITY.ice}`
    };
  };

  // Envoi Réel par Email via Gmail SMTP Pro
  const handleSendEmailDirect = async () => {
    if (!activeModalLead) return;
    if (!targetEmail || !targetEmail.includes("@")) {
      setSendErrorMsg("Veuillez renseigner une adresse email valide pour ce destinataire.");
      return;
    }

    setIsSendingEmail(true);
    setSendSuccessMsg(null);
    setSendErrorMsg(null);

    const pitch = getPitchContent(activeModalLead, modalLang);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "EMAIL",
          recipient: {
            name: activeModalLead.owner_name || "Propriétaire",
            email: targetEmail.trim(),
            venueName: activeModalLead.title,
            title: activeModalLead.title,
          },
          content: {
            subject: `Proposition Conciergerie Privée Marrakech — ${activeModalLead.title}`,
            messageText: pitch.email,
            gainMAD: activeModalLead.estimated_gain_annual_mad.toLocaleString("fr-FR"),
          }
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSendSuccessMsg(`Email délivré en direct via Gmail SMTP Pro ! ID: ${data.messageId || "Message-ID Google"}`);
        handleUpdateStatus(activeModalLead.id, "contacte");

        recordOutreachLog({
          executionId: data.messageId || `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: "EMAIL_PITCH",
          recipient: {
            leadId: activeModalLead.id,
            title: activeModalLead.title,
            zone: activeModalLead.zone,
            email: targetEmail.trim(),
          },
          subject: `Proposition Conciergerie Privée Marrakech — ${activeModalLead.title}`,
          status: "DELIVERED_REAL",
          delivery: {
            status: "SENT",
            messageId: data.messageId,
            provider: "GMAIL_SMTP"
          }
        });

        refreshTelemetry();
      } else {
        setSendErrorMsg(data.error || "Échec de transmission de l'email.");
        recordOutreachLog({
          executionId: `err_${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: "EMAIL_PITCH",
          recipient: {
            leadId: activeModalLead.id,
            title: activeModalLead.title,
            zone: activeModalLead.zone,
            email: targetEmail.trim(),
          },
          subject: `Proposition Conciergerie Privée Marrakech — ${activeModalLead.title}`,
          status: "FAILED",
          delivery: {
            status: "FAILED",
            provider: "GMAIL_SMTP",
            error: data.error
          }
        });
        refreshTelemetry();
      }
    } catch (err: any) {
      setSendErrorMsg(err?.message || "Erreur réseau lors de l'envoi.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Ouvrir WhatsApp Web avec message pré-rempli
  const handleOpenWhatsApp = (lead: ProspectLead) => {
    const pitch = getPitchContent(lead, modalLang);
    const encoded = encodeURIComponent(pitch.whatsapp);
    const cleanPhoneDigits = targetPhone.replace(/[^0-9]/g, "");
    const finalPhone = cleanPhoneDigits.startsWith("0") ? "212" + cleanPhoneDigits.slice(1) : cleanPhoneDigits;

    const url = finalPhone && finalPhone.length >= 9
      ? `https://wa.me/${finalPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, "_blank");
    handleUpdateStatus(lead.id, "contacte");

    recordOutreachLog({
      executionId: `wa_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "WHATSAPP_PITCH",
      recipient: {
        leadId: lead.id,
        title: lead.title,
        zone: lead.zone,
        phone: finalPhone || "WhatsApp Direct",
      },
      subject: `Pitch WhatsApp (${modalLang})`,
      status: "DELIVERED_REAL",
      delivery: {
        status: "SENT",
        provider: "WHATSAPP_DIRECT"
      }
    });

    refreshTelemetry();
  };

  const handlePurgeLogs = () => {
    if (window.confirm("Voulez-vous purger l'historique des envois et réinitialiser les statistiques de prospection ?")) {
      purgeOutreachLogs();
      refreshTelemetry();
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = filterStatus === "all" ? true : l.outreach_status === filterStatus;
    const matchesType = filterType === "all" 
      ? true 
      : filterType === "appartement" 
      ? ["appartement", "duplex", "studio"].includes(l.property_type) 
      : l.property_type === filterType;
    return matchesStatus && matchesType;
  });
  const totalEstimatedGains = filteredLeads.reduce((acc, l) => acc + l.estimated_gain_annual_mad, 0);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-card bg-gradient-to-r from-surface via-surface to-surface-elevated border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <Target className="w-3.5 h-3.5" /> Agent Prospect Hunter Live
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                🏢 Focus Appartements &amp; Penthouses 🇲🇦
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
                Gmail SMTP Pro &amp; WhatsApp Live
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Chasse Immobilière &amp; Prospection Appartements Marrakech
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Détectez en direct les appartements, studios et penthouses sous-exploités à <b>Guéliz</b>, <b>Hivernage</b>, <b>Majorelle</b> et <b>Agdal</b>. Générez des audits de rentabilité intégrant <b>accès autonome 24/7</b>, <b>sérénité syndic</b> et <b>remplissage business en semaine (88%)</b>. Contactez les propriétaires en 1 clic.
            </p>
          </div>

          {/* Quick Metrics & Mass Outreach CTA */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-surface border border-surface-border text-center min-w-[120px]">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Appartements</div>
              <div className="text-xl font-bold text-foreground">{filteredLeads.length}</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-surface border border-emerald-500/20 text-center min-w-[140px]">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Gain Détecté Total</div>
              <div className="text-xl font-bold text-emerald-400">+{formatMAD(totalEstimatedGains, false)}</div>
            </div>
            <button
              onClick={() => setIsMassModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-4 h-4 fill-white animate-pulse" />
              <span>Mass Outreach ({filteredLeads.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Outreach Live Telemetry Dashboard Widget */}
      <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Traçabilité &amp; Télémesure d'Envoi en Direct
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
              <span><b>{telemetry.totalSent}</b> Pitches déclenchés</span>
              <span>•</span>
              <span><b>{telemetry.delivered}</b> Délivrés ({telemetry.deliveryRate}%)</span>
              <span>•</span>
              <span><b>{telemetry.emailCount}</b> Emails Pro</span>
              <span>•</span>
              <span><b>{telemetry.whatsappCount}</b> WhatsApp Direct</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={refreshTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-xs text-foreground font-semibold border border-surface-border transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handlePurgeLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-400 font-semibold border border-rose-500/20 transition-colors"
            title="Purger l'historique d'envoi"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purger</span>
          </button>
        </div>
      </div>

      {/* Typologies Switcher Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-surface-border flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-foreground">Typologie Immobilière :</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "appartement", label: "🏢 Appartements & Penthouses (Prioritaire)" },
            { id: "studio", label: "🔑 Studios & 2P (Digital Nomads)" },
            { id: "duplex", label: "🌆 Duplex & Penthouses Rooftop" },
            { id: "all", label: "🌍 Tous les biens" },
            { id: "riad", label: "🏰 Riads" },
            { id: "villa", label: "🏡 Villas" },
          ].map((typeItem) => (
            <button
              key={typeItem.id}
              onClick={() => setFilterType(typeItem.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                filterType === typeItem.id
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25"
                  : "bg-surface-elevated text-muted-foreground border-surface-border hover:text-foreground hover:border-emerald-500/30"
              }`}
            >
              {typeItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Hunt Scanner Toolbar */}
      <div className="p-4 sm:p-5 rounded-card bg-surface border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Search className="w-4 h-4 text-primary" />
            <span>Zone cible :</span>
          </div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value as PropertyQuartier)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {MARRAKECH_ZONES.map(z => (
              <option key={z.id} value={z.id}>{z.label}</option>
            ))}
          </select>

          <button
            onClick={handleRunLiveHunt}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scan de Marrakech en cours..." : "Scanner le Marché en Direct"}</span>
          </button>

          <button
            onClick={() => setIsMassModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-btn bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/25"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Mass Outreach Dispatcher</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs self-end md:self-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Statut :</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">Tous ({leads.length})</option>
            <option value="nouveau">Nouveaux</option>
            <option value="contacte">Contactés</option>
            <option value="rendez_vous">RDV Fixés</option>
            <option value="mandat_signe">Mandats Signés</option>
          </select>
        </div>
      </div>

      {/* Leads Table / Card Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <span>Chargement du pipeline de prospection...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-surface-border space-y-3">
          <Target className="w-8 h-8 text-primary mx-auto opacity-50" />
          <p className="text-sm font-semibold text-foreground">Aucun appartement trouvé dans ce filtre</p>
          <p className="text-xs text-muted-foreground">Cliquez sur &quot;Scanner le Marché en Direct&quot; pour détecter des annonces d&apos;appartements à Marrakech.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-card bg-surface border border-surface-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {lead.zone}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Score: {lead.opportunity_score}%
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                      lead.outreach_status === "contacte"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : lead.outreach_status === "rendez_vous"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : lead.outreach_status === "mandat_signe"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-surface-elevated text-muted-foreground border-surface-border"
                    }`}>
                      {lead.outreach_status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-serif font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {lead.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="capitalize">{lead.property_type}</span>
                    <span>•</span>
                    <span>{lead.bedrooms} Ch.</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {lead.rating} ({lead.reviews_count})
                    </span>
                  </div>

                  {/* Apartment Value Proposition Badges */}
                  {['appartement', 'studio', 'duplex'].includes(lead.property_type) && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        🔑 Accès Autonome 24/7
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        🏢 Sérénité Syndic
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        📈 Taux 88%
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial Metrics */}
                <div className="p-3 rounded-lg bg-surface-elevated/60 border border-surface-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Tarif actuel :</span>
                    <span className="font-mono font-bold text-foreground">{formatMAD(lead.nightly_price)} / nuit</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Potentiel Dynamic Pricing :</span>
                    <span className="font-mono font-bold text-emerald-400">{formatMAD(lead.estimated_adr)} / nuit</span>
                  </div>
                  <div className="pt-1 border-t border-surface-border flex justify-between items-center">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Upside Annuel Net :
                    </span>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      +{formatMAD(lead.estimated_gain_annual_mad, false)} MAD
                    </span>
                  </div>
                </div>

                {/* Audit Notes Snippet */}
                {lead.audit_notes && lead.audit_notes.length > 0 && (
                  <div className="text-[11px] text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                    &quot;{lead.audit_notes[0]}&quot;
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setActiveModalLead(lead)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs font-bold transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Pitcher ce Propriétaire</span>
                </button>

                <a
                  href={lead.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-btn bg-surface-elevated hover:bg-surface-border text-muted-foreground hover:text-foreground border border-surface-border transition-colors"
                  title="Voir l'annonce originale"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outreach Modal */}
      {activeModalLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                    {activeModalLead.zone}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Gain: +{activeModalLead.estimated_gain_annual_mad.toLocaleString("fr-FR")} MAD/an
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-foreground">{activeModalLead.title}</h2>
              </div>
              <button
                onClick={() => setActiveModalLead(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Switcher Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground font-semibold">Statut du prospect :</span>
              {(["nouveau", "contacte", "rendez_vous", "mandat_signe"] as OutreachStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(activeModalLead.id, st)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all border ${
                    activeModalLead.outreach_status === st
                      ? "bg-primary text-surface-muted border-primary"
                      : "bg-surface-elevated text-muted-foreground border-surface-border hover:text-foreground"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-surface-border text-xs">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Langue du pitch :
              </span>
              <div className="flex bg-surface-elevated p-1 rounded-lg border border-surface-border">
                <button
                  onClick={() => setModalLang("FR")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    modalLang === "FR" ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇫🇷 Français (Par défaut)
                </button>
                <button
                  onClick={() => setModalLang("DARIJA")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    modalLang === "DARIJA" ? "bg-amber-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇲🇦 Darija (Cas particuliers)
                </button>
                <button
                  onClick={() => setModalLang("EN")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    modalLang === "EN" ? "bg-sky-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Alerts */}
            {sendSuccessMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sendSuccessMsg}</span>
              </div>
            )}

            {sendErrorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>⚠️ {sendErrorMsg}</span>
              </div>
            )}

            {/* Outreach Pitch 1: WhatsApp Direct */}
            <div className="space-y-3 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Pitch WhatsApp Personnalisé ({modalLang})</span>
                </div>
                <button
                  onClick={() => handleCopyText(getPitchContent(activeModalLead, modalLang).whatsapp, "whatsapp")}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                >
                  {copiedType === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "whatsapp" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={getPitchContent(activeModalLead, modalLang).whatsapp}
                className="w-full bg-surface border border-surface-border rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed resize-none focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground text-[11px]">Tél Destinataire :</span>
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="06XXXXXXXX ou +212..."
                    className="bg-surface border border-surface-border rounded px-2 py-1 text-xs text-foreground font-mono w-36 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => handleOpenWhatsApp(activeModalLead)}
                  className="flex items-center gap-2 px-4 py-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ouvrir WhatsApp Direct</span>
                </button>
              </div>
            </div>

            {/* Outreach Pitch 2: Formal Email via Gmail SMTP Pro */}
            <div className="space-y-3 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>Email Formel &amp; Envoi Direct (Gmail SMTP Pro)</span>
                </div>
                <button
                  onClick={() => handleCopyText(getPitchContent(activeModalLead, modalLang).email, "email")}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                >
                  {copiedType === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "email" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={getPitchContent(activeModalLead, modalLang).email}
                className="w-full bg-surface border border-surface-border rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed resize-none focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs flex-1 max-w-sm">
                  <span className="text-muted-foreground text-[11px] shrink-0">Email Cible :</span>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="contact@proprietaire.com"
                    className="bg-surface border border-surface-border rounded px-2.5 py-1 text-xs text-foreground font-mono flex-1 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  onClick={handleSendEmailDirect}
                  disabled={isSendingEmail}
                  className="flex items-center gap-2 px-4 py-2 rounded-btn bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer par Email (SMTP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Sign-off Note */}
            <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-2 border-t border-surface-border">
              <span>Signé par : <b>Hassan Tiguidda</b> (+212 6 32 15 54 30) • ICE: {LEGAL_ENTITY.ice}</span>
              <a
                href={activeModalLead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Consulter l&apos;annonce</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mass Outreach Dispatcher Modal */}
      <MassOutreachModal
        isOpen={isMassModalOpen}
        onClose={() => setIsMassModalOpen(false)}
        leads={leads}
        onLeadUpdated={(leadId, status) => {
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, outreach_status: status } : l));
        }}
        onTelemetryRefresh={refreshTelemetry}
      />
    </div>
  );
}
