# 🤖 Équipe AI — Marrakech Conciergerie Privée

Bienvenue dans la documentation officielle de l'équipe d'agents d'intelligence artificielle autonomes dédiée à l'exploitation de la conciergerie à Marrakech.

---

## 📋 Composition de l'Équipe AI

| Agent | Rôle | Fichier de Spécification | Spécialité |
| :--- | :--- | :--- | :--- |
| **🎯 Manager Radar** | Orchestrateur & Supervision | [agent-manager-radar.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-manager-radar.md) | KPIs, Live monitoring, Daily digest, Dispatching |
| **🔍 Auditor** | Audit & Sécurité Financière | [agent-auditor.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-auditor.md) | Audit 2h00, Détection double-booking, Fraude |
| **💬 Reply Rescue** | Communication & Pricing | [agent-reply-rescue.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-reply-rescue.md) | WhatsApp 24/7, Tarification dynamique FireCrawl |
| **✅ QC Reviewer** | Qualité & Gouvernantes | [agent-qc-reviewer.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-qc-reviewer.md) | Checklist 30 pts, Scoring /30, Blocage préventif |
| **⚖️ Legal Shield** | Conformité & Réglementation | [agent-legal-shield.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-legal-shield.md) | Taxe de séjour 11 MAD, Fiche de police, RC Pro |
| **💰 Billing Officer** | Facturation & Payouts | [agent-billing-officer.md](file:///c:/Users/hp/.gemini/Marrakech%20Concierge/agent-billing-officer.md) | Reversements J+5, Com 25%, Suivi créances |

---

## 🔌 Intégration des 6 Serveurs MCP

1. **Supabase MCP (`@modelcontextprotocol/server-postgres`)** : Lecture/écriture des réservations, biens, tâches et table `agent_events`.
2. **Notion MCP (`@suekou/mcp-notion-server`)** : Fiches d'inventaires des Riads, accords propriétaires et procédures d'accueil.
3. **FireCrawl MCP (`firecrawl-mcp`)** : Scraping des prix concurrents sur Airbnb et Booking.com pour le pricing dynamique.
4. **Context7 MCP (`@upstash/context7-mcp`)** : Base de connaissances vectorielle sur les questions fréquentes voyageurs et règles locales.
5. **GitHub MCP (`@modelcontextprotocol/server-github`)** : Suivi des versions et déploiements du Dashboard Next.js.
6. **Filesystem MCP (`@modelcontextprotocol/server-filesystem`)** : Manipulation sécurisée des fichiers de configuration locaux.

---

## 🚀 Prompt de Lancement Global Multi-Agent

Pour initialiser l'équipe AI dans votre environnement :

```text
Activer le collectif d'agents Marrakech Conciergerie selon les règles de team-orchestrator.md et agent-v2.md.
Connecter les serveurs MCP déclarés dans mcp.json.
Démarrer la supervision en temps réel avec Manager Radar et exécuter l'audit financier quotidien.
```
