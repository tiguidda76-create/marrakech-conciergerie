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
  Send
} from "lucide-react";
import { ProspectLead, PropertyQuartier, OutreachStatus } from "@/types";
import { formatMAD } from "@/lib/utils";

const MARRAKECH_ZONES: { id: PropertyQuartier; label: string }[] = [
  { id: "medina", label: "Médina (Riads & Maisons d'Hôtes)" },
  { id: "palmeraie", label: "Palmeraie (Villas & Domaines)" },
  { id: "gueliz", label: "Guéliz (Appartements & Penthouses)" },
  { id: "hivernage", label: "Hivernage (Duplex & Résidences Prestige)" },
  { id: "targa", label: "Targa (Villas Familiales)" },
];

export default function ProspectsPage() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedZone, setSelectedZone] = useState<PropertyQuartier>("medina");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeModalLead, setActiveModalLead] = useState<ProspectLead | null>(null);
  const [copiedType, setCopiedType] = useState<"whatsapp" | "email" | null>(null);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/prospects");
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

  const handleRunLiveHunt = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/prospects/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone: selectedZone, limit: 6 }),
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

  const handleOpenWhatsApp = (lead: ProspectLead) => {
    const encoded = encodeURIComponent(lead.suggested_message_whatsapp);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    handleUpdateStatus(lead.id, "contacte");
  };

  const filteredLeads = leads.filter(l => filterStatus === "all" ? true : l.outreach_status === filterStatus);
  const totalEstimatedGains = leads.reduce((acc, l) => acc + l.estimated_gain_annual_mad, 0);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="p-6 sm:p-8 rounded-card bg-gradient-to-r from-surface via-surface to-surface-elevated border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <Target className="w-3.5 h-3.5" /> Agent Prospect Hunter Live
              </span>
              <span className="text-xs text-muted-foreground font-medium">Acquisition de Nouveaux Mandats à Marrakech</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Chasse Immobilière &amp; Outreach Propriétaires
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Détectez en direct les Riads et Villas sous-exploités ou mal positionnés sur les plateformes. Générez instantanément des audits de rentabilité et contactez les propriétaires avec des messages signés <b>Hassan Tiguidda</b>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-surface border border-surface-border text-center min-w-[130px]">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Leads Qualifiés</div>
              <div className="text-xl font-bold text-foreground">{leads.length}</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-surface border border-emerald-500/20 text-center min-w-[150px]">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Gain Détecté Total</div>
              <div className="text-xl font-bold text-emerald-400">+{formatMAD(totalEstimatedGains, false)}</div>
            </div>
          </div>
        </div>
      </div>

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
        </div>

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

      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <span>Chargement du pipeline de prospection...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-surface-border space-y-3">
          <Target className="w-8 h-8 text-primary mx-auto opacity-50" />
          <p className="text-sm font-semibold text-foreground">Aucun lead trouvé dans ce filtre</p>
          <p className="text-xs text-muted-foreground">Cliquez sur &quot;Scanner le Marché en Direct&quot; pour détecter des annonces à Marrakech.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-card bg-surface border border-surface-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {lead.zone}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Score: {lead.opportunity_score}%
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      lead.outreach_status === "mandat_signe" ? "bg-emerald-500/20 text-emerald-400" :
                      lead.outreach_status === "rendez_vous" ? "bg-blue-500/20 text-blue-400" :
                      lead.outreach_status === "contacte" ? "bg-purple-500/20 text-purple-400" :
                      "bg-amber-500/15 text-amber-400"
                    }`}>
                      {lead.outreach_status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {lead.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{lead.rating}</span>
                      <span>({lead.reviews_count} avis)</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">{lead.platform}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tarif actuel :</span>
                    <span className="font-bold text-foreground">{lead.nightly_price.toLocaleString("fr-FR")} MAD/nuit</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Potentiel optimisé :</span>
                    <span className="font-bold text-primary">{lead.estimated_adr.toLocaleString("fr-FR")} MAD/nuit</span>
                  </div>
                  <div className="pt-1.5 border-t border-surface-border flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">Gain net estimé :</span>
                    <span className="font-bold text-emerald-400">+{lead.estimated_gain_annual_mad.toLocaleString("fr-FR")} MAD/an</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                  💡 {lead.audit_notes[0] || "Optimisation tarification dynamique et conciergerie 5 étoiles"}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center gap-2">
                <button
                  onClick={() => setActiveModalLead(lead)}
                  className="flex-1 py-2 px-3 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Préparer Outreach</span>
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

      {activeModalLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
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

            <div className="space-y-2 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Message WhatsApp Personnalisé</span>
                </div>
                <button
                  onClick={() => handleCopyText(activeModalLead.suggested_message_whatsapp, "whatsapp")}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                >
                  {copiedType === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "whatsapp" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={activeModalLead.suggested_message_whatsapp}
                className="w-full bg-surface border border-surface-border rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed resize-none focus:outline-none"
              />

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleOpenWhatsApp(activeModalLead)}
                  className="flex items-center gap-2 px-4 py-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Envoyer via WhatsApp Direct</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>Email Formel avec Audit de Rentabilité</span>
                </div>
                <button
                  onClick={() => handleCopyText(activeModalLead.suggested_message_email, "email")}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                >
                  {copiedType === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "email" ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={activeModalLead.suggested_message_email}
                className="w-full bg-surface border border-surface-border rounded-lg p-3 text-xs text-foreground font-mono leading-relaxed resize-none focus:outline-none"
              />
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-2 border-t border-surface-border">
              <span>Signé par : <b>Hassan Tiguidda</b> (+212 6 32 15 54 30)</span>
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
    </div>
  );
}
