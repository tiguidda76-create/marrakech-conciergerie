"use client";

import { useState } from "react";
import { MOCK_OWNERS, MOCK_PROPERTIES } from "@/lib/mockData";
import { formatMAD, formatDate } from "@/lib/utils";
import { Owner } from "@/types";
import { 
  Users, 
  Plus, 
  Search, 
  Sparkles, 
  Building2, 
  CreditCard, 
  Phone, 
  Mail, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  X,
  Landmark,
  FileSpreadsheet
} from "lucide-react";

export default function ProprietairesPage() {
  const [owners, setOwners] = useState<Owner[]>(MOCK_OWNERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOwnerForPayouts, setSelectedOwnerForPayouts] = useState<Owner | null>(null);

  // New Owner Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNationality, setNewNationality] = useState("Marocaine");
  const [newRib, setNewRib] = useState("");
  const [newBank, setNewBank] = useState("Attijariwafa Bank");
  const [newCommission, setNewCommission] = useState("25");

  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.properties_names.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayoutsAllOwners = owners.reduce((sum, o) => sum + o.total_payouts_mad, 0);

  const handleAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const created: Owner = {
      id: `own-${Date.now()}`,
      name: newName,
      email: newEmail || "proprietaire@mandat.ma",
      phone: newPhone || "+212 6 00 00 00 00",
      nationality: newNationality,
      rib: newRib || "007450000000000000000000",
      swift: "BCMAMAMC",
      bank: newBank,
      commission_pct: parseInt(newCommission) || 25,
      contract_start_date: new Date().toISOString().split("T")[0],
      properties_count: 0,
      properties_names: [],
      total_payouts_mad: 0,
      status: "actif",
    };

    setOwners([created, ...owners]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewRib("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Gestion des Propriétaires & Mandats</h1>
          <p className="text-xs text-muted-foreground">
            Suivi des contrats de gestion (25%), fiches bancaires (RIB), coordonnées et historique des reversements J+5.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Contrat Propriétaire
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase mb-2">
            <span>Propriétaires Sous Mandat</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">{owners.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Contrats actifs à 25% de commission</p>
        </div>

        <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase mb-2">
            <span>Total Reversements Cumulés</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">{formatMAD(totalPayoutsAllOwners)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">75% nets reversés par virement bancaire</p>
        </div>

        <div className="p-5 rounded-card bg-surface border border-surface-border shadow-lg">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase mb-2">
            <span>Délai de Virement Moyen</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">J+5</p>
          <p className="text-[11px] text-muted-foreground mt-1">Conformité contractuelle respectée à 100%</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-card bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher propriétaire, bien, email..."
            className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-semibold uppercase text-[10px]">Statut Contrat :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">Tous ({owners.length})</option>
            <option value="actif">Actif</option>
            <option value="en_attente">En attente</option>
            <option value="résilié">Résilié</option>
          </select>
        </div>
      </div>

      {/* Owners Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => (
          <div
            key={owner.id}
            className="p-5 rounded-card bg-surface border border-surface-border hover:border-primary/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {owner.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                    <span>{owner.nationality}</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">Mandat {owner.commission_pct}%</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {owner.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-surface-border">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{owner.phone}</span>
                </div>
              </div>

              {/* Bank Coordinates */}
              <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">{owner.bank}</span>
                  <span className="text-[10px] text-primary font-bold">{owner.swift}</span>
                </div>
                <div className="font-mono text-[10px] text-foreground tracking-tight truncate">
                  RIB : {owner.rib}
                </div>
              </div>

              {/* Associated Properties */}
              <div className="text-xs">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Biens sous gestion ({owner.properties_names.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {owner.properties_names.map((pName, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md bg-surface-elevated border border-surface-border text-[11px] text-foreground font-medium flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3 text-primary" />
                      {pName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Payouts Total and Actions */}
            <div className="mt-4 pt-3.5 border-t border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Reversé</span>
                <p className="text-xs font-bold text-emerald-400">{formatMAD(owner.total_payouts_mad, false)}</p>
              </div>

              <button
                onClick={() => setSelectedOwnerForPayouts(owner)}
                className="px-3 py-1.5 rounded-btn bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                Détail Reversements
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Owner Detail & Payouts Statement Modal */}
      {selectedOwnerForPayouts && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Fiche Mandat — {selectedOwnerForPayouts.name}
                </h2>
                <p className="text-xs text-muted-foreground">Historique des reversements bancaires J+5</p>
              </div>
              <button
                onClick={() => setSelectedOwnerForPayouts(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-elevated border border-surface-border">
                <div>
                  <span className="text-muted-foreground">Taux de Commission :</span>
                  <p className="font-bold text-primary">{selectedOwnerForPayouts.commission_pct}% sur chiffre brut</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Banque & RIB :</span>
                  <p className="font-mono text-foreground">{selectedOwnerForPayouts.bank} • {selectedOwnerForPayouts.rib.slice(-8)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-surface-border overflow-hidden">
                <div className="p-3 bg-surface-elevated font-semibold text-foreground flex items-center justify-between">
                  <span>Derniers Virements Effectués</span>
                  <span className="text-[11px] text-emerald-400">Total : {formatMAD(selectedOwnerForPayouts.total_payouts_mad)}</span>
                </div>
                <div className="p-3 divide-y divide-surface-border/60 text-[11px] space-y-2">
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <div className="font-semibold text-foreground">Reversement Séjour #bk-101 (Août 2026)</div>
                      <div className="text-muted-foreground">Virement bancaire exécuté à J+5</div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatMAD(20250, false)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <div className="font-semibold text-foreground">Reversement Séjour #bk-102 (Juillet 2026)</div>
                      <div className="text-muted-foreground">Virement bancaire exécuté à J+5</div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatMAD(49875, false)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  onClick={() => setSelectedOwnerForPayouts(null)}
                  className="px-4 py-2 rounded-btn bg-surface-elevated border border-surface-border text-foreground hover:bg-surface-border"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    alert(`Bordereau PDF généré pour ${selectedOwnerForPayouts.name}`);
                    setSelectedOwnerForPayouts(null);
                  }}
                  className="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Exporter Bordereau PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-foreground">Nouveau Mandat Propriétaire</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOwner} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Nom & Prénom / Société</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Youssef El Alami"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="youssef@alami.ma"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="+212 6 61 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Banque</label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                    <option value="Bank of Africa">Bank of Africa (BMCE)</option>
                    <option value="Banque Populaire">Banque Populaire (BPM)</option>
                    <option value="CIH Bank">CIH Bank</option>
                    <option value="Société Générale Maroc">Société Générale Maroc</option>
                    <option value="Crédit Agricole du Maroc">Crédit Agricole du Maroc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Commission de Gestion (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">RIB Bancaire (24 positions)</label>
                <input
                  type="text"
                  required
                  placeholder="007450000123456789012345"
                  value={newRib}
                  onChange={(e) => setNewRib(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground font-mono focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-btn bg-surface-elevated border border-surface-border text-foreground hover:bg-surface-border"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold shadow-lg shadow-primary/20"
                >
                  Valider le Mandat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
