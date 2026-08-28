"use client";

import { useState } from "react";
import { MOCK_TASKS } from "@/lib/mockData";
import { formatDateTime } from "@/lib/utils";
import { Task, TaskType, TaskStatus } from "@/types";
import { 
  ClipboardCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Camera, 
  Wifi
} from "lucide-react";

export default function TachesPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === "done" ? "todo" : "done"
        };
      }
      return t;
    }));
  };

  const filteredTasks = activeFilter === "all"
    ? tasks
    : tasks.filter(t => t.type === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Opérations, Ménages & Check-ins</h1>
          <p className="text-xs text-muted-foreground">
            Standards hôteliers de Marrakech : contrôle du linge, rotation 3h, vérification des équipements et accueil VIP.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Assigner une Opération
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-card bg-surface border border-primary/25 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Standards Opérationnels Conciergerie Marrakech
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">Turnaround 3 Heures</div>
              <div className="text-[11px] text-muted-foreground">Délai minimum entre check-out 11h et check-in 14h.</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">Photos Avant / Après</div>
              <div className="text-[11px] text-muted-foreground">Preuve systématique en cas de litige plateforme.</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">Contrôle Fiche Police</div>
              <div className="text-[11px] text-muted-foreground">Vérification passeport & taxe de séjour 11 MAD/nuit.</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border flex items-start gap-2.5">
            <Wifi className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">Test Climatisation / Fibre</div>
              <div className="text-[11px] text-muted-foreground">Test systématique des routeurs et climatisations.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: "Toutes les opérations" },
          { key: "cleaning", label: "Ménages & Linge" },
          { key: "checkin", label: "Check-in VIP" },
          { key: "checkout", label: "Check-out & État des lieux" },
          { key: "maintenance", label: "Maintenance & Technique" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold border transition-colors whitespace-nowrap ${
              activeFilter === tab.key
                ? "bg-primary text-surface-muted border-primary shadow-sm"
                : "bg-surface text-muted-foreground border-surface-border hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          const isDone = task.status === "done";
          const isUrgent = task.priority === "Urgente" || task.priority === "Haute";
          return (
            <div
              key={task.id}
              className={`p-5 rounded-card bg-surface border transition-all duration-200 shadow-xl flex flex-col justify-between ${
                isDone ? "border-surface-border opacity-70" : "border-surface-border hover:border-primary/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-elevated text-primary border border-surface-border">
                    {task.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    task.priority === "Urgente" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    task.priority === "Haute" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {task.priority || "Normal"}
                  </span>
                </div>

                <h3 className={`font-serif text-base font-bold mb-1 ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-primary font-medium">{task.property_name}</p>

                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic bg-surface-elevated/50 p-2.5 rounded-lg border border-surface-border">
                    &ldquo;{task.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-surface-border space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{task.assigned_to || "Équipe de conciergerie"}</span>
                  </div>
                  {task.turnaround_hours && (
                    <span className="text-[11px] font-semibold text-amber-400">{task.turnaround_hours}h chrono</span>
                  )}
                </div>

                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`w-full py-2 px-3 rounded-btn text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    isDone
                      ? "bg-surface-elevated text-muted-foreground border-surface-border hover:text-foreground"
                      : "bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-surface-muted"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isDone ? "Marquer non terminée" : "Valider l'opération"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
