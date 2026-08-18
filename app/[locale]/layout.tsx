import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { routing, localeDirections, type AppLocale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/settings";
import "../globals.css";

const interTight = Inter_Tight({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans-family",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Exceed Limited | Soueast & 212 Vehicles — South Sudan & Sudan",
      template: "%s | Exceed Limited",
    },
    description:
      "Exceed Limited, in partnership with FBM International Co., is the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan — new vehicle sales, genuine parts, and factory-backed service in Juba.",
    icons: { icon: "/favicon.ico" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = localeDirections[locale as AppLocale];
  const settings = await getSiteSettings();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`dark ${interTight.variable} ${inter.variable} h-full antialiased`}
      style={
        {
          "--font-heading": "var(--font-heading-family)",
          "--font-sans": "var(--font-sans-family)",
        } as React.CSSProperties
      }
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <TooltipProvider delay={150}>
            {settings.maintenanceMode ? (
              <MaintenanceScreen />
            ) : (
              <>
                <Header settings={settings} />
                <main className="flex-1">{children}</main>
                <Footer settings={settings} />
                <WhatsAppButton
                  phone={settings.whatsappNumber}
                  message="Hello Exceed Limited, I'd like some information."
                />
              </>
            )}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function MaintenanceScreen() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold">We&apos;ll be right back</h1>
        <p className="text-muted-foreground">
          Exceed Limited&apos;s website is undergoing scheduled
          maintenance. Please check back shortly, or reach us directly on
          WhatsApp.
        </p>
      </div>
    </main>
  );
}
