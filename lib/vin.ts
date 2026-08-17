/** Masks a VIN for public display — shows only the last 6 characters (spec §10). */
export function maskVin(vin: string | null | undefined): string {
  if (!vin) return "—";
  if (vin.length <= 6) return vin;
  return `${"•".repeat(vin.length - 6)}${vin.slice(-6)}`;
}
