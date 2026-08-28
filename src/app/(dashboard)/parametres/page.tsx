"use client";

import { useState } from "react";
import { LEGAL_ENTITY, TIMEZONE, TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD } from "@/lib/constants";
import { MOCK_TEAM_MEMBERS } from "@/lib/mockData";
import { TeamMember } from "@/types";
import { 
  Settings, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Bell, 
  Key, 
  Database, 
  Sparkles, 
  Save, 
  Plus, 
  CheckCircle2, 
  Moon, 
  Sun, 
  Globe, 
  MessageSquare,
  Radio,
  FileCode2
} from "lucide-react";

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "team" | "integrations" | "general">("profile");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [entityName, setEntityName] = useState(LEGAL_ENTITY.name);
  const [entityIce, setEntityIce] = useState(LEGAL_ENTITY.ice);
  const [entityAddress, setEntityAddress] = useState(LEGAL_ENTITY.address);
  const [entityPhone, setEntityPhone] = useState(LEGAL_ENTITY.phone);
  const [entityEmail, setEntityEmail] = useState(LEGAL_ENTITY.email);
  const [entityRib, setEntityRib] = useState(LEGAL_ENTITY.rib);
  const [entitySwift, setEntitySwift] = useState(LEGAL_ENTITY.swift);

  const [defaultCurrency, setDefaultCurrency] = useState("MAD");
  const [touristTaxRate, setTouristTaxRate] = useState(TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD.toString());
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [supabaseUrl, setSupabaseUrl] = useState("https://marrakech-db.supabase.co");
  const [resendApiKey, setResendApiKey] = useState("re_live_••••••••••••••••••••••••");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("108472910482910");
  const [icalSyncInterval, setIcalSyncInterval] = useState("15");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Paramètres & Configuration Système</h1>
          <p className="text-xs text-muted-foreground">
            Profil juridique officiel, gestion de l&apos;équipe terrain, intégrations API et préférences de conciergerie.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Paramètres et coordonnées mis à jour avec succès !</span>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-surface-border pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "profile"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Entité Légale & Facturation
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "team"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Équipe & Gouvernantes ({teamMembers.length})
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "integrations"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Radio className="w-4 h-4" />
          iCal & API Connecteurs
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
            activeTab === "general"
              ? "bg-primary text-surface-muted shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Général & Thème
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-card bg-surface border border-surface-border shadow-xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                <ShieldCheck className="w-5 h-5" />
                Identité Juridique Professionnelle (Factures & Mandats)
              </div>
              <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-[10px]">
                {LEGAL_ENTITY.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-semibold mb-1">Nom / Raison Sociale</label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Numéro ICE (Registre Auto-entrepreneur)</label>
                <input
                  type="text"
                  value={entityIce}
                  onChange={(e) => setEntityIce(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-semibold mb-1">Email Professionnel</label>
                <input
                  type="email"
                  value={entityEmail}
                  onChange={(e) => setEntityEmail(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Téléphone / WhatsApp Concierge</label>
                <input
                  type="tel"
                  value={entityPhone}
                  onChange={(e) => setEntityPhone(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">Adresse Siège / Domiciliation Marrakech</label>
              <input
                type="text"
                value={entityAddress}
                onChange={(e) => setEntityAddress(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="pt-4 border-t border-surface-border space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                Coordonnées Bancaires Professionnelles (Reversements)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-foreground font-semibold mb-1">RIB Bancaire (24 chiffres)</label>
                  <input
                    type="text"
                    value={entityRib}
                    onChange={(e) => setEntityRib(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground font-mono focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Code SWIFT / BIC</label>
                  <input
                    type="text"
                    value={entitySwift}
                    onChange={(e) => setEntitySwift(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground font-mono uppercase focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-primary/20 text-muted-foreground text-[11px]">
                <span className="font-bold text-primary">Mention Légale TVA : </span>
                {LEGAL_ENTITY.tvaExemptionMention}
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-foreground">Équipe Terrain & Affectations Marrakech</h2>
            <button
              onClick={() => alert("Formulaire d'ajout de collaborateur")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-semibold text-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              Ajouter un Membre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-card bg-surface border border-surface-border shadow-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-foreground">{member.name}</h3>
                      <p className="text-xs text-primary font-semibold">{member.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      member.status === "disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      member.status === "en_mission" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    }`}>
                      {member.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1 mt-3 pt-3 border-t border-surface-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Zone : {member.zone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Missions actives en cours</span>
                  <span className="font-bold text-primary">{member.active_tasks_count} tâches</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="p-6 rounded-card bg-surface border border-surface-border shadow-xl space-y-6 text-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-base font-bold text-foreground">Passerelles & Connecteurs Extérieurs</h2>
            <p className="text-xs text-muted-foreground">Synchronisation avec Airbnb, Booking.com, WhatsApp et Supabase.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Radio className="w-4 h-4 text-primary" />
                  Moteur de Synchronisation iCal (Airbnb / Booking.com)
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Actif (RFC 5545)
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                URL de flux export pour vos propriétés : <code className="text-primary font-mono">https://marrakech-conciergerie.vercel.app/api/ical/export/[ID_BIEN]</code>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Fréquence de rafraîchissement automatique :</span>
                <select
                  value={icalSyncInterval}
                  onChange={(e) => setIcalSyncInterval(e.target.value)}
                  className="bg-surface border border-surface-border rounded-lg px-2.5 py-1 text-foreground"
                >
                  <option value="15">Toutes les 15 minutes</option>
                  <option value="30">Toutes les 30 minutes</option>
                  <option value="60">Toutes les heures</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Database className="w-4 h-4 text-blue-400" />
                  Supabase PostgreSQL & Auth
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Connecté
                </span>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Endpoint URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-surface border border-surface-border rounded-lg p-2 font-mono text-foreground"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  WhatsApp Cloud API (Check-in Automatisé & Accueil VIP)
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                  Configuré
                </span>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                  className="w-full bg-surface border border-surface-border rounded-lg p-2 font-mono text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "general" && (
        <div className="p-6 rounded-card bg-surface border border-surface-border shadow-xl space-y-6 text-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-base font-bold text-foreground">Préférences Générales & Affichage</h2>
            <p className="text-xs text-muted-foreground">Paramètres régionaux, taux officiels et mode visuel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-2">
              <label className="block font-semibold text-foreground">Devise Principale</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-lg p-2 text-foreground"
              >
                <option value="MAD">MAD (Dirham Marocain)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">Les conversions EUR sont calculées au taux indicatif de 1 MAD = 0.093 EUR.</p>
            </div>

            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-2">
              <label className="block font-semibold text-foreground">Taxe de Séjour Régionale (MAD / personne / nuit)</label>
              <input
                type="number"
                value={touristTaxRate}
                onChange={(e) => setTouristTaxRate(e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-lg p-2 text-foreground font-bold"
              />
              <p className="text-[11px] text-muted-foreground">Taux officiel fixé par la Délégation Régionale du Tourisme de Marrakech.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-elevated/70 border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-400" />}
              <div>
                <p className="font-bold text-foreground">Mode Visuel</p>
                <p className="text-[11px] text-muted-foreground">
                  {isDarkMode ? "Thème Sombre Luxe (Marrakech Dark)" : "Thème Clair Élégant"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-btn bg-surface hover:bg-surface-border border border-surface-border text-foreground font-semibold flex items-center gap-2 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
              <span>Basculer en mode {isDarkMode ? "Clair" : "Sombre"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
