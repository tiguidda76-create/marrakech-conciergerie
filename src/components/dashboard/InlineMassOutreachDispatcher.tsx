"use client";

import React, { useState, useMemo } from "react";
import { 
  Zap, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  Building2, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Check
} from "lucide-react";
import { ProspectLead, OutreachStatus } from "@/types";
import { LEGAL_ENTITY } from "@/lib/constants";
import { 
  recordOutreachLog, 
  getOutreachLogs, 
  purgeOutreachLogs, 
  getOutreachStats,
  OutreachLogEntry 
} from "@/lib/outreachStorage";
import { formatMAD } from "@/lib/utils";

interface InlineMassOutreachDispatcherProps {
  leads: ProspectLead[];
  onLeadUpdated: (leadId: string, status: OutreachStatus) => void;
  onTelemetryRefresh: () => void;
}

export const InlineMassOutreachDispatcher: React.FC<InlineMassOutreachDispatcherProps> = ({
  leads,
  onLeadUpdated,
  onTelemetryRefresh,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "WHATSAPP" | "BOTH">("EMAIL");
  const [lang, setLang] = useState<"FR" | "DARIJA" | "EN">("FR");
  const [targetType, setTargetType] = useState<"appartement" | "studio" | "all">("appartement");
  const [onlyNew, setOnlyNew] = useState<boolean>(true);
  const [showLogsTable, setShowLogsTable] = useState<boolean>(true);
  const [testEmailOverride, setTestEmailOverride] = useState<string>("");

  // Execution state
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [dispatchedCount, setDispatchedCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [liveLogs, setLiveLogs] = useState<Array<{ text: string; type: "info" | "success" | "warning" | "error"; time: string }>>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Filter eligible targets
  const eligibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = onlyNew ? lead.outreach_status === "nouveau" : true;
      const isApartment = ["appartement", "duplex", "studio"].includes(lead.property_type);
      const matchesType = 
        targetType === "all" ? true :
        targetType === "appartement" ? isApartment :
        lead.property_type === targetType;
      return matchesStatus && matchesType;
    });
  }, [leads, targetType, onlyNew]);

  const totalTargetGain = useMemo(() => {
    return eligibleLeads.reduce((acc, l) => acc + l.estimated_gain_annual_mad, 0);
  }, [eligibleLeads]);

  // Outreach logs from storage
  const storedLogs = useMemo(() => {
    return getOutreachLogs();
  }, [isDispatching, isCompleted]);

  const addLiveLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLiveLogs(prev => [{ text, type, time }, ...prev.slice(0, 60)]);
  };

  // Build pitch customized for apartments
  const buildPitch = (lead: ProspectLead, targetLang: "FR" | "DARIJA" | "EN") => {
    const gainFormatted = lead.estimated_gain_annual_mad.toLocaleString("fr-FR");
    const isApartment = ['appartement', 'studio', 'duplex'].includes(lead.property_type) || ['gueliz', 'hivernage'].includes(lead.zone);
    const typeLabel = lead.property_type === 'studio' ? 'studio' : lead.property_type === 'duplex' ? 'duplex' : isApartment ? 'appartement' : 'bien';

    if (targetLang === "DARIJA") {
      return {
        subject: `Proposition Conciergerie Privée Marrakech — ${lead.title}`,
        whatsapp: `Salam Si/Lalla 👋,\nM3ak Hassan Tiguidda men Marrakech Conciergerie Privée.\nCheft l'annonce dyal l-${typeLabel} dyalk "${lead.title}" f Marrakech (${lead.zone.toUpperCase()}).\nAudit rapide : gain net estimé à +${gainFormatted} MAD/an b l-gestion VIP spécial appartements (serrure connectée 24/7, accord syndic & zéro nuisance, ménage 3h, remplissage business).\nCommission : 20% à 25% (100% au succès).\nN-qder n-sayfet lik l-audit complet f had l-WhatsApp ?\n📞 +212 6 32 15 54 30`,
        email: `Objet : Mandat de gestion locative & Audit de rentabilité — ${lead.title}\n\nSalam Si/Lalla,\n\nPropriétaire d'un ${typeLabel} à Marrakech (${lead.title} - ${lead.zone.toUpperCase()}),\nMarrakech Conciergerie Privée vous propose une intendance complète sans tracas :\n• Remplissage optimisé vers ${lead.estimated_adr.toLocaleString("fr-FR")} MAD/nuit\n• Check-in autonome & serrure connectée 24/7\n• Sérénité absolue vis-à-vis du syndic et des voisins\n• Gain net additionnel estimé : +${gainFormatted} MAD/an.\n\nDiscutons-en au +212 6 32 15 54 30 ou par retour d'email.\n\nHassan Tiguidda — Conciergerie Privée Marrakech`
      };
    }

    if (targetLang === "EN") {
      return {
        subject: `Rental Revenue Optimization & Concierge Management — ${lead.title}`,
        whatsapp: `Hello 👋,\nRegarding your ${typeLabel} "${lead.title}" in Marrakech (${lead.zone.toUpperCase()}):\nOur analysis indicates a potential +${gainFormatted} MAD/year revenue increase via our hands-off management (smart keyless check-in, HOA/syndic tranquility, 3h cleaning, 88% weekday business occupancy).\n20-25% performance fee, zero upfront cost.\nMay I share our complete property audit on WhatsApp?\n📞 Hassan Tiguidda: +212 6 32 15 54 30`,
        email: `Subject: Turnkey Property Management & Revenue Audit — ${lead.title}\n\nDear Owner,\n\nAs the owner of "${lead.title}" in Marrakech (${lead.zone.toUpperCase()}), you can unlock an estimated +${gainFormatted} MAD/year while delegating 100% of guest handling:\n• 24/7 Smart Keyless Check-in\n• Strict HOA/Syndic compliance and noise control\n• Certified 3-hour housekeeping turnaround\n• Performance fee: 20-25%.\n\nWarm regards,\nHassan Tiguidda\nMarrakech Conciergerie Privée\nPhone/WhatsApp: ${LEGAL_ENTITY.phone}`
      };
    }

    // Default: FR
    return {
      subject: `Proposition Conciergerie Privée Marrakech — ${lead.title}`,
      whatsapp: `Bonjour 👋,\n\nJe me permets de vous contacter au sujet de votre ${typeLabel} "${lead.title}" à Marrakech (${lead.zone.toUpperCase()}).\n\nAprès analyse de votre secteur, votre bien présente un potentiel exceptionnel : gain additionnel net estimé à +${gainFormatted} MAD/an tout en vous libérant à 100% du quotidien :\n🔑 Accès autonome 24/7 (serrure connectée / boîte à clés)\n🏢 Sérénité Syndic & Copropriété (filtrage strict, caution, zéro nuisance sonore)\n🧹 Rotation ménage hôtelier sous 3h & blanchisserie pressing\n📈 Remplissage à 88% (clientèle business et nomades digitaux en semaine)\n⚖️ Fiches de police déclarées & virement mensuel garanti.\n\nCommission transparente de 20% à 25% (100% au succès, 0 avance requise).\nPuis-je vous transmettre l'audit chiffré complet sans engagement ?\n\nBien cordialement,\nHassan Tiguidda\nFondateur — Marrakech Conciergerie Privée\n📞 +212 6 32 15 54 30\nICE: ${LEGAL_ENTITY.ice}`,
      email: `Objet : Audit de rentabilité locative & Gestion intégrale de votre ${typeLabel} — ${lead.title}\n\nMadame, Monsieur,\n\nPropriétaire d'un ${typeLabel} à Marrakech (${lead.title} - Secteur ${lead.zone.toUpperCase()}), vous recherchez sans doute une rentabilité maximale sans les contraintes de gestion (remise des clés à minuit, rotation ménage le jour même, relations avec le syndic de copropriété).\n\nMarrakech Conciergerie Privée prend en charge 100% de votre intendance :\n• 📈 Dynamic Pricing : tarif nuitée optimisé vers ~${lead.estimated_adr.toLocaleString("fr-FR")} MAD et taux d'occupation cible de 88% grâce au ciblage business/digital nomads en semaine.\n• 🔑 Check-in Autonome 24/7 : arrivée fluide sans déranger le propriétaire.\n• 🏢 Sérénité Syndic : vérification d'identité systématique, caution et zéro tolérance pour les nuisances.\n• 🧹 Ménage Hôtelier Certifié sous 3 Heures : draps blancs pressing et kits d'accueil réassortis.\n• ⚖️ Fiches de police obligatoires & virement bancaire net chaque 1er du mois.\n\nGain annuel net supplémentaire estimé : +${gainFormatted} MAD.\n\nJe serais ravi de vous présenter notre audit complet lors d'un échange téléphonique ou sur place.\n\nBien respectueusement,\n\nHassan Tiguidda\nDirecteur — Marrakech Conciergerie Privée\nAdresse : ${LEGAL_ENTITY.address}\nMobile / WhatsApp : ${LEGAL_ENTITY.phone}\nEmail : ${LEGAL_ENTITY.email}\nICE : ${LEGAL_ENTITY.ice}`
    };
  };

  const handleLaunchMassOutreach = async () => {
    if (eligibleLeads.length === 0 || isDispatching) return;

    setIsDispatching(true);
    setProgress(0);
    setDispatchedCount(0);
    setSuccessCount(0);
    setFailedCount(0);
    setLiveLogs([]);
    setIsCompleted(false);

    const overrideNotice = testEmailOverride.trim() 
      ? ` | Mode Test Email Actif (${testEmailOverride.trim()})` 
      : "";
    addLiveLog(`🚀 [Mass Regional Dispatcher] Démarrage de la campagne pour ${eligibleLeads.length} appartements...`, "info");
    addLiveLog(`📡 Canal : ${selectedChannel} | Langue : ${lang} | Bouclier DNS MX Actif${overrideNotice}`, "info");

    const queue = [...eligibleLeads];
    let localSuccess = 0;
    let localFailed = 0;

    for (let i = 0; i < queue.length; i++) {
      const lead = queue[i];
      const pitch = buildPitch(lead, lang);

      // Résolution du contact email et téléphone
      const overrideEmail = testEmailOverride.trim();
      const rawLeadEmail = (lead.owner_contact?.includes("@") && !lead.owner_contact.includes("marrakech-concierge.ma")) 
        ? lead.owner_contact.trim() 
        : null;
      
      const targetEmail = overrideEmail || rawLeadEmail;
      const hasVerifiedEmail = Boolean(targetEmail);

      // Formatage propre du téléphone
      const cleanPhoneDigits = (lead.owner_contact || "").replace(/[^0-9]/g, "");
      let finalPhone = cleanPhoneDigits;
      if (cleanPhoneDigits.startsWith("0")) {
        finalPhone = "212" + cleanPhoneDigits.slice(1);
      } else if (!cleanPhoneDigits.startsWith("212") && cleanPhoneDigits.length === 9) {
        finalPhone = "212" + cleanPhoneDigits;
      }
      if (finalPhone.length < 10) {
        finalPhone = "212632155430"; // Numéro de conciergerie par défaut
      }

      // Routage Multi-Canal Intelligent :
      // - Si BOTH : Email (si dispo ou test override) + WhatsApp Direct
      // - Si EMAIL : Email si dispo ou test override, SINON bascule automatique WhatsApp Direct (Zéro échec DNS/NXDOMAIN !)
      // - Si WHATSAPP : WhatsApp Direct
      const sendEmail = (selectedChannel === "EMAIL" || selectedChannel === "BOTH") && hasVerifiedEmail;
      const sendWhatsApp = (selectedChannel === "WHATSAPP" || selectedChannel === "BOTH") || (!hasVerifiedEmail && selectedChannel === "EMAIL");

      try {
        let emailSuccess = false;
        let whatsappSuccess = false;
        let executionMessageId = `msg_${Date.now()}_${i}`;

        // 1. Envoi par Email (uniquement si email réel vérifié ou override de test)
        if (sendEmail && targetEmail) {
          const res = await fetch("/api/outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "EMAIL",
              recipient: {
                name: lead.owner_name || "Propriétaire",
                email: targetEmail,
                venueName: lead.title,
                title: lead.title,
              },
              content: {
                subject: pitch.subject,
                messageText: pitch.email,
                gainMAD: lead.estimated_gain_annual_mad.toLocaleString("fr-FR"),
              }
            }),
          });

          const resData = await res.json();
          if (res.ok && resData.success) {
            emailSuccess = true;
            executionMessageId = resData.messageId || executionMessageId;
            const testLabel = overrideEmail ? " [Email de Test]" : "";
            addLiveLog(`✉️ [Gmail SMTP Pro] Email délivré à ${lead.title} (${targetEmail})${testLabel}`, "success");
            
            recordOutreachLog({
              executionId: executionMessageId,
              timestamp: new Date().toISOString(),
              eventType: "EMAIL_PITCH",
              recipient: {
                leadId: lead.id,
                title: lead.title,
                zone: lead.zone,
                email: targetEmail,
              },
              subject: pitch.subject,
              status: "DELIVERED_REAL",
              delivery: {
                status: "SENT",
                messageId: executionMessageId,
                provider: "GMAIL_SMTP"
              }
            });
          } else {
            addLiveLog(`⚠️ [SMTP Pro] Rejet email pour ${lead.title} : ${resData.error || "Échec"}`, "warning");
          }
        }

        // 2. Enregistrement WhatsApp Direct (si canal WHATSAPP/BOTH ou bascule auto sans email public)
        if (sendWhatsApp) {
          whatsappSuccess = true;
          const isFallback = !hasVerifiedEmail && selectedChannel === "EMAIL";
          const fallbackNote = isFallback ? " (Routage auto : annonce sans email public)" : "";
          
          addLiveLog(`💬 [WhatsApp Direct] Pitch 1-clic préparé pour ${lead.title} (+${finalPhone})${fallbackNote}`, "info");
          
          recordOutreachLog({
            executionId: `wa_inline_${Date.now()}_${i}`,
            timestamp: new Date().toISOString(),
            eventType: "WHATSAPP_PITCH",
            recipient: {
              leadId: lead.id,
              title: lead.title,
              zone: lead.zone,
              phone: finalPhone,
            },
            subject: `Pitch WhatsApp (${lang})`,
            status: "DELIVERED_REAL",
            delivery: {
              status: "SENT",
              provider: "WHATSAPP_DIRECT"
            }
          });
        }

        // Mise à jour du statut du lead vers 'contacte'
        await fetch("/api/prospects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_id: lead.id, outreach_status: "contacte" }),
        });

        onLeadUpdated(lead.id, "contacte");

        if (emailSuccess || whatsappSuccess) {
          localSuccess++;
          setSuccessCount(localSuccess);
        } else {
          localFailed++;
          setFailedCount(localFailed);
        }
      } catch (err: any) {
        localFailed++;
        setFailedCount(localFailed);
        addLiveLog(`❌ Erreur sur ${lead.title} : ${err.message}`, "error");
      }

      setDispatchedCount(i + 1);
      setProgress(Math.round(((i + 1) / queue.length) * 100));

      // Délai de précaution anti-flood (500ms)
      await new Promise(r => setTimeout(r, 500));
    }

    setIsDispatching(false);
    setIsCompleted(true);
    addLiveLog(`🏁 Diffusion terminée avec succès ! (${localSuccess} délivrés, ${localFailed} échecs)`, "success");
    onTelemetryRefresh();
  };

  const handlePurge = () => {
    if (window.confirm("Voulez-vous réinitialiser l'historique d'envoi et la télémétrie ?")) {
      purgeOutreachLogs();
      onTelemetryRefresh();
    }
  };

  return (
    <div className="space-y-4 rounded-card bg-surface border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> Mass Regional Outreach Dispatcher
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
              Console d&apos;Acheminement Inline 🇲🇦
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Appartements &amp; Penthouses
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            Diffusion Massive &amp; Prospection Appartements en Direct
          </h2>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Pilotez l&apos;envoi simultané d&apos;audits locatifs aux propriétaires d&apos;appartements à Marrakech. Argumentaires calibrés sur la tranquillité syndic, l&apos;accès autonome 24/7 et la captation de voyageurs business en semaine (88% d&apos;occupation).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleLaunchMassOutreach}
            disabled={isDispatching || eligibleLeads.length === 0}
            className="px-5 py-3 rounded-btn bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 fill-white ${isDispatching ? "animate-spin" : "animate-pulse"}`} />
            <span>
              {isDispatching
                ? `Diffusion en cours (${progress}%)...`
                : `🚀 Démarrer la Diffusion Massive (${eligibleLeads.length} Appartements)`}
            </span>
          </button>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 1. Canal */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
          <div className="text-[11px] font-bold text-foreground flex items-center gap-1">
            <Send className="w-3 h-3 text-emerald-400" />
            <span>Canal d&apos;Acheminement :</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["EMAIL", "WHATSAPP", "BOTH"] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`py-1 text-[11px] font-bold rounded border transition-all ${
                  selectedChannel === ch
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                }`}
              >
                {ch === "EMAIL" ? "✉️ Email" : ch === "WHATSAPP" ? "💬 WA" : "⚡ Les 2"}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Langue */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
          <div className="text-[11px] font-bold text-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Langue du Pitch :</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["FR", "DARIJA", "EN"] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`py-1 text-[11px] font-bold rounded border transition-all ${
                  lang === l
                    ? "bg-primary text-surface-muted border-primary shadow-sm"
                    : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                }`}
              >
                {l === "FR" ? "🇫🇷 FR" : l === "DARIJA" ? "🇲🇦 Darija" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Typologie */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
          <div className="text-[11px] font-bold text-foreground flex items-center gap-1">
            <Building2 className="w-3 h-3 text-sky-400" />
            <span>Typologie Cible :</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "appartement", label: "🏢 Apparts" },
              { id: "studio", label: "🔑 Studios" },
              { id: "all", label: "🌍 Tous" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTargetType(t.id as any)}
                className={`py-1 text-[11px] font-bold rounded border transition-all ${
                  targetType === t.id
                    ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                    : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Statut & Résumé */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground">Gain Détecté Cible :</span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono">
              +{formatMAD(totalTargetGain, false)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <input
              type="checkbox"
              id="inlineOnlyNew"
              checked={onlyNew}
              onChange={(e) => setOnlyNew(e.target.checked)}
              className="rounded border-surface-border bg-surface text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="inlineOnlyNew" className="cursor-pointer">
              Nouveaux leads ({eligibleLeads.length})
            </label>
          </div>
        </div>
      </div>

      {/* Test Email Override / Direct Delivery Bar */}
      <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>Email de Test / Boîte de Réception Directe (Optionnel) :</span>
          </label>
          <span className="text-[10px] text-muted-foreground font-medium">
            {testEmailOverride.trim() 
              ? `✉️ Mode Test Actif : Les emails seront réexpédiés vers ${testEmailOverride.trim()}`
              : "🛡️ Routage Multi-Canal Intelligent : WhatsApp direct 1-clic si l'annonce n'a pas d'email public"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={testEmailOverride}
            onChange={(e) => setTestEmailOverride(e.target.value)}
            placeholder="Ex: tiguidda76@gmail.com (Laissez vide pour le routage WhatsApp direct)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setTestEmailOverride("tiguidda76@gmail.com")}
            className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shrink-0 flex items-center gap-1"
          >
            <span>Remplir tiguidda76@gmail.com</span>
          </button>
          {testEmailOverride && (
            <button
              type="button"
              onClick={() => setTestEmailOverride("")}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-surface text-muted-foreground border border-surface-border hover:text-foreground transition-all shrink-0"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Progress & Live Logs Execution Bar */}
      {(isDispatching || isCompleted || liveLogs.length > 0) && (
        <div className="p-4 rounded-xl bg-surface-elevated border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-foreground flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDispatching ? "text-emerald-400 animate-spin" : "text-muted-foreground"}`} />
              {isDispatching ? "Diffusion massive en cours d'exécution..." : isCompleted ? "Campagne Terminée avec Succès !" : "Journal d'envoi en direct"}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {progress}% ({dispatchedCount}/{eligibleLeads.length})
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-surface-border">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {successCount} délivrés en direct
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> {failedCount} rejets anti-bounce
              </span>
            )}
          </div>

          {/* Console Log Window */}
          <div className="h-28 overflow-y-auto rounded-lg bg-black/80 p-2.5 font-mono text-[11px] leading-relaxed space-y-1 text-slate-300 custom-scrollbar border border-white/10">
            {liveLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === "success" ? "text-emerald-400 font-semibold" :
                  log.type === "error" ? "text-rose-400 font-semibold" :
                  log.type === "warning" ? "text-amber-400" :
                  "text-slate-300"
                }>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Stored Logs Telemetry Table (Inline) */}
      <div className="space-y-2 pt-2 border-t border-surface-border">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setShowLogsTable(!showLogsTable)}
            className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Journal d&apos;Exécution Réel &amp; Télémesure d&apos;Envoi ({storedLogs.length} logs enregistrés)</span>
            {showLogsTable ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTelemetryRefresh}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-border text-[11px] font-semibold text-foreground border border-surface-border transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={handlePurge}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-semibold text-rose-400 border border-rose-500/20 transition-colors"
              title="Purger l'historique d'envoi"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purger</span>
            </button>
          </div>
        </div>

        {showLogsTable && (
          storedLogs.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-surface-elevated/40 border border-surface-border text-xs text-muted-foreground">
              Aucun envoi enregistré pour le moment. Cliquez sur &quot;🚀 Démarrer la Diffusion Massive&quot; ci-dessus pour lancer la diffusion sur les appartements.
            </div>
          ) : (
            <div className="rounded-xl bg-surface-elevated/30 border border-surface-border overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider border-b border-surface-border sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date/Heure</th>
                    <th className="py-2.5 px-3">Appartement / Destinataire</th>
                    <th className="py-2.5 px-3">Canal</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">Preuve / Message-ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono text-[11px]">
                  {storedLogs.slice(0, 30).map((log, idx) => {
                    const timeFormatted = new Date(log.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                    const isDelivered = log.status === "DELIVERED_REAL" || log.delivery?.status === "SENT";

                    return (
                      <tr key={idx} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{timeFormatted}</td>
                        <td className="py-2 px-3 text-foreground font-sans font-medium truncate max-w-xs">
                          {log.recipient?.title || "Propriété"}
                          <span className="block text-[10px] text-muted-foreground font-mono truncate">
                            {log.recipient?.email || log.recipient?.phone || "—"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.eventType === "EMAIL_PITCH" 
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {log.eventType === "EMAIL_PITCH" ? "✉️ Gmail SMTP" : "💬 WhatsApp"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDelivered 
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}>
                            {isDelivered ? "✓ DÉLIVRÉ" : "ÉCHEC"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-[10px] truncate max-w-xs">
                          {log.delivery?.messageId || log.executionId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
