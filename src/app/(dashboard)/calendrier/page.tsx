"use client";

import { useState } from "react";
import { MOCK_PROPERTIES, MOCK_BOOKINGS } from "@/lib/mockData";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Plus, 
  X,
  Clock,
  UserCheck
} from "lucide-react";
import { formatDate, formatMAD } from "@/lib/utils";
import { TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD } from "@/lib/constants";
import { BookingPlatform } from "@/types";

export default function CalendrierPage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");
  const [targetPropertyId, setTargetPropertyId] = useState<string>("prop-1");

  const [guestName, setGuestName] = useState("");
  const [platform, setPlatform] = useState<BookingPlatform>("direct");
  const [nightsCount, setNightsCount] = useState("4");
  const [guestsCount, setGuestsCount] = useState("4");

  const targetProperty = MOCK_PROPERTIES.find((p) => p.id === targetPropertyId) || MOCK_PROPERTIES[0];
  const calculatedTotal = (targetProperty.base_price_mad || 2000) * (parseInt(nightsCount) || 1);
  const calculatedTouristTax = (parseInt(guestsCount) || 1) * (parseInt(nightsCount) || 1) * TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD;
  const calculatedCommission = Math.round(calculatedTotal * 0.25);

  const daysCount = viewMode === "month" ? 30 : 7;
  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(2026, 7, 25 + i);
    return {
      date: d,
      dateString: d.toISOString().split("T")[0],
      dayNum: d.getDate(),
      dayName: new Intl.DateTimeFormat("fr-MA", { weekday: "short" }).format(d),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  const handleCellClick = (propId: string, dateStr: string) => {
    setTargetPropertyId(propId);
    setSelectedDate(dateStr);
    setIsBookingModalOpen(true);
  };

  const displayedProperties = selectedPropertyId === "all"
    ? MOCK_PROPERTIES
    : MOCK_PROPERTIES.filter((p) => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Planning & Calendrier Multi-Biens</h1>
          <p className="text-xs text-muted-foreground">
            Synchronisation iCal Airbnb/Booking, états d&apos;occupation, ménages et réservations en direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-surface border border-surface-border text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                viewMode === "month" ? "bg-primary text-surface-muted shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                viewMode === "week" ? "bg-primary text-surface-muted shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semaine
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface border border-surface-border rounded-lg p-1">
            <button className="p-1.5 rounded text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-primary">
              Août — Septembre 2026
            </span>
            <button className="p-1.5 rounded text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-card bg-surface border border-surface-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary/40 border border-primary" />
            <span className="text-muted-foreground">Réservé / Occupé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
            <span className="text-muted-foreground">Disponible / Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
            <span className="text-muted-foreground">En ménage (Turnaround 3h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-zinc-600/40 border border-zinc-600" />
            <span className="text-muted-foreground">Maintenance / Bloqué</span>
          </div>
        </div>

        <div>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-primary/50 text-xs"
          >
            <option value="all">Toutes les propriétés ({MOCK_PROPERTIES.length})</option>
            {MOCK_PROPERTIES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-card bg-surface border border-surface-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/70">
                <th className="p-3.5 text-left text-xs font-semibold text-foreground w-64 border-r border-surface-border sticky left-0 bg-surface-elevated z-10">
                  Propriété Marrakech
                </th>
                {days.map((d, i) => (
                  <th
                    key={i}
                    className={`p-2 text-center text-xs font-medium border-r border-surface-border min-w-[48px] ${
                      d.isWeekend ? "bg-surface-elevated/40 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div className="capitalize text-[10px]">{d.dayName}</div>
                    <div className="font-bold text-foreground text-xs">{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {displayedProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="p-3.5 border-r border-surface-border sticky left-0 bg-surface z-10">
                    <div className="font-semibold text-foreground truncate max-w-[200px]">{prop.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{prop.quartier} • {prop.type}</div>
                  </td>
                  {days.map((d, i) => {
                    const isOccupied = (prop.id === "prop-1" && d.dayNum >= 27 && d.dayNum <= 31) ||
                                       (prop.id === "prop-2" && d.dayNum >= 1 && d.dayNum <= 7) ||
                                       (prop.id === "prop-4" && d.dayNum >= 5 && d.dayNum <= 12) ||
                                       (prop.id === "prop-6" && d.dayNum >= 3 && d.dayNum <= 10);
                    const isCleaning = (prop.id === "prop-3" && d.dayNum === 28);
                    const isMaintenance = (prop.id === "prop-5");

                    return (
                      <td
                        key={i}
                        onClick={() => handleCellClick(prop.id, d.dateString)}
                        className={`p-1 text-center border-r border-surface-border h-14 cursor-pointer hover:opacity-80 transition-opacity ${
                          d.isWeekend ? "bg-surface-elevated/15" : ""
                        }`}
                      >
                        {isOccupied ? (
                          <div className="w-full h-full rounded-md bg-gradient-to-r from-primary/30 to-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm" title="Réservation en cours">
                            Occupé
                          </div>
                        ) : isCleaning ? (
                          <div className="w-full h-full rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold text-amber-400" title="Ménage en cours (3h turnaround)">
                            Ménage
                          </div>
                        ) : isMaintenance ? (
                          <div className="w-full h-full rounded-md bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-400" title="Bloqué pour maintenance">
                            Bloqué
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-md border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10 flex items-center justify-center text-[10px] text-muted-foreground/30 hover:text-emerald-400">
                            Libre
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-card bg-surface border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-foreground">Ajouter une Réservation</h2>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-surface-elevated border border-primary/20">
                <p className="font-bold text-foreground">{targetProperty.name}</p>
                <p className="text-[11px] text-primary">{formatMAD(targetProperty.base_price_mad)} / nuit • Date sélectionnée: {selectedDate}</p>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Nom du Voyageur</label>
                <input
                  type="text"
                  placeholder="Ex: Jean-Luc Martin"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Plateforme</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as BookingPlatform)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="direct">Direct Concierge</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="abritel">Abritel</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Nuits</label>
                  <input
                    type="number"
                    min="1"
                    value={nightsCount}
                    onChange={(e) => setNightsCount(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Voyageurs</label>
                  <input
                    type="number"
                    min="1"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-surface-border space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Montant Séjour ({nightsCount} nuits) :</span>
                  <span className="font-bold text-foreground">{formatMAD(calculatedTotal, false)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxe de Séjour (11 MAD × {guestsCount}p × {nightsCount}n) :</span>
                  <span className="font-bold text-amber-400">{formatMAD(calculatedTouristTax, false)}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold pt-1 border-t border-surface-border">
                  <span>Commission Conciergerie (25%) :</span>
                  <span>{formatMAD(calculatedCommission, false)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-btn bg-surface-elevated border border-surface-border text-foreground hover:bg-surface-border"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setGuestName("");
                  }}
                  className="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold shadow-lg shadow-primary/20"
                >
                  Confirmer la Réservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
