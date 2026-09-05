import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAD_TO_EUR_RATE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Moroccan Dirham (MAD) with € equivalent
 */
export function formatMAD(amount: number, showEUR: boolean = true): string {
  const formattedMAD = new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);

  if (!showEUR) return formattedMAD;

  const eurAmount = Math.round(amount * MAD_TO_EUR_RATE);
  const formattedEUR = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eurAmount);

  return `${formattedMAD} (~${formattedEUR})`;
}

/**
 * Format date in Moroccan format (DD/MM/YYYY)
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Casablanca",
  }).format(date);
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(date);
}
