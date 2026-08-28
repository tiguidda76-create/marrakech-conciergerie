"use client";

import { useState } from "react";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-card bg-surface border border-surface-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark mx-auto flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-6 h-6 text-surface-muted" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            MARRAKECH CONCIERGERIE
          </h1>
          <p className="text-xs text-muted-foreground">
            Accès sécurisé au portail de gestion hôtelière & propriétaires
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="manager@marrakech-concierge.ma"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <Link
            href="/"
            className="w-full mt-2 py-3 rounded-btn bg-primary hover:bg-primary-hover text-surface-muted font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <span>{isLogin ? "Se connecter" : "Créer un compte"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </form>

        <div className="pt-4 border-t border-surface-border text-center">
          <button className="w-full py-2.5 px-4 rounded-btn bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-colors">
            <span>Continuer avec Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
