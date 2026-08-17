"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LABELS: Record<string, string> = { en: "English", ar: "العربية" };

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size={compact ? "icon" : "sm"} aria-label="Change language">
            <Globe className="h-4 w-4" />
            {!compact && <span className="ms-1.5">{locale.toUpperCase()}</span>}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() =>
              router.replace(
                // @ts-expect-error -- dynamic pathname across locales is intentional here
                { pathname, params },
                { locale: loc },
              )
            }
          >
            {LABELS[loc] ?? loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
