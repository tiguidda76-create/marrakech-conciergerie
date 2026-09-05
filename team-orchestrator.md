# 🎯 Team Orchestrator — Marrakech Conciergerie Multi-Agent AI System

## 1. Architecture Multi-Agent

Le système repose sur un modèle d'orchestration distribué où chaque agent est spécialisé dans un domaine critique de l'exploitation hôtelière et conciergerie à Marrakech :

```
                                  ┌────────────────────────┐
                                  │   HUMAN CONCIERGE /    │
                                  │   DIRECTEUR GÉNÉRAL    │
                                  └───────────┬────────────┘
                                              │ (Supervision & Validation)
                                              ▼
                                 ┌──────────────────────────┐
                                 │   MANAGER RADAR (🎯)     │
                                 │   Orchestrateur & KPIs   │
                                 └────────────┬─────────────┘
                                              │
         ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
         ▼                  ▼                 ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌──────────────┐
│ AUDITOR (🔍)     │ │ REPLY RESCUE │ │ QC REVIEWER   │ │ LEGAL SHIELD (⚖️)│ │ BILLING      │
│ Audit financier  │ │ (💬)         │ │ (✅)          │ │ Conformité &    │ │ OFFICER (💰) │
│ & Anti-fraude    │ │ Support &    │ │ Contrôle 30pts│ │ Taxe de séjour  │ │ Payouts &    │
│                  │ │ Pricing      │ │ & Gouvernantes│ │                 │ │ Facturation  │
└──────────────────┘ └──────────────┘ └───────────────┘ └─────────────────┘ └──────────────┘
```

---

## 2. Protocole de Communication : Table `agent_events`

Toutes les interactions, alertes et délégations entre agents sont consignées dans la table Postgres `agent_events` :

```sql
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_agent TEXT NOT NULL,       -- 'manager-radar', 'auditor', 'reply-rescue', 'qc-reviewer', 'legal-shield', 'billing-officer'
    target_agent TEXT,               -- Agent destinataire ou NULL pour diffusion globale
    event_type TEXT NOT NULL,         -- 'NEW_BOOKING', 'DISCREPANCY_ALERT', 'QC_FAILED', 'TAX_REPORT_READY', etc.
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'BLOCKER')),
    property_id UUID REFERENCES properties(id),
    booking_id UUID REFERENCES bookings(id),
    payload JSONB NOT NULL DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ
);
```

---

## 3. Workflow d'une Réservation de Bout en Bout

```
[1. NOUVELLE RÉSERVATION] (Airbnb / Booking / Direct)
   │
   ├─► 🎯 MANAGER RADAR : Enregistre l'événement, synchronise iCal, notifie l'équipe.
   │
   ├─► 💬 REPLY RESCUE : Envoie le message WhatsApp de bienvenue personnalisé, le guide du Riad et les accès.
   │
   ├─► ⚖️ LEGAL SHIELD : Génère la fiche de police numérique, calcule la taxe de séjour (11 MAD/pers/nuit).
   │
   ├─► ✅ QC REVIEWER : Planifie la mission ménage 3h chrono, assigne la gouvernante, exige les photos avant/après.
   │
   ├─► 🔍 AUDITOR : Vérifie l'absence de double-booking, valide la cohérence des tarifs MAD.
   │
   └─► 💰 BILLING OFFICER : Prélève la commission 25%, programme le reversement propriétaire à J+5.
```

---

## 4. Chaîne d'Escalade & Niveaux de Sévérité

1. **Niveau 1 — INFO** : Notification automatique dans le Dashboard (Ex: Check-in validé, paiement reçu).
2. **Niveau 2 — WARNING** : Intervention autonome de l'agent concerné (Ex: Retard ménage 30min ➔ Réattribution par QC Reviewer).
3. **Niveau 3 — CRITICAL** : Alerte prioritaire au Manager Radar (Ex: Note avis client < 3 étoiles, tentative de surbooking).
4. **Niveau 4 — BLOCKER** : Blocage immédiat de la propriété et alerte humaine (Ex: QC < 25/30, fuite d'eau, non-conformité légale).
