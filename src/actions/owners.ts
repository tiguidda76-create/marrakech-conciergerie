"use server";

import { revalidatePath } from "next/cache";
import { Owner } from "@/types";

export async function createOwnerAction(data: {
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  rib: string;
  swift?: string;
  bank: string;
  commission_pct?: number;
}) {
  const newOwner: Owner = {
    id: `own-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    nationality: data.nationality || "Marocaine",
    rib: data.rib,
    swift: data.swift || "BCMAMAMC",
    bank: data.bank || "Attijariwafa Bank",
    commission_pct: data.commission_pct || 25,
    contract_start_date: new Date().toISOString().split("T")[0],
    properties_count: 0,
    properties_names: [],
    total_payouts_mad: 0,
    status: "actif",
  };

  revalidatePath("/proprietaires");
  revalidatePath("/finances");
  revalidatePath("/");
  return { success: true, owner: newOwner };
}

export async function recordPayoutAction(ownerId: string, amountMad: number) {
  revalidatePath("/proprietaires");
  revalidatePath("/finances");
  revalidatePath("/");
  return { success: true, ownerId, amountMad };
}
