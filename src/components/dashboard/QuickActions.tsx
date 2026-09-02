import { Plus, CalendarPlus, KeyRound, Sparkles, RefreshCw, BookOpen } from "lucide-react";

import Link from "next/link";

export function QuickActions() {
  return (
    <div className="p-4 rounded-card bg-surface border border-surface-border flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-foreground">Actions Rapides Conciergerie</h2>
          <p className="text-[11px] text-muted-foreground">Création instantanée ou synchronisation des plateformes</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-surface-elevated hover:bg-surface-border text-xs font-medium text-foreground border border-surface-border transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          Sync iCal (Airbnb/Booking)
        </button>
        <Link
          href="/guide"
          className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-surface-elevated hover:bg-surface-border text-xs font-medium text-foreground border border-surface-border transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          Playbook &amp; Rôles
        </Link>
        <Link
          href="/taches"
          className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-surface-elevated hover:bg-surface-border text-xs font-medium text-foreground border border-surface-border transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          Planifier Ménage
        </Link>
        <Link
          href="/reservations"
          className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted text-xs font-semibold transition-colors shadow-lg shadow-primary/20"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Nouvelle Réservation
        </Link>

      </div>
    </div>
  );
}
