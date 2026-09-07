"use client";

import { useLocale } from "next-intl";
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
            // Base UI's Menu.Item has no `onSelect` — it's `onClick` (see
            // node_modules/@base-ui/react/menu/item/MenuItem.d.ts). The old
            // `onSelect` handler here was a silent no-op: it's a real DOM
            // attribute name (the text-selection event), so React never
            // stripped it or warned, it just never fired on a click.
            onClick={() => router.replace(pathname, { locale: loc })}
          >
            {LABELS[loc] ?? loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
