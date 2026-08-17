"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["AVAILABLE", "RESERVED", "IN_TRANSIT", "SOLD"] as const;

export function InventoryStatusFilter() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="mb-8">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => {
          const params = new URLSearchParams(searchParams.toString());
          if (v === "all") params.delete("status");
          else params.set("status", v);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{t(`status.${s}` as "status.AVAILABLE")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
