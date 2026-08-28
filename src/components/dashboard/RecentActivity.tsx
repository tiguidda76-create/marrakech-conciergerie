import { Booking, Task } from "@/types";
import { formatDate, formatMAD } from "@/lib/utils";
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentActivityProps {
  bookings: Booking[];
  tasks: Task[];
}

export function RecentActivity({ bookings, tasks }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base font-bold text-foreground">Dernières Réservations</h2>
          <Link href="/reservations" className="text-xs text-primary hover:underline flex items-center gap-1">
            Tout voir <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {bookings.slice(0, 4).map((booking) => {
            const comm = Math.round(booking.total_mad * 0.25);
            return (
              <div
                key={booking.id}
                className="p-3.5 rounded-lg bg-surface-elevated/60 border border-surface-border flex items-center justify-between gap-3 hover:border-primary/30 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{booking.guest_name}</p>
                  <p className="text-[11px] text-muted-foreground">{booking.property_name}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">
                      {booking.platform}
                    </span>
                    <span>{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{formatMAD(booking.total_mad, false)}</p>
                  <p className="text-[10px] text-primary">Com: {formatMAD(comm, false)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    booking.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {booking.status === "confirmed" ? "Confirmée" : booking.status === "pending" ? "En attente" : "Annulée"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-card bg-surface border border-surface-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base font-bold text-foreground">Opérations Immédiates</h2>
          <Link href="/taches" className="text-xs text-primary hover:underline flex items-center gap-1">
            Toutes les tâches <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 4).map((task) => {
            const isUrgent = task.priority === "Urgente" || task.priority === "Haute";
            return (
              <div
                key={task.id}
                className="p-3.5 rounded-lg bg-surface-elevated/60 border border-surface-border flex items-start justify-between gap-3 hover:border-primary/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isUrgent ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span className="text-xs font-semibold text-foreground line-clamp-1">{task.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{task.property_name}</p>
                  <p className="text-[10px] text-primary">Assigné: {task.assigned_to || "Équipe"}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    task.status === "done"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {task.status === "done" ? "Terminée" : "À faire"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
