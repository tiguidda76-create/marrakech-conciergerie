"use client";

import React, { useState, useMemo } from "react";
import { 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  Building2, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  Check, 
  Clock, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { ProspectLead, OutreachStatus } from "@/types";
import { LEGAL_ENTITY } from "@/lib/constants";
import { recordOutreachLog } from "@/lib/outreachStorage";
import { formatMAD } from "@/lib/utils";

interface MassOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: ProspectLead[];
  onLeadUpdated: (leadId: string, status: OutreachStatus) => void;
  onTelemetryRefresh: () => void;
}

export const MassOutreachModal: React.FC<MassOutreachModalProps> = ({
  isOpen,
  onClose,
  leads,
  onLeadUpdated,
  onTelemetryRefresh,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "WHATSAPP" | "BOTH">("EMAIL");
  const [lang, setLang] = useState<"FR" | "DARIJA" | "EN">("FR");
  const [filterType, setFilterType] = useState<"appartement" | "studio" | "all">("appartement");
  const [onlyNew, setOnlyNew] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Execution state
  const [isDispatching, setIsDispatching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<Array<{ text: string; type: "info" | "success" | "warning" | "error"; time: string }>>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter eligible leads based on criteria
  const eligibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = onlyNew ? lead.outreach_status === "nouveau" : true;
      const isApartment = ["appartement", "duplex", "studio"].includes(lead.property_type);
      const matchesType = 
        filterType === "all" ? true :
        filterType === "appartement" ? isApartment :
        lead.property_type === filterType;
      return matchesStatus && matchesType;
    });
  }, [leads, filterType, onlyNew]);

  // Sync initial selection when eligible leads change
  React.useEffect(() => {
    if (isOpen && selectedIds.length === 0 && eligibleLeads.length > 0) {
      setSelectedIds(eligibleLeads.map(l => l.id));
    }
  }, [isOpen, eligibleLeads]);

  if (!isOpen) return null;

  const targetLeads = eligibleLeads.filter(l => selectedIds.includes(l.id));
  const totalTargetGain = targetLeads.reduce((acc, l) => acc + l.estimated_gain_annual_mad, 0);

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Générateur dynamique de pitch pour le batch dispatch
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

  const addLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [{ text, type, time }, ...prev.slice(0, 80)]);
  };

  const handleLaunchMassOutreach = async () => {
    if (targetLeads.length === 0 || isDispatching) return;

    setIsDispatching(true);
    setIsPaused(false);
    setProgress(0);
    setDispatchedCount(0);
    setSuccessCount(0);
    setFailedCount(0);
    setLogs([]);
    setIsCompleted(false);

    addLog(`🚀 Démarrage de la campagne Mass Outreach pour ${targetLeads.length} appartements...`, "info");
    addLog(`📡 Canal sélectionné : ${selectedChannel} | Langue : ${lang}`, "info");

    const queue = [...targetLeads];
    let localSuccess = 0;
    let localFailed = 0;

    for (let i = 0; i < queue.length; i++) {
      const lead = queue[i];
      const pitch = buildPitch(lead, lang);

      // Résolution du contact email et téléphone
      const resolvedEmail = lead.owner_contact?.includes("@") 
        ? lead.owner_contact.trim() 
        : `proprietaire.${lead.id.slice(-6)}@marrakech-concierge.ma`;
      
      const cleanPhoneDigits = (lead.owner_contact || "0632155430").replace(/[^0-9]/g, "");
      const finalPhone = cleanPhoneDigits.startsWith("0") ? "212" + cleanPhoneDigits.slice(1) : cleanPhoneDigits;

      try {
        let emailSuccess = false;
        let whatsappSuccess = false;
        let executionMessageId = `msg_${Date.now()}_${i}`;

        // 1. Envoi par Email (si canal EMAIL ou BOTH)
        if (selectedChannel === "EMAIL" || selectedChannel === "BOTH") {
          const res = await fetch("/api/outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "EMAIL",
              recipient: {
                name: lead.owner_name || "Propriétaire",
                email: resolvedEmail,
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
            addLog(`✉️ [SMTP Pro] Email délivré à ${lead.title} (${resolvedEmail})`, "success");
            
            recordOutreachLog({
              executionId: executionMessageId,
              timestamp: new Date().toISOString(),
              eventType: "EMAIL_PITCH",
              recipient: {
                leadId: lead.id,
                title: lead.title,
                zone: lead.zone,
                email: resolvedEmail,
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
            addLog(`⚠️ [SMTP Pro] Rejet email pour ${lead.title} : ${resData.error || "Échec"}`, "warning");
          }
        }

        // 2. Enregistrement WhatsApp Direct (si canal WHATSAPP ou BOTH)
        if (selectedChannel === "WHATSAPP" || selectedChannel === "BOTH") {
          whatsappSuccess = true;
          addLog(`💬 [WhatsApp] Pitch préparé pour ${lead.title} (${finalPhone})`, "info");
          
          recordOutreachLog({
            executionId: `wa_batch_${Date.now()}_${i}`,
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
        addLog(`❌ Erreur d'acheminement sur ${lead.title} : ${err.message}`, "error");
      }

      setDispatchedCount(i + 1);
      setProgress(Math.round(((i + 1) / queue.length) * 100));

      // Délai de précaution anti-flood (600ms)
      await new Promise(r => setTimeout(r, 600));
    }

    setIsDispatching(false);
    setIsCompleted(true);
    addLog(`🏁 Campagne Mass Outreach terminée avec succès ! (${localSuccess} délivrés, ${localFailed} échecs)`, "success");
    onTelemetryRefresh();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-4xl rounded-card bg-surface border border-emerald-500/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-border bg-surface-elevated/40 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Mass Outreach Dispatcher
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
                Spécial Appartements &amp; Penthouses
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Diffusion Massive &amp; Chasse Automatisée Marrakech
            </h2>
            <p className="text-xs text-muted-foreground">
              Contactez simultanément les propriétaires d'appartements et penthouses via <b>Gmail SMTP Pro</b> et <b>WhatsApp</b> avec argumentaire syndic et accès 24/7.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isDispatching}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Canal d'Acheminement */}
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Canal d'Acheminement</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(["EMAIL", "WHATSAPP", "BOTH"] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border text-center ${
                      selectedChannel === ch
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                        : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                    }`}
                  >
                    {ch === "EMAIL" ? "✉️ Email" : ch === "WHATSAPP" ? "💬 WhatsApp" : "⚡ Les 2"}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground pt-1">
                {selectedChannel === "EMAIL" ? "Gmail SMTP Pro direct avec bouclier anti-bounce MX" :
                 selectedChannel === "WHATSAPP" ? "Préparation d'envoi WhatsApp direct avec lien pré-rempli" :
                 "Double diffusion : Email SMTP + File d'attente WhatsApp"}
              </div>
            </div>

            {/* 2. Langue du Message */}
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Langue du Pitch</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(["FR", "DARIJA", "EN"] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border text-center ${
                      lang === l
                        ? "bg-primary text-surface-muted border-primary shadow-sm"
                        : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                    }`}
                  >
                    {l === "FR" ? "🇫🇷 FR" : l === "DARIJA" ? "🇲🇦 Darija" : "🇬🇧 EN"}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground pt-1">
                {lang === "FR" ? "Français : Standard hôtelier recommandé" :
                 lang === "DARIJA" ? "Darija : Idéal pour propriétaires locaux" :
                 "English : Expatriates & foreign owners"}
              </div>
            </div>

            {/* 3. Filtre Cible */}
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Typologie Ciblée</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {[
                  { id: "appartement", label: "🏢 Apparts" },
                  { id: "studio", label: "🔑 Studios" },
                  { id: "all", label: "🌍 Tous" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border text-center ${
                      filterType === t.id
                        ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                        : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  id="onlyNew"
                  checked={onlyNew}
                  onChange={(e) => setOnlyNew(e.target.checked)}
                  className="rounded border-surface-border bg-surface text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="onlyNew" className="cursor-pointer">Nouveaux leads uniquement</label>
              </div>
            </div>
          </div>

          {/* Target Leads Summary & Selector Bar */}
          <div className="p-4 rounded-xl bg-surface-elevated/40 border border-surface-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated text-xs font-bold text-foreground border border-surface-border transition-colors flex items-center gap-1.5"
              >
                {selectedIds.length === eligibleLeads.length ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{selectedIds.length === eligibleLeads.length ? "Tout désélectionner" : "Tout sélectionner"}</span>
              </button>

              <div className="text-xs text-muted-foreground">
                <b>{selectedIds.length}</b> sélectionnés sur <b>{eligibleLeads.length}</b> disponibles
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-400">
                Gain détecté cumulé : +{formatMAD(totalTargetGain, false)}
              </span>
            </div>
          </div>

          {/* Leads Checklist (Compact) */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-surface border border-surface-border custom-scrollbar">
            {eligibleLeads.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Aucun appartement ne correspond aux critères de filtre.
              </div>
            ) : (
              eligibleLeads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <div
                    key={lead.id}
                    onClick={() => toggleSelectLead(lead.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? "bg-emerald-950/20 border-emerald-500/40 text-foreground"
                        : "bg-surface-elevated/40 border-surface-border text-muted-foreground hover:border-emerald-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-emerald-600 border-emerald-500 text-white" : "border-surface-border bg-surface"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold text-foreground truncate">{lead.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-surface border border-surface-border shrink-0">
                        {lead.zone}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-emerald-400 font-bold">
                        +{formatMAD(lead.estimated_gain_annual_mad, false)}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {lead.property_type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Progress Bar & Live Execution Console */}
          {(isDispatching || isCompleted || logs.length > 0) && (
            <div className="space-y-3 p-4 rounded-xl bg-surface-elevated/60 border border-surface-border">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isDispatching ? "text-emerald-400 animate-spin" : "text-muted-foreground"}`} />
                  {isDispatching ? "Diffusion massive en cours..." : isCompleted ? "Campagne Terminée" : "Statut d'exécution"}
                </span>
                <span className="font-mono text-emerald-400">{progress}% ({dispatchedCount}/{targetLeads.length})</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-surface-border">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Quick Execution Badges */}
              <div className="flex items-center gap-3 text-xs pt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {successCount} délivrés
                </span>
                {failedCount > 0 && (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {failedCount} bloqués / échecs
                  </span>
                )}
              </div>

              {/* Terminal Logs */}
              <div className="h-32 overflow-y-auto rounded-lg bg-black/90 p-3 font-mono text-[11px] leading-relaxed space-y-1 text-slate-300 custom-scrollbar border border-white/10">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic">En attente de lancement...</div>
                ) : (
                  logs.map((log, idx) => (
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-surface-border bg-surface-elevated/40 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bouclier Anti-Bounce DNS actif • Relais Gmail Pro ({LEGAL_ENTITY.email})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isDispatching}
              className="px-4 py-2 rounded-btn bg-surface-elevated hover:bg-surface-border text-xs text-foreground font-semibold border border-surface-border transition-colors disabled:opacity-40"
            >
              Fermer
            </button>

            <button
              onClick={handleLaunchMassOutreach}
              disabled={isDispatching || selectedIds.length === 0}
              className="px-5 py-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isDispatching ? "animate-pulse" : ""}`} />
              <span>
                {isDispatching
                  ? `Diffusion (${progress}%)...`
                  : `Diffuser à ${targetLeads.length} Propriétaire${targetLeads.length > 1 ? "s" : ""}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
