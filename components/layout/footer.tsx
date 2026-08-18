import { useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon } from "@/components/shared/social-icons";
import type { ResolvedSiteSettings } from "@/lib/settings";

const EXPLORE_LINKS = [
  { href: "/models", key: "models" as const },
  { href: "/inventory", key: "inventory" as const },
  { href: "/compare", key: "compare" as const },
  { href: "/services", key: "services" as const },
  { href: "/parts", key: "parts" as const },
];

const COMPANY_LINKS = [
  { href: "/about", key: "about" as const },
  { href: "/news", key: "news" as const },
  { href: "/finance", key: "finance" as const },
  { href: "/contact", key: "contact" as const },
];

export function Footer({ settings }: { settings: ResolvedSiteSettings }) {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container-brand grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              EL
            </span>
            Exceed Limited
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{tFooter("tagline")}</p>
          <div className="mt-5 flex items-center gap-3">
            {settings.socials.facebook && (
              <a href={settings.socials.facebook} aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            {settings.socials.instagram && (
              <a href={settings.socials.instagram} aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {settings.socials.tiktok && (
              <a href={settings.socials.tiktok} aria-label="TikTok" className="text-muted-foreground hover:text-foreground">
                <TikTokIcon className="h-5 w-5" />
              </a>
            )}
            {settings.socials.x && (
              <a href={settings.socials.x} aria-label="X" className="text-muted-foreground hover:text-foreground">
                <XIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{tFooter("explore")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {EXPLORE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {tNav(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{tFooter("company")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {tNav(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{tFooter("address")}</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {settings.address.line}, {settings.address.city}, {settings.address.country}
              </span>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Mon–Fri {settings.hours.monFri}
                <br />
                Sat {settings.hours.saturday} · Sun {settings.hours.sunday}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-brand flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} Exceed Limited. {tFooter("rights")}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              {tFooter("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {tFooter("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
