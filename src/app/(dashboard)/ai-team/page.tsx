"use client";

import { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Send, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Mail, 
  Calculator, 
  Scale, 
  Eye, 
  MessageSquare, 
  Activity, 
  Cpu, 
  Terminal, 
  Play, 
  RotateCcw,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { MOCK_KPI_METRICS, MOCK_PROPERTIES, MOCK_BOOKINGS } from "@/lib/mockData";
import { formatMAD, formatDate } from "@/lib/utils";
import { LEGAL_ENTITY } from "@/lib/constants";

interface AgentDef {
  id: string;
  name: string;
  codename: string;
  role: string;
  avatarIcon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  autonomy: number;
  status: "actif" | "veille" | "mission";
  lastAction: string;
  description: string;
  systemPrompt: string;
  sampleQuestions: string[];
}

const AI_SQUAD: AgentDef[] = [
  {
    id: "manager-radar",
    name: "Manager Radar",
    codename: "Manager-Radar-01",
    role: "Superviseur Opérationnel & Alertes 24/7",
    avatarIcon: Cpu,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    autonomy: 80,
    status: "actif",
    lastAction: "Vérification des rotations ménage 3h (Conforme à 100%)",
    description: "Orchestrateur central. Surveille les seuils critiques, le taux d'occupation, les retards et coordonne les autres agents.",
    systemPrompt: "Tu es Manager Radar, l'agent superviseur opérationnel de Marrakech Conciergerie.",
    sampleQuestions: [
      "Fais-moi un rapport sur les performances et alertes du jour.",
      "Quel est notre taux d'occupation et notre chiffre d'affaires ce mois-ci ?",
      "Y a-t-il des risques sur les rotations de ménage de 3h ?",
    ],
  },
  {
    id: "prospect-hunter",
    name: "Prospect Hunter",
    codename: "Prospect-Hunter-07",
    role: "Acquisition de Nouveaux Mandats & Scoring",
    avatarIcon: Search,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    autonomy: 70,
    status: "actif",
    lastAction: "Scan des annonces Airbnb à 09h00 : 2 leads chauds détectés",
    description: "Scanne quotidiennement les plateformes pour détecter les riads et villas 'orphelins' ou sous-performants à Marrakech.",
    systemPrompt: "Tu es Prospect Hunter, l'agent commercial spécialisé dans la détection et le scoring de biens immobiliers à forte rentabilité à Marrakech.",
    sampleQuestions: [
      "Quels sont les meilleurs prospects détectés aujourd'hui à Marrakech ?",
      "Comment évalues-tu le potentiel d'un Riad à Bab Doukkala ?",
      "Transmets les leads qualifiés à Email Writer pour la séquence d'approche.",
    ],
  },
  {
    id: "email-writer",
    name: "Email Writer",
    codename: "Email-Writer-08",
    role: "Copywriting & Séquences d'Emails Automatisées",
    avatarIcon: Mail,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    autonomy: 80,
    status: "actif",
    lastAction: "Génération de la séquence de nurturing (5 emails sur 14j)",
    description: "Rédige les emails de prospection personnalisés, les rapports mensuels propriétaires et les réponses diplomatiques aux avis.",
    systemPrompt: "Tu es Email Writer, le rédacteur expert en communication d'exception et conciergerie de luxe à Marrakech.",
    sampleQuestions: [
      "Rédige un email d'approche percutant pour un propriétaire de villa à la Palmeraie.",
      "Écris une réponse bienveillante à un avis voyageur 4 étoiles sur Airbnb.",
      "Génère le texte d'accompagnement du relevé de reversement mensuel.",
    ],
  },
  {
    id: "auditor-agent",
    name: "Auditor Agent",
    codename: "Auditor-02",
    role: "Intégrité Calendriers & Taxe de Séjour",
    avatarIcon: ShieldAlert,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    autonomy: 90,
    status: "actif",
    lastAction: "Audit nocturne 02h00 : 0 conflit de calendrier, 1210 MAD de taxe vérifiés",
    description: "Vérifie en continu les synchronisations iCal (Airbnb / Booking.com) et le calcul précis de la taxe de séjour (11 MAD/nuit/pers).",
    systemPrompt: "Tu es Auditor Agent, le garant de la conformité comptable, fiscale et de la prévention des surréservations.",
    sampleQuestions: [
      "Y a-t-il des anomalies détectées sur les flux iCal récents ?",
      "Vérifie la conformité de la taxe de séjour pour les séjours de septembre.",
      "Comment sont protégées les réservations contre les doublons ?",
    ],
  },
  {
    id: "billing-officer",
    name: "Billing Officer",
    codename: "Billing-Officer-06",
    role: "Facturation, Commission 25% & Reversements J+5",
    avatarIcon: Calculator,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    autonomy: 85,
    status: "actif",
    lastAction: "Génération des bordereaux de reversements pour 124 500 MAD de CA",
    description: "Gère le Grand Livre, applique la commission fixe de 25% et calcule les virements bancaires des propriétaires à J+5.",
    systemPrompt: "Tu es Billing Officer, l'expert financier de Marrakech Conciergerie sous l'entité juridique de Hassan Tiguidda.",
    sampleQuestions: [
      "Calcule le reversement net pour le Riad Dar Al Andalus ce mois-ci.",
      "Quel est le montant total de nos commissions encaissées à 25% ?",
      "Rappelle-moi les coordonnées bancaires officielles de facturation.",
    ],
  },
  {
    id: "legal-shield",
    name: "Legal Shield",
    codename: "Legal-Shield-05",
    role: "Conformité Légale & Déclarations de Police",
    avatarIcon: Scale,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    autonomy: 75,
    status: "actif",
    lastAction: "Contrôle des fiches individuelles de police pour les arrivées du jour",
    description: "Assure la conformité avec la réglementation marocaine (Exonération TVA Art. 91 CGI, formalités de séjour, contrats de mandat).",
    systemPrompt: "Tu es Legal Shield, le conseiller juridique garantissant la conformité légale et fiscale au Maroc.",
    sampleQuestions: [
      "Quelles sont les mentions légales obligatoires sur nos factures ?",
      "Quelle est la procédure pour la transmission des fiches de police à Marrakech ?",
      "Comment est formulée l'exonération de TVA en tant qu'auto-entrepreneur ?",
    ],
  },
  {
    id: "reply-rescue",
    name: "Reply Rescue",
    codename: "Reply-Rescue-03",
    role: "Assistance Voyageurs Multi-Langues & WhatsApp",
    avatarIcon: MessageSquare,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    autonomy: 60,
    status: "veille",
    lastAction: "Guide d'accueil et instructions Wi-Fi envoyés pour l'arrivée de 16h",
    description: "Répond instantanément aux demandes des voyageurs (transfert aéroport, check-in, recommandations locales) en 4 langues.",
    systemPrompt: "Tu es Reply Rescue, le concierge digital chaleureux et raffiné dédié à l'expérience des voyageurs à Marrakech.",
    sampleQuestions: [
      "Rédige un message WhatsApp d'accueil pour l'arrivée d'Alexander au Riad.",
      "Comment répondre à un voyageur demandant un départ tardif à 15h ?",
      "Donne-moi 3 recommandations de restaurants romantiques dans la Médina.",
    ],
  },
  {
    id: "qc-reviewer",
    name: "QC Reviewer",
    codename: "QC-Reviewer-04",
    role: "Contrôle Qualité Ménage & Audit 30 Points",
    avatarIcon: Eye,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    autonomy: 50,
    status: "veille",
    lastAction: "Validation du rapport de ménage pour la Villa Majorelle (Score: 100%)",
    description: "Supervise la check-list ménage de 30 points (linge repassé, thé d'accueil, climatisation) et valide les photos des gouvernantes.",
    systemPrompt: "Tu es QC Reviewer, le responsable rigoureux des standards de propreté et d'accueil haut de gamme.",
    sampleQuestions: [
      "Quels sont les points critiques de la check-list ménage 30 points ?",
      "Comment gérer une non-conformité signalée avant l'arrivée du voyageur ?",
      "Quelle est notre politique pour le contrôle du linge et des draps ?",
    ],
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  agentName: string;
  text: string;
  timestamp: string;
}

export default function AITeamPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentDef>(AI_SQUAD[0]);
  const [activeTab, setActiveTab] = useState<"chat" | "squad" | "logs">("chat");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init-1",
      sender: "agent",
      agentName: "Manager Radar",
      text: `Bonjour ! Je suis **Manager Radar**, l'orchestrateur de votre équipe AI pour **Marrakech Conciergerie**.\n\n📊 **Point de situation en direct** :\n- **Taux d'occupation** : 87.5% (6 biens actifs)\n- **Volume brut généré** : ${formatMAD(MOCK_KPI_METRICS.monthlyRevenueMAD)} (${formatMAD(MOCK_KPI_METRICS.conciergeRevenueMAD)} de commission nette conciergerie à 25%)\n- **Synchronisation iCal** : 100% à jour (Airbnb & Booking.com)\n- **Opérations terrain** : 0 retard sur les rotations ménage de 3h.\n\nComment puis-je vous assister ou quel agent souhaitez-vous mobiliser ?`,
      timestamp: "À l'instant",
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      agentName: "Vous",
      text: text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      const lower = text.toLowerCase();

      if (selectedAgent.id === "prospect-hunter" || lower.includes("prospect") || lower.includes("lead")) {
        replyText = `🎯 **Rapport Prospect Hunter — Marrakech**\n\nVoici les **2 opportunités prioritaires** qualifiées ce matin avec un score supérieur à 75/100 :\n\n1. **Riad Dar Salam (Médina - Bab Doukkala)** — *Score: 85/100*\n   - 4 suites, patio avec bassin, terrasse vue Koutoubia.\n   - **Points faibles actuels** : Photos sous-exposées, délai de réponse > 2h, pas de conciergerie pro.\n   - **Gain potentiel estimé** : **+14 000 MAD/mois** avec notre tarification dynamique.\n\n2. **Villa Les Palmiers (Circuit de la Palmeraie)** — *Score: 78/100*\n   - 5 chambres, grand jardin arboré, piscine privée chauffée.\n   - **Anomalie détectée** : Tarif nuitée 35% sous le benchmark du secteur.\n   - **Gain potentiel** : **+25 000 MAD/mois**.\n\nSouhaitez-vous que je demande à **Email Writer** de générer les emails d'approche personnalisés ?`;
      } else if (selectedAgent.id === "email-writer" || lower.includes("email") || lower.includes("avis") || lower.includes("nurturing")) {
        replyText = `✉️ **Email Writer — Proposition de Séquence**\n\n**Objet :** *Optimisation locative & hospitalité d'exception pour votre bien à Marrakech*\n\n*Bonjour Monsieur/Madame,*\n\n*Propriétaire d'un bien d'exception à Marrakech, vous méritez une gestion sereine et valorisante. Marrakech Conciergerie garantit à vos hôtes une expérience 5 étoiles tout en maximisant vos revenus locatifs nets :*\n\n- ✨ **Commission transparente de 25%** sur le chiffre brut encaissé.\n- ⏱️ **Virement bancaire de vos loyers à J+5** chaque début de mois avec bordereau détaillé.\n- 🧼 **Ménage d'orfèvre (QC 30 points)** et accueil VIP avec thé à la menthe traditionnel.\n- ⚖️ **Conformité totale** avec les déclarations de police et la taxe de séjour (11 MAD).\n\n*Seriez-vous disponible pour un court échange de 10 minutes afin de découvrir notre estimation locative offerte ?*\n\nBien cordialement,\n**Hassan Tiguidda** — Marrakech Conciergerie Privée`;
      } else if (selectedAgent.id === "auditor-agent" || lower.includes("ical") || lower.includes("taxe") || lower.includes("conflit")) {
        replyText = `🛡️ **Auditor Agent — Bilan de Conformité**\n\n- **Flux iCal RFC 5545** : 6 flux actifs vérifiés. **0 chevauchement ni double réservation**.\n- **Taxe de séjour (11 MAD/personne/nuit)** : **1 210 MAD** provisionnés sur les séjours d'août/septembre, déclarations prêtes pour la Délégation du Tourisme.\n- **Turnaround ménage** : Toutes les fenêtres de 3h (11h00 → 14h00) sont sécurisées avec affectation nominative des gouvernantes.`;
      } else if (selectedAgent.id === "billing-officer" || lower.includes("commission") || lower.includes("reversement") || lower.includes("rib")) {
        replyText = `💳 **Billing Officer — Synthèse Financière**\n\n- **Chiffre d'Affaires Brut** : ${formatMAD(MOCK_KPI_METRICS.monthlyRevenueMAD)}\n- **Commissions Conciergerie (25%)** : ${formatMAD(MOCK_KPI_METRICS.conciergeRevenueMAD)} *(Exonéré de TVA selon Art. 91 CGI)*\n- **Reversements Propriétaires (75% nets)** : ${formatMAD(MOCK_KPI_METRICS.monthlyRevenueMAD - MOCK_KPI_METRICS.conciergeRevenueMAD)}\n- **Délai d'exécution** : Exécution des virements à J+5 vers les RIB enregistrés (Attijariwafa, BMCE, CIH).`;
      } else if (selectedAgent.id === "legal-shield" || lower.includes("loi") || lower.includes("ice") || lower.includes("police")) {
        replyText = `⚖️ **Legal Shield — Statut Légal & Fiscal**\n\n- **Émetteur Officiel** : ${LEGAL_ENTITY.name} (${LEGAL_ENTITY.status})\n- **Numéro ICE** : \`${LEGAL_ENTITY.ice}\`\n- **Mention TVA obligatoire** : *"${LEGAL_ENTITY.tvaExemptionMention}"*\n- **Formalités de Police** : Transmission des fiches d'enregistrement obligatoires sous 24h après le check-in des voyageurs internationaux.`;
      } else {
        replyText = `🤖 **${selectedAgent.name} à votre écoute**\n\nJ'ai bien pris en compte votre demande : *" ${text} "*.\n\nToutes les métriques de la conciergerie sont au vert à Marrakech. Nos 8 agents continuent leur veille automatique 24/7 sur les plateformes, les calendriers et la satisfaction des voyageurs.`;
      }

      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        agentName: selectedAgent.name,
        text: replyText,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Escouade AI & Copilot Manager</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervisez votre équipe de 8 agents autonomes et discutez en direct avec Manager Radar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>8 Agents Opérationnels (Autonomie ~80%)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-border pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "chat"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat en Direct Copilot
        </button>

        <button
          onClick={() => setActiveTab("squad")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "squad"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="w-4 h-4" />
          Matrice des 8 Agents ({AI_SQUAD.length})
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "logs"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-4 h-4" />
          Journal d'Événements Live
        </button>
      </div>

      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Sélectionner l&apos;Agent
            </div>

            <div className="space-y-1.5">
              {AI_SQUAD.map((agent) => {
                const Icon = agent.avatarIcon;
                const isSelected = selectedAgent.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-3 rounded-card border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? "bg-surface-elevated border-primary/50 shadow-md shadow-primary/10"
                        : "bg-surface border-surface-border hover:border-surface-border hover:bg-surface-elevated/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${agent.bgColor} ${agent.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"} truncate`}>
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{agent.role.split("&")[0]}</div>
                      </div>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-card bg-surface border border-surface-border shadow-xl flex flex-col h-[640px] overflow-hidden">
            <div className="p-4 border-b border-surface-border bg-surface-elevated/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${selectedAgent.bgColor} ${selectedAgent.color} flex items-center justify-center shadow-md`}>
                  {(() => {
                    const Icon = selectedAgent.avatarIcon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-sm font-bold text-foreground">{selectedAgent.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-primary">
                      {selectedAgent.codename}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{selectedAgent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground hidden sm:inline">Autonomie :</span>
                <span className="text-xs font-bold text-emerald-400">{selectedAgent.autonomy}%</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.sender === "user"
                        ? "bg-primary text-surface-muted"
                        : `${selectedAgent.bgColor} ${selectedAgent.color}`
                    }`}
                  >
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-1 shadow-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-surface-muted font-medium rounded-tr-none"
                        : "bg-surface-elevated border border-surface-border text-foreground rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1 border-b border-surface-border/30">
                      <span className="font-bold">{msg.agentName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="text-xs font-normal">{msg.text}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs pl-10 animate-pulse">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>{selectedAgent.name} prépare sa réponse...</span>
                </div>
              )}
            </div>

            <div className="p-2.5 border-t border-surface-border/60 bg-surface-elevated/30 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0 pl-1">
                Suggestions :
              </span>
              {selectedAgent.sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full bg-surface border border-surface-border hover:border-primary/50 text-[11px] text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-surface-border bg-surface flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder={`Poser une question à ${selectedAgent.name}...`}
                className="flex-1 bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-surface-muted font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-primary/20 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "squad" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AI_SQUAD.map((agent) => {
            const Icon = agent.avatarIcon;
            return (
              <div
                key={agent.id}
                className="p-5 rounded-card bg-surface border border-surface-border hover:border-primary/40 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl ${agent.bgColor} ${agent.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {agent.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-[10px] font-mono text-primary font-semibold">{agent.codename}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{agent.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-surface-border text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Autonomie</span>
                      <span className="font-bold text-foreground">{agent.autonomy}%</span>
                    </div>
                    <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${agent.autonomy}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-surface-border text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Dernière action : </span>
                    {agent.lastAction}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setActiveTab("chat");
                    }}
                    className="w-full py-2 rounded-btn bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Ouvrir le Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="rounded-card bg-surface border border-surface-border shadow-xl overflow-hidden text-xs">
          <div className="p-4 border-b border-surface-border bg-surface-elevated/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-sm font-bold text-foreground">Flux d&apos;Événements Inter-Agents (agent_events)</h2>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Écoute en temps réel
            </span>
          </div>

          <div className="divide-y divide-surface-border">
            {[
              {
                time: "09:00:12",
                source: "Prospect-Hunter-07",
                target: "Email-Writer-08",
                event: "lead_detected_hot",
                payload: '{"property": "Riad Dar Salam", "score": 85, "quartier": "Bab Doukkala"}',
                status: "success",
              },
              {
                time: "08:00:00",
                source: "Billing-Officer-06",
                target: "Manager-Radar-01",
                event: "payouts_calculated_j5",
                payload: '{"total_payout_mad": 93375, "owners_count": 6, "status": "ready"}',
                status: "success",
              },
              {
                time: "02:00:04",
                source: "Auditor-02",
                target: "Manager-Radar-01",
                event: "audit_completed_clean",
                payload: '{"conflicts": 0, "tourist_tax_verified_mad": 1210}',
                status: "success",
              },
              {
                time: "Hier 18:30",
                source: "Reply-Rescue-03",
                target: "WhatsApp-Gateway",
                event: "guest_welcome_sent",
                payload: '{"guest": "Alexander Van Der Bilt", "channel": "whatsapp", "lang": "en"}',
                status: "success",
              },
              {
                time: "Hier 14:15",
                source: "QC-Reviewer-04",
                target: "Manager-Radar-01",
                event: "turnaround_qc_passed",
                payload: '{"property": "Villa Majorelle", "score_30pts": 30, "turnaround_h": 2.5}',
                status: "success",
              },
            ].map((log, idx) => (
              <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground text-[11px]">{log.time}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold text-[10px]">
                    {log.source}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-foreground font-semibold text-[10px]">
                    {log.target}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-muted-foreground truncate max-w-md">
                  <span className="text-emerald-400 font-bold">{log.event}</span>: {log.payload}
                </div>

                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold self-start md:self-auto">
                  Traité
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
