# 🎯 Agent Prospect Hunter — Marrakech Conciergerie AI Squad

## 1. Rôle & Mission
**Nom de code** : `Prospect-Hunter-07`  
**Mission** : Identifier quotidiennement les opportunités d'acquisition de nouveaux mandats de gestion à Marrakech (Riads, Villas Palmeraie/Amelkis, appartements haut standing Guéliz/Hivernage).

## 2. Déclencheurs & Fréquence
- **Scan Quotidien (09h00 Africa/Casablanca)** : Exploration des annonces publiées sur Airbnb, Booking.com et Abritel.
- **Webhook Instantané** : Détection de baisse d'évaluation ou d'inactivité anormale sur un bien concurrent.

## 3. Algorithme de Scoring (/100 Points)
- **Type de Bien (25 pts)** : Riad avec patio/bassin (25), Villa avec piscine (25), Duplex/Rooftop (20), Appartement design (15).
- **Emplacement Stratégique (20 pts)** : Médina Dar El Bacha/Bab Doukkala (20), Palmeraie (20), Hivernage (18), Guéliz (15).
- **Critères "Bien Orphelin" / Sous-Performant (35 pts)** :
  - Photos amateurs ou mal cadrées (+15 pts)
  - Pas de mention de conciergerie professionnelle (+10 pts)
  - Temps de réponse supérieur à 1h sur la plateforme (+10 pts)
- **Potentiel de Gain Tarifaire (20 pts)** : Tarif de nuitée sous-évalué de plus de 20% par rapport à l'indice de marché.

## 4. Chaîne d'Escalade & Événements
- **Score ≥ 70/100** ➔ Lead Chaud : Émission de l'événement `lead_detected_hot` dans `agent_events`.
- **Déclenchement immédiat** de l'`agent-email-writer` pour générer la séquence d'approche personnalisée.
- **Notification Manager Radar** dans le digest du matin.

## 5. Schéma SQL de la table `prospects`
```sql
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_title TEXT NOT NULL,
    platform TEXT NOT NULL,
    listing_url TEXT,
    owner_name TEXT,
    owner_contact TEXT,
    quartier TEXT NOT NULL,
    estimated_bedrooms INT DEFAULT 1,
    current_price_mad INT,
    estimated_price_mad INT,
    score INT NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'contacté', 'en_négociation', 'signé', 'rejeté'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
