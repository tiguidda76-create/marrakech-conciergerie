import { Booking, Owner, Property } from "@/types";
import { formatMAD, formatDate } from "./utils";

export function exportBookingsToCSV(bookings: Booking[]): void {
  const headers = [
    "ID Reservation",
    "Voyageur",
    "Email",
    "Telephone",
    "Propriete",
    "Plateforme",
    "Check-In",
    "Check-Out",
    "Nuits",
    "Personnes",
    "Montant Brut (MAD)",
    "Taxe Sejour (MAD)",
    "Commission Conciergerie (25% MAD)",
    "Statut",
  ];

  const rows = bookings.map((b) => [
    b.id,
    `"${b.guest_name.replace(/"/g, '""')}"`,
    b.guest_email || "",
    b.guest_phone || "",
    `"${(b.property_name || "").replace(/"/g, '""')}"`,
    b.platform.toUpperCase(),
    b.check_in,
    b.check_out,
    b.nights,
    b.guests_count,
    b.total_mad,
    b.tourist_tax_mad,
    Math.round(b.total_mad * 0.25),
    b.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `marrakech-reservations-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFinancialStatementToCSV(bookings: Booking[]): void {
  const headers = [
    "Date",
    "Reference",
    "Propriete",
    "Client",
    "Total Brut MAD",
    "Taxe Sejour 11 MAD",
    "Commission 25% MAD",
    "Reversement Proprietaire 75% MAD",
  ];

  const rows = bookings.map((b) => {
    const comm = Math.round(b.total_mad * 0.25);
    const ownerNet = b.total_mad - comm;
    return [
      b.check_in,
      b.id,
      `"${(b.property_name || "").replace(/"/g, '""')}"`,
      `"${b.guest_name.replace(/"/g, '""')}"`,
      b.total_mad,
      b.tourist_tax_mad,
      comm,
      ownerNet,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `marrakech-grand-livre-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
