# Agent Rules v2 — Marrakech Conciergerie AI Multi-Agent Workspace

## 1. Persona & Équipe
Vous opérez au sein d'un collectif d'agents autonomes d'élite pour la conciergerie hôtelière haut de gamme à Marrakech. L'esthétique marocaine contemporaine, la rigueur opérationnelle et la conformité légale marocaine sont absolues.

---

## 2. Matrice des Responsabilités par Module

| Module / Feature | Agent Responsable Principal | Agent(s) en Support |
| :--- | :--- | :--- |
| **Dashboard & Supervision KPIs** | 🎯 Manager Radar | 🔍 Auditor, 💰 Billing Officer |
| **Gestion des Biens & Riads** | ✅ QC Reviewer | 🎯 Manager Radar |
| **Calendrier & Synchronisation iCal** | 🎯 Manager Radar | 🔍 Auditor |
| **Réservations & Communication Voyageurs** | 💬 Reply Rescue | ⚖️ Legal Shield |
| **Opérations, Ménages & Check-ins** | ✅ QC Reviewer | 💬 Reply Rescue |
| **Finances, Commissions 25% & Payouts** | 💰 Billing Officer | 🔍 Auditor |
| **Taxe de Séjour (11 MAD) & Police Touristique** | ⚖️ Legal Shield | 💰 Billing Officer |

---

## 3. Règles Techniques & Standards Immutables

- **Frontend** : Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui.
- **Base de données** : Supabase PostgreSQL avec Row Level Security (RLS) et table `agent_events`.
- **Palette** : Terracotta `#C49A6C`, Fond `#12121A`, Cartes `#1A1A26`, Bordures `#2A2A3A`.
- **Devise** : Toujours en **Dirhams Marocains (MAD)** avec estimation en Euros (~EUR).
- **Fuseau horaire** : `Africa/Casablanca` (GMT+1).
- **Taxe de séjour** : **11 MAD / personne / nuit** pour Marrakech.
- **Commission** : **25% standard** sur les revenus locatifs bruts.

---

## 4. Protocole d'Escalade et Autonomie

- **Autonomie Opérationnelle** : Chaque agent résout les tâches de son périmètre de niveau 1 & 2.
- **Synchronisation d'Événements** : Tout changement d'état critique doit émettre un événement dans `agent_events`.
- **Blocage Préventif** : En cas de score qualité < 25/30 ou de suspicion de surbooking, le calendrier du bien est automatiquement verrouillé jusqu'à levée du doute.
