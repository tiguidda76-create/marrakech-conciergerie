"use client";

import { Bell, Calendar, Menu, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const [currentDateStr, setCurrentDateStr] = useState<string>("Marrakech");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        new Intl.DateTimeFormat("fr-MA", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Casablanca",
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-surface-border bg-surface/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSidebar}
          aria-label="Ouvrir le menu"
          className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-foreground lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un riad, villa, voyageur..."
            className="w-full bg-surface-elevated/70 border border-surface-border rounded-lg pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="capitalize font-medium text-foreground text-[11px] lg:text-xs">
            {mounted ? currentDateStr : "Marrakech (GMT+1)"}
          </span>
          <span className="text-[9px] lg:text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
            GMT+1
          </span>
        </div>

        <button 
          aria-label="Notifications" 
          className="relative p-2 rounded-lg bg-surface-elevated border border-surface-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 lg:pl-3 border-l border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
            MC
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              Conciergerie
              <ShieldCheck className="w-3 h-3 text-primary" />
            </div>
            <div className="text-[10px] text-muted-foreground">Marrakech Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
