export const MAD_TO_EUR_RATE = 0.093;
export const DEFAULT_COMMISSION_PCT = 25;
export const TOURIST_TAX_PER_PERSON_PER_NIGHT_MAD = 11;

export const LEGAL_ENTITY = {
  name: "HASSAN TIGUIDDA",
  status: "Auto-Entrepreneur",
  ice: "1161674000043",
  address: "Les portes de Marrakech Zone 16 imm 118 app 03 Marrakech, Maroc",
  phone: "+212 6 32 15 54 30",
  email: "tiguidda76@gmail.com",
  rib: "007450001399370030009822",
  swift: "BCMAMAMC",
  bank: "Attijariwafa Bank (Maroc)",
  tvaExemptionMention: "Montant en dirhams exonéré de la TVA (Art 91 - II - 1° du Code Général des Impôts)",
};

export const PROPERTY_TYPES = [
  { value: 'riad', label: 'Riad Traditionnel' },
  { value: 'villa', label: 'Villa de Luxe' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'studio', label: 'Studio Bohème' },
  { value: 'duplex', label: 'Duplex Rooftop' },
] as const;

export const PROPERTY_QUARTIERS = [
  { value: 'medina', label: 'Médina' },
  { value: 'gueliz', label: 'Guéliz' },
  { value: 'hivernage', label: 'Hivernage' },
  { value: 'palmeraie', label: 'Palmeraie' },
  { value: 'targa', label: 'Targa' },
  { value: 'autre', label: 'Autre / Amelkis' },
] as const;

export const PROPERTY_STATUSES = [
  { value: 'actif', label: 'Actif', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'inactif', label: 'Inactif', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
] as const;

export const PLATFORMS = [
  { value: 'airbnb', label: 'Airbnb', color: '#FF385C' },
  { value: 'booking', label: 'Booking.com', color: '#003580' },
  { value: 'direct', label: 'Direct Concierge', color: '#C49A6C' },
  { value: 'abritel', label: 'Abritel / VRBO', color: '#1B5E20' },
  { value: 'other', label: 'Autre Canal', color: '#6B7280' },
] as const;

export const SEASONAL_STRATEGIES = {
  high: { label: 'Haute Saison (Oct - Avr)', multiplier: 1.40, desc: '+40% base rate' },
  medium: { label: 'Moyenne Saison (Mai - Juin, Sep)', multiplier: 1.00, desc: 'Tarif standard' },
  low: { label: 'Basse Saison (Juil - Août, Ramadan)', multiplier: 0.80, desc: '-20% base rate' },
  events: { label: 'Événements (Festival Film / Nouvel An)', multiplier: 2.00, desc: '+100% (x2)' },
};

export const TIMEZONE = 'Africa/Casablanca';
