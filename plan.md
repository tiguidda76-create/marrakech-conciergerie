# PLAN — Marrakech Conciergerie Dashboard

## Phase 1: Foundation (Week 1)
- [x] Initialize Next.js 15 + shadcn/ui project
- [x] Configure Tailwind with custom Moroccan color palette (#C49A6C, #12121A)
- [x] Set up Supabase project + schema SQL (skills/supabase-schema.md + RLS)
- [x] Configure Auth (email + Google OAuth UI in `/auth`)
- [x] Create base layout (sidebar + header with Africa/Casablanca time & mobile drawer)
- [x] Build property CRUD pages (photos, badges, occupancy bars, filters, modal)

## Phase 2: Core Features (Week 2)
- [x] Dashboard KPI cards (occupancy %, monthly revenue, avg ratings, property count with sparklines)
- [x] Calendar view (month/week view with booked/available/cleaning color codes & quick booking modal)
- [x] Guest & reservation management module with tourist tax calculations (11 MAD/nuit/pers)
- [x] Task/to-do system for cleaning & check-ins (turnaround 3h, before/after photo check)
- [x] Financial tracking (revenue MAD, 25% commissions, owner payouts, seasonal strategies)

## Phase 3: Integrations (Week 3)
- [x] Airbnb / Booking.com iCal sync architecture & multi-channel badges
- [ ] Automated messaging (WhatsApp Business API integration)
- [ ] Review aggregation from platforms

## Phase 4: Polish & Deploy (Week 4)
- [x] Luxury Moroccan dark mode design system
- [x] Mobile responsiveness (mobile drawer & responsive grid layouts)
- [x] Performance & type validation (zero-error Next.js 15 production build)
- [ ] Vercel deployment + custom domain
- [x] Documentation & handover