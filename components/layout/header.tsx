"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { ResolvedSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/models", key: "models" },
  { href: "/inventory", key: "inventory" },
  { href: "/compare", key: "compare" },
  { href: "/services", key: "services" },
  { href: "/parts", key: "parts" },
  { href: "/news", key: "news" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ settings }: { settings: ResolvedSiteSettings }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-brand flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            FBM
          </span>
          <span className="hidden sm:inline">FBM International</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LocaleSwitcher />
          <a
            href={`tel:${settings.phone.replace(/\s+/g, "")}`}
            className="hidden items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground xl:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {settings.phone}
          </a>
          <Button render={<Link href="/test-drive">{t("bookTestDrive")}</Link>} />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LocaleSwitcher compact />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label={t("menu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="end" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-heading">FBM International</SheetTitle>
                  <SheetClose
                    render={
                      <Button variant="ghost" size="icon" aria-label="Close menu">
                        <X className="h-5 w-5" />
                      </Button>
                    }
                  />
                </div>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV_ITEMS.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-2.5 text-base font-medium text-foreground/85 hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href && "bg-accent text-accent-foreground",
                        )}
                      >
                        {t(item.key)}
                      </Link>
                    }
                  />
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="px-3 text-sm text-foreground/70">
                    {settings.phone}
                  </a>
                  <SheetClose
                    render={
                      <Button className="mx-3" render={<Link href="/test-drive">{t("bookTestDrive")}</Link>} />
                    }
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
