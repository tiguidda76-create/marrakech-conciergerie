"use server";

import { revalidatePath } from "next/cache";
import { Property, PropertyType, PropertyQuartier, PropertyStatus } from "@/types";

export async function createPropertyAction(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as PropertyType;
  const quartier = formData.get("quartier") as PropertyQuartier;
  const base_price_mad = parseInt(formData.get("base_price_mad") as string) || 2000;
  const cleaning_fee_mad = parseInt(formData.get("cleaning_fee_mad") as string) || 400;
  const bedrooms = parseInt(formData.get("bedrooms") as string) || 1;
  const bathrooms = parseInt(formData.get("bathrooms") as string) || 1;
  const max_guests = parseInt(formData.get("max_guests") as string) || 2;
  const owner_name = (formData.get("owner_name") as string) || "Propriétaire Privé";

  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    name,
    type,
    quartier,
    address: `Marrakech, ${quartier}`,
    bedrooms,
    bathrooms,
    max_guests,
    base_price_mad,
    cleaning_fee_mad,
    status: "actif",
    owner_name,
    photos: [
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80"
    ],
    occupancy_rate: 80,
    monthly_revenue_mad: base_price_mad * 20,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  revalidatePath("/biens");
  revalidatePath("/");
  return { success: true, property: newProperty };
}

export async function updatePropertyStatusAction(propertyId: string, status: PropertyStatus) {
  revalidatePath("/biens");
  revalidatePath("/");
  return { success: true, propertyId, status };
}

export async function deletePropertyAction(propertyId: string) {
  revalidatePath("/biens");
  revalidatePath("/");
  return { success: true, propertyId };
}
