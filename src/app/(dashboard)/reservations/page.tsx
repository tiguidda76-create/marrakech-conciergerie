"use client";

import { useState, useEffect } from "react";
import { formatDate, formatMAD } from "@/lib/utils";
import { exportBookingsToCSV } from "@/lib/export";
import { Calendar, Plus, Search, Download, CheckCircle2, X } from "lucide-react";
import { Booking, BookingPlatform } from "@/types";
import { TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD } from "@/lib/constants";

const STORAGE_KEY_BOOKINGS = 'mc_real_reservations_v1';

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
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

  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Booking Form State
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [platform, setPlatform] = useState<BookingPlatform>("direct");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState("3");
  const [guestsCount, setGuestsCount] = useState("2");
  const [totalMad, setTotalMad] = useState("4500");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [bookings]);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.property_name && b.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = platformFilter === "all" || b.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !propertyName) return;

    const nightsNum = parseInt(nights) || 1;
    const guestsNum = parseInt(guestsCount) || 1;
    const totalNum = parseInt(totalMad) || 0;
    const touristTax = nightsNum * guestsNum * TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      property_id: `prop-${Date.now()}`,
      property_name: propertyName,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      platform,
      check_in: checkIn || new Date().toISOString().split("T")[0],
      check_out: checkOut || new Date(Date.now() + 86400000 * nightsNum).toISOString().split("T")[0],
      nights: nightsNum,
      guests_count: guestsNum,
      total_mad: totalNum,
      tourist_tax_mad: touristTax,
      commission_pct: 25,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    setBookings([newBooking, ...bookings]);
    setIsAddModalOpen(false);
    setGuestName("");
    setPropertyName("");
    setGuestEmail("");
    setGuestPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Gestion des Réservations</h1>
          <p className="text-xs text-muted-foreground">
            Suivi des séjours Airbnb, Booking.com, Abritel et Direct avec calcul de la taxe de séjour (11 MAD/pers/nuit).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {bookings.length > 0 && (
            <button
              onClick={() => exportBookingsToCSV(bookings)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-btn bg-surface-elevated hover:bg-surface-border border border-surface-border text-foreground text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-primary" />
              Exporter CSV
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Réservation Réelle
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Bookings Table / Empty State */}
      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-surface-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Aucune réservation enregistrée pour le moment</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Votre tableau de bord est propre et prêt. Enregistrez votre première réservation client ou connectez votre flux iCal.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-surface-muted rounded-btn text-xs font-bold transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Réservation Réelle</span>
          </button>
        </div>
      ) : (
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
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Confirmée
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to create new booking */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-card bg-surface border border-surface-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Enregistrer une Réservation Réelle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Nom du Voyageur</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  required
                  className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Nom du Riad / Propriété</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Ex: Riad Dar Maya"
                  required
                  className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+33 6..."
                    className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Canal de Réservation</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="direct">Direct Concierge</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="abritel">Abritel / VRBO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Nuits</label>
                  <input
                    type="number"
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    min={1}
                    className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Voyageurs</label>
                  <input
                    type="number"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    min={1}
                    className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Total MAD</label>
                  <input
                    type="number"
                    value={totalMad}
                    onChange={(e) => setTotalMad(e.target.value)}
                    min={0}
                    className="w-full mt-1 p-2.5 bg-surface-elevated border border-surface-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-btn bg-surface-elevated text-muted-foreground text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-btn bg-primary text-surface-muted text-xs font-bold shadow-lg shadow-primary/20"
                >
                  Confirmer la Réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
