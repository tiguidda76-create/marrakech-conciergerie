"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  CalendarDays, 
  BookOpenCheck, 
  CircleDollarSign, 
  ClipboardCheck, 
  Users,
  Settings,
  Sparkles,
  Bot,
  TrendingUp,
  BookOpen,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Biens", href: "/biens", icon: Building2 },
  { name: "Dynamic Pricing", href: "/biens/prop-1/pricing", icon: TrendingUp },
  { name: "Réservations", href: "/reservations", icon: BookOpenCheck },
  { name: "Calendrier", href: "/calendrier", icon: CalendarDays },
  { name: "Équipe AI & Chat", href: "/ai-team", icon: Bot },
  { name: "Propriétaires", href: "/proprietaires", icon: Users },
  { name: "Finances", href: "/finances", icon: CircleDollarSign },
  { name: "Tâches", href: "/taches", icon: ClipboardCheck },
  { name: "Guide & Playbook", href: "/guide", icon: BookOpen },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "w-64 bg-surface border-r border-surface-border flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-transform duration-300 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-surface-muted" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold text-foreground leading-tight tracking-wider">
                MARRAKECH
              </h1>
              <p className="text-[10px] font-sans tracking-widest text-primary uppercase font-bold">
                Conciergerie Privée
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation Principale
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.name}</span>
                {item.href === "/ai-team" && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/20 text-primary border border-primary/30">
                    8 AI
                  </span>
                )}
                {item.href === "/guide" && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                    Playbook
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="p-3 rounded-xl bg-gradient-to-br from-surface-elevated to-surface border border-primary/20 text-xs">
            <div className="flex items-center justify-between font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1 text-primary text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Commission Conciergerie
              </span>
              <span className="text-primary font-bold">25%</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Taxe séjour: 11 MAD/nuit/pers.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
