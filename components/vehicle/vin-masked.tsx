import { maskVin } from "@/lib/vin";

export function VinMasked({ vin }: { vin: string | null }) {
  return <span className="font-mono tracking-wide">{maskVin(vin)}</span>;
}
