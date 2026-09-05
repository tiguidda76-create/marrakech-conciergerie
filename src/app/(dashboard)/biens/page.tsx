"use client";

import { useState } from "react";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { formatMAD } from "@/lib/utils";
import { Property, PropertyType, PropertyQuartier, PropertyStatus } from "@/types";
import { 
  Building2, 
  Plus, 
  BedDouble, 
  Bath, 
  Users, 
  Star, 
  MapPin, 
  Filter, 
  ArrowUpDown, 
  X, 
  Sparkles,
  Percent
} from "lucide-react";

const STORAGE_KEY_PROPERTIES = 'mc_real_properties_v1';

export default function BiensPage() {
  const [properties, setProperties] = useState<Property[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PROPERTIES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [filterType, setFilterType] = useState<string>("all");
  const [filterQuartier, setFilterQuartier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"revenue_desc" | "occupancy_desc" | "occupancy_asc" | "name_asc">("revenue_desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Property Form State
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PropertyType>("riad");
  const [newQuartier, setNewQuartier] = useState<PropertyQuartier>("medina");
  const [newPrice, setNewPrice] = useState("3500");
  const [newBedrooms, setNewBedrooms] = useState("4");
  const [newBathrooms, setNewBathrooms] = useState("4");
  const [newMaxGuests, setNewMaxGuests] = useState("8");
  const [newOwner, setNewOwner] = useState("");

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const created: Property = {
      id: `prop-${Date.now()}`,
      name: newName,
      type: newType,
      quartier: newQuartier,
      address: `Marrakech, ${newQuartier}`,
      bedrooms: parseInt(newBedrooms) || 1,
      bathrooms: parseInt(newBathrooms) || 1,
      max_guests: parseInt(newMaxGuests) || 2,
      base_price_mad: parseInt(newPrice) || 2000,
      cleaning_fee_mad: 400,
      status: "actif",
      owner_name: newOwner || "Propriétaire Privé",
      photos: [
        "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80"
      ],
      occupancy_rate: 75,
      monthly_revenue_mad: (parseInt(newPrice) || 2000) * 20,
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    setProperties([created, ...properties]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewOwner("");
  };

  const filteredProperties = properties
    .filter((p) => (filterType === "all" ? true : p.type === filterType))
    .filter((p) => (filterQuartier === "all" ? true : p.quartier === filterQuartier))
    .filter((p) => (filterStatus === "all" ? true : p.status === filterStatus))
    .sort((a, b) => {
      if (sortBy === "revenue_desc") return (b.monthly_revenue_mad || 0) - (a.monthly_revenue_mad || 0);
      if (sortBy === "occupancy_desc") return b.occupancy_rate - a.occupancy_rate;
      if (sortBy === "occupancy_asc") return a.occupancy_rate - b.occupancy_rate;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Gestion des Biens & Riads</h1>
          <p className="text-xs text-muted-foreground">
            Catalogue exclusif sous mandat de conciergerie à Marrakech ({properties.length} propriétés).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Propriété
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-4 rounded-card bg-surface border border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-semibold uppercase text-[10px]">Filtres :</span>
          
          {/* Quartier Filter */}
          <select
            value={filterQuartier}
            onChange={(e) => setFilterQuartier(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">Tous Quartiers</option>
            <option value="medina">Médina</option>
            <option value="gueliz">Guéliz</option>
            <option value="hivernage">Hivernage</option>
            <option value="palmeraie">Palmeraie</option>
            <option value="targa">Targa</option>
            <option value="autre">Autre / Amelkis</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">Tous Types</option>
            <option value="riad">Riad</option>
            <option value="villa">Villa</option>
            <option value="appartement">Appartement</option>
            <option value="studio">Studio</option>
            <option value="duplex">Duplex</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">Tous Statuts</option>
            <option value="actif">Actif</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="revenue_desc">Revenus (Décroissant)</option>
            <option value="occupancy_desc">Taux d&apos;occupation (Décroissant)</option>
            <option value="occupancy_asc">Taux d&apos;occupation (Croissant)</option>
            <option value="name_asc">Nom (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid / Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-surface-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Aucun bien sous gestion pour le moment</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Votre parc est propre et prêt. Enregistrez votre premier Riad ou Villa pour activer le suivi d&apos;occupation, le calcul des commissions et le Pricing IA.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-surface-muted rounded-btn text-xs font-bold transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Votre Premier Bien Réel</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
          <div
            key={prop.id}
            className="rounded-card bg-surface border border-surface-border overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-xl flex flex-col group"
          >
            {/* Image + Badges */}
            <div className="relative h-48 w-full bg-surface-elevated overflow-hidden">
              <img
                src={prop.photos[0] || "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80"}
                alt={prop.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                  prop.status === "actif" ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30" :
                  prop.status === "maintenance" ? "bg-rose-950/80 text-rose-300 border-rose-500/30" :
                  "bg-zinc-950/80 text-zinc-300 border-zinc-500/30"
                }`}>
                  {prop.status}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-surface/80 text-primary backdrop-blur-md border border-surface-border">
                  {prop.type}
                </span>
              </div>

              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-surface/85 backdrop-blur-md border border-surface-border text-xs flex items-center gap-1 font-semibold text-primary">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span>{prop.rating || "5.0"}</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="capitalize">{prop.quartier} — Marrakech</span>
                </div>
                <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">{prop.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Propriétaire: {prop.owner_name || "Mandat Privé"}</p>

                {/* Specs */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-primary" />
                    <span>{prop.bedrooms} ch.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-primary" />
                    <span>{prop.bathrooms} sdb</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Max {prop.max_guests}</span>
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="mt-3.5 pt-3 border-t border-surface-border/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-medium">Taux d&apos;Occupation</span>
                    <span className="font-bold text-foreground">{prop.occupancy_rate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                      style={{ width: `${prop.occupancy_rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Monthly Revenue */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Tarif de base</span>
                  <p className="text-xs font-bold text-foreground">{formatMAD(prop.base_price_mad)}/nuit</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-primary uppercase font-bold">Revenu Mensuel</span>
                  <p className="text-xs font-bold text-primary">{formatMAD(prop.monthly_revenue_mad || 0, false)}</p>
                </div>
              </div>

              {/* Dynamic Pricing CTA */}
              <a
                href={`/biens/${prop.id}/pricing`}
                className="w-full py-2 px-3 rounded-btn bg-surface-elevated hover:bg-primary hover:text-surface-muted text-foreground text-xs font-semibold border border-surface-border transition-all flex items-center justify-center gap-1.5 shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary group-hover:text-surface-muted transition-colors" />
                <span>Optimiser le Tarif (Pricing IA)</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      )}


      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-foreground">Ajouter une Nouvelle Propriété</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Nom du Riad / Villa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Riad Dar Nour & Spa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Type de Bien</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PropertyType)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="riad">Riad</option>
                    <option value="villa">Villa</option>
                    <option value="appartement">Appartement</option>
                    <option value="studio">Studio</option>
                    <option value="duplex">Duplex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Quartier</label>
                  <select
                    value={newQuartier}
                    onChange={(e) => setNewQuartier(e.target.value as PropertyQuartier)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="medina">Médina</option>
                    <option value="gueliz">Guéliz</option>
                    <option value="hivernage">Hivernage</option>
                    <option value="palmeraie">Palmeraie</option>
                    <option value="targa">Targa</option>
                    <option value="autre">Autre / Amelkis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Chambres</label>
                  <input
                    type="number"
                    min="1"
                    value={newBedrooms}
                    onChange={(e) => setNewBedrooms(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Salles de bain</label>
                  <input
                    type="number"
                    min="1"
                    value={newBathrooms}
                    onChange={(e) => setNewBathrooms(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Max Voyageurs</label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxGuests}
                    onChange={(e) => setNewMaxGuests(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Tarif de Base (MAD/nuit)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Nom du Propriétaire</label>
                  <input
                    type="text"
                    placeholder="Ex: M. Bennani"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
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
                  Enregistrer la Propriété
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
