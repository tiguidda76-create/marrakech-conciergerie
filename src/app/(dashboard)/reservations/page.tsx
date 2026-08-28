"use client";

import { useState } from "react";
import { MOCK_BOOKINGS } from "@/lib/mockData";
import { formatDate, formatMAD } from "@/lib/utils";
import { BookOpenCheck, Calendar, Filter, Plus, Search, UserCheck, Sparkles, MapPin } from "lucide-react";
import { Booking } from "@/types";

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.property_name && b.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = platformFilter === "all" || b.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Gestion des Réservations</h1>
          <p className="text-xs text-muted-foreground">
            Suivi des séjours Airbnb, Booking.com, Abritel et Direct avec calcul de la taxe de séjour (11 MAD/pers/nuit).
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Nouvelle Réservation
        </button>
      </div>

      <div className="p-4 rounded-card bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher voyageur ou riad..."
            className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              platformFilter === "all" ? "bg-primary text-surface-muted border-primary" : "bg-surface-elevated text-muted-foreground border-surface-border"
            }`}
          >
            Tous ({bookings.length})
          </button>
          <button
            onClick={() => setPlatformFilter("airbnb")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              platformFilter === "airbnb" ? "bg-[#FF385C] text-white border-[#FF385C]" : "bg-surface-elevated text-muted-foreground border-surface-border"
            }`}
          >
            Airbnb
          </button>
          <button
            onClick={() => setPlatformFilter("booking")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              platformFilter === "booking" ? "bg-[#2E5BFF] text-white border-[#2E5BFF]" : "bg-surface-elevated text-muted-foreground border-surface-border"
            }`}
          >
            Booking.com
          </button>
          <button
            onClick={() => setPlatformFilter("direct")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              platformFilter === "direct" ? "bg-primary text-surface-muted border-primary" : "bg-surface-elevated text-muted-foreground border-surface-border"
            }`}
          >
            Direct
          </button>
        </div>
      </div>

      <div className="rounded-card bg-surface border border-surface-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/80 border-b border-surface-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Voyageur</th>
                <th className="py-3.5 px-4 font-semibold">Propriété</th>
                <th className="py-3.5 px-4 font-semibold">Canal</th>
                <th className="py-3.5 px-4 font-semibold">Dates Séjour</th>
                <th className="py-3.5 px-4 font-semibold">Montant MAD</th>
                <th className="py-3.5 px-4 font-semibold">Taxe Séjour (11 MAD/p/n)</th>
                <th className="py-3.5 px-4 font-semibold">Commission (25%)</th>
                <th className="py-3.5 px-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-foreground">
              {filteredBookings.map((b) => {
                const comm = Math.round(b.total_mad * 0.25);
                return (
                  <tr key={b.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div className="font-semibold text-foreground">{b.guest_name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.guest_phone || b.guest_email}</div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <div className="text-foreground">{b.property_name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.nights} nuits • {b.guests_count} pers.</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.platform === "airbnb" ? "bg-[#FF385C]/15 text-[#FF385C] border border-[#FF385C]/30" :
                        b.platform === "booking" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" :
                        "bg-primary/15 text-primary border border-primary/30"
                      }`}>
                        {b.platform}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div>{formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-foreground">
                      {formatMAD(b.total_mad)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-amber-400">
                      {formatMAD(b.tourist_tax_mad, false)}
                    </td>
                    <td className="py-4 px-4 font-bold text-primary">
                      {formatMAD(comm, false)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                        b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        b.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {b.status === "confirmed" ? "Confirmée" : b.status === "pending" ? "En attente" : "Annulée"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
