"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Crown, 
  Bot, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  Star, 
  TrendingUp, 
  Clock, 
  Award,
  Zap,
  Check,
  ChevronRight,
  UserCheck,
  HeartHandshake
} from "lucide-react";
import Link from "next/link";

export default function PlaybookGuidePage() {
  const [activeTab, setActiveTab] = useState<"offre" | "roles" | "ai" | "workflow" | "raci">("offre");

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="p-6 sm:p-8 rounded-card bg-gradient-to-r from-surface via-surface to-surface-elevated border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 z-10 relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Guide Opérationnel & Playbook
            </span>
            <span className="text-xs text-muted-foreground font-medium">Standard d&apos;Excellence Hôtelière 5 Étoiles</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Offre de Service, Rôles &amp; Organisation
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Bienvenue dans le manuel d&apos;exploitation officiel de <b>Marrakech Conciergerie Privée</b>. 
            Découvrez comment nous combinons l&apos;excellence de l&apos;hospitalité marocaine, la supervision humaine de pointe 
            et la puissance de 8 agents d&apos;Intelligence Artificielle pour maximiser vos revenus locatifs.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-surface-border overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "offre", label: "1. Offre & Services", icon: Crown },
            { id: "roles", label: "2. Les Rôles Clés", icon: Users },
            { id: "ai", label: "3. L'Équipe AI Radar", icon: Bot },
            { id: "workflow", label: "4. Workflow au Quotidien", icon: Clock },
            { id: "raci", label: "5. Matrice Qui Fait Quoi", icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                  isActive
                    ? "bg-primary text-surface-muted border-primary shadow-primary/20 scale-[1.02]"
                    : "bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground border-surface-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "offre" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-surface border border-surface-border hover:border-primary/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Gestion Complète Clé en Main (Full Service)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prise en charge à 100% de votre bien immobilier à Marrakech : création et optimisation des annonces multilingues, photos haute définition, intendance et accueil des voyageurs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-surface-border hover:border-primary/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Commission Simple &amp; Transparente : 25%</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aucun frais fixe, aucun coût caché. Nous nous rémunérons à la performance uniquement sur les nuitées encaissées. Les reversements nets ont lieu chaque 1er du mois par virement direct.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-surface-border hover:border-primary/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">Conformité Légale &amp; Fiscale Marocaine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Déclaration des passeports aux autorités, perception et décompte de la taxe de séjour (11 MAD/nuit/pers) et facturation officielle Auto-Entrepreneur (Hassan Tiguidda, ICE 1161674000043).
              </p>
            </div>
          </div>

          <div className="p-6 rounded-card bg-surface border border-surface-border space-y-5">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Le Bouquet de Services Inclus dans le Mandat
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {[
                { title: "Optimisation Tarifaire Continue", desc: "Dynamic Pricing IA croisant Inside Airbnb, météo, saisonnalité et calendrier des événements." },
                { title: "Synchronisation Multi-Plateformes", desc: "Gestion centralisée iCal en direct (Airbnb, Booking.com, Abritel, réservations directes) anti-double booking." },
                { title: "Check-in & Check-out VIP", desc: "Accueil personnalisé avec thé de bienvenue, visite des lieux et remise des clés par un concierge de garde." },
                { title: "Ménage Hôtelier & Linge 5★", desc: "Standard rigoureux de rotation en 3 heures, blanchisserie professionnelle, literie impeccable et savons d'accueil." },
                { title: "Maintenance & Urgences 24/7", desc: "Équipe réactive pour la climatisation, la piscine, la plomberie et les interventions techniques immédiates." },
                { title: "Expériences & Conciergerie VIP", desc: "Mise à disposition de cuisinières privées, transferts aéroport avec chauffeur et réservations d'excursions." },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-surface border border-primary/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-surface-muted font-bold text-lg shadow-lg shadow-primary/25">
                  HT
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Hassan Tiguidda</h3>
                  <p className="text-xs text-primary font-semibold">Fondateur &amp; Directeur d&apos;Exploitation</p>
                  <p className="text-[11px] text-muted-foreground">Auto-Entrepreneur officiel • Marrakech</p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-surface-border">
                  <p className="font-semibold text-foreground">Responsabilités Clés :</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Supervision globale des opérations et respect de la qualité 5★.</li>
                    <li>Interlocuteur direct et privilégié des propriétaires mandants.</li>
                    <li>Validation des devis de réparations majeures (&gt; 1 500 MAD).</li>
                    <li>Exécution des virements bancaires de reversement mensuels.</li>
                    <li>Gestion des relations avec les autorités locales et assurances.</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary font-semibold text-center">
                Disponibilité 7j/7 • +212 6 32 15 54 30
              </div>
            </div>

            <div className="p-6 rounded-card bg-surface border border-surface-border shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-foreground font-bold text-lg">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Le Propriétaire (Client)</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Investisseur &amp; Partenaire Mandant</p>
                  <p className="text-[11px] text-muted-foreground">Bénéficiaire des loyers nets</p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-surface-border">
                  <p className="font-semibold text-foreground">Attentes &amp; Engagements :</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Mise à disposition du bien équipé et en parfait état d&apos;usage.</li>
                    <li>Fourniture des coordonnées bancaires (RIB / SWIFT).</li>
                    <li>Définition de ses dates d&apos;occupation personnelle en amont.</li>
                    <li>Approbation rapide des interventions techniques nécessaires.</li>
                    <li>Transparence totale : accès aux comptes-rendus en temps réel.</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-[11px] text-muted-foreground text-center font-semibold">
                Paiements perçus chaque 1er du mois
              </div>
            </div>

            <div className="p-6 rounded-card bg-surface border border-surface-border shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-foreground font-bold text-lg">
                  <HeartHandshake className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Équipe Terrain &amp; Voyageurs</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Gouvernantes, Artisans &amp; Hôtes VIP</p>
                  <p className="text-[11px] text-muted-foreground">Exécution physique des séjours</p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-surface-border">
                  <p className="font-semibold text-foreground">Engagements Qualité :</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><b>Gouvernante :</b> Ménage certifié et linge changé en 3 heures max.</li>
                    <li><b>Technicien :</b> Intervention climatisation/piscine sous 2 heures.</li>
                    <li><b>Voyageurs :</b> Respect du règlement et paiement taxe de séjour.</li>
                    <li><b>Chauffeur VIP :</b> Ponctualité absolue aux arrivées aéroport RAK.</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-[11px] text-muted-foreground text-center font-semibold">
                Contrôle qualité systématique avant chaque arrivée
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/25 flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Manager Radar &amp; l&apos;Escouade des 8 Agents IA</p>
              <p className="text-muted-foreground">
                Ces agents travaillent en tâche de fond 24h/24 pour automatiser la logistique, ajuster les prix et vous alerter en cas d&apos;anomalie. Vous pouvez dialoguer directement avec eux sur la page <b>Équipe AI &amp; Chat</b>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Manager Radar", role: "Superviseur IA Central", desc: "Orchestre l'ensemble des agents, détecte les priorités et prépare les synthèses exécutives quotidiennes.", icon: "⚡" },
              { name: "Yield Maximizer", role: "Tarification Dynamique", desc: "Scrape les concurrents locaux et adapte les tarifs chaque jour selon la demande et la saisonnalité.", icon: "📈" },
              { name: "Housekeeping Commander", role: "Coordination Ménage", desc: "Assigne automatiquement les gouvernantes dès le check-out et surveille le compte à rebours de 3 heures.", icon: "🧹" },
              { name: "Quality Auditor", role: "Contrôle des Standards", desc: "Vérifie les check-lists photos, l'état des équipements et garantit le niveau 5 étoiles avant check-in.", icon: "🔍" },
              { name: "Billing Officer", role: "Finances & Commissions", desc: "Calcule les commissions de 25%, décompte la taxe de séjour (11 MAD) et prépare les bordereaux de virement.", icon: "⚖️" },
              { name: "Guest Experience", role: "Support Voyageurs 24/7", desc: "Répond instantanément aux demandes des clients en 5 langues et organise leurs services sur mesure.", icon: "🛎️" },
              { name: "Reputation Sentinel", role: "Gestion des Avis", desc: "Analyse les notes Airbnb/Booking, alerte sur les axes d'amélioration et rédige les réponses d'excellence.", icon: "⭐" },
              { name: "Prospect Hunter", role: "Développement du Parc", desc: "Identifie les propriétaires de Riads et villas à Marrakech pour développer continuellement le portefeuille.", icon: "🎯" },
            ].map((agent, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/40 transition-all space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">Actif 24/7</span>
                  </div>
                  <h4 className="font-bold text-foreground text-xs">{agent.name}</h4>
                  <p className="text-[10px] text-primary font-semibold">{agent.role}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/ai-team"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs font-bold transition-all shadow-md shadow-primary/20"
            >
              <Bot className="w-4 h-4" />
              <span>Ouvrir la Salle de Contrôle de l&apos;Équipe AI</span>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "workflow" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-card bg-surface border border-surface-border space-y-6">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Le Cycle de Vie d&apos;une Réservation (De la réservation au reversement)
            </h2>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-surface-border">
              {[
                { step: "1", title: "Réservation & Synchronisation iCal", actor: "Système & Yield Maximizer", desc: "La réservation est confirmée sur Airbnb, Booking ou en direct. Les calendriers de toutes les plateformes sont bloqués instantanément pour éviter tout doublon." },
                { step: "2", title: "Planification Automatique du Ménage", actor: "Housekeeping Commander", desc: "Une tâche de rotation de 3 heures est immédiatement assignée à la gouvernante de la zone avec l'heure exacte de départ et d'arrivée." },
                { step: "3", title: "Accueil Personnalisé & Enregistrement Légal", actor: "Concierge de Garde & Hassan Tiguidda", desc: "Le voyageur est accueilli avec thé et corbeille de fruits. Les passeports sont relevés et la taxe de séjour (11 MAD/pers/nuit) est encaissée." },
                { step: "4", title: "Assistance Voyageurs & Services VIP", actor: "Guest Experience Concierge", desc: "Pendant le séjour, les voyageurs ont accès au majordome, cuisinière marocaine, chauffeur VIP et excursions privées sur simple demande." },
                { step: "5", title: "Check-out, Inspection & Audit Qualité", actor: "Quality Auditor & Gouvernante", desc: "Contrôle d'absence de dommage, inventaire minutieux et restitution sécurisée des clés." },
                { step: "6", title: "Clôture Comptable & Virement Propriétaire", actor: "Billing Officer & Hassan Tiguidda", desc: "Chaque 1er du mois, un compte-rendu clair est généré et 75% du montant brut est viré directement sur le compte bancaire du propriétaire." },
              ].map((phase, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <div className="w-7 h-7 rounded-full bg-primary text-surface-muted flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-md shadow-primary/20">
                    {phase.step}
                  </div>
                  <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-bold text-foreground text-xs">{phase.title}</h4>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 self-start sm:self-auto">
                        {phase.actor}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "raci" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-card bg-surface border border-surface-border space-y-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Matrice de Responsabilité Opérationnelle (RACI)</h2>
              <p className="text-xs text-muted-foreground">
                <b>R</b> = Responsable (exécute) • <b>A</b> = Approbateur (valide) • <b>C</b> = Consulté • <b>I</b> = Informé
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Processus / Action</th>
                    <th className="py-3 px-3 text-center">Hassan (Direction)</th>
                    <th className="py-3 px-3 text-center">Équipe IA</th>
                    <th className="py-3 px-3 text-center">Gouvernantes &amp; Artisans</th>
                    <th className="py-3 px-3 text-center">Propriétaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {[
                    { task: "Fixation des tarifs par nuitée (Dynamic Pricing)", hassan: "A", ai: "R", staff: "I", owner: "C" },
                    { task: "Synchronisation des calendriers et disponibilités", hassan: "I", ai: "R", staff: "I", owner: "I" },
                    { task: "Ménage et rotation hôtelière 3 heures", hassan: "A", ai: "C", staff: "R", owner: "I" },
                    { task: "Check-in et perception de la taxe de séjour", hassan: "A", ai: "I", staff: "R", owner: "I" },
                    { task: "Réparations mineures (< 500 MAD)", hassan: "A", ai: "I", staff: "R", owner: "I" },
                    { task: "Travaux majeurs ou investissements (> 1 500 MAD)", hassan: "R", ai: "I", staff: "C", owner: "A" },
                    { task: "Édition des relevés et reversement des loyers", hassan: "A", ai: "R", staff: "I", owner: "I" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{row.task}</td>
                      <td className="py-3 px-3 text-center font-bold text-primary">{row.hassan}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-400">{row.ai}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">{row.staff}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
