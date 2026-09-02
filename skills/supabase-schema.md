---
title: Supabase Schema for Conciergerie
description: Database design and RLS policies
---

## Core Tables

### properties
- id (uuid, PK)
- name (text)
- type (enum: riad, villa, appartement, studio, duplex)
- quartier (enum: medina, gueliz, hivernage, palmeraie, targa, autre)
- address (text)
- bedrooms (int)
- bathrooms (int)
- max_guests (int)
- base_price_mad (int)
- cleaning_fee_mad (int)
- status (enum: actif, inactif, maintenance)
- owner_id (uuid → profiles)
- photos (text[])
- created_at (timestamp)

### bookings
- id (uuid, PK)
- property_id (uuid → properties)
- guest_name (text)
- guest_email (text)
- guest_phone (text)
- check_in (date)
- check_out (date)
- nights (int)
- total_mad (int)
- platform (enum: airbnb, booking, direct, abritel, other)
- commission_pct (int, default 25)
- status (enum: confirmed, cancelled, pending)
- created_at (timestamp)

### tasks
- id (uuid, PK)
- property_id (uuid → properties)
- type (enum: cleaning, checkin, checkout, maintenance, other)
- scheduled_at (timestamp)
- assigned_to (uuid → profiles)
- status (enum: todo, in_progress, done)
- notes (text)

## RLS Policies
- Owners see only their properties
- Admins see all
- Cleaners see only their assigned tasks